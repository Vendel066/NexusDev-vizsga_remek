using NexusDev_Dashboard;
using System.Threading.Tasks;

namespace NexusDev_Dashboard.ViewModels
{
    public class OrderViewModel
    {
        public Order order { get; }

        public int Oid { get; }
        public string Title { get; }
        public string Status { get; }
        public string Freelancer { get; private set; }



        public OrderViewModel(Order order)
        {
            this.order = order;

            Oid = order.oid;

            Title = order.title.Length > 30
                ? order.title.Substring(0, 30) + "..."
                : order.title;

            Status = order.status switch
            {
                1 => "Pending",
                2 => "In Progress",
                3 => "Completed",
                _ => "Canceled"
            };

            Freelancer = "Loading...";

            _ = LoadFreelancer(order.freelancer_uid);
        }


        private async Task LoadFreelancer(int uid)
        {
            if (uid == -1)
            {
                Freelancer = "Nobody";
                return;
            }

            ProfileData? profile = await App.FetchUserProfile(uid);
            Freelancer = profile?.lname ?? "Failed";
        }

        public override string ToString()
        {
            return $"{Title} (ID: {Oid.ToString().PadLeft(11, '0')}) (Status: {Status}) (Freelancer: {Freelancer})";
        }
    }
}