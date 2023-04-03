/*draw map, Groundtruth and Prediction, RMSE*/
import {iforest} from "./anomaly_detection";
import * as line from "./line_final"
import * as map from "./map"

export function drawLine() {

    /*左下柱状图*/
    let model_option = line.createModelAnanlysisOption();
    line.drawModelAnalysis(model_option, 'model_analysis')
    /*右上折线图*/
    let Initoption = line.createoption(data,pointID,StartInd,EndInd,MethodID);
    line.drawline(Initoption, 'container_line');

    /*metric折线图*/
    let metric_option = line.createMetricsoption(MethodID,pointID);
    line.drawhistogram(metric_option, 'rmseline2');

    /*异常检测*/
    iforest();

}
export function drawMap() {
    console.log("now_MAPInd：", MAPInd)
    if(MAPInd == 0) {
        if(FilterInvalidNodeFlag == 0){
            var InitMapoption = map.createMapOption(data,data['Node']['StationInfo'],StationIndArr,pointID);
            map.drawmap(InitMapoption);
        }
        else if(FilterInvalidNodeFlag == 1){
            var InitMapoption = map.createMapOption(data,FilterInvalidNodeInfo,InvalidNodeIndArr,pointID);
            map.drawmap(InitMapoption);
        }

    }
    else if(MAPInd == 1) {
        // XMBaidu
        map.map();
    }
}