import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } } });

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0d0d1a" } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="movie/[id]" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="watch/[id]" options={{ animation: "fade", presentation: "fullScreenModal" }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
