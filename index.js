const express = require('express');

const dotenv = require('dotenv');

// Initialisation de morgan
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// Initialisation | Importation du module swagger-ui-express
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/config/documentation.json'); //ajustez selon votre projet
const swaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "API Pokémon"
};

const app = express(); // l'app utilise le module express
dotenv.config(); //initialisation des constante

// Middleware
app.use(express.json()); //converti en json

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', {
    stream: accessLogStream,
    skip: (req, res) => res.statusCode == 500
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow the specified HTTP methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow the specified headers
    next();
});

const authentification = require('./src/middlewares/authentification.middleware'); //protection des route (clé api)

// Les routes
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

//si route recu est; vérification clé-api; execute le scrie qui suit
app.use('/api/taches', authentification, require('./src/routes/taches.route.js'));
//app.use('/api/pokemons', authentification, require('./src/routes/pokemon.route.js'));

app.use('/api/utilisateurs', require('./src/routes/utilisateur.route.js'))

app.get('/api', (req, res) => {
    res.send('Message de bienvenue à l\'api de pokemon');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
