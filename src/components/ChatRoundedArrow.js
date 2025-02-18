import { Svg, Path } from "react-native-svg";

function ChatRoundedArrow(props) {
  const pathData =
    props.direction === "left"
      ? "M20 0 L6 0 C0 0 -2 4 3 7.5 C8 11 14 13 20 20 L20 0"
      : "M0 0 L14 0 C20 0 22 4 17 7.5 C12 11 6 13 0 20 L0 0";

  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path d={pathData} fill={props.color} />
    </Svg>
  );
}

export default ChatRoundedArrow;
