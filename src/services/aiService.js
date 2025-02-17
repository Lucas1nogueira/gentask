import categories from "../data/categories";

const API_URL = process.env.EXPO_PUBLIC_OPENROUTER_AI_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_AI_API_KEY;

if (!API_URL || !API_KEY) {
  throw new Error(
    "API_URL or API_KEY is not defined. Please check environment variables."
  );
}

const categorizingPromptTemplate = `Classify the following text as a task into exactly ONE of the categories below. Respond strictly and only with the name of the category as listed, without any additional comments or explanations. The categories are: (${categories
  .map((category) => category.name)
  .join("), (")}). Text: `;

const isUrgentPromptTemplate = `Considering the following text as a personal task, can this task be labeled as urgent? Consider only if the text is clearly talking about an urgent activity, and answer only with "yes" or "no". No explanations. The text is: `;

const dueDatePromptTemplate = `Analyze the task and date. If a time-related hint is found (e.g., "amanhã", "semana que vem", "próximo mês" or any other hints), try to calculate the due date using concepts like: "amanhã" = +1 day. "semana que vem" = +7 days. "daqui a X dias" = +X days. And so on. Return only the due date (in DD/MM/AAAA) or just "no" if no hint is found. No explanations.`;

const insightsPromptTemplate = `Considering the following text as a personal task, provide actionable insights. Answer only in Brazilian Portuguese and limit the response to 10 words. The text is: `;

const analysisPromptTemplate = `Considering the following text as personal tasks, provide an useful analysis following the best productivity techniques and a helpful summarization. Answer in brazilian portuguese and in plain text, but you can use emojis. Limit the answer to just 50 words). The text is:`;

const suggestionPromptTemplate = `Considering the following personal tasks, suggest a new task based on the found interests. Limit the response to 10 words, ONLY in portuguese, plain text. Tasks:`;

async function query(prePrompt, userInput, maxTokens, temp) {
  const fullPrompt = `${prePrompt} ${userInput}`;
  const TIMEOUT_DURATION = 15000;

  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), TIMEOUT_DURATION);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: fullPrompt }],
        max_tokens: maxTokens,
        top_k: 1,
        temperature: temp,
      }),
      signal: timeoutController.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("Incomplete API response: " + JSON.stringify(data));
    }

    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(`AI query error: ${error.message}`);
  }
}

async function categorizeTask(text, categoryName, isUrgent, dueDate) {
  let taskCategoryName;
  let isTaskUrgent;
  let taskDueDate;
  let taskInsights;

  if (!categoryName) {
    try {
      taskCategoryName = await query(categorizingPromptTemplate, text, 10, 0.3);
    } catch (error) {
      console.error("Error categorizing task:", error);
      taskCategoryName = "Outros";
    }
  } else {
    taskCategoryName = categoryName;
  }

  if (isUrgent === null) {
    try {
      isTaskUrgent = await query(isUrgentPromptTemplate, text, 3, 0.3);
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
      const date = await query(
        `${dueDatePromptTemplate} ${additionalPromptInfo}`,
        text,
        15,
        0.5
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
    taskInsights = await query(insightsPromptTemplate, text, 50, 0.7);
  } catch (error) {
    console.error("Error obtaining task insights:", error);
    taskInsights = null;
  }

  taskCategoryName = taskCategoryName.replace(/[()]/g, "");
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
    const analysisResult = await query(
      analysisPromptTemplate,
      tasksForAnalysis,
      400,
      0.7
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

async function getTaskSuggestion(tasks) {
  const tasksText = Object.values(tasks)
    .map((task) => task.text)
    .join("\n");

  try {
    const taskSuggestion = await query(
      suggestionPromptTemplate,
      tasksText,
      30,
      0.7
    );

    if (typeof taskSuggestion === "string") {
      return taskSuggestion.replace(/["]/g, "");
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error obtaining task suggestion:", error);
    return null;
  }
}

export { query, categorizeTask, getTaskAnalysis, getTaskSuggestion };
