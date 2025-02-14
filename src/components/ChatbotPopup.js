import { useCallback, useContext, useEffect, useState } from "react";
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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ThemeContext } from "../contexts/ThemeContext";
import ChatRoundedArrow from "./ChatRoundedArrow";

function ChatbotPopup(props) {
  const { styles } = useContext(ThemeContext);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState(null);

  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const startNewChat = useCallback(() => {
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
            dueDate: task.dueDate
              ? new Date(task.dueDate).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "N/A",
          }))
      : [];

    const taskContext =
      tasks.length > 0
        ? `These are the user's personal tasks: ${JSON.stringify(
            tasks
          )}. Use them to answer the next questions.`
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
              text: "Got the user`s tasks. I will answer in brazilian portuguese with that context.",
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
  });

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

  async function sendMessage() {
    if (inputText.trim().toLocaleLowerCase() === "sair") {
      props.close();
    }

    if (!inputText.trim() || !chat) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const result = await chat.sendMessage(inputText);
      const response = await result.response;

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text(),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error processing message:", error);

      let errorMessage = "Desculpe, ocorreu um erro ao processar sua mensagem.";

      if (error.message.includes("context length exceeded")) {
        errorMessage =
          "O histórico da conversa excedeu o limite. Iniciando nova conversa...";
        startNewChat();
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: (Date.now() + 1).toString(),
          text: errorMessage,
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }

    setIsLoading(false);
  }

  return (
    <View
      style={[
        styles.fullscreenArea,
        {
          position: "relative",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        },
      ]}
      onPress={() => props.close()}
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
              data={messages}
              keyExtractor={(item) => item.id}
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
              onPress={sendMessage}
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
