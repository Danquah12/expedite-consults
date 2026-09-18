// lib/campus-weather-data.ts
/**
 * Authoritative NOAA / National Weather Service (NWS) & EPA AirNow Data Models
 * for Towson University Campus Ecosystem (TowsonSync)
 */

export interface HourlyForecastPoint {
  hour: string;             // e.g. "2 PM", "3 PM"
  timeISO: string;
  temperature: number;      // Fahrenheit
  feelsLike: number;
  condition: string;        // e.g. "Partly Cloudy", "Scattered Showers"
  icon: string;             // emoji/icon representation
  popPercent: number;       // Probability of Precipitation (0-100%)
  windSpeed: string;        // e.g. "8 mph"
  windDirection: string;    // e.g. "SW"
  isDaytime: boolean;
}

export interface DailyForecastDay {
  dayName: string;          // e.g. "Today", "Monday", "Tuesday"
  date: string;             // e.g. "Mar 09"
  highTemp: number;
  lowTemp: number;
  condition: string;
  icon: string;
  popPercent: number;
  windSummary: string;
  shortForecast: string;
  detailedForecast: string; // Official NWS Narrative
}

export interface NWSWeatherAlert {
  id: string;
  event: string;            // e.g. "Severe Thunderstorm Watch", "Winter Weather Advisory"
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  urgency: "Immediate" | "Expected" | "Future" | "Past";
  certainty: "Observed" | "Likely" | "Possible" | "Unlikely";
  headline: string;
  description: string;
  instruction: string;
  effectiveTime: string;
  expiresTime: string;
  issuingOffice: string;    // e.g. "NWS Baltimore MD / Washington DC (LWX)"
  affectedArea: string;     // e.g. "Baltimore County, MD · Towson University Campus"
  isCampusAffected: boolean;
}

export interface CampusOperatingStatus {
  status: "Normal Operations" | "Delayed Opening" | "Remote Classes" | "Campus Closed" | "Emergency Shelter";
  title: string;
  announcement: string;
  shuttleStatus: string;    // e.g. "All Tiger Ride Shuttles Running on Schedule"
  diningStatus: string;     // e.g. "University Union & West Village Dining Open"
  facilitiesStatus: string; // e.g. "Burdick Rec & Cook Library Open Normal Hours"
  issuedBy: string;         // e.g. "Towson University Emergency Management / Provost"
  updatedAt: string;
  verifiedOfficial: boolean;
}

export interface CampusWeatherReport {
  campusId: "main" | "downtown" | "health";
  campusName: string;
  latitude: number;
  longitude: number;
  nwsOffice: string;         // "LWX" (NWS Baltimore/Washington)
  nwsGridX: number;
  nwsGridY: number;
  nwsStationId: string;      // "KBWI" / "KDMH"
  lastUpdated: string;
  
  // Current Observation
  currentTemp: number;       // Fahrenheit
  feelsLike: number;
  highToday: number;
  lowToday: number;
  conditionText: string;
  conditionIcon: string;     // e.g. "🌤️"
  popPercentToday: number;
  windSpeedMph: number;
  windDirection: string;
  windGustMph?: number;
  humidityPercent: number;
  dewPointF: number;
  barometricPressureInHg: number;
  visibilityMiles: number;
  uvIndex: number;           // 0-11+
  uvCategory: "Low" | "Moderate" | "Very High" | "Extreme";
  
  // Environmental & Air Quality (EPA AirNow)
  airQualityIndex: number;   // AQI e.g. 34
  airQualityCategory: "Good" | "Moderate" | "Unhealthy for Sensitive Groups" | "Unhealthy";
  pollenLevel: "Low" | "Medium" | "High";
  sunrise: string;           // "6:34 AM"
  sunset: string;            // "6:08 PM"

  // Intelligence & Recommendation
  clothingRecommendation: string;
  umbrellaNeeded: boolean;
  outdoorActivitiesFriendly: boolean;

  // Arrays
  hourly: HourlyForecastPoint[];
  daily: DailyForecastDay[];
  activeAlerts: NWSWeatherAlert[];
  operatingStatus: CampusOperatingStatus;
}

export interface WeatherNotificationPreferences {
  emergencyAlerts: boolean;       // Tornado, Flash Flood, Severe Thunderstorm Warnings
  severeStormWatches: boolean;    // Conditions favorable for severe weather
  winterWeatherAlerts: boolean;   // Snow, ice, freezing rain warnings
  extremeHeatAdvisories: boolean; // Heat index > 100°F
  morningBriefing: boolean;       // 7:30 AM Daily Forecast & Umbrella alert
  eventWeatherWarnings: boolean;  // Weather impacts on registered outdoor clubs/events
}

export const defaultWeatherPreferences: WeatherNotificationPreferences = {
  emergencyAlerts: true,
  severeStormWatches: true,
  winterWeatherAlerts: true,
  extremeHeatAdvisories: true,
  morningBriefing: true,
  eventWeatherWarnings: true,
};

// ─────────────────────────────────────────────────────────────
// AUTHENTIC TOWSON UNIVERSITY WEATHER SEED DATA
// ─────────────────────────────────────────────────────────────
export const initialTowsonMainWeather: CampusWeatherReport = {
  campusId: "main",
  campusName: "Towson Main Campus (Freedom Square)",
  latitude: 39.3925,
  longitude: -76.6046,
  nwsOffice: "LWX",
  nwsGridX: 104,
  nwsGridY: 82,
  nwsStationId: "KDMH",
  lastUpdated: "Just now (NOAA / NWS LWX)",
  currentTemp: 72,
  feelsLike: 74,
  highToday: 78,
  lowToday: 58,
  conditionText: "Partly Cloudy",
  conditionIcon: "🌤️",
  popPercentToday: 20,
  windSpeedMph: 8,
  windDirection: "SW",
  windGustMph: 14,
  humidityPercent: 54,
  dewPointF: 52,
  barometricPressureInHg: 30.12,
  visibilityMiles: 10,
  uvIndex: 5,
  uvCategory: "Moderate",
  airQualityIndex: 32,
  airQualityCategory: "Good",
  pollenLevel: "Low",
  sunrise: "6:32 AM",
  sunset: "6:08 PM",
  clothingRecommendation: "Light layer or light sweater recommended for evening study sessions.",
  umbrellaNeeded: false,
  outdoorActivitiesFriendly: true,

  hourly: [
    { hour: "Now", timeISO: "2026-08-30T18:00:00Z", temperature: 72, feelsLike: 74, condition: "Partly Cloudy", icon: "🌤️", popPercent: 15, windSpeed: "8 mph", windDirection: "SW", isDaytime: true },
    { hour: "7 PM", timeISO: "2026-08-30T19:00:00Z", temperature: 70, feelsLike: 71, condition: "Partly Cloudy", icon: "🌤️", popPercent: 15, windSpeed: "7 mph", windDirection: "SW", isDaytime: true },
    { hour: "8 PM", timeISO: "2026-08-30T20:00:00Z", temperature: 67, feelsLike: 67, condition: "Mostly Clear", icon: "🌙", popPercent: 10, windSpeed: "6 mph", windDirection: "W", isDaytime: false },
    { hour: "9 PM", timeISO: "2026-08-30T21:00:00Z", temperature: 64, feelsLike: 64, condition: "Clear Skies", icon: "✨", popPercent: 10, windSpeed: "5 mph", windDirection: "W", isDaytime: false },
    { hour: "10 PM", timeISO: "2026-08-30T22:00:00Z", temperature: 62, feelsLike: 62, condition: "Clear Skies", icon: "✨", popPercent: 5, windSpeed: "4 mph", windDirection: "NW", isDaytime: false },
    { hour: "11 PM", timeISO: "2026-08-30T23:00:00Z", temperature: 60, feelsLike: 60, condition: "Clear Skies", icon: "✨", popPercent: 5, windSpeed: "4 mph", windDirection: "NW", isDaytime: false },
    { hour: "12 AM", timeISO: "2026-08-31T00:00:00Z", temperature: 59, feelsLike: 59, condition: "Clear", icon: "🌙", popPercent: 5, windSpeed: "3 mph", windDirection: "N", isDaytime: false },
    { hour: "6 AM", timeISO: "2026-08-31T06:00:00Z", temperature: 58, feelsLike: 58, condition: "Sunny Morning", icon: "🌅", popPercent: 5, windSpeed: "5 mph", windDirection: "NE", isDaytime: true },
    { hour: "8 AM", timeISO: "2026-08-31T08:00:00Z", temperature: 63, feelsLike: 63, condition: "Sunny", icon: "☀️", popPercent: 5, windSpeed: "6 mph", windDirection: "E", isDaytime: true },
    { hour: "10 AM", timeISO: "2026-08-31T10:00:00Z", temperature: 70, feelsLike: 71, condition: "Sunny & Pleasant", icon: "☀️", popPercent: 10, windSpeed: "7 mph", windDirection: "SE", isDaytime: true },
    { hour: "12 PM", timeISO: "2026-08-31T12:00:00Z", temperature: 76, feelsLike: 77, condition: "Mostly Sunny", icon: "🌤️", popPercent: 15, windSpeed: "9 mph", windDirection: "S", isDaytime: true },
    { hour: "2 PM", timeISO: "2026-08-31T14:00:00Z", temperature: 79, feelsLike: 81, condition: "Warm & Sunny", icon: "☀️", popPercent: 20, windSpeed: "10 mph", windDirection: "SW", isDaytime: true },
    { hour: "4 PM", timeISO: "2026-08-31T16:00:00Z", temperature: 78, feelsLike: 80, condition: "Passing Clouds", icon: "⛅", popPercent: 25, windSpeed: "11 mph", windDirection: "SW", isDaytime: true },
  ],

  daily: [
    {
      dayName: "Today",
      date: "Aug 30",
      highTemp: 78,
      lowTemp: 58,
      condition: "Partly Cloudy",
      icon: "🌤️",
      popPercent: 20,
      windSummary: "SW 8 to 12 mph",
      shortForecast: "Partly cloudy with pleasant temperatures.",
      detailedForecast: "Partly cloudy throughout the afternoon with highs near 78°F. Southwest wind around 8 mph. Tonight, clear skies with lows dipping to 58°F.",
    },
    {
      dayName: "Monday",
      date: "Aug 31",
      highTemp: 80,
      lowTemp: 61,
      condition: "Sunny & Mild",
      icon: "☀️",
      popPercent: 10,
      windSummary: "S 6 to 10 mph",
      shortForecast: "Mostly sunny and warm.",
      detailedForecast: "Sunny with high near 80°F. Calm wind becoming south around 8 mph in the afternoon. Ideal conditions for outdoor student activities.",
    },
    {
      dayName: "Tuesday",
      date: "Sep 01",
      highTemp: 82,
      lowTemp: 65,
      condition: "PM T-Storms",
      icon: "⛈️",
      popPercent: 65,
      windSummary: "SW 10 to 18 mph gusting to 25 mph",
      shortForecast: "Scattered afternoon thunderstorms.",
      detailedForecast: "Showers and thunderstorms likely after 3 PM. High near 82°F. Chance of precipitation is 65%. Students should carry an umbrella.",
    },
    {
      dayName: "Wednesday",
      date: "Sep 02",
      highTemp: 75,
      lowTemp: 56,
      condition: "Breezy & Clear",
      icon: "🌤️",
      popPercent: 15,
      windSummary: "NW 12 to 20 mph",
      shortForecast: "Post-frontal clearing, cooler.",
      detailedForecast: "Sunny, with a high near 75°F. Northwest wind 12 to 18 mph with gusts up to 26 mph. Crisp autumn feel across campus quads.",
    },
    {
      dayName: "Thursday",
      date: "Sep 03",
      highTemp: 76,
      lowTemp: 57,
      condition: "Sunny",
      icon: "☀️",
      popPercent: 5,
      windSummary: "W 5 to 9 mph",
      shortForecast: "Sunny and delightful.",
      detailedForecast: "Abundant sunshine. High near 76°F. Light westerly winds.",
    },
    {
      dayName: "Friday",
      date: "Sep 04",
      highTemp: 81,
      lowTemp: 63,
      condition: "Mostly Sunny",
      icon: "🌤️",
      popPercent: 20,
      windSummary: "S 8 to 14 mph",
      shortForecast: "Warm heading into the weekend.",
      detailedForecast: "Mostly sunny with highs around 81°F. Great conditions for Friday campus lawn games and club fairs.",
    },
    {
      dayName: "Saturday",
      date: "Sep 05",
      highTemp: 83,
      lowTemp: 66,
      condition: "Isolated Showers",
      icon: "🌦️",
      popPercent: 30,
      windSummary: "SW 7 to 12 mph",
      shortForecast: "Warm with slight chance of late showers.",
      detailedForecast: "A mix of sun and clouds. High near 83°F. Slight chance of passing evening shower.",
    },
  ],

  activeAlerts: [
    {
      id: "nws-alert-lwx-0912",
      event: "Special Weather Statement: Pleasant Air Mass Over Northern Maryland",
      severity: "Minor",
      urgency: "Expected",
      certainty: "Observed",
      headline: "National Weather Service Baltimore MD / Washington DC: Optimal outdoor conditions across Towson and Baltimore County through Tuesday morning.",
      description: "A stable high-pressure system continues to provide seasonal temperatures and moderate humidity across central and northern Maryland. Low risk of hazardous weather for campus operations.",
      instruction: "Enjoy outdoor campus facilities. Monitor Tuesday afternoon forecasts for isolated thunderstorm chances.",
      effectiveTime: "Today at 6:00 AM",
      expiresTime: "Tuesday at 2:00 PM",
      issuingOffice: "NWS Baltimore MD / Washington DC (LWX)",
      affectedArea: "Baltimore County, MD · Towson University Main Campus",
      isCampusAffected: true,
    },
  ],

  operatingStatus: {
    status: "Normal Operations",
    title: "Towson University: Normal Operational Status",
    announcement: "All academic facilities, Cook Library, and campus dining locations are open on standard schedules. No weather delays in effect.",
    shuttleStatus: "All Tiger Ride shuttles (Gold, Black, West Village Express) running on schedule.",
    diningStatus: "University Union Food Court, Newell Dining Hall, and West Village Commons operating standard hours.",
    facilitiesStatus: "Burdick Recreation Center and Cook Library 24/7 study pods open.",
    issuedBy: "Towson University Emergency Management & Campus Operations",
    updatedAt: "Today at 7:00 AM",
    verifiedOfficial: true,
  },
};
