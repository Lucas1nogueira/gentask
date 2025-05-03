import { useEffect, useState } from "react";
import { getProfileAnalysis } from "../services/aiService";

const profileAnalysisCache = new Map();

export function useProfileAnalysis(tasks) {
  const [chartData, setChartData] = useState(null);
  const [analysisResult, setResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [didLoad, setDidLoad] = useState(null);

  useEffect(() => {
    if (!tasks) return;

    const key = JSON.stringify(tasks);

    if (profileAnalysisCache.has(key)) {
      const obj = profileAnalysisCache.get(key);

      if (obj) {
        setChartData(obj.categories);
        setResult(obj.result);
        setDidLoad(true);
      } else if (obj === null) {
        setErrorMessage(
          "Nenhuma tarefa cadastrada! Por favor, insira uma ou mais tarefas para que a análise possa ser realizada."
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

    getProfileAnalysis(tasks).then((obj) => {
      profileAnalysisCache.set(key, obj);

      if (obj) {
        setChartData(obj.categories);
        setResult(obj.result);
        setDidLoad(true);
      } else if (obj === null) {
        setErrorMessage(
          "Nenhuma tarefa cadastrada! Por favor, insira uma ou mais tarefas para que a análise possa ser realizada."
        );
        setDidLoad(false);
      } else {
        setErrorMessage(
          "Não foi possível conectar com o servidor no momento! Por favor, verifique sua conexão e tente novamente mais tarde."
        );
        setDidLoad(false);
      }
    });
  }, [tasks]);

  return {
    didAnalysisLoad: didLoad,
    chartData,
    analysisResult,
    errorMessage,
  };
}
