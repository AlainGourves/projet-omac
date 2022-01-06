import './export.scss';
import { supabase } from '../../../supabaseClient';
import { useEffect, useState, useCallback } from 'react';
import { DateTime } from 'luxon';
import ExportForm from '../ExportForm/ExportForm';

function ExportResults() {

    const [allTests, setAllTests] = useState([]);
    const [allQuizs, setAllQuizs] = useState([]);
    const [testId, setTestId] = useState(0);
    const [quizId, setQuizId] = useState(0);
    const [quizTitle, setQuizTitle] = useState(null);
    const [loadResults, setLoadResults] = useState(false);
    const [nbTestResults, setNbTestResults] = useState(0);
    const [resultsStartDate, setResultsStartDate] = useState(null);
    const [resultsEndDate, setResultsEndDate] = useState(null);
    const [diffBetweenResults, setDiffBetweenResults] = useState(null);
    const [testQuizs, setTestQuizs]
        = useState([]);

    // Récupère les infos sur les tests
    const fetchTestsList = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('tests')
                .select('id, created_at, quizs_ids, name')
                .order('created_at', { ascending: false });
            if (error) {
                throw new Error(error.message);
            }
            if (data) {
                // transforme les strings `created_at` en Date
                // et récupère le test actif
                data.forEach((d) => {
                    d.created_at = new Date(d.created_at);
                });
                setAllTests(data);
            }
        } catch (error) {
            console.log("failed to fetch all tests:", error);
        }
    }, [])

    useEffect(() => {
        fetchTestsList();
    }, [fetchTestsList]);

    // Récupère les infos sur les quizs
    const fetchQuizsList = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('quizs')
                .select('id, title')
            if (error) {
                throw new Error(error.message);
            }
            if (data) {
                setAllQuizs(data);
            }
        } catch (error) {
            console.log("failed to fetch all quizs:", error);
        }
    }, [])

    useEffect(() => {
        fetchQuizsList();
    }, [fetchQuizsList]);

    useEffect(() => {
        // Recherche le nombre de résultats enregistrés pour le test en question
        // et leur date d'enregistrement (pour pouvoir par la suite sélectionner une plage temporelle)
        const searchTestResults = async (id) => {
            try {
                setLoadResults(true);
                const { data, error } = await supabase
                    .rpc('get_test_results_by_id', { 'test_id_input': id });
                if (error) {
                    throw new Error(error.message)
                }
                if (data) {
                    setLoadResults(false);
                    if (data.length > 0) {
                        setNbTestResults(data.length);
                        setResultsStartDate(DateTime.fromISO(data[0].created_at));
                        setResultsEndDate(DateTime.fromISO(data[data.length - 1].created_at));
                    }
                }
            } catch (error) {
                console.warn(error)
            }
        }

        if (testId > 0) {
            searchTestResults(testId);
        }
    }, [testId])

    useEffect(() => {
        // Calcule la différence (en jours) entre les premiers résultats et les derniers
        if (resultsStartDate && resultsEndDate) {
            setDiffBetweenResults(resultsEndDate.diff(resultsStartDate, 'days').as('days'));
        }
    }, [resultsStartDate, resultsEndDate])

    if (testId > 0 && testQuizs.length === 0) {
        // Récupère les ids des quizs du test sélectionné
        const idx = allTests.findIndex((el) => Number(el.id) === Number(testId));
        if (idx !== -1) {
            setTestQuizs(() => {
                let arr = [];
                allTests[idx].quizs_ids.forEach((id) => {
                    const idx = allQuizs.findIndex((el) => Number(el.id) === Number(id));
                    arr.push({
                        id,
                        title: allQuizs[idx].title,
                    })
                });
                return arr;
            });
        }
    }

    const selectTest = (ev) => {
        if (ev.target.value > 0) {
            // réinitialisation
            setTestQuizs([]);
            setNbTestResults(0);
            setResultsStartDate(null);
            setResultsEndDate(null);
            setDiffBetweenResults(null);
            setQuizId(0);
            setQuizTitle(null);
            setTestId(ev.target.value);
        }
    }

    const selectQuiz = (ev) => {
        if (ev.target.value > 0) {
            setQuizId(ev.target.value);
        }
    }

    useEffect(() => {
        if (quizId > 0) {
            const theQuiz = testQuizs.find((el) => Number(el.id) === Number(quizId));
            setQuizTitle(theQuiz.title);
        }
    }, [testQuizs, quizId])

    const submitVerbatim = (values) => {
        console.log("Je suis le parent !!!")
        if (values.startDate && values.endDate) {
            const start = DateTime.fromISO(values.startDate);
            const end = DateTime.fromISO(values.endDate);
            console.log("start:", start);
            console.log("end:", end);
        }
    }

    const submitExportQuiz = (values) => {
        console.log("Exporter les réultats du quiz")
        if (values.startDate && values.endDate) {
            const start = DateTime.fromISO(values.startDate);
            const end = DateTime.fromISO(values.endDate);
            console.log("start:", start);
            console.log("end:", end);
        }
    }

    const submitDeleteResults = (values) => {
        console.log("Supprimer des résultats de quiz de la base.")
    }

    return (
        <main>
            <h2>Export des résultats</h2>
            <p>Affichage des tests enregistrés pour sélectionner les résultats à exporter en fichier CSV</p>

            {allTests &&
                <section className='config'>
                    <div className='d-flex flex-sm-column flex-md-row mb-3'>
                        <div className='input-group'>
                            <label className='input-group-text w-100'>Sélectionner un test:
                                <select
                                    className="form-select"
                                    onChange={selectTest}
                                >
                                    <option value="0" >Sélectionner...</option>
                                    {allTests.map(({ id, name }) => (
                                        <option
                                            key={id}
                                            value={id}
                                            className=""
                                        >{name}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {
                            (testQuizs.length > 0 && nbTestResults > 0) &&
                            <div className='input-group'>
                                <label className='input-group-text w-100'>Sélectionner le quiz:
                                    <select
                                        className="form-select"
                                        onChange={selectQuiz}
                                    >
                                        <option value="0" >Sélectionner...</option>
                                        {testQuizs.map(({ id, title }) => (
                                            <option
                                                key={id}
                                                value={id}
                                                className=""
                                            >{title}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        }
                    </div>

                    {(testId !== 0) &&
                        <div>
                            {/* Affichage du nombre de résultats */}
                            {
                                (loadResults) ? (
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Chargement...</span>
                                    </div>
                                ) : (
                                    <div className='alert alert-info'>
                                        {
                                            // Self invoking function
                                            (() => {
                                                if (nbTestResults === 0) {
                                                    return (<>Il n'y a pas encore de résultat pour ce test.</>)
                                                } else {
                                                    let output = <>Il y a <strong>{nbTestResults}</strong> enregistrement{(nbTestResults > 1) ? 's' : ''}</>;
                                                    if (diffBetweenResults < 1) {
                                                        return (<>{output}, le <strong>{resultsStartDate && resultsStartDate.toLocaleString()}</strong>.</>)
                                                    } else {
                                                        return (<>{output}, entre le <strong>{resultsStartDate && resultsStartDate.toLocaleString()}</strong> et le <strong>{resultsEndDate && resultsEndDate.toLocaleString()}</strong>.</>)
                                                    }
                                                }
                                            })()
                                        }
                                    </div>
                                )
                            }
                        </div>
                    }
                </section>
            }
            <section className='export'>
                {
                    // Export Quiz Results
                    (quizId !== 0 && quizTitle) &&
                    <ExportForm
                        submitFn={submitExportQuiz}
                        title={"Exporter les résultats du quiz."}
                        startDate={resultsStartDate}
                        endDate={resultsEndDate}
                    />
                }

                {(testId !== 0 && nbTestResults > 0) &&
                    <>
                        {/* Verbatim */}
                        <ExportForm
                            submitFn={submitVerbatim}
                            title={"Exporter les verbatim du test."}
                            startDate={resultsStartDate}
                            endDate={resultsEndDate}
                        />

                        {/* Supprimer des résultats */}
                        <ExportForm
                            submitFn={submitDeleteResults}
                            title={"Supprimer des résultats de la base de données."}
                            startDate={resultsStartDate}
                            endDate={resultsEndDate}
                        />
                    </>
                }
            </section>
        </main>
    );
}

export default ExportResults;