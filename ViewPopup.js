import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
} from 'react-native';
import styles from './styles';

function ViewPoup(props) {
    const [text, onChangeText] = useState('');

    function checkTextAndSave() {
        if (text != '') {
            props.tasks[props.index] = text;
            props.setTasks(props.tasks);
            props.save();
            props.closeViewPopup();
        } else {
            alert('Please, insert any text!');
        }
    }

    return (
        <View style={[
            styles.fullscreenArea,
            {justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'}]}
            >
            <View style={styles.taskPopup}>
                <Text style={styles.text}>Task view</Text>
                <TextInput
                    style={styles.taskInput}
                    multiline={true}
                    textAlignVertical='top'
                    defaultValue={props.taskToChange}
                    onChangeText={onChangeText}
                    cursorColor={'#efdb00'}
                    placeholder='Insert here...'
                    placeholderTextColor={'#b5b5b5'}
                />
                <View style={styles.popupButtonRow}>
                    <TouchableHighlight
                        style={[styles.commonButton, {backgroundColor: '#470c0c'}]}
                        onPress={props.closeViewPopup}
                    >
                        <Text style={styles.text}>Close</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        style={[styles.commonButton, {backgroundColor: '#0d4f6b'}]}
                        onPress={() => {checkTextAndSave()}}
                    >
                        <Text style={styles.text}>Save</Text>
                    </TouchableHighlight>
                </View>
            </View>
        </View>
    );
}

export default ViewPoup;