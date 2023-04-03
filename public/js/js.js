import * as map from './map.js'
import * as Utils from './myfun.js'
import * as line from './line_final'
import {app} from './SelectDataseets'
/*读取本地数据集（json文件）存入全局变量*/

function read_json() {
    let url_record = './data/record.json';
    let prefix = './data/';
    let suffix = '_pred.json';

    var request = new XMLHttpRequest();

    request.open("get", url_record); /!*设置请求方法与路径*!/
    request.send(null); /!*不发送数据到服务器*!/
    request.onload = function () {
        /!*XHR对象获取到返回信息后执行*!/
        if (request.status == 200) {
            /!*返回状态为200，即为数据获取成功*!/
            record = JSON.parse(request.responseText);
            console.log(record);
            dataset_name_list = record;
            dataset_list_len = dataset_name_list.length;
            for(var i =0; i < dataset_list_len;i++)
            {
                app.ds_obj_list.push(new function(name,index)
                {
                    this.name = name;
                    this.id = index;
                }(dataset_name_list[i],i))
            }
            // for (var i = 0; i < dataset_name_list.length; i++) {
            //     data_obj_list.push(new function(name){
            //         this.name = name
            //         this.data = {}
            //         this.item ={
            //             methodlist:null,
            //             button:null
            //         }
            //     }(dataset_name_list[i]));
            // 默认数据集导入
            load_default_dataset(prefix,dataset_name_list[0],suffix)
            }
        }
    }
function load_default_dataset(prefix,dataset_name,suffix)
{
    let request = new XMLHttpRequest();
    request.open("get", prefix + dataset_name + suffix); /!*设置请求方法与路径*!/
    request.send(null); /!*不发送数据到服务器*!/
    request.onload = function () {
        /!*XHR对象获取到返回信息后执行*!/
        if (request.status == 200) {
            /!*返回状态为200，即为数据获取成功*!/
            let json = JSON.parse(request.responseText);
            console.log('Parse Success!')
            data = json
            console.log("data:", data)
            MAPInd = 0;
            for (x in data.Pred) {
                DatasetList.push(x)
            }
            Utils.StartDataSet();
        }
    }
}
window.onload = function () {

    read_json();

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

}


/*highlight button*/
let HighlightButton = {
    methods: {
        // 是否开启折线图拐点，用颜色区分相对误差
        Highlight() {
            if (line_highlight === 0) { line_highlight = 1; }
            else { line_highlight = 0; }

            /*error折线图*/
            let Initoption = line.createoption(data, pointID, StartInd, EndInd, MethodID);
            line.drawline(Initoption);

            let RMSE_option = line.createMetricsoption(MethodID);
            line.drawhistogram(RMSE_option, 'rmseline2');
        }
    }
}
let Ctor_highlight = Vue.extend(HighlightButton)
new Ctor_highlight().$mount('#highlightbutton')

/*bad case button*/
/*let badcasebutton = {
    data() {
        return {
            options: [{
                value: '0',
                label: 'spatial view'
            }, {
                value: '1',
                label: 'temporal view'
            }, {
                value: '2',
                label: 'value'
            }],
            value: ''
        }
    },
    methods: {
        BadCase() {
            console.log(typeof(this.value))
            if (this.value === '0') {
                // 修改容器名称
                document.getElementById('line_graph').innerText = 'All Regions Bad Case Amount Rank List';

                // bad case rank histogram
                let BadCase_option = createBadCaseoption(MethodID, pointID);
                drawhistogram(BadCase_option, 'container_line');
            }
            else if (this.value === '1') {
                // 修改容器名称
                document.getElementById('line_graph').innerText = 'Terrible Time';

                // bad case timeslots amount line
                let option = createTimeBadCaseoption(data, pointID, StartInd, EndInd, MethodID);
                drawline(option);
            }
            else if (this.value === '2') {
                // 修改容器名称
                document.getElementById('line_graph').innerText = 'Groundtruth and Prediction (point 0)';

                // prediction and groundtruth
                let Initoption = createoption(data, pointID, StartInd, EndInd, MethodID);
                drawline(Initoption);
            }

        }
    }
}
let Ctor_badcasebutton = Vue.extend(badcasebutton)
new Ctor_badcasebutton().$mount('#badcasebutton')*/


/*Metrics Distribution button*/
let MetricsDistributionButton = {
    data() {
        return {
            options: [{
                value: '0',
                label: 'RMSE Distribution'
            }, {
                value: '1',
                label: 'MAE Distribution'
            }, {
                value: '2',
                label: 'MAPE Distribution'
            }, {
                value: '3',
                label: 'Metrics Rank List'
            }, {
                value: '4',
                label: 'spatial view'
            }, {
                value: '5',
                label: 'temporal view'
            }],
            value: ''
        }
    },
    methods: {
        MetricsDistribution() {
            if (this.value === '0') {
                // 修改容器名称
                document.getElementById('rmse2').innerText = 'RMSE Distribution';

                // rmse distribution histogram
                let option = line.createRMSEDistributionoption(MethodID, PointRMSERange);
                line.drawhistogram(option, 'rmseline2')
            }
            else if (this.value === '1') {
                metricflag = 2;
                // 修改容器名称
                document.getElementById('rmse2').innerText = 'MAE Distribution';

                // mae distribution histogram
                let option = line.createRMSEDistributionoption(MethodID, PointMAERange);
                line.drawhistogram(option, 'rmseline2')
            }
            else if (this.value === '2') {
                // 修改容器名称
                document.getElementById('rmse2').innerText = 'MAPE Distribution';

                // mape distribution histogram
                let option = line.createRMSEDistributionoption(MethodID, PointMAPERange);
                line.drawhistogram(option, 'rmseline2')
            }
            else if (this.value === '3') {
                // 修改容器名称
                document.getElementById('rmse2').innerText = 'Metrics Rank List';

                // Metrics Rank List
                let metric_option = line.createMetricsoption(MethodID, pointID);
                line.drawhistogram(metric_option, 'rmseline2');
            }
            else if (this.value === '4') {
                // 修改容器名称
                document.getElementById('rmse2').innerText = 'All Regions Bad Case Amount Rank List';

                // bad case rank histogram
                let BadCase_option = line.createBadCaseoption(MethodID, pointID);
                line.drawhistogram(BadCase_option, 'rmseline2');
            }
            else if (this.value === '5') {
                // 修改容器名称
                document.getElementById('rmse2').innerText = 'Terrible Time';

                // bad case timeslots amount line
                let option = line.createTimeBadCaseoption(data, pointID, StartInd, EndInd, MethodID);
                line.drawline(option, 'rmseline2');
            }

        }
    }
}
let Ctor_metric = Vue.extend(MetricsDistributionButton)
new Ctor_metric().$mount('#MetricsDistributionButton')

/*过滤无效点*/
let InvalidSwitch = {
    data() {
        return {
            value: false
        }
    },
    methods: {
        // 由于原本的metric就是去除了无效点后计算的，因此无需重新绘制各类分析图，仅需修改地图上绘制的点
        FilterInvalidPoint($event) {
            console.log($event);
            if($event == 1) {
                console.log("打开过滤无效点开关！")
                FilterInvalidNodeFlag = 1;
                // 重新绘制地图
                RemovePointOfStationInfo();
                let InitMapoption = map.createMapOption(data, FilterInvalidNodeInfo,InvalidNodeIndArr,pointID);
                map.drawmap(InitMapoption);
            }
            else if($event == 0){
                console.log("关闭过滤无效点开关！")
                FilterInvalidNodeFlag = 0;
                let InitMapoption = map.createMapOption(data,data['Node']['StationInfo'],StationIndArr,pointID);
                map.drawmap(InitMapoption);
            }
        }
    }
}
let Ctor_filter = Vue.extend(InvalidSwitch)
new Ctor_filter().$mount('#InvalidSwitch')

