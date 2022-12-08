/*下拉框选择数据集*/
const SelectDataset = {
    el: '#dataset',
    data() {
        return {
            ds_obj_list : []
        };
    },
    methods: {
        transferdata(selectedid) {
            if (selectedid >= 0) {
                console.log('I\'m In')
                this.$forceUpdate();
                console.log(this.ds_obj_list.id, this.ds_obj_list.name);
                let request = new XMLHttpRequest();
                request.open("get", prefix + dataset_name_list[selectedid] + suffix); /!*设置请求方法与路径*!/
                request.send(null); /!*不发送数据到服务器*!/
                request.onload = function () {
                    /!*XHR对象获取到返回信息后执行*!/
                    if (request.status == 200) {

                        /!*返回状态为200，即为数据获取成功*!/
                        json = JSON.parse(request.responseText);
                        console.log('Parse Success!')
                        MAPInd = 0;
                        data = json
                        ClearDataSet();
                        for (x in data.Pred) {
                            DatasetList.push(x)
                        }
                        StartDataSet();
                    }
                }
            }

            }
        }
    }
const app = new Vue(SelectDataset)

/*按钮选择数据集*/
/*
const ItemplusButton = {
    emits: ['selectData'],
    props: ['title', 'datasetid'],
    template: `<div><li class="datasets">{{title}}</li><li class="button"><el-button circle icon="el-icon-circle-check" size="mini" id="item" @click="$emit('select',datasetid)"></el-button></li></div>`
}
const app = new Vue(SelectDataset)
Vue.component('ib', ItemplusButton)
*/

/*Load*/
let Load = {
    data() {
        return {
        };
    },
    methods: {
        beforeUpload(file) {
            console.log("here")
            let SelectedFile = file
            let reader = new FileReader()
            reader.readAsText(SelectedFile)
            reader.onload = function () {
                let json = JSON.parse(this.result);
                data = json;
                MAPInd = 0;
                ClearDataSet();
                for (x in data.Pred) {
                    DatasetList.push(x)
                }
                StartDataSet();
            }
            return false
        }
    }
};
let Ctor_Load = Vue.extend(Load)
new Ctor_Load().$mount('#load')


// function update_buttons() {
//     for (let i = 0; i < dataset_list_len; i++) {
//         console.log('fuck')

//         data_obj_list[i].button = new function (mydata) {
//             this.methods = {
//                 test() {
//                     data = mydata;
//                     MAPInd = 0;

//                     ClearDataSet();
//                     for (x in data.Pred) {
//                         DatasetList.push(x)
//                     }
//                     StartDataSet();
//                 }
//             }
//             return this
//         }(data_obj_list[i].data)
//         var Cto = Vue.extend(data_obj_list[i].button)
//         new Cto().$mount('#' + data_obj_list[i].name)
//     }
// }

// var NYC = {
//     methods: {
//         test() {

//             data = Bike_NYC;
//             MAPInd = 0; // 选择地图

//             // 获得该数据集下各个子数据集
//             ClearDataSet();
//             for (x in data.Pred) {
//                 DatasetList.push(x);
//             }
//             StartDataSet();

//         }
//     }
// }
// var Ctor2 = Vue.extend(NYC)
// new Ctor2().$mount('#NYC')
