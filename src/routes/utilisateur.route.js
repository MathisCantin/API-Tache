const express = require('express');
const router = express.Router();
const UtilisateurController = require("../controllers/utilisateur.controller");

router.post('/', UtilisateurController.creerUtilisateur);

router.post('/nouvelleCle', UtilisateurController.genererNouvelleCleAPI);

module.exports = router;
