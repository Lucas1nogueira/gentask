import { useContext, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeContext, ThemeProvider } from "./contexts/ThemeContext";
import { AuthConfirmMessagesProvider } from "./contexts/AuthConfirmMessagesContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase/firebaseConfig";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";

SplashScreen.preventAutoHideAsync();

function AppPreConfig() {
  const [loaded, error] = useFonts({
    "ReadexPro-Bold": require("../assets/fonts/Readex_Pro/ReadexPro-Bold.ttf"),
    "ReadexPro-Medium": require("../assets/fonts/Readex_Pro/ReadexPro-Medium.ttf"),
    "ReadexPro-Regular": require("../assets/fonts/Readex_Pro/ReadexPro-Regular.ttf"),
    "ReadexPro-SemiBold": require("../assets/fonts/Readex_Pro/ReadexPro-SemiBold.ttf"),
  });

  const { isLoading, styles } = useContext(ThemeContext);

  const [user, setUser] = useState(null);
  const [didAuthLoad, setAuthLoad] = useState(false);

  useEffect(() => {
    if (styles) {
      NavigationBar.setBackgroundColorAsync(styles.navigationBar.color);
      NavigationBar.setButtonStyleAsync(styles.navigationBar.buttonStyle);
    }
  }, [styles]);

  useEffect(() => {
    let isMounted = true;
    let initialCheck = false;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        setUser(user);
        if (!initialCheck) {
          setAuthLoad(true);
          initialCheck = true;
        }
      }
      setAuthLoad(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if ((loaded || error) && !isLoading && didAuthLoad) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isLoading, didAuthLoad]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthConfirmMessagesProvider>
      {!user ? <AuthScreen /> : <HomeScreen />}
    </AuthConfirmMessagesProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppPreConfig />
    </ThemeProvider>
  );
}
