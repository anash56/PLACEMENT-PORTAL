function Modal({

    open,

    title,

    children,

    onClose

}) {

    if (!open) {

        return null;

    }

    return (

        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/50
                p-4
            "
        >

            <div
                className="
                    w-full
                    max-w-md
                    rounded-xl
                    bg-white
                    shadow-2xl
                "
            >

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        p-5
                    "
                >

                    <h2
                        className="
                            text-xl
                            font-semibold
                        "
                    >

                        {title}

                    </h2>

                    <button
                        onClick={onClose}
                        className="
                            text-2xl
                            text-gray-500
                            hover:text-black
                        "
                    >

                        ×

                    </button>

                </div>

                <div className="p-5">

                    {children}

                </div>

            </div>

        </div>

    );

}

export default Modal;