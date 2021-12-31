import './greetings.scss';
import { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';

function Greetings({ greetings, isSavedToDB, save2Supabase }) {
    const [redirect, setRedirect] = useState(null);

    useEffect(() => {
        if (!isSavedToDB) {
            save2Supabase();
        }
    }, [isSavedToDB, save2Supabase]);

    const onSubmit = (ev) => {
        ev.preventDefault();
        // Vide localStorage
        if (localStorage.getItem('user')) {
            localStorage.clear();
        }
        setRedirect('/');
    }

    if (redirect) {
        return <Redirect to={redirect} />
    }

    return (
        <>
            {(!isSavedToDB) ? (
                <h1>Enregistrement des données...</h1 >
            ) : (
                <div className="carte row text-center">
                    <h1>{greetings}</h1>
                    <form onSubmit={onSubmit}>
                        <button type='submit' className="btn btn-primary">Fin</button>
                    </form>
                </div >
            )}
        </>
    );
}

export default Greetings;