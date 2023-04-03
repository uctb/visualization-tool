import {drawMap, drawLine} from './draw'
import {bpp} from './SelectModel'

    /* 初次选定数据集时执行：先清空，再赋值 */
    export function ClearDataSet()
    {
        DatasetList.splice(0,DatasetList.length);
        document.getElementById('Dataset').options.length = 0;
        DatasetID = 0;
        ClearModelList()
        
    }
    export function ClearModelList()
    {
        bpp.model_list.splice(0,bpp.model_list.length);
    }
    export function StartDataSet()
    {
        /*增加子数据集作为options*/
        var i = 0;

        for (x in DatasetList)
        {
            var dataset_information_list = DatasetList[x].split('_');
            var closeness = dataset_information_list[3];
            var period = dataset_information_list[4];
            var trend = dataset_information_list[5];
            var OptionName = 'closeness=' + closeness + ' period=' + period + ' trend=' + trend;
            document.getElementById('Dataset').options.add(new Option(OptionName, i++));
        }

        FinishDataSet();
    }

    /* 该函数在选定数据集时执行（无论是刚读入文件，还是手动修改数据集，都会执行） */
    export function FinishDataSet()
    {
        console.log("==========new dataset!=============")
        /* 将StartIndex，EndIndex归零 */
        StartInd = -1;
        EndInd = -1;

        /* 将过滤开关都关闭 */
        FilterInvalidNodeFlag = 0;

        /* 确定数据集以后，先读出其中的方法数 */
        console.log("now_data:", data);
        console.log("now_DatasetList:", DatasetList);
        console.log("now_DatasetID:", DatasetID);
        console.log("now_DatasetName:", DatasetList[DatasetID]);
        FunctionNum = Object.getOwnPropertyNames(data['Pred'][DatasetList[DatasetID]]).length;
        
        /* 修改数据集后，让地图点的选择先归0 */
        pointID = 0;
        // document.getElementById('points').value = pointID;

        /* 读取Dataset的名称里的信息，把各项分开以后处理 */
        var dataset_name = DatasetList[DatasetID];
        var dataset_information_list = dataset_name.split('_');

        /* 获得该数据集中有效节点个数，以及相应的时间节点数 */
        var tmp = data.Pred[dataset_name];
        var TimeNum = tmp.GroundTruth.length;  // 真实值包括了多少个时间点。
        VaildPointNum = tmp.GroundTruth[0].length;
        TimeArrayLength = TimeNum;  // 标记当前选择的数据集中，每个数据点，其对应的时间节点有多少个
        TotalPointNum = data['Node']['StationInfo'].length;
        StationIndArr = [];
        for (let i=0; i<TotalPointNum; i++){
            StationIndArr.push(i);
        }

        console.log("now_ValidPointNum:", VaildPointNum);
        console.log("now_TimeArrayLength:", TimeArrayLength);
        console.log("now_StationIndArr:", StationIndArr);


        /* 读取出数据集使用部分的参数，若不是all的话，进行截取 */
        if(dataset_information_list[0] != 'all') {
            portion_index = parseFloat(dataset_information_list[1]);
        }

        /* 读取最后一个参数，判断是节点型还是网格型(网格型暂时不处理) */
        datatype_index = dataset_information_list[7];
        if(datatype_index == 'G') {
            windows.alert("Grid Data is not available now.");
            return;
        }

        /* 读取小数据集的时间粒度和时间范围 */
        now_Timefitness = parseInt(dataset_information_list[6]);


        /*获得所有方法的数组*/
        var k = 0;
        var Mydata = data.Pred[dataset_name];
        for(let method in Mydata){
            if(method == "GroundTruth") continue;
            else {
                MethodNameArray[k] = method;
                bpp.model_list.push(new function(name,index)
                {
                    this.name = name;
                    this.id = index;
                }(method,k))
                k++;
            }
           
        }
        console.log("methodNameArray:", MethodNameArray);

        /* 修改模型误差值 */
        GetModelError();
        ChangeModelError();

        /* 获取Date类型的TimeRange，第三个元素为TimeRange的后一天 这部分好像没用了？*/
        var origin_begin = data.TimeRange[0];
        var origin_end = data.TimeRange[1];

        var origin_beginyear = Number(origin_begin.substring(0,4));
        var origin_beginmonth = Number(origin_begin.substring(5,7));
        var origin_beginday = Number(origin_begin.substring(8,10));

        var origin_endyear = Number(origin_end.substring(0,4));
        var origin_endmonth = Number(origin_end.substring(5,7));
        var origin_endday = Number(origin_end.substring(8,10));

        var Origin_beginDate = new Date(origin_beginyear,origin_beginmonth-1,origin_beginday);
        var Origin_endDate = new Date(origin_endyear,origin_endmonth-1,origin_endday);
        var EndDate = new Date(origin_endyear,origin_endmonth-1,origin_endday+1);

        TimeRange = [];
        TimeRange.push(Origin_beginDate)
        TimeRange.push(Origin_endDate)
        TimeRange.push(EndDate)
        console.log("Time Range is", TimeRange);

        /*获得一些全局变量*/
        getTimeSlots();
        getMetricsRankList();
        getRelativeError();
        FindMarkArea(2);
        getSortedBadCaseNum();
        getPointTimeBadCase();
        getMetricsDistribution();

        /*修改右上日期控件的起止时间*/
        document.getElementById("starttime").value = TimeSlots[0];
        document.getElementById("endtime").value = TimeSlots[TimeArrayLength-1];

        /* 处理完成，作图 */
        drawMap();
        drawLine();
    }

    export function ChangeDataSet(str)
    {
        DatasetID = str;
        FinishDataSet();
    }

    /* 计算模型整体误差 */
    export function GetModelError() {
        console.log("======Calculate Model Error========")
        // i-子数据集 j-模型 k-时间片 m-区域
        for(let i=0; i<DatasetList.length; i++) {
            let datasetName = DatasetList[i];
            ModelMetrics[datasetName] = {};
            let groundtruth = data['Pred'][datasetName]['GroundTruth'];
            for(let methodName in data['Pred'][datasetName]) {
                if(methodName == "GroundTruth"){
                    continue;
                }
                else {
                    let prediction = data['Pred'][datasetName][methodName]['TrafficNode'];
                    let total_rmse_variance = 0;
                    let total_absolute_error = 0;
                    let total_mape_variance = 0;
                    let num = 0;
                    for(let k=0; k<TimeArrayLength; k++) {
                        for(let m=0; m<VaildPointNum; m++) {
                            // let real_node_id = data['Pred'][datasetName][methodName]['traffic_data_index'][m];
                            total_rmse_variance += Math.pow(Math.abs(prediction[k][m] - groundtruth[k][m]), 2);
                            total_absolute_error += Math.abs(prediction[k][m] - groundtruth[k][m]);
                            // 如果真实值为0，则MAPE为infinity，因此把真实值为0的去掉
                            if (groundtruth[k][m] !== 0) {
                                num ++;
                                total_mape_variance += Math.abs((prediction[k][m] - groundtruth[k][m]) / groundtruth[k][m])
                            }
                        }
                    }
                    let RMSE = Math.sqrt(total_rmse_variance / (TimeArrayLength * VaildPointNum));
                    let MAE = total_absolute_error / (TimeArrayLength * VaildPointNum);
                    let MAPE = (total_mape_variance / num) * 100;
                    if(isNaN(MAPE)){
                        MAPE = 'NAN';
                    }
                    console.log("rmse, mae, mape is:", RMSE, MAE, MAPE);
                    ModelMetrics[datasetName][methodName] = {'rmse': RMSE.toFixed(2), 'mae': MAE.toFixed(2), 'mape': MAPE.toFixed(2)};
                }
            }
        }
        console.log("Model Metrics:", ModelMetrics);
    }

    /* 修改并体现模型误差 */
    export function ChangeModelError() {
        console.log("======Change Model Error========")
        let rmse = ModelMetrics[DatasetList[DatasetID]][MethodNameArray[MethodID]]['rmse'];
        let mae = ModelMetrics[DatasetList[DatasetID]][MethodNameArray[MethodID]]['mae'];
        let mape = ModelMetrics[DatasetList[DatasetID]][MethodNameArray[MethodID]]['mape'];
        // let datasetName = DatasetList[DatasetID];
        // let methodName = MethodNameArray[MethodID];
        //
        // if ('rmse' in data['Pred'][datasetName][methodName]){
        //     rmse = parseFloat(data['Pred'][datasetName][methodName]['rmse']).toFixed(2)
        // }
        // else{
        //     rmse = 'NaN'
        // }
        // if ('mape' in data['Pred'][datasetName][methodName]){
        //     mape = parseFloat(data['Pred'][datasetName][methodName]['mape']).toFixed(2)
        // }
        // else{
        //     mape = 'NaN'
        // }
        // if ('mae' in data['Pred'][datasetName][methodName]){
        //     mae = parseFloat(data['Pred'][datasetName][methodName]['mae']).toFixed(2)
        // }
        // else{
        //     mae = 'NaN'
        // }
        document.getElementById('rmse').innerText = rmse;
        document.getElementById('mape').innerText = mape;
        document.getElementById('mae').innerText = mae;
    }

    /*获得折线图的时间片*/
    export function getTimeSlots() {

        TimeSlots = [];
        let DatasetName = DatasetList[DatasetID];
        let TimeNum = data['Pred'][DatasetName]['GroundTruth'].length;

        const Gap = 1000*60*now_Timefitness; // 将timefitness转化为ms
        let EndDate = +TimeRange[2]

        for (let i = TimeNum - 1; i >= 0; i--) {
            let now = new Date(EndDate - (TimeNum - i)*Gap);
            // TimeSlots[i] = [now.getFullYear(),now.getMonth()+1,now.getDate()].join('/') +' '+[now.getHours(),now.getMinutes()].join(':');
            TimeSlots[i] = [now.getFullYear(),add0(now.getMonth()+1),add0(now.getDate())].join('-') +' '+[add0(now.getHours()),add0(now.getMinutes())].join(':');
        }
        console.log("TimeSlots is:", TimeSlots);
    }

    /*get relative error*/
    export function getRelativeError() {

        // 获得每种方法下每个区域（有效点）在各时间点上的相对误差

        let DatasetName = DatasetList[DatasetID];
        let Mydata = data['Pred'][DatasetName];

        let k = 0;

        // 对每个方法
        for (let method in Mydata)
        {
            if (method === "GroundTruth") continue;
            else {
                Point_Timeslots_error[k] = [];
                // 对每个有效点
                for (let i = 0; i < VaildPointNum; i++) {
                    let DictVar = {};  // 存放方法k中站点i在不同时间片的relative error
                    // 注意：这里的i不等同于编号，而是对应有效点。这样才能覆盖所有有效点。
                    DictVar['index'] = Mydata[method]['traffic_data_index'][i];
                    DictVar['re'] = [];
                    for (let j = 0; j < TimeArrayLength; j++) {
                        // k - 方法， i - 地图点， j - 时间点
                        let ground_truth = Mydata['GroundTruth'][j][i];
                        let prediction = Mydata[method]['TrafficNode'][j][i];
                        let re = Math.abs(prediction - ground_truth) / ground_truth;
                        DictVar['re'].push(re);
                    }
                    Point_Timeslots_error[k][i] = DictVar;
                }
                k++;
            }
        }
        console.log("the relative error of each point:", Point_Timeslots_error);
    }

    /*计算mark_area*/
    export function FindMarkArea(std_num=3) {

        let start_time = '';
        let end_time = '';

        console.log("find mark area!")

        //对每个方法
        for (let index = 0; index < MethodNameArray.length; index++) {

            markArea[index] = [];
            global_error_list[index] = [];

            // 对每个有效点
            for (let i = 0; i < VaildPointNum; i++) {

                // 对每一个有效点，count从0开始计数
                let count = 0;
                markArea[index][i] = [];

                let error_time_list = Point_Timeslots_error[index][i]; // Point_Timeslots_error[MethodID] shape is [ValidPointNum,TimeArrayLength]

                // 求该区域（有效点）的global error
                // 将各时间点的相对误差的平均数作为global error（判定标准），后续可以改为更有效的判定方式；并且计算平均值时跳过那些误差为infinity的时间点
                let error_time_sum = 0;
                for(let k = 0; k < TimeArrayLength; k++){
                    let error =  error_time_list['re'][k];
                    if(isFinite(error)){
                        error_time_sum = error_time_sum + error_time_list['re'][k];
                    }
                }
                let global_error = error_time_sum / TimeArrayLength;
                global_error_list[index].push(global_error);

                // 求该区域的mark_Area
                for (let j = 0; j < TimeArrayLength; j++) {
                    let error = error_time_list['re'][j];
                    if (error > global_error || error === Infinity) {

                        if (count === 0) {
                            count ++;
                            start_time = TimeSlots[j];
                            // console.log("start time is ", start_time);
                        }
                        else {
                            count ++;
                        }
                    }
                    else {
                        if (count >= std_num) {
                            end_time = TimeSlots[j];
                            // console.log("end time is ", end_time);
                            count = 0;
                            markArea[index][i].push([{'xAxis': start_time, 'itemStyle': {'color': 'red', 'opacity': 0.3}},
                                {'xAxis': end_time}]);
                            // markArea[i].push([{'xAxis': start_time}, {'xAxis': end_time}]);
                        }
                        else if(count > 0 && count < std_num) {
                            count = 0;
                        }
                    }
                }
                // 最后一个时间片若满足mark_area也应该加入列表中
                if (count > std_num) {
                    end_time = TimeSlots[TimeArrayLength-1];
                    // console.log("end time is ", end_time);
                    markArea[index][i].push([{'xAxis': start_time, 'itemStyle': {'color': 'yellow', 'opacity': 0.3}},
                        {'xAxis': end_time}]);
                    count = 0;
                }
            }
        }
        console.log("global error list is:", global_error_list);
        console.log("markArea is:", markArea);
    }

    /*获得降序排列的各区域Bad Case个数*/
    export function getSortedBadCaseNum() {

        let PointBadCaseNum = {};

        for (let k=0; k < MethodNameArray.length; k++) {
            PointBadCaseNum[k] = [];
            for (let j=0; j < VaildPointNum; j++) {
                let TmpDict = {}
                TmpDict['index'] = j;
                TmpDict['BadCaseNum'] = markArea[k][j].length;
                PointBadCaseNum[k][j] = TmpDict;
            }
            PointSortedBadCaseNum[k] = PointBadCaseNum[k].sort((a, b) => a.BadCaseNum > b.BadCaseNum ? -1 : a.BadCaseNum < b.BadCaseNum ? 1 : 0);
        }
        console.log("After sort, PointBadCaseNum:", PointSortedBadCaseNum);
    }

    /*获得各时间片在各区域预测值相对误差大于平均值的个数*/
    export function getPointTimeBadCase() {

        /*初始化PointTimeBadCase*/
        // 对每个方法
        for (let i=0; i < MethodNameArray.length; i++) {
            PointTimeBadCase[i] = {};
            // 对每个时间片
            for (let index = 0; index < TimeArrayLength; index++) {
                let time = TimeSlots[index];
                PointTimeBadCase[i][time] = 0;
            }
        }

        /*求PointTimeBadCase*/
        // 对每个方法
        for (let i=0; i < MethodNameArray.length; i++) {
            // 对每个区域
            for (let j=0; j < VaildPointNum; j++) {
                let error_list = Point_Timeslots_error[i][j]['re'];
                let global_error = global_error_list[i][j];
                // 对每个时间片
                for (let k=0; k < TimeArrayLength; k++) {
                    let error = error_list[k];
                    let time = TimeSlots[k];
                    if (error > global_error || error === Infinity) {
                        PointTimeBadCase[i][time] = PointTimeBadCase[i][time] + 1;
                    }
                }
            }
        }
        console.log("PointTimeBadCase is:", PointTimeBadCase);
    }

    /*获得降序排列的各站点的RMSE,MAE,MAPE*/
    export function getMetricsRankList() {

        let DatasetName = DatasetList[DatasetID];
        let Mydata = data['Pred'][DatasetName];

        let k = 0;

        for (let method in Mydata)
        {
            if (method === "GroundTruth")
                continue;
            else {

                // PointMetrics[k] = [];
                PointSortedRMSE[k] = [];
                PointSortedMAE[k] = [];
                PointSortedMAPE[k] = [];

                for (let i = 0; i < VaildPointNum; i++) {

                    let DictVar_rmse = {};
                    let DictVar_mae = {};
                    let DictVar_mape = {};
                    // let real_node_id = Mydata[method]['traffic_data_index'][i]; // 注意：这里的i不等同于编号，而是对应有效点。这样才能覆盖所有有效点。
                    let real_node_id = i;

                    let total_rmse_variance = 0;
                    let total_absolute_error = 0;
                    let total_mape_variance = 0;
                    let num = 0;
                    for (let j = 0; j < TimeArrayLength; j++) {

                        // k - 方法， i - 地图点， j - 时间点
                        let ground_truth = Mydata['GroundTruth'][j][real_node_id];
                        total_rmse_variance += Math.pow(Math.abs(Mydata[method]['TrafficNode'][j][real_node_id] - ground_truth), 2);
                        total_absolute_error += Math.abs(Mydata[method]['TrafficNode'][j][real_node_id] - ground_truth);
                        // 如果真实值为0，则MAPE为infinity，因此把真实值为0的去掉
                        if (ground_truth !== 0) {
                            num ++;
                            total_mape_variance += Math.abs((Mydata[method]['TrafficNode'][j][real_node_id] - ground_truth) / ground_truth)
                        }
                    }

                    // 求RMSE，MAE(平均绝对误差)，MAPE(平均绝对百分比误差)
                    let RMSE = Math.sqrt(total_rmse_variance / TimeArrayLength);
                    let MAE = total_absolute_error / TimeArrayLength;
                    let MAPE = (total_mape_variance / num) * 100;
                    if(isNaN(MAPE)){
                        MAPE = 0;
                    }

                    // 把每个站点的index和rmse值存入字典
                    DictVar_rmse['index'] = real_node_id;
                    DictVar_rmse['rmse'] = RMSE;
                    DictVar_mae['mae'] = MAE;
                    DictVar_mape['mape'] = MAPE;

                    PointSortedRMSE[k][i] = DictVar_rmse;
                    PointSortedMAE[k][i] = DictVar_mae;
                    PointSortedMAPE[k][i] = DictVar_mape;

                    if (k === 0 || PointMinRMSE[i] >= RMSE)      // 第一种方法，就直接存了
                    {
                        PointMinRMSE[i] = RMSE;
                    }
                }

                // 对RMSE,MAE,MAPE数组降序排列
                PointSortedRMSE[k].sort((a, b) => a.rmse > b.rmse ? -1 : a.rmse < b.rmse ? 1 : 0);
                PointSortedMAE[k].sort((a, b) => a.mae > b.mae ? -1 : a.mae < b.mae ? 1 : 0);
                PointSortedMAPE[k].sort((a, b) => a.mape > b.mape ? -1 : a.mape < b.mape ? 1 : 0);

                k++;
            }
        }
        console.log("=========Sorted Metrics List as follows============")
        console.log("sorted RMSE:", PointSortedRMSE);
        console.log("sorted MAE:", PointSortedMAE);
        console.log("sorted MAPE:", PointSortedMAPE);
        console.log("===================================================")
    }

    /*获得RMSE、MAE、MAPE分布情况*/
    export function getMetricsRange(left, interval_num, interval) {
        let tmp = {};
        let interval_point = [];
        let interval_name = [];
        let right = left + interval;
        for (let i = 0; i < interval_num; i++) {

            interval_point.push(left);

            right = left + interval;
            let range = left.toFixed(0) + ' ~ ' + right.toFixed(0);
            interval_name.push(range);

            tmp[i] = 0;

            left = right;
        }
        interval_point.push(left);
        tmp['interval_point'] = interval_point;
        tmp['interval_name'] = interval_name;
        return tmp;
    }
    export function getIntervalID(interval_list, interval_num, metric) {
        if(metric === interval_list[interval_num]) {
            return interval_num-1;
        }
        for (let i = 1; i < interval_num+1; i++) {
            if (metric < interval_list[i] && metric >= interval_list[i-1]) {
                return i-1;
            }
        }
    }
    export function getMetricsDistribution() {

        // 对每种方法
        for(let i = 0; i < MethodNameArray.length; i++) {

            // rmse
            let max_rmse = PointSortedRMSE[i][0]['rmse'];
            let min_rmse = PointSortedRMSE[i][VaildPointNum - 1]['rmse'];
            let interval_rmse = (max_rmse - min_rmse) / interval_num;
            // mae
            let max_mae = PointSortedMAE[i][0]['mae'];
            let min_mae = PointSortedMAE[i][VaildPointNum - 1]['mae']
            let interval_mae = (max_mae - min_mae) / interval_num;
            //mape
            let max_mape = PointSortedMAPE[i][0]['mape'];
            let min_mape = PointSortedMAPE[i][VaildPointNum - 1]['mape']
            let interval_mape = (max_mape - min_mape) / interval_num;

            PointRMSERange[i] = getMetricsRange(min_rmse, interval_num, interval_rmse);
            PointMAERange[i] = getMetricsRange(min_mae, interval_num, interval_mae);
            PointMAPERange[i] = getMetricsRange(min_mape, interval_num, interval_mape);

            for (let j = 0; j < VaildPointNum; j++) {
                let rmse = PointSortedRMSE[i][j]['rmse'];
                let mae = PointSortedMAE[i][j]['mae'];
                let mape = PointSortedMAPE[i][j]['mape'];

                let rmse_id = getIntervalID(PointRMSERange[i]['interval_point'], interval_num, rmse);
                let mae_id = getIntervalID(PointMAERange[i]['interval_point'], interval_num, mae);
                let mape_id = getIntervalID(PointMAPERange[i]['interval_point'], interval_num, mape);

                // console.log("rmse:", rmse);
                // console.log("rmse_id:", rmse_id);

                PointRMSERange[i][rmse_id]++;
                PointMAERange[i][mae_id]++;
                PointMAPERange[i][mape_id]++;
            }
        }

        console.log("========Point Metrics Range=========");
        console.log("PointRMSERange:", PointRMSERange);
        console.log("PointMAERange:", PointMAERange);
        console.log("PointMAPERange:", PointMAPERange);
        console.log("====================================");
    }

    export function FinishMethod() {

        /*修改模型误差值*/
        ChangeModelError();

        /*默认过滤开关都关闭*/
        FilterInvalidNodeFlag = 0;

        /* 处理完成，作图 */
        drawMap();
        drawLine();
    }

    export function ChangeMethod(str){
        MethodID = str;
        FinishMethod();
    }

    export function SetStandard()
    {
        MINACCURACY = parseFloat(document.getElementById('standard').value);

        drawMap();

        /*error折线图*/
        let RMSE_option = createMetricsoption(MethodID,pointID);
        drawhistogram(RMSE_option, 'rmseline2');
    }

    export function SetREStandard()
    {
        MAXError = parseFloat(document.getElementById('re_standard').value)*0.01;

        let Initoption = createoption(data,pointID,StartInd,EndInd);
        drawline(Initoption, 'container_line');
    }

    /* 修改pointID/点击地图上的point时 */
    export function FinishPointSelect()
    {
        pointID = parseInt(document.getElementById('points').value);

        /*作图*/
        drawMap();
        drawLine();
    }

    /*获得当前point对应的有效ID*/
    /*FinishPointSelect里用到了*/
    export function FindRealNodeID(point_id)
    {
        let index_array = [];
        for(x in data.Pred[DatasetList[DatasetID]])
        {
            if(x != "GroundTruth")
            {
                index_array = data.Pred[DatasetList[DatasetID]][x].traffic_data_index;
                break;
            }
        }
        return index_array.indexOf(point_id);
    }


// 程序：日期栏初始化与手动设置日期（开始日期）

/* 这是给日期区域赋值的程序，读取了文件以后才会调用 */

    export function ChangeFinish()
    {

        let start_time = document.getElementById("starttime").value;
        let end_time = document.getElementById("endtime").value;
        console.log("start_time:", start_time);

        var Year = start_time.substr(0,4);
        var Month = start_time.substr(5,2);
        var Day = start_time.substr(8,2);
        var Hour = start_time.substr(11,2);
        var Minute = start_time.substr(14,2);


        var end_Year = end_time.substr(0,4);
        var end_Month = end_time.substr(5,2);
        var end_Day = end_time.substr(8,2);
        var end_Hour = end_time.substr(11,2);
        var end_Minute = end_time.substr(14,2);

        /* 处理下这个数值 */

        const Gap = 1000*60*now_Timefitness;
        var Origin_endDate = TimeRange[2];

        var NowDate = new Date(Year,Month-1,Day,Hour,Minute);
        var NowEndDate = new Date(end_Year,end_Month-1,end_Day,end_Hour,end_Minute);

        StartInd = TimeArrayLength - ((Origin_endDate - NowDate)/ Gap);
        EndInd = TimeArrayLength - (Origin_endDate - NowEndDate)/ Gap;

        //在这里，修改起始值。另外一个就是修改结束值。
        if (StartInd > EndInd && EndInd != -1) window.alert("Error 01: Wrong time selected, please choose a correct time!");
        else
        {
            let ChangeDatazoomOption = createoption(data,pointID,StartInd,EndInd);
            drawline(ChangeDatazoomOption, 'container_line');
        }
    }

    export function writeDay(n)   //据条件写日期的下拉框
    {   
            var e = document.reg_testdate.DD; optionsClear(e);   
            for (var i=1; i<(n+1); i++)   
                e.options.add(new Option(" "+ i + "D", i));   
    }   
    
    export function IsPinYear(year)//判断是否闰平年
    {     return(0 == year%4 && (year%100 !=0 || year%400 == 0));}   
    
    export function optionsClear(e)
    {
        e.options.length = 1;
    }

    export function add0(m){return m<10?'0'+m:m}

    /* 过滤无效点 */
    export function RemovePointOfStationInfo() {
        console.log("=======Filter Test!!========")
        FilterInvalidNodeInfo = [];
        InvalidNodeIndArr = [];
        for(let i=0; i<TotalPointNum; i++) {
            // let isFilter = 0;
            // 过滤UCTB中判定为无效点的点
            let real_id = FindRealNodeID(i);
            if(real_id != -1){
                // isFilter = 1;
                FilterInvalidNodeInfo.push(data['Node']['StationInfo'][i]);
                InvalidNodeIndArr.push(i);
            }
            // 过滤x%时间片的真实值为零的点
            // let count = 0;   // 统计groundtruth非零时间片个数
            // for(let j=0; j<TimeArrayLength; j++){
            //     let groundtruth = data['Pred'][[DatasetList[DatasetID]]]['GroundTruth'][j][i];
            //     if(groundtruth != 0){
            //         count ++;
            //     }
            // }
            // if(count >= InvalidNodeStd*TimeArrayLength){
            //     isFilter = 1;
            //     // if(InvalidNodeIndArr.indexOf(i) == -1){
            //     //     FilterInvalidNodeInfo.push(data['Node']['StationInfo'][i]);
            //     //     InvalidNodeIndArr.push(i);
            //     // }
            // }
            // if(isFilter == 1){
            //     FilterInvalidNodeInfo.push(data['Node']['StationInfo'][i]);
            //     InvalidNodeIndArr.push(i);
            // }
        }
        console.log("filter node index", InvalidNodeIndArr);
        console.log("filter node info", FilterInvalidNodeInfo);
    }
