import { beforeEach, afterEach, expect } from 'bun:test';
import { cleanup, render, type RenderOptions } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { createConnectTransport } from '@connectrpc/connect-web';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { JSX, PropsWithChildren } from 'react';
import { TransportProvider } from '@connectrpc/connect-query';
import type { Transport } from '@connectrpc/connect';

expect.extend(matchers);

// Optional: cleans up `render` after each test
afterEach(() => {
  cleanup();
});

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  transport?: Transport;
}

const customRender = (ui: React.ReactElement, { ...renderOptions }: ExtendedRenderOptions = {}) => {
    function Wrapper({ children }: PropsWithChildren): JSX.Element {
      const finalTransport =
        renderOptions.transport ??
        createConnectTransport({
          baseUrl: process.env.REACT_APP_API_URL ?? 'http://localhost:8080',
        });
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
  
      return (
        <TransportProvider transport={finalTransport}>
          <QueryClientProvider client={queryClient}>
          {children}
          </QueryClientProvider>
        </TransportProvider>
      );
    }
  
    return render(ui, { wrapper: Wrapper, ...renderOptions });
  };

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
