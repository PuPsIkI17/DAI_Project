const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios')
const puppeteer = require('puppeteer-core');
const helper = require('puppeteer-core/lib/helper');
const pageScraper = require('../helper/WebScraper');
const google = require('googlethis');
const DDG = require('duck-duck-scrape');
const sleep = require('sleep');
const MealModel = require("../models/Meal")
const openGeocoder = require('node-geocoder');
const dataBase = require('../models/Database');

// Controller for post request
async function mealController(req, res) {
    try {
        const database = await dataBase();

        const receivedData = req.body;

        //console.log(receivedData)

        // Geodecode location 

        var geoCoder = openGeocoder({provider: 'openstreetmap'});

        var clientLocation = await geoCoder.reverse({lat:parseFloat(receivedData.lat), 
            lon:parseFloat(receivedData.lon)})
                .then((res) => {return res;})

        console.log(clientLocation[0].streetName);
        
        // Set client data

        var clientStreetName = clientLocation[0].streetName;
        var clientContry = clientLocation[0].countryCode.toLowerCase();

        if(clientStreetName == undefined) {
            clientStreetName = 'Bulevardul Timișoara';
        }

        if(clientContry == undefined) {
            clientContry = 'ro';
        }
        
        var clientOptions = '?sortBy=popularity';

        // If he is really hungry
        if(parseFloat(receivedData.hunryMeter) > 75) {
            clientOptions = '?sortBy=deliveryTime';
        }

        var returnMeals = await resolveMeals(clientStreetName, clientContry, clientOptions);
    	//console.log(JSON. stringify(returnMeals));

        console.log("Now sorting!");

        var restaurants = await processMeals(receivedData, returnMeals);
    	//console.log(JSON.stringify(restaurants));

        res.status(200).json(restaurants);
    }
    catch(error) {
        res.status(500).json({message: error.message});
    }
}

async function processMeals(clientRequest, mealsList) {
    // For all meals, find the best one, order by restaurant

    // Some smart way of finding close meals..

    // kcal / fats + proteins = score
    // kcal / fats + carbs + protein = score

    // Closest score is the winner

    var minList = [] // This will hold restaurant and scores

    // restaurant id in mealsList and scores
    // id: index, score: []

    var targetScore = parseFloat(clientRequest.kcal) / 
        (parseFloat(clientRequest.fats) + parseFloat(clientRequest.proteins));

    for(var index in mealsList) {
        var currentRestaurant = mealsList[index];
        var currentScore = [];

        for(var mealIndex in currentRestaurant.meals) {
            var currentMeal = currentRestaurant.meals[mealIndex];
            currentScore.push(parseFloat(currentMeal.kcal) / 
                (parseFloat(currentMeal.fats) + parseFloat(currentMeal.carbs) 
                    + parseFloat(currentMeal.proteins)));
        }

        var closest = currentScore.reduce((a, b) => {
            return Math.abs(b - targetScore) < Math.abs(a - targetScore) ? b : a;
        });

        minList.push({
            index: index,
            score: closest
        });
    }

    var closestIndex = minList.reduce((a, b) => {
        return Math.abs(b.score - targetScore) < Math.abs(a.score - targetScore) ? b.index : a.index;
    });

    // closestIndex should be the first restaurant to be displayed

    var firstElement = mealsList.splice(closestIndex, 1);
    mealsList.unshift(firstElement);

    return mealsList;
    // Rearange items

}

async function getDatabaseMeals(restaurantName, restaurantUrl) {
    try{
        var storedMeals = await MealModel.find({restaurantName: restaurantName,
            restaurantUrl: restaurantUrl});
        return storedMeals;
    }
    catch(e) {
        return null;
    }
}

async function resolveMeals(clientStreetName, countryCode, options) {
	var promisesList = [];

	var topRestaurantsList = await pageScraper.getTopRestaurants(clientStreetName, options); 

	var mealsList = [];

    console.log(topRestaurantsList);

    var remainedRestaurants = [];

	for(var item in topRestaurantsList) {
		// Get restaurant meals
        var databaseMeals = await getDatabaseMeals(topRestaurantsList[item].name, 
            topRestaurantsList[item].url);

		// Check if some restaurants are already present in our database

        if(databaseMeals.length == 0) {
            console.log("Not found for " + topRestaurantsList[item].name)
            var restaurantMeals = pageScraper.getRestaurantsTopMeals(topRestaurantsList[item]); 
            promisesList.push(restaurantMeals);
            remainedRestaurants.push(topRestaurantsList[item]);
        }
        else {
            console.log("Found for " + topRestaurantsList[item].name)

            mealsList.push({restaurantName: topRestaurantsList[item].name,
                restaurantUrl: topRestaurantsList[item].url,
                restaurantRating: topRestaurantsList[item].rating,
                meals: databaseMeals}); // Push to main list

            
        }
	}

    topRestaurantsList = remainedRestaurants;

	// Wait for all promises to finish execution and get data
	// Faster this way rather than waiting for each browser individually

	var restaurantsTopMealsList = await Promise.all(promisesList).then((data) => {return data;});

	// Now iterate data and find nutritions
	var index = 0; // For the current restaurant

	for(var restaurantsIndex in restaurantsTopMealsList) {
		// Empty promisses list
		var restaurantTopMeals = restaurantsTopMealsList[restaurantsIndex];
		promisesList = [];
        var localMeals = [];
		for(restaurantTopMealIndex in restaurantTopMeals) {
			var mealName = restaurantTopMeals[restaurantTopMealIndex];
			// This should return a MealNutrients object
			sleep.sleep(1);
			promisesList.push(pageScraper.getMealNutrients(mealName));
		}
		// Wait for promises to resolve, aroud 3 of them
		var currentRestaurantMeals = await Promise.all(promisesList).then((data) => {return data;});

		// Construct objects for meals and restaurants, then continue
		for(var currentIndex in currentRestaurantMeals) {
			var currentMeal = currentRestaurantMeals[currentIndex];

			if(currentMeal == null)
				continue;
				
			var meal = new MealModel({
				mealName: currentMeal.mealName,
				restaurantName: topRestaurantsList[index].name,
				restaurantUrl: topRestaurantsList[index].url,
				restaurantRating: topRestaurantsList[index].rating,
				kcal: currentMeal.kcals,
				fats: currentMeal.fats,
				carbs: currentMeal.carbs,
				proteins: currentMeal.proteins,
			});
            console.log(currentMeal.mealName);
            await meal.save().then(() => console.log("Data Saved!"));

            /**
             *  MealModel.findOne({restaurantName: topRestaurantsList[index].name,
                mealName: currentMeal.mealName}, function(err, example) {
                if (example){
                    console.log("This has already been saved");
                } else {
                    await meal.save().then(() => console.log("Data Saved!"));
			        localMeals.push(meal);
                }});
             */


			localMeals.push(meal);
		} 

        mealsList.push({restaurantName: topRestaurantsList[index].name,
            restaurantUrl: topRestaurantsList[index].url,
            restaurantRating: topRestaurantsList[index].rating,
            meals: localMeals});

		index++;
	}

    return mealsList;
}


module.exports.mealController = mealController;
