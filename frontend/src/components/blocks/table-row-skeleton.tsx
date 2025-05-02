import { TableCell, TableRow } from "~/components/ui/table";

/**
 * Skeleton loader component for table rows
 */
export const TableRowSkeleton = () => {
	const skeletonRows = [
		"skeleton-partition-row",
		"skeleton-offset-row",
		"skeleton-timestamp-row",
		"skeleton-log-row",
		"skeleton-status-row",
	];

	return (
		<>
			{skeletonRows.map((id) => (
				<TableRow key={id}>
					<TableCell>
						<div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
					</TableCell>
					<TableCell>
						<div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
					</TableCell>
					<TableCell>
						<div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
					</TableCell>
					<TableCell>
						<div className="h-4 w-full max-w-md animate-pulse rounded bg-gray-200" />
					</TableCell>
					<TableCell>
						<div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
					</TableCell>
				</TableRow>
			))}
		</>
	);
};
