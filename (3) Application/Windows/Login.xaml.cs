using System;
using System.Text;
using System.Windows;
using System.Net.Http;
using System.Text.Json;
using System.Windows.Forms;
using System.ComponentModel;
using System.Threading.Tasks;
using NexusDev_Dashboard.Misc;
using MessageBox = System.Windows.MessageBox;

namespace NexusDev_Dashboard.Windows
{
    public partial class Login : Window
    {
        public Login()
        {
            InitializeComponent();
        }


        private void LoginButton_Click(object sender, RoutedEventArgs e)
        {
            _ = TryLogin();
        }

        private void WhenClosing(object? sender, CancelEventArgs e)
        {
            e.Cancel = true;
            this.Hide();
        }


        public async Task TryLogin()
        {
            try
            {
                Debug.Log("Logging in...");

                using HttpClient client = new();

                var loginData = new { email_address = EmailTextBox.Text.Trim(), password = PasswordBox.Password };

                string json = JsonSerializer.Serialize(loginData);
                StringContent content = new(json, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PostAsync($"{App.url}/login", content);
                string responseBody = await response.Content.ReadAsStringAsync();

                LoginResponse? result = JsonSerializer.Deserialize<LoginResponse>(responseBody);

                if (result == null)
                {
                    MessageBox.Show("Invalid server response!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    Debug.Error("Login failed due to invalid server response!");
                    return;
                }

                if (response.IsSuccessStatusCode && !result.error)
                {
                    Debug.Log("Login successful.");

                    if (result.freelancer == 0 && result.owner_privileges == 0)
                    {
                        MessageBox.Show("You do not have sufficient privileges to access the NexusDev Dashboard!", "Access Denied", MessageBoxButton.OK, MessageBoxImage.Warning);
                        Debug.Warning("Login failed due to insufficient privileges!");
                        return;
                    }

                    ProfileData? profileData = await App.FetchUserProfile(result.uid);

                    if (profileData == null)
                    {
                        MessageBox.Show("Failed to fetch user profile!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                        Debug.Error("Failed to fetch user profile after successful login!");
                        return;
                    }

                    App.uid = result.uid;
                    App.freelancer = result.freelancer == 1;
                    App.owner_privileges = result.owner_privileges == 1;
                    App.profileData = profileData;

                    App.ShowBalloonMessage($"Welcome back, {App.profileData.lname}", "You have successfully logged in to the NexusDev Dashboard.", ToolTipIcon.Info);

                    EmailTextBox.Text = string.Empty;
                    PasswordBox.Password = string.Empty;

                    App.loginWindow!.Hide();
                    App.mainWindow!.Show();
                }
                else
                {
                    MessageBox.Show(result.message ?? "Login failed!", "Login Failed", MessageBoxButton.OK, MessageBoxImage.Error);
                    Debug.Warning($"Login failed: {result.debugMessage}");
                }
            }
            catch (HttpRequestException ex)
            {
                MessageBox.Show("Cannot connect to server!", "Network Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"Network error: {ex.Message}");
            }
            catch (Exception ex)
            {
                MessageBox.Show("An unexpected error occurred!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"Unexpected error: {ex.Message}");
            }
        }
    }
}