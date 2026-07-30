# KESCO Suite — Screen-by-Screen Functional Inventory

Stack: TanStack Start (file-based routes under `src/routes`), Zustand (+persist) for app state, Zod for validation, Tailwind, shadcn/ui, lucide-react icons, recharts for charts, sonner for toasts. Mobile-shell layout (`AppShell`) wraps most authenticated screens.

---

## 1. `/login` — `src/routes/login.tsx`
**Purpose:** Prototype sign-in gate; any credentials accepted.
**beforeLoad:** reads `localStorage["kesco-app"]`; if `state.user` present, redirects to `/dashboard`.
**Headings/labels:** KESCO logo + "DTPulse — Monitor. Detect. Protect." tagline images; "Login ID"; "Password"; button "Sign In" / "Signing in…"; "Continue with Google"; footer "Prototype build — any credentials are accepted."
**Components:** `Input` (email, password), `Label`, `Button`.
**Interactive controls:**
- Email `Input` (type=email, required, default `engineer@kesco.in`).
- Password `Input` (type=password, required, default `kesco123`).
- Submit button — on submit: `await delay(600ms)` → `useApp.login(email)` → `navigate("/dashboard")`. Disabled while `loading`.
- "Continue with Google" button — calls `login("google.user@kesco.in")` then navigates immediately (no delay).
**Data source:** none (local component state only); writes into `useApp` store via `login`.
**State fields used:** `login` action.
**Validation:** HTML5 `required` only; no format validation. No error states rendered.
**Loading/disabled:** Sign-In button label toggles "Signing in…" and disables during 600ms fake network delay. No empty state (form always has defaults).

---

## 2. `/dashboard` — `src/routes/_authenticated/dashboard.tsx`
**Purpose:** Home/landing screen with greeting, weather widget, and module launcher grid.
**Headings/labels:** Greeting `"{Good morning/afternoon/evening}, {firstName}"`; designation subtitle; section header "Modules"; weather widget shows "Kanpur, UP · {time}", temp "32°C", "Partly cloudy", humidity "62%", wind "12 km/h", "Tomorrow · Light rain · 29° / 24°" (all static/mock, time is live `Date`).
**Components:** `AppShell` (title "Dashboard"), settings icon link, `WeatherWidget` (static/decorative), module tile list.
**Interactive controls:**
- Settings icon (top-right) → `Link to="/settings"`.
- Module tiles (Link rows): Configurator → `/configurator` (available); DT Analyzer → `/modules/dt-analyzer` (available); Product Manual → `/modules/product-manual` (available); Site Survey → `/modules/site-survey` (marked unavailable, shows "Soon" badge, opacity-60, but still clickable/navigable — ComingSoon screen shown); Installation → `/modules/installation` (same "Soon" treatment).
**Data source:** `useApp((s) => s.user)` from `store.ts` for name/designation; hardcoded `modules` array in file; `Date` for greeting/time (client-computed, no fetch).
**State fields used:** `user`.
**Validation:** none.
**Empty/loading:** none — always renders; `user` optional fields fall back to "Engineer"/"Field Engineer" if null.

---

## 3. `/configurator` (index) — `src/routes/_authenticated/configurator.index.tsx`
**Route:** `/_authenticated/configurator/` → path `/configurator`.
**Purpose:** BLE device discovery, search by ID/QR, connect, and route into device read/configure screen.
**Headings/labels:** Badge "Demo Mode · Timer is simulated"; button "Search Nearby Devices" (subtext "Scanning for KESCO devices…" / "Tap to start BLE scan", right pill "{n} found"); input placeholder "Enter Device ID (e.g. 1000002345)"; QR icon button; "Search" button; "Device Found" (success label) when matched; "Other BLE Devices (n)" / "Available BLE Devices (n)"; empty message `No nearby KESCO devices. Tap "Search Nearby Devices" to scan.`
**Components:** `Input`, `Button`, custom `DeviceCard`, `DiscoverableBadge`.
**Interactive controls:**
- "Search Nearby Devices" button → `scan()` (disabled while `scanning`).
- Device-ID text input (numeric) + Enter-to-search.
- QR button (`handleQr`) — picks a random supported device, fills query & highlights it, toast "QR scanned".
- "Search" button (`handleSearch`) — validates ID via `getDeviceTypeInfo`; if invalid prefix → toast error "Unsupported device ID … must start with 10, 11, 12, 20, or 21."; if no match → toast error "No nearby device matches that ID"; else highlights + toast success "Device found".
- Per device card: "Connect" button (calls `connect(id)`, disabled while status="connecting", shows "…"); once connected: "Read Data" button (`Eye` icon, mode="get") and "Configure" button (`Pencil` icon, mode="set") — both call `handleOpen` which connects if needed then navigates to `/configurator/device/$id?mode=get|set`.
**Data source:** `useApp` store: `devices`, `scanning`, `scan()`, `connect()`, `connectedDeviceId`; filtered through `getDeviceTypeInfo` (devices.ts) to only KESCO-prefixed IDs.
**State/store fields used:** `devices: BleDevice[]`, `scanning`, `connectedDeviceId`.
**Validation:** Device ID must map to a `KescoDeviceType` via 2-digit prefix (10/11/12/20/21); otherwise rejected with toast.
**Empty state:** "No nearby KESCO devices…" placeholder when `others.length === 0`.
**Loading state:** Scan button pulses radar icon and disables while `scanning`; polling interval refreshes RSSI every 4s; 1s tick refreshes discoverable countdown display.
**Disabled state:** Connect button disabled during `connecting`; hydration-safe rendering (SSR placeholder for discoverable badge until `mounted`).

---

## 4. `/configurator/device/$id` — `src/routes/_authenticated/configurator.device.$id.tsx`
**Purpose:** Device telemetry read-out plus editable configuration write-back (BLE simulated).
**Search params:** `mode: "get" | "set"` (validated, defaults to "get").
**Headings/labels:** Status row: "Configure" / "Reading Data" / "Connecting…"; "Demo Mode" badge; countdown pill (only in set mode); banner "Prototype Simulation — fields stay editable for demo" with "Simulate Reset" button; Section "Device Telemetry (Read-only)"; Section "Configuration" with right-aligned "Editable"/"Locked"/"Read-only" label; sticky banner "{n} Parameter(s) Modified · Unsaved changes"; primary CTA "Configure Device"/"Writing…" (set mode) or "Close" (get mode); link "Disconnect & back".
**Components:** `CountdownPill`, `Section`, `ReadRow` (icon tiles), `FieldRow` (editable inputs w/ "Modified" highlight badge), `Button`, `Input`, `Label`.
**Read-only rows:** Device Type, Firmware, Battery (V), Core Temp (°C), RSSI (dBm), Error Status (icon/tone changes OK vs error), BLE Network, Analog Values (joined string).
**Editable fields (set mode only):** Data Schedule Frequency (min), Alert Frequency Count, Alert Frequency Interval (sec), IOA, BLE Network. (Note: `dataPushType` is in the form state/schema but has **no rendered FieldRow** — not editable via UI despite schema support.)
**Interactive controls:**
- "Simulate Reset" button → `simulateReset(id)`, toast "Device reset — Discoverable window: 2 minutes".
- Each numeric `FieldRow` input — updates local `form` state; shows "Modified" pill + highlight styling when different from device's current config.
- "Configure Device" button → validates `form` via `configSchema.safeParse`; on failure sets field errors + toast "Please fix validation errors"; on success calls `writeConfig(id, next)` (has 8% simulated random failure) → on success: toast "Configuration written", `addLog(...)`, navigate back to `/configurator`; on failure: toast "BLE write failed — Device did not ACK. Retry."
- "Close" button (get mode) → navigate to `/configurator`.
- "Disconnect & back" link → `disconnect()` + navigate to `/configurator`.
**Data source:** `useApp` store device by id; `configSchema` (zod) from `src/lib/configurator/schema.ts`.
**State/store fields used:** `devices`, `connectedDeviceId`, `connect`, `disconnect`, `simulateReset`, `writeConfig`, `addLog`, `user`.
**Validation rules (zod `configSchema`):**
- `dataScheduleFrequency`: int, min 1 ("Min 1 min"), max 1440 ("Max 1440").
- `alertFrequencyCount`: int, min 0, max 100.
- `alertFrequencyInterval`: int, min 10 ("Min 10 sec"), max 3600.
- `ioa`: int, min 1, max 65535.
- `bleNetwork`: int, min 0, max 15.
- `dataPushType`: enum `MQTT | HTTP | TCP`.
**Empty/loading/disabled:** "Device not found." message if id doesn't resolve. Auto-connect effect on mount if not already connected. `isEditable` is always true in set mode (DEMO MODE — timer expiry is visual-only, does not lock fields per code comments). Save button disabled while `saving` or (theoretically) `!isEditable`.

---

## 5. DT Analyzer module — layout: `modules.dt-analyzer.tsx`
**Route:** `/_authenticated/modules/dt-analyzer` (layout, wraps children in `AppShell` title "DT Analyzer", back to `/dashboard`).
**Sub-nav (tabs):** "Dashboard" (`/modules/dt-analyzer`, exact), "DT List" (`/modules/dt-analyzer/list`), "Alerts" (`/modules/dt-analyzer/alerts`) — icons `LayoutDashboard/List/BellRing`; active tab styled with primary bg.

### 5a. DT Analyzer Dashboard — `modules.dt-analyzer.index.tsx`
**Purpose:** Fleet-wide KPI dashboard with hierarchy filters, charts, and active-alerts panel.
**Headings:** Utility card "KESCO, Kanpur"; "Hierarchy" (Circle/Division/Sub-Div selects); Section "DT Overview" (KPIs: Total DTs, Live DTs, Inactive DTs, Under Outage); Section "DT Rating Status" (stacked bar chart Live/Outage/Unavailable by kVA rating) with export icon; Section "Sensor Overview" (KPIs: Active Sensors, Inactive Sensors, Critical Alarms, Data Availability); Section "Sensor Status by Type" (bar chart Active/Inactive by sensor type); Section "Active Alerts" (KPI tiles per alert type, clickable filter); Section "Active Alerts List" (search + CSV export + expandable alert cards).
**Components:** `FilterSelect` (native `<select>`), `KpiCard`, recharts `BarChart`/`XAxis`/`YAxis`/`Tooltip`/`Legend`, `AlertCard` (expand/collapse), `IconBtn` (Refresh/Export, decorative — no handlers wired).
**Interactive controls:**
- Circle/Division/Sub-Division selects — cascading (`HIERARCHY` map); Division disabled until circle chosen; Sub-Div disabled until division chosen. (Filters render but are **not actually applied** to the KPI/chart data below — purely UI state, since KPI data (`DT_KPIS`, `SENSOR_KPIS`) is static.)
- Active Alert KPI tiles — click toggles `kpi` filter (highlights selected tile, filters alert list by `a.type === kpi`; click again clears).
- Search input — filters `ACTIVE_ALERTS` list by dt/type/subDivision substring (case-insensitive).
- "Clear" chip — resets `kpi` filter.
- Export (Download icon) on Active Alerts List — builds CSV client-side (`Blob`) and triggers download `active-alerts.csv` with columns DT, Circle, Division, SubDivision, Type, Description, AlarmValue, CurrentValue, AlarmTs, CurrentTs.
- Alert card row — click toggles inline detail (Circle/Division/Sub Division/Alert Type/Description/Alarm Value/Current Value/Alarm Timestamp/Current Timestamp).
- Refresh/Export `IconBtn`s at top and per-chart Export buttons are decorative (no `onClick`).
**Data source:** `src/lib/mock/dt-analyzer-full.ts`: `HIERARCHY`, `DT_KPIS`, `SENSOR_KPIS`, `DT_RATING_DATA`, `SENSOR_TYPE_DATA`, `ACTIVE_ALERT_SUMMARY`, `ACTIVE_ALERTS`.
**Empty state:** "No alerts" text if filtered list empty.
**Validation/loading/disabled:** none (all static mock data); Division/Sub-Div selects visually disabled (opacity-50) when parent unselected.

### 5b. DT List — `modules.dt-analyzer.list.tsx`
**Route:** `/modules/dt-analyzer/list`.
**Purpose:** Searchable/filterable list of distribution transformers with expandable detail cards and link to DT Info page.
**Headings:** Mini KPI row "Total 1250 / Attention 87 / Outage 35 / Normal 1128" (static, not derived from filtered rows); search input "Search DTs…"; filter button with active-count badge; active filter chips + "Clear all"; "{n} of {total} DTs"; card fields: DT code, status badge (Normal/Attention/Outage), circle·division·subDivision, substation·kVA·dtType, Lug R/Y/B/N chips, Oil Temp / Oil Level metric tiles (with timestamp), alert badges (Lug Alert, Oil Temp Alert, Oil Level Alert, Outage) each with timestamp, footer "Updated {time}" + gateway name/status icon (Wifi/WifiOff). Expanded card shows "Open DT Info →" link.
**Components:** custom `DTCard`, `MetricTs`, `AlertBadgeTs`, `LugChip`, `Mini`, `FilterSelect`, `ListFilterSheet` (bottom sheet/modal), `SegField` (segmented pill group).
**Interactive controls:**
- Search input — filters by `code`, `subDivision`, `substation` substrings.
- Filter button (`Filter` icon) → opens `ListFilterSheet` modal (bottom sheet on mobile).
- Filter sheet fields: Circle/Division/Sub-Division cascading selects; segmented filters: DT Status (All/Normal/Attention/Outage), Outage (All/Normal/Outage), Oil Level (All/Normal/Low/Critically Low), Oil Temperature (All/Normal/High), Lug Alerts (All/Normal/Active Alert). Buttons "Clear Filters" and "Apply Filters" (apply closes sheet and commits to page-level `filters` state); clicking backdrop or X also closes without applying.
- Active-filter chips row (non-"All"/"all" values) + "Clear all" button resets to `emptyListFilters()`.
- Each `DTCard` — click header toggles expand/collapse; expanded reveals "Open DT Info →" → `Link to="/modules/dt-analyzer/dt/$code"`.
**Data source:** `DT_LIST: DTListItem[]`, `HIERARCHY` from `dt-analyzer-full.ts`.
**State fields:** local `q` (search), `filters: ListFilters`, `expanded`, `filterOpen`.
**Validation:** none (pure client filtering).
**Empty state:** "No DTs match current filters" when `rows.length === 0`.

### 5c. Alerts (Live Alert Stream) — `modules.dt-analyzer.alerts.tsx`
**Route:** `/modules/dt-analyzer/alerts`.
**Purpose:** Live/resolved alarm stream with swipe-to-acknowledge and severity health ring.
**Headings:** "System Health Summary" / "Your Sub-Division Zone" with SVG health ring (Critical/Warning tally + progress bar); filter pills "All / Critical / Warning" (with counts); checkbox "Show only my assigned DTs"; Section "Live Alerts" ({count}); Section "Resolved" ({count}, only if >0).
**Components:** `HealthRing` (SVG donut), `Tally`, `FilterPill`, custom checkbox, `SwipeableAlertCard` (touch swipe reveal "Acknowledge" action).
**Interactive controls:**
- Filter pills — set `filter` state ("all"/"critical"/"warning"), affects `visible` list.
- "Show only my assigned DTs" checkbox — toggles `mineOnly`, filters by `assignedToMe`.
- Alert card: tap → navigate to `/modules/dt-analyzer/dt/$code`; swipe left (touch) reveals green "Acknowledge" action button → `onAcknowledge` marks `acknowledged[id]=true`, removing it from `visible`/counts (local only, not persisted).
**Data source:** `DT_ALARMS: DtAlarm[]` from `src/lib/mock/dt-analyzer.ts`.
**State:** local `filter`, `mineOnly`, `acknowledged` map (component-local, resets on remount).
**Empty state:** "No active alerts in your zone." when `liveAlerts.length === 0`.
**Validation:** none.

### 5d. DT Info — `modules.dt-analyzer.dt.$code.tsx`
**Route:** `/modules/dt-analyzer/dt/$code`.
**Purpose:** Deep-dive detail page for one DT: identity info, live snapshot, and 3 sensor history sections (graph/table toggle) + CSV export button (UI only).
**Headings:** "Back to DT List" link; DT code header card with status badge + lat/lng; collapsible "General Information" panel (DT Code, Circle, Division, Sub-Division, Substation, Substation ID, Feeder, Rating, DT Type, Installed Type, Manufacturer, Number of Customers, Gateway, Gateway Serial Number, Sensor Serial Numbers, Installation Date, Address, Latitude, Longitude, Landmark, Status, Remarks); Section "Latest Snapshot" (Lug R/Y/B/N, Oil Level, Oil Temp tiles); Section "Lug Temperature" (graph/table toggle + export); Section "Oil Temperature" (graph/table toggle + export); Section "Oil Level" (bar-strip visual/table toggle + export).
**Components:** `GeneralInformation` (accordion), `Snap` (KPI tile), `ViewToggle` (graph/table segmented switch), `ChartCard`, `ScrollTable` (horizontally scrollable table w/ sticky first column), recharts `LineChart`.
**Interactive controls:**
- "Back to DT List" link → `/modules/dt-analyzer/list`.
- General Information header — click toggles accordion expand (chevron rotate).
- Graph/Table segmented toggle per section (3 instances) — switches rendered view.
- Export icon buttons (3, one per section) — decorative, no `onClick` handler wired.
**Data source:** `DT_LIST`, `DT_DETAILS`, `LUG_TABLE`, `OIL_TEMP_TABLE`, `OIL_LEVEL_TABLE` from `dt-analyzer-full.ts`; chart series `LUG`, `OIL_TEMP` are locally generated sinusoidal mock arrays (24 hourly points) inside this file.
**Table columns:**
- Lug/Oil Temp tables: Device ID, Sensor Type, Server Time, Sensor Timestamp, Firmware, BLE Network ID, Analog, Battery (V), Cal Coef, Freq, Alert Count, Alert Interval, Crit Limit, IOA, Core Temp, RSSI, Error, Push Type.
- Oil Level table: Device ID, Sensor Type, Battery (V), Digital, Oil Level Status, RSSI, Firmware, Cal Coef, Crit Limit, Freq, Alert Count, Alert Interval, IOA, Error, Push Type.
**Validation/empty/loading:** none; falls back to `DT_LIST[0]` if `code` param unmatched; `DT_DETAILS` fields optional-chained with "—" fallback (only `DT-3421` has full detail record).

---

## 6. Product Manual module
### Layout — `modules.product-manual.tsx`: pure `<Outlet/>` passthrough (no shell of its own; children render their own `AppShell`).

### 6a. Index — `modules.product-manual.index.tsx`
**Route:** `/modules/product-manual`.
**Purpose:** Searchable catalog of sensor/gateway field manuals grouped by category.
**Headings:** search input "Search sensors, gateway, troubleshooting…"; category group headers ("Sensors", "Communication"); empty text `No manuals match "{q}"`.
**Components:** grouped `Link` cards with icon tile, title (shortName), tagline, chevron.
**Interactive controls:** search box filters `MANUAL_PRODUCTS` by name/shortName/tagline/categoryLabel/section headings/static `SEARCH_KEYWORDS` list (installation, communication, troubleshooting, wiring, commissioning, maintenance, safety) — case-insensitive substring match across joined haystack. Each card → `Link to="/modules/product-manual/$slug"`.
**Data source:** `MANUAL_PRODUCTS`, `ACCENT_TONES` from `src/lib/product-manual.ts`.
**Empty state:** "No manuals match "{q}"" message.

### 6b. Detail — `modules.product-manual.$slug.tsx`
**Route:** `/modules/product-manual/$slug`.
**Purpose:** Static per-product manual detail with 10 standard sections, all placeholder body text pending KESCO approval.
**loader:** `findManual(slug)`; `throw notFound()` if slug unknown (renders TanStack Router's not-found boundary).
**Headings:** Product icon/name/category/tagline header card; notice "Structured manual template. Approved KESCO engineering content will be published here."; then 10 sections per product: Overview, Purpose, Installation Guide, Wiring / Connection, Configuration / Commissioning, Normal Operation, Troubleshooting, Communication Checks, Maintenance / Field Checks, Safety Notes — each body = placeholder string "Content pending approval from KESCO engineering. Approved technical details will appear here."
**Interactive controls:** none (read-only content page); back arrow to `/modules/product-manual` via AppShell.
**Data source:** `findManual(slug)` / `MANUAL_PRODUCTS` array (9 products: lug-r, lug-y, lug-b, lug-n, oil-level, oil-temperature, ambient-temperature, humidity [category "sensor"], gateway [category "communication"]).

---

## 7. `/modules/site-survey` — `modules.site-survey.tsx`
**Purpose:** Placeholder "Coming Soon" screen (renders shared `ComingSoon` component, icon `MapPin`).
**Headings:** Title "Site Survey"; badge "Coming Soon"; "Planned features" list:
- GPS-tagged site capture with offline maps
- Photo evidence and asset tagging
- Survey templates per feeder / DT / pole
- Auto-sync to KESCO GIS once online
**Interactive controls:** none (static informational page); back to `/dashboard` via shell.
**Data source:** none — hardcoded `features` array passed as prop.

## 8. `/modules/installation` — `modules.installation.tsx`
**Purpose:** Placeholder "Coming Soon" screen (icon `Wrench`).
**Headings:** Title "Installation App"; "Planned features":
- Step-by-step installation checklists
- Barcode / serial capture for assets
- Auto-commission via BLE handshake
- Digital sign-off with engineer signature
**Interactive controls:** none. Same `ComingSoon` component/back-nav pattern as Site Survey.

---

## 9. `/sync` — `src/routes/_authenticated/sync.tsx`
**Purpose:** "Sync Center" — upload pending config-write logs to (simulated) backend.
**Headings:** Gradient card "Pending" with count, subtext "Last sync {datetime}" or "Never synced"; button "Sync now"/"Syncing…"; log list rows (each: device name, deviceId + write time, status pill "synced"/"pending"); empty text "No activity yet. Write a configuration to see it here."
**Components:** `Button`, list rows w/ `CheckCircle2` (synced) / `Clock` (pending) icons.
**Interactive controls:** "Sync now" button — if `pending === 0`, toast.info "Nothing to sync" (no action); else disables self, calls `syncLogs()` (1.5s simulated delay, marks all logs synced + sets `lastSyncAt`), then toast.success "Sync complete — {n} log(s) uploaded".
**Data source:** `useApp`: `logs: ConfigLog[]`, `lastSyncAt`, `syncLogs()`. Shows only first 10 logs (`logs.slice(0,10)`).
**Validation:** none.
**Empty state:** "No activity yet…" placeholder when `logs.length === 0`.
**Loading/disabled:** button disabled + label "Syncing…" while `busy`.

---

## 10. `/logs` — `src/routes/_authenticated/logs.tsx`
**Purpose:** Full audit trail of configuration writes with old→new value diff.
**Headings:** "No logs yet" empty state (icon `ScrollText`) with subtext "Configuration writes will appear here."; per-entry: device name, timestamp, deviceId, "by {engineer}", then diff rows per changed field: `{key}` `{old}` → `{new}` (old strikethrough red, new green); unchanged fields (`before === after`) are skipped.
**Components:** plain cards, no shared UI primitives.
**Interactive controls:** none — read-only list.
**Data source:** `useApp((s) => s.logs)` — full unfiltered list (unlike Sync's 10-item slice).
**Validation:** none.
**Empty state:** dashed-border placeholder card when no logs.

---

## 11. `/profile` — `src/routes/_authenticated/profile.tsx`
**Purpose:** User profile display + change-password flow + logout.
**Headings/sections:** Avatar (initials) + name + designation + role badge; "Basic Information" (Name, Employee ID, Role, Designation); "Organization" (Reporting Manager, Department, Circle, Status, Expiry Date); "Contact Information" (Email, Phone); "Account Information" (User ID, Joined On, Last Login, Last Password Reset, Last Updated); row buttons "Change Password" and "Settings"; "Logout" button (destructive).
**Components:** `InfoSection`/`InfoRow` (icon+label+value, "—" fallback), `ChangePasswordDialog` (modal, 2-step wizard).
**Interactive controls:**
- "Change Password" row → opens `ChangePasswordDialog`.
  - Step "verify": password input (show/hide eye toggle) + "Continue" (disabled until non-empty); calls `changePassword(oldPw, oldPw)` as a verification trick (re-sets same password) — if `reason === "incorrect_old_password"` shows error "Incorrect current password", else advances to step "set".
  - Step "set": new password + confirm password inputs (show/hide toggle on new); "Update Password" (disabled until both filled); client checks length ≥6 ("Password must be at least 6 characters") and match ("Passwords do not match") before calling `changePassword(oldPw, newPw)`; on success shows "✓ Password updated" and auto-closes after 1.2s; on backend-style failure shows "Unable to update password".
  - Close (X) button / no backdrop-dismiss coded explicitly beyond X.
- "Settings" row → `Link to="/settings"`.
- "Logout" button → `logout()` + navigate to `/login`.
**Data source:** `useApp`: `user: User`, `logout`, `changePassword`.
**Validation rules:** new password min length 6 (`store.changePassword`); confirm-match check is client-side in dialog; old-password check delegates to store's `password` field comparison.
**Empty/loading:** all `InfoRow` values fallback to "—" if undefined; no async loading spinners (all instant/local state).

---

## 12. `/settings` — `src/routes/_authenticated/settings.tsx`
**Purpose:** App-level preference toggles + logout.
**Headings/rows:** "BLE Permission" (desc "Allow scanning nearby devices"); "Dark Theme" (desc "Switch between light & dark mode"); "Sync Settings" (desc "Auto-sync logs when online"); button "Run sync now"; "App Version" (desc "KESCO Suite", value "v0.1.0"); "Logout" button.
**Components:** `Switch` ×3, `Button`.
**Interactive controls:**
- BLE Permission `Switch` — bound to `blePermission`/`setBlePermission` (persisted).
- Dark Theme `Switch` — bound to `theme === "dark"` / `toggle()` from `ThemeProvider` (not the zustand store).
- "Sync Settings" `Switch` — `defaultChecked` only; **not wired to any state** (cosmetic, uncontrolled).
- "Run sync now" button → `syncLogs()` directly (no toast feedback here, unlike Sync page).
- "Logout" button → `logout()` + navigate to `/login`.
**Data source:** `useApp`: `blePermission`, `setBlePermission`, `logout`, `syncLogs`; `useTheme()` context for theme.
**Validation:** none.
**Empty/loading/disabled:** none.

---

## Auth guard — `src/routes/_authenticated.tsx`
Layout route wrapping all authenticated pages. `beforeLoad` (client-only): reads `localStorage["kesco-app"]`; parses persisted zustand state; if `state.user` falsy (or parse throws), `throw redirect({ to: "/login" })`. On server (`typeof window === "undefined"`) skips check (SSR passthrough).

---

## `src/lib/mock/store.ts` — Zustand store (`useApp`), persisted as `localStorage["kesco-app"]`
**Persistence:** `zustand/middleware persist`, `name: "kesco-app"`, `partialize` saves only: `user, password, logs, lastSyncAt, blePermission` (BLE `devices`, `connectedDeviceId`, `scanning` are NOT persisted — reset each session to `SEED_DEVICES`/null/false).

**State fields:**
- `user: User | null` — current logged-in user profile.
- `password: string` — default `"kesco123"`; mutated by `changePassword`.
- `blePermission: boolean` — default `true`.
- `devices: BleDevice[]` — default `SEED_DEVICES`.
- `scanning: boolean` — default `false`.
- `connectedDeviceId: string | null`.
- `logs: ConfigLog[]` — default `[]`.
- `lastSyncAt: number | null` — default `null`.

**Actions:**
- `login(email)`: builds a fully-populated mock `User` (random `employeeId`/`userId`, fixed designation "Field Engineer", role "Engineer", department "Distribution Operations", circle "Kanpur Urban Circle", phone masked, reportingTo "S. K. Verma (Executive Engineer)", joinedOn "12 Aug 2021", status "Active", expiryDate = 1 year from now, timestamps via `stamp()` helper (en-IN locale)).
- `logout()`: clears `user` and `connectedDeviceId`.
- `changePassword(oldPw, newPw)`: returns `{ok:false, reason:"incorrect_old_password"}` if mismatch; `{ok:false, reason:"too_short"}` if `newPw.length < 6`; else updates `password` + `user.lastPasswordReset/lastUpdated` and returns `{ok:true}`.
- `setBlePermission(v)`.
- `scan()`: sets `scanning=true`, 1200ms delay, jitters+re-sorts device RSSI descending, `scanning=false`.
- `refreshRssi()`: jitters RSSI only (no re-sort), used by 4s poll.
- `connect(id)`: finds device; sets its status "connecting"; 900ms delay; sets `connectedDeviceId=id`, that device status "connected", all others "idle"; returns `{ok:true}` (or `{ok:false, reason:"not_found"}` if missing). Comment notes DEMO MODE does not enforce discoverable window.
- `disconnect()`: clears `connectedDeviceId`, resets all device statuses to "idle".
- `simulateReset(id)`: sets `discoverableUntil = now + 2min` for that device.
- `clearDiscoverable(id)`: sets `discoverableUntil = null`.
- `writeConfig(id, next)`: 1100ms delay; 8% random chance returns `{ok:false}` (no state change); else updates that device's `config` and returns `{ok:true}`.
- `addLog(l)`: prepends log to `logs`.
- `syncLogs()`: 1500ms delay; marks every log `synced:true`; sets `lastSyncAt = Date.now()`.

---

## `src/lib/mock/types.ts` — type definitions
```ts
export type DeviceStatus = "idle" | "connected" | "connecting" | "error";

export type KescoDeviceType =
  | "sensor_gateway" | "inmeter_sensor_gateway" | "lug_temp" | "oil_temp" | "oil_level";

export interface BleDevice {
  id: string; name: string; mac: string; rssi: number; status: DeviceStatus;
  deviceType: KescoDeviceType;
  discoverableUntil: number | null; // epoch ms; null = not discoverable
  config: DeviceConfig;
}

export interface DeviceConfig {
  deviceType: string; firmwareVersion: string; batteryVoltage: number; coreTemp: number;
  errorStatus: string; analogValues: number[];
  // editable
  dataScheduleFrequency: number; alertFrequencyCount: number; alertFrequencyInterval: number;
  ioa: number; bleNetwork: number; dataPushType: "MQTT" | "HTTP" | "TCP";
}

export interface User {
  email: string; name: string; employeeId: string;
  role?: "Admin" | "Engineer" | "Viewer"; designation?: string; department?: string;
  circle?: string; phone?: string; reportingTo?: string; joinedOn?: string; userId?: string;
  status?: "Active" | "Inactive" | "Suspended"; expiryDate?: string;
  lastLogin?: string; lastPasswordReset?: string; lastUpdated?: string;
}

export interface ConfigLog {
  id: string; deviceId: string; deviceName: string; engineer: string; timestamp: number;
  oldValues: Partial<DeviceConfig>; newValues: Partial<DeviceConfig>; synced: boolean;
}
```

---

## `src/lib/mock/devices.ts`
- `KESCO_TYPE_RANGES`: maps `KescoDeviceType` → `{start,end,prefix,label,short}` id-range/prefix table:
  - `sensor_gateway`: prefix "10", range 1000000001–1099999999, label "Sensor Gateway".
  - `inmeter_sensor_gateway`: prefix "11", 1100000001–1199999999, "Inmeter Sensor Gateway".
  - `lug_temp`: prefix "12", 1200000001–1299999999, "Lug Temperature".
  - `oil_temp`: prefix "20", 2000000001–2099999999, "Oil Temperature".
  - `oil_level`: prefix "21", 2100000001–2199999999, "Oil Level".
- `getKescoDeviceType(deviceId)`: derives type from first 2 chars of ID vs prefix table.
- `getDeviceTypeInfo(deviceId)`: returns full range-info object or null (used for validating device IDs in Configurator).
- `SEED_SPECS`/`SEED_DEVICES`: 6 seeded `BleDevice`s (ids 1000002345, 1100007821, 1200004321, 2000008765, 2100009087, 1000034512) each with mac, rssi, firmware, battery, core temp, analog readings; two are `discoverable:true` (2-min countdown from load time); default editable config: `dataScheduleFrequency:15, alertFrequencyCount:3, alertFrequencyInterval:60, ioa:1024, bleNetwork:4, dataPushType:"MQTT"`; `errorStatus` = "LOW_BATT" if battery < 11.5 else "OK".
- `jitterRssi(rssi)`: adds random ±4 dBm, clamped to [-99, -30].

---

## `src/lib/mock/dt-analyzer-full.ts` (DT Analyzer datasets)
- `HIERARCHY`: 3 circles → divisions → sub-divisions (Kanpur/Lucknow/Varanasi Circles).
- `HierarchyNode`/`INITIAL_HIERARCHY_NODES`: generated Circle/Division/Sub-Division node tree with ids/codes/status (unused by any route directly visible, likely scaffolding).
- `DT_KPIS = {total:1250, live:1050, inactive:165, outage:35}`; `SENSOR_KPIS = {active:3730, inactive:242, criticalAlarms:12, availability:"98.5%"}`.
- `DT_RATING_DATA`: 5 rows (rating "25/63/100/160/250") with Live/Outage/Unavailable counts (bar chart).
- `SENSOR_TYPE_DATA`: 3 rows (Oil Level/Oil Temp/Lug Temp) with Active/Inactive counts.
- `CriticalAlert`/`CRITICAL_ALERTS`: 6 sample alerts (unused directly on inspected pages, likely legacy).
- `ACTIVE_ALERT_SUMMARY`: 5 KPI tiles (High Lug Temp, Low Oil Level, Critical Oil Level, High Oil Temp, Gateway Outage) with counts/colors.
- `ActiveAlert`/`ACTIVE_ALERTS`: 5 detailed alert records (id, dt, circle/division/subDivision, type, description, alarmValue, currentValue, alarmTs, currentTs, severity).
- `DTDetail`/`DT_DETAILS`: keyed by DT code; only `"DT-3421"` populated with full field set (substationId, feeder, dtType, installedType, customers, manufacturer, installDate, slaStart, address, lat/lng, landmark, per-phase lug serials, oil sensor serials, meter, gatewaySn, status, remarks).
- `DTListItem`/`DT_LIST`: 6 DT records with full status/lug/oil/alert/timestamp fields (used by List page and DT Info page).
- `DT_UPLOAD_TEMPLATE_COLUMNS`: 28-column CSV header template (for a bulk-upload feature, not wired to any visible route).
- `LUG_TABLE` / `OIL_TEMP_TABLE` / `OIL_LEVEL_TABLE`: each 12 generated rows of sensor telemetry-history table data (device id, sensor type, timestamps, firmware, ble id, analog, battery, cal coef, freq, alert count/interval, crit limit, ioa, core temp, rssi, error, push type — oil level table swaps some columns for digital/status).

## `src/lib/mock/dt-analyzer.ts` (legacy/alerts dataset used only by Alerts tab)
- `DtStatus` enum: healthy|attention|overload|critical|offline.
- `DtAsset` interface + `DT_ASSETS`: 6 richly-specified transformer assets (voltages/currents/health index/etc.) — appears unused by any route currently inspected (dashboard/list/dt-info all use `dt-analyzer-full.ts` instead).
- `DtAlarm` interface + `DT_ALARMS`: 7 alarms (critical/warning/info) with `active`, `assignedToMe` flags — used by Alerts tab.
- `CIRCLES`, `DIVISIONS_BY_CIRCLE`, `SUBDIVS_BY_DIVISION`: alternate hierarchy constants (unused directly in inspected routes).
- `FLEET_STATS`, `ALERT_KPI`, `REGIONAL_HEALTH`: additional static aggregates (not observed wired into current pages — legacy/unused).
- `genTrend(metric)`: generates 24-point sinusoidal random trend series for voltage/current/temp.
- `statusColor(status)`: maps `DtStatus` to bg/text/label tone classes.

---

## `src/lib/product-manual.ts`
- `ManualCategory = "sensor" | "communication"`.
- `ManualSection { heading: string; body: string }`.
- `ManualProduct { slug, name, shortName, category, categoryLabel, tagline, icon, accent, sections: ManualSection[] }`.
- `PLACEHOLDER` text: "Content pending approval from KESCO engineering. Approved technical details will appear here."
- `commonSections()`: generates the same 10 sections (Overview, Purpose, Installation Guide, Wiring / Connection, Configuration / Commissioning, Normal Operation, Troubleshooting, Communication Checks, Maintenance / Field Checks, Safety Notes) all filled with `PLACEHOLDER`.
- `MANUAL_PRODUCTS`: 9 entries —
  1. `lug-r` "Lug R Temperature Sensor" (sensor, destructive accent, icon `Zap`)
  2. `lug-y` "Lug Y Temperature Sensor" (sensor, warning, `Zap`)
  3. `lug-b` "Lug B Temperature Sensor" (sensor, primary, `Zap`)
  4. `lug-n` "Lug N Temperature Sensor" (sensor, accent, `Zap`)
  5. `oil-level` "Oil Level Sensor" (sensor, primary, `Droplet`)
  6. `oil-temperature` "Oil Temperature Sensor" (sensor, warning, `Thermometer`)
  7. `ambient-temperature` "Ambient Temperature Sensor" (sensor, success, `Waves`)
  8. `humidity` "Humidity Sensor" (sensor, primary, `CloudRain`)
  9. `gateway` "Sensor Gateway" (communication, accent, `Router`)
- `findManual(slug)`: array `.find`.
- `ACCENT_TONES`: maps accent key → Tailwind class pair (bg/text) for primary/success/warning/destructive/accent.

---

## `src/lib/configurator/schema.ts` — zod validation
```ts
export const configSchema = z.object({
  dataScheduleFrequency: z.coerce.number().int().min(1, "Min 1 min").max(1440, "Max 1440"),
  alertFrequencyCount: z.coerce.number().int().min(0).max(100),
  alertFrequencyInterval: z.coerce.number().int().min(10, "Min 10 sec").max(3600),
  ioa: z.coerce.number().int().min(1).max(65535),
  bleNetwork: z.coerce.number().int().min(0).max(15),
  dataPushType: z.enum(["MQTT", "HTTP", "TCP"]),
});
export type ConfigFormValues = z.infer<typeof configSchema>;
```
Used exclusively by `configurator.device.$id.tsx` on "Configure Device" submit; field-level error messages keyed by `issue.path[0]` and displayed under the relevant `FieldRow`.

---

## `src/components/app-shell.tsx` — bottom nav items
Fixed bottom tab bar (4 items, `grid-cols-4`), active state detected via `location.pathname.startsWith(item.to)`:
1. **Home** — `/dashboard` — icon `LayoutDashboard`.
2. **Sync** — `/sync` — icon `RefreshCw`.
3. **Logs** — `/logs` — icon `ScrollText`.
4. **Profile** — `/profile` — icon `User2`.

Header (per screen): left = back-arrow (`ArrowLeft`, if `back` prop supplied) or KESCO bolt logo mark; "KESCO Suite" eyebrow label + page `title`; right = theme toggle button (`Moon`/`Sun` icon) calling `useTheme().toggle()`. Screens without `back` prop (Dashboard, Sync, Logs, Profile, Settings-as-detail via own back) show the logo mark instead of a back button — note Settings and DT-Analyzer sub-routes do pass `back:{to:"/dashboard"}`.
