import { useEffect } from "react";
import { BackHandler, FlatList, Text, View } from "react-native";
import categories from "../data/categories";
import styles from "../styles/styles";
import PickerOption from "./PickerOption";

function CategoryPickerPopup(props) {
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
      <View style={[styles.pickerPopup, { height: 570 }]}>
        <Text style={styles.text}>Selecione uma categoria</Text>
        <FlatList
          style={styles.pickerOptionsList}
          data={[{ name: "Tudo", color: "white" }, ...categories]}
          renderItem={({ item }) => (
            <PickerOption
              title={item.name}
              iconColor={item.color}
              action={() => {
                props.setSelectedCategory(item);
                props.close();
              }}
            />
          )}
        />
      </View>
    </View>
  );
}

export default CategoryPickerPopup;
