import './quiz.scss';
import { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useModal } from '../../../contexts/ModalContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import List from './List/List';
import Map from './Map/Map';

function Quiz({ quizs, getElapsedTime, ...props }) {
    const { id } = useParams();

    // Stocke les infos du quiz :
    const [quiz, setQuiz] = useState(null);
    useEffect(()=>{
        const shuffleArray = (arr) => {
            // Fisher–Yates shuffle (plus efficace que d'utiliser simplement la fonction random())
            // ref : https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                // Array destructuring
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        if (quizs[id]) {
            // randomize la liste si besoin
            let items = (!quizs[id].is_alpha) ? shuffleArray(quizs[id].items.slice()) : quizs[id].items;
            // Ajoute une propriété pour savoir si l'item est draggable (true par défaut)
            items.forEach(item => item.isUsed = false)
            setQuiz({
                ...quizs[id],
                items
            })
        }
    }, [id, quizs]);

    const [modal, setModal] = useModal();

    const history = useHistory();

    // référence au DIV qui englobe Map pour pouvoir récupérer ses dimensions
    const mapRef = useRef();

    // réponses
    const [answers, setAnswers] = useState([]);
    const addAnswer = (obj) => {
        if (mapRef.current) {
            // Changer la propriété isUsed de l'item correspondant dans la liste
            let id = obj.id;
            setQuiz((arr) => {
                // trouver l'indice dans quiz.items
                const idx = arr.items.findIndex(el => el.id === id);
                let newItems = arr.items.slice(); // copie de l'array
                newItems[idx].isUsed = true;
                return {
                    ...arr,
                    items: newItems
                }
            })
            const rect = mapRef.current.getBoundingClientRect();
            // calcul de la position dans Map en pourcentage
            // TODO: récupérer width/2 & height de .mapItem pour les mettre à la place des valeurs en dur 48 & 28
            obj.x = (obj.x - rect.x - 48)/rect.width*100;
            obj.y = (obj.y - rect.y - 28)/rect.height*100;
            setAnswers(answers => [...answers, obj])
        }
    };

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

    if (!quiz) {
        return (
            <h1>Chargement...</h1>
        )
    }

    return (

        <div className='container-md'>
            <header className='row text-center my-3'>
                <h1>{quiz.title}</h1>
                <p>{quiz.description}</p>
            </header>
            <main className='row mb-3'>
                <DndProvider backend={HTML5Backend}>
                    <div className='quizMap__container col-lg-9 min-vh-75'>
                        <Map
                            answers={answers}
                            addAnswer={addAnswer}
                            ref={mapRef}
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