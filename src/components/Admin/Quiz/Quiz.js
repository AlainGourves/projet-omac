import './quiz.scss';
// import db from '../../DB';
import { useState, useEffect } from 'react';
import { NavLink, useParams, Redirect } from 'react-router-dom';
import { useForm } from 'react-hook-form';

function Quiz(props) {
    // id passé en param, si c'est une modification
    let { id } = useParams();
    const [quizId, setQuizId] = useState(0);
    // Pour rediriger sur /admin après enregistrement dans la base
    const [redirect, setRedirect] = useState(null);

    const { register, handleSubmit, formState: { errors }, getValues, setValue, watch } = useForm({
        defaultValues: {
            'quizTitle': '',
            'quizDescription': '',
            'ordering': 'alpha',
            'isTrash': true,
            'trashText': "Met dans la corbeille quand tu ne sais pas.",
            'itemsList': []
        }
    });

    // useEffect(() => {
    //     const getQuizById = async () => {
    //         const quiz = await db.quizs.get(parseInt(id))
    //             .catch(e => console.warn("erreur db", e));
    //         if (quiz) {
    //             setQuizId(quiz.id);
    //             setValue('quizTitle', quiz.title);
    //             setValue('quizDescription', quiz.description);
    //             // Pour passer du array aux ligne du textarea :
    //             const reducer = (prev, curr) => {
    //                 if (curr.label !== prev) {
    //                     return `${prev}\n${curr.label}`;
    //                 } else {
    //                     return prev
    //                 }
    //             }
    //             const quizItems = quiz.items.reduce(reducer, quiz.items[0].label);
    //             setValue('itemsList', quizItems.trim());
    //             setValue('ordering', quiz.ordering);
    //             setValue('isTrash', Boolean(quiz.isTrash));
    //             if (quiz.isTrash) {
    //                 setValue('trashText', quiz.trashText);
    //             }
    //         }
    //     }
    //     if (id) {
    //         getQuizById();
    //     }
    // }, [id, setValue]);

    const watchTrash = watch("isTrash");
    const watchTitle = watch('quizTitle');

    const saveQuiz = async function (quiz) {
        // await db.quizs.add(quiz);
        // TODO catch(e => )
    }

    const updateQuiz = async function (id, obj) {
        // await db.quizs.update(id, obj);
        // TODO catch(e => )
    }

    const onSubmit = (values) => {
        let quizTitle = `${values.quizTitle}`;
        let quizDescription = `${values.quizDescription}`;
        let ordering = `${values.ordering}`;
        let isTrash = Boolean(values.isTrash);
        let trashText = (isTrash) ? `${values.trashText}` : '';
        const result = {
            date: Date.now(),
            title: quizTitle,
            description: quizDescription,
            ordering,
            isTrash,
            trashText,
            items: []
        };
        let items = values.itemsList.trim().split('\n').sort();
        items.forEach((val, idx) => {
            result.items.push({ 'id': idx, 'label': val });
        })
        if (quizId) {
            // Update d'un quiz existant
            updateQuiz(quizId, result);
            // success -> redirection vers l'accueil admin
            setRedirect("/admin")
        } else {
            // Nouveau quiz
            saveQuiz(result);
            setRedirect("/admin")
        }
    }

    const onError = (errors, e) => {
        console.log(errors, e);
    }

    const sorlList = () => {
        let items = getValues('itemsList');
        items = items.trim()
            .split('\n')
            .filter(item => item) // remove empty elements
            .sort()
            .join('\n');
        setValue('itemsList', items)
    }

    // Error component
    const errorMsg = "Le champ est obligatoire.";
    const errorMessage = error => {
        return <div className="error">{error}</div>;
    }

    if (redirect) {
        return <Redirect to={redirect} />
    }
    return (
        <form onSubmit={handleSubmit(onSubmit, onError)}>
            <section className="config-list">
                <h2>
                    {quizId ? `Modifier le quiz "${watchTitle}"` : "Créer un quiz"}
                </h2>

                <div className="row mb-3">
                    <label className="form-label col-md-4 text-end" htmlFor="quizTitle">Titre :</label>
                    <div className="col-md-7">
                        <input type="text"
                            {...register("quizTitle", { required: true })}
                            className="form-control"
                            placeholder="Titre du quiz"
                        />
                        {errors.quizTitle && errorMessage(errorMsg)}
                    </div>
                </div>

                <div className="row mb-3">
                    <label className="form-label col-md-4 text-end" htmlFor="quizDescription">Consigne :</label>
                    <div className="col-md-7">
                        <textarea
                            {...register("quizDescription", { required: true })}
                            className="form-control"
                            placeholder="Consignes pour le quiz"
                        />
                        {errors.quizDescription && errorMessage(errorMsg)}
                    </div>
                </div>

                <h3>Liste</h3>
                <div className="row">
                    <div className="col col-7">
                        <p>Un item par ligne, l'ordre de saisie ne compte pas.</p>
                        <textarea
                            {...register("itemsList", { required: true })}
                            className="form-control"
                            rows="10"
                        />
                        <div className="d-flex justify-content-end">
                            <button type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={sorlList}
                            >
                                Tri alpha</button>
                        </div>
                    </div>

                    <div className="col col-4">
                            <h5>Ordre d'affichage :</h5>
                        <div role="group" className="form-check mb-3 border-bottom">
                            <label className="form-label d-block">
                                <input type='radio' {...register("ordering", { required: true })} value='alpha' className="form-check-input" />
                                Alphabétique</label>
                            <label className="form-label d-block">
                                <input type='radio' {...register("ordering", { required: true })} value='random' className="form-check-input" />
                                Aléatoire</label>
                        </div>

                        <div role="group">
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" role="switch" {...register("isTrash")} />
                                <label className="form-check-label" htmlFor="isTrash">Corbeille</label>
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="trashText">Texte pour la corbeille :</label>
                                <textarea {...register("trashText", {
                                    disabled: !watchTrash
                                })} className="form-control" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end">
                    <NavLink to="/admin">
                        <button
                            type="button"
                            className="btn btn-outline-primary me-2"
                        >Annuler</button>
                    </NavLink>
                    <button
                        type='submit'
                        className="btn btn-primary"
                    >Enregistrer</button>
                </div>
            </section>
        </form>
    );
}

export default Quiz;