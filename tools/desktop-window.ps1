param([Parameter(Mandatory=$true)][int]$GameProcessId, [ValidateSet('restore','minimize','resize','close','inspect')][string]$Action)
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public class WWMWindow {
    public delegate bool Callback(IntPtr window, IntPtr param);
    [DllImport("user32.dll")] public static extern bool EnumWindows(Callback callback, IntPtr param);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr window, out uint process);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr window, StringBuilder title, int count);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr window, int mode);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr window);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr window);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr window);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr window, int x, int y, int width, int height, bool redraw);
    [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr window, uint message, IntPtr wp, IntPtr lp);
    public static IntPtr Find(int processId) {
        IntPtr result = IntPtr.Zero;
        EnumWindows((window, param) => { uint owner; GetWindowThreadProcessId(window, out owner); var title = new StringBuilder(256); GetWindowText(window,title,256); if (owner == processId && title.ToString() == "Walk With Me") { result = window; return false; } return true; }, IntPtr.Zero);
        return result;
    }
}
'@
$gameProcess = Get-Process -Id $GameProcessId
if ($gameProcess.ProcessName -ne 'Walk With Me') { throw 'Refusing to operate a process other than Walk With Me.' }
$window = [WWMWindow]::Find($GameProcessId)
if ($window -eq [IntPtr]::Zero) { throw 'Game window not found.' }
switch ($Action) {
    'restore' { [WWMWindow]::ShowWindow($window,9) | Out-Null; [WWMWindow]::SetForegroundWindow($window) | Out-Null }
    'minimize' { [WWMWindow]::ShowWindow($window,6) | Out-Null }
    'resize' { [WWMWindow]::MoveWindow($window,120,90,1000,780,$true) | Out-Null }
    'close' { [WWMWindow]::PostMessage($window,0x10,[IntPtr]::Zero,[IntPtr]::Zero) | Out-Null }
    'inspect' { @{visible=[WWMWindow]::IsWindowVisible($window);minimized=[WWMWindow]::IsIconic($window);foreground=([WWMWindow]::GetForegroundWindow() -eq $window)} | ConvertTo-Json }
}
Write-Output "Native game window action: $Action"
