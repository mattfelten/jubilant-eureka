import { format } from 'date-fns';

/**
 * Formats a BigInt timestamp into a readable date string using date-fns
 */
export const formatTimestamp = (timestamp: bigint): string => {
	// Convert BigInt to number and create Date object (assuming timestamp is in milliseconds)
	const date = new Date(Number(timestamp));
	return date.toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	});
};
