const REF_KEY = "yiya_ref_challenge";
const REFERRAL_REF_KEY = "yiya_ref_user";
const UTM_KEY = "yiya_utm";
const COOKIE_KEY = "yiya_ref";

export type UtmData = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export type ReferralData = {
  ref_source?: string;
  ref_id?: string;
} & UtmData;

function setReferralCookie(data: ReferralData) {
  try {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(data))};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
  } catch {}
}

function clearReferralCookie() {
  try {
    document.cookie = `${COOKIE_KEY}=;path=/;max-age=0`;
  } catch {}
}

export function getReferralData(): ReferralData {
  if (typeof window === "undefined") return {};
  try {
    const data: ReferralData = {};
    const userRef = localStorage.getItem(REFERRAL_REF_KEY);
    if (userRef) {
      data.ref_source = "referral";
      data.ref_id = userRef;
    } else {
      const challengeId = localStorage.getItem(REF_KEY);
      if (challengeId) {
        data.ref_source = "challenge";
        data.ref_id = challengeId;
      }
    }
    const utmRaw = localStorage.getItem(UTM_KEY);
    if (utmRaw) {
      const utm = JSON.parse(utmRaw) as UtmData;
      if (utm.utm_source) data.utm_source = utm.utm_source;
      if (utm.utm_medium) data.utm_medium = utm.utm_medium;
      if (utm.utm_campaign) data.utm_campaign = utm.utm_campaign;
    }
    return data;
  } catch {
    return {};
  }
}

export function clearReferralData() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(REF_KEY);
    localStorage.removeItem(REFERRAL_REF_KEY);
    localStorage.removeItem(UTM_KEY);
    clearReferralCookie();
  } catch {}
}

export function getServerReferralData(cookieValue?: string | null): ReferralData {
  if (!cookieValue) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue)) as ReferralData;
    const data: ReferralData = {};
    if (parsed.ref_source) data.ref_source = parsed.ref_source;
    if (parsed.ref_id) data.ref_id = parsed.ref_id;
    if (parsed.utm_source) data.utm_source = parsed.utm_source;
    if (parsed.utm_medium) data.utm_medium = parsed.utm_medium;
    if (parsed.utm_campaign) data.utm_campaign = parsed.utm_campaign;
    return data;
  } catch {
    return {};
  }
}

export function captureReferralParams() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const refSource = params.get("ref_source");
    if (ref && refSource === "referral") {
      localStorage.setItem(REFERRAL_REF_KEY, ref);
      setReferralCookie({ ...getReferralData(), ref_source: "referral", ref_id: ref });
    }
  } catch {}
}

export function captureUtmParams() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source");
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");
    if (!source && !medium && !campaign) return;
    const data: UtmData = {};
    if (source) data.utm_source = source;
    if (medium) data.utm_medium = medium;
    if (campaign) data.utm_campaign = campaign;
    localStorage.setItem(UTM_KEY, JSON.stringify(data));
    setReferralCookie({ ...getReferralData(), ...data });
  } catch {}
}

export function syncReferralCookie() {
  if (typeof window === "undefined") return;
  const data = getReferralData();
  if (data.ref_source || data.utm_source || data.utm_medium || data.utm_campaign) {
    setReferralCookie(data);
  }
}
