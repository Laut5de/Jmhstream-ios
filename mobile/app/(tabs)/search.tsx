import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { searchContent } from "../../src/api";

const GOLD = "#f5a623";
const DARK = "#0d0d1a";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["search", submitted],
    queryFn: () => searchContent(submitted),
    enabled: submitted.length > 1,
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Search</Text>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setSubmitted(query)}
          placeholder="Movies, shows, actors..."
          placeholderTextColor="#555"
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(""); setSubmitted(""); }}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {isLoading && <ActivityIndicator color={GOLD} style={{ marginTop: 40 }} />}
      {!isLoading && submitted && data.length === 0 && (
        <Text style={styles.empty}>No results for "{submitted}"</Text>
      )}
      <FlatList
        data={data}
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
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  header: { color: "#fff", fontSize: 22, fontWeight: "800", margin: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#1a1a2e", borderRadius: 10, marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 10, borderWidth: 1, borderColor: "#2a2a40", marginBottom: 12 },
  input: { flex: 1, color: "#fff", fontSize: 16 },
  empty: { color: "#666", textAlign: "center", marginTop: 40, fontSize: 15 },
  card: { flex: 1, aspectRatio: 2/3, borderRadius: 8, overflow: "hidden", backgroundColor: "#1a1a2e" },
  img: { ...StyleSheet.absoluteFillObject },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.6)", padding: 6 },
  title: { color: "#fff", fontSize: 11, fontWeight: "600" },
});
