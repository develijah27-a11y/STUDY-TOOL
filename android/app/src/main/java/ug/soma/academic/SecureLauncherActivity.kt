package ug.soma.academic

import android.os.Bundle
import android.view.WindowManager
import com.google.androidbrowserhelper.trusted.LauncherActivity

/**
 * SomaUG Academic — Secure TWA Launcher.
 * 
 * Enforces hardware and OS-level DRM security:
 * 1. WindowManager.LayoutParams.FLAG_SECURE:
 *    - Blocks hardware screenshot combinations (Power + Volume Down).
 *    - Blocks all screen recording apps (outputs pure black frames).
 *    - Prevents screen casting / HDMI mirroring to unauthorized screens.
 *    - Hides sensitive academic notes and exams from Android task switcher / recents preview.
 */
class SecureLauncherActivity : LauncherActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Enforce hardware-level screenshot and screen recording lock
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )
        super.onCreate(savedInstanceState)
    }

    override fun onResume() {
        super.onResume()
        // Re-assert FLAG_SECURE on window focus restore
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )
    }
}

