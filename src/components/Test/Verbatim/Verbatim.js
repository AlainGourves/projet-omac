import './verbatim.scss';
import { Link } from 'react-router-dom';

function Verbatim() {

    return (
        <div className="row text-center">
            <h1>Test Verbatim</h1>
            <Link to='/'>
                <button type='button' className="btn btn-primary">Continuer</button>
            </Link>
        </div>);

}

export default Verbatim;