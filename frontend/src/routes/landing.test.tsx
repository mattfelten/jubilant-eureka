import { beforeEach, expect, mock, test } from "bun:test";
import { create } from "@bufbuild/protobuf";
import { type MethodImpl, createRouterTransport } from "@connectrpc/connect";
import {
	act,
	fireEvent,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { render } from "testing-library";
import * as logModule from "~/core/react-query/log";
import {
	ListLogsResponseSchema,
	ListLogsResponse_LogSchema,
	LogService,
} from "~/protogen/redpanda/takehome/api/v1/list_logs_pb";
import { Landing } from "./landing";

beforeEach(() => {
	// Set up default mock to avoid connection errors - return immediately to avoid calling outside world
	logModule.logServiceClient.listLogs = async function* () {
		yield create(ListLogsResponseSchema, {
			controlMessage: {
				case: "phase",
				value: { isCancelled: false },
			},
		});
	};
});

test("should toggle streaming on/off", () => {
	render(<Landing />);
	const toggleStreamButton = screen.getByTestId("toggle-stream-button");
	expect(toggleStreamButton).toBeVisible();
	expect(toggleStreamButton).toHaveTextContent("Start streaming");

	fireEvent.click(toggleStreamButton);

	expect(toggleStreamButton).toHaveTextContent("Stop streaming");

	fireEvent.click(toggleStreamButton);

	expect(toggleStreamButton).toHaveTextContent("Start streaming");
});

// Client test (used by default)
test("should trigger gRPC connect request to list logs via gRPC connect client", async () => {
	const mockLogData = create(ListLogsResponse_LogSchema, {
		log: "I'm just a fake log :(",
	});

	const mockResponse = create(ListLogsResponseSchema, {
		controlMessage: {
			case: "data",
			value: mockLogData,
		},
	});

	const listLogsMock = mock<
		typeof logModule.logServiceClient.listLogs
	>().mockImplementation(async function* () {
		yield mockResponse;
	});

	logModule.logServiceClient.listLogs = listLogsMock;

	render(<Landing />);

	fireEvent.click(screen.getByTestId("toggle-stream-button"));

	await waitFor(() => {
		expect(listLogsMock).toHaveBeenCalledTimes(1);
		expect(
			within(screen.getByTestId("log-list")).queryByText(mockLogData.log),
		).toBeVisible();
	});
});

// Connect-query test, only to be used when connect query is used (i.e. useQuery/useMutation hook)
// Intentionally skipped for now
test.skip("should trigger gRPC connect request to list logs via transport", async () => {
	const mockResponse = create(ListLogsResponse_LogSchema, {
		log: "I'm just a fake log :(",
	});

	const listLogsMock = mock<MethodImpl<typeof LogService.method.listLogs>>(
		async function* () {
			yield {
				controlMessage: {
					case: "data",
					value: mockResponse,
				},
			};
		},
	);

	const transport = createRouterTransport(({ service }) => {
		service(LogService, {
			listLogs: listLogsMock,
		});
	});
	render(<Landing />, { transport });

	fireEvent.click(screen.getByTestId("toggle-stream-button"));

	await waitFor(() => {
		expect(listLogsMock).toHaveBeenCalledTimes(1);
		expect(
			within(screen.getByTestId("log-list")).queryByText(mockResponse.log),
		).toBeVisible();
	});
});
