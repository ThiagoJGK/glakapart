# run-e2e.ps1
# E2E Test Suite PowerShell Wrapper

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Executing Glak Apart Next E2E Test Suite...  " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Ensure we are in the project root directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($ScriptDir) {
    Push-Location $ScriptDir
}

# Run the python script
python "$ScriptDir\tests\run_e2e_tests.py"
$ExitCode = $LASTEXITCODE

if ($ScriptDir) {
    Pop-Location
}

if ($ExitCode -ne 0) {
    Write-Host "E2E Test Suite Finished with errors (Exit Code: $ExitCode)" -ForegroundColor Red
    exit $ExitCode
} else {
    Write-Host "E2E Test Suite Finished successfully!" -ForegroundColor Green
    exit 0
}
