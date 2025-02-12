import { useContext, useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import Svg, { G, Circle } from "react-native-svg";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Chart(props) {
  const { styles } = useContext(ThemeContext);

  const [didChartDataLoad, setChartDataLoad] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsInfo, setItemsInfo] = useState([]);
  const [chartAngle, setChartAngle] = useState(0);

  const radius = 50;
  const circleCircumference = 2 * Math.PI * radius;

  useEffect(() => {
    const data = Object.values(props.data);

    let total = data.reduce((acc, item) => acc + item.count, 0);
    let summedAngle = 0;
    let info = [];

    data.forEach((item) => {
      summedAngle += (item.count / total) * 360;
      info.push({
        percentage: (item.count / total) * 100,
        strokeDashoffset:
          circleCircumference -
          (circleCircumference * ((item.count / total) * 100)) / 100,
        angle: summedAngle,
        color: item.color,
      });
    });

    setTotalCount(total);
    setItemsInfo(info);
    setChartAngle(summedAngle);
    setChartDataLoad(true);
  }, []);

  return (
    <View
      style={{
        width: "100%",
        marginBottom: 5,
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {didChartDataLoad ? (
        <View
          style={{
            width: "100%",
            marginTop: -10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Svg height="180" width="180" viewBox="0 0 180 180">
            <G rotation={-90} originX={90} originY={90}>
              <>
                {itemsInfo.map((item, index) => (
                  <Circle
                    key={index}
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke={item.color}
                    fill="transparent"
                    strokeWidth="40"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={item.strokeDashoffset}
                    rotation={index == 0 ? 0 : itemsInfo[index - 1].angle}
                    originX="90"
                    originY="90"
                    strokeLinecap="butt"
                  />
                ))}
              </>
            </G>
          </Svg>
          <View
            style={{
              position: "absolute",
            }}
          >
            <MaterialIcons
              name="pending-actions"
              size={40}
              color={styles.icon.color}
            />
          </View>
        </View>
      ) : (
        <View
          style={{
            width: "100%",
            height: 170,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="small" color={styles.icon.color} />
          <Text style={[styles.text, { paddingLeft: 5 }]}>
            Carregando gráfico...
          </Text>
        </View>
      )}
      <View style={{ width: "100%", alignItems: "center" }}>
        <Text style={[styles.header, { marginBottom: 5 }]}>Legenda:</Text>
        <View
          style={{
            width: "100%",
            marginBottom: 5,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {Object.values(props.data).map((item, index) => (
            <View key={item.name} style={styles.chartCaptionLabel}>
              <View
                style={[
                  {
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: item.color,
                  },
                ]}
              />
              <Text style={[styles.text, { paddingLeft: 5 }]}>
                {item.name}: {item.count}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
