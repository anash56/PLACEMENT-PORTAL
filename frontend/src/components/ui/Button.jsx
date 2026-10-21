function Button({
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    onClick,
    className = "",
}) {
    const baseStyles = "portal-button inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] select-none";

    const variants = {
        primary: "bg-[#245e9b] text-white shadow-sm hover:bg-[#1d4d82] hover:shadow-md focus:ring-[#245e9b]",
        secondary: "border border-[#dce6f3] bg-white text-[#344b68] shadow-sm hover:border-[#c8d8ed] hover:bg-[#f7faff] focus:ring-[#9cb9dc]",
        // Reserve the rose treatment for actions that truly reject, suspend, or delete.
        danger: "border border-rose-200 bg-rose-50 text-rose-800 shadow-sm hover:border-rose-300 hover:bg-rose-100 focus:ring-rose-300",
    };

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
        >
            {children}
        </button>
    );
}

export default Button;
