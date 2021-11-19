import './test.scss';
import {
    Switch,
    Route,
} from 'react-router-dom';
import Home from './Home/Home';
import Quiz from './Quiz/Quiz';
import Verbatim from './Verbatim/Verbatim';
import Greetings from './Greetings/Greetings';

function Test() {

    return (
        <Switch>
                <Route path='/test/quiz'>
                    <Quiz />
                </Route>

                <Route path='/test/verbatim'>
                    <Verbatim />
                </Route>

                <Route path='/test/fin'>
                    <Greetings />
                </Route>

                <Route exact path='/test'>
                    <Home />
                </Route>
                
            </Switch>
    )
}

export default Test;