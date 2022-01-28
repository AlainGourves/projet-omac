import { NavLink } from 'react-router-dom';
import { LogIn } from 'react-feather';

function UsersTable({ usersList, userAdmin }) {

    return (
        <div className='mb-3'>
            <h4>Comptes "{userAdmin ? "Admin" : "Visiteur"}"</h4>
            <div className="users-list">
                <ul className="list-group">
                    {
                        usersList.map(({ id, email, is_admin, test_id }) => (
                            (userAdmin === is_admin) && <li
                                key={id}
                                className="list-group-item d-flex justify-content-between">
                                <span><em>{email}</em></span>

                                {(test_id) && <span className='d-flex align-items-center'>
                                    <NavLink to={`edit-test/${test_id}`} className="text-decoration-none pe-1" >
                                        Test
                                    </NavLink>
                                    <NavLink to={`edit-test/${test_id}`} className="text-decoration-none" >
                                        <LogIn />
                                    </NavLink>
                                </span>}
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    )
}

export default UsersTable;