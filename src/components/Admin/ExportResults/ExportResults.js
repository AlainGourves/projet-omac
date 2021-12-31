import './export.scss';
import { supabase } from '../../../supabaseClient';
import { useEffect, useState, useCallback } from 'react';
import TestList from '../TestList/TestList';

function ExportResults() {

    const [allTests, setAllTests] = useState([]);

    // Récupère les infos sur les tests
    const fetchTestsList = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('tests')
                .select('id, created_at, is_current, name')
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

    console.log("allTests:", allTests)

    return (
        <section>
            <h2>Export des résultats</h2>
            <p>Affichage des tests enregistrés pour sélectionner les résultats à exporter en fichier CSV</p>

            {allTests &&
                <TestList
                    allTests={allTests}
                />
            }
        </section>
    );
}

export default ExportResults;