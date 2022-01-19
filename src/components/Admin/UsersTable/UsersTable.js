function UsersTable({ usersList, userAdmin }) {

    return (
        <div>
            <h4>Comptes "{userAdmin ? "Admin" : "Visiteur"}"</h4>
            <div className="users-list">
                <ul className="list-group">
                    {
                        usersList.map(({ id, email, is_admin }) => (
                            (userAdmin === is_admin) && <li
                                key={id}
                                className="list-group-item">
                                <em>{email}</em>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    )
}

export default UsersTable;