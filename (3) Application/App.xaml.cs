using System;
using System.Text;
using System.Drawing;
using System.Windows;
using System.Net.Http;
using System.Text.Json;
using System.Windows.Forms;
using System.Threading.Tasks;
using NexusDev_Dashboard.Misc;
using System.Collections.Generic;
using NexusDev_Dashboard.Windows;
using MessageBox = System.Windows.MessageBox;
using Application = System.Windows.Application;

namespace NexusDev_Dashboard
{
    public partial class App : Application
    {
        public static NotifyIcon? notifyIcon;

        public static Login? loginWindow;
        public static Main? mainWindow;

        public static string url = "http://127.0.0.1:3000/api";

        public static int uid = -1;
        public static bool freelancer = false;
        public static bool owner_privileges = false;
        public static ProfileData? profileData { get; set; }

        public static List<Order> orders = [];
        public static List<ProfileData> profileDatas = [];



        protected override void OnStartup(StartupEventArgs e)
        {
            Debug.Log("Starting application...");

            try
            {
                Debug.Log("Loading resources...");

                base.OnStartup(e);

                Debug.Log("Resources loaded.");
            }
            catch (Exception ex)
            {
                Debug.Error($"Error while loading resources: {ex.Message}!");

                Current.Shutdown();
            }

            try
            {
                Debug.Log("Loading windows...");

                loginWindow = new();
                mainWindow = new();

                Debug.Log("Windows loaded.");
            }
            catch (Exception ex)
            {
                Debug.Error($"Error while loading windows: {ex.Message}!");

                Current.Shutdown();
            }

            try
            {
                Debug.Log("Loading system tray icon...");

                notifyIcon = new NotifyIcon
                {
                    Text = "NexusDev - Dashboard",
                    Icon = new Icon("./Resources/logo.ico"),
                    Visible = true
                };

                ContextMenuStrip contextMenu = new();
                contextMenu.Items.Add("Open", null, (s, e) => Open());
                contextMenu.Items.Add("Sign Out", null, (s, e) => SignOut());
                contextMenu.Items.Add("Exit", null, (s, e) => Closing());
                notifyIcon.ContextMenuStrip = contextMenu;

                Debug.Log("System tray icon loaded.");
            }
            catch (Exception ex)
            {
                Debug.Error($"Error while loading system tray icon: {ex.Message}!");

                Current.Shutdown();
            }

            loginWindow!.Show();

            Debug.Log("Application started!");
        }


        public static void Open()
        {
            try
            {
                Debug.Log("Opening current window...");

                if (uid != -1)
                {
                    mainWindow!.Show();
                    mainWindow.WindowState = WindowState.Normal;
                    mainWindow.Activate();
                }
                else
                {
                    loginWindow!.Show();
                    loginWindow.WindowState = WindowState.Normal;
                    loginWindow.Activate();
                }

                Debug.Log("Current window loaded.");
            }
            catch (Exception ex)
            {
                MessageBox.Show("An error occurred while trying to open the application!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"An error occurred while trying to open the application: {ex.Message}!");
            }
        }

        public static void SignOut()
        {
            try
            {
                Debug.Log("Signing out...");

                uid = -1;

                orders.Clear();

                mainWindow!.Hide();
                loginWindow!.Show();

                Debug.Log("Signed out.");
            }
            catch (Exception ex)
            {
                MessageBox.Show("An error occurred while trying to sign out!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"An error occurred while trying to sign out: {ex.Message}!");
            }
        }

        public static void Closing()
        {
            try
            {
                Debug.Log("Closing application...");

                Current.Shutdown();

                Debug.Log("Application closed.");
            }
            catch (Exception e)
            {
                MessageBox.Show("Error while closing application!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"Error while closing application: {e.Message}!");
            }
        }


        public static void ShowBalloonMessage(string title, string message, ToolTipIcon icon)
        {
            try
            {
                Debug.Log("Sending notification...");

                notifyIcon!.ShowBalloonTip(3000, title, message, icon);

                Debug.Log("Notification sent.");
            }
            catch (Exception e)
            {
                MessageBox.Show("An error occurred while trying to send a notification!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"Error while sending notification: {e.Message}!");
            }
        }

        public static async Task<ProfileData?> FetchUserProfile(int uid)
        {
            using HttpClient client = new();

            var data = new { uid };
            string json = JsonSerializer.Serialize(data);
            StringContent content = new(json, Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync($"{App.url}/get_profile", content);
            string responseBody = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<ProfileResponse>(responseBody);

            if (result == null || result.error)
            {
                Debug.Error($"Profile fetch failed: {result?.debugMessage}");
                return null;
            }

            Debug.Log("Profile successfully fetched.");
            return result.profile;
        }
    }
}