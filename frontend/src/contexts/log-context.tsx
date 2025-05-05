import { createContext, useContext } from 'react';
import type { ExpandedLogType } from '../routes/expand-log';

const LogContext = createContext<ExpandedLogType | null>(null);

export const useLog = () => {
	const context = useContext(LogContext);
	if (!context) {
		throw new Error('useLog must be used within a LogProvider');
	}
	return context;
};

export const LogProvider = ({
	children,
	log,
}: {
	children: React.ReactNode;
	log: ExpandedLogType;
}) => (
	<LogContext.Provider value={log}>{children}</LogContext.Provider>
);
