export async function checkRequirements() {
  const status = {
    isLocalStorageSupported: false,
    isCameraSupported: false,
    isGpsSupported: false,
    isInAppBrowser: false,
    canProceed: false,
    errors: []
  };

  // 1. เช็ค LocalStorage
  // ต้องใช้ try...catch เพราะบาง Webview หรือโหมด Incognito แค่เรียกใช้งานก็เกิด Exception แล้ว
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    status.isLocalStorageSupported = true;
  } catch (e) {
    status.errors.push("LocalStorage is blocked or not supported.");
  }

  // 2. เช็ค Camera (MediaDevices API)
  // เช็คแค่ว่าเบราว์เซอร์มี API นี้ให้เรียกใช้หรือไม่ (ไม่ได้เป็นการขอสิทธิ์)
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    status.isCameraSupported = true;
  } else {
    status.errors.push("Camera API not supported (requires HTTPS or modern browser).");
  }

  // 3. เช็ค GPS (Geolocation API)
  if ("geolocation" in navigator) {
    status.isGpsSupported = true;
  } else {
    status.errors.push("Geolocation API not supported.");
  }

  // 4. ดักจับ In-App Browser ยอดฮิต (Facebook, Messenger, Instagram, LINE, Twitter/X, TikTok)
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const normalizedUa = String(ua).toLowerCase();
  const inAppBrowserPatterns = [
    'fban',
    'fbav',
    'fb_iab',
    'fbios',
    'messenger',
    'instagram',
    'line/',
    ' line/',
    'twitter',
    'x-webview',
    'tiktok',
    'musical_ly'
  ];

  if (inAppBrowserPatterns.some((pattern) => normalizedUa.includes(pattern))) {
    status.isInAppBrowser = true;
    status.errors.push("Opened inside an In-App Browser.");
  }

  // สรุปผลลัพธ์: จะให้ผ่าน (true) ก็ต่อเมื่อรองรับครบทุกอย่าง และไม่ได้เปิดผ่าน In-App Browser
  status.canProceed = 
    status.isLocalStorageSupported && 
    status.isCameraSupported && 
    status.isGpsSupported && 
    !status.isInAppBrowser;

  return status;
}
