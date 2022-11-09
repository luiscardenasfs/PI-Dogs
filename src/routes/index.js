const { Router } = require('express');
// Import all the routers;
const dogsRoute = require('./dogsRoute');
const temperamentsRoute = require('./temperamentsRoute');

const router = Router();

// Configure  routers
router.use('/dogs', dogsRoute);
router.use('/temperaments', temperamentsRoute);
module.exports = router;
