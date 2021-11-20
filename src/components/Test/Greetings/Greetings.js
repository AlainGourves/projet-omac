import './greetings.scss';
import { useState } from 'react';
import { Redirect } from 'react-router-dom';

function Greetings() {
    const [redirect, setRedirect] = useState(null);


    const onSubmit = (ev) => {
        ev.preventDefault();
        // Supprime l'objet user de localStorage (pour pouvoir en créer un nouveau au cobaye suivant)
        if (localStorage.getItem('user')) {
            localStorage.removeItem('user');
        }
        setRedirect('/');
    }
    if (redirect) {
        return <Redirect to={redirect} />
    }
    return (
        <div className="carte row text-center">
            <h1>Merci !</h1>
            <form onSubmit={onSubmit}>
                <button type='submit' className="btn btn-primary">Fin</button>
            </form>
        </div>
    );
}

export default Greetings;