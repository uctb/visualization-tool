export default class InputProcessor {
    constructor() {
        this.pred_st_raster = new Array();
        this.gt_st_raster = new Array();
        this.station_info = new Array();
        this.graph = new Array();
    }
    clear() {
        this.pred_st_raster = new Array();
        this.gt_st_raster = new Array();
        this.station_info = new Array();
        this.graph = new Array();
    }
    setSTRaster(file, type) {
        if (type == 'gt') {
            parseTSV(file, this.gt_st_raster)
        }
        else if (type == 'pred') {
            parseTSV(file, this.pred_st_raster)
        }
        else if (type == 'stationinfo') {
            parseTSV(file, this.station_info)
        }
        else if (type == 'graph') {
            parseTSV(file, this.graph)
        }
    }
}

function parseTSV(file, targetArray) {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
        let str = this.result;
        let lines = str.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let values = lines[i].split('\t');
            targetArray[i] = new Array();
            for (let j = 0; j < values.length; j++) {
                if(i==lines.length-1) {
                }
                targetArray[i][j] = parseFloat(values[j]);
            }
            if(i==lines.length-1) {
            }
        }
        console.log(targetArray);
    }
}