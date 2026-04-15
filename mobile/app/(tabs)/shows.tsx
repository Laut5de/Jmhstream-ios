import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getShows } from "../../src/api";

const GOLD = "#f5a623";
const DARK = "#0d0d1a";

export default function ShowsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["shows"],
    queryFn: ({ pageParam = 1 }) => getShows(pageParam as number),
    getNextPageParam: (lastPage, pages) => lastPage.length === 24 ? pages.length + 1 : undefined,
    initialPageParam: 1,
  });
  const shows = data?.pages.flat() ?? [];
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>TV Shows</Text>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={GOLD} size="large" /></View>
      ) : (
        <FlatList
          data={shows}
          numColumns={3}
          keyExtractor={i => i.subjectId}
          contentContainerStyle={{ padding: 8 }}
          columnWrapperStyle={{ gap: 6, marginBottom: 6 }}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={GOLD} style={{ margin: 20 }} /> : null}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/movie/${item.subjectId}`)} activeOpacity={0.75}>
              <Image source={{ uri: item.posterUrl }} style={styles.img} contentFit="cover" />
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.grad}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.badge}>SERIES</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { color: "#fff", fontSize: 22, fontWeight: "800", margin: 16 },
  card: { flex: 1, aspectRatio: 2/3, borderRadius: 8, overflow: "hidden", backgroundColor: "#1a1a2e" },
  img: { ...StyleSheet.absoluteFillObject },
  grad: { position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", padding: 6, justifyContent: "flex-end" },
  title: { color: "#fff", fontSize: 11, fontWeight: "600", lineHeight: 14 },
  badge: { color: GOLD, fontSize: 9, fontWeight: "700", marginTop: 2 },
});
