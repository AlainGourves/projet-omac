import './quiz.scss';
import { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useModal } from '../../../contexts/ModalContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import List from './List/List';
import Map from './Map/Map';
import { addToLocalStorage } from '../../Utils/helperFunctions';

function Quiz({ quizs, isVerbatim, ...props }) {
    const { id } = useParams();

    // Stocke les infos du quiz :
    const [quiz, setQuiz] = useState(null);
    const [countItems, setCountItems] = useState(0);
    // Chronométrage du temps de réponse au quiz
    const [quizStartTime, setQuizStartTime] = useState(0);
    // Routage :
    const nextStep = useRef('/test');
    // Stockage des item placés sur la carte
    const [answers, setAnswers] = useState([]);

    const [modal, setModal] = useModal();

    const history = useHistory();

    // référence au DIV qui englobe Map pour pouvoir récupérer ses dimensions
    const mapRef = useRef();

    // Décalages à appliquer pour placer les items sur la Map
    const [wOffset, setWOffset] = useState(null);
    const [hOffset, setHOffset] = useState(null);

    useEffect(() => {
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

        if (quizs) {
            if (quizs[id]) {
                setAnswers([]);
                // randomize la liste si besoin
                let items = (!quizs[id].is_alpha) ? shuffleArray(quizs[id].items.slice()) : quizs[id].items;
                // Ajoute une propriété pour savoir si l'item a été déposé sur la carte (false par défaut)
                items.forEach(item => item.isUsed = false)
                setQuiz({
                    ...quizs[id],
                    items
                });
                setCountItems(items.length);
                setQuizStartTime(Date.now())

                // Routage :
                if (parseInt(id) !== quizs.length - 1) {
                    // quiz[id] n'est pas la dernière valeur du array
                    nextStep.current = '/test/quiz/' + (parseInt(id) + 1);
                } else {
                    if (isVerbatim) {
                        nextStep.current = '/test/verbatim/0';
                    } else {
                        nextStep.current = '/test/fin'
                    }
                }
            }else{
                // Le paramètre de l'URL ne correspond à rien d'attendu
                // => on redirige
                history.push(nextStep.current);
            }
        }
    }, [id, quizs, isVerbatim, history]);

    useEffect(() => {
        // Fixe la valeur de `--mapItem-width` (utilisée pour les calculs de placement et des résultats)
        const mapItemWidth = 6; // valeur en `rem`
        document.documentElement.style.setProperty('--mapItem-width', `${mapItemWidth}rem`);
        // calcule la valeur du `rem`en `px`
        let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        if (rem) {
            // TODO: mettre les valeurs pour width & height quelque part bien en évidence (voir par rappport au SCSS)
            setWOffset((rem * mapItemWidth) / 2);
            setHOffset(rem * 1.75 + 2); // hauteur des mapItems : line-height + padding + 2px border
        }
    }, []);

    // Compteur pour les z-index des map-items
    // utilise useRef() parce que la valeur persiste entre les re-rendus des composants
    const zIdx = useRef(0);

    // réponses
    const addAnswer = (obj) => {
        if (mapRef.current) {
            // Changer la propriété isUsed de l'item correspondant dans la liste
            let id = obj.id;
            setQuiz((arr) => {
                // trouver l'indice dans quiz.items
                const idx = arr.items.findIndex(el => el.id === id);
                let newItems = [...arr.items]; // copie de l'array
                // let newItems = arr.items.slice(); // copie de l'array
                newItems[idx].isUsed = true;
                return {
                    ...arr,
                    items: newItems
                }
            })
            const rect = mapRef.current.getBoundingClientRect();
            // calcul de la position enregistrée (centre de la croix)
            // (x, y) moins les décalages wOffset, hOffset
            obj.registeredX = (obj.x - rect.x) / rect.width * 100;
            obj.registeredY = (obj.y - rect.y) / rect.height * 100;
            // calcul de la position du coin supérieur gauche dans Map en pourcentage
            obj.x = obj.registeredX - (wOffset / rect.width * 100);
            obj.y = obj.registeredY - (hOffset / rect.height * 100);
            // z-index
            obj.z = zIdx.current;
            setAnswers(answers => [...answers, obj]);
            setCountItems(count => count - 1);
            zIdx.current++;
        }
    };

    const modifyAnswer = (obj) => {
        if (mapRef.current) {
            let id = obj.id;
            setAnswers(answers => {
                // trouver l'index dans `answers` de l'obj correspondant
                let idx = answers.findIndex(el => el.id === id);
                let updatedItems = [...answers]; // copie du array
                const rect = mapRef.current.getBoundingClientRect();
                // calcul de la position enregistrée (centre de la croix)
                // (x, y) moins les décalages wOffset, hOffset
                obj.registeredX = (obj.x - rect.x) / rect.width * 100;
                obj.registeredY = (obj.y - rect.y) / rect.height * 100;
                // calcul de la position du coin supérieur gauche dans Map en pourcentage
                obj.x = obj.registeredX - (wOffset / rect.width * 100);
                obj.y = obj.registeredY - (hOffset / rect.height * 100);
                // update les coordonnées
                updatedItems[idx].x = obj.x;
                updatedItems[idx].y = obj.y;
                updatedItems[idx].registeredX = obj.registeredX;
                updatedItems[idx].registeredY = obj.registeredY;
                updatedItems[idx].z = zIdx.current;
                return updatedItems;
            });
            zIdx.current++;
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
                // calcul du temps de réponse en secondes
                const quizEndTime = Date.now();
                const quizDuration = Math.floor((quizEndTime - quizStartTime) / 1000);
                // Tri des réponses sur l'id des items
                const sortedAnswers = answers.sort((a, b) => (a.id > b.id) ? 1 : -1);
                // On en garde que les valeurs de `x` & `y`
                const quizResult = sortedAnswers.map(item => {
                    // Il peut y avoir des cas limite où x et/ou y sont négatifs, comme c'est toujours très proche de 0, on arrondit à 0
                    return {
                        'x': (item.registeredX > 0) ? item.registeredX.toFixed(2) : 0,
                        'y': (item.registeredY > 0) ? item.registeredY.toFixed(2) : 0
                    }
                });
                // Enregistrement des résultats en localStorage
                const finalResult = {
                    'quizId': quizs[id].id,
                    'quizTitle': quizs[id].title,
                    'results': quizResult,
                    'duration': quizDuration,
                }
                addToLocalStorage('quizs', finalResult, id);
                setModal({
                    ...modal,
                    show: false
                })
                history.push(nextStep.current);
            }
        });
    }

    // useEffect(()=> console.log(answers), [answers])

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
                            modifyAnswer={modifyAnswer}
                            ref={mapRef}
                        />
                    </div>
                    <div className='listItems col'>
                        <List
                            is_alpha={quiz.is_alpha}
                            items={quiz.items}
                        />

                        {/* countItems = 0 -> Tous les items sont placés sur la carte, on affiche le bouton "Continuer" */}
                        {!countItems &&
                            <div className='my-3'>
                                <button
                                    type='button'
                                    onClick={askConfirm}
                                    className="btn btn-primary"
                                >Continuer</button>

                            </div>
                        }
                    </div>
                </DndProvider>
            </main>
        </div>
    );
}

export default Quiz;