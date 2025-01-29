import { Text, TouchableHighlight, View } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import styles from "../styles/styles";
import { useState } from "react";

function DatePickerPopup(props) {
  const [date, setDate] = useState(null);

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
      <View
        style={{
          borderRadius: 20,
          borderColor: "gray",
          backgroundColor: "#121212",
          padding: 20,
        }}
      >
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
          <TouchableHighlight
            style={[styles.commonButton, { backgroundColor: "#222" }]}
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
              <AntDesign name="back" size={20} color="#fff" />
              <Text style={styles.text}>Voltar</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={[styles.commonButton, { backgroundColor: "#0d4f6b" }]}
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
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.text}>Pronto</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}

export default DatePickerPopup;
