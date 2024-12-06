const API_URL = process.env.EXPO_PUBLIC_GEMINI_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

async function queryGemini(prePrompt, userInput) {
  const fullPrompt = `${prePrompt}: ${userInput}`;

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
      }),
    });

    // Checking for response errors
    if (!response.ok) {
      throw new Error(`Gemini error: ${response.statusText}`);
    }

    const responseData = await response.json();

    // Extract response content
    const responseText =
      responseData.candidates[0]?.content?.parts[0]?.text || "";
    return responseText;
  } catch (error) {
    console.error("Error: ", error.message);
    throw error;
  }
}

async function categorizeTask(str) {
  const categoryResult = await queryGemini(
    "Categorize the following text, considering it's a task, in just one of the following categories: (Travelling), (Studies / Learning), (Cooking / Meal Prep), (Work / Professional), (Fitness / Exercise), (Household / Cleaning), (Shopping / Errands), (Personal Development), (Health & Wellness), (Socializing / Networking), (Entertainment / Leisure), (Finance / Budgeting), (Creative Projects), (Technology / Gadgets), (Family / Relationships), (Self-care / Relaxation), (Hobbies / Crafts), (Gardening / Outdoors), (Volunteering / Community), (Pets / Animal Care), (Other). Answer strictly and only with the category. The text is: ",
    str
  );
  console.log(categoryResult);
  return categoryResult;
}

export { categorizeTask };
