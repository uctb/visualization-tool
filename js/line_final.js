/*create option*/

/*右上*/
function createoption(obj,SelectedNodeID,startIndex = -1,endIndex = -1, methodid){

    var DatasetName = DatasetList[DatasetID];
    var tmp = obj['Pred'][DatasetName];
    var TimeNum = tmp['GroundTruth'].length;

    // 默认datazoom位置
    if(startIndex > TimeNum | endIndex > TimeNum | startIndex < -1 | endIndex < -1)
    {
        window.alert("Error 02: out of range!");
        startIndex = -1;
        endIndex = -1;
    }

    if(startIndex == -1)
        startIndex = Math.floor(TimeNum*0.2);
    if(endIndex == -1)
        endIndex = TimeNum - 1;

    if(startIndex > endIndex)
    {
        window.alert("Error 01: wrong time selected");
        startIndex = -1;
        endIndex = -1;
    }


    // ydata：这个数据点各个时间的真实值 获得真实值数组
    let RealNodeID = -1;  // 记录这个节点对应在traffic_data_index里的位置，-1代表没这个玩意
    let methodName = MethodNameArray[methodid];
    console.log("now_methodName:", methodName);
    RealNodeID = tmp[methodName]['traffic_data_index'].indexOf(SelectedNodeID);
    let ydata = new Array();
    for(let i = 0; i<TimeNum;i++) {
        ydata[i] = tmp['GroundTruth'][i][RealNodeID];
    }

    // pred_data: 预测值
    let pred_data = new Array();
    // 如果存在这个点,把预测值填入predata数组（采用尾端对齐）
    if(RealNodeID != -1) {
            // 遍历所有时间点
        for (k = 0; k < tmp[methodName]['TrafficNode'].length; k++){     // 真实值和预测值的时间长度不等，预测的段应该是尾端对齐
            var index = tmp[methodName]['TrafficNode'].length-k-1
            pred_data[TimeNum-1-k] = tmp[methodName]['TrafficNode'][index][RealNodeID];
        }
    }

    // mark_area
    let mark_area = markArea[methodid][RealNodeID];
    console.log("mark_area is", mark_area);

    let color_list = ['#2f4554', '#61a0a8', '#FF8C00', '#20B2AA','#ffc20e','#4169E1','#afb4db', '#c4ccd3'];
    let j = 0;

/* 注：这里有个问题
    因为拿到的数据集特殊，都是0.1划分，所以程序是按0.1写的
    但实际上不一定是0.1，所以Pred里头数据集才附带了真实值。
    现在并没有使用这个真实值，但可能会有问题。
*/

    // 指定图表的配置项和数据
    var option = {
        legend: {orient:'horizontal',left:'2%', top:'5%', textStyle:{color:'#fff'}},
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
            },
            formatter: function (params, ticket, callback) {

                var result = params[0].axisValue + '<br/>';

                result += '<span style="display:inline-block;position:relative; top:-3px;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[0].color +'"></span>'
                           + params[0].seriesName + ' : ' + params[0].data.toFixed(2) + '<br/>' ;

                for(i = 1; i< params.length;i++)
                {
                    /* 结果 */
                    result += '<span style="display:inline-block;position:relative; top:-3px;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color +'"></span>'
                           + params[i].seriesName + ' : ' + params[i].data.toFixed(2) + '<br/>';

                    /* 相对误差 */
                    result += '&nbsp&nbsp&nbsp&nbsp' +'<span style="display:inline-block;position:relative; top:-3px;margin-right:5px;border-radius:6px;width:5px;height:5px;background-color:' + params[i].color +'"></span>'
                           + 'RE: ';

                    var relative_error = Math.abs((params[i].data-params[0].data)/params[0].data);
                    if(params[0].data == 0)
                    {
                        if(params[1].data == 0){error_rate = 0;}
                        result +=  (relative_error*100).toFixed(2) + '&nbsp;';
                    }
                    else
                    {
                        result += (relative_error*100).toFixed(2) + '%&nbsp;';
                    }

                    /* 绝对误差 */
                    result += '&nbsp&nbsp&nbsp' +'<span style="display:inline-block;position:relative; top:-3px;margin-right:5px;border-radius:6px;width:5px;height:5px;background-color:' + params[i].color +'"></span>'
                    + 'AE: ';

                    var absolute_error = Math.abs(params[i].data-params[0].data);
                    result += absolute_error.toFixed(2) + '<br/>';

                    /* 判断结果 */
                    result += '&nbsp&nbsp&nbsp&nbsp' + '<span style="display:inline-block;position:relative; top:-3px;margin-right:5px;border-radius:6px;width:5px;height:5px;background-color:' + params[i].color +'"></span>'

                    if(relative_error <= MAXError)
                    {
                        if(absolute_error <= MAXABSError)
                        {
                            result += 'Result: ' + '√' + '<br/>';
                        }
                        else
                        {
                            // 暂时还是没有想到太合适的方法把AE纳入评价依据，暂时不用
                            // result += 'Result: ' + '× (AE)' + '<br/>';
                            result += 'Result: ' + '√' + '<br/>';
                        }
                    }
                    else if(absolute_error <= MAXABSError)
                    {
                        result += 'Result: ' + '× (RE)' + '<br/>';
                    }
                    else
                    {
                        result += 'Result: ' + '× (Both)' + '<br/>';
                    }
                }

                return [result];
            },

            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        color:['#2f4554', '#61a0a8', '#d48265', '#bda29a','#6e7074','#87CEFA','#546570', '#c4ccd3'],
        axisPointer: {
            label: {
                backgroundColor: '#1177',
                precision:2
            }
        },
        xAxis: {
            type: 'category',
            data: TimeSlots,
            axisLabel: {
                color: '#fff'
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#fff'
            }
        },
        series: function() {
            var Myseries = new Array();
            var item1 =
            {
                name: "Ground Truth",
                data: ydata,
                type: 'line',
                symbol:'triangle',
                symbolSize: 8,
                itemStyle: {
                    borderColor: "#111AAA",
                    color: '#fff',
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                    shadowBlur: 10
                },
                lineStyle: {
                    width : 3
                },
                markArea:{
                    slient: true,
                    itemStyle:{
                        color: '#f8aba6',
                        opacity: 0.3
                    },
                    data: mark_area
                },
            }
            Myseries.push(item1);

            var item2 = {
                name: methodName,
                data: pred_data,
                type: 'line',
                color: color_list[j+2],
                symbol: function(number,params) {
                    var index = params.dataIndex;
                    var re = Math.abs((number - ydata[index])) / ydata[index];
                    if(ydata[index] == 0) {
                        return 'emptyCircle';
                    }
                    if(line_highlight == 1) {
                        if(re <= MAXError) {
                            return 'image://./images/greendot2.png';
                        }
                        else {
                            return 'image://./images/reddot.png';
                        }
                    } else {
                        return 'emptyCircle';
                    }
                },
                //showSymbol : false,
                showAllSymbol : true,
                symbolSize: function(number,params) {
                    var index = params.dataIndex;
                    var re = Math.abs((number - ydata[index])) / ydata[index];

                    if(ydata[index] == 0) {
                        return 2;
                    }

                    if(line_highlight == 1) {
                        if(re <= MAXError) {
                            return 8;
                        }
                        else {
                            return 8;
                        }
                    }
                    else {
                        return 4;
                    }
                },
            }
            Myseries.push(item2);

            return Myseries;
        }(),
        dataZoom: [
        {
                type: 'slider',
                show: true,
                xAxisIndex: 0,
                //filterMode: 'empty',   //这句话加上的话，不会随着数据改变轴
                startValue: TimeSlots[startIndex],
                endValue: TimeSlots[endIndex],
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '60%',
                height: 20,
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
        },
        {
            type: 'inside',
            show: true,
            xAxisIndex: 0,
            startValue: TimeSlots[startIndex],
            endValue: TimeSlots[endIndex],
        },
        {
            type: 'slider',
            yAxisIndex: 0,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            width: 20,
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            }
        }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。

    return option;
}

function createBadCaseoption(methodid){

    let xdata = new Array();
    let ydata = new Array();
    let BadCaseNum = PointSortedBadCaseNum[methodid];

    for(let i=0; i<BadCaseNum.length; i++) {
        let dict = BadCaseNum[i];
        // 获得x轴数据
        xdata.push(dict['index']);
        // 获得y轴数据
        ydata.push(dict['BadCaseNum']);
    }

    option = {
        legend : {
            left: '7%',
            textStyle:{color:'#fff'}
        },
        xAxis: {
            type: 'category',
            data: xdata,
            axisLabel: {
                color: '#fff'
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#fff'
            }
        },
        tooltip: {
            show: true,
            trigger: 'axis'
        },
        series: {
            data: ydata,
            type: 'bar',
            name: 'Bad Case Num',
            itemStyle: {
                normal: {
                    color: '#d48265'
                }
            },
        },
        dataZoom: [
            {
                type: 'slider',
                show: true,
                xAxisIndex: 0,
                //filterMode: 'empty',   //这句话加上的话，不会随着数据改变轴
                startValue: 0,
                endValue: 30,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                height: 20,
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            },
            {
                type: 'inside',
                show: true,
                xAxisIndex: 0,
            },
            {
                type: 'slider',
                yAxisIndex: 0,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                width: 20,
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }
        ]
    };

    return option;
}

function createTimeBadCaseoption(obj,SelectedNodeID,startIndex = -1,endIndex = -1, methodid){

    let DatasetName = DatasetList[DatasetID];
    let tmp = obj['Pred'][DatasetName];
    let TimeNum = tmp['GroundTruth'].length;

    // 默认datazoom位置

    if(startIndex > TimeNum | endIndex > TimeNum | startIndex < -1 | endIndex < -1)
    {
        window.alert("Error 02: out of range!");
        startIndex = -1;
        endIndex = -1;
    }

    if(startIndex == -1)
        startIndex = Math.floor(TimeNum*0.2);
    if(endIndex == -1)
        endIndex = TimeNum - 1;

    if(startIndex > endIndex)
    {
        window.alert("Error 01: wrong time selected");
        startIndex = -1;
        endIndex = -1;
    }

    // 求ydata
    let time_bad_case_dict = PointTimeBadCase[methodid];
    let ydata = [];
    for (let i=0; i < TimeArrayLength; i++) {
        ydata.push(time_bad_case_dict[TimeSlots[i]]);
    }



    // 指定图表的配置项和数据
    let option = {
        legend: {orient:'horizontal',left:'2%', top:'2%', textStyle:{color:'#fff'}},
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
            },
            formatter: function (params, ticket, callback) {

                var result = params[0].axisValue + '<br/>';

                result += '<span style="display:inline-block;position:relative; top:-3px;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[0].color +'"></span>'
                    + params[0].seriesName + ' : ' + params[0].data.toFixed(2) + '<br/>' ;

                for(i = 1; i< params.length;i++)
                {
                    /* 结果 */
                    result += '<span style="display:inline-block;position:relative; top:-3px;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color +'"></span>'
                        + params[i].seriesName + ' : ' + params[i].data.toFixed(2) + '<br/>';

                    /* 相对误差 */
                    result += '&nbsp&nbsp&nbsp&nbsp' +'<span style="display:inline-block;position:relative; top:-3px;margin-right:5px;border-radius:6px;width:5px;height:5px;background-color:' + params[i].color +'"></span>'
                        + 'RE: ';

                    var relative_error = Math.abs((params[i].data-params[0].data)/params[0].data);
                    if(params[0].data == 0)
                    {
                        if(params[1].data == 0){error_rate = 0;}
                        result +=  (relative_error*100).toFixed(2) + '&nbsp;';
                    }
                    else
                    {
                        result += (relative_error*100).toFixed(2) + '%&nbsp;';
                    }

                    /* 绝对误差 */
                    result += '&nbsp&nbsp&nbsp' +'<span style="display:inline-block;position:relative; top:-3px;margin-right:5px;border-radius:6px;width:5px;height:5px;background-color:' + params[i].color +'"></span>'
                        + 'AE: ';

                    var absolute_error = Math.abs(params[i].data-params[0].data);
                    result += absolute_error.toFixed(2) + '<br/>';

                    /* 判断结果 */
                    result += '&nbsp&nbsp&nbsp&nbsp' + '<span style="display:inline-block;position:relative; top:-3px;margin-right:5px;border-radius:6px;width:5px;height:5px;background-color:' + params[i].color +'"></span>'

                    if(relative_error <= MAXError)
                    {
                        if(absolute_error <= MAXABSError)
                        {
                            result += 'Result: ' + '√' + '<br/>';
                        }
                        else
                        {
                            // 暂时还是没有想到太合适的方法把AE纳入评价依据，暂时不用
                            // result += 'Result: ' + '× (AE)' + '<br/>';
                            result += 'Result: ' + '√' + '<br/>';
                        }
                    }
                    else if(absolute_error <= MAXABSError)
                    {
                        result += 'Result: ' + '× (RE)' + '<br/>';
                    }
                    else
                    {
                        result += 'Result: ' + '× (Both)' + '<br/>';
                    }
                }

                return [result];
            },

            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        axisPointer: {
            label: {
                backgroundColor: '#1177',
                precision:2
            }
        },
        xAxis: {
            type: 'category',
            data: TimeSlots,
            axisLabel: {
                color: '#fff'
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#fff'
            }
        },
        series: {
            // name: "Bad Case Region Num",
            // data: ydata,
            // type: 'bar',
            // symbol:'triangle',
            // symbolSize: 8,
            // itemStyle: {
            //     borderColor: "#111AAA",
            //     color: '#FFE4C4',
            //     shadowColor: 'rgba(0, 0, 0, 0.5)',
            //     shadowBlur: 10
            // },
            // lineStyle: {
            //     width : 3
            // },
            data: ydata,
            type: 'bar',
            name: 'Bad Case Region Num',
            itemStyle: {
                normal: {
                    color: '#d48265'
                }
            },
        },
        dataZoom: [
            {
                type: 'slider',
                show: true,
                xAxisIndex: 0,
                //filterMode: 'empty',   //这句话加上的话，不会随着数据改变轴
                startValue: TimeSlots[startIndex],
                endValue: TimeSlots[endIndex],
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                height: 20,
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            },
            {
                type: 'inside',
                show: true,
                xAxisIndex: 0,
                startValue: TimeSlots[startIndex],
                endValue: TimeSlots[endIndex],
            },
            {
                type: 'slider',
                yAxisIndex: 0,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                width: 20,
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。

    return option;
}

/*右下*/
function createMetricsoption(methodid, pointid){

    let xdata = new Array();
    let rmse_data = new Array();
    let mae_data = new Array();
    let mape_data = new Array();

    for(let i=0; i<PointSortedRMSE[methodid].length; i++) {
        let dict = PointSortedRMSE[methodid][i];
        // 获得x轴数据
        xdata.push(dict['index']);
        rmse_data.push(dict['rmse']);
    }
    for(let i=0; i<PointSortedMAE[methodid].length; i++) {
        let dict =PointSortedMAE[methodid][i];
        mae_data.push(dict['mae']);
    }
    for(let i=0; i<PointSortedMAPE[methodid].length; i++) {
        let dict =PointSortedMAPE[methodid][i];
        mape_data.push(dict['mape']);
    }

    let option = {
        legend : {
            left: '2%',
            top: '5%',
            textStyle:{color:'#fff'}
        },
        xAxis: {
            type: 'category',
            data: xdata,
            axisLabel: {
                color: '#fff'
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#fff'
            }
        },
        tooltip: {
            show: true,
            trigger: 'axis'
        },
        series: function() {
            let Myseries = new Array();
            let item_rmse = {
                name: 'RMSE',
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: '#FFB6C1'
                    }
                },
                data: function() {
                    let MyData = new Array();
                    if(line_highlight != 1){
                        for(let i=0; i<rmse_data.length; i++){
                            if(i != pointid){
                                MyData.push(rmse_data[i]);
                            }
                            else {
                                let item = {
                                    value: rmse_data[i],
                                    itemStyle: {
                                        color: '#FFD700'
                                    }
                                }
                                MyData.push(item);
                            }
                        }
                    }
                    else {
                        for(i=0; i<rmse_data.length; i++){
                            if(rmse_data[i] < MINACCURACY){
                                MyData.push(rmse_data[i]);
                            }
                            else {
                                item = {
                                    value: rmse_data[i],
                                    itemStyle: {
                                        color: '#DC143C'
                                    }
                                }
                                MyData.push(item);
                            }
                        }
                    }
                    return MyData;
                }()
            }
            Myseries.push(item_rmse);

            let item_mae = {
                name: 'MAE',
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: '#FFA07A'
                    }
                },
                data: function() {
                    let MyData = new Array();
                    if(line_highlight != 1){
                        for(let i=0; i<mae_data.length; i++){
                            if(i != pointid){
                                MyData.push(mae_data[i]);
                            }
                            else {
                                let item = {
                                    value: mae_data[i],
                                    itemStyle: {
                                        color: '#FFD700'
                                    }
                                }
                                MyData.push(item);
                            }
                        }
                    }
                    else {
                        for(i=0; i<mae_data.length; i++){
                            if(mae_data[i] < MINACCURACY){
                                MyData.push(mae_data[i]);
                            }
                            else {
                                item = {
                                    value: mae_data[i],
                                    itemStyle: {
                                        color: '#DC143C'
                                    }
                                }
                                MyData.push(item);
                            }
                        }
                    }
                    return MyData;
                }()
            }
            Myseries.push(item_mae);

            let item_mape = {
                name: 'MAPE',
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: '#FF8C00'
                    }
                },
                data: function() {
                    let MyData = new Array();
                    if(line_highlight != 1){
                        for(let i=0; i<mape_data.length; i++){
                            if(i != pointid){
                                MyData.push(mape_data[i]);
                            }
                            else {
                                let item = {
                                    value: mape_data[i],
                                    itemStyle: {
                                        color: '#FFD700'
                                    }
                                }
                                MyData.push(item);
                            }
                        }
                    }
                    else {
                        for(i=0; i<mape_data.length; i++){
                            if(mape_data[i] < MINACCURACY){
                                MyData.push(mape_data[i]);
                            }
                            else {
                                item = {
                                    value: mape_data[i],
                                    itemStyle: {
                                        color: '#DC143C'
                                    }
                                }
                                MyData.push(item);
                            }
                        }
                    }
                    return MyData;
                }()
            }
            Myseries.push(item_mape);
            return Myseries;
        }(),
        dataZoom: [
            {
                type: 'slider',
                show: true,
                xAxisIndex: 0,
                //filterMode: 'empty',   //这句话加上的话，不会随着数据改变轴
                startValue: 0,
                endValue: 30,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                height: 20,
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            },
            {
                type: 'inside',
                show: true,
                xAxisIndex: 0,
            },
            {
                type: 'slider',
                yAxisIndex: 0,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                width: 20,
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }
        ]
    };

    return option;
}

function createRMSEDistributionoption(methodid, pointMetricRange){

    let x_data = pointMetricRange[methodid]['interval_name'];

    let y_data = [];
    for(let i = 0; i < interval_num; i++) {
        y_data.push(pointMetricRange[methodid][i]);
    }

    let option = {
        legend : {
            left: '2%',
            top: '5%',
            textStyle:{color:'#fff'}
        },
        xAxis: {
            type: 'category',
            data: x_data,
            axisLabel: {
                color: '#fff',
                interval: 0,
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#fff'
            }
        },
        tooltip: {
            show: true,
            trigger: 'axis'
        },
        series: {
            name: 'point amount',
            type: 'bar',
            itemStyle: {
                normal: {
                    color: '#FFB6C1'
                }
            },
            data: y_data
        },
        dataZoom: {
            type: 'slider',
            show: true,
            start: 0,
            end: 70,
            height: 20,
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            }
        }
    };

    return option;
}

/*draw*/
function drawline(option, id){

    var myChart = echarts.init(document.getElementById(id));
    myChart.clear();
    myChart.setOption(option);
    myChart.on('datazoom', function (params) {

        let startValue = myChart.getOption().dataZoom[1].startValue;
        let endValue = myChart.getOption().dataZoom[1].endValue;

        const Gap = 1000*60*now_Timefitness;
        var Origin_endDate = TimeRange[2];

        var now = new Date(Origin_endDate-Gap*(TimeArrayLength-startValue));
        var nowend = new Date(Origin_endDate-Gap*(TimeArrayLength-endValue));

        var start_year = now.getFullYear().toString();
        var start_month = (now.getMonth()+1).toString();
        var start_day = now.getDate().toString();
        var start_hour = now.getHours().toString();
        var start_minute = now.getMinutes().toString();

        if(now.getMonth()+1 < 10){start_month = '0' + start_month;}
        if(now.getDate() < 10){start_day = '0' + start_day;}
        if(now.getHours() < 10){start_hour = '0' + start_hour;}
        if(now.getMinutes() < 10){start_minute = '0' + start_minute;}

        var now_time = start_year + '-' + start_month + '-' + start_day + 'T' + start_hour + ':' + start_minute + ':00';
        document.getElementById('starttime').value = now_time;

        var end_year = nowend.getFullYear().toString();
        var end_month = (nowend.getMonth()+1).toString();
        var end_day = nowend.getDate().toString();
        var end_hour = nowend.getHours().toString();
        var end_minute = nowend.getMinutes().toString();

        if(nowend.getMonth()+1 < 10){end_month = '0' + end_month;}
        if(nowend.getDate() < 10){end_day = '0' + end_day;}
        if(nowend.getHours() < 10){end_hour = '0' + end_hour;}
        if(nowend.getMinutes() < 10){end_minute = '0' + end_minute;}

        var nowend_time = end_year + '-' + end_month + '-' + end_day + 'T' + end_hour + ':' + end_minute + ':00';
        document.getElementById('endtime').value = nowend_time;

        StartInd = startValue;
        EndInd = endValue;
    });

}

function drawhistogram(option, id){
    let myChart = echarts.init(document.getElementById(id));
    myChart.clear();
    myChart.setOption(option);
    window.addEventListener("resize",function(){
        myChart.resize();
    });
    myChart.on('click', function (params) {
        pointID = params.name;
        console.log("====test=====")
        console.log("test id:", params.name);

        /*作图*/
        pointName = data['Node']['StationInfo'][pointID][4]
        // document.getElementById('points').value = pointID;
        document.getElementById('uv_name').innerText = pointName;
        document.getElementById('line_graph').innerText = 'Groundtruth and Prediction (' + pointName + ')'

        let Initoption = createoption(data,Number(pointID),StartInd,EndInd,MethodID);
        drawline(Initoption, 'container_line');

        /*在地图上标记出该点*/
        if(FilterInvalidNodeFlag == 0){
            // 过滤无效点开关关闭
            InitMapoption = createMapOption(data,data['Node']['StationInfo'],StationIndArr,pointID);
            drawmap(InitMapoption);
        }
        else if(FilterInvalidNodeFlag == 1){
            // 过滤无效点开关打开
            InitMapoption = createMapOption(data,FilterInvalidNodeInfo,InvalidNodeIndArr,pointID);
            drawmap(InitMapoption);
        }
    });
}