import { log } from '@tensorflow/tfjs';
import InputProcessor from './InputProcessor.js'
import ComputeTool from './function.js'
export default class Model {
    constructor() {
        this.ip = new InputProcessor();
        this.ct = new ComputeTool();
        this.station_lats = [];
        this.station_lngs = [];
        this.mae_for_each_station = [];
        this.temp_bad_case_param = null;
        this.st_raster_gt = null;
        this.st_raster_pred = null;
        this.station_info = [];
        this.graph = [];
        this.ts_flag = false;
    }

    /*
    TODO: 1.实现SpatialBadCaseLocateModel、TemporalBadCaseLocateModel、InfoProcessModel；2.思考更新输入文件怎么办
    UPDATE: (by hyy) 新增了计算diff序列和badcase
    UPDATE: (by xxh) 在testupdate新增了stationinfo文件的判断
    */
    update(pred,gt,station_info,graph){
        this.st_raster_gt = gt;
        this.st_raster_pred = pred;
        this.station_info = station_info;
        this.graph = graph;
        this.time_length = this.st_raster_gt[0].length;
        this.station_num = this.st_raster_gt.length;
        this.invalid_station_index = new Array();

        console.log("time length is:" ,this.time_length)

        // 求无效点的索引序列
        for (let i=0; i<this.station_num; i++) {
            let flag = false;
            if (this.ct.calculateMean(this.st_raster_gt[i]) === 0) {
                flag = true;
            }
            for (let j=0; j<this.time_length; j++) {
                if (isNaN(this.st_raster_gt[i][j]) || !isFinite(this.st_raster_gt[i][j])){
                    flag = true;
                }
            }
            if (flag) {
                this.invalid_station_index.push(i);
            }
        }
        console.log("invalid_station_index:", this.invalid_station_index)

        // 求各种error
        var station_lats = new Array(this.station_num);
        var station_lngs = new Array(this.station_num);
        let error_matrix = new Array(this.time_length);
        let mae_for_each_station = new Array(this.station_num);
        let rmse_for_each_station = new Array(this.station_num);
        let mre_for_each_station = new Array(this.station_num);
        let mre_for_filter_station = new Array(this.station_num-this.invalid_station_index.length);
        let st_raster_diff = new Array(this.station_num);  
        let st_raster_re = new Array(this.station_num);  // 相对误差
        let st_raster_re_filter = new Array(this.station_num-this.invalid_station_index.length)

        //TODO: 下面内容可以封装成函数
        for (var i = 0; i < this.station_num; i++) {
            // 判断是否传入StatinInfo文件
            if(this.station_info.length!=0){
                station_lats[i] = this.station_info[i][0];
                station_lngs[i] = this.station_info[i][1];
            }
            var tmp_mae = 0;
            error_matrix[i] = new Array(this.time_length);
            st_raster_diff[i] = [];
            st_raster_re[i] = [];
            st_raster_re_filter[i] = [];
            // 计算相对误差&绝对误差
            for (var j = 0; j < this.time_length; j++) {
                error_matrix[i][j] = this.st_raster_pred[i][j] - this.st_raster_gt[i][j];
                tmp_mae += Math.abs(error_matrix[i][j]);
                st_raster_diff[i].push(this.st_raster_pred[i][j] - this.st_raster_gt[i][j]);
                st_raster_re[i].push(Math.abs(this.st_raster_pred[i][j] - this.st_raster_gt[i][j]) / this.st_raster_gt[i][j]);
            }
            mae_for_each_station[i] = tmp_mae / this.station_num;
            rmse_for_each_station[i] = this.ct.calculate_local_rmse(this.st_raster_pred[i], this.st_raster_gt[i]);
            mre_for_each_station[i] = this.ct.calculateMean(st_raster_re[i]);
            if (!this.invalid_station_index.includes(i)) {
                for (var k = 0; k < this.time_length; k++) {
                    st_raster_re_filter[i].push(Math.abs(this.st_raster_pred[i][k] - this.st_raster_gt[i][k]) / this.st_raster_gt[i][k]);
                }
            }
            mre_for_filter_station[i] = this.ct.calculateMean(st_raster_re_filter[i]);
        }

        if(this.station_info.length!=0){
            this.station_lats = station_lats;
            this.station_lngs = station_lngs;
        }
        this.error_matrix = error_matrix;
        this.mae_for_each_station = mae_for_each_station;
        this.rmse_for_each_station = rmse_for_each_station;
        this.mre_for_each_station = mre_for_each_station;
        this.mre_for_filter_station = mre_for_filter_station;
        this.st_raster_diff = st_raster_diff;
        this.st_raster_re = st_raster_re;

        console.log("mae for each station", this.mae_for_each_station);
        console.log("rmse for each station:", this.rmse_for_each_station);
        console.log("mre for each station:", this.mre_for_each_station);
        console.log("mre for filter station:", this.mre_for_filter_station)
        console.log("time length is :", this.time_length)

        // 求各种需要的统计量
        this.emitModelError();
        this.emitBadCase();  // 定位bad case
        this.emitMetricsRankList();   // metric降序排列
        this.emitMetricDistribution();  // metric分布
        this.emitMeanGTDistribution(15);  // 站点属性分布+spatial bad case的分布

        // 判断是否设置时间
        if (this.ts_flag) {
            // 判断时间设置得是否准确
            if (this.time_length != this.ts.length) {
                console.log("time range fail!")
                console.log(this.time_length)
                console.log(this.ts.length)
                alert("Time Range or Time fitness is false! Please select again.");
            } else {
                // 求分布统计量
                this.emitTimeCharacteristicsDistribution();  // 时间特性的分布
                this.emitBadcaseDistributionRules();  // 时间bad case的分布

                // 绘图
                // 时间特性绘图
                this.getTimeStatisticsDistributionParam();
                this.getBadcaseDistributionRulesParam(0);  // 时间bad case分布绘图

            }
        }
        else {
            this.ts = this.ct.range(0, this.time_length, 1);
        }
    }

    testupdate() {

        console.log("======test update!========")

        this.st_raster_gt = this.ip.gt_st_raster;
        this.st_raster_pred = this.ip.pred_st_raster;
        this.station_info = this.ip.station_info;
        this.graph = this.ip.graph;
        this.time_length = this.st_raster_gt[0].length;
        this.station_num = this.st_raster_gt.length;
        this.invalid_station_index = new Array();

        console.log("time length is:" ,this.time_length)

        // 求无效点的索引序列
        for (let i=0; i<this.station_num; i++) {
            let flag = false;
            if (this.ct.calculateMean(this.st_raster_gt[i]) === 0) {
                flag = true;
            }
            for (let j=0; j<this.time_length; j++) {
                if (isNaN(this.st_raster_gt[i][j]) || !isFinite(this.st_raster_gt[i][j])){
                    flag = true;
                }
            }
            if (flag) {
                this.invalid_station_index.push(i);
            }
        }
        console.log("invalid_station_index:", this.invalid_station_index)

        // 求各种error
        var station_lats = new Array(this.station_num);
        var station_lngs = new Array(this.station_num);
        let error_matrix = new Array(this.time_length);
        let mae_for_each_station = new Array(this.station_num);
        let rmse_for_each_station = new Array(this.station_num);
        let mre_for_each_station = new Array(this.station_num);
        let mre_for_filter_station = new Array(this.station_num-this.invalid_station_index.length);
        let st_raster_diff = new Array(this.station_num);  // 绝对误差
        let st_raster_re = new Array(this.station_num);  // 相对误差
        let st_raster_re_filter = new Array(this.station_num-this.invalid_station_index.length);
        let edges = new Array();

        //TODO: 下面内容可以封装成函数
        for (var i = 0; i < this.station_num; i++) {
            // 判断是否传入StatinInfo文件
            if(this.station_info.length!=0){
                station_lats[i] = this.station_info[i][0];
                station_lngs[i] = this.station_info[i][1];
            }
            var tmp_mae = 0;
            error_matrix[i] = new Array(this.time_length);
            st_raster_diff[i] = [];
            st_raster_re[i] = [];
            st_raster_re_filter[i] = [];
            // 计算相对误差&绝对误差
            for (var j = 0; j < this.time_length; j++) {
                error_matrix[i][j] = this.st_raster_pred[i][j] - this.st_raster_gt[i][j];
                tmp_mae += Math.abs(error_matrix[i][j]);
                st_raster_diff[i].push(Math.abs(this.st_raster_pred[i][j] - this.st_raster_gt[i][j]));
                st_raster_re[i].push(Math.abs(this.st_raster_pred[i][j] - this.st_raster_gt[i][j]) / this.st_raster_gt[i][j]);
            }
            mae_for_each_station[i] = tmp_mae / this.station_num;
            rmse_for_each_station[i] = this.ct.calculate_local_rmse(this.st_raster_pred[i], this.st_raster_gt[i]);
            mre_for_each_station[i] = this.ct.calculateMean(st_raster_re[i]);
            if (!this.invalid_station_index.includes(i)) {
                for (var k = 0; k < this.time_length; k++) {
                    st_raster_re_filter[i].push(Math.abs(this.st_raster_pred[i][k] - this.st_raster_gt[i][k]) / this.st_raster_gt[i][k]);
                }
            }
            mre_for_filter_station[i] = this.ct.calculateMean(st_raster_re_filter[i]);
            // 判断是否传入graph文件
            if(this.graph.length!=0){
                for(let j=i+1; j<this.graph[i].length; j++){ // 只遍历上三角
                    if (this.graph[i][j] >= 1) {
                        edges.push({
                            source: `station${i}`,
                            target: `station${j}`
                        });
                    }
                }
            }
        }

        if(this.station_info.length!=0){
            this.station_lats = station_lats;
            this.station_lngs = station_lngs;
        }
        if(this.graph.length!=0){
            this.edges = edges;
            console.log("edges:", this.edges);
        }
        this.error_matrix = error_matrix;
        this.mae_for_each_station = mae_for_each_station;
        this.rmse_for_each_station = rmse_for_each_station;
        this.mre_for_each_station = mre_for_each_station;
        this.mre_for_filter_station = mre_for_filter_station;
        this.st_raster_diff = st_raster_diff;
        this.st_raster_re = st_raster_re;

        console.log("mae for each station", this.mae_for_each_station);
        console.log("rmse for each station:", this.rmse_for_each_station);
        console.log("mre for each station:", this.mre_for_each_station);
        console.log("mre for filter station:", this.mre_for_filter_station)

        // 求各种需要的统计量
        this.emitModelError();
        this.emitBadCase();  // 定位bad case
        this.emitMetricsRankList();   // metric降序排列
        this.emitMetricDistribution();  // metric分布
        this.emitMeanGTDistribution(15);  // 站点属性分布+spatial bad case的分布

        // 判断是否设置时间
        if (this.ts_flag) {
            // 判断时间设置得是否准确
            console.log("=======Is setting of time correct?========")
            if (this.time_length != this.ts.length) {
                console.log("time range fail!")
                console.log(this.time_length)
                console.log(this.ts.length)
                alert("Time Range or Time fitness is false! Please select again.");
            } else {
                // 求分布统计量
                this.emitTimeCharacteristicsDistribution();  // 时间特性的分布
                this.emitBadcaseDistributionRules();  // 时间bad case的分布

                // 绘图
                // 时间特性绘图
                this.getTimeStatisticsDistributionParam();
                this.getBadcaseDistributionRulesParam(0);  // 时间bad case分布绘图

            }
        }
        else {
            this.ts = this.ct.range(0, this.time_length, 1);
        }

    }
    
    refresh() {
        this.ip = new InputProcessor();
        this.ct = new ComputeTool();
        this.station_info = [];
        this.station_lats = [];
        this.station_lngs = [];
        this.graph = [];
        this.edges = [];
        this.mae_for_each_station = [];
        this.temp_bad_case_param = null;
        this.error_matrix = null;
        this.mae_for_each_station = null;
        this.st_raster_diff = null;
        this.PointSortedRMSE = null;
        this.PointSortedMAE = null;
        this.bad_case = null;
        this.error_hotspot_index = null;
        this.station_num = 0;
        this.time_length = 0;
        this.PointRMSERange = null;
        this.PointMAERange = null;
        this.bad_case = [];
        this.error_hotspot_index = [];
        this.temp_bad_case_param = {};
        this.rmse_distribution_param = {};
        this.mae_distribution_param = {};
        this.sort_rmse_param = {};
        this.sort_mae_param = {};
        this.ts_flag = false;
    }

    emitAggregateError() {
        return this.mae_for_each_station
    }

    setSTRaster(file,type){
       this.ip.setSTRaster(file,type) 
    }
    
    setTimeseries(ts, ws, ps, hs, wdn, wsm, pn) {
        console.log("set time series finish!")
        this.ts = ts;  // TimeSeries
        this.ws = ws;  // WeekSeries
        this.ps = ps;  // PeakSeries
        this.hs = hs;  // HourSeries
        this.weekdaynum = wdn;  // weekday num
        this.weeksumnum = wsm;
        this.peaknum = pn;  // peak num
        this.ts_flag = true;
        return true
    }

    // 获得模型整体误差
    emitModelError() {
        console.log("==========计算模型误差============")
        let sumSquaredError = 0;
        let absoluteErrors = 0;
        let absolutePercentageError = 0;
        let ape_num = 0;
        // 计算平方误差的总和
        for (let i = 0; i < this.station_num; i++) {
            for (let j = 0; j < this.time_length; j++) {
                const error = this.st_raster_pred[i][j] - this.st_raster_gt[i][j];
                const squaredError = Math.pow(error, 2);
                const ae = Math.abs(this.st_raster_pred[i][j] - this.st_raster_gt[i][j]);
                if(this.st_raster_gt[i][j] !== 0){
                    const ape = Math.abs((this.st_raster_pred[i][j] - this.st_raster_gt[i][j]) / this.st_raster_gt[i][j]);
                    ape_num++;
                    absolutePercentageError += ape;
                }
                sumSquaredError += squaredError;
                absoluteErrors += ae;
            }
        }
        // 计算rmse
        const meanSquaredError = sumSquaredError / (this.station_num * this.time_length)
        // mae
        const meanAbsoluteError = (absoluteErrors / (this.station_num * this.time_length)).toFixed(2);
        // mape
        const meanAbsolutePercentageError = (absolutePercentageError / ape_num * 100).toFixed(2) + '%';
        this.rmse = Math.sqrt(meanSquaredError).toFixed(2);
        this.mae = meanAbsoluteError;
        this.mape = meanAbsolutePercentageError
        console.log("model error:", this.rmse, this.mae, this.mape);
        // document.getElementById('rmse').innerText = this.rmse;
        // document.getElementById('mape').innerText = this.mape;
        // document.getElementById('mae').innerText = this.mae;
    }

    // 获得local bad case
    /*emitBadCase() {
        console.log("calculate bad case!");
        let bad_case_len = 3;  // 可修改参数，表示至少连续多长的异常可以被定义为bad_case
        let markArea = new Array(this.station_num);
        let start_time = '';
        let end_time = '';
        let start_time_invalid = '';
        let end_time_invalid = '';

        for (let i=0; i<this.station_num; i++) {
            markArea[i] = [];
            let diff = this.st_raster_diff[i];
            // 计算平均值，方差
            // const quartiles = this.ct.calculateQuartiles(diff);
            const mean = this.ct.calculateMean(diff);
            // const standardDeviation = this.ct.calculateStandardDeviation(diff);
            // let upperThreshold = mean + standardDeviation;
            // let lowerThreshold = mean - standardDeviation;
            // 初始化滑动窗口
            let window = 0;
            let window_invalid =0;
            // 滑动窗口求markArea
            for (let j=0; j<this.time_length; j++) {
                if (diff[j] > mean) {
                    if (window === 0) {
                        window ++;
                        start_time = j;
                    } else {
                        window ++;
                    }
                }
                else if (this.st_raster_gt[i][j] == 0 && this.st_raster_pred[i][j] !== 0) {
                    if (window >= bad_case_len) {
                        end_time = j;
                        window = 0;
                        markArea[i].push([{'xAxis': start_time, 'itemStyle': {'color': 'red', 'opacity': 0.3}},
                            {'xAxis': end_time}])
                    } else {
                        window = 0;
                        if (window_invalid === 0) {
                            window_invalid++;
                            start_time_invalid = j;
                        } else {
                            window_invalid++;
                        }
                    }
                }
                else {
                    if (window >= bad_case_len) {
                        end_time = j;
                        window = 0;
                        markArea[i].push([{'xAxis': start_time, 'itemStyle': {'color': 'red', 'opacity': 0.3}},
                            {'xAxis': end_time}])
                    } else {
                        window = 0;
                    }
                    if (window_invalid >= bad_case_len) {
                        end_time_invalid = j;
                        window_invalid = 0;
                        markArea[i].push([{'xAxis': start_time_invalid, 'itemStyle': {'color': 'red', 'opacity': 0.3}},
                            {'xAxis': end_time_invalid}])
                    } else if (window_invalid > 0 && window_invalid < bad_case_len) {
                        window_invalid = 0;
                    }
                }
            }
            // 最后一个时间片若满足mark_area也应该加入
            // if (window > bad_case_len) {
            //     end_time = this.time_length -1;
            //     markArea[i].push([{'xAxis': start_time, 'itemStyle': {'color': 'red', 'opacity': 0.3}},
            //         {'xAxis': end_time}]);
            //     window = 0;
            // }
            // if (window_invalid > bad_case_len) {
            //     end_time_invalid = this.time_length -1;
            //     markArea[i].push([{'xAxis': start_time_invalid, 'itemStyle': {'color': 'red', 'opacity': 0.3}},
            //         {'xAxis': end_time_invalid}]);
            //     window_invalid = 0;
            // }
        }
        this.bad_case = markArea;
        console.log("bad case is:", this.bad_case);
    }*/


    emitBadCase() {
        console.log("=======emit bad case for top 10%!=======");
        let bad_case_len = 1; // 可修改参数，表示至少连续多长的异常可以被定义为bad_case
        let markArea = new Array(this.station_num);
    
        for (let i = 0; i < this.station_num; i++) {
            markArea[i] = [];
            let diff = this.st_raster_diff[i]; // 绝对误差
            let relative_diff = this.st_raster_re[i]; // 相对误差数组，假设这是已经计算好的
    
            // 绝对误差
            let sortedDiff = [...diff].sort((a, b) => b - a);
            let thresholdIndex = Math.floor(sortedDiff.length * 0.05) - 1;
            let thresholdValue = sortedDiff[thresholdIndex]; // 前10%的阈值
    
            // 相对误差
            let sortedRelativeDiff = [...relative_diff].sort((a, b) => b - a);
            let relativeThresholdIndex = Math.floor(sortedRelativeDiff.length * 0.05) - 1;
            let relativeThresholdValue = sortedRelativeDiff[relativeThresholdIndex]; // 相对误差的前10%的阈值
    
            // 初始化滑动窗口
            let window = 0;
            let relative_window = 0; // 相对误差的滑动窗口
            let start_time = '';
            let relative_start_time = ''; // 相对误差的开始时间
    
            // 滑动窗口求markArea
            for (let j = 0; j < this.time_length; j++) {
                // 绝对误差的标记逻辑
                if (diff[j] > thresholdValue) {
                    if (window === 0) {
                        start_time = j;
                    }
                    window++;
                } else {
                    if (window >= bad_case_len) {
                        let end_time = j;
                        markArea[i].push([{'xAxis': start_time, 'itemStyle': {'color': 'yellow', 'opacity': 0.5}},
                            {'xAxis': end_time}]);
                    }
                    window = 0;
                }
    
                // 相对误差的标记逻辑
                if (relative_diff[j] > relativeThresholdValue) {
                    if (relative_window === 0) {
                        relative_start_time = j;
                    }
                    relative_window++;
                } else {
                    if (relative_window >= bad_case_len) {
                        let relative_end_time = j;
                        markArea[i].push([{'xAxis': relative_start_time, 'itemStyle': {'color': 'red', 'opacity': 0.5}},
                            {'xAxis': relative_end_time}]);
                    }
                    relative_window = 0;
                }
            }
    
            // 最后一个时间片的处理逻辑
            if (window >= bad_case_len) {
                let end_time = this.time_length - 1;
                markArea[i].push([{'xAxis': start_time, 'itemStyle': {'color': 'yellow', 'opacity': 0.5}},
                    {'xAxis': end_time}]);
            }
            if (relative_window >= bad_case_len) {
                let relative_end_time = this.time_length - 1;
                markArea[i].push([{'xAxis': relative_start_time, 'itemStyle': {'color': 'red', 'opacity': 0.5}},
                    {'xAxis': relative_end_time}]);
            }
        }
    
        this.bad_case = markArea;
        console.log("bad case is:", this.bad_case);
    }
    

    // 获得站点误差以及降序排列数组
    emitMetricsRankList() {
        console.log("=========emit Metric Rank List============")
        let RMSE = [];
        let MAE = [];
        let MAPE = [];
        for (let i=0; i<this.station_num; i++) {
            // 可以使用封装好的函数：calculate_local_rmse(pd, gt)
            let total_rmse_variance = 0;
            let total_absolute_error = 0;
            let absolutePercentageError = 0;
            let ape_num = 0;
            for (let j=0; j<this.time_length; j++) {
                total_rmse_variance += Math.pow(Math.abs(this.st_raster_pred[i][j]-this.st_raster_gt[i][j]), 2);
                total_absolute_error += Math.abs(this.st_raster_pred[i][j]-this.st_raster_gt[i][j]);
                if(this.st_raster_gt[i][j] !== 0){
                    ape_num++;
                    absolutePercentageError += Math.abs((this.st_raster_pred[i][j] - this.st_raster_gt[i][j]) / this.st_raster_gt[i][j]);
                }
            }
            RMSE.push(Math.round(Math.sqrt(total_rmse_variance / this.time_length) * 100) / 100);
            MAE.push(Math.round((total_absolute_error / this.time_length) * 100) / 100);
            MAPE.push(Math.round(absolutePercentageError / ape_num * 100));
        }
        this.PointRMSE = RMSE;
        this.PointMAE = MAE;
        this.PointMAPE = MAPE;
        this.PointSortedRMSE = RMSE.map((value, index) => [index, value]);
        this.PointSortedMAE = MAE.map((value, index) => [index, value]);
        this.PointSortedMAPE = MAPE.map((value, index) => [index, value]);
        this.PointSortedRMSE.sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0);
        this.PointSortedMAE.sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0);
        this.PointSortedMAPE.sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0);
        console.log("point mape:", this.PointMAPE);
        console.log("point sorted rmse:", this.PointSortedRMSE);
        document.getElementById('point_rmse').innerText = this.PointRMSE[0];
        document.getElementById('point_mae').innerText = this.PointMAE[0];
        document.getElementById('point_mape').innerText = this.PointMAPE[0] + '%';
    }

    // 获得Metric分布
    emitMetricDistribution(interval_num) {
        console.log("==========emit metric distribution==========")
        // rmse
        let max_rmse = this.PointSortedRMSE[0][1];
        let min_rmse = this.PointSortedRMSE[this.station_num-1][1];
        let interval_rmse = (max_rmse - min_rmse) / interval_num;
        // mae
        let max_mae = this.PointSortedMAE[0][1];
        let min_mae = this.PointSortedMAE[this.station_num-1][1];
        let interval_mae = (max_mae - min_mae) / interval_num;

        this.PointRMSERange = this.ct.getMetricsRange(min_rmse, interval_num, interval_rmse);
        this.PointMAERange = this.ct.getMetricsRange(min_mae, interval_num, interval_mae);

        for (let i=0; i<this.station_num; i++) {
            let rmse_interval_id = this.ct.getIntervalID(this.PointRMSERange['interval_point'], interval_num, this.PointSortedRMSE[i][1]);
            let mae_interval_id = this.ct.getIntervalID(this.PointMAERange['interval_point'], interval_num, this.PointSortedMAE[i][1]);
            this.PointRMSERange[rmse_interval_id]++;
            this.PointMAERange[mae_interval_id]++;
        }
        console.log("point rmse range:", this.PointRMSERange)
        console.log("point mae range:", this.PointMAERange)
    }

    // 获得时间特性分布统计: 工作日vs周末，早晚高峰vs平峰，一周7天，24h
    emitTimeCharacteristicsDistribution() {
        console.log("==========emit statistics==========")

        // 时间特性
        const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const weeksum = ['weekends', 'workday'];
        const peaksum = ['mp', 'ep', 'others'];
        let weekdays_num = Array(weekdays.length).fill(0);
        let weeksum_num = Array(weeksum.length).fill(0);
        let peaksum_num = Array(peaksum.length).fill(0);
        let hour_num = Array(24).fill(0);

        for (let i=0; i<this.time_length; i++) {
            // On what day of the week?
            for (let j=0; j<weekdays.length; j++) {
                if (this.ws[i] === weekdays[j]) {
                    weekdays_num[j]++;
                }
            }
            // Morning/Evening Peak?
            for (let j=0; j<weeksum.length; j++) {
                if (this.ps[i] === peaksum[j]) {
                    peaksum_num[j]++;
                }
            }
            // On which hour of the 24?
            hour_num[this.hs[i]]++;
        }
        // Weekday or Weekends?
        weeksum_num[0] = weekdays_num[0] + weekdays_num[6];
        for (let i=1; i<6; i++) {
            weeksum_num[1] += weekdays_num[i];
        }
        this.weekdays_distribution = weekdays_num;
        this.weeksum_distribution = weeksum_num;
        this.peaksum_distribution = peaksum_num;
        this.hour_distribution = hour_num;

        console.log("weekdays_distribution:", this.weekdays_distribution);
        console.log("weeksum_distribution", this.weeksum_distribution);
        console.log("peaksum_distribution:", this.peaksum_distribution);
        console.log("hour_distribution:", this.hour_distribution);
    }

    // 获得时间bad case关于时间特性的分布规律
    emitBadcaseDistributionRules() {
        console.log("============get week & peak status=========")
        let length = this.station_num;
        const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const WeekSum = Array.from({length}, () => ( {'weekends': 0, 'workday': 0} ));
        const PeakSum = Array.from({length}, () => ( {'mp': 0, 'ep': 0, 'others': 0} ));
        const HourDistribution = Array.from({length}, () => Array(24).fill(0));
        // const tmp = {};
        // for (let i=0; i<weekdays.length; i++) { tmp[i] = 0;}
        let WeekDistribution = [];
        for (let i=0; i<length; i++) {
            WeekDistribution[i] = {};
            for (let j=0; j<weekdays.length; j++) {
                WeekDistribution[i][j] = 0;
            }
        }

        const WeekDistributionRatio = [];
        const WeekSumRatio = [];
        const PeakSumRatio = [];

        for (let station_id=0; station_id<this.station_num; station_id++) {
            // let diff = this.st_raster_diff[station_id];
            // const mean = this.ct.calculateMean(diff);
            let bad_case = this.bad_case[station_id];
            let isInBadcase = false;

            for (let i=0; i<this.ws.length; i++) {
                for (let idx=0; idx<bad_case.length; idx++) {
                    let start_time = bad_case[idx][0]['xAxis'];
                    let end_time = bad_case[idx][1]['xAxis'];
                    if (i > start_time && i < end_time) {
                        isInBadcase = true;
                    }
                }
                // if (diff[i] >mean)
                if (isInBadcase === true) {
                    isInBadcase = false;
                    // 统计bad case在每个星期几的个数
                    for (let j=0; j<weekdays.length; j++) {
                        if (this.ws[i] === weekdays[j]) { WeekDistribution[station_id][j]++; }
                    }
                    // 判断是工作日还是周末
                    if (this.ws[i] === 'SUN' || this.ws[i] === 'SAT') {
                        WeekSum[station_id]['weekends']++;
                    } else { WeekSum[station_id]['workday']++; }
                    // 判断是否为早晚高峰
                    if (this.ps[i] === 'mp') {
                        PeakSum[station_id]['mp']++;
                    } else if (this.ps[i] === 'ep') {
                        PeakSum[station_id]['ep']++;
                    } else {
                        PeakSum[station_id]['others']++;
                    }
                    // 统计bad case都是哪一个小时
                    HourDistribution[station_id][this.hs[i]]++;
                }
            }

            // 统计星期几的比例，周末/工作日的比例，早/晚高峰/平峰的比例
            WeekDistributionRatio[station_id] = this.ct.calculate_ratio(this.weekdaynum, WeekDistribution[station_id]);
            WeekSumRatio[station_id] = this.ct.calculate_ratio(this.weeksumnum, WeekSum[station_id]);
            PeakSumRatio[station_id] = this.ct.calculate_ratio(this.peaknum, PeakSum[station_id]);
        }

        this.WeekSum = WeekSum;
        this.PeakSum = PeakSum;
        this.WeekDistribution = WeekDistribution;
        this.HourDistribution = HourDistribution;

        this.WeekDistributionRatio = WeekDistributionRatio;
        this.WeekSumRatio = WeekSumRatio;
        this.PeakSumRatio = PeakSumRatio;
        console.log("WeekDistributionRatio:", this.WeekDistributionRatio[0]);
        console.log("WeekSumRatio:", this.WeekSumRatio);
        console.log("PeakSumRatio:",this.PeakSumRatio);
    }

    // 获得站点属性分布统计: 流量
    // 获得空间bad case关于站点属性的分布规律
    emitMeanGTDistribution(interval_num) {
        // 先验知识：流量
        // 求平均gt的分布
        console.log("=======emit Mean GT Distribuion========")
        let mean_gt_for_each_station = [];
        for (let i=0; i<this.station_num; i++) {
            mean_gt_for_each_station[i] = this.ct.calculateMean(this.st_raster_gt[i]);
        }
        console.log("mean gt for each station:", mean_gt_for_each_station);
        this.gtRange = this.ct.getSequenceRange(mean_gt_for_each_station, interval_num);  // bad case 关于站点流量的分布
        this.gtDistribution = this.ct.getSequenceRange(mean_gt_for_each_station, interval_num); // 站点流量的分布

        // 统计预测得糟糕的站点落在什么范围内：mre前10%的站点视为预测得糟糕的站点
        let sorted_spatial_error = [...this.mre_for_each_station].sort((a, b) => b - a);
        let thresholdIndex = Math.floor(sorted_spatial_error.length * 0.1) - 1;
        let threshold = sorted_spatial_error[thresholdIndex]; // 前10%的阈值
        // let threshold = this.ct.calculateMean(this.mre_for_each_station);  // 大于平均误差的站点为spatial bad case

        for (let i=0; i<this.station_num; i++) {
            let interval_id = this.ct.getIntervalID(this.gtDistribution['interval_point'], interval_num, mean_gt_for_each_station[i]);
            this.gtDistribution[interval_id]++;
            if (this.mre_for_each_station[i] > threshold) {
                let interval_badcase_id = this.ct.getIntervalID(this.gtRange['interval_point'], interval_num, mean_gt_for_each_station[i]);
                this.gtRange[interval_badcase_id]++;
            }
        }
        console.log("gt distribution:", this.gtDistribution);
        console.log("gt distribution for spatial bad case:", this.gtRange);
    }


    /*
        绘图参数
    */

    /*bad case 定位*/

    // gt & pd & local bad case
    getTemporalBadCaseParam(spatial_ind) {
        console.log("========plot temporal bad case=========")
        let pd=this.st_raster_pred[spatial_ind];
        let gt=this.st_raster_gt[spatial_ind];
        let ts = this.ts;
        let mark_area = this.bad_case[spatial_ind];

        let startIndex=-1;
        let endIndex=-1;
        this.temp_bad_case_param ={
            'groundtruth':gt,
            'prediction':pd,
            'axisvalue':ts,
            'badcase':mark_area,
            'startInd':startIndex,
            'endInd':endIndex,
        }
        console.log("temp_bad_case_param:", this.temp_bad_case_param);
    }

    // metric rank list
    getMetricRankListParam() {
        // this.emitMetricsRankList();
        let rmse_index_list = [];
        let mae_index_list = [];
        let sorted_rmse_list = [];
        let sorted_mae_list = [];
        console.log("========plot metric rank list========");
        for (let i=0; i<this.station_num; i++) {
            rmse_index_list.push(this.PointSortedRMSE[i][0]);
            sorted_rmse_list.push(this.PointSortedRMSE[i][1]);
            mae_index_list.push(this.PointSortedMAE[i][0]);
            sorted_mae_list.push(this.PointSortedMAE[i][1]);
        }
        this.sort_rmse_param = {
            'rmse': sorted_rmse_list,
            'mae': sorted_mae_list,
            'y_data': rmse_index_list,
        };
        console.log("sort_rmse_param:", this.sort_rmse_param);
    }

    /* 站点属性/时间特性/评价指标 分布*/

    //站点属性分布
    getStationAttributesDistributionParam() {
        let interval_num = 15;  // 可修改参数
        console.log("=========plot Station Attributes Distribution=========")
        // 站点属性：日常流量
        let gt_num = [];
        for (let i=0; i<interval_num; i++) {
            gt_num.push(this.gtDistribution[i]);
        }

        this.gt_distribuion_param = {
            'axisvalue': this.gtDistribution['interval_name'],
            'distribution': gt_num,
            'name': 'station amount',
            'xAxisname': ''
        }
        console.log("gt_distribution_param:", this.gt_distribuion_param);
    }

    // 时间特性分布
    getTimeStatisticsDistributionParam() {
        console.log("=========plot Time Statistics Distribution=========")

        // 周末
        this.week_distribuion_param = {
            'axisvalue': ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
            'distribution': this.weekdays_distribution,
            'name': '# time slices',
            'xAxisname': ''
        }

        // peak
        this.peak_distribuion_param = {
            'axisvalue': ['moring peak', 'evening peak', 'others'],
            'distribution': this.peaksum_distribution,
            'name': '# time slices',
            'xAxisname': ''
        }

        // week
        this.weekday_distribuion_param = {
            'axisvalue': ['weekends', 'workday'],
            'distribution': this.weeksum_distribution,
            'name': '# time slices',
            'xAxisname': ''
        }

        // hour
        this.hour_distribuion_param = {
            'axisvalue': this.ct.get24HourSeries(),
            'distribution': this.hour_distribution,
            'name': '# time slices',
            'xAxisname': ''
        }
        console.log("weekday_statistic_param:", this.weekday_distribuion_param);
        console.log("peak_statistic_param:", this.peak_distribuion_param);
        console.log("week_distribution_rules_param:", this.week_distribuion_param);
        console.log("hour_distribution_rules_param:", this.hour_distribuion_param);
    }

    // 评价指标分布
    getMetricDistributionParam() {

        // RMSE Distribution
        // MAE Distribution

        let interval_num = 15;  // 可修改参数
        this.emitMetricDistribution(interval_num);
        console.log("=========plot metric distribution=========")
        let rmse_distribution_num = [];
        let mae_distribution_num = [];
        for (let i=0; i<interval_num; i++) {
            rmse_distribution_num.push(this.PointRMSERange[i]);
            mae_distribution_num.push(this.PointMAERange[i]);
        }
        this.rmse_distribution_param = {
            'axisvalue:': this.PointRMSERange['interval_name'],
            'distribution': rmse_distribution_num,
            'name': '# station',
            'xAxisname': 'Range of RMSE Values'
        }
        this.mae_distribution_param = {
            'axisvalue:': this.PointMAERange['interval_name'],
            'distribution': mae_distribution_num,
            'name': '# station',
            'xAxisname': 'Range of MAE Values'
        }

        console.log("rmse_distribution_param:", this.rmse_distribution_param);
        console.log("mae_distribution_param:", this.mae_distribution_param);
    }


    /*bad case 分布*/

    // bad case temporal distribution rules
    getBadcaseDistributionRulesParam(spatial_ind) {
        console.log("=========plot bad case distribution rules=========")
        spatial_ind = parseInt(spatial_ind)
        console.log(this.WeekSumRatio)
        let week_distribution = Object.values(this.WeekDistributionRatio[spatial_ind]);
        let peak_statistic = Object.values(this.PeakSumRatio[spatial_ind]);
        let weekday_statistic = Object.values(this.WeekSumRatio[spatial_ind]);
        let hour_distribution = this.HourDistribution[spatial_ind];

        this.badcase_weekday_statistic_param = {
            'axisvalue': ['weekends', 'workday'],
            'distribution': weekday_statistic,
            'name': '% temporal bad case',
            'xAxisname': ''
        }
        this.badcase_peak_statistic_param = {
            'axisvalue': ['moring peak', 'evening peak', 'others'],
            'distribution': peak_statistic,
            'name': '% temporal bad case',
            'xAxisname': ''
        }
        this.badcase_week_distribution_rules_param = {
            'axisvalue': ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
            'distribution': week_distribution,
            'name': '% temporal bad case',
            'xAxisname': ''
        }
        this.badcase_hour_distribution_rules_param = {
            'axisvalue:': this.ct.get24HourSeries(),
            'distribution': hour_distribution,
            'name': '# temporal bad case',
            'xAxisname': ''
        }
        console.log("badcase_weekday_statistic_param:", this.badcase_weekday_statistic_param);
        console.log("badcase_peak_statistic_param:", this.badcase_peak_statistic_param);
        console.log("badcase_week_distribution_rules_param:", this.badcase_week_distribution_rules_param);
        console.log("badcase_hour_distribution_rules_param:", this.badcase_hour_distribution_rules_param);
    }
    
    // distribution rules of spatial bad case
    getBadcaseSpatialDistributionRulseParam() {
        let interval_num = 15;  // 可修改参数
        console.log("=========plot spatial bad case distribution=========")
        let bc_distribution_num = [];
        for (let i=0; i<interval_num; i++) {
            bc_distribution_num.push(this.gtRange[i]);
        }
        this.badcase_spatial_distribution_rules_param = {
            'axisvalue': this.gtRange['interval_name'],
            'distribution': bc_distribution_num,
            'name': '# spatial bad case',
            'xAxisname': 'Flow Range'
        }
        console.log("badcase_spatial_distribution_rules_param:", this.badcase_spatial_distribution_rules_param);
    }


    



}

