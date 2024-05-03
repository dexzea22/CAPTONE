const express = require("express");
const router = express.Router();
const openai = require("openai-api");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openaiApi = new openai(OPENAI_API_KEY);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  revised_generated_recommendation,
  extractValues,
} = require("../utils/revisedGenerateRecommendation");

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log("Unauthorized attempt to access dietary preferences");
  return res.status(401).json({ success: false, message: "Unauthorized access. Please log in." });
}

// Endpoint to display the recommendations page
router.get("/", ensureAuthenticated, async (req, res) => {
  const userId = req.user.id;
  try {
    const existingPreference = await prisma.dietaryPreference.findUnique({
      where: { userId },
    });

    if (!existingPreference) {
      return res.status(404).json({ success: false, message: "Dietary preferences not found." });
    }

    const dietaryData = {
      vegetarian: existingPreference.vegetarian || false,
      omnivore: existingPreference.omnivore || false,
      glutenFree: existingPreference.glutenFree || false,
      nutAllergy: existingPreference.nutAllergy || false,
    };

    // Fetch recommendations based on dietary preferences
    const apiResponse = await revised_generated_recommendation(dietaryData);

    // Log the raw API response for debugging
    console.log("API Response:", JSON.stringify(apiResponse, null, 2));

    // Directly use the response if it's already in the correct format
    const recommendations = apiResponse;  

    if (!recommendations || recommendations.length === 0) {
      console.log("No recommendations available for the given preferences:", dietaryData);
      return res.render("recommendations", { recommendations: null });
    }

    console.log("Recommendations fetched:", recommendations);
    res.render("recommendations", {
      recommendations: recommendations, // Directly pass the array of strings
    });
  } catch (error) {
    console.error("Error in fetching recommendations:", error);
    res.status(500).render("recommendations", {
      recommendations: null,
      error: "Failed to fetch recommendations due to an internal server error."
    });
  }
});









function convertResponseToSimpleList(response) {
  try {
    // Validate presence of 'choices' array and its content
    if (!response.choices || response.choices.length === 0) {
      console.error("No choices available in the response.");
      return [];
    }

    const firstChoice = response.choices[0];

    // Check for 'message' and 'content' existence
    if (!firstChoice.message || !firstChoice.message.content) {
      console.error("No message content available in the first choice.");
      return [];
    }

    const content = firstChoice.message.content;
    const parsedContent = JSON.parse(content);

    let recommendations = [];
    for (const key in parsedContent) {
      if (parsedContent.hasOwnProperty(key) && parsedContent[key].recommendations) {
        recommendations = recommendations.concat(parsedContent[key].recommendations);
      }
    }

    return recommendations;
  } catch (error) {
    console.error("Error processing API response:", error);
    return []; // Return an empty array in case of an error
  }
}






// Endpoint to handle generating recommendations based on dietary preferences
router.post("/generate-recommendations", ensureAuthenticated, async (req, res) => {
  const userId = req.user.id; // Use req.user provided by Passport
  const dietaryPreferences = req.body; // Assuming this comes from a client-side form or similar input

  console.log("Received dietary preferences for recommendations:", dietaryPreferences);

  try {
      // Check if user's dietary preferences exist
      const existingPreference = await prisma.dietaryPreference.findUnique({
          where: { userId: userId },
      });

      // Update or create dietary preferences as needed
      if (!existingPreference) {
          await prisma.dietaryPreference.create({
              data: { userId, ...dietaryPreferences },
          });
      } else {
          await prisma.dietaryPreference.update({
              where: { userId },
              data: dietaryPreferences,
          });
      }

      // Generate recommendations based on the dietaryData
      const recommendations = await revised_generated_recommendation(dietaryPreferences);
      
      if (!recommendations || recommendations.length === 0) {
          console.log("No recommendations found for the given preferences:", dietaryPreferences);
          return res.status(200).json({
              success: true,
              message: "No recommendations available based on the selected dietary preferences. Please adjust your preferences and try again."
          });
      }

      // Respond with the recommendations in a JSON format
      res.status(200).json({
          success: true,
          recommendations: recommendations
      });
  } catch (error) {
      console.error("Error processing dietary preferences for recommendations:", error);
      res.status(500).json({
          success: false,
          message: "Failed to generate recommendations due to an internal error."
      });
  }
});

// Updated utility function to generate recommendations
const generateRecommendations = async (preferences) => {
  // Convert dietary preferences into a string
  const dietaryRestrictions = Object.entries(preferences)
    .filter(([_, value]) => value)
    .map(([key, _]) => key)
    .join(", ");

    const menuDescription = `1. Afritada (Tray): Chicken stew with vegetables [Omnivore]
2. Bacon (Rice Meal): Crispy bacon strips, option with or without egg [Gluten-Free]
3. Baked Cream Dory w/ Potatoes (Tray): Creamy fish and potato bake [Gluten-Free]
4. Beef Caldereta (Tray): Spicy beef stew with vegetables [Gluten-Free]
5. Beef Mechado (Tray): Filipino beef stew with tomato sauce [Gluten-Free]
6. Beef Tapa (Rice Meal): Cured beef slices, option with or without egg [Gluten-Free]
7. Beef w/ Broccoli (Tray): Beef slices with broccoli in a savory sauce [Gluten-Free]
8. Beef Salpicao (Tray): Garlic beef stir-fry [Gluten-Free]
9. Buttered Carrots w/ Chicharo (Tray): Buttered carrots and peas [Vegetarian]
10. Buttered Potato Marbles (Tray): Buttered small potatoes [Vegetarian]
11. Canton Guisado (Short Order): Stir-fried noodles [Nut Allergy]
12. Caldereta (Tray): Spicy meat stew with tomato sauce [Gluten-Free]
13. Chami (Short Order): Sweet and spicy fried noodles [Nut Allergy]
14. Chicken Ala King (Tray): Creamy chicken with vegetables [Nut Allergy]
15. Chicken Embotido (Tray): Filipino meatloaf with chicken [Nut Allergy]
16. Chicken Roll (Rice Meal): Rolled chicken cutlet, option with or without egg [Nut Allergy]
17. Chicken Roll (Tray): Chicken meat roll [Gluten-Free]
18. Creamy Beef w/ Mushroom (Tray): Beef in creamy mushroom sauce [Gluten-Free]
19. Embotido (Tray): Filipino meatloaf [Nut Allergy]
20. Fresh Lumpiang Ubod (Tray): Fresh spring rolls with vegetables [Vegetarian]
21. Fried Chicken Fingers: Breaded chicken strips [Nut Allergy]
22. Fried Fish Filet (Tray): Breaded fish fillets [Nut Allergy]
23. Glazed Chicken (Tray): Chicken with sweet glaze [Gluten-Free]
24. Glazed Fish Fillet (Tray): Fish with sweet glaze [Gluten-Free]
25. Hamonado (Tray): Sweet pork dish [Gluten-Free]
26. Hungarian Sausage (Rice Meal): Spicy sausage, option with or without egg [Gluten-Free]
27. Kare-Kare (Tray): Peanut-based meat stew [Gluten-Free]
28. Korean Beef Stew (Tray): Beef in Korean-style sauce [Nut Allergy]
29. Longganisa (Rice Meal): Filipino sausage, option with or without egg [Gluten-Free]
30. Lumpiang Shanghai (Rice Meal): Fried spring rolls [Nut Allergy]
31. Menudo (Tray): Tomato-based pork and liver stew [Gluten-Free]
32. Mixed Vegies in Cream (Tray): Creamed mixed vegetables [Vegetarian]
33. Mongolian Beef (Tray): Spicy beef stir-fry [Gluten-Free]
34. Pork Tocino (Rice Meal): Sweet cured pork, option with or without egg [Gluten-Free]
35. Pork Pastel (Tray): Pork stew with mixed vegetables [Gluten-Free]
36. Sautéed Fish and Veggies in Chili Garlic Sauce (Tray): Fish with vegetables in a spicy sauce [Gluten-Free]
37. Sautéed Veggies in Oyster Sauce (Tray): Stir-fried vegetables in oyster sauce [Vegetarian]
38. Sisig (Tray): Minced pork head and liver in a sizzling plate [Nut Allergy]
39. Sweet and Sour Fish Fillet (Tray): Fish fillet in sweet and sour sauce [Nut Allergy]
40. Sweet and Sour Pork (Tray): Pork in sweet and sour sauce [Nut Allergy]

    
     `; // Add all your menu items in this format
    
  const prompt = `Given a customer's dietary preferences, suggest suitable menu options from the following list of dishes:
    ${menuDescription}

    The customer's dietary preferences are: ${dietaryRestrictions}. Please provide recommendations for each dietary preference based on the dishes listed.`;

  try {
    const gptResponse = await openaiApi.complete({
      engine: "davinci",
      prompt: prompt,
      maxTokens: 100,
    });

    const recommendations = gptResponse.data.choices[0].text
      .trim()
      .split("\n")
      .filter((item) => item);
    return recommendations.length > 0 ? recommendations : [];
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error; // Proper error handling
  }
};

module.exports = router;
