import './login.scss';
import { useRef, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import { Eye, EyeOff } from 'react-feather';

const Login = function () {
    const emailRef = useRef();
    const passwordRef = useRef();

    const [error, setError] = useState(null);

    const [eyeIcon, setEyeIcon] = useState(true); // true -> Eye, false -> EyeOff

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

    const showPassword = () => {
        setEyeIcon(!eyeIcon);
        passwordRef.current.type = (eyeIcon) ? 'text' : 'password';
    }

    return (
        <form onSubmit={handleSubmit}>
            {error &&
                <div className="alert alert-warning mb-3">{error && JSON.stringify(error)}</div>
            }

            <div className="col mb-3">
                <label className="form-label" htmlFor="input-email">Email</label>
                <input className="form-control" name="input-email" type="email" ref={emailRef} />
            </div>

            <div className="col mb-3">
                <label className="form-label" htmlFor="input-password">Mot de passe</label>
                <div className="input-group">
                    <input className="form-control" name="input-password" type="password" ref={passwordRef} />
                    <span className="eye input-group-text" onClick={showPassword}>
                        {eyeIcon ? <Eye size={18} /> : <EyeOff size={18} />}
                    </span>
                </div>
            </div>

            <div className="d-flex flex-column justify-content-center align-items-center">
                <button className="btn btn-primary mb-2" type="submit">Login</button>
                <p>Pas de compte ? <Link to="/inscription">Inscrivez-vous</Link></p>
            </div>

        </form>
    )
}

export default Login;