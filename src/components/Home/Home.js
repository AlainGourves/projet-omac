import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from '../../contexts/Auth';
import { useModal } from "../../contexts/ModalContext";
import { AlertTriangle } from "react-feather";

const Home = (props) => {

    const { user } = useAuth();

    const [,setModal] = useModal();

    useEffect(() => {
        // Savoir si le visiteur utilise une souris ou un écran tactile
        const touchScreen = window.matchMedia('(pointer: coarse)');
        if (touchScreen.matches) {
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
        }
    }, [setModal]);

    return (
        <main>

            <div className="alert alert-danger w-50">
                <h2 className="alert-heading"><AlertTriangle /> Attention !</h2>
                <p>Je vais modifier la structure de la base données dans les jours à venir.</p>
                <p>Dans un premier temps, ça va avoir pour conséquence que je vais devoir effacer toutes les réponses aux tests. Les tests et quizs ne bougeront pas.</p>
                <p>Il est possible aussi que, par moments, le site ne fonctionne plus ou mal, mais ça ne devrait pas être trop long.</p>
            </div>
            
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