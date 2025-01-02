import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import HomeScreen from "./screens/HomeScreen";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    "ReadexPro-Bold": require("../assets/fonts/Readex_Pro/ReadexPro-Bold.ttf"),
    "ReadexPro-Medium": require("../assets/fonts/Readex_Pro/ReadexPro-Medium.ttf"),
    "ReadexPro-Regular": require("../assets/fonts/Readex_Pro/ReadexPro-Regular.ttf"),
    "ReadexPro-SemiBold": require("../assets/fonts/Readex_Pro/ReadexPro-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return <HomeScreen />;
}
