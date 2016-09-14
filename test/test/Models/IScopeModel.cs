using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace test.Models
{
    public class IScopeModel
    {
        public List<EntityQueries> EntityStructureStream(string start_date, string end_date, string entity_name, long entity_id, string[] entity_queries, string script_name, out string err_message)
        {
            err_message = "";
            if (script_name == null || script_name == "")
            {
                return null;
            }
            StreamReader sr = new StreamReader(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~/ScopeScripts"), script_name));
            string s = sr.ReadToEnd();
            string query = string.Format(s, start_date, end_date, entity_id);

            var compiler = new Microsoft.Cosmos.Client.ScopeCompiler();
            compiler.Target = Microsoft.Cosmos.Client.CompilerTarget.Interactive;
            string name = System.Web.Configuration.WebConfigurationManager.AppSettings["UserName"];
            string psw = System.Web.Configuration.WebConfigurationManager.AppSettings["Password"];
            string domain = System.Web.Configuration.WebConfigurationManager.AppSettings["Domain"];
            compiler.Settings.Vc = new Microsoft.Cosmos.Client.CompilerSettings.VcSettings()
            {
                Credential = new System.Net.NetworkCredential(name, psw, domain)
            };

            compiler.Settings.Vc.Path = System.Web.Configuration.WebConfigurationManager.AppSettings["VCPath"];
            compiler.Settings.Execution = new Microsoft.Cosmos.Client.CompilerSettings.ExecutionSettings();
            compiler.Settings.Execution.RuntimeVersion = "iscope_beta";

            var script = new Microsoft.Cosmos.Client.ScopeScript();
            script.Contents = query;
            script.Name = "Demo iScope";

            List<EntityQueries> results = new List<EntityQueries>();
            try
            {
                var job = compiler.Execute(script);
                var reader = job.Result.Console;
                var schema = reader.GetSchemaTable();
                var column_names = new string[schema.Rows.Count];
                object[] values = new object[reader.FieldCount];
                while (reader.Read())
                {
                    int num_fields = reader.GetValues(values);
                    EntityQueries result = new EntityQueries(values, entity_queries);

                    results.Add(result);
                }
                if (results == null)
                {
                }
                return results;
            }
            catch (AggregateException aggEx)
            {
                string mes = "";
                aggEx.Flatten().Handle(
                    (e) =>
                    {
                        var buffer = new StringBuilder();
                        var c = e as Microsoft.Cosmos.Client.CompilationException;
                        if (c != null)
                        {
                            buffer.AppendFormat("JobId: {0};", c.Results.JobId);
                            buffer.AppendFormat("Response server: {0};", c.Results.ServerMachine);
                            buffer.AppendFormat("Runtime: {0};", c.Results.RuntimeVersion);
                            mes = c.Message;
                        }
                        buffer.AppendLine(e.ToString());
                        return true;
                    }
                );
                err_message = mes;
                return null;
            }
        }
    }
}