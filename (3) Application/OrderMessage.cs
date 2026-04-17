using System;

namespace NexusDev_Dashboard
{
    public class OrderMessage
    {
        public int mid { get; set; }
        public int oid { get; set; }
        public int uid { get; set; }
        public string message { get; set; } = string.Empty;
        public DateTime created_at { get; set; }
    }
}
