import { GoogleGenAI } from "@google/genai";
import categories from "../data/categories";
import { getAIConfig } from "./firebase/firestore";

export let apiKey;
export let modelName;
let genAI;

const categorizingPromptTemplate = `Classifique a tarefa a seguir em exatamente UMA das categorias seguintes. Responda UNICAMENTE com o nome da categoria. As categorias são: (${categories
  .map((category) => category.name)
  .join("), (")}). Text: `;

const isUrgentPromptTemplate = `Considerando o texto a seguir como uma tarefa, pode essa tarefa ser considerada como urgente? Considere somente se o texto está falando claramente de uma atividade urgente, e responda UNICAMENTE com "yes" or "no". O texto é: `;

const dueDatePromptTemplate = `Analise as seguintes tarefa e data. Se na tarefa for encontrado algum termo temporal, como "amanhã", "semana que vem", "próximo mês" ou qualquer outro, tente calcular a data de conclusão a partir do termo temporal, por exemplo: "amanhã" = +1 dia, "semana que vem" = +7 dias, "daqui a X dias" = +X dias, e assim por diante. Responda UNICAMENTE com a data de conclusão (formato DD/MM/AAAA) ou apenas "no" se nenhum termo temporal for encontrado. Nenhum comentário adicional!`;

const insightsPromptTemplate = `Considerando a tarefa a seguir, forneça um insight útil. NÃO ultrapasse 10 palavras. A tarefa é: `;

const analysisPromptTemplate = `Considerando as tarefas a seguir, forneça uma análise com dicas. Use emojis, a resposta deve ser de tamanho médio, e não conter negrito, itálico ou asteriscos. IGNORE termos temporais. O texto é: `;

const profilePromptTemplate = `Considerando isso, forneça uma análise com dicas para melhorar. Responda sem caracteres especiais. Responda brevemente. O texto é: `;

const suggestionPromptTemplate = `Considerando as tarefas a seguir, sugira apenas uma nova tarefa criativa baseada em interesses encontrados. Responda com poucas palavras. Tarefas: `;

async function configure() {
  try {
    const aiConfig = await getAIConfig();

    if (aiConfig) {
      apiKey = aiConfig.apiKey;
      modelName = aiConfig.modelName;
      genAI = new GoogleGenAI({ apiKey });
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
  if (!apiKey || !modelName) {
    throw new Error("API key or AI model are not defined.");
  }

  const fullPrompt = `${prePrompt} ${userInput}`;

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: fullPrompt,
      config: {
        maxOutputTokens: maxTokens,
        temperature: temp,
      },
    });

    const result = response.text;

    return result;
  } catch (error) {
    throw new Error(`Gemini query error: ${error.message}`);
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

async function getProfileAnalysis(tasks) {
  if (!tasks || Object.values(tasks).length === 0) {
    return null;
  }

  let tasksInfo = {
    done: {
      name: "Concluídas",
      color: "#4A90E2",
      count: 0,
    },
    undone: {
      name: "Não concluídas",
      color: "#FF6B6B",
      count: 0,
    },
  };

  Object.values(tasks).forEach((task) => {
    if (task.isCompleted) tasksInfo.done.count += 1;
    else tasksInfo.undone.count += 1;
  });

  const doneTasks = tasksInfo.done.count;
  const undoneTasks = tasksInfo.undone.count;
  const totalTasks = doneTasks + undoneTasks;

  const doneTasksPercentage =
    totalTasks > 0 ? (doneTasks * 100) / totalTasks : 0;
  const doneTasksPrompt = `Cumpri um total de ${doneTasksPercentage.toFixed(
    1
  )}% das minhas tarefas.`;

  try {
    const analysisResult = await query(
      doneTasksPrompt,
      profilePromptTemplate,
      400,
      0.7
    );

    return {
      result: analysisResult.trim(),
      categories: tasksInfo,
    };
  } catch (error) {
    console.error("Error obtaining profile analysis:", error);
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
      0.9
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

export {
  categorizeTask,
  configure,
  getProfileAnalysis,
  getTaskAnalysis,
  getTaskSuggestion,
  query,
};
