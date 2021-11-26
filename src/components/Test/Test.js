import './test.scss';
import { useEffect } from 'react';
import {
    Switch,
    Route,
} from 'react-router-dom';
import Home from './Home/Home';
import User from './User/User';
import Quiz from './Quiz/Quiz';
import Verbatim from './Verbatim/Verbatim';
import Greetings from './Greetings/Greetings';
import Dashboard from '../Dashboard/Dashboard';
import test from '../../data/test.json';
import quizsData from '../../data/quizs.json';
import { useAuth } from '../../contexts/Auth'
import { supabase } from '../../supabaseClient';

function Test() {
    const { user } = useAuth();

    useEffect(() => {
        const getUser = async (user) => {
            // Récupère les infos dans `public.users`
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select()
                    .eq('id', user.id)
                    .single()

                if (error) {
                    throw error;
                }

                if (data) {
                    console.log("resultat:", data)
                }
            } catch (error) {
                console.warn("Erreur !", error)
            }
        }
        getUser(user);
    }, [user]);

    // Données du test
    const quizsIds = test.quizsIds;
    const verbatim = test.verbatim;
    const isVerbatim = (verbatim.length && verbatim[0] !== '');

    // Données des quizs
    const quizs = quizsData.records.filter((obj) => quizsIds.includes(obj.id));

    // Récupération des réponses
    const getElapsedTime = (idx, duration) => {
        console.log(`Durée du quiz ${idx} :`, duration, 'secondes')
    }

    const getVerbatimResponse = (idx, response) => {
        console.log(`Verbatim, réponse ${idx} :`, response)
    }

    return (
        <>
            <Dashboard />
            <Switch>
                <Route path='/test/quiz/:id'>
                    {/* `id` correspond à l'index du quiz dans le array quizsIds */}
                    <Quiz
                        quizs={quizs}
                        isVerbatim={isVerbatim}
                        getElapsedTime={getElapsedTime}
                    />
                </Route>

                <Route path='/test/verbatim/:id'>
                    <Verbatim
                        verbatim={verbatim}
                        getVerbatimResponse={getVerbatimResponse}
                    />
                </Route>

                <Route path='/test/fin'>
                    <Greetings />
                </Route>

                <Route path='/test/user'>
                    <User />
                </Route>

                <Route exact path='/'>
                    <Home
                        title={test.home.title}
                        description={test.home.description} />
                </Route>

            </Switch>
        </>
    )
}

export default Test;