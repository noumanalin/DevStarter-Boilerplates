/**
 * src/utils/deviceInfo.js
 * Backend (buildLoginHistoryPayload / buildSessionPayload) expects:
 *   browser, os, deviceType (MOBILE|TABLET|LAPTOP|DESKTOP|OTHER),
 *   screenWidth, screenHeight, userAgent
 */
import { UAParser } from "ua-parser-js";

export const getDeviceInfo = () => {
  const parser = new UAParser();

  const result = parser.getResult();

  return {
    browser: result.browser.name || "Unknown",
    browserVersion: result.browser.version || null,

    os: result.os.name || "Unknown",
    osVersion: result.os.version || null,

    deviceType: mapDeviceType(result),

    screenWidth:
      typeof window !== "undefined"
        ? window.screen?.width
        : undefined,

    screenHeight:
      typeof window !== "undefined"
        ? window.screen?.height
        : undefined,

    userAgent:
      typeof navigator !== "undefined"
        ? navigator.userAgent
        : "",
  };
};

function mapDeviceType(result) {
  const type = result.device.type;

  if (type === "mobile") return "MOBILE";

  if (type === "tablet") return "TABLET";

  if (
    result.os.name === "Windows" ||
    result.os.name === "macOS" ||
    result.os.name === "Linux"
  ) {
    return "DESKTOP";
  }

  return "OTHER";
}