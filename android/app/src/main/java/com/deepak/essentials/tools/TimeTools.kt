@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.deepak.essentials.tools

import android.media.AudioManager
import android.media.ToneGenerator
import android.os.SystemClock
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import kotlinx.coroutines.delay

private fun fmtHMS(millis: Long): String {
    val totalSec = millis / 1000
    val h = totalSec / 3600
    val m = (totalSec % 3600) / 60
    val s = totalSec % 60
    val cs = (millis % 1000) / 10
    return if (h > 0) "%d:%02d:%02d.%02d".format(h, m, s, cs) else "%02d:%02d.%02d".format(m, s, cs)
}

private fun beepTone() {
    try {
        val tone = ToneGenerator(AudioManager.STREAM_MUSIC, 70)
        tone.startTone(ToneGenerator.TONE_PROP_BEEP, 180)
        Thread { Thread.sleep(400); tone.release() }.start()
    } catch (e: Exception) { /* no audio */ }
}

/* ================================= Stopwatch ================================= */

@Composable
fun StopwatchTool(onBack: () -> Unit) {
    ToolPage("Stopwatch", onBack) {
        var running by remember { mutableStateOf(false) }
        var baseElapsed by remember { mutableLongStateOf(0L) }
        var startedAt by remember { mutableLongStateOf(0L) }
        var elapsed by remember { mutableLongStateOf(0L) }
        var laps by remember { mutableStateOf(listOf<Long>()) }

        LaunchedEffect(running) {
            while (running) {
                elapsed = baseElapsed + (SystemClock.elapsedRealtime() - startedAt)
                delay(33)
            }
        }

        Text(
            fmtHMS(elapsed),
            fontSize = 52.sp,
            fontWeight = FontWeight.Light,
            fontFamily = FontFamily.Monospace,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(vertical = 18.dp),
        )
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = {
                if (running) {
                    baseElapsed += SystemClock.elapsedRealtime() - startedAt
                    running = false
                } else {
                    startedAt = SystemClock.elapsedRealtime()
                    running = true
                }
            }, modifier = Modifier.weight(1f)) { Text(if (running) "Pause" else "Start") }
            Button(onClick = {
                if (running) laps = listOf(elapsed) + laps
            }, enabled = running, modifier = Modifier.weight(1f)) { Text("Lap") }
            Button(onClick = {
                running = false; baseElapsed = 0; elapsed = 0; laps = emptyList()
            }, modifier = Modifier.weight(1f)) { Text("Reset") }
        }
        if (laps.isNotEmpty()) {
            Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = tonalCard()), modifier = Modifier.fillMaxWidth()) {
                Column {
                    val best = laps.minOrNull()
                    val worst = laps.maxOrNull()
                    laps.forEachIndexed { i, t ->
                        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Lap ${laps.size - i}", color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(fmtHMS(t), fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace,
                                color = when (t) {
                                    best -> MaterialTheme.colorScheme.primary
                                    worst -> MaterialTheme.colorScheme.error
                                    else -> MaterialTheme.colorScheme.onSurface
                                })
                        }
                    }
                }
            }
        }
    }
}

/* ================================== Timer ================================== */

@Composable
fun TimerTool(onBack: () -> Unit) {
    ToolPage("Timer", onBack) {
        var totalMs by remember { mutableLongStateOf(3 * 60_000L) }
        var remainMs by remember { mutableLongStateOf(3 * 60_000L) }
        var running by remember { mutableStateOf(false) }
        var done by remember { mutableStateOf(false) }
        var targetAt by remember { mutableLongStateOf(0L) }

        LaunchedEffect(running, done) {
            while (running && remainMs > 0) {
                remainMs = (targetAt - System.currentTimeMillis()).coerceAtLeast(0)
                delay(100)
            }
            if (running && remainMs <= 0L && !done) {
                running = false
                done = true
                beepTone()
            }
        }

        ResultCard(
            "%02d:%02d".format(remainMs / 60000, (remainMs % 60000) / 1000),
            if (done) "Time's up!" else if (running) "running…" else "ready · ${totalMs / 60000} min set",
            accent = if (done) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(1L, 3L, 5L, 10L, 25L).forEach { min ->
                Button(onClick = {
                    totalMs = min * 60000; remainMs = totalMs; running = false; done = false
                }) { Text("${min}m", fontSize = 12.sp) }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = {
                if (running) {
                    running = false
                } else {
                    if (done || remainMs <= 0) remainMs = totalMs
                    done = false
                    targetAt = System.currentTimeMillis() + remainMs
                    running = true
                }
            }, modifier = Modifier.weight(1f)) { Text(if (running) "Pause" else "Start") }
            Button(onClick = { running = false; remainMs = totalMs; done = false }, modifier = Modifier.weight(1f)) { Text("Reset") }
        }
    }
}

/* ================================= Pomodoro ================================= */

@Composable
fun PomodoroTool(onBack: () -> Unit) {
    ToolPage("Pomodoro", onBack) {
        var phase by remember { mutableStateOf("Focus") }
        var remainMs by remember { mutableLongStateOf(25 * 60_000L) }
        var running by remember { mutableStateOf(false) }
        var sessions by remember { mutableStateOf(0) }
        var targetAt by remember { mutableLongStateOf(0L) }

        LaunchedEffect(running) {
            while (running && remainMs > 0) {
                remainMs = (targetAt - System.currentTimeMillis()).coerceAtLeast(0)
                delay(200)
            }
            if (running && remainMs <= 0L) {
                beepTone()
                if (phase == "Focus") {
                    sessions++
                    phase = if (sessions % 4 == 0) "Long break" else "Short break"
                    remainMs = (if (phase == "Long break") 15 else 5) * 60_000L
                } else {
                    phase = "Focus"
                    remainMs = 25 * 60_000L
                }
                targetAt = System.currentTimeMillis() + remainMs
            }
        }

        ResultCard(
            "%02d:%02d".format(remainMs / 60000, (remainMs % 60000) / 1000),
            "$phase · $sessions session(s) completed",
            accent = if (phase == "Focus") MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = {
                if (running) running = false
                else { targetAt = System.currentTimeMillis() + remainMs; running = true }
            }, modifier = Modifier.weight(1f)) { Text(if (running) "Pause" else "Start") }
            Button(onClick = {
                running = false
                if (phase == "Focus") {
                    sessions++
                    phase = if (sessions % 4 == 0) "Long break" else "Short break"
                    remainMs = (if (phase == "Long break") 15 else 5) * 60_000L
                } else {
                    phase = "Focus"; remainMs = 25 * 60_000L
                }
            }, modifier = Modifier.weight(1f)) { Text("Skip") }
            Button(onClick = {
                running = false; phase = "Focus"; remainMs = 25 * 60_000L
            }, modifier = Modifier.weight(1f)) { Text("Reset") }
        }
        Hint("Classic Pomodoro — 25 min focus, 5 min short break, 15 min long break after 4 sessions.")
    }
}

/* ================================ World Clock ================================ */

@Composable
fun WorldClockTool(onBack: () -> Unit) {
    ToolPage("World Clock", onBack) {
        var now by remember { mutableStateOf(ZonedDateTime.now()) }
        LaunchedEffect(Unit) {
            while (true) { now = ZonedDateTime.now(); delay(1000) }
        }
        val zones = listOf(
            "Chennai" to "Asia/Kolkata", "Mumbai" to "Asia/Kolkata", "Dubai" to "Asia/Dubai",
            "Singapore" to "Asia/Singapore", "Tokyo" to "Asia/Tokyo", "Sydney" to "Australia/Sydney",
            "London" to "Europe/London", "Paris" to "Europe/Paris", "New York" to "America/New_York",
            "San Francisco" to "America/Los_Angeles", "São Paulo" to "America/Sao_Paulo",
        )
        val timeFmt = DateTimeFormatter.ofPattern("hh:mm a")
        val dateFmt = DateTimeFormatter.ofPattern("EEE, MMM d")

        ResultCard(
            now.format(DateTimeFormatter.ofPattern("HH:mm:ss")),
            now.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")),
        )
        Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = tonalCard()), modifier = Modifier.fillMaxWidth()) {
            Column {
                zones.forEach { (city, zone) ->
                    val zoned = now.withZoneSameInstant(ZoneId.of(zone))
                    Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 11.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column {
                            Text(city, fontWeight = FontWeight.SemiBold)
                            Text(zoned.format(dateFmt), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text(zoned.format(timeFmt), fontWeight = FontWeight.Bold, fontSize = 17.sp)
                    }
                }
            }
        }
    }
}

/* ================================= Unix Time ================================= */

@Composable
fun UnixTimeTool(onBack: () -> Unit) {
    ToolPage("Unix Time", onBack) {
        var now by remember { mutableStateOf(System.currentTimeMillis()) }
        LaunchedEffect(Unit) {
            while (true) { now = System.currentTimeMillis(); delay(250) }
        }
        var epochInput by remember { mutableStateOf("") }
        var dateInput by remember { mutableStateOf("2026-01-01 15:30") }

        ResultCard((now / 1000).toString(), "seconds since epoch · ms: $now")
        LabeledField("Epoch (seconds or ms)", epochInput, { epochInput = it }, number = true)
        val parsedDate = epochInput.toLongOrNull()?.let { raw ->
            val ms = if (raw.toString().length <= 10) raw * 1000 else raw
            try {
                LocalDateTime.ofInstant(Instant.ofEpochMilli(ms), ZoneId.systemDefault())
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
            } catch (e: Exception) { "invalid" }
        } ?: "—"
        ResultCard(parsedDate, "as local date-time")

        LabeledField("Date-time (yyyy-MM-dd HH:mm)", dateInput, { dateInput = it })
        val parsedEpoch = try {
            LocalDateTime.parse(dateInput.replace(" ", "T").let { if (it.length == 10) it + "T00:00" else it })
                .atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
        } catch (e: Exception) { null }
        ResultCard(parsedEpoch?.let { "${it / 1000}  ·  $it ms" } ?: "—", "as epoch")
        PrimaryButton("Now → epoch field") { epochInput = (System.currentTimeMillis() / 1000).toString() }
    }
}

/* ================================== Sleep ================================== */

@Composable
fun SleepTool(onBack: () -> Unit) {
    ToolPage("Sleep", onBack) {
        var hour by remember { mutableStateOf("7") }
        var minute by remember { mutableStateOf("00") }
        var mode by remember { mutableStateOf("I want to wake at") }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { mode = "I want to wake at" }, enabled = mode != "I want to wake at") { Text("Wake time", fontSize = 11.sp) }
            Button(onClick = { mode = "I want to sleep at" }, enabled = mode != "I want to sleep at") { Text("Bedtime", fontSize = 11.sp) }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Column(Modifier.weight(1f)) { LabeledField("Hour (0–23)", hour, { hour = it }, number = true) }
            Column(Modifier.weight(1f)) { LabeledField("Minute", minute, { minute = it }, number = true) }
        }

        val h = (hour.toIntOrNull() ?: 7).coerceIn(0, 23)
        val m = (minute.toIntOrNull() ?: 0).coerceIn(0, 59)
        val target = LocalTime.of(h, m)
        val cycleMin = 90
        val fallAsleepMin = 15
        val fmt = DateTimeFormatter.ofPattern("hh:mm a")

        Text(mode, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        val rows = (6 downTo 3).map { cycles ->
            val mins = cycles * cycleMin + fallAsleepMin
            val t = if (mode == "I want to wake at") target.minusMinutes(mins.toLong()) else target.plusMinutes(mins.toLong())
            val label = "${cycles} cycles · ${cycles * cycleMin / 60}h ${cycles * cycleMin % 60}m"
            t.format(fmt) to label
        }
        Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = tonalCard()), modifier = Modifier.fillMaxWidth()) {
            Column {
                rows.forEachIndexed { i, (time, label) ->
                    Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text(time, fontSize = 19.sp, fontWeight = FontWeight.Bold)
                            Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        if (i == 1) Text("★ best", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        Hint("Sleep cycles run ~90 minutes. Falling asleep takes about 15 minutes on average. 4–6 cycles is the healthy range.")
    }
}

/* ================================= Metronome ================================= */

@Composable
fun MetronomeTool(onBack: () -> Unit) {
    ToolPage("Metronome", onBack) {
        var bpm by remember { mutableStateOf(100) }
        var playing by remember { mutableStateOf(false) }
        var beat by remember { mutableStateOf(0) }
        var tapTimes by remember { mutableStateOf(listOf<Long>()) }

        LaunchedEffect(playing, bpm) {
            if (playing) {
                try {
                    val tone = ToneGenerator(AudioManager.STREAM_MUSIC, 60)
                    while (playing) {
                        tone.startTone(ToneGenerator.TONE_PROP_BEEP, 40)
                        beat++
                        delay(60_000L / bpm)
                    }
                    tone.release()
                } catch (e: Exception) { playing = false }
            }
        }

        ResultCard("♩ = $bpm", if (playing) "playing · beat $beat" else "stopped")
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = { if (bpm > 30) bpm-- }, modifier = Modifier.weight(1f)) { Text("−5", fontSize = 12.sp) }
            Button(onClick = { if (bpm < 240) bpm++ }, modifier = Modifier.weight(1f)) { Text("+5", fontSize = 12.sp) }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            PrimaryButton(if (playing) "■ Stop" else "▶ Start") { playing = !playing }
        }
        PrimaryButton("Tap tempo") {
            val now = SystemClock.elapsedRealtime()
            tapTimes = (tapTimes + now).takeLast(5)
            if (tapTimes.size >= 2) {
                val gaps = tapTimes.zipWithNext { a, b -> b - a }
                val avg = gaps.average()
                if (avg > 0) bpm = (60_000 / avg).toInt().coerceIn(30, 240)
            }
        }
        Hint("Tap the beat manually and the metronome locks onto your rhythm.")
    }
}
