using System;
using System.IO;

namespace NexusDev_Dashboard
{
    public static class Debug
    {
        private static readonly string dirName = "./Logs";



        private static void Debugger(int type, string message)
        {
            string timestamp = DateTime.Now.ToString("HH:mm:ss");
            string typeString = type == 1 ? "LOG" : type == 2 ? "WARNING" : "ERROR";
            string date = DateTime.Now.ToString("dd-MM-yyyy");

            string log = $"[{timestamp}] [{typeString}] - {message}";
            string fileName = $"{date}.log";
            string path = Path.Combine(dirName, fileName);


            if (!Directory.Exists(dirName))
            {
                Directory.CreateDirectory(dirName);
            }

            using StreamWriter writer = new(path, true);
            writer.WriteLine(log);
            writer.Close();
        }


        public static void Log(string message) => Debugger(1, message);
        public static void Warning(string message) => Debugger(2, message);
        public static void Error(string message) => Debugger(3, message);
    }
}
