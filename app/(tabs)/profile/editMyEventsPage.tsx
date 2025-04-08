import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  getUserEvents,
  deleteMyEvent,
  listenForMyEvents,
} from "../../../services/EventService";
import { Event, Privacy } from "../../../services/_Model";

const myEventsPage = () => {
  const [events, setEvents] = useState<Array<Record<string, Event>> | any>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = listenForMyEvents(setEvents);

    return () => unsubscribe();
  }, []);
  console.log(events);
  const eventsArray: Array<Event & { key: string }> = events.map(
    (event: Record<string, Event>) => {
      const eventId = Object.keys(event)[0];
      const eventData = event[eventId];

      return {
        key: eventId,
        ...eventData,
      };
    }
  );

  const handleEdit = (event: any) => {
    router.push({
      pathname: "/profile/editEventPage",
      params: { event: JSON.stringify(event) },
    });
  };

  const handleDelete = async (eventId: string) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event forever?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMyEvent(eventId);
            } catch (error) {
              console.error("Error deleting event:", error);
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (eventId: string) => {
    return (
      <TouchableOpacity
        onPress={() => handleDelete(eventId)}
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "red",
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Delete</Text>
      </TouchableOpacity>
    );
  };

  // ScrollView not used, FlatList has scroll built in.
  return (
    <SafeAreaView className="bg-white3 flex-1">
      {eventsArray.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text>No events created.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={eventsArray}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item.key)}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                {item.privacy !== Privacy.Unlisted && (
                  <View
                    style={{
                      padding: 12,
                      marginVertical: 8,
                      backgroundColor: "#e2e8f0",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {item.eventTitle || "Untitled Event"}
                    </Text>
                    <Text>{item.eventDateTime?.date}</Text>
                    <Text>{item.eventType}</Text>
                  </View>
                )}
                {item.privacy === Privacy.Unlisted && (
                  <View
                    style={{
                      padding: 12,
                      marginVertical: 8,
                      backgroundColor: "#fca5a5",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                      {item.eventTitle || "Untitled Event"}
                    </Text>
                    <Text>{item.eventDateTime?.date}</Text>
                    <Text>{item.eventType}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Swipeable>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default myEventsPage;
