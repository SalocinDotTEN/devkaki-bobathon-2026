<#
.SYNOPSIS
    Registers a Windows Task Scheduler task that runs the Newsjack news fetcher
    daily at 07:00 AM using Node.js.

.DESCRIPTION
    Run this script once (as Administrator) to register the task.
    The task will survive reboots and run even when no user is logged in.

.USAGE
    PowerShell -ExecutionPolicy Bypass -File scripts\register-task.ps1

#>

$taskName  = "NewsjackDailyFetch"
$repoRoot  = $PSScriptRoot | Split-Path -Parent
$nodeExe   = (Get-Command node -ErrorAction Stop).Source
$script    = Join-Path $repoRoot "packages\fetcher\src\run.js"
$logFile   = Join-Path $repoRoot "logs\newsjack-fetch.log"

# Create logs dir if it doesn't exist
New-Item -ItemType Directory -Force -Path (Split-Path $logFile) | Out-Null

$action = New-ScheduledTaskAction `
    -Execute $nodeExe `
    -Argument "`"$script`" >> `"$logFile`" 2>&1" `
    -WorkingDirectory $repoRoot

# Daily at 07:00 AM
$trigger = New-ScheduledTaskTrigger -Daily -At "07:00AM"

$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -StartWhenAvailable `
    -DontStopOnIdleEnd

# Register (or update if already exists)
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Set-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings
    Write-Host "✓ Task '$taskName' updated."
} else {
    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -RunLevel Highest `
        -Force
    Write-Host "✓ Task '$taskName' registered. Will run daily at 07:00 AM."
}

Write-Host "  Log output: $logFile"
Write-Host "  Run now:    Start-ScheduledTask -TaskName '$taskName'"
