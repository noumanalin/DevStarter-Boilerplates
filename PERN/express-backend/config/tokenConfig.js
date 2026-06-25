// config/tokenConfig.js
//
// ── WHAT THIS FILE IS ──────────────────────────────────────────────
// This auth system uses TWO tokens, and they live for different lengths
// of time on purpose:
//
// 1. ACCESS TOKEN  → a short-lived JWT. The frontend sends this on every
//    API call to prove "I am logged in". It is NOT stored in the database
//    — the server just checks its signature + expiry, that's it.
//    When it expires, the user is NOT logged out. The frontend silently
//    asks for a new one using the refresh token (see axios.js).
//
// 2. REFRESH TOKEN → a long-lived random string. THIS one IS stored in
//    the database (in the `Session` table, as a hashed value). It's the
//    thing that actually represents "this device is logged in".
//    When THIS expires (or is deleted/revoked), the user is truly logged
//    out and must enter email + password again.
//
// Think of it like a hotel:
//   - Access token  = your room key card (works for a few hours, then
//                      stops working, but you're still a hotel guest)
//   - Refresh token  = your hotel booking (as long as the booking is
//                      valid, the front desk will happily give you a
//                      new key card without asking for your ID again)
//
// ── WHY THESE ARE VARIABLES INSTEAD OF HARDCODED ───────────────────
// Every project you copy this auth system into can have different needs
// (a banking app might want 5-minute access tokens, a casual blog app
// might want 24 hours). Change ONE line here (or the .env value) and
// every controller that issues tokens picks it up automatically.

export const ACCESS_TOKEN_EXPIRES_IN = "60m";
// ↑ jsonwebtoken's own format: "15m", "60m", "1d", "7d", etc.
// Most products use 15m. You're using 60m — that's a valid choice,
// it just means a stolen access token is "useful" to an attacker for
// up to 60 minutes instead of 15. Not dangerous, just a trade-off.

export const REFRESH_TOKEN_EXPIRES_DAYS = 30;
// ↑ "Age" of the refresh token = 30 days.
//   - If the user opens your app at least once every 30 days → they
//     basically never get logged out.
//   - If the user disappears for 30+ days without opening the app →
//     the refresh token in the DB has expired, and next time they
//     come back, they must log in again.