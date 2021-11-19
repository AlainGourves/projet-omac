import './quiz.scss';
import { Link } from 'react-router-dom';

function Quiz() {

    return (
        <div className="row text-center">
            <h1>Quiz</h1>
            <Link to='/test/verbatim'>
                <button type='button' className="btn btn-primary">Continuer</button>
            </Link>
        </div>
    );
}

export default Quiz;