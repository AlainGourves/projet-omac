import './test.scss';
import {
    Switch,
    Route,
} from 'react-router-dom';
import Home from './Home/Home';
import Quiz from './Quiz/Quiz';
import Verbatim from './Verbatim/Verbatim';
import Greetings from './Greetings/Greetings';
import test from '../../data/test.json';
import quizsData from '../../data/quizs.json';

function Test() {
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

                <Route exact path='/test'>
                    <Home 
                        title={test.home.title}
                        description={test.home.description} />
                </Route>
                
            </Switch>
    )
}

export default Test;