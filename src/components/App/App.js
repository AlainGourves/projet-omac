import './app.scss';
import { Switch, Route } from 'react-router-dom';
import { AuthProvider } from '../../contexts/Auth';
import PrivateRoute from '../PrivateRoute/PrivateRoute';
import Login from '../Login/Login';
import SignUp from '../SignUp/SignUp';
import Test from '../Test/Test';
import Page404 from '../Page404/Page404';

function App() {
 
    return (
        <AuthProvider>
            <div className="container min-vh-100 d-flex justify-content-center align-items-center">
                <Switch>
                    <Route path="/inscription" component={SignUp} />
                    <Route path="/connexion" component={Login} />
                    <PrivateRoute exact path="/" component={Test} />
                    <PrivateRoute path="/test" component={Test} />
                    <Route path='*' component={Page404} />
                </Switch>
            </div>
        </AuthProvider>
    );
}

export default App;