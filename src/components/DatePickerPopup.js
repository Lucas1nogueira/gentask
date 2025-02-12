import { useContext, useEffect, useState } from "react";
import { BackHandler, Text, TouchableOpacity, View } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { ThemeContext } from "../contexts/ThemeContext";

LocaleConfig.locales["pt"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan.",
    "Fev.",
    "Mar.",
    "Abr.",
    "Mai.",
    "Jun.",
    "Jul.",
    "Ago.",
    "Set.",
    "Out.",
    "Nov.",
    "Dez.",
  ],
  dayNames: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ],
  dayNamesShort: ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."],
  today: "Hoje",
};

LocaleConfig.defaultLocale = "pt";

function DatePickerPopup(props) {
  const { styles } = useContext(ThemeContext);

  const [date, setDate] = useState(null);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        props.close();
        return true;
      }
    );
    return () => backHandler.remove();
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
      <View style={styles.dateContainer}>
        <Calendar
          theme={styles.datePicker}
          markedDates={{
            [date?.dateString]: {
              selected: true,
              disabledTouchEvent: true,
              selectedDotColor: "orange",
            },
          }}
          onDayPress={(day) => {
            setDate(day);
          }}
        />
        <View style={styles.popupButtonRow}>
          <TouchableOpacity
            style={styles.commonButton}
            onPress={() => props.close()}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <AntDesign name="arrowleft" size={20} color={styles.icon.color} />
              <Text style={styles.text}>Voltar</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.commonButton, styles.confirmButton]}
            onPress={() => {
              if (date) {
                props.setSelectedDate(date.timestamp + 86400000);
                props.close();
              } else {
                const currentDate = Date.now();
                props.setSelectedDate(currentDate);
                props.close();
              }
            }}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <Ionicons name="checkmark" size={20} color={styles.icon.color} />
              <Text style={styles.text}>Pronto</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default DatePickerPopup;
