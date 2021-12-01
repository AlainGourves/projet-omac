import './quiz.scss';
import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useModal } from '../../../contexts/ModalContext';

function Quiz(props) {
    const { id } = useParams();
    const quizs = props.quizs; // données des quizs

    // Récupère les infos du quiz :
    const quiz = quizs[id];

    const [modal, setModal] = useModal();

    const history = useHistory();

    const askConfirm = () => {
        setModal({
            show: true,
            title: 'Titre du modal',
            message: 'Est-ce que ça marche ?',
            btnCancel: 'Annuler',
            btnOk: 'Continuer',
            fn: () => {
                console.log("mais oui !")
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
            props.getElapsedTime(id, (endTime - startTime) / 1000);
        }
    });

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

    return (
        <>
            <div className="carte row text-center">
                <h1>Quiz {quiz.id}</h1>
                <h2>{quiz.title}</h2>
                <p>{quiz.description}</p>

                {/* <Link to={nextStep}> */}
                    <button
                        type='button'
                        // onClick={() => history.push(nextStep)}
                        onClick={askConfirm}
                        className="btn btn-primary"
                    >Continuer</button>
                {/* </Link> */}
            </div>
        </>
    );
}

export default Quiz;