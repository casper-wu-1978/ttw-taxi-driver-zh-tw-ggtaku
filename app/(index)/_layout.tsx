
import React from "react";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { Tabs } from "expo-router";
import AuthGuard from "@/components/AuthGuard";

function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "首頁",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? "house.fill" : "house"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "收入",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? "dollarsign.circle.fill" : "dollarsign.circle"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "設定",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? "gearshape.fill" : "gearshape"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function ProtectedTabLayout() {
  return (
    <AuthGuard>
      <TabLayout />
    </AuthGuard>
  );
}
