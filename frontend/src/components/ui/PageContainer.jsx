function PageContainer({
    children,
    className = ""
}) {

    return (

        <main
            className={`
                min-h-[calc(100vh-73px)]
                bg-gray-50
                px-4
                py-8
                ${className}
            `}
        >

            <div className="mx-auto max-w-7xl">

                {children}

            </div>

        </main>

    );

}

export default PageContainer;