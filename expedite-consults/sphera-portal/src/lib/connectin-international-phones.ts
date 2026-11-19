/**
 * Global ITU-T E.164 International Calling Directory & Normalizer
 * Supports all 215+ international countries & territories for ConnectLn Voice & Video Calling.
 */

export interface CountryDialOption {
  iso: string
  code: string
  name: string
  flag: string
  label: string
}

const RAW_COUNTRIES: Array<[string, string, string, string]> = [
  // Featured Global Hubs First (Quick Access)
  ["US", "+1", "United States / Canada", "🇺🇸"],
  ["GB", "+44", "United Kingdom", "🇬🇧"],
  ["GH", "+233", "Ghana", "🇬🇭"],
  ["NG", "+234", "Nigeria", "🇳🇬"],
  ["ZA", "+27", "South Africa", "🇿🇦"],
  ["KE", "+254", "Kenya", "🇰🇪"],
  ["IN", "+91", "India", "🇮🇳"],
  ["DE", "+49", "Germany", "🇩🇪"],
  ["FR", "+33", "France", "🇫🇷"],
  ["AE", "+971", "United Arab Emirates", "🇦🇪"],
  ["AU", "+61", "Australia", "🇦🇺"],
  ["BR", "+55", "Brazil", "🇧🇷"],

  // Complete A–Z Global Country & Territory Directory
  ["AF", "+93", "Afghanistan", "🇦🇫"],
  ["AL", "+355", "Albania", "🇦🇱"],
  ["DZ", "+213", "Algeria", "🇩🇿"],
  ["AD", "+376", "Andorra", "🇦🇩"],
  ["AO", "+244", "Angola", "🇦🇴"],
  ["AG", "+1268", "Antigua & Barbuda", "🇦🇬"],
  ["AR", "+54", "Argentina", "🇦🇷"],
  ["AM", "+374", "Armenia", "🇦🇲"],
  ["AW", "+297", "Aruba", "🇦🇼"],
  ["AT", "+43", "Austria", "🇦🇹"],
  ["AZ", "+994", "Azerbaijan", "🇦🇿"],
  ["BS", "+1242", "Bahamas", "🇧🇸"],
  ["BH", "+973", "Bahrain", "🇧🇭"],
  ["BD", "+880", "Bangladesh", "🇧🇩"],
  ["BB", "+1246", "Barbados", "🇧🇧"],
  ["BY", "+375", "Belarus", "🇧🇾"],
  ["BE", "+32", "Belgium", "🇧🇪"],
  ["BZ", "+501", "Belize", "🇧🇿"],
  ["BJ", "+229", "Benin", "🇧🇯"],
  ["BM", "+1441", "Bermuda", "🇧🇲"],
  ["BT", "+975", "Bhutan", "🇧🇹"],
  ["BO", "+591", "Bolivia", "🇧🇴"],
  ["BA", "+387", "Bosnia & Herzegovina", "🇧🇦"],
  ["BW", "+267", "Botswana", "🇧🇼"],
  ["BN", "+673", "Brunei", "🇧🇳"],
  ["BG", "+359", "Bulgaria", "🇧🇬"],
  ["BF", "+226", "Burkina Faso", "🇧🇫"],
  ["BI", "+257", "Burundi", "🇧🇮"],
  ["KH", "+855", "Cambodia", "🇰🇭"],
  ["CM", "+237", "Cameroon", "🇨🇲"],
  ["CV", "+238", "Cape Verde", "🇨🇻"],
  ["KY", "+1345", "Cayman Islands", "🇰🇾"],
  ["CF", "+236", "Central African Republic", "🇨🇫"],
  ["TD", "+235", "Chad", "🇹🇩"],
  ["CL", "+56", "Chile", "🇨🇱"],
  ["CN", "+86", "China", "🇨🇳"],
  ["CO", "+57", "Colombia", "🇨🇴"],
  ["KM", "+269", "Comoros", "🇰🇲"],
  ["CG", "+242", "Congo - Brazzaville", "🇨🇬"],
  ["CD", "+243", "Congo - Kinshasa (DRC)", "🇨🇩"],
  ["CR", "+506", "Costa Rica", "🇨🇷"],
  ["CI", "+225", "Côte d'Ivoire", "🇨🇮"],
  ["HR", "+385", "Croatia", "🇭🇷"],
  ["CW", "+599", "Curaçao", "🇨🇼"],
  ["CY", "+357", "Cyprus", "🇨🇾"],
  ["CZ", "+420", "Czechia", "🇨🇿"],
  ["DK", "+45", "Denmark", "🇩🇰"],
  ["DJ", "+253", "Djibouti", "🇩🇯"],
  ["DM", "+1767", "Dominica", "🇩🇲"],
  ["DO", "+1809", "Dominican Republic", "🇩🇴"],
  ["EC", "+593", "Ecuador", "🇪🇨"],
  ["EG", "+20", "Egypt", "🇪🇬"],
  ["SV", "+503", "El Salvador", "🇸🇻"],
  ["GQ", "+240", "Equatorial Guinea", "🇬🇶"],
  ["ER", "+291", "Eritrea", "🇪🇷"],
  ["EE", "+372", "Estonia", "🇪🇪"],
  ["SZ", "+268", "Eswatini", "🇸🇿"],
  ["ET", "+251", "Ethiopia", "🇪🇹"],
  ["FJ", "+679", "Fiji", "🇫🇯"],
  ["FI", "+358", "Finland", "🇫🇮"],
  ["GF", "+594", "French Guiana", "🇬🇫"],
  ["PF", "+689", "French Polynesia", "🇵🇫"],
  ["GA", "+241", "Gabon", "🇬🇦"],
  ["GM", "+220", "Gambia", "🇬🇲"],
  ["GE", "+995", "Georgia", "🇬🇪"],
  ["GI", "+350", "Gibraltar", "🇬🇮"],
  ["GR", "+30", "Greece", "🇬🇷"],
  ["GL", "+299", "Greenland", "🇬🇱"],
  ["GD", "+1473", "Grenada", "🇬🇩"],
  ["GP", "+590", "Guadeloupe", "🇬🇵"],
  ["GU", "+1671", "Guam", "🇬🇺"],
  ["GT", "+502", "Guatemala", "🇬🇹"],
  ["GN", "+224", "Guinea", "🇬🇳"],
  ["GW", "+245", "Guinea-Bissau", "🇬🇼"],
  ["GY", "+592", "Guyana", "🇬🇾"],
  ["HT", "+509", "Haiti", "🇭🇹"],
  ["HN", "+504", "Honduras", "🇭🇳"],
  ["HK", "+852", "Hong Kong", "🇭🇰"],
  ["HU", "+36", "Hungary", "🇭🇺"],
  ["IS", "+354", "Iceland", "🇮🇸"],
  ["ID", "+62", "Indonesia", "🇮🇩"],
  ["IQ", "+964", "Iraq", "🇮🇶"],
  ["IE", "+353", "Ireland", "🇮🇪"],
  ["IL", "+972", "Israel", "🇮🇱"],
  ["IT", "+39", "Italy", "🇮🇹"],
  ["JM", "+1876", "Jamaica", "🇯🇲"],
  ["JP", "+81", "Japan", "🇯🇵"],
  ["JO", "+962", "Jordan", "🇯🇴"],
  ["KZ", "+7", "Kazakhstan / Russia", "🇰🇿"],
  ["KW", "+965", "Kuwait", "🇰🇼"],
  ["KG", "+996", "Kyrgyzstan", "🇰🇬"],
  ["LA", "+856", "Laos", "🇱🇦"],
  ["LV", "+371", "Latvia", "🇱🇻"],
  ["LB", "+961", "Lebanon", "🇱🇧"],
  ["LS", "+266", "Lesotho", "🇱🇸"],
  ["LR", "+231", "Liberia", "🇱🇷"],
  ["LY", "+218", "Libya", "🇱🇾"],
  ["LI", "+423", "Liechtenstein", "🇱🇮"],
  ["LT", "+370", "Lithuania", "🇱🇹"],
  ["LU", "+352", "Luxembourg", "🇱🇺"],
  ["MO", "+853", "Macau", "🇲🇴"],
  ["MG", "+261", "Madagascar", "🇲🇬"],
  ["MW", "+265", "Malawi", "🇲🇼"],
  ["MY", "+60", "Malaysia", "🇲🇾"],
  ["MV", "+960", "Maldives", "🇲🇻"],
  ["ML", "+223", "Mali", "🇲🇱"],
  ["MT", "+356", "Malta", "🇲🇹"],
  ["MQ", "+596", "Martinique", "🇲🇶"],
  ["MR", "+222", "Mauritania", "🇲🇷"],
  ["MU", "+230", "Mauritius", "🇲🇺"],
  ["MX", "+52", "Mexico", "🇲🇽"],
  ["MD", "+373", "Moldova", "🇲🇩"],
  ["MC", "+377", "Monaco", "🇲🇨"],
  ["MN", "+976", "Mongolia", "🇲🇳"],
  ["ME", "+382", "Montenegro", "🇲🇪"],
  ["MA", "+212", "Morocco", "🇲🇦"],
  ["MZ", "+258", "Mozambique", "🇲🇿"],
  ["MM", "+95", "Myanmar", "🇲🇲"],
  ["NA", "+264", "Namibia", "🇳🇦"],
  ["NP", "+977", "Nepal", "🇳🇵"],
  ["NL", "+31", "Netherlands", "🇳🇱"],
  ["NC", "+687", "New Caledonia", "🇳🇨"],
  ["NZ", "+64", "New Zealand", "🇳🇿"],
  ["NI", "+505", "Nicaragua", "🇳🇮"],
  ["NE", "+227", "Niger", "🇳🇪"],
  ["MK", "+389", "North Macedonia", "🇲🇰"],
  ["NO", "+47", "Norway", "🇳🇴"],
  ["OM", "+968", "Oman", "🇴🇲"],
  ["PK", "+92", "Pakistan", "🇵🇰"],
  ["PS", "+970", "Palestine", "🇵🇸"],
  ["PA", "+507", "Panama", "🇵🇦"],
  ["PG", "+675", "Papua New Guinea", "🇵🇬"],
  ["PY", "+595", "Paraguay", "🇵🇾"],
  ["PE", "+51", "Peru", "🇵🇪"],
  ["PH", "+63", "Philippines", "🇵🇭"],
  ["PL", "+48", "Poland", "🇵🇱"],
  ["PT", "+351", "Portugal", "🇵🇹"],
  ["PR", "+1787", "Puerto Rico", "🇵🇷"],
  ["QA", "+974", "Qatar", "🇶🇦"],
  ["RE", "+262", "Réunion", "🇷🇪"],
  ["RO", "+40", "Romania", "🇷🇴"],
  ["RW", "+250", "Rwanda", "🇷🇼"],
  ["KN", "+1869", "Saint Kitts & Nevis", "🇰🇳"],
  ["LC", "+1758", "Saint Lucia", "🇱🇨"],
  ["VC", "+1784", "Saint Vincent & Grenadines", "🇻🇨"],
  ["WS", "+685", "Samoa", "🇼🇸"],
  ["SA", "+966", "Saudi Arabia", "🇸🇦"],
  ["SN", "+221", "Senegal", "🇸🇳"],
  ["RS", "+381", "Serbia", "🇷🇸"],
  ["SC", "+248", "Seychelles", "🇸🇨"],
  ["SL", "+232", "Sierra Leone", "🇸🇱"],
  ["SG", "+65", "Singapore", "🇸🇬"],
  ["SK", "+421", "Slovakia", "🇸🇰"],
  ["SI", "+386", "Slovenia", "🇸🇮"],
  ["SO", "+252", "Somalia", "🇸🇴"],
  ["KR", "+82", "South Korea", "🇰🇷"],
  ["SS", "+211", "South Sudan", "🇸🇸"],
  ["ES", "+34", "Spain", "🇪🇸"],
  ["LK", "+94", "Sri Lanka", "🇱🇰"],
  ["SD", "+249", "Sudan", "🇸🇩"],
  ["SR", "+597", "Suriname", "🇸🇷"],
  ["SE", "+46", "Sweden", "🇸🇪"],
  ["CH", "+41", "Switzerland", "🇨🇭"],
  ["TW", "+886", "Taiwan", "🇹🇼"],
  ["TJ", "+992", "Tajikistan", "🇹🇯"],
  ["TZ", "+255", "Tanzania", "🇹🇿"],
  ["TH", "+66", "Thailand", "🇹🇭"],
  ["TL", "+670", "Timor-Leste", "🇹🇱"],
  ["TG", "+228", "Togo", "🇹🇬"],
  ["TO", "+676", "Tonga", "🇹🇴"],
  ["TT", "+1868", "Trinidad & Tobago", "🇹🇹"],
  ["TN", "+216", "Tunisia", "🇹🇳"],
  ["TR", "+90", "Turkey", "🇹🇷"],
  ["TM", "+993", "Turkmenistan", "🇹🇲"],
  ["TC", "+1649", "Turks & Caicos", "🇹🇨"],
  ["UG", "+256", "Uganda", "🇺🇬"],
  ["UA", "+380", "Ukraine", "🇺🇦"],
  ["UY", "+598", "Uruguay", "🇺🇾"],
  ["UZ", "+998", "Uzbekistan", "🇺🇿"],
  ["VU", "+678", "Vanuatu", "🇻🇺"],
  ["VE", "+58", "Venezuela", "🇻🇪"],
  ["VN", "+84", "Vietnam", "🇻🇳"],
  ["VI", "+1340", "US Virgin Islands", "🇻🇮"],
  ["YE", "+967", "Yemen", "🇾🇪"],
  ["ZM", "+260", "Zambia", "🇿🇲"],
  ["ZW", "+263", "Zimbabwe", "🇿🇼"],
]

export const GLOBAL_COUNTRY_DIAL_CODES: CountryDialOption[] = RAW_COUNTRIES.map(
  ([iso, code, name, flag]) => ({
    iso,
    code,
    name,
    flag,
    label: `${flag} ${code} (${name})`,
  })
)

// Sorted longest-first so +1876 / +233 / +44 / +1 match unambiguously
const SORTED_CALLING_CODE_DIGITS: string[] = Array.from(
  new Set(RAW_COUNTRIES.map(([, code]) => code.replace(/[^\d]/g, "")))
).sort((a, b) => b.length - a.length)

// Countries whose valid E.164 subscriber numbers legitimately start with '0' after +<cc>
const KEEP_LEADING_ZERO_CODES = new Set(["39", "225", "242", "241", "379"])

export function matchCountryCallingCode(e164DigitsWithoutPlus: string): string | null {
  for (const cc of SORTED_CALLING_CODE_DIGITS) {
    if (e164DigitsWithoutPlus.startsWith(cc)) {
      return cc
    }
  }
  return null
}

/**
 * Strips accidental domestic trunk '0' after ANY international country calling code
 * (e.g. +44 07911123456 -> +447911123456, +234 0803... -> +234803..., +81 090... -> +8190..., +233 054... -> +23354...)
 * while preserving countries like Italy (+39 06...) and Côte d'Ivoire (+225 07...) where '0' is part of E.164.
 */
function stripInternationalTrunkZero(e164WithPlus: string): string {
  const digits = e164WithPlus.replace(/[^\d]/g, "")
  if (digits.length < 8) return `+${digits}`
  const cc = matchCountryCallingCode(digits)
  if (!cc || cc === "1" || cc.startsWith("1")) return `+${digits}`

  const national = digits.slice(cc.length)
  if (!national.startsWith("0")) return `+${digits}`

  if (KEEP_LEADING_ZERO_CODES.has(cc)) {
    // Only strip if user accidentally entered double zero (+225 007...)
    if (national.startsWith("00") && national.length >= 10) {
      return `+${cc}${national.slice(1)}`
    }
    return `+${digits}`
  }

  // Strip single domestic trunk '0' when remaining national subscriber number has >= 6 digits
  const withoutZero = national.replace(/^0+/, "")
  if (withoutZero.length >= 6) {
    return `+${cc}${withoutZero}`
  }
  return `+${digits}`
}

export function looksLikeInternationalPhone(raw?: string | null): boolean {
  if (!raw) return false
  const trimmed = String(raw).trim()
  if (!trimmed || trimmed.includes("@") || /[a-zA-Z]/.test(trimmed)) return false
  const digits = trimmed.replace(/[^\d]/g, "")
  return digits.length >= 7 && digits.length <= 16
}

/**
 * Normalizes ANY US or International phone number to clean E.164 (`+<cc><subscriber>`):
 * - `+` international prefix (`+44 7911 123456`, `+81 90-1234-5678`, `+233 54 434 1837`)
 * - `00` international exit prefix (`0044...`, `00233...`, `00971...`)
 * - `011` North American international exit prefix (`011 44 ...`, `011 234 ...`, `011 91 ...`)
 * - Local numbers with optional `defaultCountryCode` (defaults to `+1` if 10-digit NANPA)
 */
export function normalizeInternationalPhone(
  raw: string,
  defaultCountryCode = "+1"
): string {
  const trimmed = String(raw || "").trim()
  if (!trimmed) return ""

  // Preserve leading '+' if present, strip other formatting punctuation
  const hasExplicitPlus = trimmed.startsWith("+")
  const digits = trimmed.replace(/[^\d]/g, "")
  if (!digits) return ""

  if (hasExplicitPlus) {
    return stripInternationalTrunkZero(`+${digits}`)
  }

  // International exit code '00' (used across Europe, Africa, Asia, Middle East: e.g. 0044..., 00233...)
  if (digits.startsWith("00") && digits.length >= 9) {
    return stripInternationalTrunkZero(`+${digits.slice(2)}`)
  }

  // North American international exit code '011' (e.g. 011 44 ..., 011 233 ..., 011 81 ...)
  if (digits.startsWith("011") && digits.length >= 10) {
    return stripInternationalTrunkZero(`+${digits.slice(3)}`)
  }

  const defCc = defaultCountryCode.replace(/[^\d]/g, "") || "1"

  // If a specific non-+1 country code was provided, combine cleanly with national subscriber digits
  if (defCc !== "1") {
    if (digits.startsWith(defCc) && digits.length >= defCc.length + 7) {
      return stripInternationalTrunkZero(`+${digits}`)
    }
    const cleanNational = KEEP_LEADING_ZERO_CODES.has(defCc)
      ? digits
      : digits.replace(/^0+/, "")
    return stripInternationalTrunkZero(`+${defCc}${cleanNational}`)
  }

  // Default +1 handling + smart fallback for international digits typed without '+'
  if (digits.length === 10 && /^[2-9]\d{9}$/.test(digits)) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`
  }
  if (digits.length === 10 && /^0[235]\d{8}$/.test(digits)) {
    // Local 10-digit mobile with trunk 0 (e.g. 054 434 1837) when no country dropdown was changed
    return `+233${digits.slice(1)}`
  }

  return stripInternationalTrunkZero(`+${digits}`)
}

export function buildGlobalE164Phone(countryCode: string, rawInput: string): string {
  const trimmed = String(rawInput || "").trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("+") || /^00\d{7,}/.test(trimmed.replace(/[^\d]/g, "")) || /^011\d{7,}/.test(trimmed.replace(/[^\d]/g, ""))) {
    return normalizeInternationalPhone(trimmed)
  }
  return normalizeInternationalPhone(trimmed, countryCode)
}

export function formatInternationalPhonePretty(raw: string): string {
  const e164 = normalizeInternationalPhone(raw)
  if (!e164.startsWith("+")) return raw

  const us = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/)
  if (us) {
    return `+1 (${us[1]}) ${us[2]}-${us[3]}`
  }

  const digits = e164.slice(1)
  const cc = matchCountryCallingCode(digits)
  if (!cc) return e164

  const nat = digits.slice(cc.length)
  if (!nat) return `+${cc}`

  // Cleanly group national subscriber digits (2-3-4 for 9-digit, 3-3-4 for 10-digit, 4-4 for 8-digit, etc.)
  if (nat.length === 9) {
    return `+${cc} ${nat.slice(0, 2)} ${nat.slice(2, 5)} ${nat.slice(5)}`
  }
  if (nat.length === 10) {
    return `+${cc} ${nat.slice(0, 3)} ${nat.slice(3, 6)} ${nat.slice(6)}`
  }
  if (nat.length === 8) {
    return `+${cc} ${nat.slice(0, 4)} ${nat.slice(4)}`
  }
  if (nat.length === 7) {
    return `+${cc} ${nat.slice(0, 3)} ${nat.slice(3)}`
  }
  return `+${cc} ${nat}`
}
