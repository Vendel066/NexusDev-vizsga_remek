using System;
using System.Linq;
using System.Windows;
using System.ComponentModel;
using System.Windows.Controls;
using System.Windows.Threading;
using NexusDev_Dashboard.ViewModels;

namespace NexusDev_Dashboard.Windows
{
    public partial class Main : Window
    {
        private readonly DispatcherTimer timer;
        private readonly MainViewModel vm = new();



        public Main()
        {
            InitializeComponent();
            DataContext = vm;

            timer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(0.1)
            };

            timer.Tick += async (s, e) => await vm.LoadOrders();
            timer.Start();
        }


        private void HideWindowItem_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                Debug.Log("Hiding window...");

                this.Hide();

                Debug.Log("Window is hidden.");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error while hiding this window!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"Error while hiding the main window: {ex.Message}!");
            }
        }

        private void CloseApplicationItem_Click(object sender, RoutedEventArgs e)
        {
            App.Closing();
        }

        private void LogoutItem_Click(object sender, RoutedEventArgs e)
        {
            App.SignOut();
        }

        private void ContactItem_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Team Members:\n-Zsolt Simó\n-Miklós Farkas\n-Vendel Medgyes\n\nApplication Developed By: Zsolt Simó\n\nCopyright 2026 Nexusdev All Rights Reserved!", "Contact", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void OrderList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (OrderList.SelectedItem is OrderViewModel selected)
            {
                OrderViewModel order = vm.Orders.First(o => o.Oid == selected.Oid);
                OrderWindow window = new(order.order);

                window.Show();
            }
        }

        private void WhenClosing(object? sender, CancelEventArgs e)
        {
            try
            {
                Debug.Log("Hiding window...");

                e.Cancel = true;
                this.Hide();

                Debug.Log("Window is hidden.");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error while hiding this window!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Debug.Error($"Error while hiding the main window: {ex.Message}!");
            }
        }
    }
}