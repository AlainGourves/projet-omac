import './home.scss';
import { Link } from 'react-router-dom';


function Home() {

    return (
        <div className="home">
            <h1 className="text-center">Bienvenue dans le test !</h1>
            <p className="text-center">Commence par donner quelques informations sur toi.</p>

            <div className="my-4">
                <div className="row align-items-center mb-3">
                    <label htmlFor="age" className="form-label col-md-4 text-end">Ton âge:</label>
                    <div className="col-md-8">
                        <input type="number" name="age" className="form-control" />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-4 text-end">Ton genre:</div>
                    <div role="group" className="form-check col-md-8">
                        <label className="form-label d-block">
                            <input type='radio' name="sexe" value='M' className="form-check-input" checked />
                            Garçon</label>
                        <label className="form-label d-block">
                            <input type='radio' name="sexe" value='F' className="form-check-input" />
                            Fille</label>
                        <label className="form-label d-block">
                            <input type='radio' name="sexe" value='O' className="form-check-input" />
                            Autre</label>
                    </div>
                </div>

                <div className="row align-items-center mb-3">
                    <label className="form-label col-md-4 text-end" htmlFor="etablissement">Ton établissement:</label>
                    <div className="col-md-8">
                        <input type='text' name="etablissement" placeholder='établissement' className="form-control" />
                    </div>
                </div>

                <div className="text-center">
                    <Link to='/test'>
                        <button type='button' className="btn btn-primary">Continuer</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;