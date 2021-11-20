import './app.scss';
import React from 'react';
import {
    Switch,
    Route,
} from 'react-router-dom';
import Home from '../Home/Home';
import Test from '../Test/Test';

function App() {

    return (
        <div className="container min-vh-100 d-flex justify-content-center align-items-center">
            <Switch>
                <Route path='/test'>
                    <Test />
                </Route>
                
                <Route path='/'>
                    <Home />
                </Route>
            </Switch>
        </div>
    );
}

export default App;