@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.deepak.essentials

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarOutline
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.deepak.essentials.data.Settings
import com.deepak.essentials.tools.Registry
import com.deepak.essentials.tools.ToolDef
import com.deepak.essentials.tools.ToolScreen
import com.deepak.essentials.ui.theme.EssentialsTheme
import java.time.LocalTime
import java.time.format.DateTimeFormatter

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Settings.init(applicationContext)
        setContent {
            EssentialsTheme {
                var currentTool by remember { mutableStateOf<ToolDef?>(null) }
                BackHandler(enabled = currentTool != null) { currentTool = null }
                val tool = currentTool
                if (tool != null) {
                    ToolScreen(tool) { currentTool = null }
                } else {
                    HomeScreen(onToolSelected = { currentTool = it })
                }
            }
        }
    }
}

@Composable
fun HomeScreen(onToolSelected: (ToolDef) -> Unit) {
    var query by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("All") }
    var showSettings by remember { mutableStateOf(false) }
    var clockTick by remember { mutableStateOf(LocalTime.now()) }

    LaunchedEffect(Unit) {
        while (true) {
            kotlinx.coroutines.delay(1000)
            clockTick = LocalTime.now()
        }
    }

    if (showSettings) SettingsDialog { showSettings = false }

    val tools = Registry.tools
    val filtered = tools.filter { tool ->
        val catOk = when (category) {
            "All" -> true
            "★ Favourites" -> tool.id in Settings.favourites.value
            "A–Z" -> true
            else -> tool.cat == category
        }
        val q = query.trim()
        val searchOk = q.isEmpty() || (tool.name + " " + tool.desc + " " + tool.cat).contains(q, ignoreCase = true)
        catOk && searchOk
    }
    val displayList = if (category == "A–Z") filtered.sortedBy { it.name } else filtered

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Essentials", fontWeight = FontWeight.Bold, fontSize = 22.sp)
                        Text("${tools.size} native tools", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                actions = {
                    IconButton(onClick = { showSettings = true }) {
                        Icon(Icons.Filled.Settings, contentDescription = "Settings")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
            )
        },
    ) { pad ->
        Column(Modifier.fillMaxSize().padding(pad)) {
            // Hero card — live clock + favourites (Material You tonal style)
            Card(
                shape = RoundedCornerShape(26.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            ) {
                Row(Modifier.fillMaxWidth().padding(20.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text(
                            clockTick.format(DateTimeFormatter.ofPattern("hh:mm")),
                            fontSize = 40.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                        )
                        Text(
                            clockTick.format(DateTimeFormatter.ofPattern("a · EEE, MMM d")),
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f),
                        )
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text("${Settings.favourites.value.size}", fontSize = 30.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimaryContainer)
                        Text("favourites", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f))
                    }
                }
            }

            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                placeholder = { Text("Search ${tools.size} tools…") },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
                singleLine = true,
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp),
            )

            // Category chips
            androidx.compose.foundation.layout.Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(horizontal = 16.dp).fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
            ) {
                val chips = listOf("All", "★ Favourites") + com.deepak.essentials.tools.Categories.all + "A–Z"
                chips.forEach { c ->
                    FilterChip(
                        selected = category == c,
                        onClick = { category = c },
                        label = { Text(c, fontSize = 12.sp, maxLines = 1) },
                    )
                }
            }

            // Tool grid
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 152.dp),
                contentPadding = PaddingValues(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize(),
            ) {
                items(displayList, key = { it.id }) { tool ->
                    ToolCard(tool, onClick = { onToolSelected(tool) })
                }
            }
        }
    }
}

private fun Modifier.horizontalScrollRow(): Modifier = this

@Composable
private fun ToolCard(tool: ToolDef, onClick: () -> Unit) {
    val isFav = tool.id in Settings.favourites.value
    Card(
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
    ) {
        Box(Modifier.fillMaxWidth()) {
            IconButton(
                onClick = { Settings.toggleFavourite(tool.id) },
                modifier = Modifier.align(Alignment.TopEnd).size(38.dp),
            ) {
                Icon(
                    if (isFav) Icons.Filled.Star else Icons.Filled.StarOutline,
                    contentDescription = "Favourite",
                    tint = if (isFav) Color(0xFFFFD60A) else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                )
            }
            Column(
                Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Box(
                    Modifier.size(56.dp).background(
                        brush = Brush.linearGradient(listOf(MaterialTheme.colorScheme.primary, MaterialTheme.colorScheme.secondary)),
                        shape = RoundedCornerShape(18.dp),
                    ),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(tool.icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(28.dp))
                }
                Text(tool.name, fontWeight = FontWeight.SemiBold, fontSize = 13.5.sp, maxLines = 2, modifier = Modifier.padding(top = 10.dp))
                Text(tool.desc, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
            }
        }
    }
}

@Composable
private fun SettingsDialog(onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Appearance", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Theme", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("system" to "System", "light" to "Light", "dark" to "Dark").forEach { (mode, label) ->
                        FilterChip(
                            selected = Settings.themeMode.value == mode,
                            onClick = { Settings.setThemeMode(mode) },
                            label = { Text(label, fontSize = 12.sp) },
                        )
                    }
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("AMOLED black", fontWeight = FontWeight.Medium)
                        Text("Pure black for OLED screens", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Switch(checked = Settings.amoled.value, onCheckedChange = { Settings.setAmoled(it) })
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("Material You colors", fontWeight = FontWeight.Medium)
                        Text("Dynamic palette from your wallpaper", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Switch(checked = Settings.dynamicColor.value, onCheckedChange = { Settings.setDynamicColor(it) })
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Done") } },
    )
}
