/**
 * ConnectIn SMS Dispatch Engine
 * Supports Twilio API with E.164 phone formatting for phone-based 2FA authentication
 */

interface SendSMSParams {
  toPhone: string
  code: string
  fullName?: string
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
  fullName = "Member"
}: SendSMSParams): Promise<{ success: boolean; error?: string; sid?: string }> {
  try {
    const cleanPhone = formatE164Phone(toPhone)
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromPhone = process.env.TWILIO_PHONE_NUMBER

    const firstName = fullName.split(" ")[0] || "Member"
    const messageBody = `Expedite Consults SSO: Hi ${firstName},\n\nYour one-time authentication code is: ${code}\n\nPlease enter this code to complete verification. Valid for 15 minutes. If you did not request this code, please ignore this message.`

    console.log(`[SMS Dispatch Request] To: ${cleanPhone} (using from: ${fromPhone || "default"})`)

    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || "VA41cdc0ff263947ff803f53f7eb0ab57f"

    if (accountSid && authToken && verifyServiceSid) {
      const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`
      const params = new URLSearchParams()
      params.append("To", cleanPhone)
      params.append("Channel", "sms")

      const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64")
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      })

      const data = await response.json()
      if (response.ok) {
        console.log(`[Twilio Verify SMS Dispatched] To: ${cleanPhone} SID: ${data.sid}`)
        return { success: true, sid: data.sid }
      }
      console.warn("[Twilio Verify Dispatch Notice]", data)
    }

    if (accountSid && authToken && fromPhone) {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
      const params = new URLSearchParams()
      params.append("To", cleanPhone)
      params.append("From", fromPhone)
      params.append("Body", messageBody)

      const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64")
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
        console.error("[Twilio Error Response]", data)
        return { success: false, error: data.message || "Failed to deliver SMS via Twilio" }
      }

      console.log(`[SMS Dispatched Successfully] To: ${cleanPhone} SID: ${data.sid}`)
      return { success: true, sid: data.sid }
    }

    console.log(`\n📱 [SMS DISPATCH MOCK] To: ${cleanPhone} | Code: ${code} | Message: "${messageBody}"\n`)
    return { success: true }
  } catch (err: any) {
    console.error("[sendConnectInSMS Error]", err)
    return { success: false, error: err.message || "SMS dispatch failed" }
  }
}
