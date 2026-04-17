using System.ComponentModel;

namespace NexusDev_Dashboard.ViewModels
{
    public class OrderWindowViewModel(Order order) : INotifyPropertyChanged
    {
        public Order order = order;



        public void Update(Order newOrder)
        {
            order = newOrder;
            OnPropertyChanged(string.Empty);
        }

        public event PropertyChangedEventHandler? PropertyChanged;

        protected void OnPropertyChanged(string? name = null) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
