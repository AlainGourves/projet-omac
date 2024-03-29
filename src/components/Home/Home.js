import { Link, useHistory } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from '../../contexts/Auth';
import { useModal } from "../../contexts/ModalContext";
import { ShieldOff } from "react-feather";

const Home = (props) => {

    const { user, signOut } = useAuth();

    const history = useHistory();

    const [, setModal] = useModal();

    const handleSignOut = async () => {
        // Ends session
        await signOut()
        // Redirect to Login page
        history.push('/');
    }

    useEffect(() => {
        // Savoir si le visiteur utilise une souris ou un écran tactile
        const touchScreen = window.matchMedia('(pointer: coarse)');
        // Affiche l'alerte une fois puis stocke en localStorage le fait qu'elle a déjà été affichée (`touchScreenAlert`)
        if (touchScreen.matches) {
            // utilise un écran tactile => le drag&drop ne fonctionne pas
            const now = Date.now();
            const oneDay = 1000 * 60 * 60 * 24; // 1 jour en ms
            if (!localStorage.getItem('touchScreenAlert') || (localStorage.getItem('touchScreenAlertDate') && now - localStorage.getItem('touchScreenAlertDate') > oneDay)) {
                // Le modal avec message d'alerte n'est affiché qu'une fois par jour
                const msg = (<div>
                    <p>Pour le moment, l'application fonctionne mal sur un écran tactile&nbsp;!<br />
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
                localStorage.setItem('touchScreenAlert', true);
                localStorage.setItem('touchScreenAlertDate', Date.now());
            }
        }
    }, [setModal]);

    return (
        <main>
            <h1>Page d'accueil</h1>
            <p>Page publique (c'est la seule qui sera visible de l'extérieur sans codes d'accès).</p>
            <p className="alert alert-warning">Contenu à voir.</p>

            {user &&
                <>
                    <p><Link to='/test'>Test</Link></p>

                    
                    {/* ------- Lien déconnexion -------------- */}
                    <div className="login__home">
                        <button className='faux-link d-inline-flex align-items-center' onClick={handleSignOut}><ShieldOff /><span>Déconnexion</span></button>
                    </div>
                </>
            }
            {!user &&
                <p><Link to="/connexion">connexion</Link></p>
            }
        </main>
    )
}

export default Home;