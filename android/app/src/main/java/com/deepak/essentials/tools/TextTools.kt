@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.deepak.essentials.tools

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.deepak.essentials.ui.Hint
import com.deepak.essentials.ui.ResultCard
import com.deepak.essentials.ui.StatGrid
import com.deepak.essentials.ui.ToolPage

/* ============================== Word Counter ============================== */

@Composable
fun WordCounterTool(onBack: () -> Unit) {
    ToolPage("Word Counter", onBack) {
        var text by remember { mutableStateOf("") }
        val words = text.split(Regex("\\s+")).filter { it.isNotBlank() }
        val chars = text.length
        val charsNoSpace = text.count { !it.isWhitespace() }
        val lines = if (text.isEmpty()) 0 else text.lines().size
        val sentences = text.split(Regex("[.!?]+")).filter { it.isNotBlank() }.size
        val readMin = words.size / 220.0

        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            label = { Text("Type or paste text") },
            modifier = Modifier.fillMaxWidth().heightIn(min = 140.dp),
            shape = RoundedCornerShape(18.dp),
        )
        StatGrid(
            listOf(
                "Words" to words.size.toString(),
                "Characters" to chars.toString(),
                "No spaces" to charsNoSpace.toString(),
                "Lines" to lines.toString(),
                "Sentences" to sentences.toString(),
                "Read time" to (if (readMin < 1) "<1 min" else "${readMin.roundToIntSafe()} min"),
                "Speak time" to (if (words.size / 135.0 < 1) "<1 min" else "${(words.size / 135.0).roundToIntSafe()} min"),
                "Avg word len" to (if (words.isEmpty()) "0" else String.format("%.1f", words.map { it.length }.average())),
            )
        )
    }
}

private fun Double.roundToIntSafe(): Int = kotlin.math.roundToInt(this)

/* ============================== Case Converter ============================== */

@Composable
fun CaseConverterTool(onBack: () -> Unit) {
    ToolPage("Case Converter", onBack) {
        var input by remember { mutableStateOf("Hello beautiful world 2026") }
        var output by remember { mutableStateOf("") }

        fun words(s: String): List<String> =
            s.replace(Regex("([a-z])([A-Z])"), "$1 $2").split(Regex("[^A-Za-z0-9]+")).filter { it.isNotEmpty() }

        val modes: List<Pair<String, (String) -> String>> = listOf(
            "UPPER" to { s: String -> s.uppercase() },
            "lower" to { s: String -> s.lowercase() },
            "Title" to { s: String -> s.lowercase().split(" ").joinToString(" ") { w -> w.replaceFirstChar { it.uppercase() } } },
            "Sentence" to { s: String -> s.lowercase().replaceFirstChar { it.uppercase() } },
            "camelCase" to { s: String -> words(s).mapIndexed { i, w -> if (i == 0) w.lowercase() else w.lowercase().replaceFirstChar { it.uppercase() } }.joinToString("") },
            "PascalCase" to { s: String -> words(s).joinToString("") { w -> w.lowercase().replaceFirstChar { it.uppercase() } } },
            "snake_case" to { s: String -> words(s).joinToString("_") { it.lowercase() } },
            "kebab-case" to { s: String -> words(s).joinToString("-") { it.lowercase() } },
            "CONSTANT" to { s: String -> words(s).joinToString("_") { it.uppercase() } },
        )

        OutlinedTextField(
            value = input,
            onValueChange = { input = it },
            label = { Text("Input") },
            modifier = Modifier.fillMaxWidth().heightIn(min = 110.dp),
            shape = RoundedCornerShape(18.dp),
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.weight(1f)) {
                modes.filterIndexed { i, _ -> i % 2 == 0 }.forEach { (name, fn) -> Button(onClick = { output = fn(input) }) { Text(name, fontSize = 12.sp) } }
            }
            Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.weight(1f)) {
                modes.filterIndexed { i, _ -> i % 2 == 1 }.forEach { (name, fn) -> Button(onClick = { output = fn(input) }) { Text(name, fontSize = 12.sp) } }
            }
        }
        OutlinedTextField(
            value = output,
            onValueChange = {},
            readOnly = true,
            label = { Text("Output") },
            modifier = Modifier.fillMaxWidth().heightIn(min = 90.dp),
            shape = RoundedCornerShape(18.dp),
        )
    }
}

/* ================================= Base64 ================================= */

@Composable
fun Base64Tool(onBack: () -> Unit) {
    ToolPage("Base64", onBack) {
        var input by remember { mutableStateOf("") }
        var output by remember { mutableStateOf("") }
        var error by remember { mutableStateOf(false) }

        OutlinedTextField(
            value = input,
            onValueChange = { input = it },
            label = { Text("Plain text or Base64") },
            modifier = Modifier.fillMaxWidth().heightIn(min = 110.dp),
            shape = RoundedCornerShape(18.dp),
        )
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = {
                output = try {
                    android.util.Base64.encodeToString(input.toByteArray(Charsets.UTF_8), android.util.Base64.NO_WRAP)
                } catch (e: Exception) { error = true; "Encoding failed" }
                error = false
            }, modifier = Modifier.weight(1f)) { Text("Encode →") }
            Button(onClick = {
                output = try {
                    String(android.util.Base64.decode(input.trim(), android.util.Base64.DEFAULT), Charsets.UTF_8)
                } catch (e: Exception) { error = true; "Invalid Base64" }
                error = false
            }, modifier = Modifier.weight(1f)) { Text("← Decode") }
        }
        OutlinedTextField(
            value = output,
            onValueChange = {},
            readOnly = true,
            label = { Text("Output") },
            modifier = Modifier.fillMaxWidth().heightIn(min = 90.dp),
            shape = RoundedCornerShape(18.dp),
        )
        if (error) Hint("Could not process that input.")
    }
}

/* ================================= Lorem Ipsum ================================= */

@Composable
fun LoremTool(onBack: () -> Unit) {
    ToolPage("Lorem Ipsum", onBack) {
        var count by remember { mutableStateOf("3") }
        var output by remember { mutableStateOf("") }
        val words = listOf(
            "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
            "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
            "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
            "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
            "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur",
        )
        fun generate() {
            val n = (count.toIntOrNull() ?: 3).coerceIn(1, 20)
            val rnd = Random
            output = (1..n).joinToString("\n\n") {
                val len = 40 + rnd.nextInt(50)
                val ws = (1..len).map { words[rnd.nextInt(words.size)] }.joinToString(" ")
                ws.replaceFirstChar { it.uppercase() } + "."
            }
        }
        if (output.isEmpty()) generate()
        com.deepak.essentials.ui.LabeledField("Paragraphs (1–20)", count, { count = it }, number = true)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = { generate() }, modifier = Modifier.weight(1f)) { Text("Generate") }
        }
        OutlinedTextField(
            value = output,
            onValueChange = {},
            readOnly = true,
            label = { Text("Output") },
            modifier = Modifier.fillMaxWidth().heightIn(min = 160.dp),
            shape = RoundedCornerShape(18.dp),
            textStyle = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
        )
    }
}

private val Random = kotlin.random.Random

/* ================================= Morse Code ================================= */

@Composable
fun MorseTool(onBack: () -> Unit) {
    val map = mapOf(
        'A' to ".-", 'B' to "-...", 'C' to "-.-.", 'D' to "-..", 'E' to ".", 'F' to "..-.",
        'G' to "--.", 'H' to "....", 'I' to "..", 'J' to ".---", 'K' to "-.-", 'L' to ".-..",
        'M' to "--", 'N' to "-.", 'O' to "---", 'P' to ".--.", 'Q' to "--.-", 'R' to ".-.",
        'S' to "...", 'T' to "-", 'U' to "..-", 'V' to "...-", 'W' to ".--", 'X' to "-..-",
        'Y' to "-.--", 'Z' to "--..",
        '0' to "-----", '1' to ".----", '2' to "..---", '3' to "...--", '4' to "....-",
        '5' to ".....", '6' to "-....", '7' to "--...", '8' to "---..", '9' to "----.",
        '.' to ".-.-.-", ',' to "--..--", '?' to "..--..", '!' to "-.-.--", '/' to "-..-.",
    )
    ToolPage("Morse Code", onBack) {
        var input by remember { mutableStateOf("SOS") }
        var output by remember { mutableStateOf("") }

        val toMorse = input.uppercase().map { map[it] ?: if (it == ' ') "/" else "" }.joinToString(" ")
        val fromMorse = input.trim().split(Regex("\\s+")).joinToString("") { token ->
            if (token == "/") " "
            else map.entries.firstOrNull { it.value == token }?.key?.toString() ?: ""
        }

        com.deepak.essentials.ui.LabeledField("Text or Morse (dots & dashes)", input, { input = it })
        ResultCard(toMorse, "as Morse code")
        ResultCard(fromMorse, "decoded from Morse")
        Hint("Letters map to dots (.) and dashes (−). Words separate with a slash (/) or double space.")
    }
}
