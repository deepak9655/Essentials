@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.deepak.essentials.tools

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.deepak.essentials.ui.Hint
import com.deepak.essentials.ui.LabeledField
import com.deepak.essentials.ui.PrimaryButton
import com.deepak.essentials.ui.ResultCard
import com.deepak.essentials.ui.StatGrid
import com.deepak.essentials.ui.ToolPage
import com.deepak.essentials.ui.tonalCard
import java.util.UUID
import kotlin.math.roundToInt
import kotlin.random.Random

/* ============================= Password Generator ============================= */

@Composable
fun PasswordTool(onBack: () -> Unit) {
    ToolPage("Password", onBack) {
        var length by remember { mutableFloatStateOf(18f) }
        var upper by remember { mutableStateOf(true) }
        var lower by remember { mutableStateOf(true) }
        var digits by remember { mutableStateOf(true) }
        var symbols by remember { mutableStateOf(true) }
        var avoidLook by remember { mutableStateOf(true) }
        var password by remember { mutableStateOf("") }

        fun generate() {
            var pool = ""
            if (upper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            if (lower) pool += "abcdefghijklmnopqrstuvwxyz"
            if (digits) pool += "0123456789"
            if (symbols) pool += "!@#\$%^&*()-_=+[]{};:,.<>?/|~"
            if (avoidLook) pool = pool.replace(Regex("[O0oIl1|`'\"\\s]"), "")
            if (pool.isEmpty()) { password = "Select at least one set"; return }
            password = (1..length.toInt()).map { pool[Random.nextInt(pool.length)] }.joinToString("")
        }
        if (password.isEmpty()) generate()

        val entropy = length.toInt() * kotlin.math.log2(if (avoidLook) 70.0 else 90.0)
        val (strength, color) = when {
            entropy > 90 -> "Excellent" to Color(0xFF30D158)
            entropy > 65 -> "Strong" to Color(0xFF0A84FF)
            entropy > 45 -> "Fair" to Color(0xFFFF9F0A)
            else -> "Weak" to Color(0xFFFF453A)
        }

        ResultCard(password, "$strength · ~${entropy.roundToInt()} bits of entropy", accent = color)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Length: ${length.toInt()}", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 10.dp))
        }
        Slider(value = length, onValueChange = { length = it }, valueRange = 6f..64f)

        Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = tonalCard()), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
                @Composable
                fun switchRow(label: String, state: Boolean, onChange: (Boolean) -> Unit) {
                    Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text(label)
                        Switch(checked = state, onCheckedChange = onChange)
                    }
                }
                switchRow("Uppercase (A–Z)", upper) { upper = it }
                switchRow("Lowercase (a–z)", lower) { lower = it }
                switchRow("Digits (0–9)", digits) { digits = it }
                switchRow("Symbols (!@#\$…)", symbols) { symbols = it }
                switchRow("Avoid look-alikes (O/0/l/1)", avoidLook) { avoidLook = it }
            }
        }
        PrimaryButton("↻ Generate") { generate() }
    }
}

/* ================================ PIN Generator ================================ */

@Composable
fun PinTool(onBack: () -> Unit) {
    ToolPage("PIN Generator", onBack) {
        var digits by remember { mutableIntStateOf(6) }
        var unique by remember { mutableStateOf(false) }
        var pin by remember { mutableStateOf("") }

        fun generate() {
            if (unique && digits > 10) digits = 10
            val used = mutableSetOf<Int>()
            val sb = StringBuilder()
            while (sb.length < digits) {
                val d = Random.nextInt(10)
                if (unique && !used.add(d)) continue
                sb.append(d)
            }
            pin = sb.toString()
        }
        if (pin.isEmpty()) generate()

        ResultCard(pin, if (unique) "unique digits" else "digits may repeat")
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = { if (digits > 3) digits-- }) { Text("−") }
            Text("$digits digits", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 14.dp))
            Button(onClick = { if (digits < 12) digits++ }) { Text("+") }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Unique digits only", fontWeight = FontWeight.Medium)
            Switch(checked = unique, onCheckedChange = { unique = it; generate() })
        }
        PrimaryButton("↻ Generate PIN") { generate() }
    }
}

/* ================================== UUID ================================== */

@Composable
fun UuidTool(onBack: () -> Unit) {
    ToolPage("UUID", onBack) {
        var count by remember { mutableIntStateOf(5) }
        var list by remember { mutableStateOf(List(5) { UUID.randomUUID().toString() }) }
        Text("Tap Regenerate for fresh v4 identifiers", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        list.forEachIndexed { i, u ->
            Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = tonalCard()), modifier = Modifier.fillMaxWidth()) {
                Text("#${i + 1}  $u", fontFamily = FontFamily.Monospace, fontSize = 13.sp, modifier = Modifier.padding(12.dp))
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = { if (count > 1) { count--; list = List(count) { UUID.randomUUID().toString() } } }) { Text("−") }
            Text("$count UUIDs", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 14.dp))
            Button(onClick = { if (count < 20) { count++; list = List(count) { UUID.randomUUID().toString() } } }) { Text("+") }
        }
        PrimaryButton("↻ Regenerate") { list = List(count) { UUID.randomUUID().toString() } }
    }
}

/* =============================== Random Number =============================== */

@Composable
fun RandomNumberTool(onBack: () -> Unit) {
    ToolPage("Random Number", onBack) {
        var min by remember { mutableStateOf("1") }
        var max by remember { mutableStateOf("100") }
        var count by remember { mutableIntStateOf(1) }
        var unique by remember { mutableStateOf(false) }
        var results by remember { mutableStateOf(listOf<Int>()) }

        fun generate() {
            val lo = (min.toIntOrNull() ?: 0)
            val hi = (max.toIntOrNull() ?: 100)
            val a = minOf(lo, hi); val b = maxOf(lo, hi)
            if (unique && b - a + 1 < count) { results = emptyList(); return }
            val out = mutableListOf<Int>()
            val used = mutableSetOf<Int>()
            while (out.size < count) {
                val v = Random.nextInt(a, b + 1)
                if (unique && !used.add(v)) continue
                out.add(v)
            }
            results = out
        }
        if (results.isEmpty()) generate()

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Column(Modifier.weight(1f)) { LabeledField("Min", min, { min = it }, number = true) }
            Column(Modifier.weight(1f)) { LabeledField("Max", max, { max = it }, number = true) }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = { if (count > 1) { count--; generate() } }) { Text("−") }
            Text("$count number(s)", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 14.dp))
            Button(onClick = { if (count < 20) { count++; generate() } }) { Text("+") }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Unique values only", fontWeight = FontWeight.Medium)
            Switch(checked = unique, onCheckedChange = { unique = it; generate() })
        }
        ResultCard(results.joinToString("  ·  "), "tap generate for new draws")
        PrimaryButton("↻ Generate") { generate() }
    }
}

/* ================================ Dice & Coin ================================ */

@Composable
fun DiceCoinTool(onBack: () -> Unit) {
    ToolPage("Dice & Coin", onBack) {
        var mode by remember { mutableStateOf("dice") }
        var sides by remember { mutableIntStateOf(6) }
        var count by remember { mutableIntStateOf(1) }
        var outcome by remember { mutableStateOf("Tap to roll") }

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = { mode = "dice" }, enabled = mode != "dice") { Text("Dice") }
            Button(onClick = { mode = "coin" }, enabled = mode != "coin") { Text("Coin") }
        }
        if (mode == "dice") {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(onClick = { if (count > 1) count-- }) { Text("−") }
                Text("$count × d$sides", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 14.dp))
                Button(onClick = { if (count < 6) count++ }) { Text("+") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(4, 6, 8, 10, 12, 20).forEach { s ->
                    Button(onClick = { sides = s }) { Text("d$s") }
                }
            }
        }
        ResultCard(outcome, if (mode == "dice") "$count × d$sides" else "fair coin")
        PrimaryButton(if (mode == "dice") "🎲 Roll" else "🪙 Flip") {
            outcome = if (mode == "dice") {
                val rolls = (1..count).map { Random.nextInt(1, sides + 1) }
                if (count == 1) rolls[0].toString() else rolls.joinToString(" + ") + " = " + rolls.sum()
            } else {
                if (Random.nextBoolean()) "Heads!" else "Tails!"
            }
        }
    }
}

/* ================================== Picker ================================== */

@Composable
fun PickerTool(onBack: () -> Unit) {
    ToolPage("Picker", onBack) {
        var input by remember { mutableStateOf("Ava\nBen\nChitra\nDev\nElena\nFarah") }
        var count by remember { mutableIntStateOf(1) }
        var result by remember { mutableStateOf(listOf<String>()) }

        fun pick() {
            val items = input.lines().map { it.trim() }.filter { it.isNotEmpty() }
            if (items.isEmpty()) { result = emptyList(); return }
            val k = minOf(count, items.size)
            result = items.shuffled().take(k)
        }
        if (result.isEmpty()) pick()

        LabeledField("One entry per line", input, { input = it })
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = { if (count > 1) count-- }) { Text("−") }
            Text("Pick $count", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 14.dp))
            Button(onClick = { if (count < 10) count++ }) { Text("+") }
        }
        ResultCard(result.joinToString("   ·   "), "${result.size} picked")
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            PrimaryButton("🎲 Pick") { pick() }
        }
    }
}

/* ================================== Gradient ================================== */

@Composable
fun GradientTool(onBack: () -> Unit) {
    ToolPage("Gradient", onBack) {
        var angle by remember { mutableFloatStateOf(135f) }
        var color1 by remember { mutableStateOf("#5E5CE6") }
        var color2 by remember { mutableStateOf("#0A84FF") }

        fun parse(hex: String): Color = try {
            Color(android.graphics.Color.parseColor(hex))
        } catch (e: Exception) { Color.Gray }

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Column(Modifier.weight(1f)) { LabeledField("Color 1", color1, { color1 = it }) }
            Column(Modifier.weight(1f)) { LabeledField("Color 2", color2, { color2 = it }) }
        }
        Box(
            Modifier.fillMaxWidth().height(140.dp).background(
                brush = androidx.compose.ui.graphics.Brush.linearGradient(listOf(parse(color1), parse(color2))),
                shape = RoundedCornerShape(22.dp),
            )
        )
        Text("Angle: ${angle.toInt()}°", fontWeight = FontWeight.SemiBold)
        Slider(value = angle, onValueChange = { angle = it }, valueRange = 0f..360f)
        Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = tonalCard()), modifier = Modifier.fillMaxWidth()) {
            Text(
                "background: linear-gradient(${angle.toInt()}deg, $color1, $color2);",
                fontFamily = FontFamily.Monospace,
                fontSize = 13.sp,
                modifier = Modifier.padding(14.dp),
            )
        }
        PrimaryButton("🎲 Randomize") {
            val rnd = List(3) { Random.nextInt(0, 256) }
            color1 = color2
            color2 = "#%02X%02X%02X".format(rnd[0], rnd[1], rnd[2])
        }
    }
}

/* ================================== Palette ================================== */

@Composable
fun PaletteTool(onBack: () -> Unit) {
    ToolPage("Palette", onBack) {
        var base by remember { mutableStateOf("#5E5CE6") }
        var harmony by remember { mutableStateOf("Analogous") }

        fun hslOf(hex: String): FloatArray {
            val c = try { android.graphics.Color.parseColor(hex) } catch (e: Exception) { return floatArrayOf(0f, 0f, 0.5f) }
            val hsl = FloatArray(3)
            android.graphics.Color.colorToHSV(c, hsl)
            return hsl
        }
        fun hsvToHex(h: Float, s: Float, v: Float): String {
            val c = android.graphics.Color.HSVToColor(floatArrayOf((h % 360 + 360) % 360, s.coerceIn(0f, 1f), v.coerceIn(0f, 1f)))
            return "#%06X".format(0xFFFFFF and c)
        }

        LabeledField("Base color", base, { base = it })
        val hsl = hslOf(base)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Analogous", "Complement", "Triadic", "Mono").forEach { h ->
                Button(onClick = { harmony = h }, enabled = harmony != h) { Text(h, fontSize = 11.sp) }
            }
        }
        val colors = when (harmony) {
            "Complement" -> listOf(hsvToHex(hsl[0], hsl[1], hsl[2]), hsvToHex(hsl[0] + 180, hsl[1], hsl[2]))
            "Triadic" -> listOf(0f, 120f, 240f).map { hsvToHex(hsl[0] + it, hsl[1], hsl[2]) }
            "Mono" -> listOf(0.85f, 0.65f, 0.45f, 0.3f).map { hsvToHex(hsl[0], hsl[1], it) }
            else -> listOf(-40f, -20f, 0f, 20f, 40f).map { hsvToHex(hsl[0] + it, hsl[1], hsl[2]) }
        }
        colors.forEach { hex ->
            Row(Modifier.fillMaxWidth().height(52.dp).background(Color(android.graphics.Color.parseColor(hex)), RoundedCornerShape(14.dp)).padding(horizontal = 16.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(hex, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
            }
        }
        Hint("Tap-hold any hex to copy it from your keyboard clipboard tools. Values computed in HSV space.")
    }
}
