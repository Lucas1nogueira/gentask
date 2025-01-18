import { useEffect } from "react";
import { BackHandler, FlatList, Text, View } from "react-native";
import categories from "../data/categories";
import styles from "../styles/styles";
import SelectOption from "./SelectOption";

function SelectPopup(props) {
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
      <View style={styles.selectPopup}>
        <Text style={styles.text}>Selecione uma categoria</Text>
        <FlatList
          style={styles.categoriesList}
          data={[{ name: "Tudo", color: "white" }, ...categories]}
          renderItem={({ item }) => (
            <SelectOption
              categoryName={item.name}
              categoryColor={item.color}
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

export default SelectPopup;
