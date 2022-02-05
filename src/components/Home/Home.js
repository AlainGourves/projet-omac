import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from '../../contexts/Auth';
import { useModal } from "../../contexts/ModalContext";
import {addToLocalStorage } from "../Utils/helperFunctions";
// import { AlertTriangle } from "react-feather";

const Home = (props) => {

    const { user } = useAuth();

    const [,setModal] = useModal();

    useEffect(() => {
        // Savoir si le visiteur utilise une souris ou un écran tactile
        const touchScreen = window.matchMedia('(pointer: coarse)');
        // Affiche l'alerte une fois puis stocke en localStorage le fait qu'elle a déjà été affichée (`touchScreenAlert`)
        if (touchScreen.matches && !localStorage.getItem('touchScreenAlert')) {
            // utilise un écran tactile => le drag&drop ne fonctionne pas
            const msg = (<div>
                <p>Pour le moment, l'application fonctionne mal sur un écran tactile&nbsp;!<br/>
                Merci de réessayer sur un ordinateur, avec une souris.</p>
            </div>);
            setModal({
                show: true,
                title: "Alerte",
                message: msg,
                btnOk: 'Fermer',
                fn: () => {
                    setModal({
                        show: false,
                    });
                }
            });
            addToLocalStorage('touchScreenAlert', true, false);
        }
    }, [setModal]);

    return (
        <main>
            <h1>Page d'accueil</h1>
            <p>Page publique (c'est la seule qui sera visible de l'extérieur sans codes d'accès).</p>
            <p className="alert alert-warning">Contenu à voir.</p>

            {user &&
                <p><Link to='/test'>Test</Link></p>
            }
            {!user &&
                <p><Link to="/connexion">connexion</Link></p>
            }
        </main>
    )
}

export default Home;