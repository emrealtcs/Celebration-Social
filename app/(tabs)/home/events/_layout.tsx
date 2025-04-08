import { router, Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="chooseEvent"
        options={{ title: "Choose Event for Upload" }}
      ></Stack.Screen>
      <Stack.Screen
        name="uploadPhoto"
        options={{ title: "Upload Photos" }}
      ></Stack.Screen>
      <Stack.Screen
        name="viewEvents"
        options={{ title: "Upcoming Events" }}
      ></Stack.Screen>
      <Stack.Screen
        name="createEvent"
        options={{
          title: "New Event",
          headerTitleStyle: {
            fontFamily: "Poppins-SemiBold, sans-serif",
            fontSize: 20,
          },
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="details/[id]"
        options={{
          headerBackTitle: "Back",
        }}
      ></Stack.Screen>
    </Stack>
  );
}
