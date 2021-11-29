import { useState, useEffect } from 'react';
import { useHistory } from "react-router";
import { useAuth } from "../../contexts/Auth";
import { supabase } from '../../supabaseClient';

const Dashboard = function () {
    // Get current user and signOut function from context
    const { user, signOut } = useAuth();

    const history = useHistory();

    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');

    // Récupère les infos du user
    useEffect(() => {
        const getUser = async (user) => {
            // Récupère les infos dans `public.users`
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select()
                    .eq('id', user.id)
                    .single()

                if (error) {
                    throw error;
                }

                if (data) {
                    setPrenom(data.prenom)
                    setNom(data.nom)
                }
            } catch (error) {
                console.warn("Erreur getUser: ", error)
            }
        }
        getUser(user);
    }, [user]);

    const handleSignOut = async () => {
        // Ends session
        await signOut()
        // Redirect to Login page
        history.push('/connexion');
    }

    return (
        <div className="toast show position-absolute m-3 top-0 end-0">
            <div className="toast-body d-flex justify-content-beetween">
                { user &&
                    <p>Coucou, <strong>{prenom} {nom}</strong> !</p>
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