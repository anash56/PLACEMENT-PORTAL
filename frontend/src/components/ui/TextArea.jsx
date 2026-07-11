function Textarea({
    label,
    className = "",
    ...props
}) {

    return (

        <div className="w-full">

            {
                label && (

                    <label className="mb-2 block text-sm font-medium text-gray-700">

                        {label}

                    </label>

                )
            }

            <textarea
                {...props}
                className={`
                    w-full
                    resize-y
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-200
                    ${className}
                `}
            />

        </div>

    );

}

export default Textarea;