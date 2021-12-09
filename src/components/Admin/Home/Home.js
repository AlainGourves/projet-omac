import './home.scss';
import { supabase } from '../../../supabaseClient';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import QuizTable from '../QuizTable/QuizTable';
import { ChevronDown, ChevronUp, Edit, Trash } from 'react-feather';

function Home() {
    const [allTests, setAllTests] = useState([]);
    const [testsOrder, setTestsOrder] = useState('created_at');
    const [dateAscending, setDateAscending] = useState(false);
    const [nameAscending, setNameAscending] = useState(true);
    const [currentTest, setCurrentTest] = useState(0); // ID du test actif

    // options for formatting dates
    const dateOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
    }

    // Récupère les infos sur les tests
    const fetchTestsList = async () => {
        try {
            const { data, error } = await supabase
                .from('tests')
                .select('id, created_at, is_current, name')
                .order(testsOrder, { ascending: (testsOrder === 'name') ? nameAscending : dateAscending });
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
    }

    useEffect(() => {
        fetchTestsList();
    }, []);

    // Tri des tests en fonction des états
    useEffect(() => {
        console.log("order:", testsOrder, "date", (dateAscending ? 'ASC' : 'DESC'), "nom", (nameAscending ? 'ASC' : 'DESC'))
        switch (testsOrder) {
            case 'created_at':
                // tri par date
                console.log("par date")
                setAllTests(allTests.sort((a, b) => {
                    return (dateAscending) ? a.created_at - b.created_at : b.created_at - a.created_at;
                }));
                break;
            case 'name':
                // tri par nom
                console.log("par nom")
                setAllTests(allTests.sort((a, b) => {
                    return (nameAscending) ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                }))
                break;
            default:
                break;
        }
    }, [allTests, testsOrder, dateAscending, nameAscending])

    const deleteTest = (ev) => {
        let id = parseInt(ev.target.closest('button').dataset.remove);
        // TODO: demande de confirmation par un modal
        removeTestFromDb(id);
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

    const orderByName = (ev) => {
        if (testsOrder === 'created_at') {
            setTestsOrder('name');
            return;
        }
        setNameAscending(!nameAscending);
    }

    const orderByDate = (ev) => {
        if (testsOrder === 'name') {
            setTestsOrder('created_at');
            return;
        }
        setDateAscending(!dateAscending)
    }

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
            // fetchTestsList();
        }
    }

    // Export/Import JSON files
    const exportJSON = async function (table) {
        // table to export ('tests' || 'quizs')
        console.log("export JSON de ", table)
        try {
            const { data: records, error } = await supabase
                .from(`${table}`)
                .select()
                .order('id', { ascending: true });

            console.log("records:", records)
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
            fetchTestsList();
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

    const importTests = (ev) => {
        ev.preventDefault();
        importJSON('tests');
        // TODO: rafraichir l'affichage
    }

    const exportTests = (ev) => {
        ev.preventDefault();
        exportJSON('tests');
    }

    let testsList = [];
    if (allTests.length) {

        testsList = allTests.map(({ id, name, created_at }) => (
            <tr key={id}>
                <td>
                    <input
                        onChange={changeCurrentTest}
                        value={id}
                        type="radio"
                        name="isCurrent"
                        checked={(currentTest && currentTest === id) ? true : false}
                    />
                </td>
                <td>{name}</td>
                <td>{new Intl.DateTimeFormat('fr-FR', dateOptions).format(created_at)}</td>
                <td>
                    <NavLink
                        to={`/admin/edit-test/${id}`}
                        data-edit={id}
                        className="icon"
                        title="Modifier ce test"
                    >
                        <Edit />
                    </NavLink>
                </td>
                <td>
                    <button
                        className="icon"
                        type="button"
                        onClick={deleteTest}
                        data-remove={id}
                        title="Supprimer ce test"
                    >
                        <Trash />
                    </button>
                </td>
            </tr>
        ));
    } else {
        testsList = (
            <tr>
                <td colSpan="5" className="text-center text-info">Pas encore de test...</td>
            </tr>
        );
    }

    if (!allTests) {
        // console.log('Store is empty')
        // return null;
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>Acceuil Admin</h1>
            <h2>Tests</h2>
            <p>Sélectionner le test à activer, en modifier un ou en créer un nouveau.</p>
            <table className="table table-hover table-tests">
                <thead className="table-light">
                    <tr>
                        <th scope="col" className="col-1">Actif</th>
                        <th scope="col"
                            onClick={orderByName}
                            className={`clickable ${(testsOrder === 'name') ? "table-info" : ''}`}
                            title={nameAscending ? "Nom, par ordre croissant" : "Nom, par ordre décroissant"}
                        >
                            Nom
                            {(testsOrder === 'name') && (nameAscending) && <ChevronDown />}
                            {(testsOrder === 'name') && (!nameAscending) && <ChevronUp />}
                        </th>
                        <th scope="col"
                            onClick={orderByDate}
                            className={`clickable ${(testsOrder === 'created_at') ? 'table-info col-3' : 'col-3'}`}
                            title={dateAscending ? "Date, par ordre croissant" : "Date, par ordre décroissant"}
                        >
                            Date
                            {(testsOrder === 'created_at') && (dateAscending) && <ChevronDown />}
                            {(testsOrder === 'created_at') && (!dateAscending) && <ChevronUp />}
                        </th>
                        <th scope="col" className="col-1"></th>
                        <th scope="col" className="col-1"></th>
                    </tr>
                </thead>
                <tbody>
                    {testsList}
                </tbody>
            </table>

            <div className="d-flex justify-content-around">
                <button
                    onClick={exportTests}
                    className='btn btn-outline-primary'
                >Export Tests</button>

                <button
                    onClick={importTests}
                    className='btn btn-outline-primary'
                >Import Tests</button>
                <NavLink to="/admin/edit-test">
                    <button className='btn btn-primary'>Nouveau test</button>
                </NavLink>
            </div>

            <h2>Quizs</h2>
            <QuizTable
                dateOptions={dateOptions}
                exportJSON={exportJSON}
                importJSON={importJSON}
            />
        </div>
    );
}

export default Home;