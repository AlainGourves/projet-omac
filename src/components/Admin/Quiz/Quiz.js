import './quiz.scss';
import { supabase } from '../../../supabaseClient';
import { useState, useEffect } from 'react';
import { NavLink, useParams, Redirect } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AlertMesg from '../../Utils/AlertMesg/AlertMesg';

function Quiz(props) {
    // id passé en param, si c'est une modification
    let { id } = useParams();
    const [quizId, setQuizId] = useState(0);
    // Pour rediriger sur /admin après enregistrement dans la base
    const [redirect, setRedirect] = useState(null);

    // Pour la validation du formulaire
    const schema = yup.object().shape({
        quizTitle: yup.string().required("Merci de donner un titre au quiz."),
        quizDescription: yup.string().required("Merci de donner les consignes du quiz."),
        itemsList: yup.string().required("Merci de fournir les items du quiz."),
        is_alpha: yup.boolean(),
        is_trash: yup.boolean(),
        trash_text: yup.string().when('is_trash', {
            is: true,
            then: yup.string().required("S'il y a une corbeille, fournir un texte d'explication de son usage.")
        })
    });

    const { register, handleSubmit, setError, formState: { errors }, getValues, setValue, watch } = useForm({
        defaultValues: {
            'quizTitle': '',
            'quizDescription': '',
            'is_alpha': false,
            'is_trash': false,
            'trash_text': "Met dans la corbeille quand tu ne sais pas.",
            'itemsList': ''
        },
        resolver: yupResolver(schema),
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
            items: [],
            modified_at: new Date(),
        };
        let items = values.itemsList.trim().split('\n').sort();
        items.forEach((val, idx) => {
            result.items.push({ 'id': idx, 'label': val });
        })
        // Vérifier que items.length > 1
        if (!items.length > 1) {
            setError('itemsList', {
                type: 'manual',
                message: "Il n'y a qu'un item dans la liste."
            }, { shouldFocus: true })
            return;
        }
        // Vérifier qu'il n'y a pas de doublon
        if (items.length !== [...new Set(items)].length) {
            // `Set` stocke des valeurs uniques (https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Set)
            setError('itemsList', {
                type: 'manual',
                message: "La liste contient des doublons."
            }, { shouldFocus: true })
            return;
        }
        if (quizId) {
            // Update d'un quiz existant
            // success -> redirection vers l'accueil admin
            updateQuiz(quizId, result, () => setRedirect("/admin"));
        } else {
            // Nouveau quiz
            saveQuiz(result, () => setRedirect("/admin"));
        }
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

    if (redirect) {
        return <Redirect to={redirect} />
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
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
                        {errors.quizTitle &&
                            <AlertMesg message={errors.quizTitle?.message} />
                        }
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
                        {errors.quizDescription &&
                            <AlertMesg message={errors.quizDescription?.message} />
                        }
                    </div>
                </div>

                <h3>Liste</h3>
                <div className="row">
                    <div className="col col-7">
                        <p>Un item par ligne.<br />
                            L'ordre de saisie ne compte pas, la liste est stockée par ordre alphabétique et l'affichage final se fait en fonction du choix ci-contre.</p>
                        <textarea
                            {...register("itemsList", { required: true })}
                            className="form-control"
                            rows="10"
                        />
                        {errors.itemsList &&
                            <AlertMesg message={errors.itemsList?.message} />
                        }
                        <div className="d-flex justify-content-end mt-1">
                            <button type="button"
                                className="btn btn-outline-secondary btn-sm me-1"
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
                                {errors.trash_text &&
                                    <AlertMesg message={errors.trash_text?.message} />
                                }
                            </div>
                            <div className="alert alert-warning">
                                Voir si cette histoire de corbeille peut être utile. De toute façon, c'est désactivé par défaut.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end mb-5">
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