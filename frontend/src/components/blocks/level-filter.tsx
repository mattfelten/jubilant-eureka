import { levelConfig } from '~/routes/expand-log';
import type { LogLevel } from '~/routes/expand-log';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select';

export type levelValues = LogLevel | 'all';

interface LevelFilterProps {
	defaultValue?: levelValues;
	selectedLevel?: levelValues;
	handleLevelChange: (value: levelValues) => void;
}

export const LevelFilter = ({
	defaultValue = 'all',
	handleLevelChange,
	selectedLevel = 'all',
}: LevelFilterProps) => {
	const selectedLevelConfig =
		selectedLevel in levelConfig && selectedLevel != 'all'
			? levelConfig[selectedLevel]
			: { style: '', icon: null };
	return (
		<Select
			onValueChange={handleLevelChange}
			defaultValue={defaultValue}
		>
			<SelectTrigger className="w-[140px]">
				<SelectValue placeholder="Filter by level">
					{selectedLevel === 'all' ? (
						'All levels'
					) : (
						<span
							className={`flex items-center gap-1 ${selectedLevelConfig.style}`}
						>
							{selectedLevelConfig.icon && (
								<selectedLevelConfig.icon className="h-3.5 w-3.5 text-current" />
							)}
							{selectedLevel.charAt(0).toUpperCase() +
								selectedLevel.slice(1)}
						</span>
					)}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">All levels</SelectItem>
				{(
					Object.entries(levelConfig) as [
						LogLevel,
						(typeof levelConfig)[LogLevel]
					][]
				).map(([level, config]) => (
					<SelectItem key={level} value={level}>
						<span
							className={`flex items-center gap-1 ${config.style}`}
						>
							<config.icon className="h-3.5 w-3.5 text-current" />
							{level.charAt(0).toUpperCase() +
								level.slice(1)}
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
