import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const GOLD = "#f5a623";
const DARK = "#0d0d1a";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: DARK, borderTopColor: "#1a1a2e", borderTopWidth: 1, height: 88, paddingBottom: 28, paddingTop: 8 },
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: "#666",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="movies" options={{ title: "Movies", tabBarIcon: ({ color, size }) => <Ionicons name="film" size={size} color={color} /> }} />
      <Tabs.Screen name="shows" options={{ title: "Shows", tabBarIcon: ({ color, size }) => <Ionicons name="tv" size={size} color={color} /> }} />
      <Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} /> }} />
      <Tabs.Screen name="watchlist" options={{ title: "Watchlist", tabBarIcon: ({ color, size }) => <Ionicons name="bookmark" size={size} color={color} /> }} />
    </Tabs>
  );
}
