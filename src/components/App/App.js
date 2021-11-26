import './app.scss';
import { Switch, Route } from 'react-router-dom';
import { AuthProvider } from '../../contexts/Auth';
import PrivateRoute from '../PrivateRoute/PrivateRoute';
import Login from '../Login/Login';
import SignUp from '../SignUp/SignUp';
import Test from '../Test/Test';

function App() {
 
    return (
        <AuthProvider>
            <div className="container min-vh-100 d-flex justify-content-center align-items-center">
                <Switch>
                    <Route path="/signup" component={SignUp} />
                    <Route path="/login" component={Login} />
                    <PrivateRoute exact path="/" component={Test} />
                    <PrivateRoute path="/test" component={Test} />
                </Switch>
            </div>
        </AuthProvider>
    );
}

export default App;