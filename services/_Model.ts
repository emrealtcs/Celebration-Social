export enum Privacy {
  Public = 1,
  Private = 2,
  Unlisted = 3,
}

export enum EventType {
  Birthday = "Birthday",
  Graduation = "Graduation",
  Wedding = "Wedding",
  Other = "Other",
}

export interface User {
  name: string;
  username: string;
  email: string;
  city: string;
  state: string;
  bio?: string;
  profilePicture?: string;
  geocode?: // can be Geocode or JSON format
  | Geocode
    | {
        latitude: number;
        longitude: number;
      };
  friends?: {
    [key: string]: string; // {uid : username}
  };
  events?: {
    [key: string]: string; // {eventId (uuid)) : uid}
  };
  sharedEvents?: {
    [key: string]: string; // {eventId : event.owner (uid)}
  };
  albums?: {
    [key: string]: string; // {albumId (uuid)} : createdAt}
  };
  sharedAlbums?: {
    [key: string]: string; // {uid : albumId}
  };
}

// key : eventId (uuid)
export interface Event {
  id: string; // Unique event identifier
  eventTitle: string;
  eventType: string; // EventType
  eventDateTime: // can be EventDateTime or JSON format
  | EventDateTime
    | {
        date: string;
        startTime: string;
        endTime: string;
      };

  celebrant?: string; // if Birthday Event
  graduate?: string; // if Graduation Event
  brideName?: string; // if Wedding Event
  groomName?: string; // if Wedding Event
  host?: string; // if Other Event

  numberOfGuests: number;
  location: // can be Location or JSON format
  | Location
    | { streetAddress: string; city: string; state: string; zip: string };
  description: string;
  info: string;

  photos?: {
    [key: number]: string; // {timestamp : storage-url}
  };
  qrCodeValue?: string; // New field for QR code
  owner: string; //uid
  username: string;
  privacy: number; // public:1 private:2 unlisted:3

  geocode?: // can be Geocode or JSON format
  | Geocode
    | {
        latitude: number;
        longitude: number;
      };
}

//key : albumId (uuid)
export interface Album {
  id: string;
  albumName: string;
  createdAt: Date | string; // can be Date or timestamp
  photos?: {
    [key: number]: string; // {uuid : storage-url}
  };
  numberOfPhotos: number;

  owner: string; //uid
}

export interface Geocode {
  latitude: number;
  longitude: number;
}

export interface EventDateTime {
  date: string;
  startTime: string;
  endTime: string;
}

export function eventDateTimeToString(eventDateTime: EventDateTime): string {
  return `${eventDateTime.date} · ${eventDateTime.startTime} - ${eventDateTime.endTime}`;
}

export interface Location {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
}

export function locationToString(location: Location): string {
  return `${location.streetAddress}, ${location.city}, ${location.state} ${location.zip}`;
}
