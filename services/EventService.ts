import { auth, db } from "./_Config";
import { ref, set, get, push, onValue, update } from "firebase/database";
import { Event, EventDateTime, Privacy } from "./_Model";
import { getUsername, getFriends } from "./UserService";

export async function createNewEvent(event: Event) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not found");
    }
    event.owner = currentUser.uid;

    const username = await getUsername();
    if (!username) {
      throw new Error("Username not found");
    }
    event.username = username;

    // Remove empty string values due to different types
    const newEvent = Object.fromEntries(
      Object.entries(event).filter(
        ([key, value]) =>
          !["celebrant", "graduate", "brideName", "groomName", "host"].includes(
            key
          ) || value !== ""
      )
    );

    const eventsRef = ref(db, "events");
    const newEventRef = push(eventsRef); // creates eventId
    const eventId = newEventRef.ref.toString().split("events/")[1]; // fetches eventId from ref
    newEvent.id = eventId; // assign eventId to the finalized event data
    await set(newEventRef, newEvent);

    await addEventToUser(newEvent.owner, eventId);
  } catch (e: any) {
    throw new Error("Error creating New Event", e.message);
  }
}

export async function addEventToUser(
  uid: string,
  eventId: string,
  owner?: string
) {
  try {
    if (owner) {
      const eventsIdRef = ref(db, `users/${uid}/events/${eventId}`);
      await set(eventsIdRef, owner);
    } else {
      const eventsIdRef = ref(db, `users/${uid}/events/${eventId}`);
      await set(eventsIdRef, uid);
    }
  } catch (e: any) {
    throw new Error("Error adding event to user: " + e.message);
  }
}

export async function getAllEvents(): Promise<
  Array<Record<string, Event>> | undefined
> {
  try {
    const eventsRef = ref(db, "events");

    const snapshot = await get(eventsRef); // Use 'get' to fetch data
    if (!snapshot.exists()) {
      throw new Error("Events not found");
    }

    const eventsArray: Array<Record<string, Event>> = [];

    snapshot.forEach((event) => {
      const eventId = event.key; // Get eventId
      const eventDetails = event.val(); // Get event details

      if (eventId && eventDetails) {
        eventsArray.push({ [eventId]: eventDetails });
      }
    });

    return eventsArray;
  } catch (e: any) {
    throw new Error("Error retrieving events:", e.message);
  }
}

// Real-time synchronization when a new event is created
export function listenForEvents(
  callback: (events: Array<Record<string, Event>>) => void
) {
  const eventsRef = ref(db, "events");

  const unsubscribe = onValue(eventsRef, (snapshot) => {
    const eventsArray: Array<Record<string, Event>> = [];

    snapshot.forEach((childSnapshot) => {
      const eventId = childSnapshot.key;
      const eventDetails = childSnapshot.val() as Event;

      // Future Implementation: if event is private and eventId does not exist in current user, do not push to eventsArray
      if (
        eventId &&
        eventDetails &&
        eventDetails.privacy !== Privacy.Unlisted
      ) {
        eventsArray.push({ [eventId]: eventDetails });
      }
    });

    callback(sortEventsChronologically(eventsArray)); // Pass the data to the callback function
  });

  return unsubscribe; // Return the unsubscribe function to clean up
}

export function listenForUserEvents(
  callback: (events: Array<Record<string, Event>>) => void
) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated or logged in");
  }

  const eventsRef = ref(db, "events");

  const unsubscribe = onValue(eventsRef, async (snapshot) => {
    const eventIds: string[] = [];

    snapshot.forEach((childSnapshot) => {
      if (childSnapshot.key) {
        eventIds.push(childSnapshot.key);
      }
    });

    if (eventIds.length === 0) {
      callback([]); // No events found
      return;
    }
    const userEvents: string[] = [];
    // Fetch events concurrently
    const eventsArray = await Promise.all(
      eventIds.map(async (eventId) => {
        const eventsRef = ref(db, `users/${currentUser.uid}/events`);
        const snapshot = await get(eventsRef);

        snapshot.forEach((userEvent) => {
          const userEventId = userEvent.key;
          if (userEventId && eventIds.includes(userEventId)) {
            userEvents.push(userEventId);
          }
        });

        if (userEvents.includes(eventId)) {
          const eventDetails = await getEventById(eventId);
          return eventDetails && eventDetails.privacy !== Privacy.Unlisted
            ? { [eventId]: eventDetails }
            : null;
        }
      })
    );

    // Filter out null values
    callback(
      sortEventsChronologically(
        eventsArray.filter(
          (event) => event !== null && event !== undefined
        ) as Array<Record<string, Event>>
      )
    );
  });

  return unsubscribe; // Return the unsubscribe function to clean up
}

export function listenForNewEventsAfterAccept(
  callback: (events: Array<Record<string, Event>>) => void
) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated or logged in");
  }

  const eventsRef = ref(db, `users/${currentUser.uid}/events`);

  const unsubscribe = onValue(eventsRef, async (snapshot) => {
    const eventIds: string[] = [];

    snapshot.forEach((childSnapshot) => {
      const eventId = childSnapshot.key;
      if (eventId) {
        eventIds.push(eventId);
      }
    });

    if (eventIds.length === 0) {
      callback([]); // No events found
      return;
    }

    // Fetch events concurrently
    const eventsArray = await Promise.all(
      eventIds.map(async (eventId) => {
        const eventDetails = await getEventById(eventId);
        return eventDetails && eventDetails.privacy !== Privacy.Unlisted
          ? { [eventId]: eventDetails }
          : null;
      })
    );

    // Filter out null values
    callback(
      sortEventsChronologically(
        eventsArray.filter((event) => event !== null) as Array<
          Record<string, Event>
        >
      )
    );
  });

  return unsubscribe; // Return the unsubscribe function to clean up
}

export function listenForUserEventsForUpload(
  callback: (events: Array<Record<string, Event>>) => void
) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated or logged in");
  }

  const eventsRef = ref(db, `users/${currentUser.uid}/events`);

  const unsubscribe = onValue(eventsRef, async (snapshot) => {
    const eventIds: string[] = [];

    snapshot.forEach((childSnapshot) => {
      const eventId = childSnapshot.key;
      if (eventId) {
        eventIds.push(eventId);
      }
    });

    if (eventIds.length === 0) {
      callback([]); // No events found
      return;
    }

    // Fetch events concurrently
    const eventsArray = await Promise.all(
      eventIds.map(async (eventId) => {
        const eventDetails = await getEventById(eventId);
        return eventDetails && eventDetails.privacy !== Privacy.Unlisted
          ? { [eventId]: eventDetails }
          : null;
      })
    );

    // Filter out null values
    callback(
      sortEventsChronologically(
        eventsArray.filter((event) => event !== null) as Array<
          Record<string, Event>
        >
      )
    );
  });

  return unsubscribe; // Return the unsubscribe function to clean up
}

export function listenForSharedEvents(
  callback: (events: Array<Record<string, Event>>) => void
) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated or logged in");
  }

  const eventsRef = ref(db, `users/${currentUser.uid}/sharedEvents`);

  const unsubscribe = onValue(eventsRef, async (snapshot) => {
    const eventIds: string[] = [];

    snapshot.forEach((childSnapshot) => {
      const eventId = childSnapshot.key;
      if (eventId) {
        eventIds.push(eventId);
      }
    });

    if (eventIds.length === 0) {
      callback([]); // No events found
      return;
    }

    // Fetch events concurrently
    const eventsArray = await Promise.all(
      eventIds.map(async (eventId) => {
        const eventDetails = await getEventById(eventId);
        return eventDetails && eventDetails.privacy !== Privacy.Unlisted
          ? { [eventId]: eventDetails }
          : null;
      })
    );

    // Filter out null values
    callback(
      sortEventsChronologically(
        eventsArray.filter((event) => event !== null) as Array<
          Record<string, Event>
        >
      )
    );
  });

  return unsubscribe; // Return the unsubscribe function to clean up
}

export async function acceptSharedEvent(sharedEvent: Event) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    await addEventToUser(currentUser.uid, sharedEvent.id, sharedEvent.owner);

    const sharedEventRef = ref(
      db,
      `users/${currentUser.uid}/sharedEvents/${sharedEvent.id}`
    );
    await set(sharedEventRef, null);
  } catch (e: any) {
    throw new Error("Error accepting shared event", e.message);
  }
}

export async function declineSharedEvent(sharedEvent: Event) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const sharedEventRef = ref(
      db,
      `users/${currentUser.uid}/sharedEvents/${sharedEvent.id}`
    );
    await set(sharedEventRef, null);
  } catch (e: any) {
    throw new Error("Error declining shared event", e.message);
  }
}

export async function getEventById(eventId: string) {
  try {
    const eventRef = ref(db, `events/${eventId}`);
    const snapshot = await get(eventRef);
    if (snapshot.exists()) {
      return snapshot.val() as Event;
    }

    return undefined;
  } catch (e: any) {
    throw new Error(e);
  }
}

export function isOwnEvent(owner: string): boolean {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return owner === currentUser.uid;
    } else {
      throw new Error("User not found");
    }
  } catch (e: any) {
    throw new Error("Error validating event owner");
  }
}

export async function isFriendEvent(owner: string): Promise<boolean> {
  try {
    const friendsArray: Array<Record<string, string>> | undefined =
      await getFriends();
    if (friendsArray === undefined) {
      return false;
    }

    let isFriend = false;
    friendsArray.map((friend: Record<string, string>) => {
      const friendUid = Object.keys(friend)[0];

      if (owner === friendUid) {
        isFriend = true;
      }
    });
    return isFriend;
  } catch (e: any) {
    throw new Error("Error validating event owner");
  }
}

export async function getUserEvents(): Promise<Record<string, Event>> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated or logged in");
    }

    // ✅ Get saved event IDs from user profile
    const savedEventsRef = ref(db, `users/${currentUser.uid}/savedEvents`);
    const savedSnapshot = await get(savedEventsRef);

    const savedEventIds = savedSnapshot.exists()
      ? Object.keys(savedSnapshot.val())
      : [];

    // ✅ Fetch all events
    const eventsRef = ref(db, "events");
    const snapshot = await get(eventsRef);
    if (!snapshot.exists()) return {};

    let userEvents: Record<string, Event> = {};

    snapshot.forEach((event) => {
      const eventId = event.key!;
      const eventDetails = event.val();

      const isOwned = eventDetails.owner === currentUser.uid;
      const isSaved = savedEventIds.includes(eventId);

      if (isOwned || isSaved) {
        userEvents[eventId] = eventDetails;
      }
    });

    return userEvents;
  } catch (e: any) {
    throw new Error("Error getting user events: " + e.message);
  }
}

export function listenForMyEvents(
  callback: (events: Array<Record<string, Event>>) => void
) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated or logged in");
  }

  const eventsRef = ref(db, "events");

  const unsubscribe = onValue(eventsRef, async (snapshot) => {
    const eventsArray: Array<Record<string, Event>> = [];

    snapshot.forEach((childSnapshot) => {
      const eventId = childSnapshot.key;
      const eventDetails = childSnapshot.val();

      if (eventDetails.owner === currentUser.uid) {
        eventsArray.push({ [eventId]: eventDetails });
      }
    });
    // Filter out null values
    callback(sortEventsChronologically(eventsArray));
  });

  return unsubscribe; // Return the unsubscribe function to clean up
}

export async function deleteEvent(eventId: string) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const userEventRef = ref(db, `users/${currentUser.uid}/events/${eventId}`);
    await set(userEventRef, null);
  } catch (e: any) {
    throw new Error("Error deleting event:", e.message);
  }
}

export async function deleteMyEvent(eventId: string) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const eventRef = ref(db, `events/${eventId}`);

    const snapshot = await get(eventRef);
    if (!snapshot.exists()) {
      throw new Error("Event not found");
    }

    const eventData = snapshot.val();
    if (eventData.owner !== currentUser.uid) {
      throw new Error("You are not authorized to delete this event");
    }

    await set(eventRef, null);

    const userEventRef = ref(db, `users/${currentUser.uid}/events/${eventId}`);
    await set(userEventRef, null);
  } catch (e: any) {
    throw new Error("Error deleting event:", e.message);
  }
}

export async function updateEvent(eventId: string, event: Event) {
  try {
    const eventRef = ref(db, `events/${eventId}`);
    const updatedEvent = Object.fromEntries(
      Object.entries(event).filter(
        ([key, value]) =>
          !["celebrant", "graduate", "brideName", "groomName", "host"].includes(
            key
          ) || value !== ""
      )
    );
    await update(eventRef, updatedEvent);
  } catch (error: any) {
    throw new Error("Error updating event", error.messsge);
  }
}

export function sortEventsChronologically(
  events: Array<Record<string, Event>>
): Array<Record<string, Event>> {
  return events.sort((a, b) => {
    const eventA = Object.values(a)[0]; // Extract event object
    const eventB = Object.values(b)[0];

    const dateA = parseEventDateTime(eventA.eventDateTime);
    const dateB = parseEventDateTime(eventB.eventDateTime);

    return dateA.getTime() - dateB.getTime(); // Ascending order (earliest first)
  });
}

// Function to parse EventDateTime into a valid Date object
function parseEventDateTime(eventDateTime: EventDateTime): Date {
  const date = parseDate(eventDateTime.date); // Parse date (e.g. "July 20, 2025")
  const [time, period] = eventDateTime.startTime.split(" "); // Extract "6:00" and "PM"
  let [hours, minutes] = time.split(":").map(Number);

  // Convert to 24-hour format
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  date.setHours(hours, minutes, 0, 0); // Set the parsed time

  return date;
}

// Function to parse human-readable date format into a Date object
function parseDate(dateString: string): Date {
  const months = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  const [monthName, day, year] = dateString.split(" ");

  // Ensure that monthName is a valid key in the months object
  const month = months[monthName as keyof typeof months];
  if (month === undefined) {
    throw new Error(`Invalid month name: ${monthName}`);
  }

  const dayNumber = parseInt(day, 10);
  const yearNumber = parseInt(year, 10);

  // Return the date in a valid format (MM/DD/YYYY)
  return new Date(yearNumber, month, dayNumber);
}
