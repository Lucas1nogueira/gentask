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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../contexts/ThemeContext";
import { query } from "../services/aiService";
import ChatRoundedArrow from "./ChatRoundedArrow";

function ChatbotPopup(props) {
  const { styles } = useContext(ThemeContext);

  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");

  const startNewChat = useCallback(() => {
    const tasks = props.data
      ? Object.values(props.data)
          .filter((task) => !task.isCompleted)
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

    const newSystemPrompt =
      tasks.length > 0
        ? `You are a helpful assistant. The user's current tasks are: ${JSON.stringify(
            tasks
          )}. 
         Answer what he asks you in brazilian portuguese (limit to 50 words).`
        : "You are a helpful assistant. Answer in brazilian portuguese (limit to 50 words).";

    setSystemPrompt(newSystemPrompt);
    setMessages([
      {
        id: Date.now().toString(),
        text: "Olá! Como posso te ajudar hoje?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, [props.data]);

  async function handleSend() {
    if (!inputText.trim() || isLoading) return;

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
      const botResponse = await query(systemPrompt, inputText, 200, 0.7);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: botResponse,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: error.message.includes("exceed")
            ? "Limite de contexto excedido. Nova conversa iniciada."
            : "Erro ao processar resposta.",
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
              ref={scrollRef}
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
