# KESCO Smart Utility Suite — "DTPulse"
## Product Requirements Document + Copy‑Paste Rebuild Prompt

**Version:** 1.0 · **Date:** 30 Jul 2026 · **Owner:** KESCO (Kanpur Electricity Supply Company Ltd.)
**Product name:** DTPulse — *Monitor. Detect. Protect.*
**Form factor:** Mobile-first application (412 px phone shell), Android-first, iOS-ready. Current reference build is an installable PWA (React + TanStack Start) that behaves like a native Android app.

> **How to use this document in another AI tool:** paste Part A (Master Rebuild Prompt) as your first message. Then paste Part B (screen specs) screen-by-screen, attaching the matching PNG from `screens/`. Part C contains all data models and seed data so the rebuilt app has identical content. Part D is a fully verbatim functional inventory (see `APPENDIX_Functional_Inventory.md`).

---

# PART A — MASTER REBUILD PROMPT (paste this first)

Build a mobile utility-operations application called **DTPulse — KESCO Smart Utility Suite** for the Kanpur Electricity Supply Company. It is a field-engineer app for distribution-transformer (DT) monitoring and on-site BLE sensor configuration.

**Stack (choose one, keep architecture modular):**
- Flutter (preferred for native Android/iOS), or React Native, or React + TypeScript PWA.
- Local state: a single app store (Zustand / Riverpod / Redux) persisted to local storage (key `kesco-app`).
- Local DB: SQLite (or localStorage for a prototype) for offline session, audit logs and pending sync queue.
- Charts: recharts / fl_chart. Validation: zod / formz. Toasts: sonner / snackbar.
- All device/telemetry data is **mocked** in this build — no live backend. BLE is simulated with realistic delays and a small random failure rate.

**Modules (4 + 1):**
1. **Local Application Configurator** — fully implemented (BLE discovery, GET read, SET write).
2. **DT Analyzer** — fully implemented (fleet dashboard, DT list, DT info, alerts).
3. **Product Manual** — fully implemented (sensor & gateway field guides, placeholder content).
4. **Site Survey** — placeholder "Coming Soon" screen.
5. **Installation App** — placeholder "Coming Soon" screen.

**Design system (must match exactly):**
- Palette "Ocean Deep", defined as semantic tokens, never hardcoded per component. Light + dark themes, toggled from the header and Settings.
  - Light: background `oklch(0.97 0.006 235)`, foreground `oklch(0.20 0.06 250)`, card `#fff`, primary `oklch(0.38 0.08 240)` (deep navy #0c2340 family), accent `oklch(0.58 0.09 210)` (teal), muted `oklch(0.94 0.01 230)`, border `oklch(0.89 0.014 230)`, destructive `oklch(0.6 0.22 27)`, success `oklch(0.75 0.08 195)`, warning `oklch(0.75 0.14 75)`.
  - Dark: background `oklch(0.19 0.045 245)`, card `oklch(0.24 0.05 245)`, primary `oklch(0.62 0.09 205)`, accent `oklch(0.68 0.10 200)`, border `white/12%`.
  - Radius base `1rem`; cards `rounded-3xl`, controls `rounded-2xl`, chips/pills `rounded-full`.
- Typography: **Sora** for headings/display, **Manrope** for body. Max 4 sizes, 2 weights. Tabular numerals for all metrics.
- Spacing: strict 8-point grid (8/12/16/24/32). Card padding 16–24. Section gaps 24.
- Elevation: soft shadows tinted with the primary hue (`0 1px 2px primary/8%, 0 8px 24px -12px primary/22%`), never neutral grey/black. Primary buttons carry a 14% white inner top highlight.
- Color discipline (60/30/10): 60% neutral canvas, 30% dark text/structure, 10% primary/accent reserved for the single main action, active nav state and live status. Semantic red/amber/green only for real state (outage, attention, normal).
- Ergonomics: every tap target ≥48×48 px; `active:scale(0.97)` + 150 ms transition on every tappable element; primary actions in the bottom thumb zone.

**App shell:**
- Centered phone column, `max-w-md` (412 px), bordered on both sides, content column scrolls with hidden scrollbars.
- Sticky translucent blurred **top app bar** (h-64px): left = back arrow (48×48) or KESCO bolt logo mark; centre-left = eyebrow "KESCO SUITE" + screen title; right = theme toggle (moon/sun).
- Fixed translucent blurred **bottom tab bar**, constrained to the same phone width, safe-area padded: **Home** `/dashboard`, **Sync** `/sync`, **Logs** `/logs`, **Profile** `/profile`. Active tab = icon in a primary-tinted pill + bold label.
- Module screens with sub-navigation (DT Analyzer) render a second sticky tab row flush under the app bar — no gap, no overlap.

**Auth model (prototype):** any credentials accepted. Session persisted locally; an authenticated route guard redirects to `/login` when there is no stored user. Default demo user `engineer@kesco.in` / `kesco123`.

**Routes:**
```
/login
/dashboard
/configurator
/configurator/device/:id?mode=get|set
/modules/dt-analyzer            (tabs: Dashboard | DT List | Alerts)
/modules/dt-analyzer/list
/modules/dt-analyzer/alerts
/modules/dt-analyzer/dt/:code
/modules/product-manual
/modules/product-manual/:slug
/modules/site-survey            (Coming Soon)
/modules/installation           (Coming Soon)
/sync
/logs
/profile
/settings
```

**Demo-mode rule (important):** the real hardware requires a physical device reset that opens a 2-minute discoverable/editable window. In this build the **countdown UI is fully shown but never enforced** — all actions stay enabled after 00:00. A badge "Demo Mode · Timer is simulated" must be visible on the Configurator screens.

---

# PART B — SCREEN-BY-SCREEN SPECIFICATION

Each screen below lists purpose, layout, controls and behaviour. Attach the matching screenshot from `screens/` when prompting.

## B1. Login — `screens/01-login.png`
Centered card on a plain canvas with a soft primary glow behind the top.
- KESCO client logo (yellow bolt mark + "Kanpur Electricity Supply Company Limited"), a 64 px hairline divider, then the **DTPulse** product logo with the tagline "Monitor. Detect. Protect."
- Card (rounded-3xl, lifted shadow): **Login ID** (email, prefilled `engineer@kesco.in`), **Password** (prefilled `kesco123`), inputs 48 px tall.
- Primary **Sign In** button (48 px, full width) → 600 ms fake auth → `/dashboard`; label becomes "Signing in…" and disables.
- Secondary **Continue with Google** button (tinted primary 5% surface) → signs in as `google.user@kesco.in`.
- Footer note: "Prototype build — any credentials are accepted."
- If a session already exists, this route redirects straight to `/dashboard`.

## B2. Dashboard (Home) — `screens/02-dashboard.png`
- Greeting block: "Good morning/afternoon/evening," + first name (24 px semibold) + designation; a 48 px settings icon button on the right → `/settings`.
- **Weather card** (primary-filled, rounded-3xl, blurred accent glow): "Kanpur, UP · {live time}", temperature `32 °C` (48 px tabular numerals), "Partly cloudy", humidity 62 %, wind 12 km/h, divider, "Tomorrow · Light rain · 29° / 24°". Static demo data.
- Section "MODULES" (uppercase 11 px, letter-spaced) then vertical module rows (icon tile 48 px, title, one-line description, chevron):
  1. **Configurator** — "Discover BLE devices, read & configure on site." → `/configurator`
  2. **DT Analyzer** — "Live distribution transformer telemetry." → `/modules/dt-analyzer`
  3. **Product Manual** — "Sensor & gateway field guides." → `/modules/product-manual`
  4. **Site Survey** — "Site conditions, photos & GPS markers." — `SOON` badge, dimmed
  5. **Installation** — "Guided installations & checklists." — `SOON` badge, dimmed

## B3. Configurator — Discovery — `screens/03-configurator-discovery.png`
- Badge "Demo Mode · Timer is simulated".
- Primary hero button **Search Nearby Devices** with subtext "Tap to start BLE scan" / "Scanning for KESCO devices…" and a "{n} found" pill; radar icon pulses while scanning (1200 ms).
- Row: numeric input "Enter Device ID (e.g. 1000002345)" + **QR** icon button; below, full-width **Search** button.
  - QR button picks a random supported device, fills the field and highlights the card (toast "QR scanned").
  - Search validates the ID prefix (must start 10, 11, 12, 20 or 21). Invalid → error toast "Unsupported device ID … must start with 10, 11, 12, 20, or 21." No match → "No nearby device matches that ID". Match → the card moves to a separate highlighted **"Device Found"** group.
- "AVAILABLE BLE DEVICES (n)" list. Compact card per device: BLE icon tile, **type name** (Sensor Gateway / Inmeter Sensor Gateway / Lug Temperature / Oil Temperature / Oil Level), `Device ID:`, `MAC Address:` (monospace), and a discoverability line — either "Discoverable · 1:58" countdown (colour-coded, green→amber→red) or a muted "Not Discoverable" chip.
- Right side of each card: **Connect** (900 ms, shows "…"). After connecting, the card exposes **Read Data** (eye icon → `?mode=get`) and **Configure** (pencil icon → `?mode=set`).
- Empty state: "No nearby KESCO devices. Tap \"Search Nearby Devices\" to scan."
- RSSI re-jitters every 4 s; countdowns tick every 1 s.

## B4. Configurator — Device Read / Configure — `screens/04-configurator-device.png`
Header shows the device type as the screen title. Status card: "Reading Data" (GET) or "Configure" (SET), "Demo Mode" badge, device ID · MAC.
- In SET mode only: a countdown pill and a banner "Prototype Simulation — fields stay editable for demo" with a **Simulate Reset** button (starts a fresh 2-minute window, toast "Device reset — Discoverable window: 2 minutes").
- Section **DEVICE TELEMETRY (READ-ONLY)** — rows with coloured gradient icon tiles and monospace values: Device Type, Firmware, Battery (V), Core Temp (°C), RSSI (dBm), Error Status (OK / LOW_BATT, tone changes), BLE Network, Analog Values (dot-separated list).
- Section **CONFIGURATION** with a right-side state label `Read-only` / `Editable` / `Locked`. Fields (numeric): Data Schedule Frequency (min), Alert Frequency Count, Alert Frequency Interval (sec), IOA, BLE Network. In GET mode they render as disabled placeholders.
- Changed fields glow blue with a pulsing ring and a "Modified" pill; a sticky banner counts "{n} Parameter(s) Modified · Unsaved changes".
- Primary CTA: **Configure Device** (SET) → validate → 1100 ms simulated BLE write with an 8 % random failure → success toast "Configuration written", write an audit log, return to discovery; failure toast "BLE write failed — Device did not ACK. Retry." In GET mode the CTA is **Close**. Below: "Disconnect & back".
- Validation: schedule 1–1440 min; alert count 0–100; alert interval 10–3600 s; IOA 1–65535; BLE network 0–15; push type MQTT | HTTP | TCP.

## B5. DT Analyzer — Dashboard — `screens/05-dt-analyzer-dashboard.png`
Sub-tabs: **Dashboard | DT List | Alerts** (sticky, flush under the app bar).
- Utility card "KESCO, Kanpur" with refresh + export icon buttons.
- **HIERARCHY** row: three cascading selects — Circle → Division → Sub-Div (child disabled until parent chosen).
- **DT OVERVIEW** — 2×2 KPI cards: Total DTs 1250, Live DTs 1050, Inactive DTs 165, Under Outage 35.
- **DT RATING STATUS** — stacked bar chart by rating (25/63/100/160/250 kVA) with Live / Outage / Unavailable legend + export icon.
- **SENSOR OVERVIEW** — 2×2 KPI cards: Active Sensors 3730, Inactive Sensors 242, Critical Alarms 12, Data Availability 98.5 %.
- **SENSOR STATUS BY TYPE** — grouped bar chart (Oil Level, Oil Temp, Lug Temp × Active/Inactive).
- **ACTIVE ALERTS** — five clickable KPI tiles (High Lug Temp, Low Oil Level, Critical Oil Level, High Oil Temp, Gateway Outage) that filter the list below.
- **ACTIVE ALERTS LIST** — search box, CSV export (downloads `active-alerts.csv`), expandable rows revealing Circle, Division, Sub Division, Alert Type, Description, Alarm Value, Current Value, Alarm Timestamp, Current Timestamp.
- No "Critical Alerts" section and no weather widget on this screen (weather lives on the Dashboard).

## B6. DT Analyzer — DT List — `screens/06-dt-list.png`
- Mini KPI strip: Total 1250 · Attention 87 · Outage 35 (red) · Normal 1128.
- Search "Search DTs…" (code / sub-division / substation) + filter icon with an active-count badge.
- **Filter sheet** (bottom sheet, drag handle): hierarchy filters first — Circle → Division → Sub-Division — then segmented operational filters: DT Status (All/Normal/Attention/Outage), Outage (All/Normal/Outage), Oil Level (All/Normal/Low/Critically Low), Oil Temperature (All/Normal/High), Lug Alerts (All/Normal/Active Alert). Footer buttons **Clear Filters** and **Apply Filters**.
- Applied filters appear as removable chips with "Clear all"; counter "{n} of {total} DTs".
- DT card: code + status badge (Normal / Attention / Outage), "Circle · Division · Sub-Division", "Substation · kVA · Type", four lug chips (R/Y/B/N with °C, the offending phase tinted red), Oil Temp and Oil Level tiles with timestamps, four alert rows (Lug Alert, Oil Temp Alert, Oil Level Alert, Outage) each with value + timestamp, footer "Updated {n} min ago" and gateway id + online/offline icon.
- Tap the card to expand → **"Open DT Info →"** CTA to `/modules/dt-analyzer/dt/:code`.
- Empty state: "No DTs match current filters".

## B7. DT Analyzer — DT Info — `screens/07-dt-info.png`
- "← Back to DT List". Header card: DT code (24 px), sub-division · rating, GPS coordinates, status badge.
- Collapsible **GENERAL INFORMATION** accordion with the full master record: DT Code, Circle, Division, Sub-Division, Substation, Substation ID, Feeder, Rating, DT Type, Installed Type, Manufacturer, Number of Customers, Gateway, Gateway Serial Number, Sensor Serial Numbers, Installation Date, Address, Latitude, Longitude, Landmark, Status, Remarks (missing values render "—").
- **LATEST SNAPSHOT** — six tiles: Lug R / Y / B / N (°), Oil Level (%), Oil Temp (°) with severity colouring.
- Three history sections, each with a **Graph | Table** segmented toggle and an export icon: **Lug Temperature** (3-series line chart R/Y/B over 24 h), **Oil Temperature** (single line), **Oil Level** (bar strip 00:00→23:00).
- Table view = horizontally scrollable telemetry table with a sticky first column; lug/oil-temp columns: Device ID, Sensor Type, Server Time, Sensor Timestamp, Firmware, BLE Network ID, Analog, Battery (V), Cal Coef, Freq, Alert Count, Alert Interval, Crit Limit, IOA, Core Temp, RSSI, Error, Push Type. Oil level swaps in Digital and Oil Level Status.

## B8. DT Analyzer — Alerts — `screens/08-dt-alerts.png`
- "System Health Summary / Your Sub-Division Zone" card with an SVG health ring, Critical and Warning tallies and a progress bar.
- Filter pills **All / Critical / Warning** (with counts) and a checkbox "Show only my assigned DTs".
- **Live Alerts ({n})** — swipeable cards: swipe left to reveal a green **Acknowledge** action; tap to open the DT Info page. Acknowledged alerts move to **Resolved ({n})**.
- Empty state: "No active alerts in your zone."

## B9. Product Manual — Index — `screens/09-product-manual.png`
- Search field "Search sensors, gateway, troubleshooting…" matching name, tagline, section headings and keywords (installation, wiring, commissioning, troubleshooting, maintenance, safety, communication).
- Group **SENSORS**: Lug R, Lug Y, Lug B, Lug N (phase-coloured bolt icons), Oil Level, Oil Temperature, Ambient Temperature, Humidity — each with a one-line tagline and chevron.
- Group **COMMUNICATION**: Gateway — "BLE-to-cloud gateway for on-DT sensors."
- Empty state: `No manuals match "{query}"`.

## B10. Product Manual — Detail — `screens/10-product-manual-detail.png`
Header card with product icon, name, category and tagline, plus the notice "Structured manual template. Approved KESCO engineering content will be published here." Then ten fixed sections rendered as cards/accordions: **Overview, Purpose, Installation Guide, Wiring / Connection, Configuration / Commissioning, Normal Operation, Troubleshooting, Communication Checks, Maintenance / Field Checks, Safety Notes** — each currently filled with the placeholder "Content pending approval from KESCO engineering. Approved technical details will appear here."

## B11. Site Survey & B12. Installation — `screens/11-site-survey.png`, `screens/12-installation.png`
Shared "Coming Soon" template: large icon, title, "Coming Soon" badge, "Planned features" checklist.
- Site Survey: GPS-tagged site capture with offline maps · Photo evidence and asset tagging · Survey templates per feeder / DT / pole · Auto-sync to KESCO GIS once online.
- Installation App: Step-by-step installation checklists · Barcode / serial capture for assets · Auto-commission via BLE handshake · Digital sign-off with engineer signature.

## B13. Sync Center — `screens/13-sync.png`
- Gradient primary card: "PENDING" + count (48 px) + "Last sync {datetime}" or "Never synced".
- **Sync now** button — 1500 ms simulated upload, marks every log synced, toast "Sync complete — {n} log(s) uploaded"; with nothing pending, toast "Nothing to sync".
- Latest 10 log rows: device name, device ID + write time, status pill `synced` / `pending`.
- Empty state: "No activity yet. Write a configuration to see it here."

## B14. Logs (Audit Trail) — `screens/14-logs.png`
Read-only list of every configuration write: device name, timestamp, device ID, "by {engineer}", then one diff row per changed parameter — old value struck through in red, new value in green. Unchanged parameters are omitted. Empty state: "No logs yet — Configuration writes will appear here."

## B15. Profile — `screens/15-profile.png`
- Identity card: circular initial avatar, name, designation, role badge.
- **BASIC INFORMATION**: Name, Employee ID, Role, Designation.
- **ORGANIZATION**: Reporting Manager, Department, Circle, Status, Expiry Date.
- **CONTACT INFORMATION**: Email, Phone (masked).
- **ACCOUNT INFORMATION**: User ID, Joined On, Last Login, Last Password Reset, Last Updated.
- Row buttons **Change Password** and **Settings**; destructive **Logout**.
- Change Password is a two-step dialog: step 1 verifies the current password (error "Incorrect current password"); step 2 takes new + confirm password (min 6 characters, must match), shows "✓ Password updated" and auto-closes after 1.2 s. Show/hide eye toggles on password fields.
- No "Total Writes" / "Pending" KPI cards on this screen.

## B16. Settings — `screens/16-settings.png`
Rows with icon tiles and switches: **BLE Permission** ("Allow scanning nearby devices"), **Dark Theme** ("Switch between light & dark mode"), **Sync Settings** ("Auto-sync logs when online"), a **Run sync now** button, **App Version** ("KESCO Suite", `v0.1.0`), and a destructive **Logout** button.

---

# PART C — DATA MODEL & SEED DATA

## C1. Core types
```ts
type DeviceStatus = "idle" | "connected" | "connecting" | "error";
type KescoDeviceType = "sensor_gateway" | "inmeter_sensor_gateway" | "lug_temp" | "oil_temp" | "oil_level";

interface BleDevice { id; name; mac; rssi; status: DeviceStatus; deviceType: KescoDeviceType;
  discoverableUntil: number | null; config: DeviceConfig }

interface DeviceConfig { deviceType; firmwareVersion; batteryVoltage; coreTemp; errorStatus; analogValues: number[];
  dataScheduleFrequency; alertFrequencyCount; alertFrequencyInterval; ioa; bleNetwork;
  dataPushType: "MQTT" | "HTTP" | "TCP" }

interface User { email; name; employeeId; role?: "Admin"|"Engineer"|"Viewer"; designation?; department?; circle?;
  phone?; reportingTo?; joinedOn?; userId?; status?: "Active"|"Inactive"|"Suspended"; expiryDate?;
  lastLogin?; lastPasswordReset?; lastUpdated? }

interface ConfigLog { id; deviceId; deviceName; engineer; timestamp;
  oldValues: Partial<DeviceConfig>; newValues: Partial<DeviceConfig>; synced: boolean }
```

## C2. KESCO device-ID ranges (only these five types are supported)
| Type | Prefix | ID range | Label |
|---|---|---|---|
| sensor_gateway | 10 | 1000000001–1099999999 | Sensor Gateway |
| inmeter_sensor_gateway | 11 | 1100000001–1199999999 | Inmeter Sensor Gateway |
| lug_temp | 12 | 1200000001–1299999999 | Lug Temperature |
| oil_temp | 20 | 2000000001–2099999999 | Oil Temperature |
| oil_level | 21 | 2100000001–2199999999 | Oil Level |

Seed devices (6): `1000002345` MAC A4:CF:12:3D:7B:01 rssi −52 fw 3.4.1 batt 12.6 V temp 38.4 analog 230.1/229.8/231.2 (discoverable) · `1100007821` …:02 −67 2.1.7 11.9 42.1 · `1200004321` …:03 −71 1.6.3 12.3 58.7 (discoverable) · `2000008765` …:04 −78 2.0.4 12.1 65.2 · `2100009087` …:05 −84 1.9.0 11.7 35.2 · `1000034512` …:06.
Default config for every device: schedule 15 min, alert count 3, alert interval 60 s, IOA 1024, BLE network 4, push type MQTT. `errorStatus = battery < 11.5 ? "LOW_BATT" : "OK"`. RSSI jitters ±4 dBm, clamped −99…−30.

## C3. Store contract (`kesco-app`)
State: `user`, `password` (default `kesco123`), `blePermission` (true), `devices`, `scanning`, `connectedDeviceId`, `logs`, `lastSyncAt`.
Persist only `user, password, logs, lastSyncAt, blePermission` — BLE state resets each session.
Actions: `login(email)` (builds the full mock user incl. random Employee/User IDs, "Field Engineer", "Distribution Operations", "Kanpur Urban Circle", reporting to "S. K. Verma (Executive Engineer)", joined 12 Aug 2021, status Active, expiry +1 year), `logout()`, `changePassword(old,new)` → `{ok}` | `incorrect_old_password` | `too_short`, `setBlePermission`, `scan()` (1200 ms + re-sort by RSSI), `refreshRssi()`, `connect(id)` (900 ms), `disconnect()`, `simulateReset(id)` (now + 2 min), `clearDiscoverable(id)`, `writeConfig(id,next)` (1100 ms, 8 % failure), `addLog(l)`, `syncLogs()` (1500 ms).

## C4. DT Analyzer datasets
- Hierarchy: **Kanpur Circle** (Kanpur North Division → Kalyanpur, Vikas Nagar, Govind Nagar; …), plus Lucknow and Varanasi Circles.
- `DT_KPIS = { total 1250, live 1050, inactive 165, outage 35 }`; `SENSOR_KPIS = { active 3730, inactive 242, criticalAlarms 12, availability "98.5%" }`.
- `DT_RATING_DATA`: 25/63/100/160/250 kVA × Live/Outage/Unavailable. `SENSOR_TYPE_DATA`: Oil Level / Oil Temp / Lug Temp × Active/Inactive.
- `ACTIVE_ALERT_SUMMARY`: High Lug Temp, Low Oil Level, Critical Oil Level, High Oil Temp, Gateway Outage. `ACTIVE_ALERTS`: 5 detailed records.
- `DT_LIST`: 6 DTs (e.g. **DT-3421** Kalyanpur 250 kVA *Attention*, **DT-2156** Vikas Nagar 100 kVA *Normal*, **DT-1892** Govind Nagar 63 kVA *Outage*) with lug R/Y/B/N, oil temp/level, four alert fields with timestamps, gateway id and online flag.
- `DT_DETAILS["DT-3421"]`: full master record used by the General Information accordion.
- `LUG_TABLE`, `OIL_TEMP_TABLE`, `OIL_LEVEL_TABLE`: 12 telemetry-history rows each. Charts use 24-point hourly sinusoidal series.
- Alerts tab uses `DT_ALARMS`: 7 alarms (critical / warning / info) with `active` and `assignedToMe` flags.

## C5. Product manual data
9 products — `lug-r`, `lug-y`, `lug-b`, `lug-n`, `oil-level`, `oil-temperature`, `ambient-temperature`, `humidity` (category *sensor*) and `gateway` (category *communication*) — each with slug, name, short name, tagline, icon, accent tone and the same ten sections filled with the approval placeholder.

---

# PART D — NON-FUNCTIONAL REQUIREMENTS & ACCEPTANCE

1. **Offline-first:** the entire app works with no network; writes queue locally and appear in Sync as `pending` until "Sync now".
2. **Audit:** every successful configuration write records old→new values, engineer and timestamp, visible in Logs and Sync.
3. **Performance:** screen transitions < 200 ms; charts render < 500 ms on a mid-range Android device.
4. **Accessibility:** ≥48 px targets, AA contrast in both themes, labelled icon-only buttons.
5. **Responsive:** the phone shell must not break between 360 px and 412 px; header rows use a `1fr auto` grid with truncation, never wrapping.
6. **Acceptance checks:** log in → dashboard renders 5 module rows · scan finds 6 KESCO devices · connect exposes GET and SET · a SET write creates a log and a pending sync item · DT List filters by hierarchy and status · DT Info opens from the card CTA · Alerts acknowledge removes an alert · Change Password rejects a wrong current password · dark mode restyles every screen.

---

**Appendix:** `APPENDIX_Functional_Inventory.md` — exhaustive as-built inventory of every route, control, data file and validation rule.
**Screenshots:** `screens/01-login.png` … `screens/16-settings.png`.
