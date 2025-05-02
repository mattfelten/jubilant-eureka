import { Code } from "@connectrpc/connect";
import { ConnectError } from "@connectrpc/connect";
import { QueryClient } from "@tanstack/react-query";

function isConnectError(error: Error | ConnectError): error is ConnectError {
	return error instanceof ConnectError;
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount, error) => {
				if (failureCount > 3) return false;

				if (isConnectError(error)) {
					return error.code === Code.Internal || error.code === Code.Unknown;
				}

				return false;
			},
		},
	},
});
