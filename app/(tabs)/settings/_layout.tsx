import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Settings" }}></Stack.Screen>
      <Stack.Screen
        name="manageAccountPage"
        options={{ title: "Manage Account" }}
      ></Stack.Screen>
      <Stack.Screen
        name="changePasswordPage"
        options={{ title: "Change Password" }}
      ></Stack.Screen>
    </Stack>
  );
}
