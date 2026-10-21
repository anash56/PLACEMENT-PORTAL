function Button({
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    onClick,
    className = "",
}) {
    const baseStyles = "portal-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99] select-none";

    const variants = {
        primary: "bg-[#174f97] text-white shadow-sm hover:bg-[#123f78] hover:shadow-md focus:ring-[#5c91d5]",
        secondary: "border border-[#d8e4f3] bg-[#f4f8fe] text-[#294867] shadow-sm hover:border-[#b9cfea] hover:bg-[#eaf2fd] focus:ring-[#9cb9dc]",
        // Keep red/pink treatment for actions that reject, suspend, or delete records.
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
