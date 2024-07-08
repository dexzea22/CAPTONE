const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const prisma = new PrismaClient();
const fileUpload = require('express-fileupload');
const router = express.Router();

router.use(fileUpload());


// Middleware to check if user is authenticated
function authenticate(req, res, next) {
    // Use Passport's built-in method to check authentication
    if (req.isAuthenticated()) {  // Checks if the user session is saved and valid
      console.log('User authenticated with userId:', req.user.id); // Log the authenticated user's ID
      next();  // Continue to next middleware or request handler
    } else {
      console.log('User not authenticated. Redirecting to login.');
      res.redirect('/login');  // Redirect to login page if not authenticated
    }
  }
  
  
  
  // Middleware to check user type and restrict access to specific routes
  async function restrictAccess(userType, req, res, next) {
    if (req.user && req.user.id) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
        });
  
        if (user.usertype !== userType) {
          return res.redirect('/login'); // Redirect unauthorized users to login
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
      }
    } else {
      return res.redirect('/login');
    }
  }

  router.get('/', authenticate, (req, res, next) => restrictAccess('Admin', req, res, next), async (req, res) => {
    try {
        // Fetch food items that are not deleted from the database
        const foodItems = await prisma.foodItem.findMany({
            where: { deleted: false }
        });

        // Render the adminCreateFoodItem page and pass the foodItems data
        res.render('adminCreateFoodItem', { foodItems });
    } catch (error) {
        console.error('Error rendering adminCreateFoodItem:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            size,
            category,
            dietaryRestrictions,
            price25_30,
            price45_50,
            available,
            size10_12,
            size25_30,
            size45_50,
        } = req.body;

        // Sanitize name to replace spaces with dashes and remove parentheses
        const sanitizedName = name.replace(/\s+/g, '-').replace(/[()]/g, '');

        // Convert dietaryRestrictions to an array if it exists and is not an array
        const dietaryArray = Array.isArray(dietaryRestrictions)
            ? dietaryRestrictions
            : dietaryRestrictions
                ? [dietaryRestrictions]
                : [];

        // Handle file upload
        if (!req.files || !req.files.imageUpload) {
            return res
                .status(400)
                .json({ success: false, message: 'No image uploaded' });
        }

        const imageFile = req.files.imageUpload;
        const imageName = Date.now() + '-' + imageFile.name;
        const imagePath = path.join(__dirname, '../public/images', imageName);
        await imageFile.mv(imagePath);

        // Determine which fields to save based on category
        let newData = {
            name: sanitizedName,
            description,
            category,
            dietaryRestrictions: dietaryArray,
            imageUrl: `/images/${imageName}`,
            available: available === 'true',
            createdAt: new Date(),
        };

        if (category === 'Solo Meals') {
            newData = {
                ...newData,
                price: parseFloat(price),
            };
        } else if (category === 'Party Trays') {
            newData = {
                ...newData,
                size,
                price: parseFloat(price),
                price25_30: parseFloat(price25_30),
                price45_50: parseFloat(price45_50),
                size10_12,
                size25_30,
                size45_50,
            };
        }

        // Create the food item in the database
        const newFoodItem = await prisma.foodItem.create({
            data: newData,
        });

        // Send success response with new food item details
        res
            .status(201)
            .json({ success: true, message: 'Food item created successfully', foodItem: newFoodItem });
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
        const foodItem = await prisma.foodItem.findUnique({
            where: { id }
        });
        // Send the food item details as JSON response
        res.json({ success: true, foodItem });
    } catch (error) {
        console.error('Error fetching food item details for edit:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Route to update food item
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { editName, editDescription, editPrice, editSize, editCategory, editDietaryRestrictions, editPax25_30, editPax45_50, editAvailability, editImageUpload, editSize10_12, editSize25_30, editSize45_50 } = req.body;

        // Convert editDietaryRestrictions to an array if it exists and is not an array
        const dietaryArray = Array.isArray(editDietaryRestrictions) ? editDietaryRestrictions : editDietaryRestrictions ? [editDietaryRestrictions] : [];

        // Handle file upload
        let imageUrl;
        if (req.files && req.files.editImageUpload) {
            const imageFile = req.files.editImageUpload;
            const imageName = Date.now() + '-' + imageFile.name;
            const imagePath = path.join(__dirname, '../public/images', imageName);
            await imageFile.mv(imagePath);
            imageUrl = `/images/${imageName}`;
            
        }

        // Update the food item in the database
        let updatedFoodItem;
        if (editCategory === "Party Trays") {
            updatedFoodItem = await prisma.foodItem.update({
                where: { id },
                data: {
                    name: editName,
                    description: editDescription,
                    price: parseFloat(editPrice),
                    size: editSize,
                    category: editCategory,
                    dietaryRestrictions: dietaryArray,
                    price25_30: parseFloat(editPax25_30) || null,
                    price45_50: parseFloat(editPax45_50) || null,
                    imageUrl: imageUrl || undefined, // Only update if new image is uploaded
                    available: editAvailability === 'true',
                    size10_12: editSize10_12,
                    size25_30: editSize25_30,
                    size45_50: editSize45_50,
                }
            });
        } else {
            updatedFoodItem = await prisma.foodItem.update({
                where: { id },
                data: {
                    name: editName,
                    description: editDescription,
                    price: parseFloat(editPrice),
                    size: editSize,
                    category: editCategory,
                    dietaryRestrictions: dietaryArray, // has problem
                    imageUrl: imageUrl,
                    available: editAvailability === 'true',
                }
            });
        }

        // Send success response
        res.json({ success: true, message: "Food item updated successfully", foodItem: updatedFoodItem });
    } catch (error) {
        console.error('Error updating food item:', error);
        res.status(500).json({ success: false, message: 'Failed to update food item.' });
    }
});

// Route to delete food item (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete the food item by setting the deleted field to true
        const deletedFoodItem = await prisma.foodItem.update({
            where: { id },
            data: { deleted: true }
        });
        // Send success response
        res.json({ success: true, message: 'Food item deleted successfully', deletedFoodItem });
    } catch (error) {
        console.error('Failed to delete food item:', error);
        // Send error response
        res.status(500).json({ success: false, message: 'Failed to delete food item.' });
    }
});

module.exports = router;
