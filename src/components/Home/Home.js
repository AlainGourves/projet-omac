import { Link } from "react-router-dom";
import { useAuth } from '../../contexts/Auth';

const Home = (props) => {

    const { user } = useAuth();

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