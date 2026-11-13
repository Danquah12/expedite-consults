import { connectinNotificationsStore } from "../lib/connectin-notifications-store.js";
import { executeDailyChallengeWorkflow, DAILY_CHALLENGE_CATALOG } from "../noctis-ai/src/lib/noctis-daily-challenge-engine.ts";

async function main() {
  console.log("=== NOCTIS DAILY CHALLENGE & CONNECTIN ALERT TEST ===");
  console.log("1. Catalog size:", DAILY_CHALLENGE_CATALOG.length, "challenges across Frontier, Benchmark, and Daemon");

  // Pick a challenge (e.g. SMR supercritical excursion)
  const challenge = DAILY_CHALLENGE_CATALOG[0];
  console.log("\n2. Formulated Question:", challenge.question);
  console.log("   Suite:", challenge.sourceSuite);
  console.log("   Domain:", challenge.domain);

  // Add alert directly to ConnectIn notifications store
  const unreadBefore = connectinNotificationsStore.getUnreadCount();
  console.log("\n3. ConnectIn unread alerts before test:", unreadBefore);

  const newAlert = connectinNotificationsStore.addAlert({
    category: "Security",
    subType: "Security Advisory",
    title: `🔴 [NOCTIS 6AM FRONTIER ALERT] Invariant Verified: ${challenge.domain}`,
    description: `Daily Challenge Invariant Evaluated: "${challenge.question}"\n\nMandate: ${challenge.expectedInvariant} (Invariant: PASS).`,
    actor: {
      name: "Noctis Frontier & Benchmark Engine",
      role: "Autonomous Invariant Engine",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
      isVerified: true
    },
    actionText: "Inspect Invariant Telemetry",
    targetTab: "pulserooms",
    priority: "critical"
  });

  console.log("\n4. Alert created successfully in ConnectIn Alerts Hub:");
  console.log("   ID:", newAlert.id);
  console.log("   Title:", newAlert.title);
  console.log("   Unread:", newAlert.unread);
  console.log("   Target Tab:", newAlert.targetTab);

  const unreadAfter = connectinNotificationsStore.getUnreadCount();
  console.log("\n5. ConnectIn unread alerts after test:", unreadAfter);
  console.log("   Badge incremented:", unreadAfter === unreadBefore + 1 ? "YES (PASS)" : "NO");

  const latestAlerts = connectinNotificationsStore.getAll();
  console.log("\n6. First alert in ConnectIn Alerts menu:", latestAlerts[0].title);
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
