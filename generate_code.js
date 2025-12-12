//Permet de generer un code aleatoire de 5 chiffres
export function generateCode() {
    const code = Math.floor(Math.random() * (99999 - 10000) + 10000);
    return code;
}