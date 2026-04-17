using System.Collections.Generic;

namespace NexusDev_Dashboard.Misc
{
    public class OrderResponse
    {
        public bool error { get; set; }
        public int count { get; set; }
        public List<Order> orders { get; set; } = new();
    }
}
