require('dotenv')
const express = require("express");
const router = express.Router();
const checkAuth = require('../middlewear/check-auth.js')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const path = require('path')
const multer = require('multer');
const upload = multer({ dest: 'uploads' })
const Recipe = require('../models/recipe')



router.post('/signup', (req, res, next) => {

    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'That email address is already in use'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });

                        user
                            .save()
                            .then(result => {
                                console.log(result)
                                res.status(201).json({
                                    message: 'User created',
                                    user: result
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                }
                )
            }
        })
});

router.post('/verify', checkAuth, (req, res) => {
    res.json({
        message: "success"
    })
})

router.post('/login', (req, res, next) => {
    console.log(req.body)
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Authentication failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Authentication failed'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    }, process.env.JWT_KEY,
                        {
                            expiresIn: '1h'
                        },
                    );
                    return res.status(200).json({
                        message: 'Authentication successful',
                        token: token
                    })
                }
                res.status(401).json({
                    message: 'Authentication failed'
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})

router.post('/save', checkAuth, (req, res) => {
    // Makes a new recipe using the body of the request. LAter on we'll make it check the URI to see if the recipe has already been saved.
    // The user object can then simply store the ID's of recipe objects in their array. 

    const recipe = new Recipe({
        _id: new mongoose.Types.ObjectId(),
        ingredientLines: req.body.ingredientLines,
        img: req.body.img,
        label: req.body.label
    })

    // Saves the recipe to the database and then saves the recipe's _id to the user's saved recipes array
    recipe
        .save()
        .then(recipe => {
            User.find({ _id: req.userData.userId })
                .exec()
                .then(result => {
                    result[0].savedRecipes.push(recipe._id)
                    result[0].save()
                    console.log(result[0])
                    res.status(200).json({
                        message: "recipe saved"
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    })
                })
        })
})

router.post('/recipes', checkAuth, async (req, res) => {
    // Get the user data in a variable
    const userData = req.userData;
    // Use that data to find a user in the datatbase 
    const user = await User.find({ _id: userData.userId });
    // Get the recipes array out of the user object
    const recipes = user[0].savedRecipes;
    console.log(recipes)
    res.json({
        recipes: recipes
    })
})

router.post('/getrecipe', checkAuth, async (req, res) => {
    // Get the recipe ID from the req body and save it to a variable 
    const recipeId = req.body.id;
    // Use it to find the recipe in the Recipes collection
    const recipe = await Recipe.find({ _id: recipeId });
    // Send the recipe
    res.json({
        recipe: recipe
    })
})

router.delete('/:userId', (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted',
                result: result
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router