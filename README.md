# JID-4341_Candid_Capture

Candid Capture of Life’s Celebration images is about creating a mobile application for
users to upload and share their personal events and photos. The app strives to build
connectivity and community for friends at events and strangers passing by at public
events. The application is constructed using TypeScript with React Native for mobile use
on Android and IOS devices. Our app uses Firebase to store user data and media. Candid
Capture includes many prominent features such as geolocation services connecting to a
map for event locations.

## Dependencies setup

- npx expo install
- npx expo prebuild
- npx expo run:ios or npx expo run:android

# Release Notes

## Version 0.1.0

### New Features

- Added a **Navigation Bar** with buttons directing to:
  - **Home**
  - **Settings**
  - **Map**
  - **Albums**
  - **Person**
- Introduced a **Login Page** for user authentication
- Added **Upload** and **Add Album** buttons for Homepage
- Developed an **Event Page** featuring a list of common events and options for custom events
- Created an **Event Details Page** where users can enter event-specific details and save them

### Bug Fixes

- No bugs fixed

---

## Version 0.2.0

### New Features

- Set-up a new **Firebase project**
- Implemented Firebase database for:
  - **Login Page** authentication
  - **Profile Page** information conatining user data
- Added new **User Page** where the user can create an account. User is promted to add detailed about themselves to create an account including:
  - **Name**
  - **Username** (Email)
  - **Country**
  - **Date of Birth**
- *When a new user is created, a unique **user ID** is created automatically for that particualr user.*
- Added **Profile Page** where the user can edit profile information stored in the database including the user **profile picture** and user **bio**. *This information is stored securely in the realtime database.*
- Users can add other users as friends by searching for names or usernames.
- UI has been upadated to be in-complaince with hi-fi prototypes and mock-ups.

### Bug Fixes

- Tab layout has been fixed.

### Known Issues

- App does not run on web due to Firebase dependency issues.
- App does not run on Expo Go due to Firebase dependency issues.

--

## Version 0.3.0

### New Features

- **Profile Page**
  - When tapping profile picture, the app prompts user to edit profile picture. Upon tapping again, the app navigates to a page that allows the user to uplaod a new
  profile picture.
  - Added pencil icon to bio. When pencil is tapped, the bio becomes editable.
  - "Save Profile Bio" button does not appear until the bio is edited, so the user is not confused.
  - Profile pic, name, username, and bio rearranged on page and whitespace removed.
  - Edit profile button added, navigates to a page where the Name, Username, City, and State can be edited.
  - Added button for "My Events" that leads to new interface which shows all the events created by the user that is logged in.
  - User's events displayed in list, when tapped the user can see cuurent event details and change any details if necessary.
  - User can swipe left on an event to delete it.
  - **Freinds Page**
    - The UI has been updated on the Freinds page.
- **Settings Page**
  - Added button to Manage account.
  - Manage Account button brings user to fields where email can be updated (confirm new email field also implemented)
  - Added "Save Email" button
  - Added "Delete Account" button in red.
  - Added "Change Password" button which navigates to a **Change Password Page**: 
    - Asks user for current user for authentication purposes. 
    - New password and confirm new password fields were added.
    - Eye icon button on passwords feilds allows user to hide or see password.
- **Create Event Page**
  - User can create a new event
  - Calendar has been implemented to easily choose a date for the event.
  - Feilds change based on event type selected at the top of page.
- **Upcomming Events Page**
  - Events that have been created and are public are listed with UI elements based on event types.
  - When a user taps on an event, they are taken to a QR code that can be shared with event attendees.

  **The UI has been updated across the application to be consistent with prototypes and client feedback**
  **All data sets of the user profile and events are stored in the databse with a clear data model**

### Bug Fixes

- The project structure has been refractored to ensure consistency across the application and resued code has been placed in a **services** folder for easy access.
- The app can be run on Expo Go.
- The firebase database has been deployed on the Expo Go version of app, databse is functional.

### Known Issues

- Freinds list has update and add issues. Sometimes freinds list does not reflect current freinds of user.
- QR code does not lead to correct destination. Vercel will be used to delpoy URL for events detail.
- Delete Account button is not functional.

--

## Version 0.4.0

### New Features

- **Profile Page**
  - Made user interface simpler by making changes only available to the user id the user taps the "edit user profile" button.
  - Adds "My Events List"
    - Displays events in chronological order and user Event card component.
    - When the Event Card is tapped, it navigates to the **Event Details** page.
    - Fetches events from realtime database.
  - **Friends Page**
    - Freinds can be added by username.
    - Friends implemented in database.
  - **Edit Events Page**
    - Dispays only the users own events.
    - Allows mangement (edit and deletion) of events that the user has created.
- **Event Detail Page**
  - Displays the events details: celebrant details, UI changes based on event type (Graduation, Wedding, etc...)
  - Displays other event information such as: event date and time, number of guests, location, event description, and other helpful information feilds.
  - Adds "add to my events" button that adds this event to your events in your profile page.
  - Adds "share to freinds" button that allows you to share an event with freinds.
- **Albums Page**
  - Allows user to create albums by selecting photos from camera roll and naming the album.
  - Users are able to see all albums in their account with the first photo and name of the album being dispalyed on the page.
  - Users can tap on one of their album and can edit, delete, and download photos.
  - Users can add photos from their events by going to the **Profile Page** and selecting an event. From here they may tap on any photo and a button will appear to add to an exisitng album. The user will then select an album to place the photos into.

  **The UI has been updated across the application to be consistent with prototypes and client feedback**

### Bug Fixes

- The friends page has been updated and is now functional.
- Photos can be added to albums from events and are visible in database and app UI.

### Known Issues

- Delete Account button is not functional.
- Some pages do not refersh properly.