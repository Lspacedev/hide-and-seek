import { Stack } from "expo-router";
export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="createGame" options={{ headerShown: false }} />
      <Stack.Screen name="joinGame" options={{ headerShown: false }} />
    </Stack>
  );
}
