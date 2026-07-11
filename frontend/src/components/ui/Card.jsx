function Card({
    children,
    className = ""
}) {

    return (

        <div
            className={`
                rounded-xl
                border
                border-gray-100
                bg-white
                p-6
                shadow-sm
                hover:shadow-md
                transition-all
                duration-300
                ${className}
            `}
        >

            {children}

        </div>

    );

}

export default Card;