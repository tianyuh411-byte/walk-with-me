using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

internal sealed class WalkWithMe : Form {
    private readonly WebView2 view = new WebView2();
    private bool ready;
    public WalkWithMe() {
        Text = "Walk With Me";
        ClientSize = new Size(1320, 900);
        MinimumSize = new Size(800, 650);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(17, 27, 32);
        AutoScaleMode = AutoScaleMode.Dpi;
        try { Icon = new Icon(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "game", "assets", "icon.ico")); } catch { }
        view.Dock = DockStyle.Fill;
        view.DefaultBackgroundColor = BackColor;
        Controls.Add(view);
        Shown += async (sender, args) => {
            try {
                string gameRoot = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "game");
                if (!File.Exists(Path.Combine(gameRoot, "index.html"))) throw new FileNotFoundException("The game folder is missing. Please extract the whole ZIP before launching.");
                string profile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "WalkWithMe", "WebView2");
                var environment = await CoreWebView2Environment.CreateAsync(null, profile);
                await view.EnsureCoreWebView2Async(environment);
                view.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
                view.CoreWebView2.Settings.IsStatusBarEnabled = false;
                view.CoreWebView2.Settings.AreDevToolsEnabled = false;
                view.CoreWebView2.Settings.IsZoomControlEnabled = false;
                view.CoreWebView2.SetVirtualHostNameToFolderMapping("walkwithme.local", gameRoot, CoreWebView2HostResourceAccessKind.DenyCors);
                view.CoreWebView2.NewWindowRequested += (s, e) => { e.Handled = true; };
                view.CoreWebView2.NavigationStarting += (s, e) => { if (!e.Uri.StartsWith("https://walkwithme.local/", StringComparison.OrdinalIgnoreCase)) e.Cancel = true; };
                view.CoreWebView2.Navigate("https://walkwithme.local/index.html");
                ready = true;
                view.Focus();
            } catch (WebView2RuntimeNotFoundException) {
                MessageBox.Show("Walk With Me needs the Microsoft Edge WebView2 Runtime, usually included with Windows 10/11.\n\nInstall the Evergreen Runtime from https://developer.microsoft.com/microsoft-edge/webview2/ then launch again.\n\nThe browser edition in game/index.html is also playable offline in a modern browser.", "WebView2 Runtime required", MessageBoxButtons.OK, MessageBoxIcon.Information);
                Close();
            } catch (Exception error) {
                MessageBox.Show("Unable to start Walk With Me.\n\n" + error.Message, "Walk With Me", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Close();
            }
        };
        Deactivate += (sender, args) => {
            PauseGame();
        };
        Resize += (sender, args) => {
            // A window minimized before it acquired focus need not raise Deactivate.
            if (WindowState == FormWindowState.Minimized) PauseGame();
        };
        FormClosed += (sender, args) => { ready = false; view.Dispose(); };
    }
    private void PauseGame() {
        if (ready && view.CoreWebView2 != null) view.CoreWebView2.ExecuteScriptAsync("window.dispatchEvent(new Event('blur'));");
    }
    [STAThread]
    private static void Main() {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new WalkWithMe());
    }
}
