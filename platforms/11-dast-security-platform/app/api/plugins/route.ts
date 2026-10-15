import { NextResponse } from "next/server";
import { COMMERCIAL_DEEP_DIVE_PLUGINS } from "@/data/deepDivePlugins";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    totalPlugins: COMMERCIAL_DEEP_DIVE_PLUGINS.length,
    totalEstimatedMinutes1HrMode: COMMERCIAL_DEEP_DIVE_PLUGINS.reduce(
      (sum, p) => sum + p.estimatedMinutes1HrMode,
      0
    ),
    stagesCovered: 8,
    plugins: COMMERCIAL_DEEP_DIVE_PLUGINS,
    timestamp: new Date().toISOString()
  });
}
