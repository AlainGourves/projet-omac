import './manage-users.scss';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../contexts/Auth';
import { supabase } from '../../../supabaseClient';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff } from 'react-feather';
import AlertMesg from '../../Utils/AlertMesg/AlertMesg';
import { generatePassword } from '../../Utils/helperFunctions';
import UsersTable from '../UsersTable/UsersTable';

const ManageUsers = function () {

    const [eyeIcon, setEyeIcon] = useState(true); // true -> Eye, false -> EyeOff

    // Get connexion function from the Auth context
    const { signUp } = useAuth();

    // Récupère les infos de `public.users`
    const [loadingResults, setLoadingResults] = useState(false); // Bool pour afficher le spinner pendant le chargement des données
    const [usersList, setUsersList] = useState([]);
    useEffect(() => {
        const getUsers = async () => {
            try {
                setLoadingResults(true);
                const { data, error } = await supabase
                    .from('users')
                    .select('id, email, is_admin');
                if (error) {
                    throw new Error(error.message);
                }
                if (data) {
                    setLoadingResults(false);
                    setUsersList(data);
                }
            } catch (error) {
                console.warn("Failed to fetch all users:", error);
            }
        }

        getUsers();
    }, []);

    const schema = yup.object().shape({
        userStatus: yup.string().required("Merci de choisr un statut pour l'utilisateur."),
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
            'userStatus': 'admin',
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
        console.log("submit", values)
        // Get input values
        const firstName = values.firstName;
        const lastName = values.lastName;
        const email = values.email;
        const password = values.password;
        const is_admin = (values.userStatus === 'admin');

        try {
            const { user, error } = await signUp({ email, password });
            if (error) {
                throw new Error(error.message);
            };
            if (user) {
                // Enregistrement dans `public.users`
                // récupère l'id généré dans `auth.users`
                // le mot de passe n'est stocké en clair que pour les comptes 'visiteurs' (sécurité !) pour pouvoir le rappeler dans EditTest
                const thePassword = (is_admin) ? null : password;
                const userData = {
                    id: user.id,
                    email: user.email,
                    prenom: firstName,
                    nom: lastName,
                    is_admin,
                    password: thePassword
                }
                const { error } = await supabase.from('users').insert([userData])
                if (error) {
                    throw new Error(error.message);
                } else {
                    // TODO: Si c'est un compte visiteur qui vient d'être crée, rediriger sur la page d'accueil (un visiteur n'a pas accès à /admin)
                    // RàZ du formulaire
                    reset();
                    console.log("Succès !")
                }
            }
        } catch (error) {
            // traitement de l'erreur
            // TODO: if (error.message === 'User already registered')
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
            <h1 className='mb-5'>Gestion des utilisateurs</h1>

            <h2 className='mb-3'>Ajouter un utilisateur</h2>
            <p>Une fois le nouveau compte créé, <strong>vous êtes automatiquement reconnecté au site avec celui-ci</strong>. <br />
            En cas d'échec, veus êtes aussi déconnecté du site, et renvoyé vers la page d'accueil.</p>
            <div className='d-flex justify-content-center mb-5'>
                <form onSubmit={handleSubmit(onSubmit, onError)} className='form_add_admin'>

                    <div className="d-flex flex-column flex-lg-row mb-3 status_radio">
                        <div className='user_label'>Statut</div>
                        <div className="form-check">
                            <label className='form-check-label'>
                                <input
                                    {...register('userStatus', { required: true })}
                                    value='admin'
                                    type='radio'
                                    className='form-check-input'
                                />Admin</label>
                        </div>
                        <div className="form-check">
                            <label className='form-check-label'>
                                <input
                                    {...register('userStatus', { required: true })}
                                    value='visitor'
                                    type='radio'
                                    className='form-check-input'
                                />Visiteur</label>
                        </div>
                        {errors.userStatus &&
                            <div className='flex-nowrap'>
                                <AlertMesg message={errors.userStatus?.message} />
                            </div>
                        }
                    </div>

                    <div className="row flex-column flex-lg-row gx-2">
                        <div className="col">
                            <label className="form-label user_label" htmlFor="firstName">Prénom</label>
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
                            <label className="form-label user_label" htmlFor="lastName">Nom</label>
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
                        <label className="form-label user_label" htmlFor="email">Email</label>
                        <input
                            {...register("email")}
                            className="form-control"
                            type="email"
                        />
                        {errors.email &&
                            <AlertMesg message={errors.email?.message} />
                        }
                    </div>

                    <div className="row flex-column flex-lg-row align-items-end mb-3 gx-2">
                        <div className="col">
                            <label className="form-label user_label" htmlFor="password">Mot de passe</label>
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
                            <label className="form-label user_label" htmlFor="confPassword">Confirmer le mot de passe</label>
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

                    <div className="d-flex flex-column flex-lg-row justify-content-between">
                        <button type="button"
                            className="btn btn-outline-secondary mb-2"
                            onClick={setNewPassword}
                        >
                            Générer un mot de passe</button>
                        <div className='d-flex justify-content-center justify-content-lg-end'>
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

            <h2 className='mb-3'>Utilisateurs enregistrés</h2>
            {(loadingResults) ? (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            ) : (
                <div className='row justify-content-around mb-3'>
                    <div className='col-10 col-lg-5 mb-3'>
                        <UsersTable
                            usersList={usersList}
                            userAdmin={true}
                        />
                    </div>
                    <div className='col-10 col-lg-5 mb-3'>
                        <UsersTable
                            usersList={usersList}
                            userAdmin={false}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default ManageUsers;