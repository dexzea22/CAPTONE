const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const prisma = new PrismaClient();
const fileUpload = require('express-fileupload');
const router = express.Router();

router.use(fileUpload());

router.get('/', async (req, res) => {
    try {
        // Fetch food items from the database
        const foodItems = await prisma.addFoodItem.findMany();

        // Render the adminCreateFoodItem page and pass the foodItems data
        res.render('adminCreateFoodItem', { foodItems });
    } catch (error) {
        console.error('Error rendering adminCreateFoodItem:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, description, price, size, category, dietaryRestrictions } = req.body;
        
        // Convert dietaryRestrictions to an array if it exists and is not an array
        const dietaryArray = Array.isArray(dietaryRestrictions) ? dietaryRestrictions : dietaryRestrictions ? [dietaryRestrictions] : [];
        
        // Handle file upload
        if (!req.files || !req.files.imageUpload) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        const imageFile = req.files.imageUpload;
        const imageName = Date.now() + '-' + imageFile.name;
        const imagePath = path.join(__dirname, '../public/images', imageName);
        await imageFile.mv(imagePath);

        // Create the food item in the database
        const newFoodItem = await prisma.addFoodItem.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                size,
                category,
                dietaryRestrictions: dietaryArray,
                imageUrl: `/images/${imageName}`
            }
        });

        // Send success response with new food item details
        res.status(201).json({ success: true, message: 'Food item created successfully', foodItem: newFoodItem });
    } catch (error) {
        console.error('Failed to create food item:', error);
        // Send error response
        res.status(500).json({ success: false, message: 'Failed to create food item.' });
    }
});

// edit & delete
// Route to get food item details for edit
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      // Fetch food item details from the database
      const foodItem = await prisma.addFoodItem.findUnique({
        where: { id }
      });
      // Send the food item details as JSON response
      res.json({ success: true, foodItem }); // Update to include success status
    } catch (error) {
      console.error('Error fetching food item details for edit:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  
// Route to update food item
router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { editName, editDescription, editPrice, editSize, editCategory, editDietaryRestrictions } = req.body;
      // Convert editDietaryRestrictions to an array if it exists and is not an array
      const dietaryArray = Array.isArray(editDietaryRestrictions) ? editDietaryRestrictions : editDietaryRestrictions ? [editDietaryRestrictions] : [];
      // Update the food item in the database
      const updatedFoodItem = await prisma.addFoodItem.update({
        where: { id },
        data: {
          name: editName,
          description: editDescription,
          price: parseFloat(editPrice),
          size: editSize,
          category: editCategory,
          dietaryRestrictions: dietaryArray
        }
      });
      // Send success response with updated food item details
      res.json({ success: true, message: 'Food item updated successfully', foodItem: updatedFoodItem });
    } catch (error) {
      console.error('Failed to update food item:', error);
      // Send error response
      res.status(500).json({ success: false, message: 'Failed to update food item.' });
    }
  });
  
  // Route to delete food item
router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      // Delete the food item from the database
      const deletedFoodItem = await prisma.addFoodItem.delete({ where: { id } });
      // Send success response
      res.json({ success: true, message: 'Food item deleted successfully', deletedFoodItem });
    } catch (error) {
      console.error('Failed to delete food item:', error);
      // Send error response
      res.status(500).json({ success: false, message: 'Failed to delete food item.' });
    }
  });


module.exports = router;
