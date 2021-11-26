import { useRef, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';

const SignUp = function () {
    const emailRef = useRef();
    const passwordRef = useRef();

    const [error, setError] = useState(null);

    // Get connexion function from the Auth context
    const { signUp } = useAuth();

    const history = useHistory();

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        // Get input values
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        // Calls signIn function from the context
        const { error } = await signUp({ email, password });

        if (error) return setError(error);
        // Redirect
        history.push('/')
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row mb-3">{error && JSON.stringify(error)}</div>

            <div className="row mb-3">
                <label className="form-label" htmlFor="input-email">Email</label>
                <input className="form-control" name="input-email" type="email" ref={emailRef} />
            </div>

            <div className="row mb-3">
                <label className="form-label" htmlFor="input-password">Password</label>
                <input className="form-control" name="input-password" type="password" ref={passwordRef} />
            </div>

            <div className="row mb-3">
                <button className="btn btn-primary" type="submit">Inscription</button>
            </div>

            <div className="row mb-3"> Déjà inscrit ? {<Link to="/login">Connectez-vous</Link>}</div>
        </form>
    )
}

export default SignUp;