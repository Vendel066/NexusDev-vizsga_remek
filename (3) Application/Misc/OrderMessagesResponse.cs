using System.Collections.Generic;

namespace NexusDev_Dashboard.Misc
{
    public class OrderMessagesResponse
    {
        public bool error { get; set; }
        public string? debugMessage { get; set; }
        public string? message { get; set; }
        public List<OrderMessage> messages { get; set; } = new();
    }
}
