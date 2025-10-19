import type { Size } from "./utils/size";

type FloatingActionButtonProps = {
	onClick?: () => void;

	ariaLabel?: string;
	icon?: React.ReactNode;
	color?: string;
	backgroundColor?: string;
	size?: Size;
};

export const FloatingActionButton = (props: FloatingActionButtonProps) => {
	return (
		<div>
			<button aria-label={props.ariaLabel} onClick={props.onClick}></button>
		</div>
	);
};
