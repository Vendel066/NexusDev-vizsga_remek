namespace NexusDev_Dashboard.Misc
{
    public class ProfileResponse
    {
        public bool error { get; set; }
        public ProfileData profile { get; set; }
        public string message { get; set; }
        public string debugMessage { get; set; }
    }
}
