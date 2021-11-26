import './login.scss';
import { useRef, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';

const Login = function () {
    const emailRef = useRef();
    const passwordRef = useRef();

    const [error, setError] = useState(null);

    // Get connexion function from the Auth context
    const { signIn } = useAuth();

    const history = useHistory();

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        // Get input values
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        // Calls signIn function from the context
        const { error } = await signIn({ email, password });

        if (error) {
            return setError(error);
        }
        history.push('/')
    }

    return (
        <form onSubmit={handleSubmit}>
            {error &&
                <div className="alert alert-warning mb-3">{error && JSON.stringify(error)}</div>
            }

            <div className="row mb-3">
                <label className="form-label" htmlFor="input-email">Email</label>
                <input className="form-control" name="input-email" type="email" ref={emailRef} />
            </div>

            <div className="row mb-3">
                <label className="form-label" htmlFor="input-password">Password</label>
                <input className="form-control" name="input-password" type="password" ref={passwordRef} />
            </div>

            <div className="row mb-3">
                <button className="btn btn-primary" type="submit">Login</button>
            </div>

            <div className="text-center mb-3">
                Pas de compte ? <Link to="/signup">Inscrivez-vous</Link>
            </div>
        </form>
    )
}

export default Login;