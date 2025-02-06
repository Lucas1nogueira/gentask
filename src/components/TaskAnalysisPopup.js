import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  ScrollView,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons/";
import { getTaskAnalysis } from "../services/geminiService";
import { animateBlinking } from "../utils/animationUtils";
import styles from "../styles/styles";

function TaskAnalysisPopup(props) {
  const opacityAnimation = useRef(new Animated.Value(1)).current;

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
      getTaskAnalysis(props.tasks, props.taskAnalysisMode).then((result) => {
        if (result) {
          setAnalysisResult(result);
          setAnalysisLoad(true);
        } else if (result === null) {
          setErrorMessage(
            "Não foram encontradas mensagens com data prevista para o período selecionado!"
          );
          setAnalysisLoad(false);
        } else if (result === false) {
          setErrorMessage(
            "Não foi possível conectar com o servidor! Por favor, verifique sua conexão e tente novamente mais tarde."
          );
          setAnalysisLoad(false);
        }
      });
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
      <View style={[styles.taskPopup, { height: 500 }]}>
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
            color="white"
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
              <MaterialIcons name="insights" size={120} color="white" />
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
              <ScrollView style={{ marginTop: 20, minHeight: "90%" }}>
                <Text style={[styles.text, { textAlign: "justify" }]}>
                  {analysisResult}
                </Text>
              </ScrollView>
            ) : (
              didAnalysisLoad === false && (
                <View
                  style={{
                    width: "100%",
                    height: "94%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="robot-dead-outline"
                    size={120}
                    color="white"
                  />
                  <View style={{ width: "100%", marginTop: 10 }}>
                    <Text style={[styles.text, { textAlign: "justify" }]}>
                      {errorMessage}
                    </Text>
                  </View>
                </View>
              )
            )}
            <TouchableHighlight
              style={styles.confirmBigButton}
              onPress={() => props.close()}
            >
              <>
                <Feather name="check" size={24} color="white" />
                <Text style={styles.text}>OK</Text>
              </>
            </TouchableHighlight>
          </View>
        )}
      </View>
    </View>
  );
}

export default TaskAnalysisPopup;
