using System;

namespace NexusDev_Dashboard
{
    public class Order(int oid , int uid, int freelancer_uid, string title, string description, int type, string other_type, int platform, decimal budget, string document_url, DateTime deadline, string project_version, string project_url, DateTime created_at, int status)
    {
        // Keys //
        public int oid { get; set; } = oid; // Primary Key //
        public int uid { get; set; } = uid; // Foreign Key to users table //
        public int freelancer_uid { get; set; } = freelancer_uid;

        // Order details //
        public string title { get; set; } = title;
        public string description { get; set; } = description;
        public int type { get; set; } = type;
        public string other_type { get; set; } = other_type;
        public int platform { get; set; } = platform;
        public decimal budget { get; set; } = budget;
        public string document_url { get; set; } = document_url;
        public DateTime deadline { get; set; } = deadline;
        public string project_version { get; set; } = project_version;
        public string project_url { get; set; } = project_url;

        // Status //
        public DateTime created_at { get; set; } = created_at;
        public int status { get; set; } = status;
    }
}