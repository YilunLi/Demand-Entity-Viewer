using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization.Json;
using System.Runtime.Serialization;
using System.Collections;

namespace test.Models
{
    [DataContract]
    public class EntityQueries
    {
        [DataMember]
        public Hashtable entity_query_result;

        public EntityQueries(object[] values, string[] queries)
        {
            entity_query_result = new Hashtable();
            for (int i = 0; i < values.Length; ++i)
            {
                entity_query_result.Add(queries[i], values[i]);
            }
        }

        public static object[][] GetEachResult(string query, Dictionary<string, List<EntityQueries>> result, Dictionary<string, string[]> entity_queries)
        {
            if (result == null)
            {
                return new object[2][];
            }
            object[][] res_with_time;
            foreach (var ele in entity_queries)
            {
                if (ele.Value.Contains(query))
                {
                    if (!result.ContainsKey(ele.Key) || result[ele.Key].Count == 0)
                    {
                        return new object[2][];
                    }
                    else
                    {
                        res_with_time = new object[2][];
                        object[] tmp_time = new object[result[ele.Key].Count];
                        object[] tmp_res = new object[result[ele.Key].Count];
                        for (int i = 0; i < result[ele.Key].Count; ++i)
                        {
                            tmp_time[i] = result[ele.Key][i].entity_query_result[ele.Value[0]];
                            tmp_res[i] = result[ele.Key][i].entity_query_result[query];
                        }
                        res_with_time[0] = tmp_time;
                        res_with_time[1] = tmp_res;
                    }
                    return res_with_time;
                }
            }
            return new object[2][];
        }
    }
}