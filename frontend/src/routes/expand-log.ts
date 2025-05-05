import { CircleAlert, TriangleAlert, Info, Bug } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ListLogsResponse_Log } from '~/protogen/redpanda/takehome/api/v1/list_logs_pb';

export type ExpandedLogType = ListLogsResponse_Log & {
	message?: string;
	level?: string;
	icon?: LucideIcon;
	style?: string;
};

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export const levelConfig: Record<
	LogLevel,
	{ style: string; icon: LucideIcon }
> = {
	error: { style: 'text-red-700', icon: CircleAlert },
	warn: { style: 'text-yellow-700', icon: TriangleAlert },
	info: { style: 'text-blue-700', icon: Info },
	debug: { style: 'text-gray-500', icon: Bug },
};

export const expandLog = (
	log: ListLogsResponse_Log
): ExpandedLogType => {
	if (typeof log.log !== 'string') return log;
	let message = log.log;
	let level;
	let styles = {};
	let parsedLog;

	try {
		parsedLog = JSON.parse(
			message.replace(/\\"/g, '"') // This isn't working yet. Need to debug the one log that's still showing
		);
	} catch {}

	if (parsedLog && parsedLog.message) message = parsedLog.message;

	if (parsedLog && parsedLog.level) {
		level = parsedLog.level.toLowerCase() as LogLevel;
	}

	for (var levelKey in levelConfig) {
		// Todo: I would like this to be more robust but I'm starting with just getting it working.
		if (message.startsWith(`${levelKey.toUpperCase()} `)) {
			level = levelKey as LogLevel;
			message = message.substring(levelKey.length).trimStart();
		}
	}

	if (level) styles = levelConfig[level];

	return { ...log, message, level, ...styles };
};
