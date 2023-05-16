import ComputeTool from './function.js'
import Model from './Model'
export default class Option extends Model{
    constructor() {
        super();
        this.ct = new ComputeTool();
        this.temp_bad_case_param = [];
    }
    
    getTemporalBadCaseParam(spatial_ind) {
        console.log("plot temporal bad case")
        let pd=this.model.st_raster_pred[spatial_ind];
        let gt=this.model.st_raster_gt[spatial_ind];
        // 没有time_fitness, time_range 数据时
        let ts_len=this.model.st_raster_gt[spatial_ind].length;
        let ts=this.ct.range(0, ts_len, 1);

        let startIndex=-1;
        let endIndex=-1;
        this.temp_bad_case_param = [pd, gt, ts, startIndex, endIndex]
    }
}