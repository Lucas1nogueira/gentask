import { getAIConfig } from "./firebase/firestore";
import categories from "../data/categories";

let apiUrl;
let apiKey;
let aiModel;

const categorizingPromptTemplate = `Classifique a tarefa a seguir em exatamente UMA das categorias seguintes. Responda UNICAMENTE com o nome da categoria. As categorias são: (${categories
  .map((category) => category.name)
  .join("), (")}). Text: `;

const isUrgentPromptTemplate = `Considerando o texto a seguir como uma tarefa, pode essa tarefa ser considerada como urgente? Considere somente se o texto está falando claramente de uma atividade urgente, e responda UNICAMENTE com "yes" or "no". O texto é: `;

const dueDatePromptTemplate = `Analise as seguintes tarefa e data. Se na tarefa for encontrado algum termo temporal, como "amanhã", "semana que vem", "próximo mês" ou qualquer outro, tente calcular a data de conclusão a partir do termo temporal, por exemplo: "amanhã" = +1 dia, "semana que vem" = +7 dias, "daqui a X dias" = +X dias, e assim por diante. Responda UNICAMENTE com a data de conclusão (formato DD/MM/AAAA) ou apenas "no" se nenhum termo temporal for encontrado. Nenhum comentário adicional!`;

const insightsPromptTemplate = `Considerando a tarefa a seguir, forneça um insight útil. NÃO ultrapasse 10 palavras. A tarefa é: `;

const analysisPromptTemplate = `Considerando as tarefas a seguir, forneça uma análise produtiva. Responda sem caracteres especiais, mas use emojis. Responda com POUCAS palavras. O texto é: `;

const suggestionPromptTemplate = `Considerando as tarefas a seguir, sugira uma nova tarefa baseada em interesses encontrados. Responda com, no máximo, 10 palavras. Tarefas: `;

async function configure() {
  try {
    const aiConfig = await getAIConfig();

    if (aiConfig) {
      apiUrl = aiConfig.apiUrl;
      apiKey = aiConfig.apiKey;
      aiModel = aiConfig.model;
      return true;
    } else {
      console.log("Could not obtain AI configuration!");
      return false;
    }
  } catch (error) {
    console.error("Error retrieving AI configuration:", error);
  }
}

async function query(prePrompt, userInput, maxTokens, temp) {
  if (!apiUrl || !apiKey || !aiModel) {
    throw new Error("API URL, API key or AI model are not defined.");
  }

  const fullPrompt = `${prePrompt} ${userInput}`;
  const TIMEOUT_DURATION = 15000;

  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), TIMEOUT_DURATION);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
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
    // console.log(JSON.stringify(data, null, 2));

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("Incomplete API response: " + JSON.stringify(data));
    }

    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(`AI query error: ${error.message}`);
  }
}

async function categorizeTask(text, categoryName, isUrgent, dueDate) {
  const categoryPromise = !categoryName
    ? query(categorizingPromptTemplate, text, 10, 0.3).catch(() => "Outros")
    : Promise.resolve(categoryName);

  const isUrgentPromise =
    isUrgent === null
      ? query(isUrgentPromptTemplate, text, 3, 0.5)
          .then((result) =>
            result ? result.toLowerCase().trim() === "yes" : false
          )
          .catch(() => false)
      : Promise.resolve(isUrgent);

  const dueDatePromise = !dueDate
    ? (() => {
        const currentDate = new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        return query(
          `${dueDatePromptTemplate} A data atual é ${currentDate} e a tarefa é: `,
          text,
          15,
          0.2
        ).catch(() => null);
      })()
    : Promise.resolve(dueDate);

  const insightsPromise = query(insightsPromptTemplate, text, 50, 0.7)
    .then((result) => (result ? result.trim() : null))
    .catch(() => null);

  const [taskCategoryName, isTaskUrgent, taskDueDate, taskInsights] =
    await Promise.all([
      categoryPromise,
      isUrgentPromise,
      dueDatePromise,
      insightsPromise,
    ]);

  const processedCategory = taskCategoryName.replace(/[()]/g, "").trim();
  const categoryObject = categories.find((c) => c.name === processedCategory);

  let processedDueDate = null;
  if (taskDueDate && typeof taskDueDate === "string") {
    const [day, month, year] = taskDueDate.trim().split("/");
    const date = new Date(year, month - 1, day);
    processedDueDate = isNaN(date.getTime()) ? null : date.getTime();
  }

  return {
    categoryName: categoryObject?.name || "Outros",
    categoryColor: categoryObject?.color || "gray",
    dueDate: processedDueDate !== null ? processedDueDate : dueDate,
    isUrgent: isTaskUrgent,
    insights: taskInsights,
  };
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
      result: analysisResult.trim(),
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
      50,
      0.7
    );

    if (typeof taskSuggestion === "string") {
      return taskSuggestion.replace(/["]/g, "").trim();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error obtaining task suggestion:", error);
    return null;
  }
}

export { configure, query, categorizeTask, getTaskAnalysis, getTaskSuggestion };
