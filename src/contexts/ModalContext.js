import { createContext, useContext, useState } from "react";
import Modal from '../components/Utils/Modal/Modal';

const ModalContext = createContext();

// Pour les pages qui veulent accéder aux valeurs du contexte
function useModal() {
    return useContext(ModalContext);
}

// Context Provider
function ModalProvider({children}) {
    const modalDefault = {
        show: false,
        title: '',
        message: '',
        btnCancel: null,
        btnOk: 'Continuer',
        fn: () => {}
    }
    const [modal, setModal] = useState(modalDefault)


    return (
        <ModalContext.Provider value={[modal, setModal]} >
            {modal.show &&
                <Modal
                    title={modal.title}
                    btnCancel={modal.btnCancel}
                    btnOk={modal.btnOk}
                    fn={modal.fn}
                >{modal.message}</Modal>
            }
            {children}
        </ModalContext.Provider>
    )
}


export { useModal, ModalProvider };