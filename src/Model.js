
import InputProcessor from './InputProcessor.js'
import ComputeTool from './function.js'
export default class Model {
    constructor() {
        this.ip = new InputProcessor();
        this.ct = new ComputeTool();
        this.station_lats = [];
        this.station_lngs = [];
        this.mae_for_each_station = [];
    }
    /* 
    TODO: 1.实现SpatialBadCaseLocateModel、TemporalBadCaseLocateModel、InfoProcessModel；2.思考更新输入文件怎么办
    UPDATE: (by hyy) 新增了计算diff序列和badcase
    */
    testupdate() {
        this.st_raster_gt = this.ip.gt_st_raster;
        this.st_raster_pred = this.ip.pred_st_raster;
        this.station_info = this.ip.station_info;
        this.time_length = this.st_raster_gt[0].length;
        this.station_num = this.st_raster_gt.length;
        var station_lats = new Array(this.station_num);
        var station_lngs = new Array(this.station_num);
        let error_matrix = new Array(this.time_length);
        let mae_for_each_station = new Array(this.station_num);
        let st_raster_diff = new Array(this.station_num);
        //TODO: 下面内容可以封装成函数
        for (var i = 0; i < this.station_num; i++) {
            station_lats[i] = this.station_info[i][0];
            station_lngs[i] = this.station_info[i][1];
            var tmp_mae = 0;
            error_matrix[i] = new Array(this.time_length);
            st_raster_diff[i] = [];
            for (var j = 0; j < this.time_length; j++) {
                error_matrix[i][j] = this.st_raster_pred[i][j] - this.st_raster_gt[i][j];
                tmp_mae += Math.abs(error_matrix[i][j]);
                st_raster_diff[i].push(Math.abs(this.st_raster_pred[i][j]-this.st_raster_gt[i][j]));
            }
            mae_for_each_station[i] = tmp_mae / this.station_num;
        }
        this.station_lats = station_lats;
        this.station_lngs = station_lngs;
        this.error_matrix = error_matrix;
        this.mae_for_each_station = mae_for_each_station;
        this.st_raster_diff = st_raster_diff;

        this.emitBadCase();
    }

    update(jsonData) {

        this.time_range = jsonData.time_range;
        this.time_fitness = jsonData.time_fitness;
        this.station_lats = jsonData.station_lats;
        this.station_lngs = jsonData.station_lngs;


        this.st_raster_gt = jsonData.st_raster_gt;
        this.st_raster_pred = jsonData.st_raster_pred;
        this.time_length = this.st_raster_gt[0].length;
        this.station_num = this.st_raster_gt.length;
        let error_matrix = new Array(this.time_length);
        let mae_for_each_station = new Array(this.station_num);
        let st_raster_diff = new Array(this.station_num);
        //TODO: 下面内容可以封装成函数
        for (var i = 0; i < this.station_num; i++) {

            var tmp_mae = 0;
            error_matrix[i] = new Array(this.time_length);
            st_raster_diff[i] = [];
            for (var j = 0; j < this.time_length; j++) {
                error_matrix[i][j] = this.st_raster_pred[i][j] - this.st_raster_gt[i][j];
                tmp_mae += Math.abs(error_matrix[i][j]);
                st_raster_diff[i].push(Math.abs(this.st_raster_pred[i][j]-this.st_raster_gt[i][j]));
            }
            mae_for_each_station[i] = tmp_mae / this.station_num;
        }
        this.error_matrix = error_matrix;
        this.mae_for_each_station = mae_for_each_station;
        this.st_raster_diff = st_raster_diff;

        this.emitBadCase();
    }

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
    emitStationInfo()
    {
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
            RMSE.push(Math.sqrt(total_rmse_variance / this.time_length));
            MAE.push(total_absolute_error / this.time_length);
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
        let bad_case_len = 1;  // 可修改参数，表示至少连续多长的异常可以被定义为bad_case
        let markArea = new Array(this.station_num);
        let start_time = '';
        let end_time = '';

        for (let i=0; i<this.station_num; i++) {
            markArea[i] = [];
            // 升序排列
            let diff = this.st_raster_diff[i];
            // 计算上下四分位数
            const quartiles = this.ct.calculateQuartiles(diff);
            // 初始化滑动窗口
            let window = 0;
            // 滑动窗口求markArea
            for (let j=0; j<this.time_length; j++) {
                if (diff[j] > quartiles.upperQuartile || diff[j] < quartiles.lowerQuartile) {
                    if (window === 0) {
                        window ++;
                        start_time = j;
                    }
                    else {
                        window ++;
                    }
                }
                else {
                    if (window >= bad_case_len) {
                        end_time = j;
                        window = 0;
                        markArea[i].push([{'xAxis': start_time, 'itemStyle': {'color': 'red', 'opacity': 0.3}},
                            {'xAxis': end_time}])
                    }
                    else if (window > 0 && window < bad_case_len) {
                        window = 0;
                    }
                }
            }
            // 最后一个时间片若满足mark_area也应该加入
            if (window > bad_case_len) {
                end_time = this.time_length -1;
                markArea[i].push([{'xAxis': start_time, 'itemStyle': {'color': 'yellow', 'opacity': 0.3}},
                    {'xAxis': end_time}]);
                window = 0;
            }
        }
        this.bad_case = markArea;
        console.log("mark Area is:", this.bad_case);
    }

    // 获得error hotspot
    emitErrorHotspotIndex() {
        // 定义worest_staion个数：取所有站点的前5%，向下取整
        let worest_staion_num = Math.ceil(0.05 * this.station_num);
        
        let bad_case_len_list = [];
        let bad_case_error_list = [];
        for (let i=0; i<worest_staion_num; i++) {
            // 获得站点对应的索引值
            let index = this.PointSortedRMSE[i][0];
            console.log("worest statation index:", index);
            // 获得站点对应的bad case list
            let bad_case_list = this.bad_case[index];
            for (let j=0; j<bad_case_list.length; j++) {
                // 对于每个bad case
                let left = bad_case_list[j][0]['xAxis'];
                let right = bad_case_list[j][1]['xAxis'];
                // 计算bad case持续的长度
                let bad_case_len = right - left;
                bad_case_len_list.push({'index': [i, j], 'length': bad_case_len});
                console.log("len:", bad_case_len);
                // 计算局部local rmse
                let rmse = this.ct.calculate_local_rmse(this.st_raster_pred[i].slice(left, right+1), this.st_raster_gt[i].slice(left, right+1))
                console.log("rmse:", rmse);
                bad_case_error_list.push({'index': [i, j], 'error': rmse});
            }
        }
        console.log("bad_case_len_list:", bad_case_len_list);
        console.log("bad_case_error_list:", bad_case_error_list);

        // 取前5%的bad case作为top-k error hotspot
        let semi_k = Math.ceil(0.05 * bad_case_len_list.length);
        bad_case_len_list.sort((a, b) => a.length > b.length ? -1 : a.length < b.length ? 1 : 0);
        bad_case_error_list.sort((a, b) => a.rmse > b.rmse ? -1 : a.rmse < b.rmse ? 1 : 0);
        console.log("sorted_bad_case_len_list:", bad_case_len_list);
        console.log("sorted_bad_case_error_list:", bad_case_error_list);
        
        this.error_hotspot_index = {
            'length': [],
            'error': [],
        };
        for (let i=0; i<semi_k; i++) {
            this.error_hotspot_index['length'].push(bad_case_len_list[i]['index']);
            this.error_hotspot_index['error'].push(bad_case_error_list[i]['index']);
        }
        console.log("error hotpost index:", this.error_hotspot_index);
    }

    /*
        绘图参数
    */

    // gt & pd & local bad case
    getTemporalBadCaseParam(spatial_ind) {
        console.log("========plot temporal bad case=========")
        let pd=this.st_raster_pred[spatial_ind];
        let gt=this.st_raster_gt[spatial_ind];
        // 没有time_fitness, time_range 数据时
        let ts_len=this.st_raster_gt[spatial_ind].length;
        let ts=this.ct.range(0, ts_len, 1);
        let mark_area = this.bad_case[spatial_ind];

        let startIndex=-1;
        let endIndex=-1;
        this.temp_bad_case_param = [pd, gt, ts, mark_area, startIndex, endIndex]
        console.log("temp_bad_case_param:", this.temp_bad_case_param);
    }

    // map
    getMapParam() {
        
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
        this.sort_rmse_param = [rmse_index_list, sorted_rmse_list];
        this.sort_mae_param = [mae_index_list, sorted_mae_list];
        console.log("sort_rmse_param:", this.sort_rmse_param);
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
}

