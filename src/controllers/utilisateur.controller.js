const Utilisateur = require("../models/utilisateur.model");

exports.creerUtilisateur = (req, res) => {
    const { nom, prenom, courriel, mot_de_passe } = req.body;

    if (!nom || !prenom || !courriel || !mot_de_passe) {
        return res.status(400).json({ message: "Veuillez fournir tous les champs nécessaires. (nom, prenom, courriel et mot_de_passe dans le corps de la requète." });
    }

    const nouvelUtilisateur = {
        nom: nom,
        prenom: prenom,
        courriel: courriel,
        mot_de_passe: mot_de_passe
    };

    Utilisateur.creerUtilisateur(nouvelUtilisateur)
        .then(resultat => {
            res.status(201).json(resultat);
        })
        .catch(erreur => {
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};

exports.genererNouvelleCleAPI = (req, res) => {
    const { courriel, mot_de_passe } = req.body;

    if (!courriel || !mot_de_passe) {
        return res.status(400).json({ message: "Veuillez fournir l'adresse courriel et le mot de passe." });
    }

    Utilisateur.genererNouvelleCleAPI(courriel, mot_de_passe)
        .then(resultat => {
            res.status(200).json(resultat);
        })
        .catch(erreur => {
            res.status(erreur.code || 500).json({ message: erreur.message });
        });
};