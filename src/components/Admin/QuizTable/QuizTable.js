import './quiz-table.scss';
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronUp, Edit, Trash } from 'react-feather';

function QuizTable({ importJSON, exportJSON, dateOptions }) {
    const [allQuizs, setAllQuizs] = useState([]);
    const [quizsOrderBy, setQuizsOrderBy] = useState('created_at');
    const [quizsOrderByDateAsc, setQuizsOrderByDateAsc] = useState(false);
    const [quizsOrderByTitleAsc, setQuizsOrderByTitleAsc] = useState(true);

    const orderQuizsByTitle = (ev) => {
        if (quizsOrderBy === 'created_at') {
            setQuizsOrderBy('title');
            return;
        }
        setQuizsOrderByTitleAsc(!quizsOrderByTitleAsc);
    }

    const orderQuizsByDate = (ev) => {
        if (quizsOrderBy === 'title') {
            setQuizsOrderBy('created_at');
            return;
        }
        setQuizsOrderByDateAsc(!quizsOrderByDateAsc)
    }

    // Récupère les infos sur les quizs
    const fetchQuizsList = async () => {
        console.log("fetch")
        try {
            const { data } = await supabase
                .from('quizs')
                .select('id, created_at, title')
                .order(quizsOrderBy, { ascending: (quizsOrderBy === 'title') ? quizsOrderByTitleAsc : quizsOrderByDateAsc });
            if (data) {
                // transforme les strings `created_at` en Date
                data.forEach((d) => {
                    d.created_at = new Date(d.created_at);
                });
                setAllQuizs(data);
            }
        } catch (error) {
            console.log("failed to fetch all quizs:", error);
        }
    }

    useEffect(() => {
        fetchQuizsList();
    }, []);

    // Tri des tests en fonction des états
    useEffect(() => {
        console.log("order:", quizsOrderBy, "date", (quizsOrderByDateAsc ? 'ASC' : 'DESC'), "nom", (quizsOrderByTitleAsc ? 'ASC' : 'DESC'))
        switch (quizsOrderBy) {
            case 'created_at':
                // tri par date
                console.log("par date")
                setAllQuizs(allQuizs.sort((a, b) => {
                    return (quizsOrderByDateAsc) ? a.created_at - b.created_at : b.created_at - a.created_at;
                }));
                break;
            case 'name':
                // tri par nom
                console.log("par titre")
                setAllQuizs(allQuizs.sort((a, b) => {
                    return (quizsOrderByTitleAsc) ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                }))
                break;
            default:
                break;
        }
    }, [allQuizs, quizsOrderBy, quizsOrderByDateAsc, quizsOrderByTitleAsc])




    const removeQuizFromDb = async function (id) {
        console.log("Supprimer le quiz ", id)
        try {
            await supabase
                .from('quizs')
                .delete()
                .match({ id });
        } catch (error) {
            console.warn("Erreur suppression quiz:", error)
        } finally {
            fetchQuizsList();
        }
    }

    const deleteQuiz = (ev) => {
        let id = parseInt(ev.target.closest('button').dataset.remove);
        // TODO: demande de confirmation par un modal
        removeQuizFromDb(id);
    }

    const exportQuizs = function () {
        exportJSON('quizs');
    }

    const importQuizs = function (ev) {
        ev.preventDefault();
        importJSON('quizs');
        // TODO: rafraichir l'affichage
    }

    let quizsList = [];
    if (allQuizs.length) {

        quizsList = allQuizs.map(({ id, title, date }) => (
            <tr key={id}>
                <td>{title}</td>
                <td>{new Intl.DateTimeFormat('fr-FR', dateOptions).format(date)}</td>
                <td>
                    <NavLink
                        to={`/admin/quiz/${id}`}
                        data-edit={id}
                        className="icon"
                        title="Modifier ce quiz"
                    >
                        <Edit />
                    </NavLink>
                </td>
                <td>
                    <button
                        className="icon"
                        type="button"
                        onClick={deleteQuiz}
                        data-remove={id}
                        title="Supprimer ce quiz"
                    >
                        <Trash />
                    </button>
                </td>
            </tr>
        ));
    } else {
        quizsList = (
            <tr>
                <td colSpan="4" className="text-center text-info">Pas encore de quiz...</td>
            </tr>
        );
    }

    if (!allQuizs) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <table className="table table-hover table-quizs">
                <thead className="table-light">
                    <tr>
                        <th scope="col"
                            onClick={orderQuizsByTitle}
                            className={`clickable ${(quizsOrderBy === 'title') ? 'table-info' : ''}`}
                            title={quizsOrderByTitleAsc ? "Titre, par ordre croissant" : "Titre, par ordre décroissant"}
                        >
                            Titre
                            {(quizsOrderBy === 'title') && (quizsOrderByTitleAsc) && <ChevronDown />}
                            {(quizsOrderBy === 'title') && (!quizsOrderByTitleAsc) && <ChevronUp />}
                        </th>
                        <th scope="col"
                            onClick={orderQuizsByDate}
                            className={`clickable ${(quizsOrderBy === 'created_at') ? 'table-info col-3' : ' col-3'}`}
                            title={quizsOrderByDateAsc ? "Date, par ordre croissant" : "Date, par ordre décroissant"}
                        >
                            Date
                            {(quizsOrderBy === 'created_at') && (quizsOrderByDateAsc) && <ChevronDown />}
                            {(quizsOrderBy === 'created_at') && (!quizsOrderByDateAsc) && <ChevronUp />}
                        </th>
                        <th scope="col" className="col-1"></th>
                        <th scope="col" className="col-1"></th>
                    </tr>
                </thead>
                <tbody>
                    {quizsList}
                </tbody>
            </table>
            <div className="d-flex justify-content-around">
                <button
                    onClick={exportQuizs}
                    className='btn btn-outline-primary'
                >Export Quizs</button>
                <button
                    onClick={importQuizs}
                    className='btn btn-outline-primary'
                >Import Quizs</button>
                <NavLink to="/admin/quiz">
                    <button className='btn btn-primary'>Nouveau Quiz</button>
                </NavLink>
            </div>
        </>
    )
}

export default QuizTable;