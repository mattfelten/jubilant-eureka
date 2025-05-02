package log

import (
	"context"
	"embed"
	"encoding/json"
	"errors"
	"math/rand"
	"time"

	"connectrpc.com/connect"

	v1 "github.com/redpanda-data/takehome-ux-team/backend/protogen/redpanda/takehome/api/v1"
	"github.com/redpanda-data/takehome-ux-team/backend/protogen/redpanda/takehome/api/v1/apiv1connect"
)

type logRecord struct {
	PartitionID int32  `json:"partition_id"`
	Offset      int64  `json:"offset"`
	Timestamp   int64  `json:"timestamp"`
	Log         string `json:"log"`
}

var (
	//go:embed logs/*.json
	logsFS embed.FS

	// logsMap holds preloaded log records for each service
	logsMap map[v1.MicroService][]logRecord
)

func init() {
	logsMap = make(map[v1.MicroService][]logRecord)
	for _, svc := range []v1.MicroService{
		v1.MicroService_MICRO_SERVICE_GATEWAY,
		v1.MicroService_MICRO_SERVICE_AI_AGENT,
		v1.MicroService_MICRO_SERVICE_BORKED,
	} {
		var filename string
		switch svc {
		case v1.MicroService_MICRO_SERVICE_GATEWAY:
			filename = "logs/gateway.json"
		case v1.MicroService_MICRO_SERVICE_AI_AGENT:
			filename = "logs/agent.json"
		case v1.MicroService_MICRO_SERVICE_BORKED:
			filename = "logs/borked.json"
		}
		data, err := logsFS.ReadFile(filename)
		if err != nil {
			panic(err)
		}
		var recs []logRecord
		if err := json.Unmarshal(data, &recs); err != nil {
			panic(err)
		}
		logsMap[svc] = recs
	}
}

// Service implements the ConnectRPC LogServiceHandler.
type Service struct{}

var _ apiv1connect.LogServiceHandler = (*Service)(nil)

// ListLogs streams log messages based on partition, offset, timestamp, and other filters.
func (s *Service) ListLogs(
	ctx context.Context,
	req *connect.Request[v1.ListLogsRequest],
	stream *connect.ServerStream[v1.ListLogsResponse],
) error {
	start := time.Now()
	msg := req.Msg
	recs := logsMap[msg.Service]

	_, bytesConsumed := streamHistory(ctx, msg, recs, stream)
	if msg.GetFollow() {
		streamFollow(ctx, msg, recs, stream)
	}

	// final summary
	return sendSummary(stream, start, ctx.Err(), bytesConsumed)
}

// streamHistory sends up to MaxResults from the first matching record.
func streamHistory(
	_ context.Context,
	msg *v1.ListLogsRequest,
	recs []logRecord,
	stream *connect.ServerStream[v1.ListLogsResponse],
) (int, int64) {
	var count int
	var bytes int64

	// find starting index
	startIdx := len(recs)
	for i, r := range recs {
		if (msg.GetPartitionId() != -1 && r.PartitionID != msg.GetPartitionId()) ||
			r.Offset < msg.GetOffset() ||
			r.Timestamp < msg.GetStartTimestamp() {
			continue
		}
		startIdx = i
		break
	}

	// send up to MaxResults
	for i := startIdx; i < len(recs) && (msg.MaxResults == 0 || count < int(msg.MaxResults)); i++ {
		if !matchesPartition(msg, recs[i]) {
			continue
		}
		if err := sendRecord(msg, recs[i], stream); err != nil {
			break
		}
		count++
		bytes += int64(len(recs[i].Log))
	}
	return count, bytes
}

// streamFollow replays the slice indefinitely with bumped offsets and random throttle.
func streamFollow(
	ctx context.Context,
	msg *v1.ListLogsRequest,
	recs []logRecord,
	stream *connect.ServerStream[v1.ListLogsResponse],
) {
	// track the last offset seen per partition
	last := make(map[int32]int64)
	for _, r := range recs {
		if matchesPartition(msg, r) && r.Offset > last[r.PartitionID] {
			last[r.PartitionID] = r.Offset
		}
	}

	const (
		minDelay = 50 * time.Millisecond
		maxDelay = 2500 * time.Millisecond
	)
	delayRange := int64(maxDelay-minDelay) + 1

	for {
		select {
		case <-ctx.Done():
			return
		default:
			for _, r := range recs {
				if !matchesPartition(msg, r) {
					continue
				}
				// bump offset & wrap into a new entry
				last[r.PartitionID]++
				newRec := logRecord{
					PartitionID: r.PartitionID,
					Offset:      last[r.PartitionID],
					Timestamp:   time.Now().UnixMilli(),
					Log:         r.Log,
				}
				if err := sendRecord(msg, newRec, stream); err != nil {
					return
				}
				// random sleep in [minDelay, maxDelay]
				sleep := minDelay + time.Duration(rand.Int63n(delayRange))
				time.Sleep(sleep)
			}
		}
	}
}

// sendRecord applies size limits and pushes one Data message.
func sendRecord(
	msg *v1.ListLogsRequest,
	r logRecord,
	stream *connect.ServerStream[v1.ListLogsResponse],
) error {
	entry := &v1.ListLogsResponse_Log{
		PartitionId: r.PartitionID,
		Offset:      r.Offset,
		Timestamp:   r.Timestamp,
		Log:         r.Log,
	}
	if msg.MaxMessageSize > 0 && len(r.Log) > int(msg.MaxMessageSize) {
		entry.Log = ""
		entry.TooLarge = true
	}
	return stream.Send(&v1.ListLogsResponse{
		ControlMessage: &v1.ListLogsResponse_Data{Data: entry},
	})
}

// matchesPartition returns true if this record should be included.
func matchesPartition(msg *v1.ListLogsRequest, r logRecord) bool {
	return msg.GetPartitionId() == -1 || r.PartitionID == msg.GetPartitionId()
}

// sendSummary emits the final CompletionSummary.
func sendSummary(
	stream *connect.ServerStream[v1.ListLogsResponse],
	start time.Time,
	errCtx error,
	bytes int64,
) error {
	summary := &v1.ListLogsResponse{
		ControlMessage: &v1.ListLogsResponse_Phase{Phase: &v1.ListLogsResponse_CompletionSummary{
			ElapsedMs:     time.Since(start).Milliseconds(),
			IsCancelled:   errors.Is(errCtx, context.Canceled),
			BytesConsumed: bytes,
		}},
	}
	return stream.Send(summary)
}
