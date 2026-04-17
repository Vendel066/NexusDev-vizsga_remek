using System;
using System.Collections.Generic;

namespace NexusDev_Dashboard.Misc
{
    public class OrdersResponse
    {
        public bool error { get; set; }
        public List<Order> orders { get; set; } = new();
    }
}
