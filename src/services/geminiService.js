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

const dueDatePromptTemplate = `Analyze the task and date. If a time-related hint is found (e.g., "tomorrow," "next week," "in X days," "amanhã," "semana que vem"), try to calculate the due date using concepts like: "Tomorrow" or "amanhã" = +1 day. "Next week" or "semana que vem" = +7 days. "In X days" or "daqui a X dias" = +X days. Return only the due date (in DD/MM/AAAA) or only "no" if no hint is found. No explanations.`;

const insightsPromptTemplate = `Considering the following text as a personal task, provide actionable insights and step-by-step guidance on how to efficiently complete it. Focus on practical tips, prioritization, and time management strategies. Answer in Brazilian Portuguese and limit the response to 80 characters. The text is: `;

const analysisPromptTemplate = `Considering the following text as personal tasks, provide an useful analysis following the best productivity techniques and a helpful summarization. Answer in brazilian portuguese and in plain text, no markdown or formatted text, but you can use emojis. The text is:`;

async function queryGemini(prePrompt, userInput) {
  const fullPrompt = `${prePrompt} ${userInput}`;

  const TIMEOUT_DURATION = 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 204) {
      throw new Error("No content received from API");
    }

    const textResponse = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(textResponse);
    } catch (error) {
      throw new Error(
        `Invalid JSON response: ${textResponse.slice(0, 100)}...`
      );
    }

    if (!response.ok) {
      const errorDetails =
        responseData?.error?.details ||
        responseData?.error?.message ||
        textResponse ||
        response.statusText;

      throw new Error(`Gemini Error (${response.status}): ${errorDetails}`);
    }

    const responseText =
      responseData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!responseText) {
      throw new Error("Unexpected response format from Gemini API");
    }

    return responseText;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(
        `Timeout: Request exceeded ${TIMEOUT_DURATION / 1000} seconds`
      );
    }

    if (error instanceof TypeError) {
      throw new Error("Network error: Failed to connect to API");
    }

    throw error;
  }
}

async function categorizeTask(text, categoryName, isUrgent, dueDate) {
  let taskCategoryName;
  let isTaskUrgent;
  let taskDueDate;
  let taskInsights;

  if (!categoryName) {
    try {
      taskCategoryName = await queryGemini(categorizingPromptTemplate, text);
    } catch (error) {
      console.error("Error categorizing task:", error);
      taskCategoryName = "Outros";
    }
  } else {
    taskCategoryName = categoryName;
  }

  if (isUrgent === null) {
    try {
      isTaskUrgent = await queryGemini(isUrgentPromptTemplate, text);
      if (!isTaskUrgent) {
        isTaskUrgent = false;
      } else {
        isTaskUrgent = isTaskUrgent.toLowerCase().trim() === "yes";
      }
    } catch (error) {
      console.error("Error checking task urgency:", error);
      isTaskUrgent = false;
    }
  } else {
    isTaskUrgent = isUrgent;
  }

  if (!dueDate) {
    const currentTimestamp = Date.now();
    const currentDate = new Date(currentTimestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const additionalPromptInfo = `The current date is ${currentDate} and the text is: `;

    try {
      const date = await queryGemini(
        `${dueDatePromptTemplate} ${additionalPromptInfo}`,
        text
      );
      taskDueDate = date;
    } catch (error) {
      console.error("Error obtaining task due date:", error);
      taskDueDate = null;
    }
  } else {
    taskDueDate = dueDate;
  }

  try {
    taskInsights = await queryGemini(insightsPromptTemplate, text);
  } catch (error) {
    console.error("Error obtaining task insights:", error);
    taskInsights = null;
  }

  const categoryObject = categories.find(
    (category) => category.name === taskCategoryName.trim()
  );

  if (taskDueDate && typeof taskDueDate === "string") {
    const dateString = taskDueDate.trim();

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split("/");
      const date = new Date(year, month - 1, day);

      if (!isNaN(date.getTime())) {
        taskDueDate = date.getTime();
      } else {
        taskDueDate = null;
      }
    } else {
      taskDueDate = null;
    }
  }

  if (!categoryObject) {
    return {
      categoryName: "Outros",
      categoryColor: "gray",
      dueDate: taskDueDate,
      isUrgent: isTaskUrgent,
      insights: taskInsights,
    };
  } else {
    return {
      categoryName: categoryObject.name,
      categoryColor: categoryObject.color,
      dueDate: taskDueDate,
      isUrgent: isTaskUrgent,
      insights: taskInsights,
    };
  }
}

function isDateInCurrentWeek(timestamp) {
  if (!timestamp) return false;

  const now = new Date();
  const taskDate = new Date(timestamp);

  // Get week's first day
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay());

  // Get week's last day
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return taskDate >= startOfWeek && taskDate <= endOfWeek;
}

function isDateInCurrentMonth(timestamp) {
  if (!timestamp) return false;

  const now = new Date();
  const taskDate = new Date(timestamp);

  // Verifica se é o mesmo mês e ano
  return (
    taskDate.getMonth() === now.getMonth() &&
    taskDate.getFullYear() === now.getFullYear()
  );
}

async function getTaskAnalysis(tasks, mode) {
  let tasksForAnalysis = "";
  let taskCategories = {};

  const processCategories = (task) => {
    const categoryName = task.categoryName;

    if (taskCategories[categoryName]) {
      taskCategories[categoryName].count += 1;
    } else {
      taskCategories[categoryName] = {
        name: categoryName,
        color: task.categoryColor,
        count: 1,
      };
    }
  };

  const filteredTasks = Object.values(tasks).filter((task) => {
    if (task.isCompleted) return false;
    return mode === "weekly"
      ? isDateInCurrentWeek(task.dueDate)
      : isDateInCurrentMonth(task.dueDate);
  });

  if (filteredTasks.length === 0) {
    return null;
  }

  tasksForAnalysis = filteredTasks.map((task) => task.text).join("\n");
  filteredTasks.forEach(processCategories);

  try {
    const analysisResult = await queryGemini(
      analysisPromptTemplate,
      tasksForAnalysis
    );
    return {
      result: analysisResult,
      categories: taskCategories,
    };
  } catch (error) {
    console.error("Error obtaining tasks analysis:", error);
    return false;
  }
}

export { categorizeTask, getTaskAnalysis };
