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

const insightsPromptTemplate = `Considering the following text as a personal task, provide actionable insights and step-by-step guidance on how to efficiently complete it. Focus on practical tips, prioritization, and time management strategies. Answer in Brazilian Portuguese and limit the response to 80 characters. The text is: `;

async function queryGemini(prePrompt, userInput) {
  const fullPrompt = `${prePrompt} ${userInput}`;

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
    throw error;
  }
}

async function categorizeTask(str) {
  let categoryName;
  let isTaskUrgent;
  let taskInsights;

  try {
    categoryName = await queryGemini(categorizingPromptTemplate, str);
  } catch (error) {
    console.warn("Error categorizing task:", error);
    categoryName = "Outros";
  }

  try {
    isTaskUrgent = await queryGemini(isUrgentPromptTemplate, str);
    if (!isTaskUrgent) {
      isTaskUrgent = false;
    } else {
      isTaskUrgent = isTaskUrgent.toLowerCase().trim() === "yes";
    }
  } catch (error) {
    console.warn("Error checking task urgency:", error);
    isTaskUrgent = false;
  }

  try {
    taskInsights = await queryGemini(insightsPromptTemplate, str);
  } catch (error) {
    console.warn("Error obtaining insights:", error);
    taskInsights = null;
  }

  const categoryObject = categories.find(
    (category) => category.name === categoryName.trim()
  );

  if (!categoryObject) {
    return {
      categoryName: "Outros",
      categoryColor: "gray",
      isUrgent: isTaskUrgent,
      insights: taskInsights,
    };
  } else {
    return {
      categoryName: categoryObject.name,
      categoryColor: categoryObject.color,
      isUrgent: isTaskUrgent,
      insights: taskInsights,
    };
  }
}

export { categorizeTask };
