import './quiz.scss';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useModal } from '../../../contexts/ModalContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import List from './List/List';
import Map from './Map/Map';

function Quiz({ quizs, getElapsedTime, ...props }) {
    const { id } = useParams();

    // Récupère les infos du quiz :
    const quiz = quizs[id];

    const [modal, setModal] = useModal();

    const history = useHistory();

    // réponses
    const [answers, setAnswers] = useState([]);
    const addAnswer = (obj) => setAnswers(answers => [...answers, obj]);

    // Routage :
    let nextStep;
    if (parseInt(id) !== quizs.length - 1) {
        // quiz[id] n'est pas la dernière valeur du array
        nextStep = '/test/quiz/' + (parseInt(id) + 1);
    } else {
        if (props.isVerbatim) {
            nextStep = '/test/verbatim/0';
        } else {
            nextStep = '/test/fin'
        }
    }

    const askConfirm = () => {
        console.log("click !", nextStep)
        setModal({
            show: true,
            title: 'Confirmation',
            message: 'Passé ce point, il ne sera plus possible de modifier vos réponses. Voulez-vous vraiment continuer ?',
            btnCancel: 'Annuler',
            btnOk: 'Continuer',
            fn: () => {
                // TODO: c'est là que le chronomètre doit s'arrêter
                setModal({
                    ...modal,
                    show: false
                })
                history.push(nextStep);
            }
        });
    }

    useEffect(() => {
        const startTime = Date.now();

        return () => {
            const endTime = Date.now();
            getElapsedTime(id, Math.floor((endTime - startTime) / 1000));
        }
    }, [getElapsedTime, id]);

    return (

        <div className='container-md rose'>
            <header className='row text-center my-3'>
                <h1>{quiz.title}</h1>
                <p>{quiz.description}</p>
            </header>
            <main className='row mb-3'>
                <DndProvider backend={HTML5Backend}>
                    <div className='quizMap__container col-lg-9'>
                        <Map 
                            answers={answers}
                            addAnswer={addAnswer}
                        />
                    </div>
                    <div className='listItems col'>
                        <List
                            is_alpha={quiz.is_alpha}
                            items={quiz.items}
                        />

                    </div>
                </DndProvider>
            </main>
            <div className='my-3'>
                <button
                    type='button'
                    // onClick={() => history.push(nextStep)}
                    onClick={askConfirm}
                    className="btn btn-primary"
                >Continuer</button>

            </div>
        </div>
    );
}

export default Quiz;