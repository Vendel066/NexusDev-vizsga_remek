using System;
using System.IO;
using System.Text;
using System.Windows;
using Microsoft.Win32;
using System.Net.Http;
using System.Text.Json;
using System.Windows.Media;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Net.Http.Headers;
using NexusDev_Dashboard.Misc;
using System.Windows.Threading;
using System.Collections.Generic;
using NexusDev_Dashboard.ViewModels;
using Mysqlx.Crud;

namespace NexusDev_Dashboard.Windows
{
    public partial class OrderWindow : Window
    {
        private readonly OrderWindowViewModel vm;

        private readonly DispatcherTimer timer;
        private readonly List<OrderMessage> messages = [];



        public OrderWindow(Order order)
        {
            InitializeComponent();

            vm = new OrderWindowViewModel(order);
            DataContext = vm;

            timer = new()
            {
                Interval = TimeSpan.FromSeconds(0.1)
            };
            timer.Tick += Timer_Tick;
            timer.Start();
        }


        private async void Timer_Tick(object? sender, EventArgs e)
        {
            await GetMessages();
            UpdateMessages();
            UpdateUI();
        }


        private async void InProgressItem_Click(object sender, RoutedEventArgs e)
        {
            await UpdateStatus(2);
        }

        private async void CompletedItem_Click(object sender, RoutedEventArgs e)
        {
            await UpdateStatus(3);
        }

        private async void CanceledItem_Click(object sender, RoutedEventArgs e)
        {
            await UpdateStatus(4);
        }


        private async void DownloadDocButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                Debug.Log("Downloading document...");

                using HttpClient client = new HttpClient();

                var requestData = new
                {
                    App.uid,
                    vm.order.document_url
                };

                string json = JsonSerializer.Serialize(requestData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PostAsync($"{App.url}/download_document", content);

                if (!response.IsSuccessStatusCode)
                {
                    string errorJson = await response.Content.ReadAsStringAsync();

                    try
                    {
                        DownloadResponse errorObj = JsonSerializer.Deserialize<DownloadResponse>(errorJson) ?? new DownloadResponse();

                        Debug.Error(errorObj.debugMessage);
                        MessageBox.Show($"{errorObj.message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                    catch
                    {
                        MessageBox.Show($"Unexpected error: {errorJson}");
                    }

                    return;
                }

                string? contentType = response.Content.Headers.ContentType?.MediaType;

                if (contentType == "application/json")
                {
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    DownloadResponse result = JsonSerializer.Deserialize<DownloadResponse>(jsonResponse) ?? new DownloadResponse();

                    if (result.error == true)
                    {
                        Debug.Error(result.debugMessage);
                        MessageBox.Show($"{result.message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                        return;
                    }
                }
                else
                {
                    byte[] fileBytes = await response.Content.ReadAsByteArrayAsync();

                    SaveFileDialog saveDialog = new()
                    {
                        FileName = requestData.document_url,
                        Filter = "All files (*.*)|*.*"
                    };

                    if (saveDialog.ShowDialog() == true)
                    {
                        await File.WriteAllBytesAsync(saveDialog.FileName, fileBytes);
                        MessageBox.Show("File downloaded successfully!");
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Exception: {ex.Message}");
            }
        }

        private async void UploadVersionButton_Click(object sender, RoutedEventArgs e)
        {
            Debug.Log("Uploading project...");

            if (string.IsNullOrWhiteSpace(VersionInput.Text))
            {
                Debug.Warning("Upload canceled, version number cannot be empty!");
                MessageBox.Show("Please enter a version number first.", "Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            OpenFileDialog dialog = new()
            {
                Title = "Select file to upload",
                Filter = "Archive files (*.zip;*.rar;*.7z)|*.zip;*.rar;*.7z"
            };

            if (dialog.ShowDialog() != true) return;

            string selectedFile = dialog.FileName;

            try
            {
                using HttpClient client = new();
                using MultipartFormDataContent form = new MultipartFormDataContent();

                using FileStream fileStream = new(selectedFile, FileMode.Open, FileAccess.Read);
                using StreamContent streamContent = new(fileStream);

                streamContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

                form.Add(new StringContent(vm.order.oid.ToString()), "oid");
                form.Add(new StringContent(VersionInput.Text), "project_version");
                form.Add(streamContent, "file", Path.GetFileName(selectedFile));

                HttpResponseMessage response = await client.PostAsync($"{App.url}/upload_project", form);
                string jsonResponse = await response.Content.ReadAsStringAsync();
                UploadResponse? result = null;

                try
                {
                    result = JsonSerializer.Deserialize<UploadResponse>(jsonResponse, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new UploadResponse();
                }
                catch
                {
                    Debug.Error($"Unexpected error! Response: {jsonResponse}");
                    MessageBox.Show("Unexpected error!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                if (result == null)
                {
                    Debug.Error("Empty server response!");
                    MessageBox.Show("Empty server response!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                if (result.error)
                {
                    Debug.Error(result.debugMessage);
                    MessageBox.Show(result.message, "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                Debug.Error(ex.Message);
                MessageBox.Show("Unexpected error!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void SendButton_Click(object sender, RoutedEventArgs e)
        {
            Debug.Log("Sending message...");

            string message = ChatInput.Text;

            if (message.Length >= 1024)
            {
                Debug.Warning("Message is too long! Maximum length is 1024 characters.");
                MessageBox.Show("Message is too long! Maximum length is 1024 characters.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            if (string.IsNullOrWhiteSpace(message))
            {
                Debug.Warning("Message cannot be empty!");
                MessageBox.Show("Message cannot be empty!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            await SendMessage(message);
        }


        public void UpdateUI()
        {
            try
            {
                Debug.Log("Updating UI...");

                Title = $"{vm.order.title} (ID: {vm.order.oid}) (Status: {(vm.order.status == 1 ? "Pending" : vm.order.status == 2 ? "In Progress" : vm.order.status == 3 ? "Completed" : "Canceled")})";

                OrderTitle.Text = vm.order.title;
                OrderDescription.Text = vm.order.description;
                
                if (vm.order.type == 1)
                {
                    OrderType.Text = "Website";
                    OrderPlatform.Text = string.Empty;
                }
                else if (vm.order.type == 2)
                {
                    OrderType.Text = "Desktop Application";
                    
                    switch (vm.order.platform)
                    {
                        case 1:
                            OrderPlatform.Text = "Windows";
                            break;
                        case 2:
                            OrderPlatform.Text = "Linux";
                            break;
                        case 3:
                            OrderPlatform.Text = "MacOS";
                            break;
                    }
                }
                else if (vm.order.type == 3)
                {
                    OrderType.Text = "Mobile Application";

                    switch (vm.order.platform)
                    {
                        case 4:
                            OrderPlatform.Text = "Android";
                            break;
                        case 5:
                            OrderPlatform.Text = "IOS";
                            break;
                    }
                }
                else if (vm.order.type == 4)
                {
                    OrderType.Text = vm.order.other_type;

                    switch (vm.order.platform)
                    {
                        case 1:
                            OrderPlatform.Text = "Windows";
                            break;
                        case 2:
                            OrderPlatform.Text = "Linux";
                            break;
                        case 3:
                            OrderPlatform.Text = "MacOS";
                            break;
                        case 4:
                            OrderPlatform.Text = "Android";
                            break;
                        case 5:
                            OrderPlatform.Text = "IOS";
                            break;
                    }
                }

                OrderBudget.Text = $"${vm.order.budget}";
                OrderDeadline.Text = vm.order.deadline.ToString("yyyy-MM-dd");
                OrderCreatedAt.Text = vm.order.created_at.ToString("yyyy-MM-dd");
                VersionInput.IsEnabled = vm.order.status == 2;
                UploadVersionButton.IsEnabled = vm.order.status == 2;
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error while updating UI!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"Error while updating UI: {ex.Message}!");
            }
        }

        public async Task UpdateStatus(int status)
        {
            try
            {
                Debug.Log("Updating status...");

                using HttpClient client = new();
                var requestData = new { order.oid, status, App.uid };
                string json = JsonSerializer.Serialize(requestData);
                StringContent content = new(json, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PostAsync($"{App.url}/update_order_status", content);
                string responseBody = await response.Content.ReadAsStringAsync();
                UpdateStatusResponse? result = JsonSerializer.Deserialize<UpdateStatusResponse>(responseBody);

                if (result == null)
                {
                    MessageBox.Show("Failed to update order status!", "Nexusdev Dashboard", MessageBoxButton.OK, MessageBoxImage.Error);
                    Debug.Error($"Failed to update order status: {result?.message}");

                    return;
                }

                if (result.error)
                {
                    MessageBox.Show(result.message ?? "Failed to update order status!", "Nexusdev Dashboard", MessageBoxButton.OK, MessageBoxImage.Error);
                    Debug.Error(result.debugMessage ?? "Failed to update order status!");

                    return;
                }

                order.freelancer_uid = App.uid;
                order.status = status;

                Debug.Log("Order status updated successfully.");
            }
            catch (HttpRequestException ex)
            {
                MessageBox.Show("Server connection error while updating order status!", "Nexusdev Dashboard", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"Server connection error while updating order status: {ex.Message}!");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error while updating order status!", "Nexusdev Dashboard", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"Error while updating order status: {ex.Message}!");
            }
        }

        public async Task GetMessages()
        {
            try
            {
                Debug.Log("Getting messages...");

                using HttpClient client = new();

                var requestData = new { App.uid, order.oid };

                string json = JsonSerializer.Serialize(requestData);
                StringContent content = new(json, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PostAsync($"{App.url}/get_order_messages", content);
                string responseBody = await response.Content.ReadAsStringAsync();
                OrderMessagesResponse? result = JsonSerializer.Deserialize<OrderMessagesResponse>(responseBody);

                if (result == null)
                {
                    MessageBox.Show("Error while getting messages!", "Nexusdev Dashboard", MessageBoxButton.OK, MessageBoxImage.Error);
                    Debug.Error("API returned error while getting messages!");
                    return;
                }

                if (result.error)
                {
                    MessageBox.Show(result.message ?? "Error while getting messages!", "Nexusdev Dashboard", MessageBoxButton.OK, MessageBoxImage.Error);
                    Debug.Error(result.debugMessage ?? "API returned error while getting messages!");
                }

                Debug.Log($"Loaded {result.messages.Count} messages.");
                Debug.Log("Refreshing cache with the new messages...");

                foreach (OrderMessage orderMessage in result.messages)
                {
                    if (!messages.Exists(m => m.mid == orderMessage.mid))
                    {
                        messages.Add(orderMessage);
                    }
                }

                foreach (OrderMessage orderMessage in messages)
                {
                    if (!result.messages.Exists(m => m.mid == orderMessage.mid))
                    {
                        messages.Remove(orderMessage);
                    }
                }

                Debug.Log("Cache refreshed with the new messages.");
            }
            catch (HttpRequestException ex)
            {
                MessageBox.Show("Server connection error while getting messages!", "Nexusdev Dashboard", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"Server connection error while getting messages: {ex.Message}!");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error while getting messages!", "Nexusdev Dashboard", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"Error while getting messages: {ex.Message}!");
            }
        }

        public void UpdateMessages()
        {
            {
                try
                {
                    ScrollViewer? scrollViewer = GetScrollViewer(ChatMessages);

                    double oldOffset = 0;
                    double oldScrollableHeight = 0;
                    bool wasAtBottom = true;

                    if (scrollViewer != null)
                    {
                        oldOffset = scrollViewer.VerticalOffset;
                        oldScrollableHeight = scrollViewer.ScrollableHeight;
                        wasAtBottom = oldOffset >= Math.Max(0, oldScrollableHeight - 1.0);
                    }

                    ChatMessages.Items.Clear();

                    foreach (OrderMessage msg in messages)
                    {
                        double availableWidth = ChatMessages.ActualWidth;
                        double maxBubbleWidth = availableWidth > 64 ? Math.Max(240, availableWidth - 32) : 480;

                        Border bubble = new()
                        {
                            CornerRadius = new CornerRadius(8),
                            Padding = new Thickness(8),
                            Margin = new Thickness(4),
                            MaxWidth = maxBubbleWidth,
                            Background = msg.uid == App.uid ? (Brush)new SolidColorBrush(Color.FromArgb(0xFF, 0x05, 0xF7, 0x19)) : Brushes.DimGray
                        };

                        TextBlock content = new()
                        {
                            Text = msg.message,
                            TextWrapping = TextWrapping.Wrap,
                            Foreground = msg.uid == App.uid ? Brushes.Black : Brushes.White
                        };

                        bubble.Child = content;

                        Grid container = new()
                        {
                            HorizontalAlignment = msg.uid == App.uid ? HorizontalAlignment.Right : HorizontalAlignment.Left
                        };

                        container.Children.Add(bubble);

                        ListBoxItem item = new()
                        {
                            Content = container,
                            Background = Brushes.Transparent,
                            BorderThickness = new Thickness(0)
                        };

                        ChatMessages.Items.Add(item);
                    }

                    if (scrollViewer != null)
                    {
                        Dispatcher.BeginInvoke(new Action(() =>
                        {
                            try
                            {
                                if (wasAtBottom && ChatMessages.Items.Count > 0)
                                {
                                    ChatMessages.ScrollIntoView(ChatMessages.Items[ChatMessages.Items.Count - 1]);
                                }
                                else
                                {
                                    double max = scrollViewer.ScrollableHeight;
                                    double target = Math.Max(0, Math.Min(oldOffset, max));
                                    scrollViewer.ScrollToVerticalOffset(target);
                                }
                            }
                            catch { }
                        }), DispatcherPriority.Background);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Error while updating messages!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    Debug.Error($"Error while updating messages: {ex.Message}!");
                }
            }
        }

        public async Task SendMessage(string message)
        {
            try
            {
                using HttpClient client = new();

                var payload = new { App.uid, message };

                string json = JsonSerializer.Serialize(payload);
                StringContent content = new(json, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PostAsync($"{App.url}/send_order_message", content);
                string responseBody = await response.Content.ReadAsStringAsync();
                MessageSendingResponse apiResponse = (JsonSerializer.Deserialize<MessageSendingResponse>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new()) ?? throw new Exception("Invalid server response!");
                
                if (!apiResponse.error)
                {
                    ChatInput.Text = string.Empty;
                    Debug.Log("Message sent successfully.");
                }
                else
                {
                    Debug.Error(apiResponse.debugMessage ?? "No debug message received!");
                    MessageBox.Show(apiResponse.message ?? "Unknown error!", "Nexusdev Dashboard", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                Debug.Error($"Unexpected error: {ex.Message}");
                MessageBox.Show("Unexpected error while sending message!", "Nexusdev Dashboard", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private static ScrollViewer? GetScrollViewer(DependencyObject dep)
        {
            if (dep == null) return null;

            if (dep is ScrollViewer) return (ScrollViewer)dep;

            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(dep); i++)
            {
                DependencyObject child = VisualTreeHelper.GetChild(dep, i);
                ScrollViewer? result = GetScrollViewer(child);
                if (result != null) return result;
            }

            return null;
        }
    }
}