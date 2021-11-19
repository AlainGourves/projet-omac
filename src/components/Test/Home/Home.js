import './home.scss';
import { Link } from 'react-router-dom';

function Home() {

    return (
        <div className="row text-center">
            <h1>Test accueil</h1>
            <Link to='/test/quiz'>
                <button type='button' className="btn btn-primary">Commencer</button>
            </Link>
        </div>
    );
}

export default Home;