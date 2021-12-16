import './edit-test.scss';
import { supabase } from '../../../supabaseClient';
import { useState, useEffect, useCallback } from 'react';
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

function EditTest(props) {
    // id passé en param, si c'est une modification
    let { id } = useParams();
    const [testId, setTestId] = useState(0);
    const [testName, setTestName] = useState('');
    // Pour rediriger sur /admin après enregistrement dans la base
    const [redirect, setRedirect] = useState(null);
    // Gestion du formulaire
    const schema = yup.object().shape({
        name: yup.string().required("Merci de donner un nom au test."),
        homeTitle: yup.string().required("Merci de saisir le titre du test."),
        homeDescription: yup.string().required("Merci de saisir les consignes du test."),
        verbatim: yup.array().of(yup.object().shape({
            val: yup.string()
        })),
        greetings: yup.string().required("Merci de saisir le texte de remerciement."),
    })
    const methods = useForm({
        defaultValues: {
            name: '',
            homeTitle: '',
            homeDescription: '',
            verbatim: [{ val: '' }],
            greetings: '',
        },
        resolver: yupResolver(schema),
    });
    const { register, setError, formState: { errors }, setValue, control, reset } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'verbatim',
        shouldUnregister: true,
    });

    // Gestion drag&drop
    const [allQuizs, setAllQuizs] = useState([]);

    const getAllQuizs = useCallback(async () => {
        // Récupère tous les quizs, classés du plus récent au plus ancien
        try {
            const { data } = await supabase
                .from('quizs')
                .select('id, title')
                .order('created_at', { ascending: false });
            if (data) {
                // Ajoute une propriété isDragged (false par défaut)
                setAllQuizs(data.map((q) => {
                    return { 'isUsed': false, ...q }
                }));
            }
        } catch (error) {
            console.log("Erreur fetch quizs:", error);
        }
    }, [setAllQuizs]);

    useEffect(() => {
        if (allQuizs.length === 0) {
            getAllQuizs();
        }
    }, [allQuizs, getAllQuizs]);

    const removeFromDropped = (id) => {
        // Remet isUsed: false pour l'objet correspondant
        setAllQuizs((arr) => {
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
        setAllQuizs((arr) => {
            // cherche l'index correspondant dans allQuizs
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
    }

    useEffect(() => {
        // Si un ID de test est passé en paramètre dans l'URL, récupère les infos dans DB
        const getTestById = async () => {
            try {
                const { data } = await supabase
                    .from('tests')
                    .select()
                    .eq('id', id)
                    .single();
                if (data) {
                    setTestId(data.id);
                    let theTest = {};
                    theTest.name = data.name;
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
                    reset(theTest)
                    if (data.quizs_ids) {
                        const quizs_ids = data.quizs_ids;
                        setAllQuizs((arr) => arr.map((item) => {
                            return {
                                id: item.id,
                                title: item.title,
                                isUsed: (quizs_ids.includes(item.id))
                            }
                        }));
                    }
                }
            } catch (error) {
                console.warn("Problème pour récupérer le test id", id, ": ", error);
            }
        }

        if (id) {
            getTestById();
        }
    }, [id, reset, setAllQuizs]) //allQuizs, setAllQuizs, reset]);
    // sourceItems -> pour que les quizs utlisés soient chargés en cas de modif

    const saveTest = async function (test, fn) {
        try {
            await supabase
                .from('tests')
                .insert(test, { returning: 'minimal' })
            // fonction à exécuter en cas de succès (redirection)
            fn();
        } catch (error) {
            console.error("Erreur update du test:", error);
        }
    }

    const updateTest = async function (id, obj, fn) {
        try {
            await supabase
                .from('tests')
                .update(obj, { returning: 'minimal' })
                .eq('id', id)
            fn();
        } catch (error) {
            console.error("Erreur update du test:", error);
        }
    }

    const onSubmit = (values) => {
        let name = `${values.name}`;
        let home = {
            'title': `${values.homeTitle}`,
            'description': `${values.homeDescription}`
        }
        // Array des ID de allQuizs dont `isUsed` est true
        let quizs_ids = allQuizs.filter(item => item.isUsed).map(item => item.id);
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
            updateTest(testId, result, () => setRedirect("/admin"));
        } else {
            // cas nouveau test
            saveTest(result, () => setRedirect("/admin"));
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
            <h1>{testId ? "Modifier le" : "Créer un"} test {testId && <em>{testName}</em>}</h1>
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
                                    Les quizs s'enchaîneront au cours du test en suivant l'ordre de cette liste.</p>

                                <div className="alert alert-danger">
                                BUG!! Les quizs enregistrés ne s'affichent pas toujours ci-dessous.
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-5 ul-quizs">
                                <QuizDropZone
                                    quizs={allQuizs}
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
                                    quizs={allQuizs}
                                // items={sourceItems.filter((q) => !q.isUsed)}
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
                        value="Enregistrer" /
                    >
                </div>
            </form>
        </FormProvider>
        </section >
    )
}

export default EditTest;