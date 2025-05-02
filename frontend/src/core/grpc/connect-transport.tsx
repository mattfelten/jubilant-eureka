import { createConnectTransport } from "@connectrpc/connect-web";
import { protobufRegistry } from "./protobuf-registry";

export const transport = createConnectTransport({
	baseUrl: process.env.REACT_APP_API_URL ?? "http://localhost:8080",
	interceptors: [
		(next) => async (request) => {
			// Optional middleware for logging, authentication, etc.
			return await next(request);
		},
	],
	jsonOptions: {
		registry: protobufRegistry,
	},
});
