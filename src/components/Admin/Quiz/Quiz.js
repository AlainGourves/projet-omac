import './quiz.scss';
import { supabase } from '../../../supabaseClient';
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
            'is_alpha': false,
            'is_trash': false,
            'trash_text': "Met dans la corbeille quand tu ne sais pas.",
            'itemsList': []
        }
    });

    useEffect(() => {
        const getQuizById = async () => {
            try {
                const { data } = await supabase
                    .from('quizs')
                    .select()
                    .eq('id', id)
                    .single();
                if (data) {
                    setQuizId(data.id);
                    setValue('quizTitle', data.title);
                    setValue('quizDescription', data.description);
                    // Pour passer du array aux lignes du textarea :
                    const reducer = (prev, curr) => {
                        if (curr.label !== prev) {
                            return `${prev}\n${curr.label}`;
                        } else {
                            return prev
                        }
                    }
                    const quizItems = data.items.reduce(reducer, data.items[0].label);
                    setValue('itemsList', quizItems.trim());
                    setValue('is_alpha', Boolean(data.is_alpha));
                    setValue('is_trash', Boolean(data.is_trash));
                    if (data.is_trash) {
                        setValue('trash_text', data.trash_text);
                    }
                }
            } catch (error) {
                console.warn(error)
            }
        }
        if (id) {
            getQuizById();
        }
    }, [id, setValue]);

    const watchTrash = watch("is_trash");
    const watchTitle = watch('quizTitle');

    const saveQuiz = async function (quiz, fn) {
        try {
            await supabase
                .from('quizs')
                .insert(quiz, { returning: 'minimal' })
            // fonction à exécuter en cas de succès (redirection)
            fn();
        } catch (error) {
            console.error("Erreur update du quiz:", error);
        }
    }

    const updateQuiz = async function (id, obj, fn) {
        try {
            await supabase
                .from('quizs')
                .update(obj, { returning: 'minimal' })
                .eq('id', id)
            fn();
        } catch (error) {
            console.error("Erreur update du quiz:", error);
        }
    }

    const onSubmit = (values) => {
        let quizTitle = `${values.quizTitle}`;
        let quizDescription = `${values.quizDescription}`;
        let is_alpha = Boolean(values.is_alpha);
        let is_trash = Boolean(values.is_trash);
        let trash_text = (is_trash) ? `${values.trash_text}` : '';
        const result = {
            title: quizTitle,
            description: quizDescription,
            is_alpha,
            is_trash,
            trash_text,
            items: []
        };
        let items = values.itemsList.trim().split('\n').sort();
        items.forEach((val, idx) => {
            result.items.push({ 'id': idx, 'label': val });
        })
        if (quizId) {
            // Update d'un quiz existant
            updateQuiz(quizId, result, () => setRedirect("/admin"));
            // success -> redirection vers l'accueil admin

        } else {
            // Nouveau quiz
            saveQuiz(result, () => setRedirect("/admin"));

        }
    }

    const onError = (errors, e) => {
        console.log(errors, e);
    }

    const sorlList = () => {
        let items = getValues('itemsList');
        items = items
            .split('\n')
            .filter(item => item.trim()) // remove empty elements
            .sort()
            .join('\n');
        setValue('itemsList', items)
    }

    const capitalizeList = () => {
        let items = getValues('itemsList');
        items = items
            .split('\n')
            .filter(item => item.trim()) // remove empty elements
            .map(([initial, ...rest]) => [initial.toUpperCase(), ...rest].join('')) // Capitalize
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
                                onClick={capitalizeList}
                            >
                                Capitalize</button>
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
                                <input type='radio' {...register("is_alpha", { required: true })} value='1' className="form-check-input" checked={Boolean('is_alpha')} />
                                Alphabétique</label>
                            <label className="form-label d-block">
                                <input type='radio' {...register("is_alpha", { required: true })} value='0' className="form-check-input" checked={Boolean('is_alpha')} />
                                Aléatoire</label>
                        </div>

                        <div role="group">
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" role="switch" {...register("is_trash")} />
                                <label className="form-check-label" htmlFor="is_trash">Corbeille</label>
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="trash_text">Texte pour la corbeille :</label>
                                <textarea {
                                    ...register("trash_text", { disabled: !watchTrash })}
                                    placeholder={watchTrash ? "Par ex. : \"Met dans la corbeille quand tu ne sais pas.\"" : undefined}
                                    className="form-control"
                                />
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