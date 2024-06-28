const { PrismaClient } = require('@prisma/client');
const OpenAIApi = require('openai-api');
require('dotenv').config();

const prisma = new PrismaClient();
const openai = new OpenAIApi(process.env.OPENAI_API_KEY);

async function revised_generated_recommendation(dietaryData) {
  try {
    // Fetch all food items from the database
    const foodItems = await prisma.foodItem.findMany();

    // Filter food items based on dietary preferences
    const filteredItems = foodItems.filter(item => {
      return item.dietaryRestrictions.some(restriction => dietaryData[restriction]);
    });

    // Construct the menu description dynamically with price
    const menuDescription = filteredItems.map(item => {
      const dietaryRestrictions = item.dietaryRestrictions.map(r => r.replace('**', '')).join(', ');
      return `**${dietaryRestrictions}:**
      ${item.name}: ${item.description}
      Price: $${item.price.toFixed(2)}
      ![${item.name}](${item.imageUrl})`;
    }).join('\n\n');

    // Log the menuDescription to verify its format
    console.log('Generated menuDescription:', menuDescription);

    // Convert dietaryData object into a string of dietary preferences
    const dietaryPreferences = Object.entries(dietaryData)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(', ');

    // Construct the prompt to send to the OpenAI API
    const prompt = `Given a customer's dietary preferences, suggest suitable menu options from the following list of dishes:
${menuDescription}

The customer's dietary preferences are: ${dietaryPreferences}.

Please provide recommendations for each dietary preference based on the dishes listed. Format each recommendation as follows:
Title: <Title>
Description: <Description>
Image URL: <ImageURL>
Price: $<Price>

Example:
Title: TEST RECOMMENDATION
Description: TEST DESCRIPTION
Image URL: /images/1717050435060-image_2024-05-30_142713526.png
Price: $<Price>`;

    console.log('Sending the following prompt to OpenAI:', prompt);

    // Make the API call to OpenAI with the constructed prompt
    const response = await openai.complete({
      engine: 'gpt-3.5-turbo-instruct', // Specify the engine you want to use
      prompt: prompt,
      max_tokens: 150,
      n: 1,
      stop: '\n',
    });

    console.log('API Response:', response.data);

    // Extract the generated recommendation from the API response
    const recommendationsText = response.data.choices[0].text.trim();

    // Split recommendationsText into an array based on new lines and filter out empty lines
    const recommendationsArray = recommendationsText.split('\n').filter(line => line.trim());

    console.log('Recommendations Array:', recommendationsArray);

    // Transform recommendationsArray into objects suitable for cards
    const recommendations = [];
    for (let i = 0; i < recommendationsArray.length; i += 4) {
      const title = recommendationsArray[i].replace('Title: ', '').trim();
      const description = recommendationsArray[i + 1].replace('Description: ', '').trim();
      const imageUrl = recommendationsArray[i + 2].replace('Image URL: ', '').trim();
      const price = parseFloat(recommendationsArray[i + 3].replace('Price: $', '').trim()); // Extract price
      recommendations.push({
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price
      });
    }

    console.log('Transformed Recommendations:', recommendations);

    // Return the structured response with actual data
    return {
      dietaryPreferences: dietaryPreferences,
      menuDescription: menuDescription,
      recommendations: recommendations
    };
  } catch (error) {
    console.error('Failed to generate recommendations:', error.response ? error.response.data : error.message);

    // Return an error message or handle the error as needed
    return {
      status: 'error',
      message: 'Failed to generate recommendations',
      error: error.response ? error.response.data : error.message
    };
  }
}

module.exports = {
  revised_generated_recommendation,
};
