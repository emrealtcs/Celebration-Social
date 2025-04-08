/* This page defines the tab layout bar at the bottom of the page*/

import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Colors } from "../../constants/Colors"; // Ensure this exists
import { useColorScheme } from "../../hooks/useColorScheme"; // Ensure this exists

import { Ionicons } from "@expo/vector-icons"; // For tab icons

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme ?? "dark"].tabIconDefault,
        tabBarShowLabel: true,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
          borderTopWidth: 0,
          ...Platform.select({
            android: { elevation: 5 },
          }),
        },
      }}
    >
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name={"settings"} size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <Ionicons name={"map"} size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name={"home"} size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="albums"
        options={{
          title: "Albums",
          tabBarIcon: ({ color}: any) => (
            <Ionicons name={"albums"} size={30} color={color} />
          ),
        }

        }
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name={"person"} size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
