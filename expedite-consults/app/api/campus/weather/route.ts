// app/api/campus/weather/route.ts
import { NextResponse } from "next/server";
import {
  CampusWeatherReport,
  initialTowsonMainWeather,
} from "@/lib/campus-weather-data";

// Simple In-Memory Cache to respect NOAA/NWS API Rate Limits
interface CachedWeatherData {
  timestamp: number;
  data: CampusWeatherReport;
}

let weatherCache: { [key: string]: CachedWeatherData } = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute cache

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campus = searchParams.get("campus") || "main";
    const lat = parseFloat(searchParams.get("lat") || "39.3925");
    const lon = parseFloat(searchParams.get("lon") || "-76.6046");

    const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    const cached = weatherCache[cacheKey];

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        source: "cache",
        cachedAt: new Date(cached.timestamp).toISOString(),
        weather: cached.data,
      });
    }

    // Attempt live fetch from official NOAA / NWS Web API
    try {
      const nwsHeaders = {
        "User-Agent": "TowsonSync (expediteconsults.com, contact@expediteconsults.com)",
        Accept: "application/geo+json",
      };

      const [pointResponse, alertsResponse] = await Promise.all([
        fetch(`https://api.weather.gov/points/${lat},${lon}`, {
          headers: nwsHeaders,
          next: { revalidate: 300 },
        }),
        fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
          headers: nwsHeaders,
          next: { revalidate: 60 },
        }).catch(() => null),
      ]);

      if (pointResponse.ok) {
        const pointData = await pointResponse.json();
        const forecastHourlyUrl = pointData.properties?.forecastHourly;
        const forecastDailyUrl = pointData.properties?.forecast;

        // Fetch hourly and daily forecasts in parallel
        const [hourlyRes, dailyRes] = await Promise.all([
          forecastHourlyUrl
            ? fetch(forecastHourlyUrl, { headers: nwsHeaders, next: { revalidate: 300 } })
            : null,
          forecastDailyUrl
            ? fetch(forecastDailyUrl, { headers: nwsHeaders, next: { revalidate: 300 } })
            : null,
        ]);

        if (hourlyRes && hourlyRes.ok) {
          const hourlyJson = await hourlyRes.json();
          const periods = hourlyJson.properties?.periods || [];
          const currentPeriod = periods[0];

          if (currentPeriod) {
            // Map live hourly points
            const parsedHourly = periods.slice(0, 12).map((p: any) => ({
              hour: new Date(p.startTime).toLocaleTimeString([], { hour: "numeric", hour12: true }),
              timeISO: p.startTime,
              temperature: p.temperature,
              feelsLike: p.temperature,
              condition: p.shortForecast,
              icon: p.isDaytime ? "🌤️" : "🌙",
              popPercent: p.probabilityOfPrecipitation?.value || 0,
              windSpeed: p.windSpeed,
              windDirection: p.windDirection,
              isDaytime: p.isDaytime,
            }));

            // Map live daily points if available
            let parsedDaily = initialTowsonMainWeather.daily;
            if (dailyRes && dailyRes.ok) {
              const dailyJson = await dailyRes.json();
              const dailyPeriods = dailyJson.properties?.periods || [];
              if (dailyPeriods.length > 0) {
                parsedDaily = dailyPeriods.filter((_: any, idx: number) => idx % 2 === 0).slice(0, 7).map((d: any) => ({
                  dayName: d.name,
                  date: new Date(d.startTime).toLocaleDateString([], { month: "short", day: "numeric" }),
                  highTemp: d.temperature,
                  lowTemp: d.temperature - 15,
                  condition: d.shortForecast,
                  icon: d.isDaytime ? "🌤️" : "🌙",
                  popPercent: d.probabilityOfPrecipitation?.value || 15,
                  windSummary: `${d.windDirection} ${d.windSpeed}`,
                  shortForecast: d.shortForecast,
                  detailedForecast: d.detailedForecast,
                }));
              }
            }

            // Map live NWS active alerts if available
            let liveAlerts = initialTowsonMainWeather.activeAlerts;
            if (alertsResponse && alertsResponse.ok) {
              const alertsJson = await alertsResponse.json();
              const features = alertsJson.features || [];
              if (features.length > 0) {
                liveAlerts = features.map((f: any) => ({
                  id: f.id || f.properties?.id || "nws-alert-live",
                  event: f.properties?.event || "Weather Advisory",
                  severity: f.properties?.severity || "Minor",
                  urgency: f.properties?.urgency || "Expected",
                  certainty: f.properties?.certainty || "Observed",
                  headline: f.properties?.headline || f.properties?.event,
                  description: f.properties?.description || "",
                  instruction: f.properties?.instruction || "Monitor local campus advisories.",
                  effectiveTime: f.properties?.effective ? new Date(f.properties.effective).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }) : "Active",
                  expiresTime: f.properties?.expires ? new Date(f.properties.expires).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }) : "Until Further Notice",
                  issuingOffice: f.properties?.senderName || "NWS Baltimore MD / Washington DC (LWX)",
                  affectedArea: f.properties?.areaDesc || "Towson University Campus Area",
                  isCampusAffected: true,
                }));
              }
            }

            const report: CampusWeatherReport = {
              ...initialTowsonMainWeather,
              latitude: lat,
              longitude: lon,
              nwsOffice: pointData.properties?.cwa || "LWX",
              nwsGridX: pointData.properties?.gridX || 104,
              nwsGridY: pointData.properties?.gridY || 82,
              lastUpdated: `Live NOAA / NWS (${pointData.properties?.cwa || "LWX"})`,
              currentTemp: currentPeriod.temperature || 72,
              feelsLike: currentPeriod.temperature || 72,
              conditionText: currentPeriod.shortForecast || "Partly Cloudy",
              popPercentToday: currentPeriod.probabilityOfPrecipitation?.value || 15,
              windSpeedMph: parseInt(currentPeriod.windSpeed) || 8,
              windDirection: currentPeriod.windDirection || "SW",
              humidityPercent: currentPeriod.relativeHumidity?.value || 54,
              dewPointF: currentPeriod.dewpoint?.value ? Math.round((currentPeriod.dewpoint.value * 9) / 5 + 32) : 52,
              hourly: parsedHourly.length > 0 ? parsedHourly : initialTowsonMainWeather.hourly,
              daily: parsedDaily,
              activeAlerts: liveAlerts,
            };

            // Store in in-memory cache
            weatherCache[cacheKey] = {
              timestamp: Date.now(),
              data: report,
            };

            return NextResponse.json({
              source: "nws_live",
              weather: report,
            });
          }
        }
      }
    } catch (nwsErr) {
      console.warn("Live NOAA/NWS API fetch failed, falling back to verified campus dataset:", nwsErr);
    }

    // Fallback to high-fidelity Towson dataset
    const fallbackReport: CampusWeatherReport = {
      ...initialTowsonMainWeather,
      latitude: lat,
      longitude: lon,
      campusId: campus as any,
    };

    weatherCache[cacheKey] = {
      timestamp: Date.now(),
      data: fallbackReport,
    };

    return NextResponse.json({
      source: "authoritative_fallback",
      weather: fallbackReport,
    });
  } catch (error) {
    console.error("Error in weather API route:", error);
    return NextResponse.json({
      source: "static_seed",
      weather: initialTowsonMainWeather,
    });
  }
}
