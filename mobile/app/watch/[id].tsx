import { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { getMovieDetail, getStreamSources } from "../../src/api";

const { width: W, height: H } = Dimensions.get("window");
const GOLD = "#f5a623";
const DARK = "#0d0d1a";

export default function WatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const params = useLocalSearchParams<{ season?: string; episode?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const season = params.season ? Number(params.season) : undefined;
  const episode = params.episode ? Number(params.episode) : undefined;

  const { data: streamData, isLoading, isError } = useQuery({
    queryKey: ["stream", id, season, episode],
    queryFn: () => getStreamSources(id!, season, episode),
    enabled: !!id,
    retry: 2,
  });
  const { data: movieData } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieDetail(id!),
    enabled: !!id,
  });

  const raw = movieData?.data?.subject || movieData?.subject;
  const title = raw?.title || "JMH Stream";
  const processedSources: any[] = streamData?.data?.processedSources || [];
  const downloads: any[] = streamData?.data?.downloads || [];

  const sources = processedSources.length > 0
    ? [...processedSources].sort((a, b) => b.quality - a.quality)
    : [...downloads].sort((a, b) => b.resolution - a.resolution).map(d => ({
        quality: d.resolution,
        proxyUrl: `https://jmhstream.online/api/video-proxy?url=${encodeURIComponent(d.url)}`,
        directUrl: d.url,
      }));

  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentSource = sources[selectedIdx];
  const videoUrl = currentSource?.proxyUrl || currentSource?.directUrl;

  const playerHtml = videoUrl ? `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
        video { width: 100%; height: 100%; object-fit: contain; background: #000; }
      </style>
    </head>
    <body>
      <video controls autoplay playsinline webkit-playsinline>
        <source src="${videoUrl}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </body>
    </html>
  ` : "";

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: "#000" }} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        {season && episode && (
          <Text style={styles.epLabel}>S{season} E{episode}</Text>
        )}
      </View>

      <View style={styles.player}>
        {isLoading && (
          <View style={styles.playerCenter}>
            <ActivityIndicator color={GOLD} size="large" />
            <Text style={styles.loadingText}>Loading stream...</Text>
          </View>
        )}
        {isError && !isLoading && (
          <View style={styles.playerCenter}>
            <Ionicons name="alert-circle" size={50} color="#e74c3c" />
            <Text style={styles.errorText}>Stream unavailable</Text>
            <Text style={styles.errorSub}>This content may not be available yet</Text>
          </View>
        )}
        {!isLoading && !isError && !videoUrl && (
          <View style={styles.playerCenter}>
            <Ionicons name="alert-circle" size={50} color={GOLD} />
            <Text style={styles.errorText}>No stream found</Text>
          </View>
        )}
        {!isLoading && videoUrl && (
          <WebView
            source={{ html: playerHtml }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo
            javaScriptEnabled
          />
        )}
      </View>

      {/* Quality selector */}
      {sources.length > 1 && (
        <View style={styles.qualities}>
          <Text style={styles.qualityLabel}>Quality:</Text>
          {sources.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.qualityBtn, i === selectedIdx && styles.qualityBtnActive]}
              onPress={() => setSelectedIdx(i)}
            >
              <Text style={[styles.qualityText, i === selectedIdx && styles.qualityTextActive]}>
                {s.quality}p
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 12, backgroundColor: "#000" },
  backBtn: { padding: 4 },
  titleText: { flex: 1, color: "#fff", fontSize: 16, fontWeight: "600" },
  epLabel: { color: GOLD, fontSize: 13, fontWeight: "700" },
  player: { width: W, height: W * 9/16, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  webview: { width: W, height: W * 9/16, backgroundColor: "#000" },
  playerCenter: { alignItems: "center", gap: 12 },
  loadingText: { color: "#aaa", fontSize: 14, marginTop: 8 },
  errorText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  errorSub: { color: "#666", fontSize: 13 },
  qualities: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: "#0d0d1a", flexWrap: "wrap" },
  qualityLabel: { color: "#aaa", fontSize: 13 },
  qualityBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: "#1a1a2e", borderWidth: 1, borderColor: "#2a2a40" },
  qualityBtnActive: { backgroundColor: GOLD, borderColor: GOLD },
  qualityText: { color: "#aaa", fontSize: 12, fontWeight: "600" },
  qualityTextActive: { color: "#000" },
});
