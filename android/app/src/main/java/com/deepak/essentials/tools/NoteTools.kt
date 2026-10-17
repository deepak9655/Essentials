@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.deepak.essentials.tools

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.deepak.essentials.data.Settings
import com.deepak.essentials.ui.Hint
import com.deepak.essentials.ui.LabeledField
import com.deepak.essentials.ui.PrimaryButton
import com.deepak.essentials.ui.ResultCard
import com.deepak.essentials.ui.StatGrid
import com.deepak.essentials.ui.ToolPage
import com.deepak.essentials.ui.tonalCard
import org.json.JSONArray
import org.json.JSONObject

/* ================================== Notes ================================== */

@Composable
fun NotesTool(onBack: () -> Unit) {
    ToolPage("Notes", onBack) {
        var title by remember { mutableStateOf("") }
        var body by remember { mutableStateOf("") }
        var notes by remember { mutableStateOf(loadNotes()) }

        LabeledField("Title", title, { title = it })
        OutlinedTextField(
            value = body,
            onValueChange = { body = it },
            label = { Text("Note") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            minLines = 3,
        )
        PrimaryButton("＋ Add note") {
            if (title.isNotBlank() || body.isNotBlank()) {
                notes = listOf(mapOf("title" to title, "body" to body)) + notes
                saveNotes(notes)
                title = ""; body = ""
            }
        }
        if (notes.isEmpty()) {
            ResultCard("🗒️", "No notes yet — add one above")
        }
        notes.forEachIndexed { i, note ->
            Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = tonalCard()), modifier = Modifier.fillMaxWidth()) {
                Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(note["title"] ?: "", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(note["body"] ?: "", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Button(onClick = {
                        notes = notes.filterIndexed { j, _ -> j != i }
                        saveNotes(notes)
                    }) { Text("Delete", fontSize = 11.sp) }
                }
            }
        }
    }
}

private fun loadNotes(): List<Map<String, String>> {
    val raw = Settings.loadString("notes", "[]")
    return try {
        val arr = JSONArray(raw)
        (0 until arr.length()).map { i ->
            val o = arr.getJSONObject(i)
            mapOf("title" to (o.optString("title")), "body" to (o.optString("body")))
        }
    } catch (e: Exception) { emptyList() }
}

private fun saveNotes(notes: List<Map<String, String>>) {
    val arr = JSONArray()
    notes.forEach { n ->
        arr.put(JSONObject().put("title", n["title"]).put("body", n["body"]))
    }
    Settings.saveString("notes", arr.toString())
}

/* ================================= Checklist ================================= */

@Composable
fun ChecklistTool(onBack: () -> Unit) {
    ToolPage("Checklist", onBack) {
        var input by remember { mutableStateOf("") }
        var items by remember { mutableStateOf(loadChecklist()) }

        fun persist() = saveChecklist(items)

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
                value = input,
                onValueChange = { input = it },
                label = { Text("New task") },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(16.dp),
                singleLine = true,
            )
            Button(onClick = {
                if (input.isNotBlank()) {
                    items = items + mapOf("text" to input.trim(), "done" to "false")
                    input = ""
                    persist()
                }
            }) { Text("Add") }
        }

        val doneCount = items.count { it["done"] == "true" }
        StatGrid(listOf("Tasks" to items.size.toString(), "Done" to doneCount.toString(), "Progress" to if (items.isEmpty()) "0%" else "${doneCount * 100 / items.size}%"))

        items.forEachIndexed { i, item ->
            Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = tonalCard()), modifier = Modifier.fillMaxWidth()) {
                Row(Modifier.padding(horizontal = 12.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = item["done"] == "true",
                        onCheckedChange = {
                            items = items.mapIndexed { j, m -> if (j == i) m + ("done" to (item["done"] != "true").toString()) else m }
                            persist()
                        },
                    )
                    Text(
                        item["text"] ?: "",
                        modifier = Modifier.weight(1f),
                        textDecoration = if (item["done"] == "true") TextDecoration.LineThrough else null,
                        color = if (item["done"] == "true") MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface,
                    )
                    Button(onClick = {
                        items = items.filterIndexed { j, _ -> j != i }
                        persist()
                    }) { Text("✕", fontSize = 12.sp) }
                }
            }
        }
        PrimaryButton("Clear completed") {
            items = items.filter { it["done"] != "true" }
            persist()
        }
    }
}

private fun loadChecklist(): List<Map<String, String>> {
    val raw = Settings.loadString("checklist", "[]")
    return try {
        val arr = JSONArray(raw)
        (0 until arr.length()).map { i ->
            val o = arr.getJSONObject(i)
            mapOf("text" to o.optString("text"), "done" to o.optString("done"))
        }
    } catch (e: Exception) { emptyList() }
}

private fun saveChecklist(items: List<Map<String, String>>) {
    val arr = JSONArray()
    items.forEach { m -> arr.put(JSONObject().put("text", m["text"]).put("done", m["done"])) }
    Settings.saveString("checklist", arr.toString())
}

/* ================================ Credit Card ================================ */

@Composable
fun CreditCardTool(onBack: () -> Unit) {
    ToolPage("Credit Card Validator", onBack) {
        var number by remember { mutableStateOf("4242 4242 4242 4242") }

        val clean = number.filter { it.isDigit() }
        val valid = clean.length in 13..19 && luhn(clean)

        val network = when {
            clean.startsWith("4") -> "Visa"
            clean.startsWith("5") || clean.startsWith("2") -> "Mastercard"
            clean.startsWith("3") -> "Amex"
            clean.startsWith("6") -> "Discover / RuPay"
            clean.length < 2 -> "—"
            else -> "Unknown"
        }

        LabeledField("Card number", number, { number = it })
        ResultCard(
            if (clean.isEmpty()) "—" else if (valid) "✓ Valid (Luhn)" else "✗ Invalid",
            "$network · ${clean.length} digits",
            accent = when {
                clean.isEmpty() -> MaterialTheme.colorScheme.primary
                valid -> androidx.compose.ui.graphics.Color(0xFF30D158)
                else -> MaterialTheme.colorScheme.error
            },
        )
        StatGrid(
            listOf(
                "Network" to network,
                "Digits" to clean.length.toString(),
                "Luhn check" to if (valid) "Pass" else "Fail",
                "Masked" to clean.mapIndexed { i, c -> if (i < clean.length - 4) '•' else c }.joinToString(""),
            )
        )
        Hint("Luhn algorithm — the standard checksum used by payment networks. Nothing you type leaves this device.")
    }
}

private fun luhn(digits: String): Boolean {
    var sum = 0
    var alt = false
    for (i in digits.length - 1 downTo 0) {
        var d = digits[i] - '0'
        if (alt) {
            d *= 2
            if (d > 9) d -= 9
        }
        sum += d
        alt = !alt
    }
    return sum % 10 == 0
}
