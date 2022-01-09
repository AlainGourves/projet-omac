import { Link } from "react-router-dom";
import { useAuth } from '../../contexts/Auth';
import { AlertTriangle } from "react-feather";

const Home = (props) => {

    const { user } = useAuth();

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