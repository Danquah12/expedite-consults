/**
 * ConnectIn SMS Dispatch Engine
 * Supports Twilio API with E.164 phone formatting for phone-based 2FA authentication
 */

interface SendSMSParams {
  toPhone: string
  code: string
  fullName?: string
  channel?: "sms" | "call"
}

export function formatE164Phone(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, "").trim()
  if (!cleaned.startsWith("+")) {
    if (cleaned.length === 10) {
      cleaned = "+1" + cleaned
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      cleaned = "+" + cleaned
    } else {
      cleaned = "+" + cleaned
    }
  }
  return cleaned
}

export async function sendConnectInSMS({
  toPhone,
  code,
  fullName = "Member",
  channel = "sms"
}: SendSMSParams): Promise<{ success: boolean; error?: string; sid?: string }> {
  try {
    const cleanPhone = formatE164Phone(toPhone)
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromPhone = process.env.TWILIO_PHONE_NUMBER

    const firstName = fullName.split(" ")[0] || "Member"
    const messageBody = `ConnectIn Security: Hi ${firstName},\n\nYour one-time authentication code is: ${code}\n\nPlease enter this code to complete verification. Valid for 15 minutes. If you did not request this code, please ignore this message.`

    console.log(`[Phone 2FA Dispatch Request] To: ${cleanPhone} via ${channel.toUpperCase()} (from: ${fromPhone || "default"})`)

    if (accountSid && authToken && fromPhone) {
      const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

      if (channel === "call") {
        // Direct Twilio Voice Call with TwiML speech synthesis speaking dynamic OTP
        const spokenCode = code.split("").join(", ")
        const twiml = `<Response><Pause length="1"/><Say voice="Polly.Joanna">Hello, this is ConnectIn Security by Expedite Consults. Your one-time verification code is: ${spokenCode}. I repeat: ${spokenCode}. Thank you for using ConnectIn.</Say><Pause length="1"/><Say voice="Polly.Joanna">Goodbye.</Say></Response>`

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
        if (!response.ok) {
          console.error("[Twilio Voice Error Response]", data)
          return { success: false, error: data.message || "Failed to initiate voice call via Twilio" }
        }

        console.log(`[Voice Call Initiated Successfully] To: ${cleanPhone} SID: ${data.sid}`)
        return { success: true, sid: data.sid }
      } else {
        // Direct Twilio SMS Message
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
        const params = new URLSearchParams()
        params.append("To", cleanPhone)
        params.append("From", fromPhone)
        params.append("Body", messageBody)

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        })

        const data = await response.json()
        if (!response.ok) {
          console.error("[Twilio SMS Error Response]", data)
          return { success: false, error: data.message || "Failed to deliver SMS via Twilio" }
        }

        console.log(`[SMS Dispatched Successfully] To: ${cleanPhone} SID: ${data.sid}`)
        return { success: true, sid: data.sid }
      }
    }

    console.log(`\n📱 [SMS/VOICE DISPATCH MOCK] To: ${cleanPhone} via ${channel.toUpperCase()} | Code: ${code}\n`)
    return { success: true }
  } catch (err: any) {
    console.error("[sendConnectInSMS Error]", err)
    return { success: false, error: err.message || "SMS/Voice dispatch failed" }
  }
}
