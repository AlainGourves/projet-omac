import './admin-menu.scss';
import {
    NavLink
} from 'react-router-dom';
import { Menu } from 'react-feather';


function AdminMenu({ url }) {


    return (
        <nav className="navbar navbar-expand-md navbar-dark mb-5">
            <input type="checkbox" id="nav-toggle" className="nav-toggle"></input>
            <ul className="nav nav-pills container-fluid flex-column flex-md-row">
                <li className="nav-item">
                    <NavLink exact to={`${url}/`} className="nav-link" activeClassName="active">Accueil Admin</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to={`${url}/edit-test`} className="nav-link" activeClassName="active">Création d'un test</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to={`${url}/quiz`} className="nav-link" activeClassName="active">Création d'un quiz</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to={`${url}/manage-users`} className="nav-link" activeClassName="active">Utilisateurs</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to={`${url}/export`} className="nav-link" activeClassName="active">Gestion des résultats</NavLink>
                </li>
                <li className="nav-item ms-md-auto quit">
                    <NavLink exact to="/" className="nav-link">Quitter Admin</NavLink>
                </li>
            </ul>
            <label htmlFor="nav-toggle" className="nav-toggle-label">
                <span><Menu /></span>
            </label>
        </nav>
    )
}
export default AdminMenu;