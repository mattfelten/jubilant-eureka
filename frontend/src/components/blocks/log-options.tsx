import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { MoreVertical, Copy } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { TableCell } from '../ui/table';
import { toast } from 'sonner';
import { useLog } from '~/contexts/log-context';

export const LogOptions = () => {
	const log = useLog();

	const handleCopy = async () => {
		await navigator.clipboard.writeText(
			JSON.stringify(log, (key, value) =>
				typeof value === 'bigint' ? Number(value) : value
			)
		);
		toast('Log copied to clipboard');
	};

	return (
		<TableCell className="relative w-0">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={handleCopy}
						className="gap-2"
					>
						<Copy className="h-4 w-4" />
						Copy log
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</TableCell>
	);
};
