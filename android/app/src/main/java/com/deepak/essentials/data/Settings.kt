package com.deepak.essentials.data

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.mutableStateOf

/** Lightweight app settings backed by SharedPreferences. */
object Settings {
    private lateinit var prefs: SharedPreferences

    val themeMode = mutableStateOf("system") // system | light | dark
    val amoled = mutableStateOf(true)
    val dynamicColor = mutableStateOf(true)
    val favourites = mutableStateOf<Set<String>>(emptySet())

    fun init(context: Context) {
        prefs = context.getSharedPreferences("essentials_settings", Context.MODE_PRIVATE)
        themeMode.value = prefs.getString("themeMode", "system") ?: "system"
        amoled.value = prefs.getBoolean("amoled", true)
        dynamicColor.value = prefs.getBoolean("dynamicColor", true)
        favourites.value = prefs.getStringSet("favourites", emptySet())?.toSet() ?: emptySet()
    }

    fun setThemeMode(value: String) {
        themeMode.value = value
        prefs.edit().putString("themeMode", value).apply()
    }

    fun setAmoled(value: Boolean) {
        amoled.value = value
        prefs.edit().putBoolean("amoled", value).apply()
    }

    fun setDynamicColor(value: Boolean) {
        dynamicColor.value = value
        prefs.edit().putBoolean("dynamicColor", value).apply()
    }

    fun toggleFavourite(id: String) {
        val next = favourites.value.toMutableSet()
        if (!next.add(id)) next.remove(id)
        favourites.value = next
        prefs.edit().putStringSet("favourites", next).apply()
    }

    // ---- simple key-value store for tools (notes, checklist) ----
    fun saveString(key: String, value: String) {
        prefs.edit().putString(key, value).apply()
    }

    fun loadString(key: String, default: String = ""): String =
        prefs.getString(key, default) ?: default
}
