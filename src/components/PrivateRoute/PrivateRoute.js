import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../../contexts/Auth";

const PrivateRoute = ({ component: Component, ...rest }) => {
    // Wraps the `Route` component and passes down the props to it. It only renders the page if the `user` is not null (user is authenticated)
    const { user } = useAuth();

    return (
        <Route
            {...rest}
            render = {(props) => {
                return user ? <Component {...props} /> : <Redirect to="/connexion" />
            }}
        ></Route>
    )
}


export default PrivateRoute;