import './dashboard.scss';
import { useHistory } from "react-router";
import { useAuth } from "../../contexts/Auth";

const Dashboard = function ({ prenom, nom }) {
    // Get current user and signOut function from context
    const { user, signOut } = useAuth();

    const history = useHistory();

    const handleSignOut = async () => {
        // Ends session
        await signOut()
        // Redirect to Login page
        history.push('/');
    }

    const goAdmin = (ev) => {
        ev.preventDefault();
        history.push('/admin');
    }

    return user && (
        <div className="dashboard fixed-top d-flex align-items-baseline justify-content-end">
            <p>Coucou, <strong>{prenom} {nom}</strong> !</p>
            <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={goAdmin}>Admin</button>
            <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={handleSignOut}>Déconnexion</button>
        </div>
    )
}

export default Dashboard;