const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    label: { type: String },
    img: { type: String },
    ingredientLines: { type: Array },
})

module.exports = mongoose.model('Recipe', recipeSchema)