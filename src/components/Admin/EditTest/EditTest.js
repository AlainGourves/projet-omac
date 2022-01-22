import './edit-test.scss';
import { supabase } from '../../../supabaseClient';
import { useState, useEffect } from 'react';
import { NavLink, useParams, Redirect } from 'react-router-dom';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import QuizList from '../QuizList/QuizList';
import QuizDropZone from '../QuizDropZone/QuizDropZone';
import Verbatim from '../Verbatim/Verbatim';
import { ArrowLeft } from 'react-feather';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AlertMesg from '../../Utils/AlertMesg/AlertMesg';

function EditTest({ allQuizs }) {
    // params : `id` -> si c'est une modification
    // `duplicate` -> copie d'un test
    let { id, duplicate } = useParams();
    const [testId, setTestId] = useState(0);
    const [testName, setTestName] = useState('');
    // Pour rediriger sur /admin après enregistrement dans la base
    const [redirect, setRedirect] = useState(null);

    // Gestion du formulaire -------------------------------------------------
    const cleanEmailsList = (val) => {
        if (typeof val === 'string') {
            // Nettoie le texte en entrée pour renvoyer un array d'adresses mail uniques
            val = val.replace(/,|;/g, ' ').replace(/\s+/g, ' ');
            const mySet = new Set(val.split(' ')); // création d'un Set (pour supprimer les doublons)
            return [...mySet].sort(); // retourn un array
        }
    }

    const schema = yup.object().shape({
        name: yup.string().required("Merci de donner un nom au test."),
        homeTitle: yup.string().required("Merci de saisir le titre du test."),
        homeDescription: yup.string().required("Merci de saisir les consignes du test."),
        verbatim: yup.array().of(yup.object().shape({
            val: yup.string()
        })),
        greetings: yup.string().required("Merci de renseigner le texte de remerciement."),
        emailsList: yup.array().of(yup.string().email(({ value }) => value)),
    })
    const methods = useForm({
        defaultValues: {
            name: '',
            homeTitle: '',
            homeDescription: '',
            verbatim: [{ val: '' }],
            greetings: '',
            emailsList: '',
            email: 'lfloch@hotmail.com',
            password: '',
        },
        resolver: yupResolver(schema),
    });
    const { register, setError, formState: { errors }, setValue, getValues, control, reset, watch } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'verbatim',
        shouldUnregister: true,
    });

    const [theQuizs, setTheQuizs] = useState(allQuizs);
    const [usedQuizs, setUsedQuizs] = useState([]);
    const [droppedQuizs, setDroppedQuizs] = useState([]);

    // Récupère les infos du test dans BDD si un ID en paramètre
    useEffect(() => {
        const getTestById = async (action) => {
            try {
                const theId = (action === 'edit') ? id : duplicate;
                let { data } = await supabase
                    .from('tests')
                    .select()
                    .eq('id', theId)
                    .single();
                if (data) {
                    if (action === 'edit') setTestId(data.id);
                    let theTest = {};
                    theTest.name = (action === 'edit') ? data.name : `${data.name} (copie)`;
                    setTestName(theTest.name);
                    theTest.homeTitle = data.home.title;
                    theTest.homeDescription = data.home.description;
                    theTest.verbatim = [];
                    data.verbatim.forEach((v, idx) => {
                        if (v !== '') theTest.verbatim[idx] = { val: v };
                    });
                    if (!theTest.verbatim.length) {
                        // le array est pas vide -> on fait en sorte que ça affiche au moins un champ vide
                        theTest.verbatim = [{ val: '' }];
                    }
                    theTest.greetings = data.greetings;
                    if (data.quizs_ids) {
                        setUsedQuizs(data.quizs_ids);
                    }
                    // Cherche s'il y a des mails pour invitation enregistrés dans `annuaire`
                    try {
                        let { data, error } = await supabase
                            .from('annuaire')
                            .select('email')
                            .eq('test_id', id);
                        if (error) throw new Error(error.message);
                        if (data) {
                            const theList = data.map(m => m.email)
                            theTest.emailsList = theList.join('\n');
                        }
                    } catch (error) {
                        console.warn("Problème pour récupérer la liste d'invités", error);
                    }
                    reset(theTest);
                }
            } catch (error) {
                console.warn("Problème pour récupérer le test id", id, ": ", error);
            }
        }

        if (id) {
            getTestById('edit');
        }
        if (duplicate) {
            getTestById('duplicate');
        }
    }, [id, duplicate, reset]);

    useEffect(() => {
        setDroppedQuizs(usedQuizs);
        setTheQuizs((arr) => arr.map((item) => {
            return {
                id: item.id,
                title: item.title,
                isUsed: (usedQuizs.includes(item.id))
            }
        }));
    }, [usedQuizs]);

    // Récupération de la liste des comptes 'visiteur' -------------------------------------------------
    const [visitorsList, setVisitorsList] = useState([]);
    const [visitorPassword, setVisitorPassword] = useState(null);
    const watchVisitorAccount = watch('visitorAccount');
    useEffect(() => {
        const getVisitors = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, email, password')
                    .eq('is_admin', false);
                if (error) {
                    throw new Error(error.message);
                }
                if (data) {
                    setVisitorsList(data);
                }
            } catch (error) {
                console.warn("Failed to fetch all users:", error);
            }
        }

        getVisitors();
    }, []);

    useEffect(() => {
        if (watchVisitorAccount && Number(watchVisitorAccount) !== 0) {
            const account = visitorsList.find((vis) => vis.id === watchVisitorAccount);
            setVisitorPassword(account.password);
        } else {
            setVisitorPassword(null);
        }
    }, [watchVisitorAccount, visitorsList])

    // Gestion drag&drop -------------------------------------------------
    const removeFromDropped = (id) => {
        setDroppedQuizs(oldValue => oldValue.filter(val => val !== id));
        // Remet isUsed: false pour l'objet correspondant
        setTheQuizs((arr) => {
            const idx = arr.findIndex(obj => obj.id === id);
            if (idx !== -1 && arr[idx].isUsed) {
                const modifiedObj = Object.assign(arr[idx], { 'isUsed': false });
                return [
                    ...arr.slice(0, idx),
                    modifiedObj,
                    ...arr.slice(idx + 1)
                ];
            } else {
                return arr;
            }
        })
    }

    // Appelé quand un quiz est déposé dans la dropzone
    const addToDropped = (id) => {
        // Garder le fonction fléchée, sinon ça ne marche pas !!!!
        // Il faut la fonction fléchée parce que `setDroppedQuizs` utilise la valeur précédente pour la mettre à jour
        setDroppedQuizs(oldValue => [...oldValue, id]);

        setTheQuizs((arr) => {
            // cherche l'index correspondant dans theQuizs
            const idx = arr.findIndex(obj => obj.id === id);
            if (idx !== -1 && !arr[idx].isUsed) {
                // Modifie la propriété `isUsed` à true
                const modifiedObj = Object.assign(arr[idx], { 'isUsed': true });
                return [
                    ...arr.slice(0, idx),
                    modifiedObj,
                    ...arr.slice(idx + 1)
                ];
            } else {
                return arr;
            }
        })
    };

    const saveTest = async function (test, emailsList, fn) {
        try {
            const { data, error } = await supabase
                .from('tests')
                .insert(test);
            if (error) throw new Error(error.message);
            if (data && emailsList.length > 0) {
                // Enregistre la liste d'emails dans `annuaire`
                const id = data[0].id; // id du test créé, `data` est un array
                let arr = [];
                emailsList.forEach(m => arr.push({
                    email: m,
                    test_id: id,
                }));
                await supabase
                    .from('annuaire')
                    .insert(arr, { returning: 'minimal' });
            }
            // fonction à exécuter en cas de succès (redirection)
            fn();
        } catch (error) {
            console.warn("Erreur création du test:", error);
        }
    }

    const updateTest = async function (id, obj, emailsList, fn) {
        try {
            const { data, error } = await supabase
            .from('tests')
            .update(obj)
            .eq('id', id)
            if (error) throw new Error(error.message);
            if (data && emailsList.length > 0) {
                // Commence par supprimer les anciens enregistrements de `annuaire`
                await supabase
                .from('annuaire')
                .delete()
                .match({test_id: id})
                // Enregistre la liste d'emails dans `annuaire`
                let arr = [];
                emailsList.forEach(m => arr.push({
                    email: m,
                    test_id: id,
                }));
                await supabase
                    .from('annuaire')
                    .insert(arr, { returning: 'minimal' });
            }
            // Redirection
            fn();
        } catch (error) {
            console.warn("Erreur update du test:", error);
        }
    }

    const onSubmit = (values) => {
        let name = `${values.name}`;
        let home = {
            'title': `${values.homeTitle}`,
            'description': `${values.homeDescription}`
        }
        // Array des ID de theQuizs dont `isUsed` est true
        let quizs_ids = theQuizs.filter(item => item.isUsed).map(item => item.id);
        // validation : le array doit contenir au moins un item
        if (quizs_ids.length < 1) {
            setError('quizs_ids', {
                type: 'manual',
                message: "Sélectionner au moins un quiz."
            });
            return;
        }
        let verbatim = [];
        if (values.verbatim) {
            values.verbatim.forEach((v, idx) => {
                verbatim.push(v.val)
            })
        }
        let greetings = `${values.greetings}`;
        // liste d'adresses mail
        const emailsList = values.emailsList;
        const result = {
            name,
            // date: (new Date().toISOString()),
            created_at: new Date(),
            home,
            quizs_ids,
            verbatim,
            greetings,
        }
        if (testId) {
            // cas update
            // success -> redirection vers l'accueil admin
            updateTest(testId, result, emailsList, () => setRedirect("/admin"));
        } else {
            // cas nouveau test
            saveTest(result, emailsList, () => setRedirect("/admin"));
        }
    }

    // Gestion des verbatim
    const addVerbatim = () => append({ val: '' })
    const removeVerbatim = (idx) => {
        if (fields.length > 1) {
            remove(idx)
        } else {
            // vide le dernier champ restant
            setValue('verbatim.0.val', '');
        }
    };

    const sendMagicLink = async () => {
        let { user, error } = await supabase.auth.signIn({
            email: 'alain.gourves@gmail.com'
        });
        if (error) console.warn(error.message);
        if (user) {
            console.log("user:", user)
        }
    }

    // console.log("errors", errors)
    // console.log("error message", errors?.emailsList?.pop()?.message)

    if (redirect) {
        return <Redirect to={redirect} />
    }
    return (
        <section>
            <h1>{testId ? "Modifier le" : "Créer un"} test {(testId !== 0) && <em>{testName}</em>}</h1>
            <FormProvider {...methods} >
                {/* pass all methods into the context */}
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <article>
                        <h2>
                            <span className="badge rounded-pill bg-primary">1</span>
                            Nom du test
                        </h2>
                        <p>Le nom est une référence interne pour identifier le test, il n'apparaît nulle part dans la partie publique et doit de préférence être unique.</p>
                        <div className="row mb-3">
                            <div className="col-md-4 text-end">Nom :</div>
                            <div className="col-md-7">
                                <input
                                    {...register("name", { required: true })}
                                    type="text"
                                    placeholder="Nom du test"
                                    className="form-control"
                                />
                                {errors.name &&
                                    <AlertMesg message={errors.name?.message} />
                                }
                            </div>
                        </div>
                    </article>
                    <article>
                        <h2>
                            <span className="badge rounded-pill bg-primary">2</span>
                            Écran d'accueil
                        </h2>
                        <div className="row mb-3">
                            <div className="col-md-4 text-end">Titre :</div>
                            <div className="col-md-7">
                                <input
                                    {...register("homeTitle", { required: true })}
                                    type="text"
                                    placeholder="Titre de l'écran d'accueil"
                                    className="form-control"
                                />
                                {errors.homeTitle &&
                                    <AlertMesg message={errors.homeTitle?.message} />
                                }
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-4 text-end">Consigne :</div>
                            <div className="col-md-7">
                                <textarea
                                    {...register("homeDescription", { required: true })}
                                    className="form-control"
                                    placeholder="Consigne pour l'écran d'accueil"
                                />
                                {errors.homeDescription &&
                                    <AlertMesg message={errors.homeDescription?.message} />
                                }
                            </div>
                        </div>
                    </article>
                    <article>
                        <DndProvider backend={HTML5Backend}>
                            <h2>
                                <span className="badge rounded-pill bg-primary">3</span>
                                Sélection des quizs du test
                            </h2>
                            <div className="row mb-3">
                                <p>Cliquez-glissez chaque quiz sélectionné dans cette zone.<br />
                                    Les quizs s'enchaîneront au cours du test en suivant l'ordre de la liste.</p>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-5 ul-quizs">
                                    <QuizDropZone
                                        quizs={theQuizs}
                                        droppedQuizs={droppedQuizs}
                                        addToDropped={addToDropped}
                                        removeFromDropped={removeFromDropped}
                                    />
                                    {errors.quizs_ids &&
                                        <AlertMesg message={errors.quizs_ids?.message} />
                                    }
                                </div>
                                <div className="col-md-1 arrow">
                                    <ArrowLeft className="fs-1 text-primary" />
                                </div>
                                <div className="col-md-5 ul-quizs">
                                    <QuizList
                                        quizs={theQuizs}
                                    />
                                </div>
                            </div>
                        </DndProvider>
                    </article>
                    <article>
                        <h2>
                            <span className="badge rounded-pill bg-primary">4</span>
                            Verbatim
                        </h2>
                        <p>Saisir le(s) texte(s) qui apparaitra(ont) au-dessus d'une zone de texte à remplir par le cobaye à la fin du test. <br />Ce champ n'est pas obligatoire.</p>
                        {
                            fields.map((item, index) => (
                                <div key={item.id} className="d-flex mb-3">
                                    <Verbatim
                                        count={index}
                                        isLast={(index === (fields.length - 1))}
                                        addVerbatim={addVerbatim}
                                        removeVerbatim={removeVerbatim}
                                    />
                                </div>
                            ))
                        }
                    </article>
                    <article>
                        <h2>
                            <span className="badge rounded-pill bg-primary">5</span>
                            Remerciements/Écran de fin
                        </h2>
                        <div className="row mb-3">
                            <div className="input-group">
                                <span className="input-group-text text-end">Texte :</span>
                                <textarea
                                    {...register("greetings", { required: true })}
                                    className="form-control"
                                />
                            </div>
                            {errors.greetings &&
                                <AlertMesg message={errors.greetings?.message} />
                            }
                        </div>
                    </article>
                    <article>
                        <h2>
                            <span className="badge rounded-pill bg-primary">6</span>
                            Accès au test
                        </h2>
                        <div className="row mb-3">
                            <p>TODO: Explications</p>
                        </div>
                        <div className="row mb-3">
                            <div className="col col-5">
                                <p>Adresses mail pour les invitations.</p>
                                <textarea
                                    {...register("emailsList", {
                                        // nettoie l'entrée avant validation
                                        setValueAs: v => cleanEmailsList(v),
                                    })}
                                    className="form-control"
                                    rows="10"
                                />
                                <div className="d-flex justify-content-end mt-1">
                                    <button type="button"
                                        className="btn btn-outline-secondary btn-sm me-1"
                                        onClick={() => setValue('emailsList', '')}
                                    >
                                        Vider</button>

                                    <button type="button"
                                        className="btn btn-outline-secondary btn-sm me-1"
                                        onClick={() => {
                                            setValue('emailsList', getValues('emailsList').sort().join('\n'));
                                        }}
                                    >
                                        Nettoyage</button>

                                    <button type="button"
                                        className="btn btn-outline-secondary btn-sm me-1"
                                        onClick={sendMagicLink}
                                    >
                                        Magic Link</button>

                                </div>
                                {errors.emailsList &&
                                    <AlertMesg message={errors.emailsList?.map((m, idx) => (<div key={idx}><strong>{m.message}</strong> n'est pas une adresse valide.</div>))} />
                                }
                            </div>
                            <div className='col col-2 display-6 text-center text-primary'>ET / OU</div>
                            <div className="col col-5">
                                <p>Utiliser un compte "visiteur"</p>
                                <p>Dans ce cas, les personnes qui accèdent au site seront dirigés vers le test actuellement actif.</p>
                                <p>Sélectionner le compte visiteur (l'idée est d'avoir plusieurs comptes visiteur pour pouvoir les associer à des tests, et d'avoir pus de possibilités qu'avec le seul test actif)</p>

                                <div className='input-group'>
                                    <label className='input-group-text w-100'>Sélectionner un compte:
                                        <select
                                            className="form-select"
                                            {...register('visitorAccount')}
                                        // onChange={selectVisitorAccount}
                                        >
                                            <option value="0" >Sélectionner...</option>
                                            {visitorsList.map(({ id, email }) => (
                                                <option
                                                    key={id}
                                                    value={id}
                                                    className=""
                                                >{email}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                {
                                    visitorPassword &&
                                    <p>Rappel du mot de passe : <strong>{visitorPassword}</strong></p>
                                }
                            </div>
                        </div>
                    </article>
                    <div className="d-flex justify-content-end pb-3">
                        <NavLink to="/admin">
                            <button
                                type="button"
                                className="btn btn-outline-primary me-2"
                            >Annuler</button>
                        </NavLink>
                        <input
                            type="submit"
                            className="btn btn-primary"
                            value="Enregistrer"
                        />
                    </div>
                </form>
            </FormProvider>
        </section >
    )
}

export default EditTest;