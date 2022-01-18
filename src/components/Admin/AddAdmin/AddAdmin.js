import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../contexts/Auth';
import { supabase } from '../../../supabaseClient';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff } from 'react-feather';
import AlertMesg from '../../Utils/AlertMesg/AlertMesg';
import { generatePassword } from '../../Utils/helperFunctions';

const AddAdmin = function () {

    const [eyeIcon, setEyeIcon] = useState(true); // true -> Eye, false -> EyeOff

    // Get connexion function from the Auth context
    const { signUp } = useAuth();

    const schema = yup.object().shape({
        firstName: yup.string().required("Merci de renseigner votre prénom."),
        lastName: yup.string().required("Merci de renseigner votre nom."),
        email: yup.string().email("Vérifier l'adresse mail, elle ne semble pas correcte.").required("Merci de renseigner votre adresse mail."),
        password: yup.string().min(8, "Le mot de passe doit compter au moins 8 caractères.").required("Merci de choisir un mot de passe."),
        confPassword: yup.string()
            .min(8, "Le mot de passe doit compter au moins 8 caractères.")
            .required("Merci de confirmer votre mot de passe.")
            .equals([yup.ref('password')], "Les deux mots de passe ne sont pas identiques."),
    });

    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
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
        // objet de Yup qui contient les champs fautifs, ex: {confPassword: { message: "[message d'erreur du resolver]", ...}}
        console.log("erreur onSubmit(): ", errors);
    }

    const onSubmit = async (values) => {
        // console.log("submit", values)
        // Get input values
        const firstName = values.firstName;
        const lastName = values.lastName;
        const email = values.email;
        const password = values.password;

        try {
            const { user, error } = await signUp({ email, password });
            if (error) {
                throw new Error(error.message);
            };
            if (user) {
                // Enregistrement dans `public.users`
                // récupèe l'id généré dans `auth.users`
                const userData = {
                    id: user.id,
                    email: user.email,
                    prenom: firstName,
                    nom: lastName,
                    is_admin: true,
                }
                const { error } = await supabase.from('users').insert([userData])
                if (error) {
                    throw new Error(error.message);
                } else {
                    // RàZ du formulaire
                    reset();
                    console.log("Succès !")
                }
            }
        } catch (error) {
            // traitement de l'erreur
            // if (error.message === 'User already registered')
            console.log("Ajout admin: ", error.message);
        }
    }

    const showPassword = () => {
        setEyeIcon(!eyeIcon);
    }

    const setNewPassword = () => {
        const p = generatePassword();
        setValue('password', p);
        setValue('confPassword', p);
    }

    const formReset = () => {
        reset();
    }

    return (
        <>
            <h1 className='mb-5'>Ajouter un administrateur</h1>
            <p>Une fois le nouveau compte créé, vous êtes automatiquement reconnecté au site avec celui-ci. En cas d'échec, veus êtes aussi déconnecté du site, et renvoyé vers la page d'accueil.</p>
            <div className='d-flex justify-content-center'>
                <form onSubmit={handleSubmit(onSubmit, onError)} className='form_add_admin'>
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

                    <div className="row align-items-end mb-3 gy-2">
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

                    <div className="d-flex justify-content-between">
                        <button type="button"
                            className="btn btn-outline-secondary mb-2"
                            onClick={setNewPassword}
                        >
                            Générer un mot de passe</button>
                        <div>
                            <button type="button"
                                className="btn btn-outline-primary mb-2 me-1"
                                onClick={formReset}
                            >
                                Effacer</button>
                            <button
                                className="btn btn-primary mb-2"
                                type="submit">Enregistrer</button>
                        </div>
                    </div>

                </form>
            </div>
        </>
    )
}

export default AddAdmin;