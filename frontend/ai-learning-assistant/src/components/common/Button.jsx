import React from 'react'

const Button = ({
    children,
    onClick,
    type = "button",
    disabled = false,
    className = "",
    variant = "primary",
    size = "md",
}) => {
    const baseStyle = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap';

    const variantStyles = {
        primary: "bg-primary text-primary-foreground shadow-glow-primary hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90 gradient-primary",

        secondary: "bg-card text-foreground hover:bg-primary/5 border border-border shadow-warm",

        outline: "bg-transparent border border-primary/50 text-primary hover:bg-primary/10 shadow-warm hover:shadow-glow-primary",

        accent: "gradient-accent text-white shadow-glow-accent hover:shadow-xl hover:shadow-accent/30",

        ghost: "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
    };

    const sizeStyles = {
        sm: "text-xs px-4 h-9",
        md: "text-sm px-5 h-11",
        lg: "text-base px-6 h-12",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={[
                baseStyle,
                variantStyles[variant],
                sizeStyles[size],
                className
            ].join(" ")}
        >
            {children}
        </button>
    )
}

export default Button