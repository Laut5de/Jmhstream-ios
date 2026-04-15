import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMovieDetail, getRecommendations, normalizeMovie } from "../../src/api";

const { width: W } = Dimensions.get("window");
const GOLD = "#f5a623";
const DARK = "#0d0d1a";

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const { data: movieData, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieDetail(id!),
    enabled: !!id,
  });
  const { data: recs = [] } = useQuery({
    queryKey: ["recs", id],
    queryFn: () => getRecommendations(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={GOLD} size="large" />
      </View>
    );
  }

  const raw = movieData?.data?.subject || movieData?.subject;
  if (!raw) return <View style={styles.center}><Text style={{ color: "#fff" }}>Not found</Text></View>;

  const m = normalizeMovie(raw);
  const resource = movieData?.data?.resource;
  const isTv = raw.subjectType === 2 || m.type === "tv";
  const seasons: any[] = resource?.seasons || [];
  const currentSeason = seasons.find((s: any) => s.se === selectedSeason) || seasons[0];
  const maxEp = currentSeason?.maxEp || 1;
  const episodes = Array.from({ length: maxEp }, (_, i) => i + 1);

  const handlePlay = () => {
    const query = isTv ? `?season=${selectedSeason}&episode=${selectedEpisode}` : "";
    router.push(`/watch/${m.subjectId}${query}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={{ height: insets.top, backgroundColor: DARK }} />
      <TouchableOpacity style={[styles.back, { top: insets.top + 8 }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Banner */}
      <View style={styles.banner}>
        <Image source={{ uri: m.bannerUrl || m.posterUrl }} style={styles.bannerImg} contentFit="cover" />
        <LinearGradient colors={["transparent", DARK]} style={styles.bannerGrad} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{m.title}</Text>
        <View style={styles.metaRow}>
          {m.year && <Text style={styles.meta}>{m.year}</Text>}
          {m.rating && <Text style={styles.rating}>★ {typeof m.rating === "number" ? m.rating.toFixed(1) : m.rating}</Text>}
          {isTv && <Text style={styles.badge}>SERIES</Text>}
          {m.genres.slice(0, 2).map((g: string) => <Text key={g} style={styles.genre}>{g}</Text>)}
        </View>

        {/* Play button */}
        <TouchableOpacity style={styles.playBtn} onPress={handlePlay}>
          <Ionicons name="play" size={22} color="#000" />
          <Text style={styles.playText}>{isTv ? `S${selectedSeason} E${selectedEpisode}` : "Watch Now"}</Text>
        </TouchableOpacity>

        {/* Description */}
        {m.description ? (
          <Text style={styles.desc} numberOfLines={4}>{m.description}</Text>
        ) : null}

        {/* Season/Episode picker for TV */}
        {isTv && seasons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Episodes</Text>
            {seasons.length > 1 && (
              <FlatList
                data={seasons}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={s => String(s.se)}
                contentContainerStyle={{ gap: 8, marginBottom: 12 }}
                renderItem={({ item: s }) => (
                  <TouchableOpacity
                    style={[styles.seasonBtn, s.se === selectedSeason && styles.seasonBtnActive]}
                    onPress={() => { setSelectedSeason(s.se); setSelectedEpisode(1); }}
                  >
                    <Text style={[styles.seasonText, s.se === selectedSeason && styles.seasonTextActive]}>S{s.se}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <FlatList
              data={episodes}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={e => String(e)}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item: ep }) => (
                <TouchableOpacity
                  style={[styles.epBtn, ep === selectedEpisode && styles.epBtnActive]}
                  onPress={() => setSelectedEpisode(ep)}
                >
                  <Text style={[styles.epText, ep === selectedEpisode && styles.epTextActive]}>E{ep}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Recommendations */}
        {recs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>More Like This</Text>
            <FlatList
              data={recs.slice(0, 10)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={r => r.subjectId}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.recCard} onPress={() => router.push(`/movie/${item.subjectId}`)}>
                  <Image source={{ uri: item.posterUrl }} style={styles.recImg} contentFit="cover" />
                  <Text style={styles.recTitle} numberOfLines={2}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  center: { flex: 1, backgroundColor: DARK, alignItems: "center", justifyContent: "center" },
  back: { position: "absolute", left: 16, zIndex: 10, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 8 },
  banner: { width: W, height: W * 0.6, position: "relative" },
  bannerImg: { ...StyleSheet.absoluteFillObject },
  bannerGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: "60%" },
  content: { padding: 16 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 8 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16, alignItems: "center" },
  meta: { color: "#aaa", fontSize: 13 },
  rating: { color: GOLD, fontSize: 13, fontWeight: "700" },
  badge: { color: "#fff", backgroundColor: "#2a2a40", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 11, fontWeight: "700" },
  genre: { color: "#aaa", backgroundColor: "#1a1a2e", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 11 },
  playBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: GOLD, borderRadius: 8, paddingVertical: 14, gap: 8, marginBottom: 16 },
  playText: { color: "#000", fontSize: 16, fontWeight: "800" },
  desc: { color: "#aaa", fontSize: 14, lineHeight: 21, marginBottom: 20 },
  section: { marginTop: 8, marginBottom: 20 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  seasonBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: "#1a1a2e", borderWidth: 1, borderColor: "#2a2a40" },
  seasonBtnActive: { backgroundColor: GOLD, borderColor: GOLD },
  seasonText: { color: "#aaa", fontWeight: "600" },
  seasonTextActive: { color: "#000" },
  epBtn: { width: 48, height: 48, borderRadius: 6, backgroundColor: "#1a1a2e", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#2a2a40" },
  epBtnActive: { backgroundColor: GOLD, borderColor: GOLD },
  epText: { color: "#aaa", fontSize: 12, fontWeight: "600" },
  epTextActive: { color: "#000" },
  recCard: { width: 90 },
  recImg: { width: 90, height: 130, borderRadius: 6, marginBottom: 6 },
  recTitle: { color: "#aaa", fontSize: 10, lineHeight: 13 },
});
