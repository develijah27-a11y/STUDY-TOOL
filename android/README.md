# SomaUG Academic — Android Native Shell (TWA & FLAG_SECURE)

This directory contains the production-ready Android Native Trusted Web Activity (TWA) and DRM container for **SomaUG Academic** (`ug.soma.academic`).

## Features & OS-Level DRM Enforcement

1. **`WindowManager.LayoutParams.FLAG_SECURE`**:
   - Blocks hardware screenshot key combinations (`Power + Volume Down`).
   - Forces Android screen recorders (native and third-party) to record pure black video frames.
   - Prevents screen sharing, Chromecast mirroring, and HDMI capture.
   - Masks sensitive lecture materials and examination solutions in the Android recent apps switcher.

2. **Google Trusted Web Activity (TWA)**:
   - Built on Google's official `androidbrowserhelper` (v2.5.0).
   - Once Digital Asset Links are verified (`https://study-tool-lime.vercel.app/.well-known/assetlinks.json`), the browser URL bar is completely hidden, providing a 100% native, full-screen experience.

3. **Standalone Secure WebView Mode**:
   - Includes `SecureWebActivity` as an offline, zero-browser-UI fallback.

---

## Prerequisites for Compiling the APK

1. **Java Development Kit (JDK 17)** installed.
2. **Android SDK** (API 34, Android 14) installed (or Android Studio).

---

## How to Build the Android App

### Option A: Using Gradle (Command Line)
```bash
cd android

# Build debug APK for testing
./gradlew assembleDebug

# The debug APK will be generated at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Option B: Using Android Studio
1. Open Android Studio.
2. Select **Open an Existing Project** and choose the `android/` directory.
3. Wait for Gradle sync to complete.
4. Click **Build > Generate Signed Bundle / APK...** to produce a release APK or AAB for the Google Play Store.

---

## Verifying Digital Asset Links for Google Play

To verify your production keystore with the web app:
1. Generate your release SHA-256 fingerprint:
   ```bash
   keytool -list -v -keystore your-release-key.keystore
   ```
2. Paste the SHA-256 fingerprint into:
   - `public/.well-known/assetlinks.json`
   - `twa-manifest.json`
3. Push to `main` so Vercel serves the updated signature at `https://study-tool-lime.vercel.app/.well-known/assetlinks.json`.

