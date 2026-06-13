const express = require("express");
const router  = express.Router();

const WEATHER_MAP = {
    Thunderstorm: "천둥번개", Drizzle: "이슬비", Rain: "비",
    Snow: "눈", Mist: "안개", Smoke: "안개", Haze: "안개",
    Dust: "황사", Fog: "안개", Sand: "황사", Ash: "안개",
    Squall: "강풍", Tornado: "폭풍", Clear: "맑음", Clouds: "흐림"
};

router.get("/", async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: "위도(lat)와 경도(lon) 파라미터가 필요합니다." });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: "날씨 API 키가 설정되지 않았습니다.", weather: "" });
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=kr`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`OpenWeather 응답 오류: ${response.status}`);

        const data       = await response.json();
        const rawWeather = data.weather?.[0]?.main ?? "Clear";
        const weatherKo  = WEATHER_MAP[rawWeather] ?? "맑음";

        return res.json({
            weather:     weatherKo,
            description: data.weather?.[0]?.description ?? "",
            temp:        Math.round(data.main?.temp - 273.15),
            city:        data.name ?? ""
        });
    } catch (err) {
        console.error("[날씨 API 오류]", err.message);
        return res.status(500).json({ error: "날씨 정보를 가져오지 못했습니다.", weather: "" });
    }
});

module.exports = router;
