const sql = require("../config/pg_db.js");
const bcrypt = require('bcrypt');

class Utilisateur {
    constructor(utilisateur) {
        this.id = utilisateur.id;
        this.nom = utilisateur.nom;
        this.courriel = utilisateur.courriel;
        this.mot_de_passe = utilisateur.mot_de_passe;
        this.cle_api = utilisateur.cle_api;
    }

    static creerUtilisateur(nouvelUtilisateur) {
        return new Promise(async (resolve, reject) => {
            try {
                await Utilisateur.validationCourrielUnique(nouvelUtilisateur.courriel);

                const hashedPassword = await bcrypt.hash(nouvelUtilisateur.mot_de_passe, 10);
                nouvelUtilisateur.mot_de_passe = hashedPassword;

                nouvelUtilisateur.cle_api = Utilisateur.genererCleAPIUnique();

                const requeteInsertion = 'INSERT INTO utilisateur (nom, prenom, courriel, cle_api, password) VALUES ($1, $2, $3, $4, $5)';  
                const parametres = [nouvelUtilisateur.nom, nouvelUtilisateur.prenom, nouvelUtilisateur.courriel, nouvelUtilisateur.cle_api, nouvelUtilisateur.mot_de_passe];
                sql.query(requeteInsertion, parametres);

                resolve({
                    message: "L'utilisateur a été créé",
                    cle_api: nouvelUtilisateur.cle_api
                });
            } catch (erreur) {
                console.error(`Erreur lors de la création de l'utilisateur: ${erreur}`);
                reject(erreur);
            }
        });
    }

    static genererNouvelleCleAPI(courriel, mot_de_passe) {
        return new Promise(async (resolve, reject) => {
            try {
                await Utilisateur.validerUtilisateur(courriel, mot_de_passe);

                let cleAPI = Utilisateur.genererCleAPIUnique();

                const requeteModification = 'UPDATE utilisateur SET cle_api = $1 WHERE courriel = $2';
                const parametresModification = [cleAPI, courriel];
                
                await sql.query(requeteModification, parametresModification);

                resolve({
                    cle_api: cleAPI
                });
            } catch (erreur) {
                reject({
                    message: erreur.message,
                    code: 500
                });
            }
        });
    }

    static validationCourrielUnique(courriel) {
        return new Promise(async (resolve, reject) => {
            try {
                const requete = 'SELECT COUNT(*) FROM utilisateur WHERE courriel = $1';
                const parametres = [courriel];

                const resultat = await sql.query(requete, parametres);

                if (parseInt(resultat.rows[0].count) > 0) {
                    reject({
                        message: "Le courriel est déjà utilisé par un autre utilisateur.",
                        code: 400
                    });
                } else {
                    resolve(true);
                }
            } catch (erreur) {
                console.error(`Erreur asynchrone: ${erreur}`);
                reject(erreur);
            }
        });
    }

    static validerUtilisateur(courriel, mot_de_passe) {
        return new Promise(async (resolve, reject) => {
            try {
                const requete = 'SELECT * FROM utilisateur WHERE courriel = $1';
                const parametres = [courriel];
                const resultat = await sql.query(requete, parametres);

                if (resultat.rows.length === 0) {
                    reject({
                        message: "Aucun utilisateur trouvé avec ce courriel.",
                        code: 404
                    });
                } else {
                    const utilisateur = resultat.rows[0];
                    const motDePasseCorrect = await bcrypt.compare(mot_de_passe, utilisateur.password);

                    if (motDePasseCorrect) {
                        resolve(utilisateur);
                    } else {
                        reject({
                            message: "Courriel ou mot de passe incorrect.",
                            code: 401
                        });
                    }
                }
            } catch (erreur) {
                console.error(`Erreur asynchrone: ${erreur}`);
                reject(erreur);
            }
        });
    }

    static validationCle(cleApi) {
        return new Promise((resolve, reject) => {
            const requete = 'SELECT COUNT(*) AS nbUsager FROM utilisateur u WHERE cle_api = $1';
            const parametres = [cleApi];
    
            sql.query(requete, parametres, (erreur, resultat) => {
                if (erreur) {
                    console.log(`Erreur sqlState ${erreur.sqlState} : ${erreur.sqlMessage}`);
                    reject(erreur);
                } else if (resultat.rows && resultat.rows.length > 0) {
                    resolve(resultat.rows[0].nbusager > 0);
                } else {
                    reject({ message: "Aucun résultat trouvé pour cette clé API", code: 404 });
                }
            });
        });
    }    

    static genererCleAPIUnique() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}

module.exports = Utilisateur;