export default class InputProcessor {
    constructor() {
        this.pred_st_raster = new Array();
        this.gt_st_raster = new Array();
        this.station_info = new Array();
        this.graph = new Array();
        this.cluster = new Array();
        this.granger = new Array();
        this.pearson = new Array();
    }

    setSTRaster(file, type) {
        this.parseJSON(file, type);
    }

    parseJSON(file, type) {
        let reader = new FileReader();
        reader.readAsText(file);
        
        reader.onload = (event) => { 
            let str = event.target.result;
            const jsonData = JSON.parse(str);
            if (type === 'auxiliary') {
                this.cluster[0] = jsonData.temporalCluster;
                this.cluster[1] = jsonData.spatialCluster;
                this.granger = jsonData.granger;
                this.pearson = jsonData.pearson;
            } else {
                this.gt_st_raster = jsonData.groudTruth;
                this.pred_st_raster = jsonData.prediction;
                this.station_info = jsonData.stationInfo;
                this.graph = jsonData.graph;
            }
        };

        reader.onerror = (error) => {
            console.error("Error reading the file:", error);
        };
    }
}
