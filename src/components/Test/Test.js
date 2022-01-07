import './test.scss';
import { useEffect, useState } from 'react';
import {
    Switch,
    Route,
} from 'react-router-dom';
import Home from './Home/Home';
import User from './User/User';
import Quiz from './Quiz/Quiz';
import Verbatim from './Verbatim/Verbatim';
import Greetings from './Greetings/Greetings';
import { supabase } from '../../supabaseClient';
import { useModal } from '../../contexts/ModalContext';

function Test() {
    // Chercher le test courant
    const [theTest, setTheTest] = useState(null);
    const [theQuizs, setTheQuizs] = useState(null);

    const [, setModal] = useModal(); // Laisser la virgule ! (on utilise pas `modal` dans le script => si on l'ajoute ici, il y aura une erreur "unused")
    const [loadingError, setLoadingError] = useState(false);

    const [isSavedToDB, setIsSavedToDB] = useState(false);

    useEffect(() => {
        const getTest = async () => {
            try {
                const { data, error } = await supabase
                    .from('tests')
                    .select()
                    .eq('is_current', true)
                    .limit(1)
                    .single()
                if (error) {
                    throw new Error(error.message);
                }
                if (data) {
                    setTheTest({
                        id: data.id,
                        home: data.home,
                        quizs_ids: data.quizs_ids,
                        isVerbatim: (data.verbatim.length > 0 && data.verbatim[0] !== ''),
                        verbatim: data.verbatim,
                        greetings: data.greetings,
                    })
                }
            } catch (error) {
                console.error("getTest error:", error)
                setLoadingError(true);
            }
        }
        if (!theTest) {
            getTest();
        }
    }, [theTest, setLoadingError]);

    // Chargement des infos des quizs
    useEffect(() => {
        const getQuizs = async (ids) => {
            try {
                const { data, error } = await supabase
                    .from('quizs')
                    .select()
                    .in('id', ids);
                if (error) {
                    throw new Error(error.message);
                }
                if (data) {
                    setTheQuizs(data);
                }
            } catch (error) {
                console.warn("getQuizs error:", error);
                setLoadingError(true);
            }
        }
        if (theTest && !theQuizs) {
            getQuizs(theTest.quizs_ids);
        }
    }, [theTest, theQuizs, setLoadingError])

    useEffect(() => {
        if (loadingError) {
            setModal({
                show: true,
                title: "Erreur !",
                message: "Impossible de charger les données. Veuillez contacter un administrateur pour signaler le problème.",
                btnOk: 'Fermer',
                fn: () => {
                    setModal({
                        show: false,
                    })
                }
            });
        }
    }, [loadingError, setModal]);

    // Enregistrement des données dans Supabase
    const save2Supabase = async () => {
        const persona = JSON.parse(localStorage.getItem('user'));
        const results = JSON.parse(localStorage.getItem('quizs'));
        let verbatim = (theTest.isVerbatim) ? JSON.parse(localStorage.getItem('verbatim')) : null;
        // Mise en forme de verbatim : comme TAB est utilisé à l'export comme séparateur CSV, il faut les remplacer dans le texte des réponses par des espaces.
        if (verbatim) {
            console.log("avant:", verbatim)
            verbatim = verbatim.map((verb) => {
                verb = verb.replaceAll(/\t/g, ' ');
                // on en profite pour supprimer les lignes vides
                verb = verb.replaceAll(/\n+/g, '\n');
                return verb.trim();
            });
            console.log("après:", verbatim)
        }
        // Met en forme les résultats pour la requète d'insertion dans DB
        const reqResults = results.map((q) => {
            return {
                client_id: persona.uniqueId,
                test_id: theTest.id,
                quiz_id: q.quizId,
                responses: q.results,
                duration: q.duration,
            }
        });
        const reqVerbatim = (theTest.isVerbatim) ? {
            client_id: persona.uniqueId,
            test_id: theTest.id,
            responses: verbatim,
        } : null;

        try {
            // enregitrement dans 'clients'
            {
                const { error } = await supabase
                    .from('clients')
                    .insert(persona, { returning: 'minimal' })
                if (error) {
                    throw new Error(error.message);
                }
            }
            {
                // enregitrement dans 'results'
                const { error } = await supabase
                    .from('results')
                    .insert(reqResults, { returning: 'minimal' })
                if (error) {
                    throw new Error(error.message);
                }
            }
            if (verbatim) {
                // enregitrement dans 'verbatim'
                const { error } = await supabase
                    .from('verbatim')
                    .insert(reqVerbatim, { returning: 'minimal' })
                if (error) {
                    throw new Error(error.message);
                }
            }
        } catch (error) {
            console.log("Erreur enregistrement DB:", error.message);
        } finally {
            setIsSavedToDB(true)
        }
    }

    if (!theTest || !theQuizs) {
        return (
            <>
                <h1>Chargement...</h1>
            </>
        )
    }

    return (
        <>
            <Switch>
                <Route path='/test/quiz/:id'>
                    {/* `id` correspond à l'index du quiz dans le array quizs_ids */}
                    <Quiz
                        quizs={theQuizs}
                        isVerbatim={theTest.isVerbatim}
                    />
                </Route>

                <Route path='/test/verbatim/:id'>
                    <Verbatim
                        verbatim={theTest.verbatim}
                    />
                </Route>

                <Route path='/test/fin'>
                    <Greetings
                        greetings={theTest.greetings}
                        isSavedToDB={isSavedToDB}
                        save2Supabase={save2Supabase}
                    />
                </Route>

                <Route path='/test/user'>
                    <User />
                </Route>

                <Route exact path='/test'>
                    <Home
                        title={theTest.home.title}
                        description={theTest.home.description} />
                </Route>

            </Switch>
        </>
    )
}

export default Test;