import { CircleAlert, TriangleAlert, Info, Bug } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TableCell } from '~/components/ui/table';

const levelConfig: Record<any, { style: string; icon: LucideIcon }> =
	{
		error: { style: 'text-red-700', icon: CircleAlert },
		warn: { style: 'text-yellow-700', icon: TriangleAlert },
		info: { style: 'text-blue-700', icon: Info },
		debug: { style: 'text-gray-500', icon: Bug },
	};

type LogLevel = keyof typeof levelConfig;

type logOutput = { message: string; level?: LogLevel };

const getLogMessage = (logContent: any): logOutput => {
	const output: logOutput = { message: String(logContent) };

	if (typeof logContent !== 'string') return output;

	try {
		const parsed = JSON.parse(logContent);
		if (parsed.message) console.log('parsed log', parsed);
		output.message = parsed.message;

		if (parsed.level)
			output.level = parsed.level.toLowerCase() as LogLevel;
	} catch {
		output.message = logContent;
	}

	for (var levelKey in levelConfig) {
		// Todo: this is kinda crazy...
		if (logContent.startsWith(`${levelKey.toUpperCase()} `)) {
			output.level = levelKey;
		}
	}

	return output;
};

export const MessageCell = ({ log }: { log: string }) => {
	const parsedLog = getLogMessage(log);

	const { message, level } = parsedLog;

	const Icon = level ? levelConfig[level]?.icon : null;

	return (
		<TableCell className="font-mono break-all truncate">
			{level ? (
				<span
					className={`flex items-center gap-2 ${
						levelConfig[level]?.style || ''
					}`}
				>
					{Icon && (
						<Icon className="h-3.5 w-3.5 opacity-80" />
					)}
					{message}
				</span>
			) : (
				message
			)}
		</TableCell>
	);
};
