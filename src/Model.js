
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
    emitDiff() {
        // 计算得到difference序列，取上下四分位数以外的点

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

        let startIndex=-1;
        let endIndex=-1;
        this.temp_bad_case_param = [pd, gt, ts, startIndex, endIndex]
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

