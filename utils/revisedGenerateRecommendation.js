const OpenAI = require("openai");

const openai = new OpenAI();

// Define your menu items with their dietary categorizations
// ... (existing menuDescription)
// Define your menu items with their dietary categorizations
const menuDescription = `
**Omnivore:**
1. Afritada (Tray): Chicken stew with vegetables
   ![Afritada](images/afritada.jpg)
2. Bacon (Rice Meal): Crispy bacon strips, option with or without egg
   ![Bacon](images/bac.jpg)
3. Beef Mechado (Tray): Filipino beef stew with tomato sauce
   ![Beef Mechado](images/bm.jpg)
4. Beef Tapa (Rice Meal): Cured beef slices, option with or without egg
   ![Beef Tapa](images/tap.jpg)
5. Beef w/ Broccoli (Tray): Beef slices with broccoli in a savory sauce
   ![Beef w/ Broccoli](images/bwb.jpg)
6. Beef Salpicao (Tray): Garlic beef stir-fry
   ![Beef Salpicao](images/bs.jpg)
7. Caldereta (Tray): Spicy meat stew with tomato sauce
   ![Caldereta](images/caldereta.jpg)
8. Chicken Ala King (Tray): Creamy chicken with vegetables
   ![Chicken Ala King](images/cak.jpg)
9. Chicken Embotido (Tray): Filipino meatloaf with chicken
   ![Chicken Embotido](images/ce.jpg)
10. Chicken Roll (Rice Meal): Rolled chicken cutlet, option with or without egg
    ![Chicken Roll](images/cr.jpg)
11. Chicken Roll (Tray): Chicken meat roll
    ![Chicken Roll](images/f1.jpg)
12. Creamy Beef w/ Mushroom (Tray): Beef in creamy mushroom sauce
    ![Creamy Beef w/ Mushroom](images/cbm.jpg)
13. Fried Chicken Fingers: Breaded chicken strips
    ![Fried Chicken Fingers](images/fcf.jpg)
14. Fried Fish Filet (Tray): Breaded fish fillets
    ![Fried Fish Filet](images/f5.jpg)
15. Glazed Chicken (Tray): Chicken with sweet glaze
    ![Glazed Chicken](images/gc.jpg)
16. Glazed Fish Fillet (Tray): Fish with sweet glaze
    ![Glazed Fish Fillet](images/gff.jpg)
17. Hamonado (Tray): Sweet pork dish
    ![Hamonado](images/hmdo.jpg)
18. Hungarian Sausage (Rice Meal): Spicy sausage, option with or without egg
    ![Hungarian Sausage](images/hs.jpg)
19. Kare-Kare (Tray): Peanut-based meat stew
    ![Kare-Kare](images/kk.jpg)
20. Korean Beef Stew (Tray): Beef in Korean-style sauce
    ![Korean Beef Stew](images/kbs.jpg)
21. Longganisa (Rice Meal): Filipino sausage, option with or without egg
    ![Longganisa](images/lrm.jpg)
22. Menudo (Tray): Tomato-based pork and liver stew
    ![Menudo](images/mn.jpg)
23. Mongolian Beef (Tray): Spicy beef stir-fry
    ![Mongolian Beef](images/mong.jpg)
24. Pork Tocino (Rice Meal): Sweet cured pork, option with or without egg
    ![Pork Tocino](images/ptcrm.jpg)
25. Pork Pastel (Tray): Pork stew with mixed vegetables
    ![Pork Pastel](images/pastel.jpg)
26. Sweet and Sour Pork (Tray): Pork in sweet and sour sauce
    ![Sweet and Sour Pork](images/ssp.jpg)

**Gluten-Free:**
1. Bacon (Rice Meal): Crispy bacon strips, option with or without egg
    ![Bacon](images/bacon.jpg)
2. Baked Cream Dory w/ Potatoes (Tray): Creamy fish and potato bake
    ![Baked Cream Dory w/ Potatoes](images/bcd.jpg)
3. Beef Caldereta (Tray): Spicy beef stew with vegetables
    ![Beef Caldereta](images/caldereta.jpg)
4. Beef Mechado (Tray): Filipino beef stew with tomato sauce
    ![Beef Mechado](images/bm.jpg)
5. Beef Tapa (Rice Meal): Cured beef slices, option with or without egg
    ![Beef Tapa](images/tap.jpg)
6. Beef w/ Broccoli (Tray): Beef slices with broccoli in a savory sauce
    ![Beef w/ Broccoli](images/bwb.jpg)
7. Beef Salpicao (Tray): Garlic beef stir-fry
    ![Beef Salpicao](images/bs.jpg)
8. Caldereta (Tray): Spicy meat stew with tomato sauce
    ![Caldereta](images/pc.jpg)
9. Chicken Roll (Tray): Chicken meat roll
    ![Chicken Roll](images/f1.jpg)
10. Creamy Beef w/ Mushroom (Tray): Beef in creamy mushroom sauce
    ![Creamy Beef w/ Mushroom](images/cbm.jpg)
11. Glazed Chicken (Tray): Chicken with sweet glaze
    ![Glazed Chicken](images/gc.jpg)
12. Glazed Fish Fillet (Tray): Fish with sweet glaze
    ![Glazed Fish Fillet](images/gff.jpg)
13. Hamonado (Tray): Sweet pork dish
    ![Hamonado](images/hmdo.jpg)
14. Hungarian Sausage (Rice Meal): Spicy sausage, option with or without egg
    ![Hungarian Sausage](images/hs.jpg)
15. Kare-Kare (Tray): Peanut-based meat stew
    ![Kare-Kare](images/kk.jpg)
16. Menudo (Tray): Tomato-based pork and liver stew
    ![Menudo](images/mn.jpg)
17. Mongolian Beef (Tray): Spicy beef stir-fry
    ![Mongolian Beef](images/mong.jpg)
18. Pork Tocino (Rice Meal): Sweet cured pork, option with or without egg
    ![Pork Tocino](images/ptcrm.jpg)
19. Pork Pastel (Tray): Pork stew with mixed vegetables
    ![Pork Pastel](images/pastel.jpg)
20. Sautéed Fish and Veggies in Chili Garlic Sauce (Tray): Fish with vegetables in a spicy sauce
    ![Sautéed Fish and Veggies in Chili Garlic Sauce](images/fishveg.jpg)

**Nut Allergy:**
1. Canton Guisado (Short Order): Stir-fried noodles
    ![Canton Guisado](images/cg.jpg)
2. Chami (Short Order): Sweet and spicy fried noodles
    ![Chami](images/chmi.jpg)
3. Chicken Ala King (Tray): Creamy chicken with vegetables
    ![Chicken Ala King](images/cak.jpg)
4. Chicken Embotido (Tray): Filipino meatloaf with chicken
    ![Chicken Embotido](images/ce.jpg)
5. Chicken Roll (Rice Meal): Rolled chicken cutlet, option with or without egg
    ![Chicken Roll](images/cr.jpg)
6. Lumpiang Shanghai (Rice Meal): Fried spring rolls
    ![Lumpiang Shanghai](images/ls.jpg)
7. Sisig (Tray): Minced pork head and liver in a sizzling plate
    ![Sisig](images/sisig.jpg)
8. Sweet and Sour Fish Fillet (Tray): Fish fillet in sweet and sour sauce
    ![Sweet and Sour Fish Fillet](images/ssf.jpg)
9. Sweet and Sour Pork (Tray): Pork in sweet and sour sauce
    ![Sweet and Sour Pork](images/ssp.jpg)

**Vegetarian:**
1. Buttered Carrots w/ Chicharo (Tray): Buttered carrots and peas
    ![Buttered Carrots w/ Chicharo](images/bcc.jpg)
2. Buttered Potato Marbles (Tray): Buttered small potatoes
    ![Buttered Potato Marbles](images/bpm.jpg)
3. Fresh Lumpiang Ubod (Tray): Fresh spring rolls with vegetables
    ![Fresh Lumpiang Ubod](images/flu.jpg)
4. Mixed Vegies in Cream (Tray): Creamed mixed vegetables
    ![Mixed Vegies in Cream](images/cream.jpeg)
5. Sautéed Veggies in Oyster Sauce (Tray): Stir-fried vegetables in oyster sauce
    ![Sautéed Veggies in Oyster Sauce](images/saute.jpg)
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

// Step 2: Pass Image Metadata to Recommendation Generation Function
async function revised_generated_recommendation(dietaryData, imageMetadata) {
    // Convert dietaryData object into a string of dietary preferences
    const dietaryPreferences = Object.entries(dietaryData)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(", ");
    
    // Construct the prompt to send to the OpenAI API
    const prompt = `Given a customer's dietary preferences, suggest suitable menu options from the following list of dishes:
      ${menuDescription}
      The customer's dietary preferences are: ${dietaryPreferences}. Please provide recommendations for each dietary preference based on the dishes listed. 
      ${imageMetadata}`;

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

    // // The response is expected as a string of recommendations separated by line breaks
    // const recommendationsText = response.choices[0].message.content;
    // const recommendationsArray = recommendationsText.split("\n").filter(line => line.trim());

   // The response is expected as a string of recommendations separated by line breaks
const recommendationsText = response.choices[0].message.content;
// Replace the placeholder for image metadata with actual HTML image tags
const recommendationsHTML = recommendationsText.replace(/!\[([^[\]]*?)\]\((.*?)\)/g, '<img alt="$1" src="$2">');
// Split the response by line breaks
const recommendationsArray = recommendationsHTML.split("\n").filter(line => line.trim());



    return recommendationsArray;
  } catch (error) {
    console.error("Failed to generate recommendations:", error);
    return []; // Return an empty array or handle the error as needed
  }
}




module.exports = {
  recommendation1,
  recommendation2,
  revised_generated_recommendation,
  // extractValues,
};

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
