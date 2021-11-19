import './greetings.scss';
import { Link } from 'react-router-dom';

function Greetings() {

    return (
        <div className="row text-center">
            <h1>Merci !</h1>
            <Link to='/test'>
                <button type='button' className="btn btn-primary">Fin</button>
            </Link>
        </div>
    );
}

export default Greetings;