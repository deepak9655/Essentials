package com.deepak.essentials.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import com.deepak.essentials.data.Settings

// Brand palette (Material You fallback on pre-12 devices)
val BrandIndigo = Color(0xFF5E5CE6)
val BrandBlue = Color(0xFF0A84FF)

private val LightColors = lightColorScheme(
    primary = BrandIndigo,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE4E3FF),
    onPrimaryContainer = Color(0xFF1B1A66),
    secondary = BrandBlue,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFD6E9FF),
    onSecondaryContainer = Color(0xFF001D34),
    tertiary = Color(0xFFFF375F),
    background = Color(0xFFF6F6FA),
    onBackground = Color(0xFF1B1B1F),
    surface = Color(0xFFF6F6FA),
    onSurface = Color(0xFF1B1B1F),
    surfaceVariant = Color(0xFFE3E1EC),
    onSurfaceVariant = Color(0xFF46464F),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFFBEC2FF),
    onPrimary = Color(0xFF2827A8),
    primaryContainer = Color(0xFF4140C9),
    onPrimaryContainer = Color(0xFFE4E3FF),
    secondary = Color(0xFFA6CCFF),
    onSecondary = Color(0xFF003257),
    secondaryContainer = Color(0xFF00497B),
    onSecondaryContainer = Color(0xFFD6E9FF),
    tertiary = Color(0xFFFFB1C0),
    background = Color(0xFF121216),
    onBackground = Color(0xFFE4E1E6),
    surface = Color(0xFF121216),
    onSurface = Color(0xFFE4E1E6),
    surfaceVariant = Color(0xFF25252C),
    onSurfaceVariant = Color(0xFFC8C5D0),
)

/** Pure black AMOLED scheme — kills every pixel on OLED panels. */
private val AmoledColors = darkColorScheme(
    primary = Color(0xFFBEC2FF),
    onPrimary = Color(0xFF2827A8),
    primaryContainer = Color(0xFF4140C9),
    onPrimaryContainer = Color(0xFFE4E3FF),
    secondary = Color(0xFFA6CCFF),
    onSecondary = Color(0xFF003257),
    secondaryContainer = Color(0xFF00497B),
    onSecondaryContainer = Color(0xFFD6E9FF),
    tertiary = Color(0xFFFFB1C0),
    background = Color.Black,
    onBackground = Color(0xFFE8E8EA),
    surface = Color.Black,
    onSurface = Color(0xFFE8E8EA),
    surfaceVariant = Color(0xFF0A0A0C),
    onSurfaceVariant = Color(0xFFBDBDC6),
)

/** True while the active scheme is the pure-black AMOLED one. */
val isAmoledBlack: Boolean
    @Composable get() = Settings.amoled.value && isDarkThemeActive()

@Composable
private fun isDarkThemeActive(): Boolean =
    when (Settings.themeMode.value) {
        "light" -> false
        "dark" -> true
        else -> isSystemInDarkTheme()
    }

@Composable
fun EssentialsTheme(content: @Composable () -> Unit) {
    val dark = isDarkThemeActive()
    val useDynamic = Settings.dynamicColor.value && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
    val context = LocalContext.current

    val colors = when {
        useDynamic && dark -> dynamicDarkColorScheme(context)
        useDynamic && !dark -> dynamicLightColorScheme(context)
        dark && Settings.amoled.value -> AmoledColors
        dark -> DarkColors
        else -> LightColors
    }

    MaterialTheme(
        colorScheme = colors,
        typography = Typography(),
        content = content,
    )
}
