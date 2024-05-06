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
    const tacheId = parseInt(req.params.id);
    const cle_api = req.headers.authorization;

    //vérifier si
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
    //champs autorisé
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
    const tacheId = parseInt(req.params.id);
    const tacheModifiee = req.body;
    const cle_api = req.headers.authorization;

    if (Object.keys(tacheModifiee).length === 0) {
        return res.status(400).json({ message: "Le corps de la requête est vide ou ne contient pas de champs à modifier." });
    }

    const allowedFields = ['titre', 'description', 'date_debut', 'date_echeance', 'complete'];
    const unauthorizedFields = Object.keys(tacheModifiee).filter(field => !allowedFields.includes(field));

    if (unauthorizedFields.length > 0) {
        return res.status(400).json({ message: `Un ou des champs du corps de la requête ne sont pas au bon format. Champs acceptés: ${allowedFields.join(', ')}.` });
    }
    //complete "truee"
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
    const tacheId = parseInt(req.params.id);
    const nouveauStatut = req.params.statut;
    const cle_api = req.headers.authorization;

    Tache.modifierStatutTache(tacheId, nouveauStatut, cle_api)
        .then((resultat) => {
            res.status(200).send({
                message: `Le statut de la tâche ${resultat.titre} a été modifiée avec succès`,
                tache: resultat
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.supprimerTache = (req, res) => {
    const tacheId = parseInt(req.params.id);
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

//rendu ici
exports.ajouterSousTache = (req, res) => {
    const tacheId = parseInt(req.params.id);
    const nouvelleSousTache = req.body;
    const cle_api = req.headers.authorization;
    console.log("ttt");
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
    const tacheId = parseInt(req.params.id);
    const sousTacheId = parseInt(req.params.idSousTache);
    const sousTacheModifiee = req.body;
    const cle_api = req.headers.authorization;

    if (!sousTacheModifiee.titre || sousTacheModifiee.complete === undefined) {
        res.status(400).json({ message: "Le titre et le statut de complétude de la sous-tâche sont requis." });
        return;
    }

    const allowedFields = ['titre', 'complete'];
    const unauthorizedFields = Object.keys(sousTacheModifiee).filter(field => !allowedFields.includes(field));

    if (unauthorizedFields.length > 0) {
        return res.status(400).json({ message: `Un ou des champs du corps de la requête ne sont pas au bon format. Champs acceptés: ${allowedFields.join(', ')}.` });
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
    const tacheId = parseInt(req.params.id);
    const sousTacheId = parseInt(req.params.idSousTache);
    const nouveauStatut = req.params.statut; //vérifier type
    const cle_api = req.headers.authorization;

    Tache.modifierStatutSousTache(tacheId, sousTacheId, nouveauStatut, cle_api)
        .then((resultat) => {
            res.status(200).send({
                message: `Le statut de la sous-tâche ${resultat.titre} a été modifiée avec succès`,
                tache: resultat
            });
        })
        .catch((erreur) => {
            console.error('Erreur : ', erreur);
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.supprimerSousTache = (req, res) => {
    const tacheId = parseInt(req.params.id);
    const sousTacheId = parseInt(req.params.idSousTache); //vérifier si int? vérifier type
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
