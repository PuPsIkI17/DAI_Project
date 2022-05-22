const express = require('express');
const router = express.Router();
const mealController = require('../controller/MealController');

// Simple router for our endpoint
router.post('/', mealController.mealController);

module.exports = router;