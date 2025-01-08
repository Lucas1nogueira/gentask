import categories from "../data/categories";

const API_URL = process.env.EXPO_PUBLIC_GEMINI_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_URL || !API_KEY) {
  throw new Error(
    "API_URL or API_KEY is not defined. Please check environment variables."
  );
}

const categorizingPromptTemplate = `Classify the following text as a task into exactly ONE of the categories below. Respond strictly and only with the name of the category as listed, without any additional comments or explanations. The categories are: (${categories
  .map((category) => category.name)
  .join("), (")}). Text: `;

const isUrgentPromptTemplate = `Considering the following text as a personal task, can this task be labeled as urgent? Consider just if the text is clearly talking about an urgent activity, and respond strictly and only with yes or no, without any additional comments or explanations. The text is: `;

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

    if (!responseText) {
      throw new Error("Unexpected response format from Gemini API.");
    }

    return responseText;
  } catch (error) {
    console.error("Error: ", error.message);
    throw error;
  }
}

async function categorizeTask(str) {
  const categoryName = await queryGemini(categorizingPromptTemplate, str);
  const categoryObject = categories.find(
    (category) => category.name === categoryName.trim()
  );
  let urgent = await queryGemini(isUrgentPromptTemplate, str);
  if (!urgent) {
    urgent = false;
  } else {
    urgent = urgent.toLowerCase().trim() == "yes" ? true : false;
  }
  if (!categoryObject) {
    return {
      categoryName: "Outros",
      categoryColor: "gray",
      isUrgent: urgent,
    };
  } else {
    return {
      categoryName: categoryObject.name,
      categoryColor: categoryObject.color,
      isUrgent: urgent,
    };
  }
}

export { categorizeTask };
