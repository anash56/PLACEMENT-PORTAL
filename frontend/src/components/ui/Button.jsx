function Button({
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    onClick,
    className = ""
}) {

    const baseStyles =
        "px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform active:scale-[0.98] select-none";

    const variants = {

        primary:
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md focus:ring-blue-500",

        secondary:
            "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 shadow-sm focus:ring-gray-300",

        danger:
            "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-sm focus:ring-rose-500"

    };

    return (

        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >

            {children}

        </button>

    );

}

export default Button;