import { Link } from 'react-router-dom';
import { ChevronLeft } from 'react-feather';

const NoTest = function () {

    return (
        <>

            <div>
                Il n'y a plus de test pour toi, mon lapin !
            </div>
            <div className="login__home">
                <Link to='/' className='text-decoration-none'><ChevronLeft /></Link>
                <Link to='/' className='text-decoration-none'>Retour à l'accueil</Link>
            </div>
        </>
    )
}

export default NoTest;