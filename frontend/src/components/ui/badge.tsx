import { type VariantProps, cva } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from 'src/lib/utils';

const badgeVariants = cva(
	'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
	{
		variants: {
			variant: {
				default: 'bg-gray-100 text-gray-800',
				warning: 'bg-yellow-100 text-yellow-800',
				positive: 'bg-green-100 text-green-800',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
