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
export const addToLocalStorage = (key, val, idx = 0) => {
    try {
        if (localStorage.getItem(key)) {
            // La clé existe déjà -> mise à jour de la valeur
            const saved = JSON.parse(localStorage.getItem(key));
            saved[idx] = val;
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

// Générer des mots de passe de 10 chars
export const generatePassword = () => {
    const specials = ['_', '-', '!', '*', '/', '&', '#', '+', '=', '%', '$'];
    // position aléatoire [0-n]
    const randomPos = (n) => {
        return Math.floor(Math.random() * n);
    }
    // random special char
    const randomSpecial = () => {
        return specials[randomPos(specials.length)];
    }
    let str1 = Math.random().toString(36).slice(-6);
    let str2 = Date.now().toString(36).substring(5, 8); // 3 chars
    // place str2 à une position aléatoire dans str1
    let pos = randomPos(str1.length);
    // array de  9 caractères [a-z0-9]
    let password = [str1.slice(0, pos), str2, str1.slice(pos)].join('').split('');
    // Insère un caractère spécial à une position aléatoire (mais pas en premier)
    password.splice(1 + randomPos(8), 0, randomSpecial());
    // Entre 1 & 3 lettres en CAP
    let n = 1 + randomPos(2);
    while (n > 0) {
        let l = randomPos(password.length);
        if (!Number(password[l]) && password[l] !== 'i' && password[l] !== 'l') {
            password[l] = password[l].toUpperCase();
            n--;
        }
    }
    return password.join('');
}