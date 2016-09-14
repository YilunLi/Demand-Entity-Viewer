var entity_names_g;
var entity_ids;
var charts_queries;
var fixed_queries;
var daily_queries;
var changing_queries;
var explain_queries;
var accompany_queries;

function viewModel(data) {
    var self = this;

    if (self.entity_names == null) {
        self.entity_names = entity_names_g;
    }
    
    self.selected_entity = ko.observable("");

    self.default_id = 0;
    self.default_id = ko.computed(function () {
        if (entity_ids != null && self.entity_names.contains(self.selected_entity())) {
            return entity_ids[self.entity_names.contains(self.selected_entity()) - 1] > 0 ? entity_ids[self.entity_names.contains(self.selected_entity()) - 1] : "";
        }
        else {
            return "";
        }
    });
    self.EntityMappings = [];
    self.EntityMappings = ko.computed(function () {
        var mapping = [];
        //$.getJSON(   ??!!
        //    "../Model/GetEntityMappings?entity_name=" + self.selected_entity(),
        //    function (data) {
        //        if (data == null)
        //            return;
        //        for (var i = 0; i < data.length ; i++) {
        //            mapping.push(data[i]);
        //        }
        //    }
        //);
        $.ajax({
            url: "../Model/GetEntityMappings?entity_name=" + self.selected_entity(),
            type: 'get',
            dataType: 'json',
            contentType: 'application/json',
            async: false,
            success: function (data) {
                if (data == null)
                    return;
                for (var i = 0; i < data.length ; i++) {
                    mapping.push(data[i]);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Get Entity Mappings error!");
            }
        });
        $("#query").multiselect("uncheckAll");
        return mapping;
    });

    self.optional = ko.observable(true);
    self.optional = ko.computed(function () {
        if (self.selected_entity() == "Customer" || self.selected_entity() == "OrderItem") {
            return true;
        }
        else {
            return false;
        }
    });

    self.loading = ko.observable(false);
    self.ResultNotFound = ko.observable(true);
    self.FixedQueries = ko.observableArray();
    self.DailyQueries = ko.observableArray();
    self.ChangingQueries = ko.observableArray();
    self.FixedResults = [];
    self.DailyResults = [];
    self.ChangingResults = [];
    self.SelectedValue = [];
    self.SelectedValue = ko.observableArray();
    self.notsearching = ko.observable(true);
    self.SearchQuery = function () {
        var start_date = $("#date_picker1").val();
        var end_date = $("#date_picker2").val();
        if (end_date < start_date) {
            alert("EndDate should equal or larger than StartDate!");
            return;
        }

        var entity_name = $("#entity_name").val();
        var entity_id = $("#entity_id").val();
        var query = $("#query").val();
        if (entity_name == "" || entity_name == null || query == "" || query == null || entity_id == null || entity_id <= 0) {
            alert("Entity name, id or query should not be empty!!");
            return;
        }

        self.notsearching(false);
        self.loading(true);
        self.FixedQueries = [];
        self.DailyQueries = [];
        self.ChangingQueries = [];
        self.FixedResults = [];
        self.DailyResults = [];
        self.ChangingResults = [];

        // remove last search result
        var chart_table_container = document.getElementById("chart_table_container");
        while (chart_table_container.firstChild) {
            chart_table_container.removeChild(chart_table_container.firstChild);
        }
        var table_container = document.getElementById("table_container");
        while (table_container.firstChild) {
            table_container.removeChild(table_container.firstChild);
        }

        $.getJSON(
            "../Model/GetQueryResult?start_date=" + start_date + "&end_date=" + end_date + "&entity_name=" + entity_name + "&entity_id=" + entity_id + "&query=" + query,
            function (data) {
                self.loading(false);

                if (charts_queries == null && fixed_queries == null && daily_queries == null && changing_queries == null && explain_queries == null && accompany_queries == null) {
                    alert("Please refresh the page")
                    return;
                }

                if (data == null) {
                    alert("No result for your input entity id!");
                    self.notsearching(true);
                    return;
                }

                // scope exception
                if (typeof data == 'string') {
                    if (data.split(' ')[0] == "date") {
                        alert("Data of " + data.split(' ')[2] + " has not been updated.");
                        self.notsearching(true);
                        return;
                    } else if (data.split(' ')[0] == "job") {
                        alert("Scope job unexpected error happened.");
                        self.notsearching(true);
                        return;
                    }
                }

                var not_found_queries = "";
                for (var i = 0; i < query.length; ++i) {
                    if (fixed_queries.length > 0 && fixed_queries.contains(entity_name + query[i]) && data[i][0]) {
                        self.FixedQueries.push(query[i]);
                        self.FixedResults.push(data[i][1][0]);
                    } else if (daily_queries.length > 0 && daily_queries.contains(entity_name + query[i]) && data[i][0]) {
                        self.DailyQueries.push(query[i]);
                        self.DailyResults.push(data[i]);
                    } else if (changing_queries.length > 0 && changing_queries.contains(entity_name + query[i]) && data[i][0]) {
                        self.ChangingQueries.push(query[i]);
                        self.ChangingResults.push(data[i]);
                    } else {
                        not_found_queries += query[i] + " ";
                    }
                }

                self.ResultNotFound(self.FixedResults.length <= 0 && self.DailyResults.length <= 0 && self.ChangingResults.length <= 0);

                if (not_found_queries.split(' ').length - 1 == query.length) {
                    alert("No result for your input entity id!");
                    self.notsearching(true);
                    return;
                }

                if (not_found_queries.length > 0) {
                    alert("No result for " + not_found_queries + "!");
                }

                //create fixed results table
                if (self.FixedResults.length > 0) {
                    var fixed_table = document.createElement("table");
                    fixed_table.id = "fixed_table";
                    table_container.appendChild(fixed_table);
                    var header = fixed_table.createTHead();
                    var header_row = header.insertRow(0);
                    var head_cell0 = header_row.insertCell(0);
                    var head_cell1 = header_row.insertCell(1);
                    head_cell0.innerHTML = 'Metrics';
                    head_cell1.innerHTML = 'Value';
                    var t_body = fixed_table.createTBody();
                    for (var i = 0; i < self.FixedResults.length; ++i) {
                        var _tr = t_body.insertRow(i);
                        var _td0 = _tr.insertCell(0);
                        var _td1 = _tr.insertCell(1);
                        _td0.innerHTML = self.FixedQueries[i];
                        if (explain_queries.length > 0 && explain_queries[0].contains(entity_name + self.FixedQueries[i])) {
                            InsertExplainMark(_td0, explain_queries[1][explain_queries[0].contains(entity_name + self.FixedQueries[i]) - 1]);
                        }
                        _td1.innerHTML = self.FixedResults[i];
                    }
                    DataTableSetting(fixed_table);
                    var seperator = document.createElement("hr");
                    table_container.appendChild(seperator);
                }

                // create daily results tables and charts
                if (self.DailyQueries.length > 0) {
                    var daily_chart_queries = [];
                    var daily_chart_results = [];
                    var daily_no_chart_queries = [];
                    var daily_no_chart_results = [];
                    for (var i = 0; i < self.DailyQueries.length; ++i) {
                        if (charts_queries.length > 0 && charts_queries.contains(entity_name + self.DailyQueries[i])) {
                            daily_chart_queries.push(self.DailyQueries[i]);
                            daily_chart_results.push(self.DailyResults[i]);
                        } else {
                            daily_no_chart_queries.push(self.DailyQueries[i]);
                            daily_no_chart_results.push(self.DailyResults[i]);
                        }
                    }

                    // create daily_no_chart results table
                    if (daily_no_chart_queries.length > 0) {
                        CreateDailyNoChartTables(daily_no_chart_queries, daily_no_chart_results, entity_name, table_container);
                    }

                    if (daily_chart_queries.length > 0) {
                        CreateDailyChartTables(daily_no_chart_queries, daily_no_chart_results, daily_chart_queries, daily_chart_results, entity_name, chart_table_container);
                    }
                }

                // create changing results tables and charts
                if (self.ChangingResults.length > 0) {
                    var changing_chart_queries = [];
                    var changing_chart_results = [];
                    var changing_no_chart_queries = [];
                    var changing_no_chart_results = [];
                    for (var i = 0; i < self.ChangingQueries.length; ++i) {
                        if (charts_queries.length > 0 && charts_queries.contains(entity_name + self.ChangingQueries[i])) {
                            changing_chart_queries.push(self.ChangingQueries[i]);
                            changing_chart_results.push(self.ChangingResults[i]);
                        } else {
                            changing_no_chart_queries.push(self.ChangingQueries[i]);
                            changing_no_chart_results.push(self.ChangingResults[i]);
                        }
                    }

                    if (changing_no_chart_queries.length > 0) {
                        CreateChangingNoChartTables(changing_no_chart_queries, changing_no_chart_results, entity_name, table_container)
                    }
                    
                    if (changing_chart_queries.length > 0) {
                        CreateChangingChartTables(changing_no_chart_queries, changing_no_chart_results, changing_chart_queries, changing_chart_results, entity_name, chart_table_container);
                    }
                }

                self.notsearching(true);
            }
        );
    }
};

function CreateDailyNoChartTables(daily_no_chart_queries, daily_no_chart_results, entity_name, table_container) {
    var daily_table = document.createElement("table");
    daily_table.id = "daily_table";
    table_container.appendChild(daily_table); 
    var header = daily_table.createTHead();
    var header_row = header.insertRow(0);
    var head_cell0 = header_row.insertCell(0);
    head_cell0.innerHTML = 'LogDate';
    for (var i = 0; i < daily_no_chart_queries.length; ++i) {
        var head_cell1 = header_row.insertCell(i + 1);
        head_cell1.innerHTML = daily_no_chart_queries[i];
        if (explain_queries.length > 0 && explain_queries[0].contains(entity_name + daily_no_chart_queries[i])) {
            InsertExplainMark(head_cell1, explain_queries[1][explain_queries[0].contains(entity_name + daily_no_chart_queries[i]) - 1]);
        }
    }
    var t_body = daily_table.createTBody();
    var startdate = new Date($("#date_picker1").val());
    var enddate = new Date($("#date_picker2").val());
    var result_indexes = new Int32Array(daily_no_chart_results.length);
    var row_idx = 0;
    while (startdate <= enddate) {
        var tr = t_body.insertRow(row_idx);
        var td0 = tr.insertCell(0);
        td0.innerHTML = startdate.Format("yyyy-MM-dd").toString();
        for (var j = 0; j < daily_no_chart_queries.length; ++j) {
            var td1 = tr.insertCell(j + 1);
            if (result_indexes[j] < daily_no_chart_results[j][0].length) {
                var cur_date = ConvertDateTime(daily_no_chart_results[j][0][result_indexes[j]]);
                if (cur_date.Format("yyyy-MM-dd") == startdate.Format("yyyy-MM-dd") && daily_no_chart_results[j][1][result_indexes[j]] != null) {
                    td1.innerHTML = daily_no_chart_results[j][1][result_indexes[j]];
                } else {
                    td1.innerHTML = "0";
                }
                while (cur_date.Format("yyyy-MM-dd") <= startdate.Format("yyyy-MM-dd")) {
                    ++result_indexes[j];
                    if (result_indexes[j] >= daily_no_chart_results[j][0].length) {
                        break;
                    }
                    cur_date = ConvertDateTime(daily_no_chart_results[j][0][result_indexes[j]]);
                }
            } else {
                td1.innerHTML = "0";
            }
        }
        ++row_idx
        startdate.setDate(startdate.getDate() + 1);
    }
    DataTableSetting(daily_table);
    var seperator = document.createElement("hr");
    table_container.appendChild(seperator);
}

function CreateDailyChartTables(daily_no_chart_queries, daily_no_chart_results, daily_chart_queries, daily_chart_results, entity_name, chart_table_container) {
    for (var i = 0; i < daily_chart_queries.length; ++i) {
        var single_container = document.createElement("div");
        single_container.id = "daily_chart_result_" + i;
        chart_table_container.appendChild(single_container);
        // table
        var daily_table_container = document.createElement("div");
        daily_table_container.style.clear = "both";
        daily_table_container.style.width = "400px";
        daily_table_container.style.cssFloat = "left";
        var daily_table = document.createElement("table");
        daily_table.id = "daily_chart_table_" + i;
        daily_table_container.appendChild(daily_table);
        var header = daily_table.createTHead();
        var header_row = header.insertRow(0);
        var head_cell0 = header_row.insertCell(0);
        head_cell0.innerHTML = 'LogDate';
        var head_cell1 = header_row.insertCell(1);
        head_cell1.innerHTML = daily_chart_queries[i];
        if (explain_queries.length > 0 && explain_queries[0].contains(entity_name + daily_chart_queries[i])) {
            InsertExplainMark(head_cell1, explain_queries[1][explain_queries[0].contains(entity_name + daily_chart_queries[i]) - 1]);
        }
        if (accompany_queries.length > 0 && accompany_queries[0].contains(entity_name + daily_chart_queries[i])) {
            var a_queries = accompany_queries[1][accompany_queries[0].contains(entity_name + daily_chart_queries[i]) - 1];
            if (daily_no_chart_queries.length > 0 && daily_no_chart_queries.contains(a_queries)) {
                var head_cell2 = header_row.insertCell(2);
                head_cell2.innerHTML = a_queries;
                if (explain_queries.length > 0 && explain_queries[0].contains(entity_name + a_queries)) {
                    InsertExplainMark(head_cell2, explain_queries[1][explain_queries[0].contains(entity_name + a_queries) - 1]);
                }
            }
        }
        var t_body = daily_table.createTBody();
        var startdate = new Date($("#date_picker1").val());
        var enddate = new Date($("#date_picker2").val());
        var result_index = 0;
        var chart_data = [];
        var chart_cate = [];
        var row_idx = 0;
        while (startdate <= enddate) {
            var tr = t_body.insertRow(row_idx);
            var td0 = tr.insertCell(0);
            td0.innerHTML = startdate.Format("yyyy-MM-dd").toString();
            chart_cate.push(startdate.Format("yyyy-MM-dd").toString());
            var td1 = tr.insertCell(1);
            if (result_index < daily_chart_results[i][0].length) {
                var cur_date = ConvertDateTime(daily_chart_results[i][0][result_index]);
                if (cur_date.Format("yyyy-MM-dd") == startdate.Format("yyyy-MM-dd") && daily_chart_results[i][1][result_index] != null) {
                    td1.innerHTML = daily_chart_results[i][1][result_index];
                    chart_data.push(daily_chart_results[i][1][result_index]);
                    if (accompany_queries.length > 0 && accompany_queries[0].contains(entity_name + daily_chart_queries[i])) {
                        var a_queries = accompany_queries[1][accompany_queries[0].contains(entity_name + daily_chart_queries[i]) - 1];
                        if (daily_no_chart_queries.length > 0 && daily_no_chart_queries.contains(a_queries)) {
                            var td2 = tr.insertCell(2);
                            td2.innerHTML = daily_no_chart_results[daily_no_chart_queries.contains(a_queries) - 1][1][result_index];
                        }
                    }
                } else {
                    td1.innerHTML = "0";
                    if (accompany_queries.length > 0 && accompany_queries[0].contains(entity_name + daily_chart_queries[i])) {
                        var a_queries = accompany_queries[1][accompany_queries[0].contains(entity_name + daily_chart_queries[i]) - 1];
                        if (daily_no_chart_queries.length > 0 && daily_no_chart_queries.contains(a_queries)) {
                            var td2 = tr.insertCell(2);
                            td2.innerHTML = "0";
                        }
                    }
                    chart_data.push(0);
                }
                while (cur_date.Format("yyyy-MM-dd") <= startdate.Format("yyyy-MM-dd")) {
                    ++result_index;
                    if (result_index >= daily_chart_results[i][0].length) {
                        break;
                    }
                    cur_date = ConvertDateTime(daily_chart_results[i][0][result_index]);
                }
            } else {
                td1.innerHTML = "0";
                if (accompany_queries.length > 0 && accompany_queries[0].contains(entity_name + daily_chart_queries[i])) {
                    var a_queries = accompany_queries[1][accompany_queries[0].contains(entity_name + daily_chart_queries[i]) - 1];
                    if (daily_no_chart_queries.length > 0 && daily_no_chart_queries.contains(a_queries)) {
                        var td2 = tr.insertCell(2);
                        td2.innerHTML = "0";
                    }
                }
                chart_data.push(0);
            }
            ++row_idx;
            startdate.setDate(startdate.getDate() + 1);
        }
        single_container.appendChild(daily_table_container);
        DataTableSetting(daily_table);

        // chart
        var daily_chart = document.createElement("div");
        daily_chart.id = "daily_chart_" + i;
        daily_chart.style.marginLeft = "400px";
        single_container.appendChild(daily_chart);
        HighChartsUpdate(chart_data, chart_cate, "#" + daily_chart.id, daily_chart_queries[i]);
        var seperator = document.createElement("hr");
        chart_table_container.appendChild(seperator);
    }
}

function CreateChangingNoChartTables(changing_no_chart_queries, changing_no_chart_results, entity_name, table_container) {
    for (var i = 0; i < changing_no_chart_queries.length; ++i) {
        var single_container = document.createElement("div");
        single_container.id = "changing_chart_result_" + i;
        table_container.appendChild(single_container);
        // table
        var changing_table = document.createElement("table");
        changing_table.id = "changing_table_" + i;
        single_container.appendChild(changing_table);
        var header = changing_table.createTHead();
        var header_row = header.insertRow(0);
        var head_cell0 = header_row.insertCell(0);
        head_cell0.innerHTML = 'LogDate';
        var head_cell1 = header_row.insertCell(1);
        head_cell1.innerHTML = changing_no_chart_queries[i];
        if (explain_queries.length > 0 && explain_queries[0].contains(entity_name + changing_no_chart_queries[i])) {
            InsertExplainMark(head_cell1, explain_queries[1][explain_queries[0].contains(entity_name + changing_no_chart_queries[i]) - 1]);
        }
        var t_body = changing_table.createTBody();
        var row_index = 0;
        for (var j = 0; j < changing_no_chart_results[i][0].length; ++j) {
            if (j > 0 && changing_no_chart_results[i][1][j] == changing_no_chart_results[i][1][j - 1]) {
                var cur_date = ConvertDateTime(changing_no_chart_results[i][0][j]);
                var prev_date = ConvertDateTime(changing_no_chart_results[i][0][j - 1])
                if (cur_date.Format("yyyy-MM-dd") == prev_date.Format("yyyy-MM-dd")){
                    continue;
                }
            }
            var tr = t_body.insertRow(row_index++);
            var td0 = tr.insertCell(0);
            td0.innerHTML = ConvertDateTime(changing_no_chart_results[i][0][j]).Format("yyyy-MM-dd hh:mm").toString();
            var td1 = tr.insertCell(1);
            td1.innerHTML = changing_no_chart_results[i][1][j] == null ? "0" : changing_no_chart_results[i][1][j];
        }
        DataTableSetting(changing_table);
    }
    var seperator = document.createElement("hr");
    table_container.appendChild(seperator);
}

function CreateChangingChartTables(changing_no_chart_queries, changing_no_chart_results, changing_chart_queries, changing_chart_results, entity_name, chart_table_container) {
    for (var i = 0; i < changing_chart_queries.length; ++i) {
        var single_container = document.createElement("div");
        single_container.id = "changing_chart_result_" + i;
        chart_table_container.appendChild(single_container);
        // table
        var changing_table_container = document.createElement("div");
        changing_table_container.style.clear = "both";
        changing_table_container.style.width = "400px";
        changing_table_container.style.cssFloat = "left";
        var changing_table = document.createElement("table");
        changing_table.id = "changing_chart_table_" + i;
        changing_table_container.appendChild(changing_table);
        var header = changing_table.createTHead();
        var header_row = header.insertRow(0);
        var head_cell0 = header_row.insertCell(0);
        head_cell0.innerHTML = 'LogDate';
        var head_cell1 = header_row.insertCell(1);
        head_cell1.innerHTML = changing_chart_queries[i];
        if (explain_queries.length > 0 && explain_queries[0].contains(entity_name + changing_chart_queries[i])) {
            InsertExplainMark(head_cell1, explain_queries[1][explain_queries[0].contains(entity_name + changing_chart_queries[i]) - 1]);
        }
        if (accompany_queries.length > 0 && accompany_queries[0].contains(entity_name + changing_chart_queries[i])) {
            var a_queries = accompany_queries[1][accompany_queries[0].contains(entity_name + changing_chart_queries[i]) - 1];
            if (changing_no_chart_queries.length > 0 && changing_no_chart_queries.contains(a_queries)) {
                var head_cell2 = header_row.insertCell(2);
                head_cell2.innerHTML = a_queries;
                if (explain_queries.length > 0 && explain_queries[0].contains(entity_name + a_queries)) {
                    InsertExplainMark(head_cell2, explain_queries[1][explain_queries[0].contains(entity_name + a_queries) - 1]);
                }
            }
        }
        var t_body = changing_table.createTBody();
        var chart_data = [];
        var chart_cate = [];
        for (var j = 0; j < changing_chart_results[i][0].length; ++j) {
            if (j > 0 && changing_chart_results[i][1][j] == changing_chart_results[i][1][j - 1]) {
                var cur_date = ConvertDateTime(changing_chart_results[i][0][j]);
                var prev_date = ConvertDateTime(changing_chart_results[i][0][j - 1])
                if (cur_date.Format("yyyy-MM-dd") == prev_date.Format("yyyy-MM-dd")) {
                    continue;
                }
            }
            var tr = t_body.insertRow(j);
            var td0 = tr.insertCell(0);
            td0.innerHTML = ConvertDateTime(changing_chart_results[i][0][j]).Format("yyyy-MM-dd hh:mm").toString();
            chart_cate.push(ConvertDateTime(changing_chart_results[i][0][j]).Format("yyyy-MM-dd hh:mm").toString());
            var td1 = tr.insertCell(1);
            td1.innerHTML = changing_chart_results[i][1][j] == null ? "0" : changing_chart_results[i][1][j];
            chart_data.push(changing_chart_results[i][1][j] == null ? 0 : changing_chart_results[i][1][j]);
            if (accompany_queries.length > 0 && accompany_queries[0].contains(entity_name + changing_chart_queries[i])) {
                var a_queries = accompany_queries[1][accompany_queries[0].contains(entity_name + changing_chart_queries[i]) - 1];
                if (changing_no_chart_queries.length > 0 && changing_no_chart_queries.contains(a_queries)) {
                    var td2 = tr.insertCell(2);
                    td2.innerHTML = changing_no_chart_results[changing_no_chart_queries.contains(a_queries) - 1][1][j];
                }
            }
        }
        single_container.appendChild(changing_table_container);
        DataTableSetting(changing_table);

        // chart
        var changing_chart = document.createElement("div");
        changing_chart.id = "changing_chart_" + i;
        changing_chart.style.marginLeft = "400px";
        single_container.appendChild(changing_chart);
        HighChartsUpdate(chart_data, chart_cate, "#" + changing_chart.id, changing_chart_queries[i]);
        var seperator = document.createElement("hr");
        chart_table_container.appendChild(seperator);
    }
}

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //month 
        "d+": this.getDate(), //day 
        "h+": this.getHours(), //hour 
        "m+": this.getMinutes(), //min 
        "s+": this.getSeconds(), //second 
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
        "S": this.getMilliseconds() //msecond 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return i + 1;
        }
    }
    return false;
}

// conver c# datetime into js date
function ConvertDateTime(datetime) {
    var patt = /\d{13}/;
    var timeNum = parseInt(datetime.match(patt));
    var d = new Date(timeNum);
    return d;
}

function HighChartsUpdate(data, cate, chart_id, query_name) {
    //generate the xais based on the datepicker
    var datashow = [];
    datashow.push({
        name: query_name,
        data: data
    })
    $(chart_id).highcharts({
        title: false,
        xAxis: {
            categories: cate
        },
        yAxis: {
            title: {
                text: query_name
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        series: [{
            name: query_name,
            data: data,
            showInLegend: false
        }]
    });
}

function DataTableSetting(table) {
    $('#' + table.id).dataTable({
        "ordering": false,
        "info": false,
        "filter": false,
        "cell-border": true,
        "stripe": true,
        "hover": true,
        "autoWidth": false,
        "pageLength": 7,
        "lengthChange": false,
        "scrollX": false,
    });
    $('#' + table.id).removeClass('display');
    $('#' + table.id).addClass('table table-striped table-bordered');
}

function InsertExplainMark(cell, explaination) {
    var quote = document.createElement("img");
    quote.src = "imgs/question_mark.png";
    quote.title = explaination;
    quote.height = "17";
    quote.width = "17";
    cell.appendChild(quote);
}

// binding knockout and jquery-ui-multiselect-widget
//   <select data-bind="multiSelectCheck: listOfString, optionsCaption: 'Check one or more', selectedOptions: selectedRec"  multiple="multiple"></select>
(function (ko, $) {

    if (typeof (ko) === undefined) { throw 'Knockout is required, please ensure it is loaded before loading this plug-in'; }
    if (typeof (jQuery) === undefined) { throw 'jQuery is required, please ensure it is loaded before loading this plug-in'; }
    if (typeof (jQuery.ui) === undefined) { throw 'jQuery UI is required, please ensure it is loaded before loading this plug-in'; }

    // private functions here

    // the binding
    ko.bindingHandlers.multiSelectCheck = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
            var multiselectOptions = ko.utils.unwrapObservable(allBindingsAccessor().multiselectOptions) || {};

            // pass the original optionsCaption to the similar widget option
            if (ko.utils.unwrapObservable(allBindingsAccessor().optionsCaption)) {
                multiselectOptions.noneSelectedText = ko.utils.unwrapObservable(allBindingsAccessor().optionsCaption);
            }

            // remove this and use the widget's
            allBindingsAccessor().optionsCaption = '';
            $(element).multiselect(multiselectOptions);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).multiselect("destroy");
            });

        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever the associated observable changes value.
            // Update the DOM element based on the supplied values here.
            var selectOptions = ko.utils.unwrapObservable(allBindingsAccessor().multiSelectCheck);
            // remove this and use the widget's 
            allBindingsAccessor().optionsCaption = '';

            ko.bindingHandlers.options.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

            setTimeout(function () {
                $(element).multiselect("refresh");
            }, 0);

        }

    };

})(ko, jQuery);

$(document).ready((function () {
    $("#date_picker1").datepicker({ minDate: "08/14/2016", maxDate: "+0M +0D" }); //Todo: Edit here based on the real log
    $("#date_picker2").datepicker({ minDate: "08/14/2016", maxDate: "+0M +0D" });
    $.getJSON(
        "../Model/GetEntityIds",
        function (results) {
            entity_ids = results;
        }
    )
    //$.getJSON(
    //    "../Model/GetEntityMappings",
    //    function (results) {
    //        $("#entity_name").autocomplete({ source: results });
    //    }
    //);
    $.getJSON(
        "../Model/GetChartsQueries",
        function (results) {
            charts_queries = results;
        }
    );
    $.getJSON(
        "../Model/GetFixedQueries",
        function (results) {
            fixed_queries = results;
        }
    )
    $.getJSON(
        "../Model/GetDailyQueries",
        function (results) {
            daily_queries = results;
        }
    )
    $.getJSON(
        "../Model/GetChangingQueries",
        function (results) {
            changing_queries = results;
        }
    )
    $.getJSON(
        "../Model/GetExplainQueries",
        function (results) {
            explain_queries = results;
        }
    )
    $.getJSON(
        "../Model/GetAccompanyQueries",
        function (results) {
            accompany_queries = results;
        }
    )
    $.getJSON(
        "../Model/GetEntities",
        function (results) {
            entity_names_g = results;
            $("#entity_name").autocomplete({ source: results });
            ko.applyBindings(new viewModel());
        }
    );
})
);
