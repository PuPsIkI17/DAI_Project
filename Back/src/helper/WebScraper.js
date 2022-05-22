const axios = require('axios');
const cheerio = require('cheerio');
const google = require('googlethis');
const DDG = require('duck-duck-scrape');
const sleep = require('sleep');
const helper = require('puppeteer-core/lib/helper');
const puppeteer = require('puppeteer-core');

require("dotenv").config();

// Objects

const MealNutrients = {
    kcals: null,
    // in grams
    fats: null,
    carbs: null,
    proteins: null,
    mealName: null
};

// Definitions
async function getWebPageWithJS(targetUrl, htmlSelector) {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            executablePath: '/usr/bin/chromium-browser'
        });
        const page = await browser.newPage();

        await page.goto(targetUrl, {waitUntil: 'networkidle0', timeout: 0});

        // The height is enough to extract top 5 restaurants
        await page.setViewport({
            width: 640,
            height: 880,
            deviceScaleFactor: 1,
        });

        const selectedHTML = await page.$eval(htmlSelector, (el) => el.innerHTML);

        await browser.close();
        return selectedHTML;
    }
    catch (e) {
        console.log(`Error WebScraper@getWebPageWithJS ${e.message}`);
        await browser.close();
    }
    return null;
};

// Definitions
// This should take like 10 seconds
async function getTakewayPageForLocation(targetUrl, targetLocation) {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            executablePath: '/usr/bin/chromium-browser'
        });
        const page = await browser.newPage();

        await page.goto(targetUrl, {waitUntil: 'networkidle0', timeout: 0});

        // The height is enough to extract top 5 restaurants
        await page.setViewport({
            width: 640,
            height: 880,
            deviceScaleFactor: 1,
        });

        await page.click('input[data-qa="location-panel-search-input-address-element"]');
        await page.keyboard.press('Escape');
        await page.keyboard.type(targetLocation, { delay: 10 });
        sleep.sleep(2);
        await page.keyboard.press('ArrowDown');
        sleep.sleep(1);
        await page.keyboard.press('Enter');
        sleep.sleep(1);
        await page.keyboard.press('Enter');
        sleep.sleep(7);
        var returnUrl = await page.url();

        //const selectedHTML = await page.$eval(process.env.SCRAPER_SELECTOR_RESTAURANTS, (el) => el.innerHTML);

        await browser.close();
        //return selectedHTML;
        return returnUrl;
    }
    catch (e) {
        console.log(`Error WebScraper@getTakewayPageForLocation ${e.message}`);
        await browser.close();
    }
    return null;
};

// Get HTML element for pages that do not require additional JS code to be loaded
async function getWebPage(targetUrl, htmlSelector) {
    try {
        const response = await axios.get(targetUrl);
        const jquerySelector = cheerio.load(response.data);
        return jquerySelector(htmlSelector).html() // Return the selected elements
    }
    catch(e) {
        console.log(`Error WebScraper@getWebPage ${e.message}`);
    }
    return null; // Return null otherwise
}

// Function that performs google searching for particular meal on specified site
async function getGoogleTopResult(searchWord, website = 'nutrition site:fatsecret.co.uk') {
    try {
        const options = {
            page: 0,
            safe: false,
            additional_params: {
                // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters
                hl: 'en',
                num: 2
                // as_sitesearch: 'fatsecret.co.uk' // It was providing mobile websites
            }
        }
        var response = null;
        try {

            sleep.sleep(1); // Not to block sites

            //Try on google first
            response = await google.search(searchWord + ' "' + website + '"', options);
        }
        catch(e) {
            console.log(e.message)
            // If not, try on duckduckgo
            response = await DDG.search(searchWord + ' ' + website, options);
        }
        // Get only the first site that we are interested in
        var targetUrl = response.results[0].url
        targetUrl = targetUrl.replace('mobile.', '')
        return targetUrl
    }
    catch(e) {
        console.log(`Error WebScraper@getGoogleTopResult ${e.message}`);
    }
    return null; // Return null otherwise
}


// Will return a MealNutrients object 
async function getMealNutrients(mealName) {
    
    const searchEngineResultURL = await getGoogleTopResult(mealName);
    
    if(searchEngineResultURL == null) {
        console.log(`Error WebScraper@getMealNutrients searchEngine result was null!`);
        return null;
    }

    console.log(searchEngineResultURL);

    const nutrientTable = await getWebPage(searchEngineResultURL, 
    //    process.env.SCRAPER_SELECTOR_NUTRITION_TABLE);
       process.env.SCRAPER_SELECTOR_NUTRITION_TABLE_SIDE);

    // const nutrientTable = await getWebPage('https://fatsecret.co.uk/calories-nutrition/tesco/smoked-ham-egg-sandwich/1-pack', 
    //    process.env.SCRAPER_SELECTOR_NUTRITION_TABLE);
    
    if(nutrientTable == null) {
        console.log(`Error WebScraper@getMealNutrients nutrientTable result was null!`);
        return null;
    }

    const jquerySelector = cheerio.load(nutrientTable);

    /*
        Cals 341
        Fat 8.3g
        Carbs 38.6g
        Prot 25.8g
    */

    var mealNutrients = Object.create(MealNutrients);

    mealNutrients.kcals = jquerySelector('div[class="nutrient left tRight w2"]:eq(0)').text().split(' ')[0].trim();
    mealNutrients.carbs = jquerySelector('div[class="nutrient black left tRight w2"]:eq(3)').text().replace('g', '').trim();
    mealNutrients.fats = jquerySelector('div[class="nutrient black left tRight w2"]:eq(1)').text().replace('g', '').trim();
    mealNutrients.proteins = jquerySelector('div[class="nutrient black left tRight w2"]:eq(5)').text().replace('g', '').trim();


    /*
    jquerySelector('td[class="fact"]').each((id, element) => {
        var propertyType = jquerySelector(element).children('div[class="factTitle"]').text()
        var propertyValue = jquerySelector(element).children('div[class="factValue"]').text()
        switch(propertyType) {
            case "Cals":
                mealNutrients.kcals = propertyValue;
                break;
            case "Fat":
                mealNutrients.fats = propertyValue.replace('g', '');
                break;
            case "Carbs":
                mealNutrients.carbs = propertyValue.replace('g', '');
                break;
            case "Prot":
                mealNutrients.proteins = propertyValue.replace('g', '');
                break;
        }
    });
    */

    mealNutrients.mealName = mealName;

    return mealNutrients;
}

const Restaurant = {
    name: null,
    url: null,
    rating: null,
    meals: []
};

/**
 * Function that will return a list of 5 restaurants 
 * @param {*} addressString encoded address string
 * @param {*} options options like '?sortBy=popularity'
 * @returns a list containing objects of type Restaurant
 */
async function getTopRestaurants(addressString, options) {
    try {
        //var restaurantsList = await getWebPageWithJS('https://www.takeaway.com/ro-en/' + addressString + options,
        //process.env.SCRAPER_SELECTOR_RESTAURANTS);

        // ro-en must be changed accodring to the contry geolocation

        var restaurantsUrl = await getTakewayPageForLocation('https://www.takeaway.com/ro-en/', addressString);
        if(restaurantsUrl === 'https://www.takeaway.com/ro-en') {
            restaurantsUrl = 'https://www.takeaway.com/ro-en/delivery/food/pache-protopopescu'
        }
        // If restaurants url is the default one, then use https://www.takeaway.com/ro-en/delivery/food/pache-protopopescu

        var restaurantsList = await getWebPageWithJS(restaurantsUrl + options,
            process.env.SCRAPER_SELECTOR_RESTAURANTS);

        var restaurantList = []

        const jquerySelector = cheerio.load(restaurantsList);
        jquerySelector('li > div > a').each((id, element) => {
            var currentRestaurant = Object.create(Restaurant);
            currentRestaurant.name = jquerySelector(element).attr("title");
            currentRestaurant.url = 'https://www.takeaway.com' + jquerySelector(element).attr("href");
            
            const localSelector = cheerio.load(element);
            
            currentRestaurant.rating = localSelector('b[data-qa="restaurant-rating-score"]').text()
            
            restaurantList.push(currentRestaurant);
        });
        return restaurantList.slice(0, process.env.SCRAPER_NUMBER_OF_RESTAURANTS_TO_PROCESS); 
    }
    catch(e) {
        console.log('Error WebScraper@getTopRestaurants Something went wrong');
    }
    return [];
}

/**
 * Function that returns popular dishes from a certain restaurant, there are usually 3 items
 * 
 * @param {*} restaurantObject object of type Restaurant
 * @returns list containing top products names if error it returns an emlty list
 */
async function getRestaurantsTopMeals(restaurantObject) {
    // restaurantObject is of type Restaurant
    try {
        //console.log(restaurantObject);
        var restaurantMealsList = await getWebPageWithJS(restaurantObject.url,
            process.env.SCRAPER_SELECTOR_RESTAURANT_TOP_MEALS);

        var restaurantTopMeals = []

        const jquerySelector = cheerio.load(restaurantMealsList);
        jquerySelector('div[data-qa="popular-items-list"] > div').each((id, element) => {
            const localSelector = cheerio.load(element);
            var mealName = localSelector('h3[data-qa="heading"]').text();

            // Sanitize meal Name

            var splitList = mealName.split('-');
            if(splitList.length != 1) {
                mealName = splitList[1];
            }

            var splitList = mealName.split('/');
            if(splitList.length != 1) {
                mealName = splitList[1];
            }

            // Remove number of pieces if present "/\s[0-9]+\spcs\./gm"
            mealName = mealName.replace(/\s[0-9]+\spcs\./gm, '');
            // Remove items with + in them "/\s\+\s.*/gm"
            mealName = mealName.replace(/\s\+\s.*/gm, '');
            // Remove items sizes + in them "/\([0-9]+g\)/gm"
            mealName = mealName.replace(/\([0-9]+g\)/gm, '');
            //Remove menu keyword
            mealName = mealName.replace(/menu/ig, '');
            // Remove numbering
            mealName = mealName.replace(/[0-9]/ig, '');
            // Remove special chars
            mealName = mealName.replace(/[^0-9a-zA-Z ]+/ig, '');

            restaurantTopMeals.push(mealName.trim());
        });
        return restaurantTopMeals;
    }
    catch(e) {
        console.log('Error WebScraper@getTopRestaurants Something went wrong');
    }
    return [];
}

// Export functions

module.exports.getWebPage = getWebPage;
module.exports.getWebPageWithJS = getWebPageWithJS;
module.exports.getGoogleTopResult = getGoogleTopResult;
module.exports.getMealNutrients = getMealNutrients;
module.exports.getRestaurantsTopMeals = getRestaurantsTopMeals;
module.exports.getTopRestaurants = getTopRestaurants;
module.exports.getTakewayPageForLocation = getTakewayPageForLocation;

// Export objects

module.exports.MealNutrients = MealNutrients;
module.exports.Restaurant = Restaurant;



