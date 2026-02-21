import { cn } from "./Card"

export function Button({ className, variant = "primary", ...props }) {
    const variants = {
        primary: "bg-brand-600 text-white hover:bg-brand-700",
        outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
        ghost: "text-slate-600 hover:bg-slate-100",
    }

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}
