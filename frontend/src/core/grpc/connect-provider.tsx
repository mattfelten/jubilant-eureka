import { TransportProvider } from "@connectrpc/connect-query";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { transport } from "./connect-transport";
import { queryClient } from "./query-client";

interface ConnectProviderProps {
	children: ReactNode;
}

export const ConnectProvider = ({ children }: ConnectProviderProps) => {
	return (
		<TransportProvider transport={transport}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</TransportProvider>
	);
};
