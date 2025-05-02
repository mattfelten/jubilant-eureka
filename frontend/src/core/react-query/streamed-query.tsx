import type {
	DescMessage,
	DescMethodServerStreaming,
	DescMethodUnary,
	MessageInitShape,
	MessageShape,
} from "@bufbuild/protobuf";
import type { Transport } from "@connectrpc/connect";
import {
	type ConnectQueryKey,
	createConnectQueryKey,
} from "@connectrpc/connect-query";
import { createAsyncIterable } from "@connectrpc/connect/protocol";
import {
	type QueryFunction,
	experimental_streamedQuery,
} from "@tanstack/react-query";

function createServerStreamingQueryFn<
	I extends DescMessage,
	O extends DescMessage,
>(
	transport: Transport,
	schema: DescMethodServerStreaming<I, O>,
	input: MessageInitShape<I> | undefined,
	refetchMode: "append" | "reset" = "reset",
): QueryFunction<MessageShape<O>[], ConnectQueryKey> {
	return experimental_streamedQuery({
		queryFn: async (context) => {
			const result = await transport.stream(
				schema,
				context.signal,
				undefined,
				undefined,
				createAsyncIterable(input ? [input] : []),
				undefined,
			);

			return result.message;
		},
		refetchMode,
	});
}

export function createServerStreamingQueryOptions<
	I extends DescMessage,
	O extends DescMessage,
>(
	schema: DescMethodServerStreaming<I, O>,
	input: MessageInitShape<I> | undefined,
	transport: Transport,
) {
	const method: DescMethodUnary = {
		...schema,
		methodKind: "unary",
	};

	return {
		queryKey: createConnectQueryKey({
			schema: method,
			input,
			cardinality: "finite",
		}),
		queryFn: createServerStreamingQueryFn(transport, schema, input),
	};
}
