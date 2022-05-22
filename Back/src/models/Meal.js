const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);

/** Post json
    "kcal": "", // Fields
    "fats": "",
    "proteins": "",
    "hunryMeter": "",
    "lat": "", // Location
    "long": ""
 */

const MealSchema = mongoose.Schema({
    mealName: {
        type: String,
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    restaurantRating: {
        type: String
    },
    restaurantUrl: {
        type: String,
        required: true
    },
    kcal: {
        type: String, 
        required: true
    },
    fats: {
        type: String, 
        required: true
    },
    carbs: {
        type: String, 
        required: true
    },
    proteins: {
        type: String, 
        required: true
    }
});

module.exports = mongoose.model('Meal', MealSchema);