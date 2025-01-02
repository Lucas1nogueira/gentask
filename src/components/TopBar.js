import { Text, View } from "react-native";
import { Entypo } from "@expo/vector-icons";
import styles from "../styles/styles";

function TopBar(props) {
  return (
    <View style={styles.topBar}>
      <Entypo.Button
        name="menu"
        backgroundColor="#000"
        size={24}
        color="white"
        onPress={props.openMenu}
      />
      <Text style={styles.header}>MyTasks</Text>
    </View>
  );
}

export default TopBar;
