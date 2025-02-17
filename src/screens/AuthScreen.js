import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons/";
import MessagePopup from "../components/MessagePopup";
import MinimalPopup from "../components/MinimalPopup";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthConfirmMessagesContext } from "../contexts/AuthConfirmMessagesContext";
import { signIn, signUp } from "../services/firebase/auth";
import { getFirstUse, handleFirstUse } from "../services/storage";
import {
  animateClosing,
  animateCollapsing,
  animateExpanding,
  animateOpening,
  animateSlideIn,
  animateSlideOut,
} from "../utils/animationUtils";

function AuthScreen() {
  const { styles } = useContext(ThemeContext);
  const {
    authConfirmMessage,
    setAuthConfirmMessage,
    authConfirmPopups,
    setAuthConfirmPopups,
    authConfirmPopupAnimations,
  } = useContext(AuthConfirmMessagesContext);

  const authContainerExpandAnimation = useRef(new Animated.Value(0)).current;
  const confirmPasswordAnimation = useRef(new Animated.Value(0)).current;

  const authContainerHeightInterpolate =
    authContainerExpandAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [545, 640],
    });

  const [authMode, setAuthMode] = useState("signIn");
  const [email, onChangeEmail] = useState("");
  const [password, onChangePassword] = useState("");
  const [confirmPassword, onChangeConfirmPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  const [popups, setPopups] = useState({
    firstUse: false,
    error: false,
    warning: false,
  });

  const [popupAnimations] = useState({
    firstUse: new Animated.Value(0),
    error: new Animated.Value(0),
    warning: new Animated.Value(0),
    warningRight: new Animated.Value(0),
  });

  useEffect(() => {
    getFirstUse().then((firstUse) => {
      if (firstUse) {
        setPopups((prevState) => ({
          ...prevState,
          firstUse: true,
        }));
        animateOpening(popupAnimations["firstUse"]);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      {popups.firstUse && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.firstUse }]}
        >
          <View
            style={[
              styles.fullscreenArea,
              {
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
              },
            ]}
          >
            <View style={[styles.taskPopup, { height: 550 }]}>
              <View
                style={{
                  marginBottom: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons
                  name="info"
                  size={20}
                  color={styles.icon.color}
                />
                <Text style={[styles.header, { paddingLeft: 5 }]}>
                  Aviso de privacidade
                </Text>
              </View>
              <View
                style={{
                  width: "100%",
                  height: "85%",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    height: 390,
                    marginTop: 30,
                    borderRadius: 20,
                    backgroundColor: styles.taskInput.backgroundColor,
                    padding: 15,
                  }}
                >
                  <ScrollView style={{ minHeight: "100%" }}>
                    <Text style={[styles.text, { textAlign: "justify" }]}>
                      {
                        "O Gentask valoriza a sua privacidade. Este aviso explica como suas informações são coletadas e usadas ao utilizar o aplicativo.\n\n1. Coleta de Dados:\nAs informações que você fornece diretamente são armazenadas na base de dados do desenvolvedor, incluindo seu e-mail e dados inseridos no app.\n\n2. Uso dos Dados:\nO desenvolvedor e mantenedor do Gentask não vende ou expõe seus dados. Entretanto, é importante notar que os prestadores de serviço da base de dados e da Inteligência Artificial podem processar suas informações, o que NÃO fica a critério do desenvolvedor. Portanto, ao usar o app, você concorda que está ciente disso, e que aceita o processamento dos seus dados.\n\n3. Compartilhamento de Dados:\nNão compartilhamos suas informações pessoais com terceiros, exceto quando necessário para fornecer serviços, cumprir leis ou proteger direitos.\n\n4. Segurança dos Dados:\nSuas informações são guardadas em um serviço na nuvem de modo seguro, bem como no seu dispositivo para acesso offline. Entretanto, o desenvolvedor NÃO garante proteção contra ataques hackers nem contra mal uso do app.\n\n5. Seus Direitos:\nVocê tem o direito de acessar, editar ou excluir seus dados pessoais. Para exercer esses direitos, entre em contato com o desenvolvedor através do e-mail: (lucasbastos@programmer.net).\n\n6. Alterações na Política:\nPodemos atualizar esta política de privacidade.\n\nAo continuar utilizando o Gentask, você concorda com os termos descritos neste aviso de privacidade."
                      }
                    </Text>
                  </ScrollView>
                </View>
                <TouchableOpacity
                  style={styles.confirmBigButton}
                  onPress={() => {
                    handleFirstUse();
                    animateClosing(popupAnimations["firstUse"], () =>
                      setPopups((prevState) => ({
                        ...prevState,
                        firstUse: false,
                      }))
                    );
                  }}
                >
                  <>
                    <Feather name="check" size={24} color="white" />
                    <Text style={[styles.text, { color: "white" }]}>OK</Text>
                  </>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
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
            iconName={"info"}
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
        <Animated.View
          style={[
            styles.authContainer,
            { height: authContainerHeightInterpolate },
          ]}
        >
          <View style={{ width: "100%", alignItems: "center" }}>
            <View style={{ width: "100%", alignItems: "center" }}>
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
                  maskElement={<Text style={styles.authAppTitle}>Gentask</Text>}
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
            </View>
            <View
              style={{
                marginBottom: 5,
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
              }}
            >
              <MaterialIcons name="email" size={18} color={styles.icon.color} />
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
          </View>
          {authMode === "signUp" && (
            <Animated.View
              style={{
                width: "100%",
                opacity: confirmPasswordAnimation,
              }}
            >
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
            </Animated.View>
          )}
          <View
            style={{
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={[
                styles.authConfirmButton,
                isLoading && styles.authConfirmButtonLoading,
              ]}
              disabled={isLoading}
              onPress={() => {
                if (authMode === "signIn") {
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setWarningMessage("Por favor, digite um e-mail válido!");
                  } else if (password.length === 0) {
                    setWarningMessage("Por favor, insira a senha!");
                  } else {
                    setLoading(true);
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
                        setLoading(false);
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
                } else if (authMode === "signUp") {
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setWarningMessage("Por favor, digite um e-mail válido!");
                  } else if (password.length < 6) {
                    setWarningMessage("A senha deve ter no mínimo 6 dígitos!");
                  } else if (password !== confirmPassword) {
                    setWarningMessage("As senhas não correspondem!");
                  } else {
                    setLoading(true);
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
                        setLoading(false);
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
                }
              }}
            >
              {!isLoading ? (
                <Entypo name="login" size={24} color="white" />
              ) : (
                <ActivityIndicator color="white" />
              )}
              <Text style={[styles.text, { color: "white", paddingLeft: 7 }]}>
                {isLoading
                  ? "Carregando..."
                  : authMode === "signIn"
                  ? "Entrar"
                  : authMode === "signUp" && "Cadastrar"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text
                style={styles.authTipText}
                onPress={() => {
                  if (authMode === "signIn") {
                    animateExpanding(authContainerExpandAnimation, () => {
                      setAuthMode("signUp");
                      animateOpening(confirmPasswordAnimation);
                    });
                  } else if (authMode === "signUp") {
                    animateClosing(confirmPasswordAnimation, () => {
                      setAuthMode("signIn");
                      animateCollapsing(authContainerExpandAnimation);
                    });
                  }
                }}
              >
                {authMode === "signIn"
                  ? "Não possui uma conta? Cadastre-se."
                  : authMode === "signUp" && "Já possui acesso? Faça login."}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
