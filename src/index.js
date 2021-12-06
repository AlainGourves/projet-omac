import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router
} from 'react-router-dom';
import './index.css';
import { AuthProvider } from './contexts/Auth';
import App from './components/App/App';


ReactDOM.render(
    <React.StrictMode>
        <Router>
            <AuthProvider>
                <App />
            </AuthProvider>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);