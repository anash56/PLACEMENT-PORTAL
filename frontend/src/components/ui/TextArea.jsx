import { useId } from "react";

function Textarea({ label, className = "", id, ...props }) {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={textareaId} className="mb-2 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <textarea
                {...props}
                id={textareaId}
                className={`
                    w-full resize-y rounded-lg border border-gray-300 px-3 py-2 outline-none transition
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    ${className}
                `}
            />
        </div>
    );
}

export default Textarea;
