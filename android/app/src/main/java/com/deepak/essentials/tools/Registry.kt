package com.deepak.essentials.tools

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Adjust
import androidx.compose.material.icons.filled.Article
import androidx.compose.material.icons.filled.BatteryFull
import androidx.compose.material.icons.filled.Bedtime
import androidx.compose.material.icons.filled.Cake
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Casino
import androidx.compose.material.icons.filled.CheckBox
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Dialpad
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.FormatSize
import androidx.compose.material.icons.filled.Functions
import androidx.compose.material.icons.filled.Gradient
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Insights
import androidx.compose.material.icons.filled.LooksOne
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.MonitorWeight
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Note
import androidx.compose.material.icons.filled.Numbers
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Password
import androidx.compose.material.icons.filled.Percent
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.RequestQuote
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Sell
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Straighten
import androidx.compose.material.icons.filled.TextFields
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Vibration
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector

data class ToolDef(
    val id: String,
    val name: String,
    val desc: String,
    val cat: String,
    val icon: ImageVector,
)

object Categories {
    const val MATH = "Math & Converters"
    const val GEN = "Generate"
    const val TEXT = "Text & Dev"
    const val TIME = "Time & Focus"
    const val DEVICE = "Device & Sensors"
    const val NOTES = "Notes & Lists"

    val all = listOf(MATH, GEN, TEXT, TIME, DEVICE, NOTES)
}

object Registry {
    val tools = listOf(
        // ----- Math & Converters -----
        ToolDef("calculator", "Calculator", "Classic four-function", Categories.MATH, Icons.Filled.Calculate),
        ToolDef("unit", "Unit Converter", "Length, mass, temp & more", Categories.MATH, Icons.Filled.Straighten),
        ToolDef("percentage", "Percentage", "Of, change & reverse", Categories.MATH, Icons.Filled.Percent),
        ToolDef("tip", "Tip & Split", "Bill, tip, per person", Categories.MATH, Icons.Filled.RequestQuote),
        ToolDef("discount", "Discount", "Sale price & savings", Categories.MATH, Icons.Filled.Sell),
        ToolDef("bmi", "BMI", "Body mass index", Categories.MATH, Icons.Filled.MonitorWeight),
        ToolDef("age", "Age", "Years, months & days", Categories.MATH, Icons.Filled.Cake),
        ToolDef("base", "Base Converter", "Bin, oct, dec, hex", Categories.MATH, Icons.Filled.Numbers),
        ToolDef("emi", "Loan & EMI", "Monthly payment & interest", Categories.MATH, Icons.Filled.AccountBalance),
        ToolDef("gcd", "GCD & LCM", "Divisors & multiples", Categories.MATH, Icons.Filled.Functions),
        ToolDef("stats", "Statistics", "Mean, median, σ", Categories.MATH, Icons.Filled.Insights),
        ToolDef("roman", "Roman Numerals", "Numbers ↔ Roman", Categories.MATH, Icons.Filled.LooksOne),

        // ----- Generate -----
        ToolDef("password", "Password", "Cryptographically strong", Categories.GEN, Icons.Filled.Password),
        ToolDef("pin", "PIN Generator", "Secure numeric codes", Categories.GEN, Icons.Filled.Dialpad),
        ToolDef("uuid", "UUID", "RFC 4122 v4 identifiers", Categories.GEN, Icons.Filled.Fingerprint),
        ToolDef("random", "Random Number", "Ranges & lottery draws", Categories.GEN, Icons.Filled.Casino),
        ToolDef("dice", "Dice & Coin", "Roll & flip", Categories.GEN, Icons.Filled.MonetizationOn),
        ToolDef("picker", "Picker", "Random from a list", Categories.GEN, Icons.Filled.Shuffle),
        ToolDef("gradient", "Gradient", "CSS gradient builder", Categories.GEN, Icons.Filled.Gradient),
        ToolDef("palette", "Palette", "Color harmonies", Categories.GEN, Icons.Filled.Palette),

        // ----- Text & Dev -----
        ToolDef("words", "Word Counter", "Words, chars, reading time", Categories.TEXT, Icons.Filled.TextFields),
        ToolDef("case", "Case Converter", "UPPER, lower, Title & more", Categories.TEXT, Icons.Filled.FormatSize),
        ToolDef("base64", "Base64", "Encode & decode", Categories.TEXT, Icons.Filled.Code),
        ToolDef("lorem", "Lorem Ipsum", "Placeholder text", Categories.TEXT, Icons.Filled.Article),
        ToolDef("morse", "Morse Code", "Text ↔ Morse", Categories.TEXT, Icons.Filled.GraphicEq),

        // ----- Time & Focus -----
        ToolDef("stopwatch", "Stopwatch", "Laps & precision", Categories.TIME, Icons.Filled.Timer),
        ToolDef("timer", "Timer", "Countdown with alert", Categories.TIME, Icons.Filled.HourglassEmpty),
        ToolDef("pomodoro", "Pomodoro", "Focus & break cycles", Categories.TIME, Icons.Filled.Schedule),
        ToolDef("worldclock", "World Clock", "Time across the globe", Categories.TIME, Icons.Filled.Public),
        ToolDef("unix", "Unix Time", "Epoch converter", Categories.TIME, Icons.Filled.Schedule),
        ToolDef("sleep", "Sleep", "Bedtime planning", Categories.TIME, Icons.Filled.Bedtime),
        ToolDef("metronome", "Metronome", "Beat with tap tempo", Categories.TIME, Icons.Filled.MusicNote),

        // ----- Device & Sensors -----
        ToolDef("flashlight", "Flashlight", "Real LED torch", Categories.DEVICE, Icons.Filled.FlashOn),
        ToolDef("vibration", "Vibration", "Haptic motor tester", Categories.DEVICE, Icons.Filled.Vibration),
        ToolDef("battery", "Battery", "Charge & power status", Categories.DEVICE, Icons.Filled.BatteryFull),
        ToolDef("deviceinfo", "Device Info", "Hardware & software specs", Categories.DEVICE, Icons.Filled.PhoneAndroid),
        ToolDef("compass", "Compass", "Live heading", Categories.DEVICE, Icons.Filled.Explore),
        ToolDef("level", "Leveler", "Bubble surface level", Categories.DEVICE, Icons.Filled.Adjust),
        ToolDef("sound", "Sound Meter", "Ambient noise level", Categories.DEVICE, Icons.Filled.Mic),
        ToolDef("speedo", "Speed Test", "Sensor-based speed", Categories.DEVICE, Icons.Filled.Speed),

        // ----- Notes & Lists -----
        ToolDef("notes", "Notes", "Quick notes, saved locally", Categories.NOTES, Icons.Filled.Note),
        ToolDef("checklist", "Checklist", "Tasks with progress", Categories.NOTES, Icons.Filled.CheckBox),
        ToolDef("credit", "Credit Card", "Luhn validator & info", Categories.NOTES, Icons.Filled.CreditCard),
    )

    fun byId(id: String): ToolDef? = tools.firstOrNull { it.id == id }
}

/** Dispatches to the right tool screen. */
@Composable
fun ToolScreen(def: ToolDef, onBack: () -> Unit) {
    when (def.id) {
        "calculator" -> CalculatorTool(onBack)
        "unit" -> UnitConverterTool(onBack)
        "percentage" -> PercentageTool(onBack)
        "tip" -> TipSplitTool(onBack)
        "discount" -> DiscountTool(onBack)
        "bmi" -> BmiTool(onBack)
        "age" -> AgeTool(onBack)
        "base" -> BaseConverterTool(onBack)
        "emi" -> LoanEmiTool(onBack)
        "gcd" -> GcdLcmTool(onBack)
        "stats" -> StatisticsTool(onBack)
        "roman" -> RomanNumeralsTool(onBack)
        "password" -> PasswordTool(onBack)
        "pin" -> PinTool(onBack)
        "uuid" -> UuidTool(onBack)
        "random" -> RandomNumberTool(onBack)
        "dice" -> DiceCoinTool(onBack)
        "picker" -> PickerTool(onBack)
        "gradient" -> GradientTool(onBack)
        "palette" -> PaletteTool(onBack)
        "words" -> WordCounterTool(onBack)
        "case" -> CaseConverterTool(onBack)
        "base64" -> Base64Tool(onBack)
        "lorem" -> LoremTool(onBack)
        "morse" -> MorseTool(onBack)
        "stopwatch" -> StopwatchTool(onBack)
        "timer" -> TimerTool(onBack)
        "pomodoro" -> PomodoroTool(onBack)
        "worldclock" -> WorldClockTool(onBack)
        "unix" -> UnixTimeTool(onBack)
        "sleep" -> SleepTool(onBack)
        "metronome" -> MetronomeTool(onBack)
        "flashlight" -> FlashlightTool(onBack)
        "vibration" -> VibrationTool(onBack)
        "battery" -> BatteryTool(onBack)
        "deviceinfo" -> DeviceInfoTool(onBack)
        "compass" -> CompassTool(onBack)
        "level" -> LevelTool(onBack)
        "sound" -> SoundMeterTool(onBack)
        "speedo" -> SpeedTool(onBack)
        "notes" -> NotesTool(onBack)
        "checklist" -> ChecklistTool(onBack)
        "credit" -> CreditCardTool(onBack)
    }
}
