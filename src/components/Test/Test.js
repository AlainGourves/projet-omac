import './test.scss';
import { useEffect, useState } from 'react';
import {
    Switch,
    Route,
    useRouteMatch
} from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import Home from './Home/Home';
import User from './User/User';
import Quiz from './Quiz/Quiz';
import Verbatim from './Verbatim/Verbatim';
import Greetings from './Greetings/Greetings';
import Page404 from '../Page404/Page404';
import NoTest from './NoTest/NoTest';
import { supabase } from '../../supabaseClient';
import { useModal } from '../../contexts/ModalContext';

function Test() {

    const { path } = useRouteMatch();

    const { user } = useAuth();
    // Chercher le test courant
    const [theTest, setTheTest] = useState(null);
    const [theQuizs, setTheQuizs] = useState(null);
    const [isNoTest, setIsNoTest] = useState(false);
    
    const [isLoading, setIsLoading] = useState(true);

    const [, setModal] = useModal(); // Laisser la virgule ! (on utilise pas `modal` dans le script => si on l'ajoute ici, il y aura une erreur "unused")
    const [loadingError, setLoadingError] = useState(false);

    const [isSavedToDB, setIsSavedToDB] = useState(false);

    useEffect(() => {
        const getTest = async () => {
            try {
                const { data, error } = await supabase
                    .rpc('get_test_for_user', { 'input_email': `${user.email}` })
                if (error) {
                    throw new Error(error.message);
                }
                if (data) {
                    if (data.length === 0) {
                        // Il n'y a plus de test à faire pour l'invité
                        setIsNoTest(true);
                        setIsLoading(false);
                    } else {
                        setTheTest({
                            id: data[0].id,
                            home: data[0].home,
                            quizs_ids: data[0].quizs_ids,
                            isVerbatim: (data[0].verbatim.length > 0 && data[0].verbatim[0] !== ''),
                            verbatim: data[0].verbatim,
                            greetings: data[0].greetings,
                        });
                    }
                }
            } catch (error) {
                console.error("getTest error:", error)
                setLoadingError(true);
            }
        }
        if (!theTest) {
            getTest();
        }
    }, [user, theTest, setLoadingError]);

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
            setIsLoading(false);
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
            verbatim = verbatim.map((verb) => {
                verb = verb.replaceAll(/\t/g, ' ');
                // on en profite pour supprimer les lignes vides
                verb = verb.replaceAll(/\n+/g, '\n');
                return verb.trim();
            });
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
            // MàJ de 'annuaire' pour les invités
            // NB: On fait la requête pour tout le monde plutôt que de distinguer en tre invités et les autres
            await supabase
                .from('annuaire')
                .update({is_done: true, done_at: new Date()})
                .match({email: user.email, test_id: theTest.id});
        } catch (error) {
            console.log("Erreur enregistrement DB:", error.message);
        } finally {
            setIsSavedToDB(true)
        }
    }

    if (isLoading) {
        return (
            <>
                <h1>Chargement...</h1>
            </>
        )
    }

    if (isNoTest) {
        return <NoTest />
    }

    return (
        <>
            <Switch>
                <Route path={`${path}/quiz/:id`}>
                    {/* `id` correspond à l'index du quiz dans le array quizs_ids */}
                    <Quiz
                        quizs={theQuizs}
                        isVerbatim={theTest.isVerbatim}
                    />
                </Route>

                <Route path={`${path}/verbatim/:id`}>
                    <Verbatim
                        verbatim={theTest.verbatim}
                    />
                </Route>

                <Route path={`${path}/fin`}>
                    <Greetings
                        greetings={theTest.greetings}
                        isSavedToDB={isSavedToDB}
                        save2Supabase={save2Supabase}
                    />
                </Route>

                <Route path={`${path}/user`}>
                    <User />
                </Route>

                <Route exact path={`${path}`}>
                    <Home
                        title={theTest.home.title}
                        description={theTest.home.description} />
                </Route>

                <Route path={`${path}/*`}>
                    <Page404 />
                </Route>

            </Switch>
        </>
    )
}

export default Test;