/*Load*/
let predLoad = {
    data() {
        return {
        };
    },
    methods: {
        beforeUpload(file) {
            console.log("here");
            let SelectedFile = file;
            let reader = new FileReader();
            reader.readAsText(SelectedFile);
            reader.onload = function () {
                let str = this.result;
                x = str.split('\n');
                for (var i =0;i<x.length;i++)
                {
                    y = x[i].split('\t');
                    pred_st_raster[i] = new Array();
                    for (var j=0;j<y.length;j++)
                    {
                        pred_st_raster[i][j] = parseFloat(y[j])
                    }
                }
                console.log(pred_st_raster)
            }
            return false
        }
    }
};

let Ctor_Loadpred = Vue.extend(predLoad)
new Ctor_Loadpred().$mount('#predload')

let gtLoad = {
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
                let str = this.result;
                x = str.split('\n');
                for (var i =0;i<x.length;i++)
                {
                    y = x[i].split('\t');
                    gt_st_raster[i] = new Array();
                    for (var j=0;j<y.length;j++)
                    {
                        gt_st_raster[i][j] = parseFloat(y[j])
                    }
                }
            }
            return false
        }
    }
};
let Ctor_Loadgt = Vue.extend(gtLoad)
new Ctor_Loadgt().$mount('#gtload')