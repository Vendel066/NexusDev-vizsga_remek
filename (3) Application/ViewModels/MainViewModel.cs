using System.ComponentModel;
using System.Threading.Tasks;
using NexusDev_Dashboard.Services;
using System.Collections.ObjectModel;
using System.Runtime.CompilerServices;

namespace NexusDev_Dashboard.ViewModels
{
    public class MainViewModel : INotifyPropertyChanged
    {
        public ObservableCollection<OrderViewModel> Orders { get; set; } = [];
        private bool isLoading;



        public async Task LoadOrders()
        {
            if (isLoading) return;
            isLoading = true;

            try
            {
                var orders = await OrderService.GetOrders();

                Orders.Clear();

                foreach (var order in orders)
                {
                    Orders.Add(new OrderViewModel(order));
                }
            }
            finally
            {
                isLoading = false;
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string? name = null) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}