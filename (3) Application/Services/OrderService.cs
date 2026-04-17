using System.Text;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using NexusDev_Dashboard;
using System.Threading.Tasks;
using NexusDev_Dashboard.Misc;
using System.Collections.Generic;

namespace NexusDev_Dashboard.Services
{
    public static class OrderService
    {
        public static async Task<List<Order>> GetOrders()
        {
            using HttpClient client = new();

            string body = JsonSerializer.Serialize(new { user_id = App.uid });
            StringContent content = new(body, Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync($"{App.url}/get_orders", content);
            string json = await response.Content.ReadAsStringAsync();

            OrdersResponse? result = JsonSerializer.Deserialize<OrdersResponse>(json);

            if (result == null || result.error) return [];

            return result.orders.Where(order => (App.freelancer && (App.uid == order.freelancer_uid || order.freelancer_uid == -1)) || App.owner_privileges).ToList();
        }
    }
}