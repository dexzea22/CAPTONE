const OpenAI = require("openai");

const openai = new OpenAI();

// Define your menu items with their dietary categorizations
// ... (existing menuDescription)
// Define your menu items with their dietary categorizations
const menuDescription = `
**Omnivore:**
1. Afritada (Tray): Chicken stew with vegetables
2. Bacon (Rice Meal): Crispy bacon strips, option with or without egg
3. Beef Mechado (Tray): Filipino beef stew with tomato sauce
4. Beef Tapa (Rice Meal): Cured beef slices, option with or without egg
5. Beef w/ Broccoli (Tray): Beef slices with broccoli in a savory sauce
6. Beef Salpicao (Tray): Garlic beef stir-fry
7. Caldereta (Tray): Spicy meat stew with tomato sauce
8. Chicken Ala King (Tray): Creamy chicken with vegetables
9. Chicken Embotido (Tray): Filipino meatloaf with chicken
10. Chicken Roll (Rice Meal): Rolled chicken cutlet, option with or without egg
11. Chicken Roll (Tray): Chicken meat roll
12. Creamy Beef w/ Mushroom (Tray): Beef in creamy mushroom sauce
13. Fried Chicken Fingers: Breaded chicken strips
14. Fried Fish Filet (Tray): Breaded fish fillets
15. Glazed Chicken (Tray): Chicken with sweet glaze
16. Glazed Fish Fillet (Tray): Fish with sweet glaze
17. Hamonado (Tray): Sweet pork dish
18. Hungarian Sausage (Rice Meal): Spicy sausage, option with or without egg
19. Kare-Kare (Tray): Peanut-based meat stew
20. Korean Beef Stew (Tray): Beef in Korean-style sauce
21. Longganisa (Rice Meal): Filipino sausage, option with or without egg
22. Menudo (Tray): Tomato-based pork and liver stew
23. Mongolian Beef (Tray): Spicy beef stir-fry
24. Pork Tocino (Rice Meal): Sweet cured pork, option with or without egg
25. Pork Pastel (Tray): Pork stew with mixed vegetables
26. Sweet and Sour Pork (Tray): Pork in sweet and sour sauce

**Gluten-Free:**
1. Bacon (Rice Meal): Crispy bacon strips, option with or without egg
2. Baked Cream Dory w/ Potatoes (Tray): Creamy fish and potato bake
3. Beef Caldereta (Tray): Spicy beef stew with vegetables
4. Beef Mechado (Tray): Filipino beef stew with tomato sauce
5. Beef Tapa (Rice Meal): Cured beef slices, option with or without egg
6. Beef w/ Broccoli (Tray): Beef slices with broccoli in a savory sauce
7. Beef Salpicao (Tray): Garlic beef stir-fry
8. Caldereta (Tray): Spicy meat stew with tomato sauce
9. Chicken Roll (Tray): Chicken meat roll
10. Creamy Beef w/ Mushroom (Tray): Beef in creamy mushroom sauce
11. Glazed Chicken (Tray): Chicken with sweet glaze
12. Glazed Fish Fillet (Tray): Fish with sweet glaze
13. Hamonado (Tray): Sweet pork dish
14. Hungarian Sausage (Rice Meal): Spicy sausage, option with or without egg
15. Kare-Kare (Tray): Peanut-based meat stew
16. Menudo (Tray): Tomato-based pork and liver stew
17. Mongolian Beef (Tray): Spicy beef stir-fry
18. Pork Tocino (Rice Meal): Sweet cured pork, option with or without egg
19. Pork Pastel (Tray): Pork stew with mixed vegetables
20. Sautéed Fish and Veggies in Chili Garlic Sauce (Tray): Fish with vegetables in a spicy sauce

**Nut Allergy:**
1. Canton Guisado (Short Order): Stir-fried noodles
2. Chami (Short Order): Sweet and spicy fried noodles
3. Chicken Ala King (Tray): Creamy chicken with vegetables
4. Chicken Embotido (Tray): Filipino meatloaf with chicken
5. Chicken Roll (Rice Meal): Rolled chicken cutlet, option with or without egg
6. Lumpiang Shanghai (Rice Meal): Fried spring rolls
7. Sisig (Tray): Minced pork head and liver in a sizzling plate
8. Sweet and Sour Fish Fillet (Tray): Fish fillet in sweet and sour sauce
9. Sweet and Sour Pork (Tray): Pork in sweet and sour sauce

**Vegetarian:**
1. Buttered Carrots w/ Chicharo (Tray): Buttered carrots and peas
2. Buttered Potato Marbles (Tray): Buttered small potatoes
3. Fresh Lumpiang Ubod (Tray): Fresh spring rolls with vegetables
4. Mixed Vegies in Cream (Tray): Creamed mixed vegetables
5. Sautéed Veggies in Oyster Sauce (Tray): Stir-fried vegetables in oyster sauce
`;
 // Add all your menu items in this format

async function recommendation1() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0];
}

async function recommendation2() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      { role: "user", content: "Who won the world series in 2020?" },
    ],
  });
  return response.choices[0].message.content;
}

async function revised_generated_recommendation(dietaryData) {
  // Convert dietaryData object into a string of dietary preferences
  const dietaryPreferences = Object.entries(dietaryData)
    .filter(([_, value]) => value)
    .map(([key, _]) => key)
    .join(", ");
  console.log("CALL5: ", dietaryPreferences); // Log the filtered dietary preferences

  // Construct the prompt to send to the OpenAI API
  const prompt = `Given a customer's dietary preferences, suggest suitable menu options from the following list of dishes:
    ${menuDescription}
    The customer's dietary preferences are: ${dietaryPreferences}. Please provide recommendations for each dietary preference based on the dishes listed.`;

  console.log("Sending the following prompt to OpenAI:", prompt);

  try {
    // Make the API call to OpenAI with the constructed prompt
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant designed to output simple text.",
        },
        { role: "user", content: prompt },
      ],
    });

    console.log("API Response:", JSON.stringify(response, null, 2));

    // Check for valid response and parse the text
    if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
      console.error("No valid response or content available from the API.");
      return []; // Return an empty array if no data
    }

    // The response is expected as a string of recommendations separated by line breaks
    const recommendationsText = response.choices[0].message.content;
    const recommendationsArray = recommendationsText.split("\n").filter(line => line.trim());

    return recommendationsArray;
  } catch (error) {
    console.error("Failed to generate recommendations:", error);
    return []; // Return an empty array or handle the error as needed
  }
}




// function convertTextToObject(text) {
//   try {
//     // Remove potential formatting issues and parse the JSON string directly
//     const obj = JSON.parse(text);

//     // We need to dynamically extract keys since the dietary preference might change
//     // This checks for the first property in the object which should correspond to the dietary preference
//     const firstKey = Object.keys(obj)[0]; // This assumes there is at least one key
//     if (!firstKey) {
//       console.error("No dietary preferences found in the response.");
//       return [];
//     }

//     // Return the array associated with the first key, typically the dietary preference like "vegetarian"
//     return obj[firstKey] || [];
//   } catch (error) {
//     console.error("Error converting text to JSON object:", error);
//     return [];
//   }
// }




// function extractValues(obj) {
//   // Check if the input is a valid object
//   if (typeof obj !== 'object' || obj === null) {
//     console.error("Invalid input: expected an object");
//     return [];
//   }

//   let result = [];
//   // Loop through each property in the object
//   for (let key in obj) {
//     // Ensure the property is actually part of the object, not inherited
//     if (obj.hasOwnProperty(key)) {
//       // Check if the property is an array
//       if (Array.isArray(obj[key])) {
//         // If it's an array, push all its elements to the result
//         result.push(...obj[key]);
//       } else if (typeof obj[key] === 'object') {
//         // If it's another object, recursively extract values
//         result.push(...extractValues(obj[key]));
//       }
//     }
//   }
//   return result;
// }

module.exports = {
  recommendation1,
  recommendation2,
  revised_generated_recommendation,
  // extractValues,
};
