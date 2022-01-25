import { NavLink } from 'react-router-dom';
import { useModal } from '../../../contexts/ModalContext';
import { ChevronDown, ChevronUp, Edit, Trash, Copy, Mail, User } from 'react-feather';

function TestTable(props) {
    const [modal, setModal] = useModal();

    const deleteTest = (ev) => {
        let id = parseInt(ev.target.closest('button').dataset.remove);
        // Demande de confirmation par un modal
        setModal({
            show: true,
            title: 'Confirmation',
            message: "Etes-vous sûr de vouloir supprimer ce test ? Sa supression entraînera la suppression de tous les résultats associés.",
            btnCancel: 'Non',
            btnOk: 'Oui',
            fn: () => {
                setModal({
                    ...modal,
                    show: false
                })
                props.removeTestFromDb(id);
            }
        })
    }

    const importTests = (ev) => {
        ev.preventDefault();
        props.importJSON('tests');
        // TODO: rafraichir l'affichage
    }

    const exportTests = (ev) => {
        ev.preventDefault();
        props.exportJSON('tests');
    }

    let testsList = [];
    if (props.allTests.length) {

        testsList = props.allTests.map(({ id, name, created_at, invitations, email }) => (
            <tr key={id}>
                <td>
                    <input
                        onChange={props.changeCurrentTest}
                        value={id}
                        type="radio"
                        name="isCurrent"
                        checked={(props.currentTest && props.currentTest === id) ? true : false}
                    />
                </td>
                <td>
                    <div className='d-flex justify-content-between test__name'>
                        {name}
                        <div>
                        {email && <User />}
                        {(invitations > 0) && <Mail title="Coucou!" />}
                        </div>
                    </div>
                </td>
                <td>{new Intl.DateTimeFormat('fr-FR', props.dateOptions).format(created_at)}</td>
                <td>
                    <NavLink
                        to={`/admin/edit-test/${id}`}
                        data-edit={id}
                        className="icon"
                        title="Modifier ce test"
                    >
                        <Edit />
                    </NavLink>
                </td>
                <td>
                    <NavLink
                        to={`/admin/copy-test/${id}`}
                        data-edit={id}
                        className="icon"
                        title="Dupliquer ce test"
                    >
                        <Copy />
                    </NavLink>
                </td>
                <td>
                    <button
                        className="icon"
                        type="button"
                        onClick={deleteTest}
                        data-remove={id}
                        title="Supprimer ce test"
                    >
                        <Trash />
                    </button>
                </td>
            </tr>
        ));
    } else {
        testsList = (
            <tr>
                <td colSpan="5" className="text-center text-info">Pas encore de test...</td>
            </tr>
        );
    }

    if (!props.allTests) {
        // console.log('Store is empty')
        // return null;
        return <p>Loading...</p>;
    }
    return (
        <>
            <table className="table table-hover table-tests">
                <thead className="table-light">
                    <tr>
                        <th scope="col" className="col-icon">Actif</th>
                        <th scope="col"
                            onClick={props.orderTestsByName}
                            className={`clickable ${(props.testsOrderBy === 'name') ? "table-info" : ''}`}
                            title={props.testsOrderByNameAsc ? "Nom, par ordre croissant" : "Nom, par ordre décroissant"}
                        >
                            Nom
                            {(props.testsOrderBy === 'name') && (props.testsOrderByNameAsc) && <ChevronDown />}
                            {(props.testsOrderBy === 'name') && (!props.testsOrderByNameAsc) && <ChevronUp />}
                        </th>
                        <th scope="col"
                            onClick={props.orderTestsByDate}
                            className={`clickable ${(props.testsOrderBy === 'created_at') ? 'table-info col-3' : 'col-3'}`}
                            title={props.testsOrderByDateAsc ? "Date, par ordre croissant" : "Date, par ordre décroissant"}
                        >
                            Date
                            {(props.testsOrderBy === 'created_at') && (props.testsOrderByDateAsc) && <ChevronDown />}
                            {(props.testsOrderBy === 'created_at') && (!props.testsOrderByDateAsc) && <ChevronUp />}
                        </th>
                        <th scope="col" className="col-icon"></th>
                        <th scope="col" className="col-icon"></th>
                        <th scope="col" className="col-icon"></th>
                    </tr>
                </thead>
                <tbody>
                    {testsList}
                </tbody>
            </table>

            <div className="d-flex justify-content-around">
                <button
                    onClick={exportTests}
                    className='btn btn-outline-primary'
                >Export Tests</button>

                <button
                    onClick={importTests}
                    className='btn btn-outline-primary'
                >Import Tests</button>
                <NavLink to="/admin/edit-test">
                    <button className='btn btn-primary'>Nouveau test</button>
                </NavLink>
            </div>
        </>
    )
}

export default TestTable;