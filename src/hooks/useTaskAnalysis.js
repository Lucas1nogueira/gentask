import { useEffect, useState } from "react";
import { getTaskAnalysis } from "../services/aiService";

const taskAnalysisCache = new Map();

export function useTaskAnalysis(tasks, mode) {
  const [chartData, setChartData] = useState(null);
  const [analysisResult, setResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [didLoad, setDidLoad] = useState(null);

  useEffect(() => {
    if (!tasks || !mode) return;

    const key = JSON.stringify({ tasks, mode });

    if (taskAnalysisCache.has(key)) {
      const obj = taskAnalysisCache.get(key);

      if (obj) {
        setChartData(obj.categories);
        setResult(obj.result);
        setDidLoad(true);
      } else if (obj === null) {
        setErrorMessage(
          "Não foram encontradas tarefas pendentes com data prevista para o período selecionado!"
        );
        setDidLoad(false);
      } else {
        setErrorMessage(
          "Não foi possível conectar com o servidor no momento! Por favor, verifique sua conexão e tente novamente mais tarde."
        );
        setDidLoad(false);
      }
      return;
    }

    setDidLoad(null);

    getTaskAnalysis(tasks, mode).then((obj) => {
      taskAnalysisCache.set(key, obj);

      if (obj) {
        setChartData(obj.categories);
        setResult(obj.result);
        setDidLoad(true);
      } else if (obj === null) {
        setErrorMessage(
          "Não foram encontradas tarefas pendentes com data prevista para o período selecionado!"
        );
        setDidLoad(false);
      } else {
        setErrorMessage(
          "Não foi possível conectar com o servidor no momento! Por favor, verifique sua conexão e tente novamente mais tarde."
        );
        setDidLoad(false);
      }
    });
  }, [tasks, mode]);

  return {
    didAnalysisLoad: didLoad,
    chartData,
    analysisResult,
    errorMessage,
  };
}
