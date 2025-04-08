import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { Link, router } from "expo-router";

import { Event, EventType, Privacy } from "../../../../services/_Model";
import EventCard, { EventCardProps } from "../../../../components/EventCard";
import {
  listenForEvents,
  isOwnEvent,
  isFriendEvent,
} from "../../../../services/EventService";

const ViewEventsPage = () => {
  const [events, setEvents] = useState<Array<Record<string, Event>> | any>([]);
  const [friendStatus, setFriendStatus] = useState<Record<string, boolean>>({});
  const [checkedOwners, setCheckedOwners] = useState<Set<string>>(new Set()); // Track owners we've already checked

  useEffect(() => {
    const unsubscribe = listenForEvents(setEvents); // Real-time updates

    // Cleanup when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array to only run once

  const handleIsFriendEvent = async (owner: string) => {
    const result = await isFriendEvent(owner);
    setFriendStatus((prevState) => ({
      ...prevState,
      [owner]: result,
    }));
  };

  useEffect(() => {
    // Loop over events and check the owner status, but only if we haven't checked it yet
    events.forEach((event: Record<string, Event>) => {
      const eventId = Object.keys(event)[0];
      const eventData = event[eventId];
      const owner = eventData.owner;

      if (!checkedOwners.has(owner)) {
        // Call the async function to check if the event owner is a friend
        handleIsFriendEvent(owner);
        setCheckedOwners((prevChecked) => new Set(prevChecked).add(owner));
      }
    });
  }, [events, checkedOwners]); // Only run when events change or owners haven't been checked

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: 5, backgroundColor: "lightblue" }}
    >
      <View className="w-full flex-1 justify-start items-center px-4 my-3 ">
        {events.map((event: Record<string, Event>) => {
          const eventId = Object.keys(event)[0];
          const eventData = event[eventId];

          // Get the friend status for this event owner
          const isFriend = friendStatus[eventData.owner];
          const isOwn = isOwnEvent(eventData.owner);

          // Only show public events OR events where the user is a friend or the owner
          if (eventData.privacy === Privacy.Private && !isOwn && !isFriend) {
            return null; // Skip this event if it's private and the user isn't allowed to see it
          }

          return (
            <EventCard
              key={eventId}
              event={eventData}
              isOwn={isOwn}
              isFriend={isFriend}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

export default ViewEventsPage;
