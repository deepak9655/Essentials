@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.deepak.essentials.tools

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.deepak.essentials.ui.DropdownField
import com.deepak.essentials.ui.Hint
import com.deepak.essentials.ui.LabeledField
import com.deepak.essentials.ui.ResultCard
import com.deepak.essentials.ui.StatGrid
import com.deepak.essentials.ui.ToolPage
import java.time.LocalDate
import java.time.Period
import kotlin.math.pow
import kotlin.math.sqrt

/* ============================== Calculator ============================== */

@Composable
fun CalculatorTool(onBack: () -> Unit) {
    ToolPage("Calculator", onBack) {
        var display by remember { mutableStateOf("0") }
        var acc by remember { mutableStateOf(0.0) }
        var pendingOp by remember { mutableStateOf("") }
        var freshEntry by remember { mutableStateOf(true) }

        fun applyPending(current: Double): Double = when (pendingOp) {
            "+" -> acc + current
            "−" -> acc - current
            "×" -> acc * current
            "÷" -> if (current == 0.0) Double.NaN else acc / current
            else -> current
        }

        fun pressDigit(d: String) {
            if (freshEntry) { display = if (d == ".") "0." else d; freshEntry = false }
            else {
                if (d == "." && display.contains(".")) return
                display = if (display == "0" && d != ".") d else display + d
            }
        }

        fun pressOp(op: String) {
            val current = display.toDoubleOrNull() ?: 0.0
            val result = applyPending(current)
            acc = result
            display = formatNum(result)
            pendingOp = op
            freshEntry = true
        }

        fun pressEquals() {
            val current = display.toDoubleOrNull() ?: 0.0
            val result = applyPending(current)
            display = formatNum(result)
            acc = 0.0
            pendingOp = ""
            freshEntry = true
        }

        ResultCard(display.ifEmpty { "0" }, if (pendingOp.isNotEmpty()) "pending: $pendingOp" else " ")

        val dim = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.onSurface)
        val ops = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primaryContainer, contentColor = MaterialTheme.colorScheme.onPrimaryContainer)
        val eq = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary)

        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CalcKey("AC", dim) { display = "0"; acc = 0.0; pendingOp = ""; freshEntry = true }
                CalcKey("±", dim) {
                    val v = display.toDoubleOrNull() ?: 0.0
                    display = formatNum(-v)
                }
                CalcKey("√", dim) {
                    val v = display.toDoubleOrNull() ?: 0.0
                    display = formatNum(sqrt(v)); freshEntry = true
                }
                CalcKey("÷", ops) { pressOp("÷") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CalcKey("7", dim) { pressDigit("7") }
                CalcKey("8", dim) { pressDigit("8") }
                CalcKey("9", dim) { pressDigit("9") }
                CalcKey("×", ops) { pressOp("×") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CalcKey("4", dim) { pressDigit("4") }
                CalcKey("5", dim) { pressDigit("5") }
                CalcKey("6", dim) { pressDigit("6") }
                CalcKey("−", ops) { pressOp("−") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CalcKey("1", dim) { pressDigit("1") }
                CalcKey("2", dim) { pressDigit("2") }
                CalcKey("3", dim) { pressDigit("3") }
                CalcKey("+", ops) { pressOp("+") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CalcKey("0", dim, weight = 2f) { pressDigit("0") }
                CalcKey(".", dim) { pressDigit(".") }
                CalcKey("=", eq) { pressEquals() }
            }
        }
    }
}

// Row-scoped calculator key with flexible weight.
@Composable
private fun androidx.compose.foundation.layout.RowScope.CalcKey(
    label: String,
    colors: androidx.compose.material3.ButtonColors,
    weight: Float = 1f,
    onClick: () -> Unit,
) {
    Button(
        onClick = onClick,
        shape = RoundedCornerShape(20.dp),
        colors = colors,
        modifier = Modifier.height(64.dp).weight(weight),
    ) { Text(label, fontSize = 22.sp, fontWeight = FontWeight.Medium) }
}

internal fun formatNum(v: Double): String {
    if (v.isNaN()) return "Error"
    if (v.isInfinite()) return if (v > 0) "∞" else "-∞"
    return if (v == Math.floor(v) && kotlin.math.abs(v) < 1e15) {
        v.toLong().toString()
    } else {
        String.format(java.util.Locale.US, "%.8f", v).trimEnd('0').trimEnd('.')
    }
}

/* ============================ Unit Converter ============================ */

@Composable
fun UnitConverterTool(onBack: () -> Unit) {
    val units = mapOf(
        "Length" to listOf("m" to 1.0, "km" to 1000.0, "cm" to 0.01, "mm" to 0.001, "mi" to 1609.344, "ft" to 0.3048, "in" to 0.0254, "yd" to 0.9144),
        "Mass" to listOf("kg" to 1.0, "g" to 0.001, "lb" to 0.45359237, "oz" to 0.028349523, "t" to 1000.0, "st" to 6.35029318),
        "Area" to listOf("m²" to 1.0, "km²" to 1e6, "ft²" to 0.09290304, "ac" to 4046.8564224, "ha" to 10000.0),
        "Volume" to listOf("L" to 1.0, "mL" to 0.001, "m³" to 1000.0, "gal" to 3.785411784, "cup" to 0.2365882365, "fl oz" to 0.0295735296),
        "Speed" to listOf("m/s" to 1.0, "km/h" to 0.2777777778, "mph" to 0.44704, "kn" to 0.5144444444),
        "Time" to listOf("s" to 1.0, "min" to 60.0, "h" to 3600.0, "day" to 86400.0, "week" to 604800.0),
        "Data" to listOf("B" to 1.0, "KB" to 1024.0, "MB" to 1048576.0, "GB" to 1073741824.0, "TB" to 1099511627776.0),
    )
    val tempUnits = listOf("°C", "°F", "K")
    ToolPage("Unit Converter", onBack) {
        var category by remember { mutableStateOf(units.keys.first()) }
        var from by remember { mutableStateOf("") }
        var to by remember { mutableStateOf("") }
        var input by remember { mutableStateOf("1") }

        val isTemp = category == "Temperature"
        val names = if (isTemp) tempUnits else units[category]!!.map { it.first }
        val fromSel = if (from in names) from else names[0]
        val toSel = if (to in names && to != fromSel) to else names.getOrElse(1) { names[0] }
        from = fromSel
        to = toSel

        val v = input.toDoubleOrNull() ?: 0.0
        val result = if (isTemp) {
            val c = when (fromSel) { "°C" -> v; "°F" -> (v - 32) * 5 / 9; else -> v - 273.15 }
            when (toSel) { "°C" -> c; "°F" -> c * 9 / 5 + 32; else -> c + 273.15 }
        } else {
            val table = units[category]!!.toMap()
            val f = table[fromSel] ?: 1.0
            val t = table[toSel] ?: 1.0
            v * f / t
        }

        DropdownField("Category", listOf("Length", "Mass", "Temperature", "Area", "Volume", "Speed", "Time", "Data"), category, { category = it })
        LabeledField("Value", input, { input = it }, number = true)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Column(Modifier.weight(1f)) { DropdownField("From", names, fromSel, { from = it }) }
            Column(Modifier.weight(1f)) { DropdownField("To", names, toSel, { to = it }) }
        }
        ResultCard(formatNum(result), "$input $fromSel = ${formatNum(result)} $toSel")
    }
}

/* ============================== Percentage ============================== */

@Composable
fun PercentageTool(onBack: () -> Unit) {
    ToolPage("Percentage", onBack) {
        var a by remember { mutableStateOf("15") }
        var b by remember { mutableStateOf("200") }
        var from by remember { mutableStateOf("100") }
        var to by remember { mutableStateOf("150") }
        val av = a.toDoubleOrNull() ?: 0.0
        val bv = b.toDoubleOrNull() ?: 0.0
        val fv = from.toDoubleOrNull() ?: 0.0
        val tv = to.toDoubleOrNull() ?: 0.0

        Text("X% of Y", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Column(Modifier.weight(1f)) { LabeledField("X (%)", a, { a = it }, number = true) }
            Column(Modifier.weight(1f)) { LabeledField("Y", b, { b = it }, number = true) }
        }
        ResultCard(formatNum(av / 100 * bv), "${a}% of ${b}")

        Text("X is what % of Y", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Column(Modifier.weight(1f)) { LabeledField("X", from, { from = it }, number = true) }
            Column(Modifier.weight(1f)) { LabeledField("Y", to, { to = it }, number = true) }
        }
        ResultCard(if (tv == 0.0) "—" else formatNum(fv / tv * 100) + "%", "$from is ?% of $to")

        Text("Percentage change", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        val change = if (fv == 0.0) 0.0 else (tv - fv) / kotlin.math.abs(fv) * 100
        ResultCard(formatNum(change) + "%", "$from → $to")
    }
}

/* =============================== Tip & Split =============================== */

@Composable
fun TipSplitTool(onBack: () -> Unit) {
    ToolPage("Tip & Split", onBack) {
        var bill by remember { mutableStateOf("50") }
        var tip by remember { mutableStateOf(18f) }
        var people by remember { mutableStateOf(2) }
        val b = bill.toDoubleOrNull() ?: 0.0
        val tipAmt = b * tip / 100f
        val total = b + tipAmt

        LabeledField("Bill amount", bill, { bill = it }, number = true)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Tip: ${tip.toInt()}%", modifier = Modifier.padding(top = 14.dp), fontWeight = FontWeight.SemiBold)
        }
        Slider(value = tip, onValueChange = { tip = it }, valueRange = 0f..50f)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = { if (people > 1) people-- }) { Text("−") }
            Text("$people people", modifier = Modifier.padding(top = 14.dp), fontWeight = FontWeight.SemiBold)
            Button(onClick = { if (people < 30) people++ }) { Text("+") }
        }
        StatGrid(
            listOf(
                "Tip" to "$${formatNum(tipAmt)}",
                "Total" to "$${formatNum(total)}",
                "Per person" to "$${formatNum(total / people)}",
                "Tip per person" to "$${formatNum(tipAmt / people)}",
            )
        )
    }
}

/* ================================ Discount ================================ */

@Composable
fun DiscountTool(onBack: () -> Unit) {
    ToolPage("Discount", onBack) {
        var price by remember { mutableStateOf("120") }
        var disc by remember { mutableStateOf("25") }
        val p = price.toDoubleOrNull() ?: 0.0
        val d = (disc.toDoubleOrNull() ?: 0.0).coerceIn(0.0, 100.0)
        val save = p * d / 100
        LabeledField("Original price", price, { price = it }, number = true)
        LabeledField("Discount %", disc, { disc = it }, number = true)
        ResultCard("$" + formatNum(p - save), "$d% off $${formatNum(p)}")
        StatGrid(listOf("You save" to "$" + formatNum(save), "Final price" to "$" + formatNum(p - save)))
    }
}

/* ================================== BMI ================================== */

@Composable
fun BmiTool(onBack: () -> Unit) {
    ToolPage("BMI", onBack) {
        var heightCm by remember { mutableStateOf("172") }
        var weightKg by remember { mutableStateOf("68") }
        val h = (heightCm.toDoubleOrNull() ?: 0.0) / 100
        val w = weightKg.toDoubleOrNull() ?: 0.0
        val bmi = if (h > 0 && w > 0) w / (h * h) else 0.0
        val (label, color) = when {
            bmi < 18.5 -> "Underweight" to MaterialTheme.colorScheme.secondary
            bmi < 25 -> "Normal — healthy range" to MaterialTheme.colorScheme.primary
            bmi < 30 -> "Overweight" to MaterialTheme.colorScheme.tertiary
            else -> "Obese" to MaterialTheme.colorScheme.error
        }
        LabeledField("Height (cm)", heightCm, { heightCm = it }, number = true)
        LabeledField("Weight (kg)", weightKg, { weightKg = it }, number = true)
        ResultCard(if (bmi > 0) String.format("%.1f", bmi) else "—", if (bmi > 0) label else "Enter height & weight", accent = color)
        Hint("BMI = weight (kg) ÷ height (m)². General guidance only — not medical advice.")
    }
}

/* ================================== Age ================================== */

@Composable
fun AgeTool(onBack: () -> Unit) {
    ToolPage("Age", onBack) {
        var day by remember { mutableStateOf("1") }
        var month by remember { mutableStateOf("1") }
        var year by remember { mutableStateOf("2000") }
        val d = day.toIntOrNull() ?: 1
        val m = month.toIntOrNull() ?: 1
        val y = year.toIntOrNull() ?: 2000
        val birth = try { LocalDate.of(y, m, d) } catch (e: Exception) { null }
        val today = LocalDate.now()

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Column(Modifier.weight(1f)) { LabeledField("Day", day, { day = it }, number = true) }
            Column(Modifier.weight(1f)) { LabeledField("Month", month, { month = it }, number = true) }
            Column(Modifier.weight(1f)) { LabeledField("Year", year, { year = it }, number = true) }
        }
        if (birth != null && !birth.isAfter(today)) {
            val period = Period.between(birth, today)
            val totalDays = (today.toEpochDay() - birth.toEpochDay())
            ResultCard("${period.years} years", "${period.months} months · ${period.days} days")
            StatGrid(
                listOf(
                    "Total days" to totalDays.toString(),
                    "Total weeks" to (totalDays / 7).toString(),
                    "Born on" to birth.dayOfWeek.name.lowercase().replaceFirstChar { it.uppercase() },
                    "Next birthday" to (365 - (today.dayOfYear - birth.dayOfYear) + if (today.dayOfYear < birth.dayOfYear) 0 else 0).let {
                        val next = birth.withYear(today.year)
                        val nb = if (!next.isBefore(today)) next else birth.withYear(today.year + 1)
                        "${nb.toEpochDay() - today.toEpochDay()} days"
                    },
                )
            )
        } else {
            ResultCard("—", "Enter a valid birth date")
        }
    }
}

/* ============================= Base Converter ============================= */

@Composable
fun BaseConverterTool(onBack: () -> Unit) {
    ToolPage("Base Converter", onBack) {
        var dec by remember { mutableStateOf("255") }
        var bin by remember { mutableStateOf("") }
        var oct by remember { mutableStateOf("") }
        var hex by remember { mutableStateOf("") }
        var error by remember { mutableStateOf(false) }

        fun push(value: Long) {
            dec = value.toString()
            bin = java.lang.Long.toBinaryString(value)
            oct = java.lang.Long.toOctalString(value)
            hex = java.lang.Long.toHexString(value).uppercase()
            error = false
        }
        fun parse(s: String, radix: Int): Long? =
            try { java.lang.Long.parseLong(s.trim(), radix) } catch (e: Exception) { null }

        LabeledField("Decimal", dec, { s ->
            dec = s
            parse(s, 10)?.let { push(it) } ?: run { error = true }
        }, number = true)
        LabeledField("Binary", bin, { s ->
            bin = s
            parse(s, 2)?.let { push(it) } ?: run { error = true }
        })
        LabeledField("Octal", oct, { s ->
            oct = s
            parse(s, 8)?.let { push(it) } ?: run { error = true }
        })
        LabeledField("Hexadecimal", hex, { s ->
            hex = s
            parse(s, 16)?.let { push(it) } ?: run { error = true }
        })
        if (error) Hint("Invalid digits for that base.")
    }
}

/* =============================== Loan & EMI =============================== */

@Composable
fun LoanEmiTool(onBack: () -> Unit) {
    ToolPage("Loan & EMI", onBack) {
        var principal by remember { mutableStateOf("25000") }
        var rate by remember { mutableStateOf("8.5") }
        var years by remember { mutableStateOf("5") }
        val p = principal.toDoubleOrNull() ?: 0.0
        val annual = rate.toDoubleOrNull() ?: 0.0
        val n = ((years.toDoubleOrNull() ?: 1.0) * 12).toInt().coerceAtLeast(1)
        val r = annual / 12 / 100
        val emi = if (r == 0.0) p / n else p * r * (1 + r).pow(n) / ((1 + r).pow(n) - 1)
        val total = emi * n

        LabeledField("Loan amount", principal, { principal = it }, number = true)
        LabeledField("Interest % per year", rate, { rate = it }, number = true)
        LabeledField("Tenure (years)", years, { years = it }, number = true)
        ResultCard("$" + formatNum(emi) + " / month", "EMI over $n payments")
        StatGrid(
            listOf(
                "Total interest" to "$" + formatNum(total - p),
                "Total paid" to "$" + formatNum(total),
                "Payments" to "$n",
                "Interest ratio" to if (p > 0) String.format("%.1f%%", (total - p) / p * 100) else "—",
            )
        )
    }
}

/* ================================ GCD & LCM ================================ */

@Composable
fun GcdLcmTool(onBack: () -> Unit) {
    ToolPage("GCD & LCM", onBack) {
        var a by remember { mutableStateOf("12") }
        var b by remember { mutableStateOf("18") }
        val av = (a.toLongOrNull() ?: 0L).let { kotlin.math.abs(it) }
        val bv = (b.toLongOrNull() ?: 0L).let { kotlin.math.abs(it) }
        fun gcd(x: Long, y: Long): Long = if (y == 0L) x else gcd(y, x % y)
        val g = if (av == 0L && bv == 0L) 0L else gcd(av, bv)
        val l = if (g == 0L) 0L else av / g * bv

        LabeledField("Number A", a, { a = it }, number = true)
        LabeledField("Number B", b, { b = it }, number = true)
        StatGrid(listOf("GCD (HCF)" to g.toString(), "LCM" to l.toString()))
        Hint("Uses the Euclidean algorithm. LCM × GCD = A × B.")
    }
}

/* ================================ Statistics ================================ */

@Composable
fun StatisticsTool(onBack: () -> Unit) {
    ToolPage("Statistics", onBack) {
        var input by remember { mutableStateOf("2, 4, 4, 4, 5, 5, 7, 9") }
        val xs = input.split(",", " ", ";").mapNotNull { it.trim().toDoubleOrNull() }.sorted()
        if (xs.isEmpty()) {
            LabeledField("Data points", input, { input = it })
            ResultCard("—", "Enter numbers separated by spaces or commas")
            return@ToolPage
        }
        val n = xs.size
        val sum = xs.sum()
        val mean = sum / n
        val median = if (n % 2 == 1) xs[n / 2] else (xs[n / 2 - 1] + xs[n / 2]) / 2
        val mode = xs.groupingBy { it }.eachCount().maxByOrNull { it.value }
        val variance = xs.map { (it - mean).pow(2) }.sum() / n

        LabeledField("Data points", input, { input = it })
        StatGrid(
            listOf(
                "Count" to n.toString(),
                "Sum" to formatNum(sum),
                "Mean" to formatNum(mean),
                "Median" to formatNum(median),
                "Mode" to (mode?.let { "${formatNum(it.key)} (×${it.value})" } ?: "—"),
                "Std dev (σ)" to formatNum(sqrt(variance)),
                "Min" to formatNum(xs.first()),
                "Max" to formatNum(xs.last()),
                "Range" to formatNum(xs.last() - xs.first()),
                "Variance" to formatNum(variance),
            )
        )
    }
}

/* =============================== Roman Numerals =============================== */

@Composable
fun RomanNumeralsTool(onBack: () -> Unit) {
    ToolPage("Roman Numerals", onBack) {
        var number by remember { mutableStateOf("2026") }
        var roman by remember { mutableStateOf("MMXXVI") }

        fun toRoman(num: Int): String {
            if (num < 1 || num > 3999) return "—"
            val table = listOf(1000 to "M", 900 to "CM", 500 to "D", 400 to "CD", 100 to "C", 90 to "XC", 50 to "L", 40 to "XL", 10 to "X", 9 to "IX", 5 to "V", 4 to "IV", 1 to "I")
            var n = num
            val sb = StringBuilder()
            for ((v, s) in table) while (n >= v) { sb.append(s); n -= v }
            return sb.toString()
        }
        fun fromRoman(r: String): Int {
            val v = mapOf('I' to 1, 'V' to 5, 'X' to 10, 'L' to 50, 'C' to 100, 'D' to 500, 'M' to 1000)
            val s = r.uppercase().filter { it in v.keys }
            if (s.isEmpty()) return 0
            var total = 0
            for (i in s.indices) {
                val cur = v[s[i]]!!
                val next = if (i + 1 < s.length) v[s[i + 1]]!! else 0
                total += if (cur < next) -cur else cur
            }
            return total
        }

        LabeledField("Number (1–3999)", number, { number = it; roman = toRoman(number.toIntOrNull() ?: 0) }, number = true)
        ResultCard(toRoman(number.toIntOrNull() ?: 0), "Roman numeral")
        LabeledField("Roman numeral", roman, { roman = it; number = fromRoman(roman).toString() })
        ResultCard(fromRoman(roman).toString(), "Arabic number")
    }
}
