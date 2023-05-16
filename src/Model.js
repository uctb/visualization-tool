
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
        //TODO: 下面内容可以封装成函数
        for (var i = 0; i < this.station_num; i++) {
            station_lats[i] = this.station_info[i][0];
            station_lngs[i] = this.station_info[i][1];
            var tmp_mae = 0;
            error_matrix[i] = new Array(this.time_length);
            for (var j = 0; j < this.time_length; j++) {
                error_matrix[i][j] = this.st_raster_pred[i][j] - this.st_raster_gt[i][j];
                tmp_mae += Math.abs(error_matrix[i][j]);
            }
            mae_for_each_station[i] = tmp_mae / this.station_num;
        }
        this.station_lats = station_lats;
        this.station_lngs = station_lngs;
        this.error_matrix = error_matrix;
        this.mae_for_each_station = mae_for_each_station;
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
        //TODO: 下面内容可以封装成函数
        for (var i = 0; i < this.station_num; i++) {

            var tmp_mae = 0;
            error_matrix[i] = new Array(this.time_length);
            for (var j = 0; j < this.time_length; j++) {
                error_matrix[i][j] = this.st_raster_pred[i][j] - this.st_raster_gt[i][j];
                tmp_mae += Math.abs(error_matrix[i][j]);
            }
            mae_for_each_station[i] = tmp_mae / this.station_num;
        }
        this.error_matrix = error_matrix;
        this.mae_for_each_station = mae_for_each_station;

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
    
    getTemporalBadCaseParam(spatial_ind) {
        console.log("plot temporal bad case")
        this.pd=this.st_raster_pred[spatial_ind];
        this.gt=this.st_raster_gt[spatial_ind];
        let ts_len=this.st_raster_gt[spatial_ind].length;
        this.ts=this.ct.range(0, ts_len, 1);
        this.startIndex=-1;
        this.endIndex=-1;
        this.temp_bad_case_param = [this.pd, this.gt, this.ts, this.startIndex, this.endIndex]
    }
    
}

