
/*model*/

/*HM*/
import {ChangeMethod} from './myfun'

const SelectModel = {
    el: '#model',
    data() {
        return {
            model_list : []
        };
    },
    methods: {
        transferdata(selectedid) {
            this.$forceUpdate();
            ChangeMethod(selectedid);

            }
        }
    }

const ItemplusButton_model = {
    emits: ['selectData'],
    props: ['title', 'modelid'],
    template: `<div><li class="datasets">{{title}}</li><li class="button"><el-button circle icon="el-icon-circle-check" size="mini" id="item" @click="$emit('select',modelid)"></el-button></li></div>`
}
    
const bpp = new Vue(SelectModel)
Vue.component('ibm', ItemplusButton_model)
export {bpp}

// var HM = {
//     data () {
//         return {
//             value: true
//         };
//     },
//     methods: {
//         test() {
//             var methodid = MethodNameArray.map(item => item).indexOf('HM');
//             if(methodid < 0 || methodid > (FunctionNum-2) ){
//                 alert("The model does not exist!")
//             }
//             ChangeMethod(methodid);
//         }
//     }
// }
// var CtorHM = Vue.extend(HM)
// new CtorHM().$mount('#HM')

