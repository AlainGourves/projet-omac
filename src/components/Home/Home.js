import './home.scss';
import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useForm } from 'react-hook-form';


function Home() {
    const [redirect, setRedirect] = useState(null);

    const { reset, register, handleSubmit } = useForm({
        defaultValues: {
            'age': 0,
            'gender': 'M',
            'etablissement': ''
        }
    })
    
    useEffect(()=>{
        if(localStorage.getItem('user') && localStorage.getItem('user') !== null) {
            const defaultValues = {
                'age': JSON.parse(localStorage.getItem('user')).age,
                'gender': JSON.parse(localStorage.getItem('user')).gender,
                'etablissement': JSON.parse(localStorage.getItem('user')).etablissement
            }
            reset(defaultValues)
        }
    }, [reset])

    const onSubmit = (vals) => {
        const obj = {
            'age': vals.age,
            'gender': vals.gender,
            'etablissement': vals.etablissement
        }
        localStorage.setItem('user', JSON.stringify(obj));
        setRedirect('/test');
    }

    if (redirect) {
        return <Redirect to={redirect} />
    }
    return (
        <div className="carte">
            <h1 className="text-center">Bienvenue dans Bidule !</h1>
            <p className="text-center">Commence par donner quelques informations sur toi.</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="my-4">
                    <div className="row align-items-center mb-3">
                        <label htmlFor="age" className="form-label col-md-4 text-end">Ton âge:</label>
                        <div className="col-md-8">
                            <input
                                {...register("age")}
                                type="number"
                                className="form-control" />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-4 text-end">Ton genre:</div>
                        <div role="group" className="form-check col-md-8">
                            <label className="form-label d-block">
                                <input type='radio' {...register("gender")} value='M' className="form-check-input" />
                                Garçon</label>
                            <label className="form-label d-block">
                                <input type='radio' {...register("gender")} value='F' className="form-check-input" />
                                Fille</label>
                            <label className="form-label d-block">
                                <input type='radio' {...register("gender")} value='O' className="form-check-input" />
                                Autre</label>
                        </div>
                    </div>

                    <div className="row align-items-center mb-3">
                        <label className="form-label col-md-4 text-end" htmlFor="etablissement">Ton établissement:</label>
                        <div className="col-md-8">
                            <input
                                {...register("etablissement")}
                                type='text'
                                name="etablissement"
                                placeholder="Nom de l'établissement"
                                className="form-control" />
                        </div>
                    </div>

                    <div className="text-center">
                        <button type='submit' className="btn btn-primary">Continuer</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Home;