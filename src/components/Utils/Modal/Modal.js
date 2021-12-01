import './modal.scss';
import { useModal } from '../../../contexts/ModalContext';
import { X } from 'react-feather';

const Modal = (props) => {
    const [modal, setModal] = useModal();

    const closeModal = (ev) => {
        setModal({
            ...modal,
            show: false
        })
    }

    if (modal.show) return (
        <div className="modal">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{props.title}</h5>
                        <button
                            type="button"
                            className="close"
                            onClick={closeModal}>
                            <X />
                        </button>
                    </div>
                    <div className="modal-body">
                        <p>{props.children}</p>
                    </div>
                    <div className="modal-footer">
                        {props.btnCancel &&
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={closeModal}>
                                {props.btnCancel}</button>
                        }
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={modal.fn}
                        >
                            {props.btnOk}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal;