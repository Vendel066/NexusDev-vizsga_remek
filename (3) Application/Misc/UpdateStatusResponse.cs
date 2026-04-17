using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NexusDev_Dashboard.Misc
{
    public class UpdateStatusResponse
    {
        public bool error { get; set; }
        public string? debugMessage { get; set; }
        public string? message { get; set; }

        public int oid { get; set; }
        public int status { get; set; }
    }
}
