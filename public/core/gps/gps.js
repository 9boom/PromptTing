// gps.js

let intervalId = null;

export function isGeolocationSupported() {
  return typeof navigator !== 'undefined' && !!navigator.geolocation;
}

/**
 * @returns {Promise<'granted'|'denied'|'prompt'|'unsupported'>}
 */
export async function getGeolocationPermissionState() {
  if (!isGeolocationSupported()) return 'unsupported';
  try {
    const { query } = navigator.permissions || {};
    if (typeof query === 'function') {
      const status = await query({ name: 'geolocation' });
      return status.state;
    }
  } catch (_) {
    // Safari / บางเบราว์เซอร์ไม่รองรับ query('geolocation')
  }
  return 'prompt';
}

/**
 * @param {GeolocationPositionError} err
 * @returns {'denied'|'unavailable'|'timeout'|'unknown'}
 */
export function classifyGeolocationError(err) {
  if (!err || typeof err.code !== 'number') return 'unknown';
  if (err.code === 1) return 'denied';
  if (err.code === 2) return 'unavailable';
  if (err.code === 3) return 'timeout';
  return 'unknown';
}

/**
 * FORCE GET
 * แม่นสุด ไม่สนแบต
 */
export function forceGetLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
        });
      },
      reject,
      {
        enableHighAccuracy: true, // เปิด GPS เต็ม
        timeout: 15000,
        maximumAge: 0, // ห้าม cache
      }
    );
  });
}

/**
 * INTERVAL MODE
 * ประหยัดแบต
 */
export function startGpsInterval(callback, errorCallback = console.error) {
  stopGpsInterval();

  intervalId = setInterval(async () => {
    try {
      const pos = await navigatorGeolocation();
      callback(pos);
    } catch (err) {
      errorCallback(err);
    }
  }, 30000); // 30 วิ
}

/**
 * STOP INTERVAL
 */
export function stopGpsInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/**
 * Low power geolocation
 */
function navigatorGeolocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
        });
      },
      reject,
      {
        enableHighAccuracy: false, // ประหยัดแบต
        timeout: 5000,
        maximumAge: 30000, // ใช้ cache ได้
      }
    );
  });
}
