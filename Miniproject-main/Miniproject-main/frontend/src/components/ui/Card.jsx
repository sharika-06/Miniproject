import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function Card({ className, children, ...props }) {
    return (
        <div className={cn("bg-neuro-card rounded-xl border border-neuro-border shadow-sm", className)} {...props}>
            {children}
        </div>
    )
}
