import Modal from "./Modal";
import Button from "./Button";

function ConfirmationModal({

    open,

    title,

    message,

    onCancel,

    onConfirm,

    loading = false,

    confirmText = "Delete",

    confirmVariant = "danger"

}) {

    return (

        <Modal

            open={open}

            title={title}

            onClose={onCancel}

        >

            <p className="text-gray-600">

                {message}

            </p>

            <div
                className="
                    mt-6
                    flex
                    justify-end
                    gap-3
                "
            >

                <Button

                    variant="secondary"

                    onClick={onCancel}

                    disabled={loading}

                >

                    Cancel

                </Button>

                <Button

                    variant={confirmVariant}

                    onClick={onConfirm}

                    disabled={loading}

                >

                    {

                        loading

                        ?

                        `${confirmText}...`

                        :

                        confirmText

                    }

                </Button>

            </div>

        </Modal>

    );

}

export default ConfirmationModal;