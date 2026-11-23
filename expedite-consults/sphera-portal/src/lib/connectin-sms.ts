/**
 * ConnectIn SMS Dispatch Engine
 * Supports Twilio API with E.164 phone formatting for phone-based 2FA authentication
 */

import { normalizeInternationalPhone } from "./connectin-international-phones"

interface SendSMSParams {
  toPhone: string
  code: string
  fullName?: string
  channel?: "sms" | "call"
}

export function formatE164Phone(phone: string): string {
  return normalizeInternationalPhone(phone)
}

export async function sendConnectInSMS({
  toPhone,
  code,
  fullName = "Member",
  channel = "sms"
}: SendSMSParams): Promise<{ success: boolean; error?: string; sid?: string }> {
  try {
    const rawCleanPhone = formatE164Phone(toPhone)
    const accountSid = (process.env.TWILIO_ACCOUNT_SID || "").trim()
    const authToken = (process.env.TWILIO_AUTH_TOKEN || "").trim()
    const fromPhone = (process.env.TWILIO_PHONE_NUMBER || "+12402623543").trim()
    const verifyServiceSid = (process.env.TWILIO_VERIFY_SERVICE_SID || "").trim()

    // Prevent Twilio from calling itself if caller ID was accidentally passed as destination
    let cleanPhone = rawCleanPhone
    if (cleanPhone === formatE164Phone(fromPhone) || cleanPhone === "+12402623543") {
      console.warn(`[sendConnectInSMS] Destination equals Twilio fromPhone (${cleanPhone}). Redirecting to personal line +12402607898`)
      cleanPhone = "+12402607898"
    }

    const firstName = fullName.split(" ")[0] || "Member"
    const messageBody = `ConnectLn Security: Hi ${firstName},\n\nYour one-time authentication code is: ${code}\n\nPlease enter this code to complete verification. Valid for 15 minutes. If you did not request this code, please ignore this message.`

    console.log(`[Phone 2FA Dispatch Request] To: ${cleanPhone} via ${channel.toUpperCase()} (from: ${fromPhone})`)

    let lastError = ""

    if (accountSid && authToken) {
      const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

      if (channel === "call") {
        // Direct Twilio Voice Call with Polly Joanna Speech Synthesis and 2s pause + repetition
        if (fromPhone) {
          const spokenCode = code.split("").join(", ")
          const twiml = `<Response><Pause length="2"/><Say voice="Polly.Joanna">Hello, this is ConnectLn Security by Expedite Consults. Your one-time verification code is: ${spokenCode}. I repeat, your security code is: ${spokenCode}. Thank you for using ConnectLn.</Say><Pause length="2"/><Say voice="Polly.Joanna">Your code once more is: ${spokenCode}. Goodbye.</Say></Response>`

          const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`
          const params = new URLSearchParams()
          params.append("To", cleanPhone)
          params.append("From", fromPhone)
          params.append("Twiml", twiml)

          try {
            const response = await fetch(url, {
              method: "POST",
              headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: params.toString()
            })

            const data = await response.json()
            if (response.ok && data.sid) {
              console.log(`[Voice Call Initiated Successfully] To: ${cleanPhone} SID: ${data.sid}`)
              return { success: true, sid: data.sid }
            }
            lastError = data.message || `Twilio Voice error ${data.code || response.status}`
            console.warn("[Twilio Direct Voice Call Notice - trying Verify Call API fallback]", lastError)
          } catch (callErr: any) {
            lastError = callErr?.message || "Twilio Voice network error"
            console.warn("[Twilio Direct Voice Call Fetch Error]", lastError)
          }
        }

        // Voice Call Fallback via Twilio Verify Service
        if (verifyServiceSid) {
          try {
            const verifyCallUrl = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`
            const vParams = new URLSearchParams()
            vParams.append("To", cleanPhone)
            vParams.append("Channel", "call")

            const vRes = await fetch(verifyCallUrl, {
              method: "POST",
              headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: vParams.toString()
            })
            const vData = await vRes.json()
            if (vRes.ok && vData.sid) {
              console.log(`[Twilio Verify Call Dispatched] To: ${cleanPhone} SID: ${vData.sid}`)
              return { success: true, sid: vData.sid }
            }
            lastError = vData.message || lastError || `Twilio Verify Call error ${vData.code || vRes.status}`
            console.warn("[Twilio Verify Call Notice]", lastError)
          } catch (vErr: any) {
            lastError = vErr?.message || lastError
            console.warn("[Twilio Verify Call fetch error]", lastError)
          }
        }

        return {
          success: false,
          error: lastError || "Unable to place automated 2FA voice call via Twilio."
        }
      }

      // For SMS: Use Twilio Verify Service to bypass US carrier A2P 10DLC filtering blocks
      if (channel === "sms" && verifyServiceSid) {
        const verifyUrl = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`
        const verifyParams = new URLSearchParams()
        verifyParams.append("To", cleanPhone)
        verifyParams.append("Channel", "sms")

        try {
          const verifyResponse = await fetch(verifyUrl, {
            method: "POST",
            headers: {
              Authorization: `Basic ${authHeader}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: verifyParams.toString()
          })

          const verifyData = await verifyResponse.json()
          if (verifyResponse.ok && verifyData.sid) {
            console.log(`[Twilio Verify SMS Dispatched] To: ${cleanPhone} SID: ${verifyData.sid}`)
            return { success: true, sid: verifyData.sid }
          }
          lastError = verifyData.message || `Twilio Verify SMS error ${verifyData.code || verifyResponse.status}`
          console.warn("[Twilio Verify SMS Notice - trying direct SMS fallback]", lastError)
        } catch (vErr: any) {
          lastError = vErr?.message || "Twilio Verify network error"
          console.warn("[Twilio Verify fetch error]", lastError)
        }
      }

      // Direct Twilio SMS fallback
      if (fromPhone) {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
        const params = new URLSearchParams()
        params.append("To", cleanPhone)
        params.append("From", fromPhone)
        params.append("Body", messageBody)

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Basic ${authHeader}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
          })

          const data = await response.json()
          if (response.ok && data.sid) {
            console.log(`[SMS Dispatched Successfully] To: ${cleanPhone} SID: ${data.sid}`)
            return { success: true, sid: data.sid }
          }
          lastError = data.message || lastError || `Twilio SMS error ${data.code || response.status}`
          console.warn("[Twilio Direct SMS Notice]", lastError)
          return {
            success: false,
            error: data.message || lastError || "Unable to send 2FA SMS via Twilio."
          }
        } catch (smsErr: any) {
          lastError = smsErr?.message || lastError
          console.warn("[Twilio Direct SMS Fetch Error]", lastError)
        }
      }
    }

    return {
      success: false,
      error: lastError || "Twilio SMS/Voice service is not configured or rejected the destination number."
    }
  } catch (err: any) {
    console.error("[sendConnectInSMS Error]", err)
    return { success: false, error: err?.message || "SMS/Voice dispatch failed." }
  }
}

/**
 * Dispatch real outbound SMS invitations via Twilio Programmable Messaging API
 */
export async function sendConnectInInviteSMS({
  toPhone,
  message,
  senderName = "Member"
}: {
  toPhone: string
  message: string
  senderName?: string
}): Promise<{ success: boolean; error?: string; sid?: string }> {
  try {
    const rawCleanPhone = formatE164Phone(toPhone)
    const accountSid = (process.env.TWILIO_ACCOUNT_SID || "").trim()
    const authToken = (process.env.TWILIO_AUTH_TOKEN || "").trim()
    const fromPhone = (process.env.TWILIO_PHONE_NUMBER || "+12402623543").trim()

    let cleanPhone = rawCleanPhone
    if (cleanPhone === formatE164Phone(fromPhone) || cleanPhone === "+12402623543") {
      cleanPhone = "+12402607898"
    }

    console.log(`[sendConnectInInviteSMS] Dispatching invite to: ${cleanPhone} from: ${fromPhone} (sender: ${senderName})`)

    if (!accountSid || !authToken || !fromPhone) {
      const err = "Twilio credentials (ACCOUNT_SID, AUTH_TOKEN, PHONE_NUMBER) not configured in environment."
      console.warn(`[sendConnectInInviteSMS] ${err}`)
      return { success: false, error: err }
    }

    const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64")
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const params = new URLSearchParams()
    params.append("To", cleanPhone)
    params.append("From", fromPhone)
    params.append("Body", message)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    })

    const data = await response.json()
    if (response.ok && data.sid) {
      console.log(`[sendConnectInInviteSMS] Twilio SMS dispatched successfully! SID: ${data.sid}`)
      return { success: true, sid: data.sid }
    }

    console.warn("[sendConnectInInviteSMS] Twilio API notice/error:", data)
    return {
      success: false,
      error: data.message || `Twilio error ${data.code || "unknown"}`,
      sid: data.sid
    }
  } catch (err: any) {
    console.error("[sendConnectInInviteSMS Exception]", err)
    return { success: false, error: err.message || "Twilio network dispatch failed" }
  }
}

/**
 * Dispatch automated voice call invitations via Twilio Voice API
 * (Bypasses US carrier A2P 10DLC SMS filtering completely)
 */
export async function sendConnectInInviteVoiceCall({
  toPhone,
  senderName = "A colleague",
  inviteLink = "connectln.vercel.app"
}: {
  toPhone: string
  senderName?: string
  inviteLink?: string
}): Promise<{ success: boolean; error?: string; sid?: string }> {
  try {
    const rawCleanPhone = formatE164Phone(toPhone)
    const accountSid = (process.env.TWILIO_ACCOUNT_SID || "").trim()
    const authToken = (process.env.TWILIO_AUTH_TOKEN || "").trim()
    const fromPhone = (process.env.TWILIO_PHONE_NUMBER || "+12402623543").trim()

    let cleanPhone = rawCleanPhone
    if (cleanPhone === formatE164Phone(fromPhone) || cleanPhone === "+12402623543") {
      cleanPhone = "+12402607898"
    }

    if (!accountSid || !authToken || !fromPhone) {
      return { success: false, error: "Twilio credentials not configured." }
    }

    const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64")
    const twiml = `<Response><Pause length="1"/><Say voice="Polly.Joanna">Hello! This is ConnectIn by Expedite Consults. Your colleague ${senderName} has invited you to connect on ConnectIn, the zero-trust professional network. Please visit connectln.vercel.app to accept this invitation. Thank you!</Say></Response>`

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`
    const params = new URLSearchParams()
    params.append("To", cleanPhone)
    params.append("From", fromPhone)
    params.append("Twiml", twiml)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    })

    const data = await response.json()
    if (response.ok && data.sid) {
      console.log(`[sendConnectInInviteVoiceCall] Voice call dispatched successfully! SID: ${data.sid}`)
      return { success: true, sid: data.sid }
    }

    return { success: false, error: data.message || "Failed to initiate voice call", sid: data.sid }
  } catch (err: any) {
    console.error("[sendConnectInInviteVoiceCall Exception]", err)
    return { success: false, error: err.message || "Voice call failed" }
  }
}


