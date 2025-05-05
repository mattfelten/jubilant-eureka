import type { levelValues } from '~/components/blocks/level-filter';
import type { ExpandedLogType } from './expand-log';

type filters = {
	selectedLevel: levelValues;
};

export const filterLogs = (
	logs: ExpandedLogType[],
	{ selectedLevel }: filters
) => {
	return logs.filter(function ({ level }) {
		if (selectedLevel !== 'all' && typeof level === 'undefined')
			return false;
		if (selectedLevel !== 'all' && selectedLevel !== level)
			return false;

		return true;
	});
};
