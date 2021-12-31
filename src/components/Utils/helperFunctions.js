// TODO: tester le support au début du questionnaire et agir en conséquence
export const supportsLocalStorage = () => {
    let supports = false;
    try {
        if ('localStorage' in window) {
            supports = true;
        }
    } catch (err) {
        console.warn("Erreur Support localStorage", err);
    }
    return supports;
}

// Fonction pour le stockage d'array d'obj !!!
export const addToLocalStorage = (key, val) => {
    try {
        if (localStorage.getItem(key)) {
            // La clé existe déjà -> mise à jour de la valeur
            const saved = JSON.parse(localStorage.getItem(key));
            saved.push(val);
            // stockage
            localStorage.setItem(key, JSON.stringify(saved));
        } else {
            // La clé n'existait pas, on la crée et on place val dans un array
            localStorage.setItem(key, JSON.stringify([val]));
        }
    } catch (err) {
        console.warn("Erreur enregistrement localStorage", err);
    }
}