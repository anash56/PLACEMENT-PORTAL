import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmationModal({
    open,
    title,
    message,
    children,
    onCancel,
    onConfirm,
    loading = false,
    confirmText = "Confirm",
    confirmVariant = "danger",
    cancelText = "Cancel",
}) {
    return (
        <Modal open={open} title={title} onClose={() => { if (!loading) onCancel?.(); }}>
            {message && <p className="m-0 whitespace-pre-line text-sm leading-6 text-slate-600">{message}</p>}
            {children}
            <div className="portal-modal-actions">
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    {cancelText}
                </Button>
                <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
                    {loading ? `${confirmText}…` : confirmText}
                </Button>
            </div>
        </Modal>
    );
}
