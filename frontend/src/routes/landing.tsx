import { create } from '@bufbuild/protobuf';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NoLogsIcon } from '~/components/blocks/no-logs-icon';
import { TableRowSkeleton } from '~/components/blocks/table-row-skeleton';
import { ToggleStreamButton } from '~/components/blocks/toggle-stream-button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table';
import {
	logServiceClient,
	logServiceOptions,
} from '~/core/react-query/log';
import {
	ListLogsRequestSchema,
	type ListLogsResponse_Log,
	MicroService,
} from '~/protogen/redpanda/takehome/api/v1/list_logs_pb';
import { LevelFilter } from '~/components/blocks/level-filter';
import type { levelValues } from '~/components/blocks/level-filter';
import { LogProvider } from '~/contexts/log-context';
import { expandLog } from './expand-log';
import type { ExpandedLogType } from './expand-log';
import { filterLogs } from './filter-logs';
import { MessageCell } from '~/components/blocks/message-cell';
import { formatTimestamp } from '~/lib/timestamp';
import { Badge } from '~/components/ui/badge';
import { LogOptions } from '~/components/blocks/log-options';

export const Landing = () => {
	const [logs, setLogs] = useState<ExpandedLogType[]>([]);
	const [isStreaming, setIsStreaming] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedService, setSelectedService] =
		useState<MicroService>(MicroService.GATEWAY);

	// Add new state for level filter
	const [selectedLevel, setSelectedLevel] =
		useState<levelValues>('all');

	// Add filter handler
	const handleLevelChange = (value: string) => {
		setSelectedLevel(value as levelValues);
	};
	const streamAbortControllerRef = useRef<AbortController | null>(
		null
	);
	const startStreaming = useCallback(() => {
		if (streamAbortControllerRef.current !== null) return;

		setLogs([]);
		setIsLoading(true);

		const abortController = new AbortController();
		streamAbortControllerRef.current = abortController;

		const listLogsRequest = create(ListLogsRequestSchema, {
			maxMessageSize: 1000,
			maxResults: 100,
			offset: BigInt(0),
			partitionId: -1,
			startTimestamp: BigInt(0),
			service: selectedService,
		});

		const startStream = async () => {
			try {
				for await (const log of logServiceClient.listLogs(
					listLogsRequest,
					{
						signal: abortController.signal,
					}
				)) {
					if (abortController.signal.aborted) {
						break;
					}

					try {
						switch (log.controlMessage.case) {
							case 'data': {
								setLogs((currentLogs) => [
									...currentLogs,
									expandLog(
										log.controlMessage
											.value as ListLogsResponse_Log
									),
								]);
								if (isLoading) {
									setIsLoading(false);
								}
								break;
							}
							case 'phase': {
								if (
									log.controlMessage.value
										.isCancelled
								) {
									console.log(
										'Stream cancelled by server'
									);
									stopStreaming();
								}
								break;
							}
							case 'error': {
								console.error(
									`Stream error: ${log.controlMessage.value}`
								);
								stopStreaming();
								break;
							}
						}
					} catch (error) {
						console.error(
							'Error processing stream message',
							error
						);
					}
				}
			} catch (error) {
				if (!abortController.signal.aborted) {
					console.error('Stream connection error', error);
					stopStreaming();
				}
			} finally {
				if (!abortController.signal.aborted) {
					setIsLoading(false);
				}
			}
		};

		startStream();
		setIsStreaming(true);
	}, [selectedService, isLoading]);

	const stopStreaming = useCallback(() => {
		if (streamAbortControllerRef.current) {
			streamAbortControllerRef.current.abort();
			streamAbortControllerRef.current = null;
		}

		setIsStreaming(false);
		setIsLoading(false);
	}, []);

	const toggleStreaming = useCallback(() => {
		if (isStreaming) {
			stopStreaming();
		} else {
			startStreaming();
		}
	}, [isStreaming, stopStreaming, startStreaming]);

	const handleServiceChange = useCallback(
		(value: string) => {
			switch (Number(value)) {
				case MicroService.GATEWAY:
					setSelectedService(MicroService.GATEWAY);
					break;
				case MicroService.AI_AGENT:
					setSelectedService(MicroService.AI_AGENT);
					break;
				case MicroService.BORKED:
					setSelectedService(MicroService.BORKED);
					break;
				default:
					setSelectedService(MicroService.GATEWAY);
					break;
			}

			setLogs([]);

			if (isStreaming) {
				stopStreaming();
			}
		},
		[isStreaming, stopStreaming]
	);

	useEffect(() => {
		return () => {
			stopStreaming();
		};
	}, [stopStreaming]);

	const filteredLogs = filterLogs(logs, { selectedLevel });

	const logCount = filteredLogs.length;

	return (
		<div className="container mx-auto py-10 px-4">
			<div className="flex flex-col space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold text-gray-900">
						Log Viewer
					</h1>
					<div className="flex items-center gap-4">
						<LevelFilter
							handleLevelChange={handleLevelChange}
							selectedLevel={selectedLevel}
						/>
						<Select
							onValueChange={handleServiceChange}
							defaultValue={logServiceOptions
								.find(
									(option) =>
										option.value ===
										selectedService
								)
								?.value.toString()}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Microservice" />
							</SelectTrigger>
							<SelectContent>
								{logServiceOptions.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value.toString()}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<div className="flex items-center">
							<div
								className={`h-2 w-2 rounded-full mr-2 ${
									isStreaming
										? 'bg-green-500 animate-pulse'
										: 'bg-gray-300'
								}`}
							/>
							<span className="text-sm text-gray-600">
								{isStreaming
									? 'Streaming active'
									: 'Streaming paused'}
							</span>
						</div>
						<ToggleStreamButton
							isStreaming={isStreaming}
							onClick={toggleStreaming}
						>
							{isStreaming
								? 'Stop streaming'
								: 'Start streaming'}
						</ToggleStreamButton>
					</div>
				</div>

				<div
					className="rounded-md border shadow-sm bg-white"
					data-testid="log-list"
				>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[180px]">
									Timestamp
								</TableHead>
								<TableHead>Log</TableHead>
								<TableHead className="w-[100px]">
									Status
								</TableHead>
								<TableHead className="w-[48px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading && logs.length === 0 ? (
								<TableRowSkeleton />
							) : logs.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center py-10 text-gray-500"
									>
										<div className="flex flex-col items-center justify-center gap-2">
											<NoLogsIcon />
											<p>No logs available</p>
											<p className="text-sm">
												{isStreaming
													? 'Waiting for logs...'
													: 'Start streaming to fetch logs.'}
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								filteredLogs.map((log) => (
									<LogProvider
										key={`${
											log.partitionId
										}-${log.offset.toString()}-${
											log.timestamp
										}`}
										log={log}
									>
										<TableRow>
											<TableCell>
												{formatTimestamp(
													log.timestamp
												)}
											</TableCell>
											<MessageCell />
											<TableCell>
												{log.tooLarge ? (
													<Badge variant="warning">
														Too Large
													</Badge>
												) : (
													<Badge variant="positive">
														Complete
													</Badge>
												)}
											</TableCell>
											<LogOptions />
										</TableRow>
									</LogProvider>
								))
							)}
						</TableBody>
					</Table>
				</div>

				<div className="flex items-center justify-between text-sm text-gray-500">
					<span>Logs are streamed in real-time</span>
					<span>
						{logCount > 0 &&
							`Showing ${logCount} log entries`}
					</span>
				</div>
			</div>
		</div>
	);
};
