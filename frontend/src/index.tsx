import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './app';
import { ConnectProvider } from './core/grpc/connect-provider';
import { Toaster } from '~/components/ui/sonner';

import './styles.css';

const rootEl = document.getElementById('root');
if (rootEl) {
	const root = ReactDOM.createRoot(rootEl);
	root.render(
		<React.StrictMode>
			<BrowserRouter>
				<ConnectProvider>
					<Toaster />
					<App />
				</ConnectProvider>
			</BrowserRouter>
		</React.StrictMode>
	);
}
