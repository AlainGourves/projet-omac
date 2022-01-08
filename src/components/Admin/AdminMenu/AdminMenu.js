import './admin-menu.scss';
import {
    NavLink
} from 'react-router-dom';

function AdminMenu(props) {

    return (
        <nav className="navbar navbar-expand-md navbar-dark bg-dark mb-3">
        <ul className="nav nav-pills container-fluid">
            <li className="nav-item">
                <NavLink exact to="/admin/" className="nav-link" activeClassName="active">Accueil Admin</NavLink>
            </li>
            <li className="nav-item">
                <NavLink to="/admin/edit-test" className="nav-link" activeClassName="active">Création d'un test</NavLink>
            </li>
            <li className="nav-item">
                <NavLink to="/admin/quiz" className="nav-link" activeClassName="active">Création d'un quiz</NavLink>
            </li>
            <li className="nav-item">
                <NavLink to="/admin/export" className="nav-link" activeClassName="active">Gestion des résultats</NavLink>
            </li>
            <li className="nav-item ms-auto quit">
                <NavLink exact to="/" className="nav-link">Quitter Admin</NavLink>
            </li>
        </ul>
    </nav>
    )
}

export default AdminMenu;