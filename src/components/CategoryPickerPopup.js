import { useContext, useEffect } from "react";
import { BackHandler, FlatList, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import categories from "../data/categories";
import { ThemeContext } from "../contexts/ThemeContext";
import PickerOption from "./PickerOption";

function CategoryPickerPopup(props) {
  const { styles } = useContext(ThemeContext);

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
          backgroundColor: "rgba(0,0,0,0.3)",
        },
      ]}
    >
      <View style={[styles.pickerPopup, { height: 570 }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="category" size={18} color={styles.icon.color} />
          <Text style={[styles.header, { paddingLeft: 3 }]}>
            Selecione uma categoria
          </Text>
        </View>
        <FlatList
          style={styles.pickerOptionsList}
          data={[props.defaultOption, ...categories]}
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
