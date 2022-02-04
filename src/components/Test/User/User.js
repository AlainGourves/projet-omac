import './user.scss';
import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AlertMesg from '../../Utils/AlertMesg/AlertMesg';


function User() {
    const [redirect, setRedirect] = useState(null);

    // Validation du formulaire
    const schema = yup.object().shape({
        initials: yup.string()
            .matches(/^[a-zA-Z-]+$/, {
                excludeEmptyString: true,
                message: "Ce champ n'accepte que les lettres et le tiret : A-Z"
            })
            .required("Merci de saisir vos initiales."),
        birthDate: yup.date()
            .typeError("Merci de vérifiez la date de naissance.")
            .max(new Date(), "Vous n'êtes vraisemblablement pas un enfant du futur!")
            .required("Merci de renseigner votre date de naissance."),
        age: yup.number()
            .typeError("Merci de renseigner votre âge.")
            .integer("Merci de vérifiez l'âge.")
            .moreThan(0, "Merci de vérifiez l'âge.")
            .lessThan(99, "Merci de vérifiez l'âge.")
            .required("Merci de saisir votre âge."),
        gender: yup.string().oneOf(['M', 'F', 'O'], "Renseigner votre sexe.").required("Renseigner votre sexe."),
        institution: yup.string().required("Merci de renseigner votre établissement",)
    })

    const { reset, register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            'initials': '',
            'uniqueId': '',
            'birthDate': '',
            'age': '',
            'gender': 'M',
            'institution': ''
        },
        resolver: yupResolver(schema),
    })

    // Calcul automatique de l'âge
    const watchBirthDate = watch('birthDate');
    useEffect(() => {
        const d = watchBirthDate.split('-');
        // Calcul de l'âge
        const d1 = new Date(); //aujourd'hui
        const d2 = new Date(d[0], d[1] - 1, d[2]); // Y,M,D (month counter is zero based)
        const age = d1.getFullYear() - d2.getFullYear();
        if (!Number.isNaN(age) && age > 0 && age < 100) {
            setValue('age', age)
        }else{
            setValue('age', undefined)
        }
    }, [watchBirthDate, setValue]);

    useEffect(() => {
        if (localStorage.getItem('user') && localStorage.getItem('user') !== null) {
            const defaultValues = {
                'uniqueId': JSON.parse(localStorage.getItem('user')).uniqueId,
                'initials': JSON.parse(localStorage.getItem('user')).uniqueId.substring(0, 2),
                'birthDate': new Date(JSON.parse(localStorage.getItem('user')).birthDate).toISOString().substring(0,10), // récupérer la date sous la form 'yyyy-MM-dd'
                'age': JSON.parse(localStorage.getItem('user')).age,
                'gender': JSON.parse(localStorage.getItem('user')).gender,
                'institution': JSON.parse(localStorage.getItem('user')).institution
            }
            reset(defaultValues);
        }
    }, [reset])

    const onSubmit = async (vals) => {
        // Création de `uniqueId` : initiales + (année, mois, jour collés)
        const uniqueId = vals.initials.toUpperCase() 
                            + vals.birthDate.getFullYear() 
                            + (vals.birthDate.getMonth() + 1).toString().padStart(2, '0')
                            + (vals.birthDate.getDate()).toString().padStart(2, '0');
        const obj = {
            'uniqueId': uniqueId,
            'birthDate': vals.birthDate,
            'age': vals.age,
            'gender': vals.gender,
            'institution': vals.institution
        }
        
        localStorage.setItem('user', JSON.stringify(obj));
        setRedirect('/test/quiz/0');
    }

    if (redirect) {
        return <Redirect to={redirect} />
    }
    return (
        <div className="carte">
            <h1 className="text-center">Bienvenue dans Bidule&nbsp;!</h1>
            <p className="text-center">Commence par donner quelques informations sur toi.</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="my-4">
                    <div className="row align-items-center mb-3">
                        <label htmlFor="age" className="form-label col-md-4 text-md-end">Tes initiales:</label>
                        <div className="col-md-8">
                            <input
                                {...register("initials")}
                                type="text"
                                className="form-control text-uppercase" />
                            {errors.initials &&
                                <AlertMesg message={errors.initials?.message} />
                            }
                        </div>
                    </div>
                    <div className="row align-items-center mb-3">
                        <label htmlFor="age" className="form-label col-md-4 text-md-end">Ta date de naissance:</label>
                        <div className="col-md-8">
                            <input
                                {...register("birthDate")}
                                type="date"
                                className="form-control" />
                            {errors.birthDate &&
                                <AlertMesg message={errors.birthDate?.message} />
                            }
                        </div>
                    </div>
                    <div className="row align-items-center mb-3">
                        <label htmlFor="age" className="form-label col-md-4 text-md-end">Ton âge:</label>
                        <div className="col-md-8">
                            <input
                                {...register("age")}
                                type="number"
                                step="0.01"
                                className="form-control" />
                            {errors.age &&
                                <AlertMesg message={errors.age?.message} />
                            }
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-4 text-md-end">Ton genre:</div>
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
                            {errors.gender &&
                                <AlertMesg message={errors.gender?.message} />
                            }
                        </div>
                    </div>

                    <div className="row align-items-center mb-3">
                        <label className="form-label col-md-4 text-md-end" htmlFor="institution">Ton établissement:</label>
                        <div className="col-md-8">
                            <input
                                {...register("institution")}
                                type='text'
                                name="institution"
                                placeholder="Nom de l'établissement"
                                className="form-control" />
                            {errors.institution &&
                                <AlertMesg message={errors.institution?.message} />
                            }
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

export default User;