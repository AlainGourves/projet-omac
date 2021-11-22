import './home.scss';
import { Link } from 'react-router-dom';

function Home(props) {

    return (
        <div className="carte">
            <h1 className="text-center">{props.title}</h1>
            <p className="mb-3">{props.description}</p>
            <div className="row text-center">
                <Link to='/user'>
                    <button type='button' className="btn btn-primary">Commencer</button>
                </Link>
            </div>
        </div>
    );
}

export default Home;