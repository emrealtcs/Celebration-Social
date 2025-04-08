import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  getUserEvents,
  listenForUserEventsForUpload,
} from "../../../../services/EventService";
import { Event, Privacy } from "../../../../services/_Model";

const ChooseEventPage = () => {
  const [events, setEvents] = useState<Array<Record<string, Event>> | any>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = listenForUserEventsForUpload(setEvents); // Real-time updates

    // Cleanup when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array to only run once
  console.log(events);
  const eventsArray: Array<Event & { key: string }> = events.map(
    (event: Record<string, Event>) => {
      const eventId = Object.keys(event)[0];
      const eventData = event[eventId];

      return {
        key: eventId, // Ensure each event has a unique key
        ...eventData,
      };
    }
  );

  const handleUpload = (eventId: string, eventTitle: string) => {
    router.push({
      pathname: "/home/events/uploadPhoto",
      params: { id: eventId, title: eventTitle },
    });
  };
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
            <>
              {item.privacy !== Privacy.Unlisted && (
                <TouchableOpacity
                  onPress={() => handleUpload(item.key, item.eventTitle)}
                >
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
                </TouchableOpacity>
              )}
            </>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default ChooseEventPage;
