import { useId } from "react";

function Input({ label, className = "", id, ...props }) {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                {...props}
                id={inputId}
                className={`
                    w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    ${className}
                `}
            />
        </div>
    );
}

export default Input;
