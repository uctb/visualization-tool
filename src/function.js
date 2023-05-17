export default class ComputeTool  {
    constructor() {
        
    }
    range(start, end, step) {
        let arr = [];
        for(let i=0; i<end; i++){
            if(i%step==0){arr.push(i)}
        }
        return arr;
    }
    getMetricsRange(left, interval_num, interval) {
        let tmp = {};
        let interval_point = [];
        let interval_name = [];
        let right = left + interval;
         for (let i = 0; i < interval_num; i++) {
            interval_point.push(left);

            right = left + interval;
            let range = left.toFixed(2) + ' ~ ' + right.toFixed(2);
            interval_name.push(range);

            tmp[i] = 0;

            left = right;
         }
        interval_point.push(left);
        tmp['interval_point'] = interval_point;
        tmp['interval_name'] = interval_name;
        return tmp;
    }
    
    getIntervalID(interval_list, interval_num, metric) {
        if(metric === interval_list[interval_num]) {
            return interval_num-1;
        }
        for (let i = 1; i < interval_num+1; i++) {
            if (metric < interval_list[i] && metric >= interval_list[i-1]) {
                return i-1;
            }
        }
    }
    
}