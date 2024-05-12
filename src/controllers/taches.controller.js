const Tache = require("../models/taches.model.js");

exports.listeTaches = (req, res) => {
    const afficherToutes = req.query.afficherToutes;
    const cle_api = req.headers.authorization;

    Tache.listeTaches(afficherToutes, cle_api)
        .then((taches) => {
            res.status(200).send(taches);
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.trouverTache = (req, res) => {
    const tacheId = isNaN(parseInt(req.params.id)) ? res.status(400).json({ message: "La tache id doit être un integer." }) : parseInt(req.params.id);
    const cle_api = req.headers.authorization;

    Tache.trouverTache(tacheId, cle_api)
        .then((tache) => {
            res.status(200).send(tache);
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.ajouterTache = (req, res) => {
    const nouvelleTache = req.body;
    const cle_api = req.headers.authorization;

    if (!nouvelleTache.titre) {
        return res.status(400).json({ message: "Le champ 'titre' est requis dans le corps de la requête." });
    }

    let erreurValidation = validerTypeChamps(nouvelleTache, true);
    if (erreurValidation) {
        return res.status(400).json({ message: erreurValidation.message });
    }

    Tache.ajouterTache(nouvelleTache, cle_api)
        .then((tache) => {
            res.status(201).send({
                message: `La tâche ${tache.titre} a été ajoutée avec succès`,
                tache: tache
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.modifierTache = (req, res) => {
    const tacheId = isNaN(parseInt(req.params.id)) ? res.status(400).json({ message: "La tache id doit être un integer." }) : parseInt(req.params.id);
    const tacheModifiee = req.body;
    const cle_api = req.headers.authorization;

    let erreurValidation = champsAuthoriserTache(tacheModifiee);

    erreurValidation = validerTypeChamps(tacheModifiee, true);
    if (erreurValidation) {
        return res.status(400).json({ message: erreurValidation.message });
    }

    Tache.modifierTache(tacheId, tacheModifiee, cle_api)
        .then((resultat) => {
            res.status(200).send({
                message: `La tâche ${resultat.titre} a été modifiée avec succès`,
                tache: resultat
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.modifierStatutTache = (req, res) => {
    const tacheId = isNaN(parseInt(req.params.id)) ? res.status(400).json({ message: "La tache id doit être un integer." }) : parseInt(req.params.id);
    const nouveauStatut = req.params.statut;
    const cle_api = req.headers.authorization;

    let erreurValidation = verifierStatut(nouveauStatut, true);
    if (erreurValidation) {
        return res.status(400).json({ message: erreurValidation.message });
    }

    Tache.modifierStatutTache(tacheId, nouveauStatut, cle_api)
        .then((resultat) => {
            res.status(200).send({
                message: `Le statut de la tâche ${resultat.titre} a été modifié avec succès`,
                tache: resultat
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.supprimerTache = (req, res) => {
    const tacheId = isNaN(parseInt(req.params.id)) ? res.status(400).json({ message: "La tache id doit être un integer." }) : parseInt(req.params.id);
    const cle_api = req.headers.authorization;

    Tache.supprimerTache(tacheId, cle_api)
        .then(() => {
            res.status(200).send({
                message: `Tâche supprimée avec succès (id: ${tacheId})`
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.ajouterSousTache = (req, res) => {
    const tacheId = isNaN(parseInt(req.params.id)) ? res.status(400).json({ message: "La tache id doit être un integer." }) : parseInt(req.params.id);
    const nouvelleSousTache = req.body;
    const cle_api = req.headers.authorization;

    if (!nouvelleSousTache.titre) {
        return res.status(400).json({ message: "Le champ 'titre' est requis dans le corps de la requête." });
    }
   
    let erreurValidation = champsAuthoriserSousTache(nouvelleSousTache);

    erreurValidation = validerTypeChamps(nouvelleSousTache, true);
    if (erreurValidation) {
        return res.status(400).json({ message: erreurValidation.message });
    }
    
    Tache.ajouterSousTache(tacheId, nouvelleSousTache, cle_api)
        .then((sousTache) => {
            res.status(201).send({
                message: `La sous-tâche ${sousTache.titre} a été ajoutée avec succès à la tâche ${tacheId}`,
                sousTache: sousTache
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.modifierSousTache = (req, res) => {
    const tacheId = isNaN(parseInt(req.params.id)) ? res.status(400).json({ message: "La tache id doit être un integer." }) : parseInt(req.params.id);
    const sousTacheId = isNaN(parseInt(req.params.idSousTache)) ? res.status(400).json({ message: "La sous-tâche id doit être un integer." }) : parseInt(req.params.idSousTache);
    const sousTacheModifiee = req.body;
    const cle_api = req.headers.authorization;

    let erreurValidation = champsAuthoriserSousTache(sousTacheModifiee);

    erreurValidation = validerTypeChamps(sousTacheModifiee, true);
    if (erreurValidation) {
        return res.status(400).json({ message: erreurValidation.message });
    }
    
    Tache.modifierSousTache(tacheId, sousTacheId, sousTacheModifiee, cle_api)
        .then((resultat) => {
            res.status(200).send({
                message: `La sous-tâche ${resultat.titre} a été modifiée avec succès`,
                tache: resultat
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.modifierStatutSousTache = (req, res) => {
    const tacheId = isNaN(parseInt(req.params.id)) ? res.status(400).json({ message: "La tache id doit être un integer." }) : parseInt(req.params.id);
    const sousTacheId = isNaN(parseInt(req.params.idSousTache)) ? res.status(400).json({ message: "La sous-tâche id doit être un integer." }) : parseInt(req.params.idSousTache);
    const nouveauStatut = req.params.statut;
    const cle_api = req.headers.authorization;

    let erreurValidation = verifierStatut(nouveauStatut, true);
    if (erreurValidation) {
        return res.status(400).json({ message: erreurValidation.message });
    }
    
    Tache.modifierStatutSousTache(tacheId, sousTacheId, nouveauStatut, cle_api)
        .then((resultat) => {
            res.status(200).send({
                message: `Le statut de la sous-tâche ${resultat.titre} a été modifié avec succès`,
                tache: resultat
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.supprimerSousTache = (req, res) => {
    const tacheId = isNaN(parseInt(req.params.id)) ? res.status(400).json({ message: "La tache id doit être un integer." }) : parseInt(req.params.id);
    const sousTacheId = isNaN(parseInt(req.params.idSousTache)) ? res.status(400).json({ message: "La sous-tâche id doit être un integer." }) : parseInt(req.params.idSousTache);
    const cle_api = req.headers.authorization;

    Tache.supprimerSousTache(tacheId, sousTacheId, cle_api)
        .then(() => {
            res.status(200).send({
                message: `Sous-tâche supprimée avec succès (id: ${sousTacheId})`
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

function champsAuthoriserTache(tacheModifiee){
    const allowedFields = ['titre', 'description', 'date_debut', 'date_echeance', 'complete'];
    const unauthorizedFields = Object.keys(tacheModifiee).filter(field => !allowedFields.includes(field));

    if (unauthorizedFields.length > 0) {
        return { message: `Le nom de un ou des champs du corps de la requête ne sont pas au bon format. Champs acceptés: ${allowedFields.join(', ')}.` };
    }
    return null;
}

function champsAuthoriserSousTache(tacheModifiee){
    const allowedFields = ['titre', 'complete'];
    const unauthorizedFields = Object.keys(tacheModifiee).filter(field => !allowedFields.includes(field));

    if (unauthorizedFields.length > 0) {
        return { message: `Le nom de un ou des champs du corps de la requête ne sont pas au bon format. Champs acceptés: ${allowedFields.join(', ')}.` };
    }
    return null;
}

function validerTypeChamps(tacheModifiee, verifierCorp = true) {

    if (Object.keys(tacheModifiee).length === 0 && verifierCorp) {
        return { message: "Le corps de la requête est vide." };
    }

    if (tacheModifiee.titre){
        if (typeof tacheModifiee.titre !== 'string') {
            return { message: "Le champ 'titre' doit être une chaîne de caractères." };
        }
    }

    if (tacheModifiee.description){
        if (typeof tacheModifiee.description !== 'string') {
            return { message: "Le champ 'description' doit être une chaîne de caractères." };
        }
    }

    if (tacheModifiee.date_debut) {
        if (typeof tacheModifiee.date_debut !== 'string' || !/^(\d{4})-(\d{2})-(\d{2})$/.test(tacheModifiee.date_debut)) {
            return { message: "Le champ 'date_debut' n'est pas au bon format. Format attendu: YYYY-MM-DD." };
        }
    }

    if (tacheModifiee.date_echeance) {
        if (typeof tacheModifiee.date_echeance !== 'string' || !/^(\d{4})-(\d{2})-(\d{2})$/.test(tacheModifiee.date_echeance)) {
            return { message: "Le champ 'date_echeance' n'est pas au bon format. Format attendu: YYYY-MM-DD." };
        }
    }

    if (tacheModifiee.complete) {
        verifierStatut(tacheModifiee.complete, false);
    }

    return null;
}

function verifierStatut(nouveauStatut, requis = true) {
    if (nouveauStatut === undefined && requis) {
        return { message: "Le statut de complétude de la sous-tâche est requis." };
    } else if (!['true', 'false', '1', '0'].includes(String(nouveauStatut))) {
        return { message: "Le champ 'complete' n'est pas au bon format. Valeurs acceptées: 0, 1, true, false." };
    }
    return null;
}
