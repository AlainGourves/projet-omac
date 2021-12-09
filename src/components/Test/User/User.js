import './user.scss';
import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../supabaseClient'


function Home() {
    const [redirect, setRedirect] = useState(null);

    const { reset, register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            'initials': '',
            'uniqueId': '',
            'birthDate': '',
            'age': 0,
            'gender': 'M',
            'institution': ''
        }
    })

    const watchBirthDate = watch('birthDate');
    useEffect(() => {
        const d = watchBirthDate.split('-');
        // Calcul de l'âge
        const d1 = new Date(); //aujourd'hui
        const d2 = new Date(d[0], d[1] - 1, d[2]); // Y,M,D (month counter is zero based)
        const age = d1.getFullYear() - d2.getFullYear();
        if (!Number.isNaN(age) && age < 100) {
            setValue('age', age)
        }
    }, [watchBirthDate, setValue]);

    const watchGender = watch('gender')
    useEffect(() => {
        let bgCol;
        if (watchGender === 'M') {
            bgCol = 'blue';
        } else if (watchGender === 'F') {
            bgCol = 'pink'
        } else {
            bgCol = 'gray'
        }
        document.documentElement.style.setProperty('--bg-carte', `var(--bg-${bgCol})`);
    }, [watchGender])

    useEffect(() => {
        if (localStorage.getItem('user') && localStorage.getItem('user') !== null) {
            const defaultValues = {
                'uniqueId': JSON.parse(localStorage.getItem('user')).uniqueId,
                'initials': JSON.parse(localStorage.getItem('user')).uniqueId.substring(0, 2),
                'birthDate': JSON.parse(localStorage.getItem('user')).birthDate,
                'age': JSON.parse(localStorage.getItem('user')).age,
                'gender': JSON.parse(localStorage.getItem('user')).gender,
                'institution': JSON.parse(localStorage.getItem('user')).institution
            }
            reset(defaultValues)
        }
    }, [reset])

    const onSubmit = async (vals) => {
        // Création de `uniqueId` : initiales + (année, mois, jour collés)
        const d = vals.birthDate.split('-').join('');
        const uniqueId = vals.initials.toUpperCase() + d;
        const obj = {
            'uniqueId': uniqueId,
            'birthDate': vals.birthDate,
            'age': vals.age,
            'gender': vals.gender,
            'institution': vals.institution
        }
        const { error } = await supabase
            .from('clients')
            .insert(obj, { returning: 'minimal' });
            // returning: 'minimal' -> Supabase ne renvoit pas les infos enregistrées
        if (error) {
            console.warn(error)
        }
        localStorage.setItem('user', JSON.stringify(obj));
        setRedirect('/test/quiz/0');
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
                        <label htmlFor="age" className="form-label col-md-4 text-end">Tes initiales:</label>
                        <div className="col-md-8">
                            <input
                                {...register("initials")}
                                type="text"
                                className="form-control text-uppercase" />
                        </div>
                    </div>
                    <div className="row align-items-center mb-3">
                        <label htmlFor="age" className="form-label col-md-4 text-end">Ta date de naissance:</label>
                        <div className="col-md-8">
                            <input
                                {...register("birthDate")}
                                type="date"
                                className="form-control" />
                        </div>
                    </div>
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
                        <label className="form-label col-md-4 text-end" htmlFor="institution">Ton établissement:</label>
                        <div className="col-md-8">
                            <input
                                {...register("institution")}
                                type='text'
                                name="institution"
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