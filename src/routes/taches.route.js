const express = require('express');
const router = express.Router();
const tachesController = require('../controllers/taches.controller');

// Afficher la liste de toutes les tâches de l’usager
router.get('/', (req, res) => {
    tachesController.listeTaches(req, res);
});

// Afficher le détail d’une tâche
router.get('/:id', (req, res) => {
    tachesController.trouverTache(req, res);
});

// Ajouter une tâche
router.post('/', (req, res) => {
    tachesController.ajouterTache(req, res);
});

// Modifier une tâche
router.put('/:id', (req, res) => {
    tachesController.modifierTache(req, res);
});

// Modifier le statut d'une tâche
router.patch('/:id/statut/:statut', (req, res) => {
    tachesController.modifierStatutTache(req, res);
});

// Supprimer une tâche
router.delete('/:id', (req, res) => {
    tachesController.supprimerTache(req, res);
});

// Ajouter une sous-tâche
router.post('/:id/sousTaches', (req, res) => {
    tachesController.ajouterSousTache(req, res);
});

// Modifier une sous-tâche
router.put('/:id/sousTaches/:idSousTache', (req, res) => {
    tachesController.modifierSousTache(req, res);
});

// Modifier le statut d'une sous-tâche
router.patch('/:id/sousTaches/:idSousTache/statut/:statut', (req, res) => {
    tachesController.modifierStatutSousTache(req, res);
});

// Supprimer une sous-tâche
router.delete('/:id/sousTaches/:idSousTache', (req, res) => {
    tachesController.supprimerSousTache(req, res);
});

router.all('*', (req, res) => {
    res.status(404).json({ message: 'La route que vous esseyez d\'utiliser est inexistante' });
});

module.exports = router;
