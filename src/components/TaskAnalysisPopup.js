import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons/";
import { getTaskAnalysis } from "../services/geminiService";
import { animateBlinking } from "../utils/animationUtils";
import { ThemeContext } from "../contexts/ThemeContext";
import Chart from "./Chart";

function TaskAnalysisPopup(props) {
  const { styles } = useContext(ThemeContext);

  const opacityAnimation = useRef(new Animated.Value(1)).current;

  const [chartData, setChartData] = useState(null);
  const [didAnalysisLoad, setAnalysisLoad] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (didAnalysisLoad) {
          props.close();
        }
        return true;
      }
    );
    return () => backHandler.remove();
  }, [didAnalysisLoad]);

  useEffect(() => {
    const animation = animateBlinking(opacityAnimation);
    animation.start();

    return () => animation.stop();
  }, [opacityAnimation]);

  useEffect(() => {
    if (props.tasks && props.taskAnalysisMode) {
      getTaskAnalysis(props.tasks, props.taskAnalysisMode).then(
        (analysisObject) => {
          if (analysisObject) {
            setChartData(analysisObject.categories);
            setAnalysisResult(analysisObject.result);
            setAnalysisLoad(true);
          } else if (analysisObject === null) {
            setErrorMessage(
              "Não foram encontradas tarefas pendentes com data prevista para o período selecionado!"
            );
            setAnalysisLoad(false);
          } else if (analysisObject === false) {
            setErrorMessage(
              "Não foi possível conectar com o servidor no momento! Por favor, verifique sua conexão e tente novamente mais tarde."
            );
            setAnalysisLoad(false);
          }
        }
      );
    }
  }, []);

  return (
    <View
      style={[
        styles.fullscreenArea,
        {
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        },
      ]}
    >
      <View style={[styles.taskPopup, { height: 550 }]}>
        <View
          style={{
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="timeline-help"
            size={20}
            color={styles.icon.color}
          />
          <Text style={[styles.header, { paddingLeft: 5 }]}>
            {props.taskAnalysisMode === "weekly"
              ? "Ajuda semanal"
              : props.taskAnalysisMode === "monthly" && "Ajuda mensal"}
          </Text>
        </View>
        {didAnalysisLoad === null ? (
          <View
            style={{
              width: "100%",
              height: "90%",
              marginTop: -30,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Animated.View style={{ opacity: opacityAnimation }}>
              <MaterialIcons
                name="insights"
                size={120}
                color={styles.icon.color}
              />
            </Animated.View>
            <Text style={styles.text}>Por favor, aguarde...</Text>
          </View>
        ) : (
          <View
            style={{
              width: "100%",
              height: "85%",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {didAnalysisLoad === true ? (
              <View
                style={{
                  width: "100%",
                  height: 390,
                  marginTop: 30,
                  borderRadius: 20,
                  backgroundColor: styles.taskInput.backgroundColor,
                  padding: 15,
                }}
              >
                <ScrollView style={{ minHeight: "100%" }}>
                  <Chart data={chartData} />
                  <Text style={[styles.text, { textAlign: "justify" }]}>
                    {analysisResult}
                  </Text>
                </ScrollView>
              </View>
            ) : (
              didAnalysisLoad === false && (
                <View
                  style={{
                    width: "100%",
                    height: 390,
                    marginTop: 30,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="robot-dead-outline"
                    size={120}
                    color={styles.icon.color}
                  />
                  <View style={{ width: "100%", marginTop: 10 }}>
                    <Text style={[styles.text, { textAlign: "justify" }]}>
                      {errorMessage}
                    </Text>
                  </View>
                </View>
              )
            )}
            <TouchableOpacity
              style={styles.confirmBigButton}
              onPress={() => props.close()}
            >
              <>
                <Feather name="check" size={24} color="white" />
                <Text style={[styles.text, { color: "white" }]}>OK</Text>
              </>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default TaskAnalysisPopup;
