/*选择数据集*/
const SelectDataset = {
    el: '#SelectDataset',
    data() {
        return {
            ds_obj_list: [],
            value: true,

        };
    },
    methods: {
        transferdata(selectedid) {
            if (selectedid >= 0) {
                data = data_obj_list[selectedid].data
                MAPInd = 0;

                ClearDataSet();
                for (x in data.Pred) {
                    DatasetList.push(x)
                }
                StartDataSet();
            }
        }
    }

}

const ItemplusButton = {
    emits: ['selectData'],
    props: ['title', 'datasetid'],
    template: `<div><li class="datasets">{{title}}</li><li class="button"><el-button circle icon="el-icon-circle-check" size="mini" id="item" @click="$emit('select',datasetid)"></el-button></li></div>`
}

const app = new Vue(SelectDataset)

Vue.component('ib', ItemplusButton)

let Load = {
    data() {
        return {
            fileList: []
        };
    },
    methods: {
        handleRemove(file, fileList) {
            console.log(file, fileList);
        },
        handlePreview(file) {
            console.log(file);
        },
        handleExceed(files, fileList) {
            this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
        },
        beforeRemove(file, fileList) {
            return this.$confirm(`确定移除 ${file.name}？`);
        },
        handleLoad(response, file, fileList) {
            console.log("now load the new dataset!")
            let SelectedFile = file.raw
            let filename = SelectedFile.name.split('.')[0].split('_')
            let dataset_name = filename[0] + '_' + filename[1]
            console.log("new dataset name:", dataset_name)
            data_obj_list.push({
                    'name': dataset_name,
                    'data': {},
                    'item': {
                        methodlist: null,
                        button: null
                    }
                }
            );
            let reader = new FileReader()
            reader.readAsText(SelectedFile)
            reader.onload = function () {
                let json = JSON.parse(this.result);
                data_obj_list[dataset_list_len].data = json;
                data = json;
                ClearDataSet();
                for (x in data.Pred) {
                    DatasetList.push(x);
                }
                StartDataSet();
            }
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
