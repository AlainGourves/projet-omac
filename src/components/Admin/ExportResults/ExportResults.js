import './export.scss';
import { supabase } from '../../../supabaseClient';
import { useEffect, useState, useCallback } from 'react';
import { DateTime } from 'luxon';
import ExportForm from '../ExportForm/ExportForm';

function ExportResults() {

    const [allTests, setAllTests] = useState([]);
    const [allQuizs, setAllQuizs] = useState([]);
    const [testId, setTestId] = useState(0);
    const [testName, setTestName] = useState('');
    const [quizId, setQuizId] = useState(0);
    const [quizTitle, setQuizTitle] = useState(null);
    const [loadingResults, setLoadingResults] = useState(false);
    const [nbTestResults, setNbTestResults] = useState(0);
    const [resultsStartDate, setResultsStartDate] = useState(null);
    const [resultsEndDate, setResultsEndDate] = useState(null);
    const [diffBetweenResults, setDiffBetweenResults] = useState(null);
    const [testQuizs, setTestQuizs] = useState([]);

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
                setLoadingResults(true);
                const { data, error } = await supabase
                .rpc('get_test_results_by_id', { 'test_id_input': id });
                if (error) {
                    throw new Error(error.message)
                }
                if (data) {
                    setLoadingResults(false);
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
            // Récupère le nom du test
            if (allTests.length > 0) {
                setTestName(() => {
                    const theTest = allTests.find((test) => Number(test.id) === Number(testId));
                    return theTest.name;
                });
            }
            searchTestResults(testId);
        }
    }, [allTests, testId, testName]);

    // Récupère le titre du quiz sélectionné
    useEffect(() => {
        if (quizId > 0) {
            const theQuiz = testQuizs.find((el) => Number(el.id) === Number(quizId));
            setQuizTitle(theQuiz.title);
        }
    }, [testQuizs, quizId])

    // Calcule la différence (en jours) entre les premiers résultats et les derniers
    useEffect(() => {
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

    // Requêtes Supabase -------------------------------

    // pour s'assurer que les dates sont bien dans l'ordre chronologique
    const sortDates = function (d1, d2) {
        d1 = DateTime.fromISO(d1);
        d2 = DateTime.fromISO(d2);
        let start = (d1 < d2) ? d1 : d2;
        let end = (d2 >= d1) ? d2 : d1;
        // Par défaut, l'obj DateTime est créé avec 00h00m00s comme heure, les résultats
        // enregitrés le jour de `end` sont donc exclus
        // Pour qu'ils soient inclus, on ajoute un jour à `end`
        end = end.plus({ days: 1 });
        start = start.toISO();
        end = end.toISO();
        return [start, end];
    }

    const exportQuizResults = async function (date1, date2) {
        let dates = sortDates(date1, date2);
        let start = dates[0];
        let end = dates[1];
        try {
            const { error, data } = await supabase
                .from('results')
                .select('client_id, responses, duration')
                .eq('test_id', testId)
                .eq('quiz_id', quizId)
                .gte('created_at', start)
                .lt('created_at', end)
                .order('client_id');
            if (error) {
                throw new Error(error.message);
            }
            if (data) {
                let content = '';
                let durations = [];
                data.forEach((record) => {
                    durations.push([record.client_id, record.duration]);
                    content += `${record.client_id}\t${record.responses
                        .map(obj => Object.values(obj).join('\t'))
                        .join('\t')}\n`;
                });
                exportCSV(`results_quiz_${quizTitle}`, content);
                // console.log(content)
                console.log(durations)
            }
        } catch (error) {
            console.warn(error)
        }
    }

    const exportVerbatim = async function (date1, date2) {
        let dates = sortDates(date1, date2);
        let start = dates[0];
        let end = dates[1];
        try {
            const { error, data } = await supabase
                .from('verbatim')
                .select('client_id, responses')
                .eq('test_id', testId)
                .gte('created_at', start)
                .lt('created_at', end)
                .order('client_id');
            if (error) {
                throw new Error(error.message);
            }
            if (data) {
                let content = '';
                data.forEach((record) => {
                    // Chaque réponse est entourée de double quotes pour prévenir les problèmes liés aux retours à la ligne dans les fichier CSV
                    // cf. https://stackoverflow.com/questions/566052/can-you-encode-cr-lf-in-into-csv-files
                    content += `${record.client_id}\t${record.responses
                        .map(str => `"${str}"`)
                        .join('\t')}\n`;
                });
                exportCSV(`verbatim_${testName}`, content);
            }
        } catch (error) {
            console.warn(error)
        }
    }

    // Export CSV -------------------------------
    const exportCSV = function (name, content) {
        const fileDowloadUrl = URL.createObjectURL(
            new Blob([content])
        );
        const link = document.createElement('a');
        link.href = fileDowloadUrl;
        link.setAttribute(
            'download',
            `${name}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }

    // Gestion des FORMs -------------------------------
    const submitVerbatim = (values) => {
        if (values.startDate && values.endDate) {
            exportVerbatim(values.startDate, values.endDate);
        }
    }

    const submitExportQuiz = (values) => {
        if (values.startDate && values.endDate) {
            exportQuizResults(values.startDate, values.endDate);
        }
    }

    const submitDeleteResults = (values) => {
        alert("Supprimer des résultats de quiz de la base.")
    }

    return (
        <main>
            <h2>Gestion des résultats</h2>

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
                                (loadingResults) ? (
                                    <div className="d-flex justify-content-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Chargement...</span>
                                        </div>
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
                        body={<div className="fs-6">
                            <p>Export en fichier CSV (avec TAB comme séparateur), sous la forme :</p>
                            <pre className='text-info bg-dark'>
                                [identifiant utilisateur][<em>x</em> item 1][<em>y</em> item 1]...[<em>x</em> item <em>n</em>][<em>y</em> item <em>n</em>](fin de ligne)
                            </pre>
                            <p>Les positions (<em>x</em>, <em>y</em>) sont exprimées en % des dimensions de la carte, avec 3 décimales.</p>
                        </div>}
                        startDate={resultsStartDate}
                        endDate={resultsEndDate}
                        diff={diffBetweenResults}
                        alert={false}
                    />
                }

                {(testId !== 0 && nbTestResults > 0) &&
                    <>
                        {/* Verbatim */}
                        <ExportForm
                            submitFn={submitVerbatim}
                            title={"Exporter les verbatim du test."}
                            body={<p>Export en fichier CSV (avec TAB comme séparateur).</p>}
                            startDate={resultsStartDate}
                            endDate={resultsEndDate}
                            diff={diffBetweenResults}
                            alert={false}
                        />

                        {/* Supprimer des résultats */}
                        <ExportForm
                            submitFn={submitDeleteResults}
                            title={"Supprimer des résultats de la base de données."}
                            body={<p className='alert alert-warning'>Rien pour le moment.</p>}
                            startDate={resultsStartDate}
                            endDate={resultsEndDate}
                            diff={diffBetweenResults}
                            alert={true}
                        />
                    </>
                }
            </section>
        </main>
    );
}

export default ExportResults;