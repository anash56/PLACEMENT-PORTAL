import { useEffect } from "react";
import "./portal-consistency.css";

function Modal({ open, title, children, onClose }) {
    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = event => {
            if (event.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="portal-modal-backdrop"
            role="presentation"
            onMouseDown={event => {
                if (event.target === event.currentTarget) onClose?.();
            }}
        >
            <section
                className="portal-modal-panel"
                role="dialog"
                aria-modal="true"
                aria-label={title || "Dialog"}
            >
                <header className="portal-modal-header">
                    <div className="portal-modal-heading">
                        <span className="portal-modal-mark" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3.5 20 7v5c0 4.5-3.1 7.4-8 9-4.9-1.6-8-4.5-8-9V7l8-3.5Z" />
                                <path d="m8.5 12 2.2 2.2 4.8-4.8" />
                            </svg>
                        </span>
                        <h2 className="portal-modal-title">{title}</h2>
                    </div>
                    <button type="button" className="portal-modal-close" onClick={onClose} aria-label="Close dialog">×</button>
                </header>
                <div className="portal-modal-body">{children}</div>
            </section>
        </div>
    );
}

export default Modal;
