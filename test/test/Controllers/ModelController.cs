using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web;
using System.Web.Mvc;
using test.Models;

namespace test.Controllers
{
    public class ModelController : Controller
    {
        private static string entities_Json;
        private static string entity_ids_Json;
        private static string charts_queries_Json;
        private static string fixed_queries_Json;
        private static string daily_queries_Json;
        private static string changing_queries_Json;
        private static string explain_queries_Json;
        private static string accompany_queries_Json;

        private static string[] entities;
        private static long[] entity_ids;
        private static string[] entity_mapping;
        private static Dictionary<string, Dictionary<string, string[]>> entity_total_mappings_caches;
        private static Dictionary<string, string> entity_querymapping_caches;
        private static Dictionary<string, Dictionary<string, List<EntityQueries>>> query_result_caches;

        // GET: Model
        public static string[] Entities
        {
            get
            {
                if (entities == null || entities.Length == 0)
                {
                    string[] reader = System.IO.File.ReadAllLines(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~/Files"), "Entities.txt"));
                    entities = new string[reader.Length];
                    entity_ids = new long[reader.Length];
                    int i = 0;
                    foreach (var str in reader)
                    {
                        entities[i] = str.Split('\t')[0];
                        entity_ids[i] = Convert.ToInt64(str.Split('\t')[1]);
                        ++i;
                    }
                }
                return entities;
            }
        }
        
        public static string[] EntityMapping
        {
            get
            {
                if (entity_mapping == null || entity_mapping.Length == 0)
                {
                    entity_mapping = System.IO.File.ReadAllLines(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~/Files"), "EntityMappings.txt"));
                }

                if (entity_querymapping_caches == null)
                {
                    entity_querymapping_caches = new Dictionary<string, string>();
                }

                if (entity_total_mappings_caches == null)
                {
                    entity_total_mappings_caches = new Dictionary<string, Dictionary<string, string[]>>();
                }
                if (query_result_caches == null)
                {
                    query_result_caches = new Dictionary<string, Dictionary<string, List<EntityQueries>>>();
                }
                return entity_mapping;
            }
        }
        
        public string GetChartsQueries()
        {
            if (charts_queries_Json == null || charts_queries_Json.Length == 0)
            {
                string[] charts_queries = System.IO.File.ReadAllLines(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~/Files"), "ChartsQueries.txt"));
                var serializer = new DataContractJsonSerializer(typeof(string[]));
                using (MemoryStream stream = new MemoryStream())
                {
                    serializer.WriteObject(stream, charts_queries);
                    charts_queries_Json = Encoding.UTF8.GetString(stream.ToArray());
                }
            }
            return charts_queries_Json;
        }

        public string GetFixedQueries()
        {
            if (fixed_queries_Json == null || fixed_queries_Json.Length == 0)
            {
                string[] fixed_queries = System.IO.File.ReadAllLines(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~/Files"), "FixedQueries.txt"));
                var serializer = new DataContractJsonSerializer(typeof(string[]));
                using (MemoryStream stream = new MemoryStream())
                {
                    serializer.WriteObject(stream, fixed_queries);
                    fixed_queries_Json = Encoding.UTF8.GetString(stream.ToArray());
                }
            }
            return fixed_queries_Json;
        }

        public string GetDailyQueries()
        {
            if (daily_queries_Json == null || daily_queries_Json.Length == 0)
            {
                string[] daily_queries = System.IO.File.ReadAllLines(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~/Files"), "DailyQueries.txt"));
                var serializer = new DataContractJsonSerializer(typeof(string[]));
                using (MemoryStream stream = new MemoryStream())
                {
                    serializer.WriteObject(stream, daily_queries);
                    daily_queries_Json = Encoding.UTF8.GetString(stream.ToArray());
                }
            }
            return daily_queries_Json;
        }

        public string GetChangingQueries()
        {
            if (changing_queries_Json == null || changing_queries_Json.Length == 0)
            {
                string[] changing_queries = System.IO.File.ReadAllLines(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~/Files"), "ChangingQueries.txt"));
                var serializer = new DataContractJsonSerializer(typeof(string[]));
                using (MemoryStream stream = new MemoryStream())
                {
                    serializer.WriteObject(stream, changing_queries);
                    changing_queries_Json = Encoding.UTF8.GetString(stream.ToArray());
                }
            }
            return changing_queries_Json;
        }

        public string GetExplainQueries()
        {
            if (explain_queries_Json == null || explain_queries_Json.Length == 0)
            {
                string[] read_file = System.IO.File.ReadAllLines(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~/Files"), "ExplainQueries.txt"));
                string[][] explain_queries = new string[2][];
                explain_queries[0] = new string[read_file.Length];
                explain_queries[1] = new string[read_file.Length];
                for (int i = 0; i < read_file.Length; ++i)
                {
                    explain_queries[0][i] = read_file[i].Split('\t')[0];
                    explain_queries[1][i] = read_file[i].Split('\t')[1];
                }
                var serializer = new DataContractJsonSerializer(typeof(string[][]));
                using (MemoryStream stream = new MemoryStream())
                {
                    serializer.WriteObject(stream, explain_queries);
                    explain_queries_Json = Encoding.UTF8.GetString(stream.ToArray());
                }
            }
            return explain_queries_Json;
        }
        
        public string GetAccompanyQueries()
        {
            if (accompany_queries_Json == null || accompany_queries_Json.Length == 0)
            {
                string[] read_file = System.IO.File.ReadAllLines(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~/Files"), "AccompanyQueries.txt"));
                string[][] accompany_queries = new string[2][];
                accompany_queries[0] = new string[read_file.Length];
                accompany_queries[1] = new string[read_file.Length];
                for (int i = 0; i < read_file.Length; ++i)
                {
                    accompany_queries[0][i] = read_file[i].Split('\t')[0];
                    accompany_queries[1][i] = read_file[i].Split('\t')[1];
                }
                var serializer = new DataContractJsonSerializer(typeof(string[][]));
                using (MemoryStream stream = new MemoryStream())
                {
                    serializer.WriteObject(stream, accompany_queries);
                    accompany_queries_Json = Encoding.UTF8.GetString(stream.ToArray());
                }
            }
            return accompany_queries_Json;
        }

        public string GetEntities()
        {
            if (entities_Json == null || entities_Json == "")
            {
                if (Entities.Length == 0)
                {
                    return "";
                }
                else
                {
                    var serializer = new DataContractJsonSerializer(typeof(string[]));
                    using (MemoryStream stream = new MemoryStream())
                    {
                        serializer.WriteObject(stream, entities);
                        entities_Json = Encoding.UTF8.GetString(stream.ToArray());
                    }
                }
            }
            return entities_Json;
        }

        public string GetEntityIds()
        {
            if (entity_ids_Json == null || entity_ids_Json == "")
            {
                if (Entities.Length == 0)
                {
                    return "";
                }
                else
                {
                    var serializer = new DataContractJsonSerializer(typeof(long[]));
                    using (MemoryStream stream = new MemoryStream())
                    {
                        serializer.WriteObject(stream, entity_ids);
                        entity_ids_Json = Encoding.UTF8.GetString(stream.ToArray());
                    }
                }
            }
            return entity_ids_Json;
        }

        public string GetEntityMappings (string entity_name = "")
        {
            Console.WriteLine("entity_mapping");
            if (EntityMapping.Length == 0 || string.IsNullOrEmpty(entity_name) || entity_name == "undefined")
            {
                return "";
            }
            string temp = "";
            if (entity_querymapping_caches.ContainsKey(entity_name))
            {
                temp = entity_querymapping_caches[entity_name];
            }
            else
            {
                foreach (var str in entity_mapping)
                {
                    string match_entity = str.Split('\t')[0];
                    if (match_entity == entity_name)
                    {
                        if (!entity_total_mappings_caches.ContainsKey(entity_name))
                        {
                            entity_total_mappings_caches.Add(entity_name, new Dictionary<string, string[]>());
                        }
                        entity_total_mappings_caches[entity_name].Add(str.Split('\t')[1], str.Split('\t')[2].Split('$').ToArray());

                        temp += str.Split('\t')[2].Substring(str.Split('\t')[2].IndexOf('$') + 1);
                    }
                }
                if (string.IsNullOrEmpty(temp))
                {
                    return "";
                }
                else
                {
                    entity_querymapping_caches.Add(entity_name, temp);
                }
            }
            List<string> queries = new List<string>();
            queries = temp.Split('$').ToList();
            queries.Remove(queries.Last());
            var serializer = new DataContractJsonSerializer(typeof(List<string>));
            string szJson = "";
            using (MemoryStream stream = new MemoryStream())
            {
                serializer.WriteObject(stream, queries);
                szJson = Encoding.UTF8.GetString(stream.ToArray());
            }
            return szJson;
        }
        
        public List<string> GetQueryFileName(List<string> queries, string entity_name)
        {
            if (queries == null)
            {
                return null;
            }
            List<string> file_names = new List<string>();
            foreach (string query in queries)
            {
                foreach (var ele in entity_total_mappings_caches[entity_name])
                {
                    if (ele.Value.Contains(query))
                    {
                        if (!file_names.Contains(ele.Key))
                        {
                            file_names.Add(ele.Key);
                        }
                        break;
                    }
                }
            }
            return file_names;
        }

        public string GetQueryResult(string start_date, string end_date, string entity_name, string entity_id, string query)
        {

            Dictionary<string, List<EntityQueries>> result = new Dictionary<string, List<EntityQueries>>();
            
            List<string> queries = new List<string>();
            queries = query.Split(',').ToList();
            List<string> file_names = GetQueryFileName(queries, entity_name);

            string file_name = String.Join("", file_names);
            string cache_key = start_date + end_date + entity_name + entity_id + file_name;

            if (query_result_caches.ContainsKey(cache_key))
            {
                result = query_result_caches[cache_key];
            }
            else
            {
                IScopeModel scopemodel = new IScopeModel();
                List<EntityQueries> cur_result = new List<EntityQueries>();
                foreach (string file in file_names)
                {
                    var metrics = entity_total_mappings_caches[entity_name][file];
                    string err_message = "";
                    cur_result = scopemodel.EntityStructureStream((Convert.ToDateTime(start_date)).ToString("yyyy-MM-dd"), (Convert.ToDateTime(end_date)).ToString("yyyy-MM-dd"), entity_name, Convert.ToInt64(entity_id), metrics, entity_name + file + ".script", out err_message);
                    if (err_message != "")
                    {
                        if (err_message.Split(' ')[0] == "Directory")
                        {
                            int s_index = err_message.LastIndexOf('/', err_message.LastIndexOf('/') - 1);
                            int e_index = err_message.LastIndexOf('/');
                            string str = "date error " + err_message.Substring(s_index + 1, e_index - s_index - 1);
                            var tmp = new DataContractJsonSerializer(typeof(string));
                            string err = "";
                            using (MemoryStream stream = new MemoryStream())
                            {
                                tmp.WriteObject(stream, str);
                                err = Encoding.UTF8.GetString(stream.ToArray());
                            }
                            return err;
                        }
                        else
                        {
                            var tmp = new DataContractJsonSerializer(typeof(string));
                            string err = "";
                            using (MemoryStream stream = new MemoryStream())
                            {
                                tmp.WriteObject(stream, "job error");
                                err = Encoding.UTF8.GetString(stream.ToArray());
                            }
                            return err;
                        }
                    }
                    if (cur_result != null)
                    {
                        cur_result = cur_result.OrderBy(a => a.entity_query_result[metrics[0]]).ToList();
                        result.Add(file, cur_result);
                    }
                }

                //foreach (var ele in entity_total_mappings_caches[entity_name])
                //{
                //    string err_message = "";
                //    cur_result = scopemodel.EntityStructureStream((Convert.ToDateTime(start_date)).ToString("yyyy-MM-dd"), (Convert.ToDateTime(end_date)).ToString("yyyy-MM-dd"), entity_name, Convert.ToInt64(entity_id), ele.Value, entity_name + ele.Key + ".script", out err_message);
                //    if (err_message != "")
                //    {
                //        if (err_message.Split(' ')[0] == "Directory")
                //        {
                //            int s_index = err_message.LastIndexOf('/', err_message.LastIndexOf('/') - 1);
                //            int e_index = err_message.LastIndexOf('/');
                //            string str = "date error " + err_message.Substring(s_index + 1, e_index - s_index - 1);
                //            var tmp = new DataContractJsonSerializer(typeof(string));
                //            string err = "";
                //            using (MemoryStream stream = new MemoryStream())
                //            {
                //                tmp.WriteObject(stream, str);
                //                err = Encoding.UTF8.GetString(stream.ToArray());
                //            }
                //            return err;
                //        }
                //        else
                //        {
                //            var tmp = new DataContractJsonSerializer(typeof(string));
                //            string err = "";
                //            using (MemoryStream stream = new MemoryStream())
                //            {
                //                tmp.WriteObject(stream, "job error");
                //                err = Encoding.UTF8.GetString(stream.ToArray());
                //            }
                //            return err;
                //        }
                //    }
                //    if (cur_result != null)
                //    {
                //        cur_result = cur_result.OrderBy(a => a.entity_query_result[ele.Value[0]]).ToList();
                //        result.Add(ele.Key, cur_result);
                //    }
                //    else
                //    {
                //    }
                //}
                
                if (query_result_caches.Count > 10)
                {
                    query_result_caches.Remove(query_result_caches.Keys.First<string>());
                }
                if (!query_result_caches.ContainsKey(cache_key))
                {
                    query_result_caches.Add(cache_key, result);
                }
            }
            if (result == null || result.Count == 0)
            {
                return null;
            }
            List<object[][]> query_result = new List<object[][]>();

            DateTime s_date = Convert.ToDateTime(start_date);
            DateTime e_date = Convert.ToDateTime(end_date);
            int days = Convert.ToInt32((e_date - s_date).TotalDays);
            
            for (int i = 0; i < queries.Count; ++i)
            {
                object[][] single_result_withtime = EntityQueries.GetEachResult(queries[i], result, entity_total_mappings_caches[entity_name]);
                query_result.Add(single_result_withtime);
            }
            var serializer = new DataContractJsonSerializer(typeof(List<object[][]>));
            string szJson = "";
            using (MemoryStream stream = new MemoryStream())
            {
                serializer.WriteObject(stream, query_result);
                szJson = Encoding.UTF8.GetString(stream.ToArray());
            }
            return szJson;
        }
    }
}