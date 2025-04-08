import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useLocalSearchParams } from "expo-router";

export default function QRCodePage() {
  const { eventId, hostName } = useLocalSearchParams();

  // Replace with your app's deep link or web URL
  const eventURL = `https://myapp.com/event/${eventId}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event QR Code</Text>
      <QRCode value={eventURL} size={200} />
      <Text style={styles.info}>Host: {hostName}</Text>
      <Text style={styles.details}>Scan to view event details</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginTop: 10,
  },
  details: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
  },
});
