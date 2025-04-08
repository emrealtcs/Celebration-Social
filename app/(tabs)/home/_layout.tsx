import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerStyle: {
            backgroundColor: "#f5f5f5",
          },
          headerBackVisible: false,
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="events"
        options={{ headerShown: false }}
      ></Stack.Screen>
    </Stack>
  );
}
