﻿
/*读取本地数据集（json文件）存入全局变量*/

window.onload = function () {
    var url_chongqing = "./data/0527_Metro_Chongqing_pred.json"
    var url_xian = "./data/0527_DiDi_Xian_pred.json"
    var url_xiamen = "./data/0510_violation_XM_pred.json"
    var url_NYC = "./data/0512_Bike_NYC_pred.json"
    var url_DC = "./data/0512_Bike_DC_pred.json"
    var url_Chicago = "./data/0512_Bike_Chicago_pred.json"

  /*  var request1 = new XMLHttpRequest();
    request1.open("get", url_chongqing);/!*设置请求方法与路径*!/
    request1.send(null);/!*不发送数据到服务器*!/
    request1.onload = function () {/!*XHR对象获取到返回信息后执行*!/
        if (request1.status == 200) {/!*返回状态为200，即为数据获取成功*!/
            Metro_Chongqing = JSON.parse(request1.responseText);
        }
    }
    var request2 = new XMLHttpRequest();
    request2.open("get", url_xian);/!*设置请求方法与路径*!/
    request2.send(null);/!*不发送数据到服务器*!/
    request2.onload = function () {/!*XHR对象获取到返回信息后执行*!/
        if (request2.status == 200) {/!*返回状态为200，即为数据获取成功*!/
            DiDi_Xian = JSON.parse(request2.responseText);
        }
    }*/
    var request3 = new XMLHttpRequest();
    request3.open("get", url_xiamen);/*设置请求方法与路径*/
    request3.send(null);/*不发送数据到服务器*/
    request3.onload = function () {/*XHR对象获取到返回信息后执行*/
        if (request3.status == 200) {/*返回状态为200，即为数据获取成功*/
            Violation_XM = JSON.parse(request3.responseText);
            console.log("XM:", Violation_XM)
        }
    }
    var request4 = new XMLHttpRequest();
    request4.open("get", url_NYC);/*设置请求方法与路径*/
    request4.send(null);/*不发送数据到服务器*/
    request4.onload = function () {/*XHR对象获取到返回信息后执行*/
        if (request4.status == 200) {/*返回状态为200，即为数据获取成功*/
            Bike_NYC = JSON.parse(request4.responseText);
            console.log("NYC:", Bike_NYC);
        }
    }
    var request5 = new XMLHttpRequest();
    request5.open("get", url_DC);/*设置请求方法与路径*/
    request5.send(null);/*不发送数据到服务器*/
    request5.onload = function () {/*XHR对象获取到返回信息后执行*/
        if (request5.status == 200) {/*返回状态为200，即为数据获取成功*/
            Bike_DC = JSON.parse(request5.responseText);
            console.log("DC:", Bike_DC);
        }
    }
    var request6 = new XMLHttpRequest();
    request6.open("get", url_Chicago);/*设置请求方法与路径*/
    request6.send(null);/*不发送数据到服务器*/
    request6.onload = function () {/*XHR对象获取到返回信息后执行*/
        if (request6.status == 200) {/*返回状态为200，即为数据获取成功*/
            Bike_Chicago = JSON.parse(request6.responseText);
            console.log("Chicago:", Bike_Chicago);
        }
    }

}


/*highlight button*/
let HighlightButton = {
    methods: {
        // 是否开启折线图拐点，用颜色区分相对误差
        Highlight() {
            if(line_highlight === 0) {line_highlight = 1;}
            else {line_highlight = 0; }

            /*error折线图*/
            let Initoption = createoption(data,pointID,StartInd,EndInd,MethodID);
            drawline(Initoption);

            let RMSE_option = createMetricsoption(MethodID);
            drawhistogram(RMSE_option, 'rmseline2');
        }
    }
}
let Ctor_highlight = Vue.extend(HighlightButton)
new Ctor_highlight().$mount('#highlightbutton')


/*bad case button*/
let BadCaseButton = {
    methods: {
        BadCase() {
            if(bad_case_flag === 0) {
                bad_case_flag = 1;
                // 修改容器名称
                document.getElementById('line_graph').innerText = 'All Regions Bad Case Amount Rank List';

                // bad case rank histogram
                let BadCase_option = createBadCaseoption(MethodID,pointID);
                drawhistogram(BadCase_option, 'container_line');
            }
            else if(bad_case_flag === 1) {
                bad_case_flag = 2;
                // 修改容器名称
                document.getElementById('line_graph').innerText = 'Terrible Time';

                // bad case timeslots amount line
                let option = createTimeBadCaseoption(data,pointID,StartInd,EndInd,MethodID);
                drawline(option);
            }
            else if(bad_case_flag ===2) {
                bad_case_flag = 0;
                // 修改容器名称
                document.getElementById('line_graph').innerText = 'Groundtruth and Prediction (point 0)';

                // prediction and groundtruth
                let Initoption = createoption(data,pointID,StartInd,EndInd,MethodID);
                drawline(Initoption);
            }

        }
    }
}
let Ctor_badcase = Vue.extend(BadCaseButton)
new Ctor_badcase().$mount('#BadCaseButton')


/*Metrics Distribution button*/
let MetricsDistributionButton = {
    methods: {
        MetricsDistribution() {
            if(metricflag === 0) {
                metricflag = 1;
                // 修改容器名称
                document.getElementById('rmse2').innerText = 'RMSE Distribution';

                // rmse distribution histogram
                let option = createRMSEDistributionoption(MethodID, PointRMSERange);
                drawhistogram(option, 'rmseline2')
            }
            else if(metricflag === 1) {
                metricflag = 2;
                // 修改容器名称
                document.getElementById('rmse2').innerText = 'MAE Distribution';

                // mae distribution histogram
                let option = createRMSEDistributionoption(MethodID, PointMAERange);
                drawhistogram(option, 'rmseline2')
            }
            else if(metricflag === 2) {
                metricflag = 3;
                // 修改容器名称
                document.getElementById('rmse2').innerText = 'MAPE Distribution';

                // mape distribution histogram
                let option = createRMSEDistributionoption(MethodID, PointMAPERange);
                drawhistogram(option, 'rmseline2')
            }
            else if(metricflag === 3) {
                metricflag = 0;
                // 修改容器名称
                document.getElementById('rmse2').innerText = 'Metrics Rank List';

                // Metrics Rank List
                let metric_option = createMetricsoption(MethodID,pointID);
                drawhistogram(metric_option, 'rmseline2');
            }

        }
    }
}
let Ctor_metric = Vue.extend(MetricsDistributionButton)
new Ctor_metric().$mount('#MetricsDistributionButton')




