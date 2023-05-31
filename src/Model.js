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
        this.ts_flag = false;
    }

    /*
    TODO: 1.实现SpatialBadCaseLocateModel、TemporalBadCaseLocateModel、InfoProcessModel；2.思考更新输入文件怎么办
    UPDATE: (by hyy) 新增了计算diff序列和badcase
    UPDATE: (by xxh) 在testupdate新增了stationinfo文件的判断
    */
    testupdate() {
        this.st_raster_gt = this.ip.gt_st_raster;
        this.st_raster_pred = this.ip.pred_st_raster;
        this.station_info = this.ip.station_info;
        this.time_length = this.st_raster_gt[0].length;
        this.station_num = this.st_raster_gt.length;
        this.invalid_station_index = new Array();
        // 求无效点的索引序列
        for (let i=0; i<this.station_num; i++) {
            let flag = false;
            if (this.ct.calculateMean(this.st_raster_gt[i]) == 0) {
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
                let re = Math.abs(this.st_raster_pred[i][j] - this.st_raster_gt[i][j]) / this.st_raster_gt[i][j]
                st_raster_re[i].push(Math.abs(this.st_raster_pred[i][j] - this.st_raster_gt[i][j]) / this.st_raster_gt[i][j]);
            }
            mae_for_each_station[i] = tmp_mae / this.station_num;
            rmse_for_each_station[i] = this.ct.calculate_local_rmse(this.st_raster_pred[i], this.st_raster_gt[i]);
            mre_for_each_station[i] = this.ct.calculateMean(st_raster_re[i]);
            if (!this.invalid_station_index.includes(i)) {
                for (var j = 0; j < this.time_length; j++) {
                    st_raster_re_filter[i].push(Math.abs(this.st_raster_pred[i][j] - this.st_raster_gt[i][j]) / this.st_raster_gt[i][j]);
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

        this.emitBadCase();
        this.emitMeanGTDistribution();

        // 判断是否设置时间
        if (this.ts_flag) {
            // 判断时间设置得是否准确
            if (this.time_length != this.ts.length) {
                console.log("time range fail!")
                console.log(this.time_length)
                console.log(this.ts.length)
                alert("Time Range or Time fitness is false! Please select again.");
            } else {
                this.emitBadcaseDistributionRules();
                this.getBadcaseDistributionRulesParam(0);
            }
        }
        else {
            this.ts = this.ct.range(0, this.time_length, 1);
        }

        // this.emitErrorHotspotIndex();
        // this.emitBadcaseTemporalDistribution();

    }

    refresh() {
        this.ip = new InputProcessor();
        this.ct = new ComputeTool();
        this.station_info = [];
        this.station_lats = [];
        this.station_lngs = [];
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

    // update(jsonData) {
    //
    //     this.time_range = jsonData.time_range;
    //     this.time_fitness = jsonData.time_fitness;
    //     this.station_lats = jsonData.station_lats;
    //     this.station_lngs = jsonData.station_lngs;
    //
    //
    //     this.st_raster_gt = jsonData.st_raster_gt;
    //     this.st_raster_pred = jsonData.st_raster_pred;
    //     this.time_length = this.st_raster_gt[0].length;
    //     this.station_num = this.st_raster_gt.length;
    //     let error_matrix = new Array(this.time_length);
    //     let mae_for_each_station = new Array(this.station_num);
    //     let st_raster_diff = new Array(this.station_num);
    //     //TODO: 下面内容可以封装成函数
    //     for (var i = 0; i < this.station_num; i++) {
    //
    //         var tmp_mae = 0;
    //         error_matrix[i] = new Array(this.time_length);
    //         st_raster_diff[i] = [];
    //         for (var j = 0; j < this.time_length; j++) {
    //             error_matrix[i][j] = this.st_raster_pred[i][j] - this.st_raster_gt[i][j];
    //             tmp_mae += Math.abs(error_matrix[i][j]);
    //             st_raster_diff[i].push(Math.abs(this.st_raster_pred[i][j]-this.st_raster_gt[i][j]));
    //         }
    //         mae_for_each_station[i] = tmp_mae / this.station_num;
    //     }
    //     this.error_matrix = error_matrix;
    //     this.mae_for_each_station = mae_for_each_station;
    //     this.st_raster_diff = st_raster_diff;
    //
    //     this.emitBadCase();
    // }


    emitTimeseries_gt(spatial_ind) {
        return this.st_raster_gt[spatial_ind];
    }

    emitTimeseries_pred(spatial_ind) {
        return this.st_raster_pred[spatial_ind];
    }

    emitErrorSeries(spatial_ind) {
        return this.error_matrix[spatial_ind]
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

    // 获得模型误差降序排列数组
    emitMetricsRankList() {
        let RMSE = [];
        let MAE = [];
        for (let i=0; i<this.station_num; i++) {
            // 可以使用封装好的函数：calculate_local_rmse(pd, gt)
            let total_rmse_variance = 0;
            let total_absolute_error = 0;
            for (let j=0; j<this.time_length; j++) {
                total_rmse_variance += Math.pow(Math.abs(this.st_raster_pred[i][j]-this.st_raster_gt[i][j]), 2);
                total_absolute_error += Math.abs(this.st_raster_pred[i][j]-this.st_raster_gt[i][j]);
            }
            RMSE.push(Math.round(Math.sqrt(total_rmse_variance / this.time_length) * 100) / 100);
            MAE.push(Math.round((total_absolute_error / this.time_length) * 100) / 100);
        }
        this.PointSortedRMSE = RMSE.map((value, index) => [index, value]);
        this.PointSortedMAE = MAE.map((value, index) => [index, value]);
        this.PointSortedRMSE.sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0);
        this.PointSortedMAE.sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0);
    }

    // 获得Metric分布
    emitMetricDistribution(interval_num) {
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
    }

    // 获得local bad case
    emitBadCase() {
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
                else if (this.st_raster_gt[i][j] == 0 && this.st_raster_pred[i][j] == 0) {
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
    }

    // 获得各站点bad case的分布规律
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
            let diff = this.st_raster_diff[station_id];
            const mean = this.ct.calculateMean(diff);
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
                if (isInBadcase == true) {
                    isInBadcase = false;
                    // 统计bad case在每个星期几的个数
                    for (let j=0; j<weekdays.length; j++) {
                        if (this.ws[i] == weekdays[j]) { WeekDistribution[station_id][j]++; }
                    }
                    // 判断是工作日还是周末
                    if (this.ws[i] == 'SUN' || this.ws[i] == 'SAT') {
                        WeekSum[station_id]['weekends']++;
                    } else { WeekSum[station_id]['workday']++; }
                    // 判断是否为早晚高峰
                    if (this.ps[i] == 'mp') {
                        PeakSum[station_id]['mp']++;
                    } else if (this.ps[i] == 'ep') {
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

    // 获得问题站点关于流量的分布规律
    emitMeanGTDistribution(interval_num) {
        // 先验知识：流量
        // 求平均gt的分布
        console.log("=======emit Mean GT Distribuion========")
        let mean_gt_for_each_station = [];
        for (let i=0; i<this.station_num; i++) {
            mean_gt_for_each_station[i] = this.ct.calculateMean(this.st_raster_gt[i]);
        }
        console.log("mean gt for each station:", mean_gt_for_each_station);
        this.gtRange = this.ct.getSequenceRange(mean_gt_for_each_station, interval_num);
        // 统计预测得糟糕的站点落在什么范围内：超出所有站点平均误差的站点视为预测得糟糕的站点
        let threshold = this.ct.calculateMean(this.mre_for_each_station);
        for (let i=0; i<this.station_num; i++) {
            if (this.mre_for_each_station[i] > threshold) {
                let interval_id = this.ct.getIntervalID(this.gtRange['interval_point'], interval_num, mean_gt_for_each_station[i]);
                this.gtRange[interval_id]++;
            }
        }
    }

    // 聚类
    // emitCluster() {
    //     console.log("==========cluster===========");
    //     const nClusters = 3;
    //
    //     const trainingData = [
    //         [123.456, 45.678, 8.5],
    //         [12.345, 67.890, 7.2]
    //     ];
    //
    //     // 创建 K-Means 聚类器并训练模型
    //     const kmeans = new KMeans({ nClusters });
    //     kmeans.fit(trainingData);
    //
    //     // 获取聚类结果
    //     const labels = kmeans.predict(trainingData);
    //
    //     // 找出评价指标高的点所在的经纬度范围
    //     const highScoreCluster = labels.find(label => {
    //         const clusterPoints = dataset.filter((_, index) => labels[index] === label);
    //         const clusterScores = clusterPoints.map(item => item.score);
    //         const maxScore = Math.max(...clusterScores);
    //         return maxScore >= 8.0; // 评价指标大于等于8.0的簇
    //     });
    //
    //     if (highScoreCluster) {
    //         const clusterPoints = dataset.filter((_, index) => labels[index] === highScoreCluster);
    //         const longitudes = clusterPoints.map(item => item.longitude);
    //         const latitudes = clusterPoints.map(item => item.latitude);
    //         const minLongitude = Math.min(...longitudes);
    //         const maxLongitude = Math.max(...longitudes);
    //         const minLatitude = Math.min(...latitudes);
    //         const maxLatitude = Math.max(...latitudes);
    //
    //         console.log('评价指标高的点所在的经纬度范围：');
    //         console.log('最小经度：', minLongitude);
    //         console.log('最大经度：', maxLongitude);
    //         console.log('最小纬度：', minLatitude);
    //         console.log('最大纬度：', maxLatitude);
    //     }
    // }

    /*
        绘图参数
    */

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
        this.emitMetricsRankList();
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

    // bad case temporal distribution rules
    getBadcaseDistributionRulesParam(spatial_ind) {
        console.log("=========plot bad case distribution rules=========")
        let weekday_statistic = Object.values(this.WeekSumRatio[spatial_ind]);
        let peak_statistic = Object.values(this.PeakSumRatio[spatial_ind]);
        let week_distribution = Object.values(this.WeekDistributionRatio[spatial_ind]);
        let hour_distribution = this.HourDistribution[spatial_ind];

        this.badcase_weekday_statistic_param = {
            'axisvalue': ['weekends', 'workday'],
            'distribution': weekday_statistic,
            'name': 'ratio of bad case',
            'xAxisname': ''
        }
        this.badcase_peak_statistic_param = {
            'axisvalue': ['moring peak', 'evening peak', 'others'],
            'distribution': peak_statistic,
            'name': 'ratio of bad case',
            'xAxisname': ''
        }
        this.badcase_week_distribution_rules_param = {
            'axisvalue': ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
            'distribution': week_distribution,
            'name': 'ratio of bad case',
            'xAxisname': ''
        }
        this.badcase_hour_distribution_rules_param = {
            'axisvalue:': this.ct.get24HourSeries(),
            'distribution': hour_distribution,
            'name': 'number of bad case',
            'xAxisname': ''
        }
        console.log("badcase_weekday_statistic_param:", this.badcase_weekday_statistic_param);
        console.log("badcase_peak_statistic_param:", this.badcase_peak_statistic_param);
        console.log("badcase_week_distribution_rules_param:", this.badcase_week_distribution_rules_param);
        console.log("badcase_hour_distribution_rules_param:", this.badcase_hour_distribution_rules_param);
    }
    
    // distribution rules of Problem Point
    getBadcaseSpatialDistributionRulseParam() {
        let interval_num = 15;  // 可修改参数
        this.emitMeanGTDistribution(interval_num);
        console.log("=========plot spatial bad case distribution=========")
        let bc_distribution_num = [];
        for (let i=0; i<interval_num; i++) {
            bc_distribution_num.push(this.gtRange[i]);
        }
        this.badcase_spatial_distribution_rules_param = {
            'axisvalue': this.gtRange['interval_name'],
            'distribution': bc_distribution_num,
            'name': 'number of problem point',
            'xAxisname': 'Flow Range'
        }
        console.log("badcase_spatial_distribution_rules_param:", this.badcase_spatial_distribution_rules_param);
    }

    
    /*目前没用到的函数*/

    // 获得error hotspot
    emitErrorHotspotIndex() {
        // 计算所有bad case的长度和rmse
        let bad_case_len_list = [];
        let bad_case_error_list = [];
        for (let i=0; i<this.station_num; i++) {
            // 获得站点对应的索引值
            // let index = this.PointSortedRMSE[i][0];
            // console.log("worest statation index:", index);
            // 获得站点对应的bad case list
            let bad_case_list = this.bad_case[i];
            for (let j=0; j<bad_case_list.length; j++) {
                // 对于每个bad case
                let left = bad_case_list[j][0]['xAxis'];
                let right = bad_case_list[j][1]['xAxis'];
                // 计算bad case持续的长度
                let bad_case_len = right - left;
                bad_case_len_list.push({'index': [i, j], 'length': bad_case_len});
                // 计算局部local rmse
                let rmse = this.ct.calculate_local_rmse(this.st_raster_pred[i].slice(left, right+1), this.st_raster_gt[i].slice(left, right+1))
                bad_case_error_list.push({'index': [i, j], 'error': rmse});
            }
        }

        // 取前1%的bad case作为top-k error hotspot
        this.semi_k = Math.ceil(0.01 * bad_case_len_list.length);
        this.k = 2 * this.semi_k;
        bad_case_len_list.sort((a, b) => a.length > b.length ? -1 : a.length < b.length ? 1 : 0);
        bad_case_error_list.sort((a, b) => a.error > b.error ? -1 : a.error< b.error ? 1 : 0);
        // console.log("sorted_bad_case_len_list:", bad_case_len_list);
        // console.log("sorted_bad_case_error_list:", bad_case_error_list);

        // 取top-k error hotspot的索引
        this.error_hotspot_index = {
            'length': [],
            'error': [],
        };
        for (let i=0; i<this.semi_k; i++) {
            this.error_hotspot_index['length'].push(bad_case_len_list[i]['index']);
            this.error_hotspot_index['error'].push(bad_case_error_list[i]['index']);
        }
        // console.log("error hotpost index:", this.error_hotspot_index);
    }

    // 获得各时间片bad case的个数
    emitBadcaseTemporalDistribution() {
        let badcase_temp_num = Array(this.time_length).fill(0);
        for (let i=0; i<this.station_num; i++) {
            let diff = this.st_raster_diff[i];
            const mean = this.ct.calculateMean(diff);
            for (let j=0; j<this.time_length; j++) {
                if (diff[j] > mean || diff[j] === Infinity) {
                    badcase_temp_num[j] += 1;
                }
            }
        }
        this.badcase_temp_distribution = badcase_temp_num;
        // console.log("badcase_temporal_distribution:", badcase_temp_num);
    }
    
    // bad case distribution - temporal view
    getBadcaseTemporalDistributionParam() {
        console.log("=========plot bad case temporal distribution=========")
        let ts = this.ts;
        this.badcase_temp_distribution_param = {
            'axisvalue': ts,
            'badcase_num': this.badcase_temp_distribution,
            'name': 'Local Bad Case Temporal Distribution'
        }
        console.log("badcase_temporal_distribution_param:", this.badcase_temp_distribution_param);
    }

    // metric distribution
    getMetricDistributionParam() {
        let interval_num = 15;  // 可修改参数
        this.emitMetricDistribution(interval_num);
        console.log("=========plot metric distribution=========")
        let rmse_distribution_num = [];
        let mae_distribution_num = [];
        for (let i=0; i<interval_num; i++) {
            rmse_distribution_num.push(this.PointRMSERange[i]);
            mae_distribution_num.push(this.PointMAERange[i]);
        }
        this.rmse_distribution_param = [this.PointRMSERange['interval_name'], rmse_distribution_num];
        this.mae_distribution_param = [this.PointMAERange['interval_name'], mae_distribution_num];
        console.log("rmse_distribution_param:", this.rmse_distribution_param);
    }

    // error hotspot
    getErrorHotspotParam(type, index) {
        // index：画的是第index个error hotspot
        console.log("=========plot error hotspot===========");
        let station_ind = this.error_hotspot_index[type][index][0];
        let bad_case_ind = this.error_hotspot_index[type][index][1];
        let left = this.bad_case[station_ind][bad_case_ind][0]['xAxis'];
        let right = this.bad_case[station_ind][bad_case_ind][1]['xAxis'];

        let pd = this.st_raster_pred[station_ind].slice(left, right+1);
        let gt = this.st_raster_gt[station_ind].slice(left, right+1);

        let ts = this.ts;

        this.error_hotspot_param = {
            'groundtruth':gt,
            'prediction':pd,
            'axisvalue':ts,
        }
        console.log("error_hotspot_param:", this.error_hotspot_param);

    }


}

