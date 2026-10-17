@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.deepak.essentials.tools

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.location.LocationListener
import android.location.LocationManager
import android.media.AudioManager
import android.media.MediaRecorder
import android.media.ToneGenerator
import android.os.BatteryManager
import android.os.Build
import android.os.Bundle
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.deepak.essentials.ui.Hint
import com.deepak.essentials.ui.PrimaryButton
import com.deepak.essentials.ui.ResultCard
import com.deepak.essentials.ui.StatGrid
import com.deepak.essentials.ui.ToolPage
import com.deepak.essentials.ui.tonalCard
import kotlin.math.abs
import kotlin.math.atan2

/* ================================= Flashlight ================================= */

@Composable
fun FlashlightTool(onBack: () -> Unit) {
    ToolPage("Flashlight", onBack) {
        val context = LocalContext.current
        val camManager = remember { context.getSystemService(Context.CAMERA_SERVICE) as CameraManager }
        var torchOn by remember { mutableStateOf(false) }
        var message by remember { mutableStateOf("") }

        fun setTorch(on: Boolean) {
            try {
                val id = camManager.cameraIdList.firstOrNull {
                    camManager.getCameraCharacteristics(it).get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
                }
                if (id == null) { message = "This device has no camera flash."; return }
                camManager.setTorchMode(id, on)
                torchOn = on
                message = if (on) "Torch on 💡" else "Torch off"
            } catch (e: Exception) {
                message = "Could not control torch: ${e.message}"
            }
        }

        val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) setTorch(true) else message = "Camera permission denied — torch needs it."
        }

        ResultCard(if (torchOn) "💡 ON" else "○ OFF", message.ifEmpty { "Uses the real camera LED" })
        PrimaryButton(if (torchOn) "Turn off" else "Turn on flashlight") {
            if (!torchOn) {
                if (Build.VERSION.SDK_INT >= 23 && context.checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                    permission.launch(Manifest.permission.CAMERA)
                } else {
                    setTorch(true)
                }
            } else {
                setTorch(false)
            }
        }
        Hint("Native Camera2 torch control — the LED stays on while the app is open. On some devices the system may require camera permission.")
    }
}

/* ================================= Vibration ================================= */

@Composable
fun VibrationTool(onBack: () -> Unit) {
    ToolPage("Vibration", onBack) {
        val context = LocalContext.current
        var message by remember { mutableStateOf("Pick a pattern") }

        val vibrator: Vibrator = remember {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vm.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }
        }

        fun buzz(pattern: LongArray) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(pattern, -1)
                }
                message = "Buzzing…"
            } catch (e: Exception) {
                message = "Vibration failed: ${e.message}"
            }
        }

        StatGrid(
            listOf(
                "Has vibrator" to if (vibrator.hasVibrator()) "Yes ✓" else "No",
                "Amplitude control" to if (vibrator.hasAmplitudeControl()) "Yes" else "No",
            )
        )
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = { buzz(longArrayOf(0, 80)) }, modifier = Modifier.weight(1f)) { Text("Tap") }
            Button(onClick = { buzz(longArrayOf(0, 250)) }, modifier = Modifier.weight(1f)) { Text("Buzz") }
            Button(onClick = { buzz(longArrayOf(0, 600)) }, modifier = Modifier.weight(1f)) { Text("Long") }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = { buzz(longArrayOf(0, 120, 80, 120)) }, modifier = Modifier.weight(1f)) { Text("Double") }
            Button(onClick = { buzz(longArrayOf(0, 100, 80, 100, 80, 100)) }, modifier = Modifier.weight(1f)) { Text("Pulse") }
            Button(onClick = { buzz(longArrayOf(0, 200, 120, 200, 120, 200, 400, 400, 120, 400, 120, 400, 400, 200, 120, 200, 120, 200)) }, modifier = Modifier.weight(1f)) { Text("SOS") }
        }
        ResultCard("📳", message)
    }
}

/* ================================== Battery ================================== */

@Composable
fun BatteryTool(onBack: () -> Unit) {
    ToolPage("Battery", onBack) {
        val context = LocalContext.current
        var level by remember { mutableIntStateOf(-1) }
        var scale by remember { mutableIntStateOf(100) }
        var status by remember { mutableIntStateOf(BatteryManager.BATTERY_STATUS_UNKNOWN) }
        var plugged by remember { mutableIntStateOf(0) }
        var temperature by remember { mutableIntStateOf(0) }

        DisposableEffect(Unit) {
            val receiver = object : android.content.BroadcastReceiver() {
                override fun onReceive(ctx: Context, intent: Intent) {
                    level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                    scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, 100)
                    status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, BatteryManager.BATTERY_STATUS_UNKNOWN)
                    plugged = intent.getIntExtra(BatteryManager.EXTRA_PLUGGED, 0)
                    temperature = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0)
                }
            }
            val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
            context.registerReceiver(receiver, filter)
            onDispose { context.unregisterReceiver(receiver) }
        }

        val pct = if (level >= 0 && scale > 0) (level * 100 / scale) else -1
        val statusText = when (status) {
            BatteryManager.BATTERY_STATUS_CHARGING -> "⚡ Charging"
            BatteryManager.BATTERY_STATUS_DISCHARGING -> "On battery"
            BatteryManager.BATTERY_STATUS_FULL -> "Full ✓"
            BatteryManager.BATTERY_STATUS_NOT_CHARGING -> "Not charging"
            else -> "Unknown"
        }
        ResultCard(
            if (pct >= 0) "$pct%" else "—",
            statusText,
            accent = when {
                pct in 0..20 -> MaterialTheme.colorScheme.error
                status == BatteryManager.BATTERY_STATUS_CHARGING -> Color(0xFF30D158)
                else -> MaterialTheme.colorScheme.primary
            },
        )
        StatGrid(
            listOf(
                "Power" to when (plugged) {
                    0 -> "Unplugged"
                    BatteryManager.BATTERY_PLUGGED_AC -> "Plugged · AC"
                    BatteryManager.BATTERY_PLUGGED_USB -> "Plugged · USB"
                    BatteryManager.BATTERY_PLUGGED_WIRELESS -> "Plugged · Wireless"
                    else -> "Plugged"
                },
                "Temperature" to if (temperature != 0) String.format("%.1f°C", temperature / 10f) else "—",
                "Level raw" to "$level / $scale",
                "Status code" to status.toString(),
            )
        )
        Hint("Live values straight from Android's BatteryManager — updates in real time.")
    }
}

/* ================================= Device Info ================================= */

@Composable
fun DeviceInfoTool(onBack: () -> Unit) {
    ToolPage("Device Info", onBack) {
        val context = LocalContext.current
        val metrics = context.resources.displayMetrics
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
        val memInfo = android.app.ActivityManager.MemoryInfo().also { activityManager.getMemoryInfo(it) }

        StatGrid(
            listOf(
                "Android" to Build.VERSION.RELEASE,
                "API level" to Build.VERSION.SDK_INT.toString(),
                "Cores" to Runtime.getRuntime().availableProcessors().toString(),
                "RAM" to String.format("%.1f GB", memInfo.totalMem / (1024.0 * 1024 * 1024)),
            )
        )
        Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = tonalCard()), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(4.dp)) {
                val rows = listOf(
                    "Manufacturer" to Build.MANUFACTURER,
                    "Brand" to Build.BRAND,
                    "Model" to Build.MODEL,
                    "Device" to Build.DEVICE,
                    "Product" to Build.PRODUCT,
                    "Hardware" to Build.HARDWARE,
                    "Board" to Build.BOARD,
                    "ABI" to Build.SUPPORTED_ABIS.joinToString(", "),
                    "Screen" to "${metrics.widthPixels} × ${metrics.heightPixels} px",
                    "Density" to String.format("%.2f× (%d dpi)", metrics.density, metrics.densityDpi),
                    "Build ID" to Build.ID,
                    "Security patch" to Build.VERSION.SECURITY_PATCH,
                )
                rows.forEach { (k, v) ->
                    Row(Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 9.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(k, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(v, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.End)
                    }
                }
            }
        }
        Hint("Direct from android.os.Build — this is what a native app sees.")
    }
}

/* ================================== Compass ================================== */

@Composable
fun CompassTool(onBack: () -> Unit) {
    ToolPage("Compass", onBack) {
        val context = LocalContext.current
        val sensorManager = remember { context.getSystemService(Context.SENSOR_SERVICE) as SensorManager }
        var heading by remember { mutableFloatStateOf(0f) }
        var hasSensor by remember { mutableStateOf(true) }

        val gravity = remember { FloatArray(3) }
        val geomagnetic = remember { FloatArray(3) }
        val rotation = remember { FloatArray(9) }
        val orientation = remember { FloatArray(3) }

        DisposableEffect(Unit) {
            val acc = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            val mag = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
            if (acc == null || mag == null) { hasSensor = false }
            val listener = object : SensorEventListener {
                override fun onSensorChanged(event: SensorEvent) {
                    when (event.sensor.type) {
                        Sensor.TYPE_ACCELEROMETER -> System.arraycopy(event.values, 0, gravity, 0, 3)
                        Sensor.TYPE_MAGNETIC_FIELD -> System.arraycopy(event.values, 0, geomagnetic, 0, 3)
                    }
                    if (SensorManager.getRotationMatrix(rotation, null, gravity, geomagnetic)) {
                        SensorManager.getOrientation(rotation, orientation)
                        val azimuth = Math.toDegrees(orientation[0].toDouble()).toFloat()
                        heading = (azimuth + 360) % 360
                    }
                }
                override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
            }
            sensorManager.registerListener(listener, acc, SensorManager.SENSOR_DELAY_UI)
            sensorManager.registerListener(listener, mag, SensorManager.SENSOR_DELAY_UI)
            onDispose { sensorManager.unregisterListener(listener) }
        }

        val dirs = listOf("N", "NE", "E", "SE", "S", "SW", "W", "NW")
        val dir = dirs[Math.round(heading / 45f) % 8]

        if (!hasSensor) {
            ResultCard("—", "No magnetic/accelerometer sensors on this device")
            return@ToolPage
        }

        ResultCard("${heading.toInt()}°", "$dir · magnetic heading")
        StatGrid(listOf("Heading" to "${heading.toInt()}°", "Direction" to dir))
        Hint("Uses the accelerometer + magnetometer with a rotation matrix. Wave the phone in a figure-8 to calibrate if it drifts.")
    }
}

/* ================================== Leveler ================================== */

@Composable
fun LevelTool(onBack: () -> Unit) {
    ToolPage("Bubble Level", onBack) {
        val context = LocalContext.current
        val sensorManager = remember { context.getSystemService(Context.SENSOR_SERVICE) as SensorManager }
        var pitch by remember { mutableFloatStateOf(0f) }
        var roll by remember { mutableFloatStateOf(0f) }
        var hasSensor by remember { mutableStateOf(true) }
        var calib by remember { mutableStateOf(0f to 0f) }

        DisposableEffect(Unit) {
            val acc = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            if (acc == null) { hasSensor = false }
            val listener = object : SensorEventListener {
                override fun onSensorChanged(event: SensorEvent) {
                    val x = event.values[0]
                    val y = event.values[1]
                    val z = event.values[2]
                    pitch = Math.toDegrees(atan2(y.toDouble(), z.toDouble())).toFloat()
                    roll = Math.toDegrees(atan2((-x).toDouble(), sqrt2(y, z).toDouble())).toFloat()
                }
                override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
            }
            sensorManager.registerListener(listener, acc, SensorManager.SENSOR_DELAY_UI)
            onDispose { sensorManager.unregisterListener(listener) }
        }

        if (!hasSensor) {
            ResultCard("—", "No accelerometer on this device")
            return@ToolPage
        }

        val p = pitch - calib.first
        val r = roll - calib.second
        val level = abs(p) < 1.2f && abs(r) < 1.2f

        ResultCard(
            if (level) "✓ LEVEL" else String.format("%.1f° × %.1f°", p, r),
            if (level) "surface is flat" else "pitch × roll",
            accent = if (level) Color(0xFF30D158) else MaterialTheme.colorScheme.tertiary,
        )
        StatGrid(listOf("Pitch" to String.format("%.1f°", p), "Roll" to String.format("%.1f°", r)))
        PrimaryButton("Calibrate on this surface") { calib = pitch to roll }
        Hint("Place the phone flat, tap calibrate to zero it, then check other surfaces.")
    }
}

private fun sqrt2(a: Float, b: Float): Float = kotlin.math.sqrt(a * a + b * b)

/* ================================= Sound Meter ================================= */

@SuppressLint("MissingPermission")
@Composable
fun SoundMeterTool(onBack: () -> Unit) {
    ToolPage("Sound Meter", onBack) {
        val context = LocalContext.current
        var amplitude by remember { mutableIntStateOf(0) }
        var running by remember { mutableStateOf(false) }
        var peak by remember { mutableIntStateOf(0) }
        var error by remember { mutableStateOf("") }
        var recorder by remember { mutableStateOf<MediaRecorder?>(null) }

        val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) running = true else error = "Microphone permission denied."
        }

        DisposableEffect(running) {
            if (running) {
                try {
                    val rec = if (Build.VERSION.SDK_INT >= 31) MediaRecorder(context) else @Suppress("DEPRECATION") MediaRecorder()
                    rec.setAudioSource(MediaRecorder.AudioSource.MIC)
                    rec.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP)
                    rec.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB)
                    rec.setOutputFile("/dev/null")
                    rec.prepare()
                    rec.start()
                    recorder = rec
                    error = ""
                } catch (e: Exception) {
                    error = "Recorder failed: ${e.message}"
                    running = false
                }
            }
            val job = if (running) {
                Thread {
                    while (running) {
                        try {
                            val amp = recorder?.maxAmplitude ?: 0
                            amplitude = amp
                            if (amp > peak) peak = amp
                        } catch (e: Exception) { /* ignore */ }
                        try { Thread.sleep(100) } catch (e: InterruptedException) { break }
                    }
                }.apply { start() }
                true
            } else false

            onDispose {
                running = false
                try {
                    recorder?.apply { stop(); reset(); release() }
                } catch (e: Exception) { /* already stopped */ }
                recorder = null
            }
        }

        val dbApprox = if (amplitude > 0) 20 * kotlin.math.log10(amplitude / 32767.0) + 94 else 0.0
        ResultCard(
            if (running) String.format("%.1f dB", dbApprox) else "—",
            if (error.isNotEmpty()) error else if (running) "approximate · peak amp $peak" else "tap start to listen",
        )
        PrimaryButton(if (running) "■ Stop" else "🎤 Start meter") {
            if (running) {
                running = false
            } else {
                if (context.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    permission.launch(Manifest.permission.RECORD_AUDIO)
                } else {
                    running = true
                }
            }
        }
        StatGrid(listOf("Amplitude" to "$amplitude / 32767", "Peak" to peak.toString()))
        Hint("Phone microphones are not calibrated SPL meters — values are approximate and relative.")
    }
}

/* ================================== Speed ================================== */

@SuppressLint("MissingPermission")
@Composable
fun SpeedTool(onBack: () -> Unit) {
    ToolPage("GPS Speed", onBack) {
        val context = LocalContext.current
        var speedMs by remember { mutableFloatStateOf(0f) }
        var accuracy by remember { mutableFloatStateOf(0f) }
        var provider by remember { mutableStateOf("—") }
        var active by remember { mutableStateOf(false) }
        var error by remember { mutableStateOf("") }

        val locationManager = remember { context.getSystemService(Context.LOCATION_SERVICE) as LocationManager }
        val listener = remember {
            object : LocationListener {
                override fun onLocationChanged(loc: android.location.Location) {
                    speedMs = loc.speed
                    accuracy = loc.accuracy
                    provider = loc.provider ?: "—"
                }
                @Deprecated("Deprecated in Java")
                override fun onStatusChanged(p: String?, s: Int, extras: Bundle?) {}
                override fun onProviderEnabled(p: String) {}
                override fun onProviderDisabled(p: String) {}
            }
        }

        val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) active = true else error = "Location permission denied."
        }

        DisposableEffect(active) {
            if (active) {
                try {
                    val providerName = when {
                        locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) -> LocationManager.GPS_PROVIDER
                        locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER) -> LocationManager.NETWORK_PROVIDER
                        else -> null
                    }
                    if (providerName == null) {
                        error = "No location provider enabled. Turn on GPS."
                        active = false
                    } else {
                        locationManager.requestLocationUpdates(providerName, 500L, 0f, listener, Looper.getMainLooper())
                        error = ""
                    }
                } catch (e: SecurityException) {
                    error = "Permission error: ${e.message}"
                    active = false
                } catch (e: Exception) {
                    error = "Location failed: ${e.message}"
                    active = false
                }
            }
            onDispose {
                try { locationManager.removeUpdates(listener) } catch (e: Exception) { /* ignore */ }
            }
        }

        ResultCard(
            String.format("%.1f km/h", speedMs * 3.6f),
            if (error.isNotEmpty()) error else if (active) "$provider · accuracy ±${"%.0f".format(accuracy)} m" else "tap start when outdoors",
            accent = if (active) Color(0xFF30D158) else MaterialTheme.colorScheme.primary,
        )
        StatGrid(
            listOf(
                "km/h" to String.format("%.1f", speedMs * 3.6f),
                "mph" to String.format("%.1f", speedMs * 2.23694f),
                "m/s" to String.format("%.2f", speedMs),
                "Accuracy" to "±${"%.1f".format(accuracy)} m",
            )
        )
        PrimaryButton(if (active) "■ Stop tracking" else "▶ Start speed meter") {
            if (active) {
                active = false
            } else {
                if (context.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    permission.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                } else {
                    active = true
                }
            }
        }
        Hint("GPS-based speed — works best outdoors. Updates twice per second.")
    }
}
