const sql = require("../config/pg_db.js");

class Tache {
    constructor(id, utilisateur_id, titre, description, date_debut, date_echeance, complete) {
        this.id = id;
        this.utilisateur_id = utilisateur_id;
        this.titre = titre;
        this.description = description;
        this.date_debut = date_debut;
        this.date_echeance = date_echeance;
        this.complete = complete;
    }

    static async trouverTache(id, cle_api, sousTacheId) {
        try {
            const utilisateur_id = await this.trouverUtilisateurIdParCleAPI(cle_api);
            let requete = `
                SELECT 
                    taches.*,
                    (SELECT json_agg(json_build_object('id', sous_taches.id, 'titre', sous_taches.titre, 'complete', sous_taches.complete))
                FROM 
                    sous_taches
                WHERE 
                    sous_taches.tache_id = taches.id`;

            const params = [];

            if (sousTacheId) {
                console.log("sousTacheActif");
                requete += ` AND sous_taches.id = $1`;
                params.push(sousTacheId);
            }
            
            requete += `
                    ) AS Liste_sous_taches
                FROM 
                    taches
                INNER JOIN 
                    utilisateur ON taches.utilisateur_id = utilisateur.id
                WHERE 
                    taches.id = $${params.length + 1} AND utilisateur.id = $${params.length + 2}`;

            params.push(id);
            params.push(utilisateur_id);
                
            const resultat = await sql.query(requete, params);
            if (!resultat.rows[0]) {
                throw {
                    message: `Tâche introuvable avec l'id ${id}`,
                    code: 404
                };
            }

            if (sousTacheId && resultat.rows[0].liste_sous_taches == null){
                throw {
                    message: `Sous-tâche introuvable avec l'id ${sousTacheId}`,
                    code: 404
                };
            }

            console.log(resultat);
            return resultat.rows[0];
        } catch (erreur) {
            throw erreur;
        }
    }

    static async listeTaches(afficherToutes = false, cle_api) {
        try {
            const utilisateur_id = await this.trouverUtilisateurIdParCleAPI(cle_api);

            let requete = 'SELECT taches.id, titre FROM taches INNER JOIN utilisateur ON taches.utilisateur_id = utilisateur.id WHERE utilisateur.id = $1';

            if (!afficherToutes) {
                requete += ' AND taches.complete = FALSE';
            }
            requete += ' ORDER BY taches.titre';

            const params = [utilisateur_id];
            const resultat = await sql.query(requete, params);
            return resultat.rows;
        } catch (erreur) {
            throw erreur;
        }
    }

    static async ajouterTache(nouvelleTache, cle_api) {
        try {
            const utilisateur_id = await this.trouverUtilisateurIdParCleAPI(cle_api);
            const requete = `INSERT INTO taches (utilisateur_id, titre, description, 
                date_debut, date_echeance, complete) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
            const params = [utilisateur_id, nouvelleTache.titre, nouvelleTache.description, 
                nouvelleTache.date_debut, nouvelleTache.date_echeance, nouvelleTache.complete];
            const resultat = await sql.query(requete, params);
            return resultat.rows[0];
        } catch (erreur) {
            throw erreur;
        }
    }

    static async modifierTache(id, tacheModifiee, cle_api) {
        try {
            await this.trouverTache(id, cle_api);

            const setClauses = [];
            const params = [];
    
            Object.entries(tacheModifiee).forEach(([key, value], index) => {
                setClauses.push(`${key} = $${index + 1}`);
                params.push(value);
            });
    
            const setClauseString = setClauses.join(', ');
    
            const requete = `UPDATE taches SET ${setClauseString} WHERE id = $${params.length + 1} RETURNING *`;
            params.push(id);
            const resultat = await sql.query(requete, params);
            return resultat.rows[0];
        } catch (erreur) {
            throw erreur;
        }
    }

    static async modifierStatutTache(id, statut, cle_api) {
        try {
            await this.trouverTache(id, cle_api);
            const requete = `UPDATE taches SET complete = $1 WHERE id = $2 RETURNING *`;
            const params = [statut, id];
            const resultat = await sql.query(requete, params);
            return resultat.rows[0];
        } catch (erreur) {
            throw erreur;
        }
    }
    
    static async supprimerTache(id, cle_api) {
        try {
            await this.trouverTache(id, cle_api);
            const requete = `DELETE FROM taches WHERE id = $1`;
            const params = [id];
            console.log(requete);
            console.log(params);
            const resultat = await sql.query(requete, params);
            return resultat.rowCount;
        } catch (erreur) {
            throw erreur;
        }
    }

    static async ajouterSousTache(tache_id, nouvelleSousTache, cle_api) {
        try {
            await this.trouverTache(tache_id, cle_api);
            const requete = `INSERT INTO sous_taches (tache_id, titre, complete) VALUES ($1, $2, $3) RETURNING *`;
            const params = [tache_id, nouvelleSousTache.titre, nouvelleSousTache.complete];
            const resultat = await sql.query(requete, params);
            return resultat.rows[0];
        } catch (erreur) {
            throw erreur;
        }
    }

    static async modifierSousTache(tache_id, id, sousTacheModifiee, cle_api) {
        try {
            await this.trouverTache(tache_id, cle_api, id);
            
            const { titre, complete } = sousTacheModifiee;
            const requete = `UPDATE sous_taches SET titre = $1, complete = $2 WHERE id = $3 RETURNING *`;
            const params = [titre, complete, id];

            const resultat = await sql.query(requete, params);
            return resultat.rows[0];
        } catch (erreur) {
            throw erreur;
        }
    }

    static async modifierStatutSousTache(tache_id, id, statut, cle_api) {
        try {
            await this.trouverTache(tache_id, cle_api, id);
            const requete = `UPDATE sous_taches SET complete = $1 WHERE id = $2 RETURNING *`;
            const params = [statut, id];
            const resultat = await sql.query(requete, params);
            return resultat.rows[0];
        } catch (erreur) {
            throw erreur;
        }
    }

    static async supprimerSousTache(tache_id, id, cle_api) {
        try {
            await this.trouverTache(tache_id, cle_api, id);
            const requete = `DELETE FROM sous_taches WHERE id = $1`;
            const params = [id];
            console.log(requete);
            console.log(params);
            const resultat = await sql.query(requete, params);
            console.log(resultat);
            return resultat.rowCount;
        } catch (erreur) {
            throw erreur;
        }
    }

    static async trouverUtilisateurIdParCleAPI(cle_api) {
        try {
            const requete = 'SELECT id FROM utilisateur WHERE cle_api = $1';
            const params = [cle_api];
            const resultat = await sql.query(requete, params);

            if (!resultat.rows || resultat.rows.length === 0) {
                throw {
                    message: "Aucun utilisateur trouvé avec la clé API spécifiée.",
                    code: 404
                };
            }
            
            return resultat.rows[0].id;
        } catch (erreur) {
            throw erreur;
        }
    }
    
}

module.exports = Tache;