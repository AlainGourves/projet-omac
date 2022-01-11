import './admin.scss';
// import { useState } from 'react';
// import axios from 'axios';
import { supabase } from '../../supabaseClient';
import { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/Auth';
import { Switch, Route } from 'react-router-dom';
import AdminMenu from './AdminMenu/AdminMenu';
import Home from './Home/Home';
import Quiz from './Quiz/Quiz';
import ExportResults from './ExportResults/ExportResults';
import EditTest from './EditTest/EditTest';

const Admin = function (props) {
    // const { user } = useAuth();
    // const { user, sessionToken } = useAuth();

    // const url = process.env.REACT_APP_BACKEND_URL;
    // console.log("from admin: ", user)

    // useEffect(() => {
    //     // Faire un POST qui contient le token de session (`sessionToken`)
    //     axios.post(url,
    //         {
    //             sessionToken,
    //         })
    //         .then((response) => {

    //             console.log("from admin:", response.data)
    //         })
    // }, [])

    const [allQuizs, setAllQuizs] = useState([]);

    // Récupére en BDD la liste des quizs
    useEffect(() => {
        const getAllQuizs = async () => {
            // Récupère tous les quizs, classés du plus récent au plus ancien
            try {
                const { data } = await supabase
                    .from('quizs')
                    .select('id, title')
                    .order('created_at', { ascending: false });
                if (data) {
                    setAllQuizs(data);
                }
            } catch (error) {
                console.log("Erreur fetch quizs:", error);
            }
        }

        if (!allQuizs.length) {
            getAllQuizs();
        }
    }, [allQuizs]);

    return (
        <div className="container-xl min-vh-100 admin">

            <AdminMenu />

            <main className="constainer-xl">
                <Switch>
                    <Route exact path="/admin/quiz">
                        <Quiz />
                    </Route>
                    <Route path="/admin/quiz/:id">
                        <Quiz />
                    </Route>
                    <Route exact path="/admin/edit-test">
                        <EditTest allQuizs={allQuizs} />
                    </Route>
                    <Route path="/admin/edit-test/:id">
                        <EditTest allQuizs={allQuizs} />
                    </Route>
                    <Route path="/admin/export">
                        <ExportResults />
                    </Route> 
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </main>
        </div>
    )

}

export default Admin