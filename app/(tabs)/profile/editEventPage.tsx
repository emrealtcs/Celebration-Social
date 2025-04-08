import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import { RadioGroup, RadioButtonProps } from "react-native-radio-buttons-group";
import { router, useLocalSearchParams } from "expo-router";
import { ref, set } from "firebase/database";
import { states } from "../../../constants";
import { Event, EventType } from "../../../services/_Model";
import { FormField, CustomButton } from "../../../components";
import { db } from "../../../services/_Config";
import { updateEvent } from "../../../services/EventService";

const formatDateString = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    timeZone: "UTC",
  });
};

const getCurrentDate = (): string => {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    timeZone: "UTC",
  });
};

const formatTimeTo24Hr = (time: string): string => {
  const [hourMinute, period] = time.split(" ");
  const [hour, minute] = hourMinute.split(":");
  let newHour = parseInt(hour);
  if (period === "PM" && newHour !== 12) {
    newHour += 12;
  } else if (period === "AM" && newHour === 12) {
    newHour = 0;
  }
  return `${newHour.toString().padStart(2, "0")}:${minute}`;
};

const generateMinuteOptions = () => {
  let minutes = [];
  for (let i = 0; i < 60; i += 5) {
    minutes.push(i.toString().padStart(2, "0"));
  }
  return minutes;
};

const parseTime = (timeStr: string) => {
  const [time, period] = timeStr.split(" ");
  const [hour, minute] = time.split(":");
  return { hour, minute, period };
};

const EditEventPage = () => {
  const { event: eventParam } = useLocalSearchParams();
  const initialEvent: Event & { id: string } = eventParam
    ? JSON.parse(eventParam as string)
    : null;

  if (!initialEvent) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error: No event data provided.</Text>
      </View>
    );
  }

  const {
    hour: initStartHour,
    minute: initStartMinute,
    period: initStartAMPM,
  } = parseTime(initialEvent.eventDateTime.startTime);
  const {
    hour: initEndHour,
    minute: initEndMinute,
    period: initEndAMPM,
  } = parseTime(initialEvent.eventDateTime.endTime);

  const [event, setEvent] = useState<Event | any>(initialEvent);
  const [isSubmitting, setSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>(
    initialEvent.eventDateTime.date
  );
  const [isCalendarVisible, setIsCalendarVisible] = useState<boolean>(false);

  const [startHour, setStartHour] = useState<string>(initStartHour);
  const [startMinute, setStartMinute] = useState<string>(initStartMinute);
  const [startAMPM, setStartAMPM] = useState<string>(initStartAMPM);

  const [endHour, setEndHour] = useState<string>(initEndHour);
  const [endMinute, setEndMinute] = useState<string>(initEndMinute);
  const [endAMPM, setEndAMPM] = useState<string>(initEndAMPM);

  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

  const privacyOptions: RadioButtonProps[] = useMemo(
    () => [
      { id: "1", label: "Public", value: "1" },
      { id: "2", label: "Private", value: "2" },
      { id: "3", label: "Unlisted", value: "3" },
    ],
    []
  );

  const handleDateSelect = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setEvent({
      ...event,
      eventDateTime: {
        ...event.eventDateTime,
        date: formatDateString(day.dateString),
      },
    });
    setIsCalendarVisible(false);
  };

  const handleUpdate = async () => {
    if (
      !event.eventTitle ||
      !event.location.streetAddress ||
      !event.location.city ||
      event.location.zip.length !== 5
    ) {
      Alert.alert("Event Title, Street Address, City, or ZIP must be entered");
      return;
    }

    if (
      (event.eventType === EventType.Birthday && !event.celebrant) ||
      (event.eventType === EventType.Graduation && !event.graduate) ||
      (event.eventType === EventType.Wedding &&
        (!event.brideName || !event.groomName)) ||
      (event.eventType === EventType.Other && !event.host)
    ) {
      Alert.alert("Required fields must be filled based on event type");
      return;
    }

    const startTime24 = formatTimeTo24Hr(event.eventDateTime.startTime);
    const endTime24 = formatTimeTo24Hr(event.eventDateTime.endTime);
    if (startTime24 >= endTime24) {
      Alert.alert("End time must be after start time.");
      return;
    }

    setSubmitting(true);
    try {
      await updateEvent(initialEvent.id, event);
      router.replace("/(tabs)/profile");
    } catch (e: any) {
      Alert.alert(e.message || "Error updating event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView contentContainerStyle={{ paddingTop: 5, flexGrow: 1 }}>
        <View className="w-full flex-1 px-4 my-3">
          {/* Event Type Switcher */}
          <View className="flex-row justify-between ">
            {["Birthday", "Graduation", "Wedding", "Other"].map((type) => (
              <TouchableOpacity
                className="flex-1 h-11 justify-center items-center bg-gray-300 rounded-lg mx-1"
                key={type}
                onPress={() => setEvent({ ...event, eventType: type })}
                style={{
                  backgroundColor:
                    event.eventType === type ? "blue" : "lightgray",
                  borderRadius: 10,
                }}
              >
                <Text
                  className={`text-sm font-normal font-psemibold ${
                    event.eventType === type ? "text-white" : "text-black"
                  }`}
                  ellipsizeMode="tail"
                  style={{
                    fontSize: 10,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                  numberOfLines={1}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Event Title */}
          <FormField
            value={event.eventTitle}
            handleChangeText={(text) =>
              setEvent({ ...event, eventTitle: text })
            }
            placeholder={"Event Title"}
            otherStyles="mt-5"
            autoCapitalize="none"
          />

          {/* Calendar for Event Date */}
          <View>
            <TouchableOpacity
              className="mt-5 border-2 rounded-xl justify-center items-center"
              onPress={() => setIsCalendarVisible(true)}
            >
              <Text className="text-2xl py-3 text-black font-pmedium ">
                {event.eventDateTime.date}
              </Text>
            </TouchableOpacity>

            <Modal
              transparent={true}
              visible={isCalendarVisible}
              animationType="fade"
              onRequestClose={() => setIsCalendarVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    padding: 20,
                    borderRadius: 10,
                  }}
                >
                  <Text className="text-xl font-regular font-psemibold">
                    Select Event Date:
                  </Text>
                  <Calendar
                    markedDates={{
                      [selectedDate]: {
                        selected: true,
                        selectedColor: "blue",
                        selectedTextColor: "white",
                      },
                    }}
                    onDayPress={handleDateSelect}
                    monthFormat={"MMMM yyyy"}
                  />
                  <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                    <Text className="text-red-500">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          {/* Start/End Time */}
          <View className="my-3">
            <TouchableOpacity
              className="flex-row justify-center items-center border-2 rounded-xl"
              onPress={() => setStartPickerVisible(!isStartPickerVisible)}
            >
              <Text className="text-lg my-3">Start Time: </Text>
              <Text className="text-lg my-3">
                {event.eventDateTime.startTime}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between">
            {isStartPickerVisible && (
              <View className="flex-row w-full">
                {/* Hour Picker */}
                <Picker
                  selectedValue={startHour}
                  style={{ width: "30%" }}
                  onValueChange={(itemValue) => {
                    setStartHour(itemValue);
                    setEvent({
                      ...event,
                      eventDateTime: {
                        ...event.eventDateTime,
                        startTime: `${itemValue}:${startMinute} ${startAMPM}`,
                      },
                    });
                  }}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map(
                    (hour) => (
                      <Picker.Item
                        key={hour}
                        label={`${hour}`}
                        value={`${hour}`}
                      />
                    )
                  )}
                </Picker>

                {/* Minute Picker */}
                <Picker
                  selectedValue={startMinute}
                  style={{ width: "30%" }}
                  onValueChange={(itemValue) => {
                    setStartMinute(itemValue);
                    setEvent({
                      ...event,
                      eventDateTime: {
                        ...event.eventDateTime,
                        startTime: `${startHour}:${itemValue} ${startAMPM}`,
                      },
                    });
                  }}
                >
                  {generateMinuteOptions().map((minute) => (
                    <Picker.Item key={minute} label={minute} value={minute} />
                  ))}
                </Picker>

                {/* AM/PM Picker */}
                <Picker
                  selectedValue={startAMPM}
                  style={{ width: "30%" }}
                  onValueChange={(itemValue) => {
                    setStartAMPM(itemValue);
                    setEvent({
                      ...event,
                      eventDateTime: {
                        ...event.eventDateTime,
                        startTime: `${startHour}:${startMinute} ${itemValue}`,
                      },
                    });
                  }}
                >
                  {["AM", "PM"].map((ampm) => (
                    <Picker.Item key={ampm} label={ampm} value={ampm} />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          <View className="">
            <TouchableOpacity
              className="flex-row justify-center items-center border-2 rounded-xl"
              onPress={() => setEndPickerVisible(!isEndPickerVisible)}
            >
              <Text className="text-lg my-3">End Time: </Text>
              <Text className="text-lg my-3">
                {event.eventDateTime.endTime}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between mb-5">
            {isEndPickerVisible && (
              <View className="flex-row w-full">
                {/* Hour Picker */}
                <Picker
                  selectedValue={endHour}
                  style={{ width: "30%" }}
                  onValueChange={(itemValue) => {
                    setEndHour(itemValue);
                    setEvent({
                      ...event,
                      eventDateTime: {
                        ...event.eventDateTime,
                        endTime: `${itemValue}:${endMinute} ${endAMPM}`,
                      },
                    });
                  }}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map(
                    (hour) => (
                      <Picker.Item
                        key={hour}
                        label={`${hour}`}
                        value={`${hour}`}
                      />
                    )
                  )}
                </Picker>

                {/* Minute Picker */}
                <Picker
                  selectedValue={endMinute}
                  style={{ width: "30%" }}
                  onValueChange={(itemValue) => {
                    setEndMinute(itemValue);
                    setEvent({
                      ...event,
                      eventDateTime: {
                        ...event.eventDateTime,
                        endTime: `${endHour}:${itemValue} ${endAMPM}`,
                      },
                    });
                  }}
                >
                  {generateMinuteOptions().map((minute) => (
                    <Picker.Item key={minute} label={minute} value={minute} />
                  ))}
                </Picker>

                {/* AM/PM Picker */}
                <Picker
                  selectedValue={endAMPM}
                  style={{ width: "30%" }}
                  onValueChange={(itemValue) => {
                    setEndAMPM(itemValue);
                    setEvent({
                      ...event,
                      eventDateTime: {
                        ...event.eventDateTime,
                        endTime: `${endHour}:${endMinute} ${itemValue}`,
                      },
                    });
                  }}
                >
                  {["AM", "PM"].map((ampm) => (
                    <Picker.Item key={ampm} label={ampm} value={ampm} />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          {/* Conditional Fields Based on Event Type */}
          {event.eventType === EventType.Birthday && (
            <FormField
              value={event.celebrant}
              handleChangeText={(name) =>
                setEvent({
                  ...event,
                  celebrant: name,
                  graduate: "",
                  brideName: "",
                  groomName: "",
                  host: "",
                })
              }
              placeholder={"Celebrant Name"}
              otherStyles="mb-3"
            />
          )}

          {event.eventType === EventType.Graduation && (
            <FormField
              value={event.graduate}
              handleChangeText={(name) =>
                setEvent({
                  ...event,
                  graduate: name,
                  celebrant: "",
                  brideName: "",
                  groomName: "",
                  host: "",
                })
              }
              placeholder={"Graduate Name"}
              otherStyles="mb-3"
            />
          )}

          {event.eventType === EventType.Wedding && (
            <>
              <FormField
                value={event.brideName}
                handleChangeText={(name) =>
                  setEvent({
                    ...event,
                    brideName: name,
                    celebrant: "",
                    graduate: "",
                    host: "",
                  })
                }
                placeholder={"Bride Name"}
                otherStyles="mb-3"
              />
              <FormField
                value={event.groomName}
                handleChangeText={(name) =>
                  setEvent({
                    ...event,
                    groomName: name,
                    celebrant: "",
                    graduate: "",
                    host: "",
                  })
                }
                placeholder={"Groom Name"}
                otherStyles="mb-3"
              />
            </>
          )}

          {event.eventType === EventType.Other && (
            <FormField
              value={event.host}
              handleChangeText={(name) =>
                setEvent({
                  ...event,
                  host: name,
                  celebrant: "",
                  graduate: "",
                  brideName: "",
                  groomName: "",
                })
              }
              placeholder={"Host Name"}
              otherStyles="mb-3"
            />
          )}

          {/* Number of Guests */}
          <FormField
            value={event.numberOfGuests}
            handleChangeText={(text) =>
              setEvent({ ...event, numberOfGuests: Number(text) })
            }
            placeholder={"Number of guests"}
            otherStyles=""
            keyboardType="numeric"
          />

          {/* Location Fields */}
          <FormField
            title="Location"
            value={event.location.streetAddress}
            handleChangeText={(text) =>
              setEvent({
                ...event,
                location: { ...event.location, streetAddress: text },
              })
            }
            placeholder={"Street Address"}
            otherStyles="mt-7 "
          />
          <FormField
            value={event.location.city}
            handleChangeText={(city) =>
              setEvent({
                ...event,
                location: { ...event.location, city: city },
              })
            }
            placeholder={"City"}
            otherStyles="mt-3"
          />
          <View className="space-y-2 mt-3 ">
            <View
              style={{
                borderRadius: 15,
                borderWidth: 2,
                borderColor: "black",
              }}
            >
              <Picker
                itemStyle={{
                  color: "black",
                  fontSize: 18,
                  height: 150,
                }}
                mode={"dropdown"}
                selectedValue={event.location.state}
                onValueChange={(state: string) =>
                  setEvent({
                    ...event,
                    location: { ...event.location, state: state },
                  })
                }
              >
                {states.map((state) => (
                  <Picker.Item
                    key={state.label}
                    label={state.label}
                    value={state.value}
                  />
                ))}
              </Picker>
            </View>
          </View>
          <FormField
            value={event.location.zip}
            handleChangeText={(zip) =>
              setEvent({
                ...event,
                location: { ...event.location, zip: zip },
              })
            }
            placeholder={"ZIP"}
            otherStyles="mt-3"
            keyboardType="numeric"
          />

          {/* Description */}
          <FormField
            value={event.description}
            handleChangeText={(text) =>
              setEvent({ ...event, description: text })
            }
            placeholder={"Event Description"}
            otherStyles="mt-7"
            textInputStyles="h-40"
          />

          {/* Other Info */}
          <FormField
            value={event.info}
            handleChangeText={(text) => setEvent({ ...event, info: text })}
            placeholder={"Other Helpful Information"}
            otherStyles="mt-7"
            textInputStyles="h-40"
          />

          <RadioGroup
            containerStyle={styles.radioGroup}
            layout="row"
            radioButtons={privacyOptions}
            onPress={(value) => setEvent({ ...event, privacy: Number(value) })}
            selectedId={event.privacy.toString()}
          />

          <CustomButton
            title="Update"
            handlePress={handleUpdate}
            containerStyles=""
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  radioGroup: {
    justifyContent: "space-between",
    marginVertical: 14,
  },
});

export default EditEventPage;
