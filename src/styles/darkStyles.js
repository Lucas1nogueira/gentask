import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: screenWidth,
    minHeight: screenHeight,
    backgroundColor: "#000",
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  authContainer: {
    width: 350,
    maxHeight: "auto",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#555",
    backgroundColor: "#222",
    padding: 25,
  },
  authAppTitle: {
    marginTop: 7,
    fontFamily: "ReadexPro-Bold",
    fontSize: 40,
    color: "#fff",
  },
  authAppTitleGradient: {
    colors: ["#00A3FF", "#4ED453"],
  },
  authInput: {
    width: "100%",
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#555",
    color: "white",
    backgroundColor: "#111",
    paddingHorizontal: 10,
  },
  authInputPlaceholder: {
    color: "#CCC",
  },
  authConfirmButton: {
    width: "100%",
    height: 50,
    marginTop: 30,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#333",
    backgroundColor: "#34A853",
    paddingHorizontal: 10,
  },
  authConfirmButtonLoading: {
    backgroundColor: "#444",
  },
  authTipText: {
    fontFamily: "ReadexPro-Regular",
    color: "#fff",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  fullscreenArea: {
    position: "absolute",
    minWidth: screenWidth,
    minHeight: screenHeight,
    flexDirection: "row",
    zIndex: 1,
  },
  menuLeft: {
    width: "60%",
    height: "100%",
    backgroundColor: "#000",
    borderRightWidth: 1,
    borderRightColor: "#555",
    padding: 30,
  },
  menuRight: {
    minWidth: "40%",
    minHeight: "100%",
  },
  menuOptions: {
    width: "100%",
    height: "90%",
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
  menuOption: {
    width: "100%",
    height: 50,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#777",
    paddingHorizontal: 10,
  },
  filteringBar: {
    minWidth: "100%",
    width: "100%",
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 22,
  },
  categorySelectionButton: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: "#222",
    paddingHorizontal: 10,
  },
  topBar: {
    minWidth: "100%",
    width: "100%",
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  searchbar: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#191919",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  taskContainer: {
    width: "92%",
    height: screenHeight - 143,
    marginTop: 10,
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: 20,
    backgroundColor: "#191919",
    padding: 15,
  },
  text: {
    fontFamily: "ReadexPro-Regular",
    color: "#fff",
  },
  header: {
    fontFamily: "ReadexPro-Bold",
    color: "#fff",
  },
  activityIndicator: {
    color: "#AAA",
  },
  category: {
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#333",
    paddingHorizontal: 7,
  },
  categoryText: {
    fontFamily: "ReadexPro-Regular",
    fontSize: 12,
    color: "#fff",
  },
  taskControl: {
    marginVertical: 10,
    width: "100%",
    height: 140,
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 15,
    overflow: "hidden",
  },
  taskLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingTaskLabel: {
    marginRight: 5,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "#78c1e2",
    paddingHorizontal: 2,
  },
  completedTaskLabel: {
    marginRight: 5,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "#50ff3d",
    paddingHorizontal: 2,
  },
  urgentTaskLabel: {
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "#ff503d",
    paddingHorizontal: 2,
  },
  pendingTaskLabelText: {
    fontFamily: "ReadexPro-SemiBold",
    fontSize: 9,
    color: "#78c1e2",
  },
  completedTaskLabelText: {
    fontFamily: "ReadexPro-SemiBold",
    fontSize: 9,
    color: "#50ff3d",
  },
  urgentTaskLabelText: {
    fontFamily: "ReadexPro-SemiBold",
    fontSize: 9,
    color: "#ff503d",
  },
  dueDateTaskLabelText: {
    fontFamily: "ReadexPro-SemiBold",
    fontSize: 12,
    color: "#fff",
    paddingLeft: 3,
  },
  task: {
    height: "100%",
    justifyContent: "center",
    backgroundColor: "#111",
    padding: 10,
  },
  deleteTaskButton: {
    width: 70,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    backgroundColor: "#EA4335",
  },
  markTaskAsCompletedButton: {
    width: 70,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    backgroundColor: "#34A853",
  },
  markTaskAsPendingButton: {
    width: 70,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    backgroundColor: "#59b2db",
  },
  taskAnalysisButton: {
    width: 55,
    height: 55,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    overflow: "hidden",
  },
  taskAnalysisFloatingMenu: {
    position: "absolute",
    top: -145,
    left: -75,
  },
  taskAnalysisFloatingMenuBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#222",
    overflow: "hidden",
    elevation: 5,
  },
  taskAnalysisFloatingMenuBottomTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 10,
    borderTopColor: "#333",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    alignSelf: "center",
  },
  taskAnalysisMenuOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  addTaskButton: {
    width: 155,
    height: 55,
    marginLeft: 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "#0f776d",
    paddingLeft: 7,
  },
  taskPopup: {
    width: 370,
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: "#222",
    padding: 25,
  },
  taskInput: {
    width: "100%",
    height: 300,
    marginTop: 20,
    backgroundColor: "#191919",
    borderRadius: 15,
    padding: 10,
    color: "#fff",
  },
  taskInsight: {
    width: "100%",
    marginTop: 10,
    borderRadius: 15,
  },
  popupButtonRow: {
    width: "100%",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commonButton: {
    width: 100,
    height: 45,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#333",
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: "#470c0c",
  },
  confirmButton: {
    backgroundColor: "#0d4f6b",
  },
  confirmBigButton: {
    width: "100%",
    height: 45,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#333",
    backgroundColor: "#0d4f6b",
    paddingHorizontal: 10,
  },
  messagePopup: {
    width: 370,
    height: 200,
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderRadius: 25,
    backgroundColor: "#222",
    padding: 25,
  },
  minimalPopup: {
    position: "absolute",
    top: 70,
    right: 40,
    width: "auto",
    height: 50,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 20,
    backgroundColor: "#333",
    paddingHorizontal: 10,
    zIndex: 1,
  },
  minimalPopupSuccess: {
    backgroundColor: "#448c25",
  },
  settingsPopup: {
    width: 370,
    height: 220,
    justifyContent: "space-between",
    borderRadius: 25,
    backgroundColor: "#222",
    padding: 25,
  },
  settingsButton: {
    width: 150,
    height: 50,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 10,
  },
  pickerPopup: {
    width: 400,
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: "#222",
    padding: 25,
  },
  pickerOptionsList: {
    width: "100%",
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: "#111",
    overflow: "hidden",
  },
  pickerOption: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#050505",
    paddingHorizontal: 15,
  },
  expandableSelection: {
    width: "100%",
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: "#191919",
    padding: 10,
  },
  toggleSwitchContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    padding: 2,
  },
  toggleSwitchBall: {
    width: 23,
    height: 23,
    borderRadius: 13,
    backgroundColor: "white",
  },
  dateContainer: {
    borderRadius: 20,
    borderColor: "gray",
    backgroundColor: "#121212",
    padding: 20,
  },
  datePicker: {
    backgroundColor: "#121212",
    calendarBackground: "#121212",
    textSectionTitleColor: "#b6c1cd",
    selectedDayBackgroundColor: "#00adf5",
    selectedDayTextColor: "#fff",
    todayTextColor: "#00adf5",
    dayTextColor: "#fff",
    textDisabledColor: "#666666",
    monthTextColor: "#fff",
  },
  taskControlScroll: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    overflow: "hidden",
  },
  urgentTask: {
    backgroundColor: "#4c0800",
  },
  urgentTaskCategoryLabel: {
    backgroundColor: "#300500",
  },
  selectedPickerOption: {
    backgroundColor: "#274c4b",
  },
  taskAnalysisButtonGradient: {
    colors: ["#2a7eaa", "#2aaa6c"],
  },
  switch: {
    backgroundColor: "#333",
  },
  icon: {
    color: "white",
  },
  statusBar: {
    style: "light",
    backgroundColor: "#000",
  },
  navigationBar: {
    color: "#000",
    buttonStyle: "light",
  },
});

export default darkStyles;
