import {StyleSheet} from 'react-native';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minWidth: screenWidth,
        minHeight: screenHeight,
        backgroundColor: '#000',
    },
    fullscreenArea: {
        position: 'absolute',
        minWidth: screenWidth,
        minHeight: screenHeight,
        flexDirection: 'row',
        zIndex: 1,
    },
    menuLeft: {
        width: '60%',
        height: '100%',
        backgroundColor: '#000',
        borderRightWidth: 1,
        borderRightColor: '#555',
        padding: 30,
    },
    menuRight: {
        minWidth: '40%',
        minHeight: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    topBar: {
        width: screenWidth,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingLeft: 17,
    },
    tasksArea: {
        width: screenWidth - 50,
        height: screenHeight - 70,
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 20,
        backgroundColor: '#191919',
        padding: 20,
    },
    text: {
        color: '#fff',
    },
    listItem: {
        height: 70,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderColor: '#1f515e',
        paddingHorizontal: 10,
    },
    listRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        backgroundColor: '#590d08',
        borderRadius: 20,
    },
    addTask: {
        width: 150,
        height: 60,
        flexDirection: 'row',
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: '#0f776d',
        paddingLeft: 7,
    },
    taskPopup: {
        width: 400,
        height: 555,
        alignItems: 'center',
        borderRadius: 25,
        backgroundColor: '#22353a',
        padding: 25,
    },
    taskInput: {
        width: '100%',
        height: 410,
        marginVertical: 20,
        backgroundColor: '#191919',
        borderRadius: 15,
        padding: 10,
        color: '#fff',
    },
    popupButtonRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    commonButton: {
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#4c4c4c',
        backgroundColor: '#1e1e1e',
    },
});

export default styles;