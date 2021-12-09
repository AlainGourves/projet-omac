import { NavLink } from 'react-router-dom';
import { useModal } from '../../../contexts/ModalContext';
import { ChevronDown, ChevronUp, Edit, Trash } from 'react-feather';

function QuizTable(props) {
    const [modal, setModal] = useModal();

    const deleteQuiz = (ev) => {
        let id = parseInt(ev.target.closest('button').dataset.remove);
        // Demande de confirmation par un modal
        setModal({
            show: true,
            title: 'Confirmation',
            message: "Etes-vous sûr de vouloir supprimer ce quiz ? Sa supression entraînera la suppression de tous les résultats associés.",
            btnCancel: 'Non',
            btnOk: 'Oui',
            fn: () => {
                setModal({
                    ...modal,
                    show: false
                })
                props.removeQuizFromDb(id);
            }
        })
    }

    const exportQuizs = function () {
        props.exportJSON('quizs');
    }

    const importQuizs = function (ev) {
        ev.preventDefault();
        props.importJSON('quizs');
    }

    let quizsList = [];
    if (props.allQuizs.length) {

        quizsList = props.allQuizs.map(({ id, title, date }) => (
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
        ));
    } else {
        quizsList = (
            <tr>
                <td colSpan="4" className="text-center text-info">Pas encore de quiz...</td>
            </tr>
        );
    }

    if (!props.allQuizs) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <table className="table table-hover table-quizs">
                <thead className="table-light">
                    <tr>
                        <th scope="col"
                            onClick={props.orderQuizsByTitle}
                            className={`clickable ${(props.quizsOrderBy === 'title') ? 'table-info' : ''}`}
                            title={props.quizsOrderByTitleAsc ? "Titre, par ordre croissant" : "Titre, par ordre décroissant"}
                        >
                            Titre
                            {(props.quizsOrderBy === 'title') && (props.quizsOrderByTitleAsc) && <ChevronDown />}
                            {(props.quizsOrderBy === 'title') && (!props.quizsOrderByTitleAsc) && <ChevronUp />}
                        </th>
                        <th scope="col"
                            onClick={props.orderQuizsByDate}
                            className={`clickable ${(props.quizsOrderBy === 'created_at') ? 'table-info col-3' : ' col-3'}`}
                            title={props.quizsOrderByDateAsc ? "Date, par ordre croissant" : "Date, par ordre décroissant"}
                        >
                            Date
                            {(props.quizsOrderBy === 'created_at') && (props.quizsOrderByDateAsc) && <ChevronDown />}
                            {(props.quizsOrderBy === 'created_at') && (!props.quizsOrderByDateAsc) && <ChevronUp />}
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