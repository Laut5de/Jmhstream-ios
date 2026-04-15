import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getWatchlist, normalizeMovie } from "../../src/api";

const GOLD = "#f5a623";
const DARK = "#0d0d1a";

export default function WatchlistScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data = [], isLoading } = useQuery({ queryKey: ["watchlist"], queryFn: getWatchlist });
  const movies = Array.isArray(data) ? data.map(normalizeMovie) : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>My Watchlist</Text>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={GOLD} size="large" /></View>
      ) : movies.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="bookmark-outline" size={60} color="#333" />
          <Text style={styles.empty}>Your watchlist is empty</Text>
          <Text style={styles.sub}>Add movies & shows to watch later</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          numColumns={3}
          keyExtractor={i => i.subjectId}
          contentContainerStyle={{ padding: 8 }}
          columnWrapperStyle={{ gap: 6, marginBottom: 6 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/movie/${item.subjectId}`)} activeOpacity={0.75}>
              <Image source={{ uri: item.posterUrl }} style={styles.img} contentFit="cover" />
              <View style={styles.overlay}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  header: { color: "#fff", fontSize: 22, fontWeight: "800", margin: 16 },
  empty: { color: "#888", fontSize: 16, marginTop: 12 },
  sub: { color: "#555", fontSize: 13 },
  card: { flex: 1, aspectRatio: 2/3, borderRadius: 8, overflow: "hidden", backgroundColor: "#1a1a2e" },
  img: { ...StyleSheet.absoluteFillObject },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.6)", padding: 6 },
  title: { color: "#fff", fontSize: 11, fontWeight: "600" },
});
