namespace NexusDev_Dashboard.Misc
{
    public class LoginResponse
    {
        public bool error { get; set; }
        public int uid { get; set; }
        public int freelancer { get; set; }
        public int owner_privileges { get; set; }
        public string? message { get; set; }
        public string? debugMessage { get; set; }
    }
}
