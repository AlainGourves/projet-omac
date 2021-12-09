import './edit-test.scss';
// import db from '../../DB';
import { useState, useEffect } from 'react';
import { NavLink, useParams, Redirect } from 'react-router-dom';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import QuizList from '../QuizList/QuizList';
import QuizDropZone from '../QuizDropZone/QuizDropZone';
import Verbatim from '../Verbatim/Verbatim';


function EditTest(props) {
    // id passé en param, si c'est une modification
    let { id } = useParams();
    const [testId, setTestId] = useState(0);
    // Pour rediriger sur /admin après enregistrement dans la base
    const [redirect, setRedirect] = useState(null);
    // Gestion du formulaire
    const methods = useForm({
        defaultValues: {
            name: '',
            homeTitle: '',
            homeDescription: '',
            verbatim: [{ val: '' }],
            greetings: '',
        }
    });
    const { register, setValue, control, reset } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'verbatim',
        shouldUnregister: true,
    });

    // Gestion drag&drop
    const [sourceItems, setSourceItems] = useState([]);
    const [draggedItems, setDraggedItems] = useState([]);

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

    // useEffect(() => {
    //     // Récupère tous les quizs, classés du plus récent au plus ancien
    //     const getAllQuizs = async () => {
    //         const allQuizs = await db.quizs.orderBy('date').reverse().toArray();
    //         // créé une copie du array et
    //         // ajoute une propriété isDragged (false par défaut)
    //         const draggableQuizs = allQuizs.map((q) => {
    //             return { 'isUsed': false, ...q }
    //         });
    //         setSourceItems(draggableQuizs)
    //     }
    //     getAllQuizs();
    // }, []);

    // useEffect(() => {
    //     console.log('>>>>', verbatimList)
    // }, [verbatimList]);

    const updateSourceItems = (draggedId) => {
        setSourceItems((arr) => {
            const idx = arr.findIndex(obj => obj.id === draggedId);
            if (idx !== -1 && !arr[idx].isUsed) {
                const modifiedObj = Object.assign(arr[idx], { 'isUsed': true });
                // update draggedItems
                setDraggedItems(draggedItems => [...draggedItems, modifiedObj])
                const newArr = [
                    ...arr.slice(0, idx),
                    modifiedObj,
                    ...arr.slice(idx + 1)
                ]
                return newArr;
            } else {
                return arr;
            }
        })
    }

    const updateDraggedItems = (theId) => {
        // Enlève le quiz dont id=theId de draggedItems
        setDraggedItems((arr) => arr.filter((obj) => obj.id !== theId))
        // Dans sourceItems, met isUsed: flase pour l'objet correspondant
        setSourceItems((arr) => {
            const idx = arr.findIndex(obj => obj.id === theId);
            if (idx !== -1 && arr[idx].isUsed) {
                const modifiedObj = Object.assign(arr[idx], { 'isUsed': false });
                const newArr = [
                    ...arr.slice(0, idx),
                    modifiedObj,
                    ...arr.slice(idx + 1)
                ]
                return newArr;
            } else {
                return arr;
            }
        })
    }

    // useEffect(() => {
    //     // Si un ID de test est passé en paramètre dans l'URL, récupère les infos dans DB
    //     const getTestById = async () => {
    //         const test = await db.tests.get(parseInt(id))
    //             .catch(e => console.warn("erreur db", e));
    //         if (test) {
    //             setTestId(test.id);
    //             let data = {};
    //             data.name = test.name;
    //             data.homeTitle = test.home.title;
    //             data.homeDescription = test.home.description;
    //             data.verbatim = [];
    //             test.verbatim.forEach((v, idx) => {
    //                 if (v !== '') data.verbatim[idx] = { val: v };
    //             });
    //             data.greetings = test.greetings;
    //             reset(data)
    //             if (test.quizsIds) {
    //                 const quizsIds = test.quizsIds;
    //                 quizsIds.forEach((theId) => updateSourceItems(theId))
    //             }
    //         }
    //     }
    //     if (id) {
    //         getTestById();
    //     }
    // }, [id, sourceItems, reset]);
    // sourceItems -> pour que les quizs utlisés soient chargés en cas de modif

    const saveTest = async function (test) {
        // await db.tests.add(test);
        // TODO .catch(e => )
    }

    const updateTest = async function (id, obj) {
        // await db.tests.update(id, obj);
        // TODO .catch(e => )
    }

    const onSubmit = (values) => {
        let name = `${values.name}`;
        let home = {
            'title': `${values.homeTitle}`,
            'description': `${values.homeDescription}`
        }
        let quizsIds = draggedItems.map(item => item.id);
        let verbatim = [];
        if (values.verbatim) {
            values.verbatim.forEach((v, idx) => {
                verbatim.push(v.val)
            })
        }
        let greetings = `${values.greetings}`;
        const result = {
            name,
            date: Date.now(),
            home,
            quizsIds,
            verbatim,
            greetings,
        }
        if (testId) {
            // cas update
            updateTest(testId, result);
            // success -> redirection vers l'accueil admin
            setRedirect("/admin")
        } else {
            // cas nouveau test
            saveTest(result);
            setRedirect("/admin")
        }
    }

    const onError = (errors, e) => {
        console.log("Erreur:", errors, e);
    }

    if (redirect) {
        return <Redirect to={redirect} />
    }
    return (
        <section>
            <h1>{testId ? "Modifier le" : "Créer un"} test {testId ? `${testId}` : ''}</h1>
            <FormProvider {...methods} >
                {/* pass all methods into the context */}
                <form onSubmit={methods.handleSubmit(onSubmit, onError)}>
                    <article>
                        <h2>
                            <span className="badge rounded-pill bg-primary">1</span>
                            Nom du test
                        </h2>
                        <div className="row mb-3">
                            <div className="col-md-4 text-end">Nom :</div>
                            <div className="col-md-7">
                                <input
                                    {...register("name", { required: true })}
                                    type="text"
                                    placeholder="Nom du test"
                                    className="form-control"
                                />
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
                                <p>Cliquez-glissez chaque quiz sélectionné dans cette zone. Vous pouvez réordonner les quizs en les déplaçant.<br />
                                    Les quizs s'enchaîneront au cours du test en suivant l'ordre de cette liste.</p>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-5 ul-quizs">
                                    <QuizDropZone
                                        items={draggedItems}
                                        updateSourceItems={updateSourceItems}
                                        updateDraggedItems={updateDraggedItems}
                                    />
                                </div>
                                <div className="col-md-1 arrow">
                                    <span className="material-icons fs-1 text-primary">
                                        arrow_back
                                    </span>
                                </div>
                                <div className="col-md-5 ul-quizs">
                                    <QuizList items={sourceItems.filter((q) => !q.isUsed)} />
                                </div>
                            </div>
                        </DndProvider>
                    </article>
                    <article>
                        <h2>
                            <span className="badge rounded-pill bg-primary">4</span>
                            Verbatim
                        </h2>
                        <p>Saisir le(s) texte(s) qui apparaitra(ont) au-dessus d'une zone de texte à remplir par le cobaye à la fin du test.</p>
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
        </section>

    )
}

export default EditTest;