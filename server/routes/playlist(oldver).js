const express = require("express");
const router  = express.Router();
const path    = require("path");
const fs      = require("fs");

const songsPath = path.join(__dirname, "../../data/songs.json");
let emotionMap  = {};

try {
    emotionMap = JSON.parse(fs.readFileSync(songsPath, "utf-8"));
} catch (err) {
    console.error("[playlist] songs.json 로드 실패:", err.message);
}

function getEmotionData(emotion) {
    if (emotionMap[emotion]) return emotionMap[emotion];

    const found = Object.entries(emotionMap).find(([key, val]) => {
        if (["_comment", "_structure", "fallback"].includes(key)) return false;
        return val.keywords?.some(kw => emotion.includes(kw) || kw.includes(emotion));
    });
    if (found) return found[1];

    return emotionMap.fallback;
}

// POST /api/playlist
router.post("/", (req, res) => {
    const { emotion } = req.body;
    if (!emotion || typeof emotion !== "string") {
        return res.status(400).json({ error: "emotion 필드가 필요합니다." });
    }
    const data    = getEmotionData(emotion.trim());
    const matched = !!emotionMap[emotion.trim()];
    return res.json({
        emotion,
        matched,
        comfortMessage: data.comfortMessage ?? "오늘도 음악과 함께해요 🎵",
        songs: data.songs ?? []
    });
});

// GET /api/emotions
router.get("/", (req, res) => {
    const emotions = Object.keys(emotionMap).filter(
        k => !["_comment", "_structure", "fallback"].includes(k)
    );
    return res.json({ emotions });
});

module.exports = router;
