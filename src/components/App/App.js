import './app.scss';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import { ModalProvider } from '../../contexts/ModalContext';
import PrivateRoute from '../PrivateRoute/PrivateRoute';
import Login from '../Login/Login';
// import SignUp from '../SignUp/SignUp';
import Test from '../Test/Test';
import Page404 from '../Page404/Page404';
import Admin from '../Admin/Admin';
import Dashboard from '../Dashboard/Dashboard';
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

function App() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');

    // // Récupère les infos dans `public.users`
    useEffect(() => {
        const getUser = async (user) => {
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
                    setIsAdmin(data.is_admin)
                }
            } catch (error) {
                console.warn("Erreur getUser: ", error)
            }
        }

        if (user) getUser(user);
    }, [user]);

    return (
        <ModalProvider>
            <div className="container min-vh-100 d-flex justify-content-center align-items-center">
                {isAdmin && <Dashboard prenom={prenom} nom={nom} />}
                <Switch>
                    {/* <Route path="/inscription" component={SignUp} /> */}
                    <Route path="/connexion" component={Login} />
                    <PrivateRoute exact path="/" component={Test} />
                    <PrivateRoute path="/test" component={Test} />
                    {isAdmin ?
                        (<PrivateRoute path="/admin" component={Admin} />) : (<Redirect to="/" />)
                    }
                    <Route path='*' component={Page404} />
                </Switch>
            </div>
        </ModalProvider>
    );
}

export default App;