import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import { apiKey, modelName } from "../services/aiService";
import ChatRoundedArrow from "./ChatRoundedArrow";

function ChatbotPopup(props) {
  const { styles } = useContext(ThemeContext);

  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState(null);

  const startNewChat = useCallback(() => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const initialMessage = {
      id: (Date.now() + 1).toString(),
      text: "Olá! Como posso te ajudar hoje?",
      sender: "bot",
      timestamp: new Date(),
    };

    const tasks = props.data
      ? Object.values(props.data)
          .filter((task) => task.isCompleted === false)
          .map((task) => ({
            text: task.text,
            dueDate: task.dueDate,
          }))
      : [];

    const taskContext =
      tasks.length > 0
        ? `Essas são as tarefas do usuário: ${JSON.stringify(
            tasks
          )}. Use-as para responder, sempre com POUCAS palavras. Ignore termos temporais.`
        : "";

    const initialHistory = [];

    if (taskContext) {
      initialHistory.push(
        {
          role: "user",
          parts: [{ text: taskContext }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Recebi as tarefas.",
            },
          ],
        }
      );
    }

    const newChat = model.startChat({
      history: initialHistory,
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7,
      },
    });

    setChat(newChat);
    setMessages([initialMessage]);
  }, [props.data]);

  async function handleSend() {
    if (!chat) return;

    if (!inputText.trim() || isLoading) return;

    if (inputText.trim().toLocaleLowerCase() === "sair") {
      props.close();
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const res = await chat.sendMessage(inputText);
      const text = await res.response.text();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: text.trim(),
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Erro ao processar resposta. Por favor, tente novamente mais tarde.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }

    setIsLoading(false);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 500);
  }

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
    startNewChat();
  }, []);

  return (
    <View
      style={[
        styles.fullscreenArea,
        {
          position: "relative",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
        },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : "position"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={styles.taskPopup}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="message" size={20} color={styles.icon.color} />
            <Text style={[styles.header, { paddingLeft: 3 }]}>Chatbot</Text>
          </View>
          <View style={[styles.taskInput, { height: 450 }]}>
            <FlatList
              ref={scrollRef}
              data={messages}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.chatMessageContainer,
                    item.sender === "user" && styles.chatUserMessage,
                    item.isError && styles.chatErrorMessage,
                  ]}
                >
                  {item.sender === "bot" && (
                    <View style={styles.chatLeftArrow}>
                      <ChatRoundedArrow
                        direction="left"
                        color={
                          !item.isError
                            ? styles.chatMessageContainer.backgroundColor
                            : styles.chatErrorMessage.backgroundColor
                        }
                      />
                    </View>
                  )}
                  {item.sender === "user" && (
                    <View style={styles.chatRightArrow}>
                      <ChatRoundedArrow
                        direction="right"
                        color={
                          !item.isError
                            ? styles.chatUserMessage.backgroundColor
                            : styles.chatErrorMessage.backgroundColor
                        }
                      />
                    </View>
                  )}
                  <Text
                    style={[styles.text, item.isError && { color: "white" }]}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={[
                      styles.text,
                      { fontSize: 10 },
                      item.sender === "user" && { alignSelf: "flex-end" },
                      item.isError && { color: "white" },
                    ]}
                  >
                    {item.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              )}
            />
          </View>
          <View style={styles.chatInputContainer}>
            <TextInput
              style={[
                styles.text,
                {
                  width: 275,
                  height: "100%",
                  paddingHorizontal: 10,
                },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#666"
            />
            <TouchableOpacity
              style={[
                styles.chatInputSendButton,
                isLoading && styles.authConfirmButtonLoading,
              ]}
              disabled={isLoading}
              onPress={handleSend}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default ChatbotPopup;
