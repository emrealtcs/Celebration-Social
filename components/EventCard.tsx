/*
EventCard.tsx defines the EventCard component for a created Event

Attributes date & location may need to be modified at some point:
- date: implement with a calendar for consistent formatting among users? (currently, users need to input the date themselves)
    Furthermore, events will need to be sorted by date at some point
location: implement a location API to allow users to see where the event is and how far they are (mostly for passerbyers when implemented)
*/

import { View, Text, Alert, TouchableOpacity } from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  eventDateTimeToString,
  locationToString,
  Privacy,
  EventType,
  Event,
} from "../services/_Model";
import { CustomButton } from "../components";
import {
  acceptSharedEvent,
  declineSharedEvent,
  deleteEvent,
} from "../services/EventService";

export interface EventCardProps {
  event: Event;
  isOwn?: boolean;
  isFriend?: boolean;
  fromProfile?: boolean;
  isShared?: boolean;
}

// Map event types to icons
const eventTypeIcons: Record<string, any> = {
  Birthday: <FontAwesome5 name="birthday-cake" size={16} color="purple" />,
  Graduation: <FontAwesome5 name="graduation-cap" size={16} color="blue" />,
  Wedding: <FontAwesome5 name="ring" size={16} color="gold" />,
  Other: <FontAwesome5 name="calendar" size={16} color="gray" />,
};

const eventHeaders: Record<string, any> = {
  own: <Text className="text-xs text-gray-700">My Event</Text>,
  friend: <Text className="text-xs text-gray-700">Friend’s Event</Text>,
  public: <Text className="text-xs text-gray-700">Public Event</Text>,
  private: <Text className="text-xs text-gray-700">Private Event</Text>,
  shared: <Text className="text-xs text-gray-700">Pending Event</Text>,
};

const EventCard = ({
  event,
  isOwn,
  isFriend,
  fromProfile,
  isShared,
}: EventCardProps) => {
  const locationString = locationToString(event.location);
  const date = eventDateTimeToString(event.eventDateTime);

  const eventParams = encodeURIComponent(JSON.stringify(event));

  var eventbg = "white";
  if (event.eventType == EventType.Birthday) {
    eventbg = "blue";
  }
  if (event.eventType == EventType.Graduation) {
    eventbg = "darkblue";
  }
  if (event.eventType == EventType.Wedding) {
    eventbg = "lightyellow";
  }
  if (event.eventType == EventType.Other) {
    eventbg = "white";
  }

  const handleAccept = async () => {
    try {
      console.log(event.id);
      await acceptSharedEvent(event);
    } catch (e: any) {
      Alert.alert(e);
    }
  };

  const handleDecline = async () => {
    try {
      await declineSharedEvent(event);
    } catch (e: any) {
      Alert.alert(e);
    }
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
              await deleteEvent(eventId);
            } catch (error) {
              console.error("Error deleting event:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <View
      className="bg-white p-4 rounded-xl shadow-md my-2 w-9/12 min-h-[150px]"
      onStartShouldSetResponder={() => {
        if (fromProfile) {
          router.push(
            `/profile/details/${event.id}?event=${eventParams}&profile=${true}`
          );
        } else {
          router.push(
            `/home/events/details/${
              event.id
            }?event=${eventParams}&profile=${false}`
          );
        }

        return true;
      }}
    >
      {/* Event Headers & Friend Username */}
      <View className="flex flex-row justify-between items-center mb-2">
        <View className="bg-gray-200 px-3 py-1 rounded-full">
          {isOwn && eventHeaders["own"]}
          {isFriend && !isShared && eventHeaders["friend"]}
          {!isOwn &&
            !isFriend &&
            !isShared &&
            event.privacy === Privacy.Public &&
            eventHeaders["public"]}
          {!isOwn &&
            !isFriend &&
            !isShared &&
            event.privacy === Privacy.Private &&
            eventHeaders["private"]}
          {isShared && eventHeaders["shared"]}
        </View>
        {(isFriend || isShared || event.privacy === Privacy.Private) && (
          <Text className="text-sm text-gray-500 italic">
            @{event.username}
          </Text>
        )}
      </View>

      {/* Title & Date */}
      <View className="flex-1">
        <Text
          className="text-xl font-bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            textOverflow: "ellipsis", // Apply text overflow
            overflow: "hidden", // Hide the overflowed content
          }}
        >
          {event.eventTitle}
        </Text>
        <Text className="text-sm text-gray-600">{date}</Text>
      </View>

      {/* Location */}
      <View className="flex flex-row items-center mt-1">
        <MaterialIcons name="location-on" size={16} color="black" />
        <Text
          className="text-sm text-gray-800 ml-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {locationString}
        </Text>
      </View>

      {/* Celebrant / Host */}
      <View className="mt-2">
        {event.eventType === EventType.Birthday && (
          <Text className="text-sm font-semibold" numberOfLines={1}>
            Celebrating: {event.celebrant}
          </Text>
        )}
        {event.eventType === EventType.Graduation && (
          <Text className="text-sm font-semibold" numberOfLines={1}>
            Celebrating: {event.graduate}
          </Text>
        )}
        {event.eventType === EventType.Wedding && (
          <Text className="text-sm font-semibold" numberOfLines={1}>
            Celebrating: {event.brideName} & {event.groomName}
          </Text>
        )}
        {event.eventType === EventType.Other && (
          <Text className="text-sm font-semibold" numberOfLines={1}>
            Hosted by: {event.host}
          </Text>
        )}
      </View>

      {/* Event Type Indicator */}
      <View className="flex flex-row justify-between mt-2">
        <View className="flex-row items-center">
          {eventTypeIcons[event.eventType]}
          <Text className="text-sm text-gray-700 ml-2">{event.eventType}</Text>
        </View>

        {fromProfile && !isOwn && !isShared && (
          <TouchableOpacity
            className=" bg-red-400 rounded-lg"
            onPress={() => handleDelete(event.id)}
          >
            <Text className="px-2 py-1">X</Text>
          </TouchableOpacity>
        )}
      </View>

      {isShared && (
        <View className="flex-row justify-around mt-2">
          <CustomButton
            title="Decline"
            handlePress={handleDecline}
            containerStyles="bg-red-500  "
            textStyles=" text-xl"
          />
          <CustomButton
            title="Accept"
            handlePress={handleAccept}
            containerStyles="bg-green-500 h-2"
            textStyles=" text-xl"
          />
        </View>
      )}
    </View>
  );
};

export default EventCard;
