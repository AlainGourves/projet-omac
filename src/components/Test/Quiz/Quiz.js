import './quiz.scss';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

function Quiz(props) {
    const { id } = useParams();
    const quizs = props.quizs; // données des quizs

    // Récupère les infos du quiz :
    const quiz = quizs[id];

    useEffect(() => {
        const startTime = Date.now();
        
        return () => {
            const endTime = Date.now();
            props.getElapsedTime(id, (endTime - startTime)/1000);
        }
    });

    // Routage :
    let nextStep;
    if (parseInt(id) !== quizs.length - 1) {
        // quiz[id] n'est pas la dernière valeur du array
        nextStep = '/quiz/' + (parseInt(id) + 1);
    } else {
        if (props.isVerbatim) {
            nextStep = '/verbatim/0';
        } else {
            nextStep = '/fin'
        }
    }

    return (
        <div className="carte row text-center">
            <h1>Quiz {quiz.id}</h1>
            <h2>{quiz.title}</h2>
            <p>{quiz.description}</p>

            <Link to={nextStep}>
                <button type='button' className="btn btn-primary">Continuer</button>
            </Link>
        </div>
    );
}

export default Quiz;