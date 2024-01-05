import { useState } from 'react';
import { FlatList, Pressable, Text, TouchableHighlight, View } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import styles from './styles';

function TasksArea(props) {
    const [isAddTaskPressed, setAddTaskPressed] = useState(false);

    return (
        <View style={styles.tasksArea}>
            <FlatList
                style={{maxHeight: 805}}
                data={props.tasks}
                renderItem={({item, index}) =>
                    <TouchableHighlight
                        key={item.key}
                        style={styles.listItem}
                        onPress={() => props.viewPopup(index)}
                    >
                        <View style={styles.listRow}>
                            <Text
                                style={[
                                    styles.text,
                                    {maxWidth: '80%'}
                                ]}
                                numberOfLines={3}
                            >
                                {item}
                            </Text>
                            <TouchableHighlight
                                style={styles.deleteButton}
                                onPress={() => props.delete(index)}
                            >
                                <AntDesign
                                    name="delete"
                                    size={24}
                                    color="white"
                                />
                            </TouchableHighlight>
                        </View>
                    </TouchableHighlight>
                }
            />
            <Pressable
                style={[
                    styles.addTask,
                    isAddTaskPressed
                    ? {opacity: 0.5}
                    : {opacity: 1}
                ]}
                onPress={props.openCreatePopup}
                onPressIn={() => setAddTaskPressed(true)}
                onPressOut={() => setAddTaskPressed(false)}
            >
                <Text style={styles.text}>New task</Text>
                <Ionicons name="add" size={40} color="white" />
            </Pressable>
        </View>
    );
}

export default TasksArea;