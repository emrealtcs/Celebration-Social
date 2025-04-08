import { Stack } from "expo-router";

export default function AlbumsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "My Albums" }}
      ></Stack.Screen>
    </Stack>
  );
}
