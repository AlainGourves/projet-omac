import './home.scss';
import { supabase } from '../../../supabaseClient';
import { useEffect, useState, useCallback } from 'react';
import TestTable from '../TestTable/TestTable';
import QuizTable from '../QuizTable/QuizTable';

function Home() {
    // States Tests
    const [allTests, setAllTests] = useState([]);
    const [testsOrderBy, setTestsOrderBy] = useState('created_at');
    const [testsOrderByDateAsc, setTestsOrderByDateAsc] = useState(false);
    const [testsOrderByNameAsc, setTestsOrderByNameAsc] = useState(true);
    const [currentTest, setCurrentTest] = useState(0); // ID du test actif
    // States Quizs
    const [allQuizs, setAllQuizs] = useState([]);
    const [quizsOrderBy, setQuizsOrderBy] = useState('created_at');
    const [quizsOrderByDateAsc, setQuizsOrderByDateAsc] = useState(false);
    const [quizsOrderByTitleAsc, setQuizsOrderByTitleAsc] = useState(true);

    // options for formatting dates
    const dateOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
    }

    // Récupère les infos sur les tests
    const fetchTestsList = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('tests')
                .select('id, created_at, is_current, name')
                .order(testsOrderBy, { ascending: (testsOrderBy === 'name') ? testsOrderByNameAsc : testsOrderByDateAsc });
            if (error) {
                throw new Error(error.message);
            }
            if (data) {
                // transforme les strings `created_at` en Date
                // et récupère le test actif
                data.forEach((d) => {
                    d.created_at = new Date(d.created_at);
                    if (d.is_current) {
                        setCurrentTest(d.id);
                    }
                });
                setAllTests(data);
            }
        } catch (error) {
            console.log("failed to fetch all tests:", error);
        }
    }, [testsOrderBy, testsOrderByNameAsc, testsOrderByDateAsc])

    useEffect(() => {
        fetchTestsList();
    }, [fetchTestsList]);

    // Récupère les infos sur les quizs
    const fetchQuizsList = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('quizs')
                .select('id, created_at, title')
                .order(quizsOrderBy, { ascending: (quizsOrderBy === 'title') ? quizsOrderByTitleAsc : quizsOrderByDateAsc });
            if (data) {
                // transforme les strings `created_at` en Date
                data.forEach((d) => {
                    d.created_at = new Date(d.created_at);
                });
                setAllQuizs(data);
            }
        } catch (error) {
            console.log("failed to fetch all quizs:", error);
        }
    }, [quizsOrderBy, quizsOrderByDateAsc, quizsOrderByTitleAsc])

    useEffect(() => {
        fetchQuizsList();
    }, [fetchQuizsList]);

    // _________________ Fonctions de tri _______________
    // Tri des tests en fonction des états
    useEffect(() => {
        console.log("order:", testsOrderBy, "date", (testsOrderByDateAsc ? 'ASC' : 'DESC'), "nom", (testsOrderByNameAsc ? 'ASC' : 'DESC'))
        switch (testsOrderBy) {
            case 'created_at':
                // tri par date
                console.log("par date")
                setAllTests(allTests.sort((a, b) => {
                    return (testsOrderByDateAsc) ? a.created_at - b.created_at : b.created_at - a.created_at;
                }));
                break;
            case 'name':
                // tri par nom
                console.log("par nom")
                setAllTests(allTests.sort((a, b) => {
                    return (testsOrderByNameAsc) ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                }))
                break;
            default:
                break;
        }
    }, [allTests, testsOrderBy, testsOrderByDateAsc, testsOrderByNameAsc])

    // Tri des quizs en fonction des états
    useEffect(() => {
        console.log("order:", quizsOrderBy, "date", (quizsOrderByDateAsc ? 'ASC' : 'DESC'), "nom", (quizsOrderByTitleAsc ? 'ASC' : 'DESC'))
        switch (quizsOrderBy) {
            case 'created_at':
                // tri par date
                console.log("par date")
                setAllQuizs(allQuizs.sort((a, b) => {
                    return (quizsOrderByDateAsc) ? a.created_at - b.created_at : b.created_at - a.created_at;
                }));
                break;
            case 'title':
                // tri par nom
                console.log("par titre")
                setAllQuizs(allQuizs.sort((a, b) => {
                    return (quizsOrderByTitleAsc) ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
                }))
                break;
            default:
                break;
        }
    }, [allQuizs, quizsOrderBy, quizsOrderByDateAsc, quizsOrderByTitleAsc])

    const changeCurrentTest = async (ev) => {
        let prevCurrent = currentTest;
        let newCurrent = parseInt(ev.target.value);
        console.log("changement de test actif, nouveau:", newCurrent)
        try {
            if (prevCurrent) {
                // traite l'ancien courant s'i existait (valeur initiale : 0)
                await supabase
                    .from('tests')
                    .update({ 'is_current': false })
                    .eq('id', prevCurrent)
            }
            await supabase
                .from('tests')
                .update({ 'is_current': true })
                .eq('id', newCurrent)
        } catch (error) {
            console.warn("Erreur update test courant :", error);
        } finally {
            setCurrentTest(newCurrent)
        }
    }

    const orderTestsByName = (ev) => {
        if (testsOrderBy === 'created_at') {
            setTestsOrderBy('name');
            return;
        }
        setTestsOrderByNameAsc(!testsOrderByNameAsc);
    }

    const orderTestsByDate = (ev) => {
        if (testsOrderBy === 'name') {
            setTestsOrderBy('created_at');
            return;
        }
        setTestsOrderByDateAsc(!testsOrderByDateAsc)
    }

    const orderQuizsByTitle = (ev) => {
        if (quizsOrderBy === 'created_at') {
            setQuizsOrderBy('title');
            return;
        }
        setQuizsOrderByTitleAsc(!quizsOrderByTitleAsc);
    }

    const orderQuizsByDate = (ev) => {
        if (quizsOrderBy === 'title') {
            setQuizsOrderBy('created_at');
            return;
        }
        setQuizsOrderByDateAsc(!quizsOrderByDateAsc)
    }

    // _________________ Fonctions BDD _______________
    const addBulk = async function (arr, table) {
        // Préparation du array
        // 1) supprimer les id enregistrés (ils seront automatiquement remplacés à l'insertion)
        // 2) mettre à jour la date à now()
        arr.forEach(a => {
            if (a.hasOwnProperty('id')) delete a.id;
            // MàJ de la date
            // if (a.hasOwnProperty('created_at')) delete a.created_at;
            // Pour les tests : évite d'avoir des problèmes de doublon
            if (a.hasOwnProperty('is_current')) delete a.is_current;
        });
        console.log("ajout en groupe de", arr)
        try {
            await supabase
                .from(`${table}`)
                .insert(arr, { returning: 'minimal' });
        } catch (error) {
            console.warn("Erreur insertion groupée :", error);
        } finally {
            if (table === 'tests') {
                fetchTestsList();
            } else {
                fetchQuizsList();
            }
        }
    }

    const removeTestFromDb = async function (id) {
        console.log("Supprimer le test ", id)
        // TODO: avant de supprimer un test, il faudra supprimer tous les résultats et les verbatim qui y font référence
        try {
            await supabase
                .from('tests')
                .delete()
                .match({ id });
            fetchTestsList();
        } catch (error) {
            console.warn("Erreur suppression test:", error)
        }
    }

    const removeQuizFromDb = async function (id) {
        console.log("Supprimer le quiz ", id)
        try {
            await supabase
                .from('quizs')
                .delete()
                .match({ id });
        } catch (error) {
            console.warn("Erreur suppression quiz:", error)
        } finally {
            fetchQuizsList();
        }
    }

    // _________________ Fonctions Export/Import JSON _______________
    const exportJSON = async function (table) {
        // table to export ('tests' || 'quizs')
        console.log("export JSON de ", table)
        try {
            const { data: records, error } = await supabase
                .from(`${table}`)
                .select()
                .order('id', { ascending: true });

            if (error) {
                throw new Error(error.message);
            }
            const type = table.replace(/s$/, ''); // 'quiz||test'
            const jsonExport = {
                type,
                records
            }
            const data = JSON.stringify(jsonExport, null, 2); // 2: number of spaces used as white space for indenting
            const fileDowloadUrl = URL.createObjectURL(
                new Blob([data])
            );
            // nom du fichier de la forme : '{table}_JJ-MM-AAAA.json'
            const d = Date.now();
            const date = new Intl.DateTimeFormat('fr-FR').format(d).split('/').join('-')
            const link = document.createElement('a');
            link.href = fileDowloadUrl;
            link.setAttribute(
                'download',
                `${table}_${date}.json`
            );
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.warn("Problème avec l'export, erreur:", error)
        }
    }

    const importFile = function () {
        // Simule un click sur input[type=file] créé au passage pour obtenir le fichier à importer
        return new Promise(resolve => {
            const input = document.createElement('input');
            input.type = "file";
            input.accept = "application/json";
            input.onchange = (ev) => {
                // return the selected file
                resolve(ev.target.files[0]);
            };
            document.body.appendChild(input);
            input.click();
            input.parentNode.removeChild(input);
        })
    }

    const importJSON = async function (table) {
        try {
            const file = await importFile();
            if (file.type !== "application/json") throw new Error("Le fichier doit être de type JSON");
            // Lecture du fichier
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                let theJson = reader.result;
                try {
                    let result = JSON.parse(theJson);
                    if (Array.isArray(result.records)) {
                        // c'est un array d'objets représentant chacun un test/quiz
                        addBulk(result.records, table);
                    } else {
                        // TODO: cas d'un quiz seul ?
                        throw new Error("Le fichier JSON ne semble pas conforme.");
                    }
                } catch (e) {
                    console.warn('Problème avec la syntaxe du JSON:', e);
                }
            }, false)
            reader.readAsText(file);
        } catch (err) {
            console.log("Erreur:", err);
        }
    }

    return (
        <div>
            <h1>Acceuil Admin</h1>
            <h2>Tests</h2>
            <p>Sélectionner le test à activer, en modifier un ou en créer un nouveau.</p>
            <TestTable
                allTests={allTests}
                currentTest={currentTest}
                changeCurrentTest={changeCurrentTest}
                removeTestFromDb={removeTestFromDb}
                dateOptions={dateOptions}
                exportJSON={exportJSON}
                importJSON={importJSON}
                orderTestsByName={orderTestsByName}
                orderTestsByDate={orderTestsByDate}
                testsOrderBy={testsOrderBy}
                testsOrderByDateAsc={testsOrderByDateAsc}
                testsOrderByNameAsc={testsOrderByNameAsc}
            />

            <h2>Quizs</h2>
            <QuizTable
                allQuizs={allQuizs}
                removeQuizFromDb={removeQuizFromDb}
                dateOptions={dateOptions}
                exportJSON={exportJSON}
                importJSON={importJSON}
                orderQuizsByTitle={orderQuizsByTitle}
                orderQuizsByDate={orderQuizsByDate}
                quizsOrderBy={quizsOrderBy}
                quizsOrderByTitleAsc={quizsOrderByTitleAsc}
                quizsOrderByDateAsc={quizsOrderByDateAsc}
            />
        </div>
    );
}

export default Home;