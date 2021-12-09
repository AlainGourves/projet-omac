import './quiz-table.scss';
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronUp, Edit, Trash } from 'react-feather';

function QuizTable(props) {
    const [allQuizs, setAllQuizs] = useState([]);
    const [quizsOrder, setQuizsOrder] = useState('created_at');
    const [dateAscending, setDateAscending] = useState(false);
    const [titleAscending, setTitleAscending] = useState(true);

    const orderByName = (ev) => {
        if (quizsOrder === 'created_at') {
            setQuizsOrder('title');
            return;
        }
        setTitleAscending(!titleAscending);
    }

    const orderByDate = (ev) => {
        if (quizsOrder === 'title') {
            setQuizsOrder('created_at');
            return;
        }
        setDateAscending(!dateAscending)
    }

    // Récupère les infos sur les quizs
    const fetchQuizsList = async () => {
        try {
            const { data } = await supabase
                .from('quizs')
                .select('id, created_at, title')
                .order(quizsOrder, { ascending: (quizsOrder === 'title') ? titleAscending : dateAscending });
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
        console.log("order:", quizsOrder, "date", (dateAscending ? 'ASC' : 'DESC'), "nom", (titleAscending ? 'ASC' : 'DESC'))
        switch (quizsOrder) {
            case 'created_at':
                // tri par date
                console.log("par date")
                setAllQuizs(allQuizs.sort((a, b) => {
                    return (dateAscending) ? a.created_at - b.created_at : b.created_at - a.created_at;
                }));
                break;
            case 'name':
                // tri par nom
                console.log("par titre")
                setAllQuizs(allQuizs.sort((a, b) => {
                    return (titleAscending) ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                }))
                break;
            default:
                break;
        }
    }, [allQuizs, quizsOrder, dateAscending, titleAscending])




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
        props.exportJSON('quizs');
    }

    const importQuizs = function (ev) {
        ev.preventDefault();
        props.importJSON('quizs');
        // TODO: rafraichir l'affichage
    }

    let result = '';
    if (allQuizs.length) {
        // create a copy of the array
        let quizsList = allQuizs.slice();

        if ((quizsOrder === 'created_at' && dateAscending) || (quizsOrder === 'title' && titleAscending)) {
            // reverse array
            quizsList = quizsList.reverse();
        }
        result = (
            <tbody>
                {
                    quizsList.map(({ id, title, date }) => (
                        <tr key={id}>
                            <td>{title}</td>
                            <td>{new Intl.DateTimeFormat('fr-FR', props.dateOptions).format(date)}</td>
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
                    ))
                }
            </tbody>
        );
    } else {
        result = (
            <tbody>
                <tr>
                    <td colSpan="4" className="text-center text-info">Pas encore de quiz...</td>
                </tr>
            </tbody>
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
                            onClick={orderByName}
                            className={`clickable ${(quizsOrder === 'title') ? 'table-info' : ''}`}
                            title={titleAscending ? "Titre, par ordre croissant" : "Titre, par ordre décroissant"}
                        >
                            Titre
                            {(quizsOrder === 'title') && (titleAscending) && <ChevronDown />}
                            {(quizsOrder === 'title') && (!titleAscending) && <ChevronUp />}
                        </th>
                        <th scope="col"
                            onClick={orderByDate}
                            className={`clickable ${(quizsOrder === 'created_at') ? 'table-info col-3' : ' col-3'}`}
                            title={dateAscending ? "Date, par ordre croissant" : "Date, par ordre décroissant"}
                        >
                            Date
                            {(quizsOrder === 'created_at') && (dateAscending) && <ChevronDown />}
                            {(quizsOrder === 'created_at') && (!dateAscending) && <ChevronUp />}
                        </th>
                        <th scope="col" className="col-1"></th>
                        <th scope="col" className="col-1"></th>
                    </tr>
                </thead>
                {result}
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