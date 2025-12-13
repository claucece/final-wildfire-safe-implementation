import "@/global.css";

import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";

import Colors from "@/constants/Colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey,
        tabBarStyle: {
          backgroundColor: Colors.secondary,
          height: Platform.OS === "ios" ? 80 : 60,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          borderTopWidth: 0,
        },
        tabBarAccessibilityLabel: "Bottom navigation bar",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Prepare",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="checklist" size={22} color={color} />
          ),
          tabBarTestID: "tab-prepare",
        }}
      />

      <Tabs.Screen
        name="test"
        options={{
          title: "Test",
          tabBarLabel: "Test",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="health-and-safety" size={22} color={color} />
          ),
          tabBarTestID: "tab-test",
        }}
      />

      <Tabs.Screen
        name="resources"
        options={{
          tabBarLabel: "Resources",
          tabBarIcon: ({ color }) => (
            <Entypo name="open-book" size={22} color={color} />
          ),
          tabBarTestID: "tab-resources",
        }}
      />

      <Tabs.Screen
        name="recommendations"
        options={{
          tabBarLabel: "For You",
          tabBarIcon: ({ color }) => (
            <Entypo name="star" size={22} color={color} />
          ),
          tabBarTestID: "tab-recommendations",
        }}
      />
    </Tabs>
  );
}
