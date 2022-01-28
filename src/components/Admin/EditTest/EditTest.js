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
import { ArrowLeft, XCircle } from 'react-feather';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AlertMesg from '../../Utils/AlertMesg/AlertMesg';

function EditTest({ allQuizs }) {
    // params : `id` -> si c'est une modification
    // `duplicate` -> copie d'un test
    let { id, duplicate } = useParams();
    const [testId, setTestId] = useState(0);
    const [testName, setTestName] = useState('');
    // Pour gérer le compte visiteur éventuellement associé au test
    const [visitorAccount, setVisitorAccount] = useState('');
    const [visitorPassword, setVisitorPassword] = useState('');
    // liste des comptes visiteur
    const [visitorsList, setVisitorsList] = useState([]);
    // pour savoir s'il y avait une liste d'adresses mail d'invitation au chargment du test (en cas d'edit)

    // Pour rediriger sur /admin après enregistrement dans la base
    const [redirect, setRedirect] = useState(null);

    // Gestion du formulaire -------------------------------------------------
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
            selectVisitorAccount: '0',
        },
        resolver: yupResolver(schema),
    });
    const { register, setError, formState: { errors }, setValue, getValues, control, reset, watch } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'verbatim',
        shouldUnregister: true,
    });

    const watchVisitor = watch('selectVisitorAccount');

    const cleanEmailsList = (val) => {
        if (typeof val === 'string') {
            // Nettoie le texte en entrée pour renvoyer un array d'adresses mail uniques
            val = val.replace(/,|;/g, ' ').replace(/\s+/g, ' ');
            let arr = val.split(' ').filter(item => item); // enlève les chaînes vides ('' est évalué à false)
            let mySet = new Set(arr); // création d'un Set pour supprimer les doublons
            return [...mySet].sort(); // retourne un array
        }
    }

    const removeLinkedAccount = async () => {
        setValue('selectVisitorAccount', 0);
        setVisitorAccount('');
        setVisitorPassword('');
    }


    const [theQuizs, setTheQuizs] = useState(allQuizs);
    const [usedQuizs, setUsedQuizs] = useState([]);
    const [droppedQuizs, setDroppedQuizs] = useState([]);

    // Récupère les infos du test dans BDD si un ID en paramètre
    useEffect(() => {
        const getTestById = async (action) => {
            try {
                const theId = (action === 'edit') ? id : duplicate;
                let { data } = await supabase
                    .rpc('get_test_by_id', { 'input_id': theId })
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
                    // S'il y a des mails pour invitation enregistrés dans `annuaire`,
                    if (data.invitations > 0) {
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
                    }
                    // Compte visiteur éventuellement lié au test
                    if (data.account_email) {
                        setVisitorAccount(data.account_email);
                        setVisitorPassword(data.account_password);
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
    useEffect(() => {
        const getVisitors = async () => {
            try {
                // requête pour récupérer tous les comptes visiteur encore dispo
                // ainsi que le compte associé au test s'il y en a
                // Structure : id (uuid) | email | password | test_id (int ou null)
                const { data, error } = await supabase
                    .rpc('get_visitor_account_list', { 'testid': testId })
                if (error) {
                    throw new Error(error.message);
                }
                if (data) {
                    setVisitorsList(data);
                }
            } catch (error) {
                console.warn("Failed to fetch visitors' account:", error);
            }
        }

        getVisitors();
    }, [testId]);

    useEffect(() => {
        if (watchVisitor) {
            if (Number(watchVisitor) !== 0) {
                const account = visitorsList.find((vis) => vis.email === watchVisitor);
                setVisitorAccount(account.email);
                setVisitorPassword(account.password);
            } else {
                setVisitorAccount('');
                setVisitorPassword('');
            }
        }
    }, [watchVisitor, visitorsList]);


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
                const id = data[0].id; // id du test créé, `data` est un array
                // Enregistre la liste d'emails dans `annuaire`
                await supabase
                    .rpc('upsert_annuaire', { input_id: id, input_emails: emailsList });
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
            if (data) {
                await supabase
                    .rpc('upsert_annuaire', { input_id: id, input_emails: emailsList });
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
            modified_at: new Date(),
            home,
            quizs_ids,
            verbatim,
            greetings,
        }
        // Lien avec un compte visiteur, 3 cas:
        // 1) un compte était déjà lié mais pas de modif => `selectVisitorAccount` n'est pas défini
        // 2) on a supprimé un compte lié => `selectVisitorAccount` est défini, mais string vide
        // 3) on lit un compte => `selectVisitorAccount` est défini et non vide
        if (values.selectVisitorAccount !== undefined) {
            let param = { input_id: testId };
            if (values.selectVisitorAccount !== 0) {
                param = { ...param, input_email: visitorAccount }
            }
            const updateUsers = async (param) => {
                await supabase.rpc('set_linked_test', param);
            }
            updateUsers(param);
        }

        // Update de la table 'tests'
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
                            Gestion des utilisateurs pour l'accès au test
                        </h2>
                        <div className="row mb-3">
                            <p>Il y a deux techniques pour que les gens accèdent aux test :</p>
                            <ul className='mx-3'>
                                <li>Ils reçoivent une <strong>invitation par mail</strong> à leur adresse personnelle (le mail contient un lien qui autorise une connection automatique sans nécessiter de mot de passe).</li>
                                <li>On leur fournit les identifiants d'un <strong>compte "Visiteur"</strong> pour se connecter (utile s'il n'est pas possible de récupérer toutes les adresses email du public ciblé).</li>
                            </ul>
                        </div>
                        <div className="row mb-3">
                            <div className="col col-5">
                                <h3>Invitations par mail</h3>
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

                                </div>
                                {errors.emailsList &&
                                    <AlertMesg message={errors.emailsList?.map((m, idx) => (<div key={idx}><strong>{m.message}</strong> n'est pas une adresse valide.</div>))} />
                                }
                            </div>
                            <div className='col col-2 display-6 text-center text-primary'>ET / OU</div>
                            <div className="col col-5">
                                <h3>Utiliser un compte "visiteur"</h3>
                                {visitorAccount ?
                                    (
                                        <div className='rounded-1 border border-gray-400 p-3'>
                                            <div className='row align-items-center'>
                                                <div className='col-5 text-end'>Compte lié :</div>
                                                <div className='col-7 d-flex justify-content-between align-items-center'>
                                                    <span><em>{visitorAccount}</em></span>
                                                    <button
                                                        onClick={removeLinkedAccount}
                                                        className='btn btn-sm text-primary'
                                                        title='Supprimer le lien'
                                                        type="button">
                                                        <XCircle />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className='row align-items-center'>
                                                <div className='col-5 text-end'>Mot de passe :</div>
                                                <div className='col-7'><em>{visitorPassword}</em></div>
                                            </div>
                                        </div>
                                    ) : (
                                        (visitorsList.length > 0) ? (
                                            <div className='rounded-1 border border-gray-400 p-3'>
                                                <div className='d-flex justify-content-between align-items-center'>
                                                    <label>Compte <strong>Visiteur</strong></label>
                                                    <select
                                                        className="form-select"
                                                        {...register('selectVisitorAccount')}
                                                    >
                                                        <option value="0">Sélectionner...</option>
                                                        {visitorsList.map(({ email }) => (
                                                            <option
                                                                key={email}
                                                                value={email}
                                                                className=""
                                                            >{email}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='alert alert-warning'>
                                                <strong>Il ne reste plus de compte visiteur disponible.</strong><br />
                                                Vous pouvez en créer de nouveaux dans l'onglet <NavLink to="/admin/manage-users">Utilisateurs</NavLink>, ou désassocier un ancien test de son compte.
                                            </div>
                                        )
                                    )
                                }
                            </div>
                        </div>
                    </article>
                    <div className="d-flex justify-content-end mb-5">
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