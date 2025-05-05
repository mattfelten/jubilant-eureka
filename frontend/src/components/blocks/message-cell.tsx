import type { PropsWithChildren } from 'react';
import { TableCell } from '~/components/ui/table';
import { useLog } from '~/contexts/log-context';

const Message = (props: PropsWithChildren) => (
	<div className="min-w-0 truncate break-all" {...props} />
);

export const MessageCell = () => {
	const { message, level, icon: Icon, style } = useLog();

	return (
		<TableCell className="font-mono">
			{level ? (
				<span className={`flex items-center gap-2 ${style}`}>
					{Icon && (
						<Icon className="h-3.5 w-3.5 opacity-80" />
					)}
					<Message>{message}</Message>
				</span>
			) : (
				<Message>{message}</Message>
			)}
		</TableCell>
	);
};
