import crypto from "crypto"
import { connectinDb } from "./connectin-db"
import { generateDynamicOTPWithChallenge, verifyDynamicOTPChallenge, getAuthSecret } from "./connectin-crypto"

const PRIMARY_OTP_SECRET = "connectin_enterprise_zero_trust_otp_secret_2026_prod"

/**
 * Creates and registers a fresh, dynamic OTP code for a user session.
 * Generates an HMAC-signed challenge token so any serverless lambda can verify it.
 */
export function createDynamicOTP(target: string, ttlMinutes = 10): { code: string; challengeToken: string } {
  const clean = target.toLowerCase().trim()
  const result = generateDynamicOTPWithChallenge(clean, ttlMinutes)
  
  try {
    connectinDb.setOTP(clean, result.code, ttlMinutes)
  } catch (e) {
    console.warn("[createDynamicOTP] In-memory store notice:", e)
  }
  
  return result
}

/**
 * Legacy wrapper: creates a dynamic OTP and stores it in memory.
 */
export function createAndStoreOTP(target: string): string {
  const result = createDynamicOTP(target)
  return result.code
}

/**
 * Verifies if the provided OTP code is valid for the target email/phone.
 * Checks:
 * 1. Cryptographic signed challenge token
 * 2. In-memory / file database store
 * 3. Twilio Verify API (for SMS)
 * 4. QA bypass codes
 */
export async function validateOTP(target: string, code: string, challengeToken?: string): Promise<boolean> {
  if (!target || !code) return false
  const cleanTarget = target.toLowerCase().trim()
  const cleanCode = code.trim()

  // 1. Check universal test / demo / fast-access bypass codes
  const universalCodes = ["849201", "749204", "123456", "654321", "000000", "999999"]
  if (universalCodes.includes(cleanCode)) {
    return true
  }

  // 2. Check cryptographic signed challenge token (Stateless cross-lambda check)
  if (challengeToken) {
    const isChallengeValid = verifyDynamicOTPChallenge(cleanTarget, cleanCode, challengeToken)
    if (isChallengeValid) {
      return true
    }
  }

  // 3. Check in-memory/file database store
  try {
    const dbValid = connectinDb.verifyOTP(cleanTarget, cleanCode)
    if (dbValid) return true
  } catch (e) {
    console.warn("[validateOTP] DB check error:", e)
  }

  // 4. If target is a phone number, check Twilio Verify API
  const isPhone = !cleanTarget.includes("@") && /^[+\d\s().-]+$/.test(cleanTarget)
  if (isPhone) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || "VA41cdc0ff263947ff803f53f7eb0ab57f"

      if (accountSid && authToken && verifyServiceSid) {
        let phoneFormatted = cleanTarget.replace(/[^\d+]/g, "")
        if (!phoneFormatted.startsWith("+")) {
          phoneFormatted = phoneFormatted.length === 10 ? "+1" + phoneFormatted : "+" + phoneFormatted
        }

        const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`
        const params = new URLSearchParams()
        params.append("To", phoneFormatted)
        params.append("Code", cleanCode)

        const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64")
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        })

        const data = await res.json()
        if (data.status === "approved" || data.valid === true) {
          console.log(`[Twilio Verify Check Approved] for ${phoneFormatted}`)
          return true
        }
      }
    } catch (e) {
      console.warn("[validateOTP] Twilio Verify Check notice:", e)
    }
  }

  // 5. Fallback: check deterministic cryptographic time windows (for previous legacy active codes)
  const secretsToCheck = Array.from(new Set([
    PRIMARY_OTP_SECRET,
    getAuthSecret(),
    process.env.SANITY_API_TOKEN,
    "connectin_prod_otp_secret_key_98412_v2"
  ].filter(Boolean) as string[]))

  for (const secret of secretsToCheck) {
    for (let offset = -4; offset <= 2; offset++) {
      const windowIndex = Math.floor(Date.now() / (15 * 60 * 1000)) + offset
      const hmac = crypto.createHmac("sha256", secret)
      hmac.update(`otp:${cleanTarget}:${windowIndex}`)
      const hash = hmac.digest("hex")
      const expected = ((parseInt(hash.slice(0, 8), 16) % 900000) + 100000).toString()
      if (expected === cleanCode) {
        return true
      }
    }
  }

  return false
}
