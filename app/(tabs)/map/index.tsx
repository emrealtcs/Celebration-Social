/*
Page to display eventCards
*/

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import EventCard from "../../../components/EventCard";

export default function MapPage() {
  return <View style={styles.container}></View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Light background for visibility
  },
  eventContainer: {
    width: "90%",
    padding: 10,
  },
});
