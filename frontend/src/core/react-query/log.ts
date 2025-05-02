import { createClient } from "@connectrpc/connect";
import { useTransport } from "@connectrpc/connect-query";
import { useQuery } from "@tanstack/react-query";
import {
	type ListLogsRequest,
	LogService,
	MicroService,
} from "~/protogen/redpanda/takehome/api/v1/list_logs_pb";
import { transport } from "../grpc/connect-transport";
import { createServerStreamingQueryOptions } from "./streamed-query";

/**
 * Connect client for the LogService.
 */
export const logServiceClient = createClient(LogService, transport);

/**
 * Connect query hook with experimental streaming query support. Currently unused.
 * @see https://tanstack.com/query/latest/docs/reference/streamedQuery
 */
export const useListLogsQuery = (listLogsRequest: ListLogsRequest) => {
	const transport = useTransport();
	const listLogsQueryResult = useQuery(
		createServerStreamingQueryOptions(
			LogService.method.listLogs,
			listLogsRequest,
			transport,
		),
	);

	return listLogsQueryResult;
};

export const logServiceOptions = [
	{ value: MicroService.GATEWAY, label: "Gateway" },
	{ value: MicroService.AI_AGENT, label: "AI Agent" },
	{ value: MicroService.BORKED, label: "Borked" },
];
