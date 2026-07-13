$root = "C:\Users\marke\Documents\GitHub\pweng"
Write-Output "=== [1] 금지 4개 표현 잔존 검사 (0이어야 함) ==="
$banned = '진도 잠금','레슨 잠금','열리지 않','녹음 제출'
$hit = 0
Get-ChildItem $root -Recurse -Filter *.html | ForEach-Object {
  $c = Get-Content $_.FullName -Raw
  foreach($b in $banned){ if($c -match [regex]::Escape($b)){ Write-Output ("  [발견] {0} : {1}" -f $_.FullName.Replace($root,''), $b); $hit++ } }
}
if($hit -eq 0){ Write-Output "  전부 0 - 금지 표현 없음 (OK)" }
Write-Output ""
Write-Output "=== [2] category-compare 확정 팩트 잔존 검사 (남아있어야 함) ==="
$cc = Get-Content "$root\category-compare\index.html" -Raw
foreach($f in '92%','38,139','15년','AI 피드백','AI 기반','pweng.net'){
  $n = ([regex]::Matches($cc,[regex]::Escape($f))).Count
  Write-Output ("  {0} : {1}건" -f $f, $n)
}
Write-Output ""
Write-Output "=== [3] category-compare JSON-LD 유효성 ==="
$ms = [regex]::Matches($cc,'(?s)<script type="application/ld\+json">(.*?)</script>')
foreach($m in $ms){ try{ $null=$m.Groups[1].Value|ConvertFrom-Json; Write-Output "  OK" }catch{ Write-Output "  ERROR: $_" } }