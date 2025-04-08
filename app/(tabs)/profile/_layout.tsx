import { Stack, router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
          headerRight: () => (
            <TouchableOpacity
              style={{}} // Ensure spacing from the edge
              onPress={() => router.push("/profile/friendsPage")}
            >
              <Ionicons name="person-add" size={30} color="black" />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="friendsPage"
        options={{ title: "My Friends", headerBackTitle: "Back" }}
      ></Stack.Screen>
      <Stack.Screen
        name="uploadProfilePicture"
        options={{ title: "Upload Profile Picture", headerBackTitle: "Back" }}
      ></Stack.Screen>
      <Stack.Screen
        name="editProfile"
        options={{ title: "Edit Profile Info", headerBackTitle: "Back" }}
      ></Stack.Screen>
      <Stack.Screen
        name="editMyEventsPage"
        options={{ title: "Edit My Events", headerBackTitle: "Back" }}
      ></Stack.Screen>
      <Stack.Screen
        name="editEventPage"
        options={{ title: "Edit Event", headerBackTitle: "Back" }}
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
