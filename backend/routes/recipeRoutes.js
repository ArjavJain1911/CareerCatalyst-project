const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// @route   GET /api/recipes
// @desc    Get all saved recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ createdAt: -1 });
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/recipes
// @desc    Save a generated recipe
router.post('/', async (req, res) => {
    const { title, ingredients, instructions, prepTime } = req.body;

    if (!title || !ingredients || !instructions) {
        return res.status(400).json({ message: 'Please provide title, ingredients, and instructions' });
    }

    const newRecipe = new Recipe({
        title,
        ingredients,
        instructions,
        prepTime: prepTime || '25 Mins'
    });

    try {
        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   POST /api/recipes/generate
// @desc    Generate a mock recipe based on ingredients
router.post('/generate', (req, res) => {
    const { ingredients } = req.body;

    if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ message: 'Please provide ingredients' });
    }

    const adjectives = ['Sautéed', 'Roasted', 'Spicy', 'Creamy', 'Zesty', 'Savory', 'Crispy', 'Homestyle'];
    const suffixes = ['Medley', 'Delight', 'Feast', 'Bowl', 'Surprise', 'Classic', 'Skillet'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    let mainIngredients = ingredients[0];
    if (ingredients.length > 1) {
        mainIngredients = `${ingredients[0]} & ${ingredients[1]}`;
    }
    
    const title = `${randomAdjective} ${mainIngredients} ${randomSuffix}`;
    
    // Generate step-by-step instructions
    const steps = [];
    steps.push(`1. Prepare and wash the following ingredients: ${ingredients.join(', ')}.`);
    
    if (ingredients.includes('Pasta') || ingredients.includes('Rice')) {
        steps.push(`2. Boil water in a large pot and cook the ${ingredients.includes('Pasta') ? 'Pasta' : 'Rice'} until al dente or tender.`);
    }
    
    steps.push(`3. Heat olive oil in a large skillet over medium-high heat.`);
    
    const proteins = ingredients.filter(i => ['Chicken Breast', 'Salmon', 'Beef', 'Shrimp', 'Tofu', 'Egg'].includes(i));
    if (proteins.length > 0) {
        steps.push(`4. Add the ${proteins.join(' and ')} to the skillet. Cook thoroughly until browned.`);
    }

    const veggies = ingredients.filter(i => !proteins.includes(i) && !['Pasta', 'Rice', 'Cheese'].includes(i));
    if (veggies.length > 0) {
        steps.push(`5. Toss in the ${veggies.join(', ')} and sauté for 5-7 minutes until tender.`);
    }

    if (ingredients.includes('Cheese')) {
        steps.push(`6. Combine everything together and sprinkle Cheese on top to melt.`);
    } else {
        steps.push(`6. Toss all ingredients together in the skillet to combine flavors.`);
    }
    
    steps.push(`7. Serve hot and enjoy your homemade meal!`);

    const instructions = steps.join('\n');

    const recipe = {
        title,
        ingredients,
        instructions,
        prepTime: '30 Mins'
    };

    res.json(recipe);
});

module.exports = router;
