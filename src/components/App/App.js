import './app.scss';
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
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
import Home from '../Home/Home';

function App() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');

    // Récupère les infos dans `public.users`
    useEffect(() => {
        const getUser = async (user) => {
            try {
                // Erreur silencieuse ! Ça n'est réellement utile que pour les admins
                const { data } = await supabase
                    .from('users')
                    .select()
                    .eq('id', user.id)
                    .single()

                if (data && data.is_admin) {
                    setPrenom(data.prenom)
                    setNom(data.nom)
                    setIsAdmin(data.is_admin)
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.warn("Erreur getUser: ", error.message)
            }
        }

        if (user) {
            getUser(user);
        }
    }, [user]);


    return (
        <ModalProvider>
            <div className="container-md min-vh-100 d-flex flex-column justify-content-center align-items-center">
                {(user && isAdmin) && <Dashboard prenom={prenom} nom={nom} />}
                <Switch>
                    {/* <Route path="/inscription" component={SignUp} /> */}
                    <Route path="/connexion" component={Login} />
                    <Route exact path="/" component={Home} />
                    <PrivateRoute path="/test" component={Test} />
                    {isAdmin ?
                        (<PrivateRoute path="/admin" component={Admin} />) : (<Redirect to="/" />)
                    }
                    <Route path="*">
                        <Page404 />
                    </Route>
                </Switch>
            </div>
        </ModalProvider>
    );
}

export default App;