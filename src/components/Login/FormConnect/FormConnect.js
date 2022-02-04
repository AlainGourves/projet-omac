import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../contexts/Auth';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AlertMesg from '../../Utils/AlertMesg/AlertMesg';
import { Eye, EyeOff } from 'react-feather';
import { supabase } from '../../../supabaseClient';

const FormConnect = function (props) {

    const [error, setError] = useState(null);

    const [eyeIcon, setEyeIcon] = useState(true); // true -> Eye, false -> EyeOff

    // Get connexion function from the Auth context
    const { signIn } = useAuth();

    const history = useHistory();

    const schema = yup.object().shape({
        email: yup.string().email("Vérifier l'adresse mail, elle ne semble pas correcte.").required("Merci de renseigner votre adresse mail."),
        password: yup.string().required("Merci de saisir votre mot de passe."),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            'email': '',
            'password': '',
        },
        resolver: yupResolver(schema),
    });

    const onSubmit = async (values) => {
        // Get input values
        const email = values.email;
        const password = values.password;
        // Calls signIn function from the context
        const { user, error } = await signIn({ email, password });

        if (error) {
            // console.log("Erreur signIn(): ", error);
            setError("Les informations fournies ne sont pas reconnues, vérifiez votre saisie.");
        } else {
            const getUser = async (user) => {
                try {
                    const { error } = await supabase
                        .from('users')
                        .select()
                        .eq('id', user.id)
                        .single()

                    if (error) {
                        throw error;
                    }
                } catch (error) {
                    console.warn("Erreur getUser: ", error)
                }
            }

            getUser(user);
            history.push('/test');
        }
    }

    const showPassword = () => {
        setEyeIcon(!eyeIcon);
    }

    return (
        <>
            {/* ------- FORMULAIRE CONNECTION -------------- */}
            <div className='login__card login__card-bg mb-4'>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {error &&
                        <AlertMesg message={error} />
                    }
                    <div className="col mb-3">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            {...register("email")}
                            className={`form-control ${error ? 'is-invalid' : ''}`}
                            type="email"
                        />
                        {errors.email &&
                            <AlertMesg message={errors.email?.message} />
                        }
                    </div>

                    <div className="col mb-3">
                        <label className="form-label" htmlFor="password">Mot de passe</label>
                        <div className="input-group">
                            <input
                                {...register("password")}
                                className={`form-control ${error ? 'is-invalid' : ''}`}
                                type={eyeIcon ? "password" : "text"}
                            />
                            <span className="eye input-group-text" onClick={showPassword}>
                                {eyeIcon ? <Eye size={18} /> : <EyeOff size={18} />}
                            </span>
                        </div>
                        {errors.password &&
                            <AlertMesg message={errors.password?.message} />
                        }
                    </div>

                    <div className="login__submit">
                        <button className="btn btn-primary" type="submit">Connexion</button>
                    </div>

                </form>
            </div>

            <div className='login__card'>
                Pas de mot de passe ? <button
                    className='faux-link'
                    onClick={props.changePasswordState}>Cliquez ici</button>.
            </div>
        </>
    )
}

export default FormConnect;