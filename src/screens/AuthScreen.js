import { useContext, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Entypo, MaterialIcons } from "@expo/vector-icons/";
import MessagePopup from "../components/MessagePopup";
import MinimalPopup from "../components/MinimalPopup";
import { ThemeContext } from "../contexts/ThemeContext";
import { signIn, signUp } from "../services/firebase/auth";
import {
  animateClosing,
  animateOpening,
  animateSlideIn,
  animateSlideOut,
} from "../utils/animationUtils";
import { AuthConfirmMessagesContext } from "../contexts/AuthConfirmMessagesContext";

function AuthScreen() {
  const { styles } = useContext(ThemeContext);
  const {
    authConfirmMessage,
    setAuthConfirmMessage,
    authConfirmPopups,
    setAuthConfirmPopups,
    authConfirmPopupAnimations,
  } = useContext(AuthConfirmMessagesContext);

  const [authMode, setAuthMode] = useState("signIn");
  const [email, onChangeEmail] = useState("");
  const [password, onChangePassword] = useState("");
  const [confirmPassword, onChangeConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  const [popups, setPopups] = useState({
    error: false,
    warning: false,
  });

  const [popupAnimations] = useState({
    error: new Animated.Value(0),
    warning: new Animated.Value(0),
    warningRight: new Animated.Value(0),
  });

  return (
    <View style={styles.container}>
      {authConfirmPopups.logout && (
        <MinimalPopup
          opacityAnimation={authConfirmPopupAnimations.logout}
          rightAnimation={authConfirmPopupAnimations.logoutRight}
          color={styles.minimalPopupSuccess.backgroundColor}
          close={() => {
            animateClosing(authConfirmPopupAnimations["logout"], () => {
              setAuthConfirmPopups((prevState) => ({
                ...prevState,
                logout: false,
              }));
            });
            animateSlideOut(authConfirmPopupAnimations["logoutRight"]);
          }}
          message={authConfirmMessage}
        />
      )}
      {popups.error && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.error }]}
        >
          <MessagePopup
            close={() => {
              animateClosing(popupAnimations["error"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  error: false,
                }))
              );
            }}
            title={"Erro"}
            description={errorMessage}
            actionName={"OK"}
            error={true}
          />
        </Animated.View>
      )}
      {popups.warning && (
        <MinimalPopup
          opacityAnimation={popupAnimations.warning}
          rightAnimation={popupAnimations.warningRight}
          color="#bc0000"
          close={() => {
            animateClosing(popupAnimations["warning"], () =>
              setPopups((prevState) => ({
                ...prevState,
                warning: false,
              }))
            );
            animateSlideOut(popupAnimations["warningRight"]);
          }}
          message={warningMessage}
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View
          style={[
            styles.authContainer,
            authMode === "signUp" && { minHeight: 640 },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/adaptive-icon.png")}
              style={{
                width: 130,
                height: 130,
                marginRight: -25,
                marginLeft: -35,
              }}
            />
            <MaskedView
              style={{ flexDirection: "row" }}
              maskElement={<Text style={styles.authAppTitle}>MyTasks</Text>}
            >
              <LinearGradient
                colors={styles.authAppTitleGradient.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ height: 70, width: 170 }}
              />
            </MaskedView>
          </View>
          <Text style={[styles.header, { marginBottom: 30 }]}>
            Seja bem-vindo!
          </Text>
          <View
            style={{
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {authMode === "signIn" ? (
              <>
                <View
                  style={{
                    marginBottom: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "flex-start",
                  }}
                >
                  <MaterialIcons
                    name="email"
                    size={18}
                    color={styles.icon.color}
                  />
                  <Text style={[styles.text, { paddingLeft: 5 }]}>E-mail</Text>
                </View>
                <TextInput
                  style={styles.authInput}
                  value={email}
                  onChangeText={(input) => onChangeEmail(input)}
                  keyboardType="email-address"
                  placeholder="Digite aqui..."
                  placeholderTextColor={styles.authInputPlaceholder.color}
                />
                <View
                  style={{
                    marginBottom: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "flex-start",
                  }}
                >
                  <MaterialIcons
                    name="password"
                    size={18}
                    color={styles.icon.color}
                  />
                  <Text style={[styles.text, { paddingLeft: 5 }]}>Senha</Text>
                </View>
                <TextInput
                  style={styles.authInput}
                  value={password}
                  onChangeText={(input) => onChangePassword(input)}
                  secureTextEntry
                  placeholder="Digite aqui..."
                  placeholderTextColor={styles.authInputPlaceholder.color}
                />
                <TouchableOpacity
                  style={styles.authConfirmButton}
                  onPress={() => {
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      setWarningMessage("Por favor, digite um e-mail válido!");
                    } else if (password.length === 0) {
                      setWarningMessage("Por favor, insira a senha!");
                    } else {
                      signIn(email, password)
                        .then(() => {
                          setAuthConfirmMessage("Logado com sucesso!");
                          setAuthConfirmPopups((prevState) => ({
                            ...prevState,
                            signIn: true,
                          }));
                          animateOpening(authConfirmPopupAnimations["signIn"]);
                          animateSlideIn(
                            authConfirmPopupAnimations["signInRight"]
                          );
                        })
                        .catch((error) => {
                          setErrorMessage(
                            `Não foi possível fazer login!\n${error.message}`
                          );
                          setPopups((prevState) => ({
                            ...prevState,
                            error: true,
                          }));
                          animateOpening(popupAnimations["error"]);
                        });
                      return;
                    }
                    setPopups((prevState) => ({
                      ...prevState,
                      warning: true,
                    }));
                    animateOpening(popupAnimations["warning"]);
                    animateSlideIn(popupAnimations["warningRight"]);
                  }}
                >
                  <Entypo name="login" size={24} color="white" />
                  <Text
                    style={[styles.text, { color: "white", paddingLeft: 7 }]}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text
                    style={styles.authTipText}
                    onPress={() => {
                      if (authMode === "signIn") {
                        setAuthMode("signUp");
                      } else if (authMode === "signUp") {
                        setAuthMode("signIn");
                      }
                    }}
                  >
                    Não possui uma conta? Cadastre-se.
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View
                  style={{
                    marginBottom: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "flex-start",
                  }}
                >
                  <MaterialIcons
                    name="email"
                    size={18}
                    color={styles.icon.color}
                  />
                  <Text style={[styles.text, { paddingLeft: 5 }]}>E-mail</Text>
                </View>
                <TextInput
                  style={styles.authInput}
                  value={email}
                  onChangeText={(input) => onChangeEmail(input)}
                  keyboardType="email-address"
                  placeholder="Digite aqui..."
                  placeholderTextColor={styles.authInputPlaceholder.color}
                />
                <View
                  style={{
                    marginBottom: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "flex-start",
                  }}
                >
                  <MaterialIcons
                    name="password"
                    size={18}
                    color={styles.icon.color}
                  />
                  <Text style={[styles.text, { paddingLeft: 5 }]}>Senha</Text>
                </View>
                <TextInput
                  style={styles.authInput}
                  value={password}
                  onChangeText={(input) => onChangePassword(input)}
                  secureTextEntry
                  placeholder="Digite aqui..."
                  placeholderTextColor={styles.authInputPlaceholder.color}
                />
                <View
                  style={{
                    marginBottom: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "flex-start",
                  }}
                >
                  <MaterialIcons
                    name="password"
                    size={18}
                    color={styles.icon.color}
                  />
                  <Text style={[styles.text, { paddingLeft: 5 }]}>
                    Confirmar senha
                  </Text>
                </View>
                <TextInput
                  style={styles.authInput}
                  value={confirmPassword}
                  onChangeText={(input) => onChangeConfirmPassword(input)}
                  secureTextEntry
                  placeholder="Digite aqui..."
                  placeholderTextColor={styles.authInputPlaceholder.color}
                />
                <TouchableOpacity
                  style={styles.authConfirmButton}
                  onPress={() => {
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      setWarningMessage("Por favor, digite um e-mail válido!");
                    } else if (password.length < 6) {
                      setWarningMessage(
                        "A senha deve ter no mínimo 6 dígitos!"
                      );
                    } else if (password !== confirmPassword) {
                      setWarningMessage("As senhas não correspondem!");
                    } else {
                      signUp(email, password)
                        .then(() => {
                          setAuthConfirmMessage("Cadastrado com sucesso!");
                          setAuthConfirmPopups((prevState) => ({
                            ...prevState,
                            signUp: true,
                          }));
                          animateOpening(authConfirmPopupAnimations["signUp"]);
                          animateSlideIn(
                            authConfirmPopupAnimations["signUpRight"]
                          );
                        })
                        .catch((error) => {
                          setErrorMessage(
                            `Não foi possível fazer o cadastro!\n${error.message}`
                          );
                          setPopups((prevState) => ({
                            ...prevState,
                            error: true,
                          }));
                          animateOpening(popupAnimations["error"]);
                        });
                      return;
                    }
                    setPopups((prevState) => ({
                      ...prevState,
                      warning: true,
                    }));
                    animateOpening(popupAnimations["warning"]);
                    animateSlideIn(popupAnimations["warningRight"]);
                  }}
                >
                  <Entypo name="login" size={24} color="white" />
                  <Text
                    style={[styles.text, { color: "white", paddingLeft: 7 }]}
                  >
                    Cadastrar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text
                    style={styles.authTipText}
                    onPress={() => {
                      if (authMode === "signIn") {
                        setAuthMode("signUp");
                      } else if (authMode === "signUp") {
                        setAuthMode("signIn");
                      }
                    }}
                  >
                    Já possui acesso? Faça login.
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
      <StatusBar
        style={styles.statusBar.style}
        backgroundColor={styles.statusBar.backgroundColor}
        translucent={false}
      />
    </View>
  );
}

export default AuthScreen;
