const API_URL = process.env.EXPO_PUBLIC_GEMINI_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_URL || !API_KEY) {
  throw new Error(
    "API_URL or API_KEY is not defined. Please check environment variables."
  );
}

const categories = [
  { name: "Viagem", color: "yellow" },
  { name: "Estudos", color: "blue" },
  { name: "Culinária", color: "orange" },
  { name: "Trabalho", color: "green" },
  { name: "Fitness", color: "red" },
  { name: "Limpeza", color: "brown" },
  { name: "Compras", color: "purple" },
  { name: "Desenvolvimento Pessoal", color: "teal" },
  { name: "Saúde e Bem-Estar", color: "pink" },
  { name: "Socialização", color: "cyan" },
  { name: "Lazer", color: "lime" },
  { name: "Finanças", color: "gold" },
  { name: "Projetos Criativos", color: "magenta" },
  { name: "Tecnologia", color: "silver" },
  { name: "Família", color: "violet" },
  { name: "Estética", color: "lavender" },
  { name: "Hobbies", color: "peach" },
  { name: "Jardinagem", color: "forestgreen" },
  { name: "Voluntariado", color: "navy" },
  { name: "Animais de Estimação", color: "chocolate" },
  { name: "Outros", color: "gray" },
];

const promptTemplate = `Classify the following text as a task into exactly ONE of the categories below. Respond strictly and only with the name of the category as listed, without any additional comments or explanations. The categories are: (${categories
  .map((category) => category.name)
  .join("), (")}). Text: `;

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
  const categoryName = await queryGemini(promptTemplate, str);
  const categoryObject = categories.find(
    (category) => category.name === categoryName.trim()
  );
  console.log(categoryObject);
  if (!categoryObject) {
    return { name: "Outros", color: "gray" };
  }
  return categoryObject;
}

export { categorizeTask };
