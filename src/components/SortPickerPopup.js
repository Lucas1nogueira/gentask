import { useEffect, useState } from "react";
import { BackHandler, Text, TouchableHighlight, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import styles from "../styles/styles";
import PickerOption from "./PickerOption";

function SortPickerPopup(props) {
  const [selectedSort, setSelectedSort] = useState(null);
  const [pendingTasksFirst, setPendingTasksFirst] = useState(null);
  const [completedTasksFirst, setCompletedTasksFirst] = useState(null);
  const [urgentTasksFirst, setUrgentTasksFirst] = useState(null);

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

  useEffect(() => {
    setSelectedSort(props.selectedSort);
    setPendingTasksFirst(props.pendingTasksFirst);
    setCompletedTasksFirst(props.completedTasksFirst);
    setUrgentTasksFirst(props.urgentTasksFirst);
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
      <View style={styles.pickerPopup}>
        <Text style={styles.text}>Ordenar por</Text>
        <View style={styles.pickerOptionsList}>
          <PickerOption
            title="Data de criação (recentes)"
            iconName="sort-calendar-descending"
            action={() => setSelectedSort("created_desc")}
            selected={selectedSort === "created_desc"}
          />
          <PickerOption
            title="Data de criação (antigas)"
            iconName="sort-calendar-ascending"
            action={() => setSelectedSort("created_asc")}
            selected={selectedSort === "created_asc"}
          />
          <PickerOption
            title="Data de atualização (recentes)"
            iconName="sort-calendar-descending"
            action={() => setSelectedSort("updated_desc")}
            selected={selectedSort === "updated_desc"}
          />
          <PickerOption
            title="Data de atualização (antigas)"
            iconName="sort-calendar-ascending"
            action={() => setSelectedSort("updated_asc")}
            selected={selectedSort === "updated_asc"}
          />
        </View>
        <Text style={[styles.text, { marginTop: 20 }]}>
          Prioridade de urgência
        </Text>
        <View style={styles.pickerOptionsList}>
          <PickerOption
            title="Padrão"
            iconName="format-list-bulleted"
            action={() => setUrgentTasksFirst(false)}
            selected={urgentTasksFirst === false}
          />
          <PickerOption
            title="Urgentes primeiro"
            iconName="alert"
            action={() => setUrgentTasksFirst(true)}
            selected={urgentTasksFirst === true}
          />
        </View>
        <Text style={[styles.text, { marginTop: 20 }]}>
          Prioridade de conclusão
        </Text>
        <View style={styles.pickerOptionsList}>
          <PickerOption
            title="Padrão"
            iconName="format-list-bulleted"
            action={() => {
              setPendingTasksFirst(false);
              setCompletedTasksFirst(false);
            }}
            selected={
              pendingTasksFirst === false && completedTasksFirst === false
            }
          />
          <PickerOption
            title="Pendentes primeiro"
            iconName="checkbox-blank-badge-outline"
            action={() => {
              setPendingTasksFirst(true);
              setCompletedTasksFirst(false);
            }}
            selected={pendingTasksFirst === true}
          />
          <PickerOption
            title="Concluídas primeiro"
            iconName="checkbox-marked-outline"
            action={() => {
              setPendingTasksFirst(false);
              setCompletedTasksFirst(true);
            }}
            selected={completedTasksFirst === true}
          />
        </View>
        <TouchableHighlight
          style={[
            styles.commonButton,
            {
              width: 80,
              marginTop: 20,
              alignSelf: "flex-end",
              backgroundColor: "#0d4f6b",
            },
          ]}
          onPress={() => {
            if (selectedSort !== null) {
              props.setSelectedSort(selectedSort);
            }
            if (pendingTasksFirst !== null) {
              props.setPendingTasksFirst(pendingTasksFirst);
            }
            if (completedTasksFirst !== null) {
              props.setCompletedTasksFirst(completedTasksFirst);
            }
            if (urgentTasksFirst !== null) {
              props.setUrgentTasksFirst(urgentTasksFirst);
            }
            props.close();
          }}
        >
          <>
            <AntDesign name="check" size={24} color="white" />
            <Text style={styles.text}>OK</Text>
          </>
        </TouchableHighlight>
      </View>
    </View>
  );
}

export default SortPickerPopup;
