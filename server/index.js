/**
 * server/index.js — Express 서버 진입점
 */
require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const path       = require("path");

const playlistRouter = require("./routes/playlist");
const weatherRouter  = require("./routes/weather");

const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// 미들웨어
// ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// 프론트엔드 정적 파일 서빙 (server/ 의 한 단계 위 = 프로젝트 루트)
app.use(express.static(path.join(__dirname, "..")));

// ─────────────────────────────────────────────
// API 라우트
// ─────────────────────────────────────────────
app.use("/api/playlist", playlistRouter);
app.use("/api/weather",  weatherRouter);

// GET /api/emotions — 감정 카테고리 목록 반환
app.get("/api/emotions", (req, res) => {
    res.json({ emotions: ["슬픔", "기쁨", "설렘", "새벽", "분노", "기본"] });
});

// ─────────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log("─────────────────────────────────────");
    console.log(`🎧  TIFY 서버 실행 중 → http://localhost:${PORT}`);
    console.log(`🤖  GEMINI_API_KEY : ${process.env.GEMINI_API_KEY ? "✅ 설정됨" : "❌ 없음 (.env 확인!)"}`);
    console.log(`🎵  SPOTIFY 키     : ${process.env.SPOTIFY_CLIENT_ID ? "✅ 설정됨" : "⚠️  없음 (Spotify 임베드 비활성)"}`);
    console.log(`🌤  WEATHER 키     : ${process.env.OPENWEATHER_API_KEY ? "✅ 설정됨" : "⚠️  없음 (날씨 비활성)"}`);
    console.log("─────────────────────────────────────");
});