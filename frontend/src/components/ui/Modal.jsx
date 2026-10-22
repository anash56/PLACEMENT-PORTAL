import { useEffect, useId, useRef } from "react";

function Modal({ open, title, children, onClose }) {
    const panelRef = useRef(null);
    const closeHandlerRef = useRef(onClose);
    const titleId = useId();
    closeHandlerRef.current = onClose;

    useEffect(() => {
        if (!open) return undefined;

        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const panel = panelRef.current;
        const focusableSelector = [
            "a[href]",
            "button:not([disabled])",
            "input:not([disabled]):not([type='hidden'])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "[tabindex]:not([tabindex='-1'])",
        ].join(",");

        const getFocusable = () => Array.from(panel?.querySelectorAll(focusableSelector) || [])
            .filter(element => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");

        const focusable = getFocusable();
        (focusable[0] || panel)?.focus({ preventScroll: true });

        const onKeyDown = event => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeHandlerRef.current?.();
                return;
            }

            if (event.key !== "Tab" || !panel) return;
            const items = getFocusable();
            if (!items.length) {
                event.preventDefault();
                panel.focus();
                return;
            }

            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            } else if (!panel.contains(document.activeElement)) {
                event.preventDefault();
                first.focus();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        };
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="portal-modal-backdrop"
            role="presentation"
            onMouseDown={event => {
                if (event.target === event.currentTarget) closeHandlerRef.current?.();
            }}
        >
            <section
                ref={panelRef}
                className="portal-modal-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
            >
                <header className="portal-modal-header">
                    <div className="portal-modal-heading">
                        <span className="portal-modal-mark" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3.5 20 7v5c0 4.5-3.1 7.4-8 9-4.9-1.6-8-4.5-8-9V7l8-3.5Z" />
                                <path d="m8.5 12 2.2 2.2 4.8-4.8" />
                            </svg>
                        </span>
                        <div className="portal-modal-heading-copy">
                            <span className="portal-modal-eyebrow">PLACEMENT PORTAL</span>
                            <h2 id={titleId} className="portal-modal-title">{title}</h2>
                        </div>
                    </div>
                    <button type="button" className="portal-modal-close" onClick={() => closeHandlerRef.current?.()} aria-label="Close dialog">×</button>
                </header>
                <div className="portal-modal-body">{children}</div>
            </section>
        </div>
    );
}

export default Modal;
