$root = "c:\Users\Lenovo\OneDrive\Documents\Codingcamp-revo\CodingCamp-16November26-ekoprastiyo-1"
$html = Get-Content "$root\index.html" -Raw
$js   = Get-Content "$root\js\app.js"  -Raw

$pass = 0; $fail = 0
function Check($ok, $msg) {
    if ($ok) { Write-Host "  [PASS] $msg"; $script:pass++ }
    else      { Write-Host "  [FAIL] $msg"; $script:fail++ }
}

Write-Host "`n=== 1. STATIC CHECKS: index.html ==="

$ids = @(
  'id="greeting-time"',  'id="greeting-date"',  'id="greeting-text"',
  'id="timer-display"',  'id="timer-start"',     'id="timer-stop"',  'id="timer-reset"',
  'id="todo-input"',     'id="todo-add-btn"',    'id="todo-list"',
  'id="link-label"',     'id="link-url"',        'id="link-add-btn"', 'id="link-list"',
  'id="link-label-error"', 'id="link-url-error"', 'id="storage-error"'
)
foreach ($id in $ids) { Check ($html -match [regex]::Escape($id)) "HTML has $id" }

$todoTag  = [regex]::Match($html, '(?s)<input[^>]*id="todo-input"[^>]*>').Value
$labelTag = [regex]::Match($html, '(?s)<input[^>]*id="link-label"[^>]*>').Value
Check ($todoTag  -match 'maxlength="250"') "#todo-input has maxlength=250"
Check ($labelTag -match 'maxlength="50"')  "#link-label has maxlength=50"
Check (-not ($html -match '<style'))        "No inline <style> blocks"
Check (-not ($html -match '\bstyle\s*='))   "No inline style= attributes"

Write-Host "`n=== 2. STATIC CHECKS: js/app.js ==="
Check (-not ($js -match '\bimport\b|\bexport\b'))          "No import/export statements"
Check (-not ($js -match '\bfetch\b|\bXMLHttpRequest\b'))   "No fetch/XMLHttpRequest"

Write-Host "`n=== 3. STATIC CHECKS: css/style.css ==="
Check (Test-Path "$root\css\style.css") "css/style.css exists"

Write-Host "`n=== 4. LOGIC CHECKS: Storage module ==="
Check ($js -match "TASK_KEY\s*:\s*'todo_tasks'")  "Storage.TASK_KEY = 'todo_tasks'"
Check ($js -match "LINK_KEY\s*:\s*'quick_links'") "Storage.LINK_KEY = 'quick_links'"
Check ($js -match 'if \(raw === null\) return \[\]') "Storage.load returns [] on null"
Check ($js -match 'catch\s*\(e\)')                   "Storage.load has try/catch"
Check ($js -match "banner\.classList\.add\('visible'\)") "Storage.onError adds .visible class"

Write-Host "`n=== 5. LOGIC CHECKS: GreetingWidget ==="
Check ($js -match "padStart\(2,\s*'0'\)")          "_formatTime uses padStart for zero-padding"
Check (($js -match 'getHours\(\)') -and ($js -match 'getMinutes\(\)')) "_formatTime reads hours and minutes"
Check ($js -match "'Sunday'.*'Monday'|weekdays")  "_formatDate has weekday names"
Check ($js -match "'January'.*'February'|months") "_formatDate has month names"
Check ($js -match 'getDay\(\)')                    "_formatDate calls getDay()"
Check ($js -match 'getDate\(\)')                   "_formatDate calls getDate()"
Check ($js -match 'getMonth\(\)')                  "_formatDate calls getMonth()"
Check ($js -match 'getFullYear\(\)')               "_formatDate calls getFullYear()"
Check ($js -match "'Good Morning'")   "_getGreeting has 'Good Morning'"
Check ($js -match "'Good Afternoon'") "_getGreeting has 'Good Afternoon'"
Check ($js -match "'Good Evening'")   "_getGreeting has 'Good Evening'"
Check ($js -match "'Good Night'")     "_getGreeting has 'Good Night'"
Check ($js -match 'isNaN\(date\.getTime\(\)\)') "_tick validates date with isNaN"
Check ($js -match 'Time unavailable') "_handleInvalidDate sets 'Time unavailable'"
Check ($js -match 'clearInterval\(this\.intervalId\)') "_handleInvalidDate stops interval"

Write-Host "`n=== 6. LOGIC CHECKS: FocusTimer ==="
Check ($js -match 'TOTAL_SECONDS\s*:\s*1500')  "TOTAL_SECONDS = 1500"
Check ($js -match "state\s*:\s*'idle'")         "initial state = 'idle'"
Check ($js -match 'remaining\s*:\s*1500')       "initial remaining = 1500"
Check ($js -match 'intervalId\s*:\s*null')      "initial intervalId = null"
Check ($js -match "this\.state\s*=\s*'running'") "_start sets state to 'running'"
Check ($js -match "this\.state\s*=\s*'paused'")  "_stop sets state to 'paused'"
Check ($js -match "this\.remaining\s*=\s*this\.TOTAL_SECONDS") "_reset restores TOTAL_SECONDS"
Check ($js -match 'this\.remaining\s*-=\s*1')    "_tick decrements remaining"
Check ($js -match 'this\.remaining\s*<=\s*0')    "_tick checks for reaching 0"
Check ($js -match 'this\.remaining\s*=\s*0')     "_tick clamps remaining to 0"

# Check _start resets remaining when re-starting after 0
Check ($js -match 'this\.remaining\s*===\s*0') "_start checks for remaining===0 before re-start"

Write-Host "`n=== 7. LOGIC CHECKS: FocusTimer button enable/disable ==="
Check ($js -match "btnStart\.disabled\s*=\s*true") "_render disables Start when running"
Check ($js -match "btnStop\.disabled\s*=\s*false") "_render enables Stop when running"
Check ($js -match "btnStart\.disabled\s*=\s*false") "_render enables Start when idle/paused"
Check ($js -match "btnStop\.disabled\s*=\s*true") "_render disables Stop when idle/paused"

Write-Host "`n=== 8. GREETING BOUNDARY CHECK (source scan) ==="
# Extract _getGreeting function body
$greetingFn = [regex]::Match($js, '(?s)_getGreeting\(hour\)\s*\{(.+?)(?=\n  \w|\n},)').Value
Write-Host "  _getGreeting source:`n$greetingFn"
# Check boundary values
Check ($js -match 'hour >= 5 && hour <= 11') "Morning: hours 5-11 (5..11 inclusive)"
Check ($js -match 'hour >= 12 && hour <= 16') "Afternoon: hours 12-16 (12..16 inclusive)"
Check ($js -match 'hour >= 17 && hour <= 20') "Evening: hours 17-20 (17..20 inclusive)"

Write-Host "`n=== 9. DOMContentLoaded bootstrap ==="
Check ($js -match 'DOMContentLoaded')           "DOMContentLoaded listener present"
Check ($js -match 'Storage\.init\(\)')           "Storage.init() called"
Check ($js -match 'GreetingWidget\.init\(\)')    "GreetingWidget.init() called"
Check ($js -match 'FocusTimer\.init\(\)')        "FocusTimer.init() called"
Check ($js -match 'TodoList\.init\(\)')          "TodoList.init() called"
Check ($js -match 'QuickLinks\.init\(\)')        "QuickLinks.init() called"

Write-Host "`n========================================="
Write-Host "  TOTAL: $pass passed, $fail failed"
Write-Host "========================================="
