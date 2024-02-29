const OpenAI = require("openai");

const openai = new OpenAI();

// Define your menu items with their dietary categorizations
// ... (existing menuDescription)
// Define your menu items with their dietary categorizations
const menuDescription = `1. Afritada (Tray): Chicken stew with vegetables [Omnivore, Gluten-Free, Nut-Free]
    2. Bacon (Rice Meal): Crispy bacon strips, option with or without egg [Omnivore, Lactose-Free, Gluten-Free]
    3. Baked Cream Dory w/ Potatoes (Tray): Creamy fish and potato bake [Pescatarian, Gluten-Free, Nut-Free]
    4. Beef Caldereta (Tray): Spicy beef stew with vegetables [Omnivore, Gluten-Free, Nut-Free]
    5. Beef Mechado (Tray): Filipino beef stew with tomato sauce [Omnivore, Gluten-Free, Nut-Free]
    6. Beef Tapa (Rice Meal): Cured beef slices, option with or without egg [Omnivore, Gluten-Free, Lactose-Free]
    7. Beef w/ Broccoli (Tray): Beef slices with broccoli in a savory sauce [Omnivore, Gluten-Free, Nut-Free]
    8. Beef Salpicao (Tray): Garlic beef stir-fry [Omnivore, Gluten-Free, Nut-Free]
    9. Buttered Carrots w/ Chicharo (Tray): Buttered carrots and peas [Vegetarian, Gluten-Free, Nut-Free]
    10. Buttered Potato Marbles (Tray): Buttered small potatoes [Vegetarian, Gluten-Free, Nut-Free]
    11. Canton Guisado (Short Order): Stir-fried noodles [Omnivore, Nut-Free]
    12. Caldereta (Tray): Spicy meat stew with tomato sauce [Omnivore, Gluten-Free, Nut-Free]
    13. Chami (Short Order): Sweet and spicy fried noodles [Omnivore, Nut-Free]
    14. Chicken Ala King (Tray): Creamy chicken with vegetables [Omnivore, Nut-Free]
    15. Chicken Embotido (Tray): Filipino meatloaf with chicken [Omnivore, Nut-Free]
    16. Chicken Roll (Rice Meal): Rolled chicken cutlet, option with or without egg [Omnivore, Nut-Free]
    17. Chicken Roll (Tray): Chicken meat roll [Omnivore, Gluten-Free, Nut-Free]
    18. Creamy Beef w/ Mushroom (Tray): Beef in creamy mushroom sauce [Omnivore, Gluten-Free, Nut-Free]
    19. Embotido (Tray): Filipino meatloaf [Omnivore, Nut-Free]
    20. Fresh Lumpiang Ubod: Fresh spring rolls with vegetables [Vegetarian, Gluten-Free, Nut-Free]
    21. Fried Chicken Fingers: Breaded chicken strips [Omnivore, Nut-Free]
    22. Fried Fish Filet (Tray): Breaded fish fillets [Pescatarian, Nut-Free]
    23. Glazed Chicken (Tray): Chicken with sweet glaze [Omnivore, Gluten-Free, Nut-Free]
    24. Glazed Fish Fillet (Tray): Fish with sweet glaze [Pescatarian, Gluten-Free, Nut-Free]
    25. Hamonado (Tray): Sweet pork dish [Omnivore, Gluten-Free, Nut-Free]
    26. Hungarian Sausage (Rice Meal): Spicy sausage, option with or without egg [Omnivore, Gluten-Free, Lactose-Free]
    27. Kare-Kare (Tray): Peanut-based meat stew [Omnivore, Gluten-Free]
    28. Korean Beef Stew (Tray): Beef in Korean-style sauce [Omnivore, Nut-Free]
    29. Longganisa (Rice Meal): Filipino sausage, option with or without egg [Omnivore, Gluten-Free, Lactose-Free]
    30. Lumpiang Shanghai (Rice Meal): Fried spring rolls [Omnivore, Nut-Free]
    31. Menudo (Tray): Tomato-based pork and liver stew [Omnivore, Gluten-Free, Nut-Free]
    32. Mixed Vegies in Cream (Tray): Creamed mixed vegetables [Vegetarian, Gluten-Free, Nut-Free]
    33. Mongolian Beef (Tray): Spicy beef stir-fry [Omnivore, Gluten-Free, Nut-Free]
    34. Pork Tocino (Rice Meal): Sweet cured pork, option with or without egg [Omnivore, Gluten-Free, Lactose-Free]
    35. Pork Pastel (Tray): Pork stew with mixed vegetables [Omnivore, Gluten-Free, Nut-Free]
    36. Sautéed Fish and Veggies in Chili Garlic Sauce (Tray): Fish with vegetables in a spicy sauce [Pescatarian, Gluten-Free, Nut-Free]
    37. Sautéed Veggies in Oyster Sauce (Tray): Stir-fried vegetables in oyster sauce [Vegetarian, Gluten-Free, Nut-Free]
    38. Sisig (Tray): Minced pork head and liver in a sizzling plate [Omnivore, Nut-Free]
    39. Sweet and Sour Fish Fillet (Tray): Fish fillet in sweet and sour sauce [Pescatarian, Nut-Free]
    41. Sweet and Sour Pork (Tray): Pork in sweet and sour sauce [Omnivore, Nut-Free] `; // Add all your menu items in this format

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
  console.log("CALL5: ", dietaryPreferences);
  const prompt = `Given a customer's dietary preferences, suggest suitable menu options from the following list of dishes:
    ${menuDescription}

    The customer's dietary preferences are: ${dietaryPreferences}. Please provide recommendations for each dietary preference based on the dishes listed. And please copy the exact text in the list once selected.`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      { role: "user", content: prompt },
    ],
  });

  const convertedResponse = convertTextToObject(
    response.choices[0].message.content
  );
  return convertedResponse;
}

function convertTextToObject(text) {
  // Remove newline characters and escape characters from the text
  const sanitizedText = text
    .replace(/\\n|\\/g, "")
    .trim()
    .replace(/^```json\s+/, "")
    .replace(/\s+```$/, "");
  const obj = JSON.parse(sanitizedText);
  return extractValues(obj);
}

function extractValues(obj) {
  let result = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {
      result.push(...obj[key]);
    }
  }
  return result;
}

module.exports = {
  recommendation1,
  recommendation2,
  revised_generated_recommendation,
  extractValues,
};
