import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, Dimensions, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getHome } from "../../src/api";

const { width: W, height: H } = Dimensions.get("window");
const GOLD = "#f5a623";
const DARK = "#0d0d1a";
const CARD_W = 110;
const CARD_H = 160;

function MovieCard({ item, onPress }: { item: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.75}>
      <Image source={{ uri: item.posterUrl }} style={styles.cardImg} contentFit="cover" />
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={styles.cardGrad}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function HeroBanner({ movies }: { movies: any[] }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  if (!movies.length) return null;
  const m = movies[idx];
  return (
    <View style={styles.hero}>
      <Image source={{ uri: m.bannerUrl || m.posterUrl }} style={styles.heroImg} contentFit="cover" />
      <LinearGradient colors={["transparent", "rgba(13,13,26,0.7)", DARK]} style={styles.heroGrad}>
        <Text style={styles.heroTitle} numberOfLines={2}>{m.title}</Text>
        <View style={styles.heroMeta}>
          {m.year && <Text style={styles.metaText}>{m.year}</Text>}
          {m.rating && <Text style={styles.ratingText}>★ {typeof m.rating === "number" ? m.rating.toFixed(1) : m.rating}</Text>}
          {m.type === "tv" && <Text style={styles.typeBadge}>SERIES</Text>}
        </View>
        <View style={styles.heroButtons}>
          <TouchableOpacity style={styles.playBtn} onPress={() => router.push(`/watch/${m.subjectId}`)}>
            <Ionicons name="play" size={18} color="#000" />
            <Text style={styles.playBtnText}>Watch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoBtn} onPress={() => router.push(`/movie/${m.subjectId}`)}>
            <Ionicons name="information-circle-outline" size={18} color="#fff" />
            <Text style={styles.infoBtnText}>Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroDots}>
          {movies.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setIdx(i)}>
              <View style={[styles.dot, i === idx && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

function MovieRow({ title, movies }: { title: string; movies: any[] }) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{title}</Text>
      <FlatList
        data={movies}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.subjectId}
        renderItem={({ item }) => (
          <MovieCard item={item} onPress={() => router.push(`/movie/${item.subjectId}`)} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      />
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useQuery({ queryKey: ["home"], queryFn: getHome });

  if (isLoading || !data) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={{ color: GOLD, fontSize: 22, fontWeight: "700" }}>JMH STREAM</Text>
        <Text style={{ color: "#666", marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={{ height: insets.top, backgroundColor: DARK }} />
      <View style={styles.header}>
        <Text style={styles.logo}>JMH STREAM</Text>
      </View>
      <HeroBanner movies={data.heroMovies} />
      {data.sections.map((s, i) => (
        <MovieRow key={i} title={s.title} movies={s.movies} />
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  center: { flex: 1, backgroundColor: DARK, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 16, paddingVertical: 8 },
  logo: { color: GOLD, fontSize: 22, fontWeight: "900", letterSpacing: 2 },
  hero: { width: W, height: H * 0.55, position: "relative" },
  heroImg: { ...StyleSheet.absoluteFillObject },
  heroGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: "80%", padding: 16, justifyContent: "flex-end" },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 6, textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  metaText: { color: "#aaa", fontSize: 13 },
  ratingText: { color: GOLD, fontSize: 13, fontWeight: "700" },
  typeBadge: { color: "#fff", backgroundColor: "#333", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 11, fontWeight: "700" },
  heroButtons: { flexDirection: "row", gap: 10, marginBottom: 16 },
  playBtn: { flexDirection: "row", alignItems: "center", backgroundColor: GOLD, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, gap: 6 },
  playBtnText: { color: "#000", fontWeight: "700", fontSize: 15 },
  infoBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, gap: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  infoBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  heroDots: { flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)" },
  dotActive: { backgroundColor: GOLD, width: 18 },
  row: { marginTop: 24 },
  rowTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginLeft: 16, marginBottom: 10 },
  card: { width: CARD_W, height: CARD_H, borderRadius: 8, overflow: "hidden", backgroundColor: "#1a1a2e" },
  cardImg: { ...StyleSheet.absoluteFillObject },
  cardGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", padding: 6, justifyContent: "flex-end" },
  cardTitle: { color: "#fff", fontSize: 11, fontWeight: "600", lineHeight: 14 },
});
