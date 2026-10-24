function placeName(question: string) {
  const hit = question.match(/\b(?:in|for|at|of|near)\s+([A-Za-z][A-Za-z .'-]{2,40})/);
  return hit?.[1]?.replace(/[?.!].*$/, "").trim() || "";
}

async function locate(name: string) {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: { name?: string; latitude?: number; longitude?: number; country?: string }[] };
  const row = data.results?.[0];
  if (!row || row.latitude == null || row.longitude == null) return null;
  return row;
}

async function weather(question: string) {
  const name = placeName(question);
  if (!name) return "Weather: no place was named, so the forecast is UNKNOWN.";
  const spot = await locate(name);
  if (!spot) return `Weather: ${name} was not found, so the forecast is UNKNOWN.`;
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${spot.latitude}&longitude=${spot.longitude}&current=temperature_2m,wind_speed_10m`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return "Weather: the forecast service did not answer. The weather is UNKNOWN.";
  const data = (await res.json()) as { current?: { temperature_2m?: number; wind_speed_10m?: number } };
  const temp = data.current?.temperature_2m;
  const wind = data.current?.wind_speed_10m;
  if (temp == null) return "Weather: no temperature was returned. UNKNOWN.";
  return `Weather retrieved for ${spot.name}, ${spot.country}. Temperature ${temp} °C. Wind ${wind ?? "not returned"} km/h. Source: Open-Meteo. This is a current reading, not a climate normal.`;
}

async function mapOf(question: string) {
  const name = placeName(question);
  if (!name) return "Map: no place was named, so no map was opened.";
  const spot = await locate(name);
  if (!spot) return `Map: ${name} was not found, so no map was opened.`;
  return `Map retrieved for ${spot.name}, ${spot.country}. OpenStreetMap: https://www.openstreetmap.org/?mlat=${spot.latitude}&mlon=${spot.longitude}#map=11/${spot.latitude}/${spot.longitude}. Latitude ${spot.latitude}, longitude ${spot.longitude}.`;
}

async function papers(question: string) {
  const query = question.replace(/\b(find|show|a|an|the|paper|papers|journal|preprint|arxiv|on|about|of)\b/gi, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  if (query.length < 3) return "Journal search: the topic was too short, so no paper was opened.";
  const res = await fetch(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=2`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return "Journal search: arXiv did not answer. No paper was opened.";
  const xml = await res.text();
  const titles = [...xml.matchAll(/<title>([^<]+)<\/title>/g)].map((hit) => hit[1].replace(/\s+/g, " ").trim()).filter((title) => !/arxiv query/i.test(title)).slice(0, 2);
  if (!titles.length) return "Journal search: arXiv returned no paper for that topic.";
  return titles.map((title) => `arXiv — ${title}`).join("\n");
}

async function rate(question: string) {
  const codes = [...question.toUpperCase().matchAll(/\b(USD|EUR|GBP|GHS|NGN|JPY|CAD)\b/g)].map((hit) => hit[1]);
  const pair = [...new Set(codes)];
  if (pair.length < 2) return "Price: no currency pair was named. A stock or commodity price was not retrieved.";
  const res = await fetch(`https://api.frankfurter.app/latest?from=${pair[0]}&to=${pair[1]}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return "Price: the exchange-rate service did not answer. The rate is UNKNOWN.";
  const data = (await res.json()) as { date?: string; rates?: Record<string, number> };
  const value = data.rates?.[pair[1]];
  if (value == null) return "Price: the rate was not in the response. UNKNOWN.";
  return `Price retrieved ${data.date || "today"}: 1 ${pair[0]} = ${value} ${pair[1]}. Source: Frankfurter. This is an exchange rate, not a stock price.`;
}

export async function outsideFacts(question: string) {
  const jobs: Promise<string>[] = [];
  if (/\b(weather|temperature|rain|wind)\b/i.test(question)) jobs.push(weather(question).catch(() => "Weather: the forecast service did not answer."));
  if (/\b(map of|where is|located)\b/i.test(question)) jobs.push(mapOf(question).catch(() => "Map: the place service did not answer."));
  if (/\b(arxiv|journal|preprint|research paper)\b/i.test(question)) jobs.push(papers(question).catch(() => "Journal search: arXiv did not answer."));
  if (/\b(exchange rate|currency|price of)\b/i.test(question) || /\b(USD|EUR|GBP)\b/.test(question)) jobs.push(rate(question).catch(() => "Price: the rate service did not answer."));
  if (!jobs.length) return "";
  const rows = await Promise.all(jobs);
  return rows.filter(Boolean).join("\n\n");
}
