// Import necessary modules and initialize Prisma client and OpenAI API
const { PrismaClient } = require('@prisma/client'); // Import PrismaClient from '@prisma/client'
const OpenAIApi = require('openai-api'); // Import OpenAI API library
require('dotenv').config(); // Load environment variables from .env file

const prisma = new PrismaClient(); // Initialize Prisma client
const openai = new OpenAIApi(process.env.OPENAI_API_KEY); // Initialize OpenAI API with API key from environment variable

// Function to generate revised recommendations based on dietary data
async function revised_generated_recommendation(dietaryData) {
  try {
    // Fetch all non-deleted food items from the database
    const foodItems = await prisma.foodItem.findMany({
      where: { deleted: false }
    });

    // Filter food items based on dietary restrictions specified in dietaryData
    const filteredItems = foodItems.filter(item => {
      return item.dietaryRestrictions.some(restriction => dietaryData[restriction]);
    });

    // Generate formatted menu description based on filtered food items
    const menuDescription = filteredItems.map(item => {
      const dietaryRestrictions = item.dietaryRestrictions.join(', '); // Join dietary restrictions into a string
      let itemDescription = `${item.name}:
Dietary Restrictions: ${dietaryRestrictions}
Price: $${item.price.toFixed(2)}`;
      if (item.category === 'Party Trays') {
        itemDescription += `
Price25_30: $${item.price25_30 ? item.price25_30.toFixed(2) : 'N/A'}
Price45_50: $${item.price45_50 ? item.price45_50.toFixed(2) : 'N/A'}`;
      }
      itemDescription += `
Category: ${item.category} 
![${item.name}](${item.imageUrl})`;
      return itemDescription;
    }).join('\n\n'); // Join all descriptions with double new lines

    console.log('Generated menuDescription:', menuDescription); // Log generated menu description

    // Extract dietary preferences from dietaryData and format into a string
    const dietaryPreferences = Object.entries(dietaryData)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(', ');

    // Construct prompt to send to OpenAI, including menu description and dietary preferences
    const prompt = `Given a customer's dietary preferences, suggest suitable menu options from the following list of dishes:
${menuDescription}

The customer's dietary preferences are: ${dietaryPreferences}.

Please provide recommendations for each dietary preference based on the dishes listed. Format each recommendation as follows:
Title: <Title>
Description: <Description>
Image URL: <ImageURL>
Price: $<Price>
Price25_30: $<Price25_30>
Price45_50: $<Price45_50>
Category: <Category>

Example:
Title: TEST RECOMMENDATION
Description: TEST DESCRIPTION
Image URL: /images/1717050435060-image_2024-05-30_142713526.png
Price: $<Price>
Price25_30: $<Price25_30>
Price45_50: $<Price45_50>
Category: <Category>`;

    console.log('Sending the following prompt to OpenAI:', prompt); // Log prompt sent to OpenAI API

    // Send request to OpenAI API to generate recommendations based on prompt
    const response = await openai.complete({
      engine: 'gpt-3.5-turbo-instruct',
      prompt: prompt,
      max_tokens: 150, // Limit token count for API response
      n: 1, // Number of responses to generate
      stop: '\n', // Stop generating after encountering newline
    });

    console.log('API Response:', response.data); // Log API response from OpenAI

    // Extract and parse recommendations from API response
    const recommendationsText = response.data.choices[0].text.trim(); // Trim and extract recommendations text
    const recommendationsArray = recommendationsText.split('\n').filter(line => line.trim()); // Split text into array and filter empty lines

    console.log('Recommendations Array:', recommendationsArray); // Log parsed recommendations array

    // Transform parsed recommendations array into structured objects
    const recommendations = [];
    for (let i = 0; i < recommendationsArray.length; i += 6) {
      const title = recommendationsArray[i].replace('Title: ', '').trim(); // Extract and clean title
      const description = recommendationsArray[i + 1].replace('Description: ', '').trim(); // Extract and clean description
      const imageUrl = recommendationsArray[i + 2].replace('Image URL: ', '').trim(); // Extract and clean image URL
      const price = parseFloat(recommendationsArray[i + 3].replace('Price: $', '').trim()); // Extract and clean price
      const price25_30 = parseFloat(recommendationsArray[i + 4].replace('Price25_30: $', '').trim()); // Extract and clean price25_30
      const price45_50 = parseFloat(recommendationsArray[i + 5].replace('Price45_50: $', '').trim()); // Extract and clean price45_50
      const category = recommendationsArray[i + 6].replace('Category: ', '').trim(); // Extract and clean category
      recommendations.push({ // Push formatted recommendation object to recommendations array
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price,
        price25_30: price25_30,
        price45_50: price45_50,
        category: category
      });
    }

    console.log('Transformed Recommendations:', recommendations); // Log transformed recommendations

    // Return object containing dietary preferences, menu description, and recommendations
    return {
      dietaryPreferences: dietaryPreferences,
      menuDescription: menuDescription,
      recommendations: recommendations
    };
  } catch (error) {
    // Handle error case: log error details and return error object
    console.error('Failed to generate recommendations:', error.response ? error.response.data : error.message);
    return {
      status: 'error',
      message: 'Failed to generate recommendations',
      error: error.response ? error.response.data : error.message
    };
  }
}

// Export the function to make it accessible from other modules
module.exports = {
  revised_generated_recommendation,
};
