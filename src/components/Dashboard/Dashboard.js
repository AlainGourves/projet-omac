import { useHistory } from "react-router";
import { useAuth } from "../../contexts/Auth";

const Dashboard = function () {
    // Get current user and signOut function from context
    const { user, signOut } = useAuth();

    const history = useHistory();

    const handleSignOut = async () => {
        // Ends session
        await signOut()
        // Redirect to Login page
        history.push('/connexion');
    }

    return (
        <div className="toast show position-absolute m-3 top-0 end-0">
            <div className="toast-body d-flex justify-content-beetween">
                { user.email &&
                    <p>Coucou, <strong>{user.email}</strong> !</p>
                }
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleSignOut}>Déconnexion</button>
            </div>
        </div>
    )
}

export default Dashboard;