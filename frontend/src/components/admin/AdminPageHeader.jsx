/** Shared admin page header with the same gradient and contrast as the existing dashboard hero. */
export default function AdminPageHeader({
    title,
    description,
    eyebrow = "College placement workspace",
    context,
    actions,
}) {
    return (
        <header className="relative isolate mb-7 overflow-hidden rounded-[26px] bg-[linear-gradient(115deg,#071b3b_0%,#0b2e61_58%,#1555a5_100%)] p-6 text-white shadow-[0_18px_50px_rgba(13,54,111,.17)] sm:p-8 lg:p-9">
            <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full border border-white/15 shadow-[0_0_0_32px_rgba(255,255,255,.035),0_0_0_68px_rgba(255,255,255,.025)]" />
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-200">
                {eyebrow}
            </p>
            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                    <h1 className="text-3xl font-extrabold leading-tight tracking-[-.04em] text-white sm:text-4xl">
                        {title}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-blue-100/90 sm:text-base">
                        {description}
                    </p>
                    {context && (
                        <p className="mt-3 inline-flex max-w-full items-center rounded-full border border-white/15 bg-white/[.07] px-3 py-1.5 text-xs font-semibold text-blue-50">
                            <span className="truncate">{context}</span>
                        </p>
                    )}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
        </header>
    );
}
