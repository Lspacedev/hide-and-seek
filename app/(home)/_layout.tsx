import { Redirect, Stack, usePathname } from "expo-router";
import { Text, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type TokenType = string | null;
export default function Root() {
  const [gameId, setGameId] = useState<TokenType>("");
  const [loading, setLoading] = useState(false);
  const getData = async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      // error reading value
    }
  };
  useEffect(() => {
    (async () => {
      setLoading(true);
      const jsonValue = await getData("gameId");
      setGameId(jsonValue);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }
  if (gameId === "") {
    return <Redirect href={{ pathname: "/(auth)" }} />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="regions/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
