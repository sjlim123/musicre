/**
 * server/routes/playlist.js
 */
const express = require("express");
const router  = express.Router();
const axios   = require("axios");

// ─────────────────────────────────────────────
// 스포티파이 액세스 토큰 발급
// ─────────────────────────────────────────────
async function getSpotifyToken() {
    const clientId     = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn("⚠️  SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET 없음. Spotify 임베드 생략.");
        return null;
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    try {
        const response = await axios.post(
            "https://accounts.spotify.com/api/token",
            "grant_type=client_credentials",
            {
                headers: {
                    Authorization:  `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        return response.data.access_token;
    } catch (e) {
        console.error("🚨 스포티파이 토큰 에러:", e.message);
        return null;
    }
}

// ─────────────────────────────────────────────
// 스포티파이 트랙 ID 검색
// ─────────────────────────────────────────────
async function searchSpotifyId(title, artist, token) {
    if (!token) return null;
    try {
        const query    = encodeURIComponent(`${title} ${artist}`);
        const response = await axios.get(
            `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const tracks = response.data.tracks.items;
        return tracks.length > 0 ? tracks[0].id : null;
    } catch (e) {
        console.error("🚨 스포티파이 검색 에러:", e.message);
        return null;
    }
}

// ─────────────────────────────────────────────
// Gemini AI 노래 추천
// ─────────────────────────────────────────────
async function getRecommendationsFromGemini(input) {
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY가 .env에 없습니다.");
    apiKey = apiKey.replace(/["']/g, "").trim();

   const prompt = `당신은 감성적인 음악 큐레이터입니다.
사용자의 현재 기분: "${input}"

1) 위 기분에 딱 맞는 따뜻한 위로의 말 1문장을 작성해주세요.
2) 이 기분에 어울리는 노래 5곡을 추천해주세요.
3) 이 기분을 아래 24가지 감정 키워드 중 가장 잘 어울리는 1개로 분류해주세요.
   happy(행복한), joyful(기쁜), excited(신나는), energetic(에너지넘치는),
   sad(슬픈), melancholy(우울한), lonely(외로운), heartbroken(상심한),
   dawn(새벽감성), nostalgic(추억에젖은), calm(차분한), peaceful(평화로운),
   chill(멍때리는), focused(집중하는), love(설레는), romantic(로맨틱한),
   angry(화가나는), frustrated(답답한), anxious(불안한),
   overwhelmed(벅찬/감동적인), rainy(비오는날감성),
   hopeful(희망찬), bittersweet(달콤쌉쌀한), empowered(자신감넘치는)
4) 이 감정의 뉘앙스에 맞는 어두운 계열 헥스 색상 코드 1개(color)를 추천해주세요.

⚠️ 반드시 아래 JSON 형태로만 답하세요. 마크다운 코드블록 없이 순수 JSON만.
{
  "comfortMessage": "위로의 말 1문장",
  "category": "sad",
  "color": "#1a2b3c",
  "songs": [
    { "title": "노래 제목", "artist": "아티스트명", "description": "추천 이유 1문장" }
  ]
}`;

    // ✅ 현재(2026년) 사용 가능한 Gemini 모델 목록 (우선순위 순)
    // gemini-1.5-*, gemini-2.0-* 는 모두 종료됨 → 사용 불가
    const models = [
        "gemini-2.5-flash",      // 안정화 버전, 가장 추천
        "gemini-3.5-flash",      // 최신 플래그십
        "gemini-3.1-flash-lite", // 경량 fallback
    ];

    const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    let response = null;

    for (const model of models) {
        try {
            response = await axios.post(
                `${BASE_URL}${model}:generateContent?key=${apiKey}`,
                { contents: [{ parts: [{ text: prompt }] }] },
                { headers: { "Content-Type": "application/json" } }
            );
            console.log(`🤖 [성공] ${model} 응답 완료`);
            break;
        } catch (e) {
            const status = e.response?.status ?? e.message;
            console.warn(`⚠️  ${model} 실패 (${status}) → 다음 모델 시도`);
        }
    }

    if (!response?.data?.candidates?.length) {
        throw new Error("사용 가능한 Gemini 모델이 없습니다.");
    }

    const parts = response.data.candidates[0]?.content?.parts;
    if (!parts?.length) throw new Error("AI가 응답을 거절했습니다.");

    // JSON 파싱 (마크다운 코드블록 제거 후)
    let cleaned = parts[0].text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    const start = cleaned.indexOf("{");
    const end   = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("AI 응답에서 JSON을 찾을 수 없습니다.");

    return JSON.parse(cleaned.substring(start, end + 1));
}

// ─────────────────────────────────────────────
// POST /api/playlist
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
    const input = (req.body.emotion || req.body.text || "").trim();
    if (!input) return res.status(400).json({ error: "입력값이 없습니다." });

    try {
        console.log(`\n🎧 [요청] "${input}"`);

        const { comfortMessage, category, color, songs } = await getRecommendationsFromGemini(input);
        console.log(`🎯 감정: ${category} | 🎨 색상: ${color}`);

        const spotifyToken = await getSpotifyToken();
        if (spotifyToken) {
            console.log("🎵 Spotify 트랙 ID 검색 중...");
            for (const song of songs) {
                song.spotifyId = await searchSpotifyId(song.title, song.artist, spotifyToken);
            }
        }

        console.log("✅ 완료!\n");
        return res.json({
            emotion: input,
            matched: true,
            comfortMessage,
            category,
            color,
            songs,
            source: "gemini",
        });

    } catch (err) {
        console.error("🚨 에러:", err.message);
        // Gemini 호출 실패 시 하드코딩 fallback
        return res.json({
            emotion: input,
            matched: true,
            comfortMessage: "오늘도 정말 수고 많으셨어요. 당신을 위한 선물입니다 🎧",
            category:       "기본",
            color:          "#1a1a2e",
            songs: [
                { title: "밤편지",       artist: "아이유",   spotifyId: "4Rrt6RkQElZ5u6I5vjM7xY", description: "따뜻하고 포근한 감성의 곡이에요." },
                { title: "Ditto",        artist: "NewJeans", spotifyId: "3r8RuvgaZAdZbxFlHOIu6A", description: "잔잔하게 위로가 되는 곡이에요." },
                { title: "사건의 지평선", artist: "윤하",     spotifyId: "14848uVw6ZOfbLwY0S9L80", description: "깊은 감성의 발라드예요." },
            ],
            source: "fallback",
        });
    }
});

module.exports = router;