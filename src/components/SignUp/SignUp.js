import { useRef, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/Auth';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff } from 'react-feather';
import AlertMesg from '../AlertMesg/AlertMesg';

const SignUp = function () {

    const [eyeIcon, setEyeIcon] = useState(true); // true -> Eye, false -> EyeOff

    // Get connexion function from the Auth context
    const { signUp } = useAuth();

    const history = useHistory();

    const schema = yup.object().shape({
        firstName: yup.string().required("Merci de renseigner votre prénom."),
        lastName: yup.string().required("Merci de renseigner votre nom."),
        email: yup.string().email("Vérifier l'adresse mail, elle ne semble correcte.").required("Merci de renseigner votre adresse mail."),
        password: yup.string().min(8, "Le mot de passe doit compter au moins 8 caractères.").required("Merci de choisir un mot de passe."),
        confPassword: yup.string()
                        .min(8, "Le mot de passe doit compter au moins 8 caractères.")
                        .required("Merci de confirmer votre mot de passe.")
                        .equals([yup.ref('password')], "Les deux mots de passe ne sont pas identiques."),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            'firstName': '',
            'lastName': '',
            'email': '',
            'password': '',
            'confPassword': '',
        },
        resolver: yupResolver(schema),
    });

    const onError = (errors) => {
        console.log("erreur", errors);
    }

    const onSubmit = (values) => {
        console.log("submit", values)
        // ev.preventDefault();
        // Get input values
        // const email = values.email;
        // const password = passwordRef.current.value;
        // // Calls signIn function from the context
        // const { error } = await signUp({ email, password });

        // if (error) return setError(error);
        // // Redirect
        // history.push('/')
    }

    const showPassword = () => {
        setEyeIcon(!eyeIcon);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)}>

            <div className="row mb-3 gy-2">
                <div className="col">
                    <label className="form-label" htmlFor="firstName">Prénom</label>
                    <input
                        {...register("firstName")}
                        className="form-control"
                        type="text"
                    />
                    {errors.firstName &&
                        <AlertMesg message={errors.firstName?.message} />
                    }
                </div>
                <div className="col">
                    <label className="form-label" htmlFor="lastName">Nom</label>
                    <input
                        {...register("lastName")}
                        className="form-control"
                        type="text"
                    />
                    {errors.lastName &&
                        <AlertMesg message={errors.lastName?.message} />
                    }
                </div>
            </div>


            <div className="mb-3">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                    {...register("email")}
                    className="form-control"
                    type="email"
                />
                {errors.email &&
                    <AlertMesg message={errors.email?.message} />
                }
            </div>

            <div className="row mb-3 gy-2">
                <div className="col">
                    <label className="form-label" htmlFor="password">Mot de passe</label>
                    <div className="input-group">
                        <input
                            {...register("password")}
                            className="form-control"
                            type={eyeIcon ? "password" : "text"}
                        />
                        <span className="input-group-text eye" onClick={showPassword} >
                            {eyeIcon ? <Eye size={18} /> : <EyeOff size={18} />}
                        </span>
                    </div>
                    {errors.password &&
                        <AlertMesg message={errors.password?.message} />
                    }
                </div>
                <div className="col">
                    <label className="form-label" htmlFor="confPassword">Confirmer le mot de passe</label>
                    <div className="input-group">
                        <input
                            {...register("confPassword")}
                            className="form-control"
                            type={eyeIcon ? "password" : "text"}
                        />
                        <span className="input-group-text eye" onClick={showPassword}>
                            {eyeIcon ? <Eye size={18} /> : <EyeOff size={18} />}
                        </span>
                    </div>
                    {errors.confPassword &&
                        <AlertMesg message={errors.confPassword?.message} />
                    }
                </div>
            </div>

            <div className="d-flex flex-column justify-content-center align-items-center">
                <button
                    className="btn btn-primary mb-2"
                    type="submit">Inscription</button>
                <p>Déjà inscrit ? {<Link to="/connexion">Connectez-vous</Link>}</p>
            </div>

        </form>
    )
}

export default SignUp;