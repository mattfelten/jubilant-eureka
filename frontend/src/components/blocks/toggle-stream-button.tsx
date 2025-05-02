import { Button } from "../ui/button";

interface ToggleStreamButtonProps {
	isStreaming: boolean;
	onClick: () => void;
	children: React.ReactNode;
}

export const ToggleStreamButton = ({
	isStreaming,
	onClick,
	children,
}: ToggleStreamButtonProps) => {
	return (
		<Button
			data-testid="toggle-stream-button"
			onClick={onClick}
			className={
				isStreaming
					? "bg-red-500 hover:bg-red-600 text-white"
					: "bg-blue-500 hover:bg-blue-600 text-white"
			}
			aria-label={isStreaming ? "Stop streaming logs" : "Start streaming logs"}
		>
			{children}
		</Button>
	);
};
