/**
 * ConnectIn SMS Dispatch Engine
 * Supports Twilio API and fallback gateways for phone-based 2FA authentication
 */

interface SendSMSParams {
  toPhone: string
  code: string
  fullName?: string
}

export async function sendConnectInSMS({
  toPhone,
  code,
  fullName = "Member"
}: SendSMSParams): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPhone = toPhone.trim()
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromPhone = process.env.TWILIO_PHONE_NUMBER

    const messageBody = `[ConnectIn] Your verification security code is: ${code}. Valid for 10 minutes. Do not share this code.`

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
        console.error("[Twilio Error]", data)
        return { success: false, error: data.message || "Failed to deliver SMS" }
      }

      console.log(`[SMS Dispatched] To: ${cleanPhone} SID: ${data.sid}`)
      return { success: true }
    }

    // Default console log for non-Twilio environments
    console.log(`\n📱 [SMS DISPATCH] To: ${cleanPhone} | Code: ${code} | Message: "${messageBody}"\n`)
    return { success: true }
  } catch (err: any) {
    console.error("[sendConnectInSMS Error]", err)
    return { success: false, error: err.message || "SMS dispatch failed" }
  }
}
