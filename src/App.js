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

  const [user, setUser] = useState(false);

  useEffect(() => {
    if ((loaded || error) && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isLoading]);

  useEffect(() => {
    if (styles) {
      NavigationBar.setBackgroundColorAsync(styles.navigationBar.color);
      NavigationBar.setButtonStyleAsync(styles.navigationBar.buttonStyle);
    }
  }, [styles]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

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
