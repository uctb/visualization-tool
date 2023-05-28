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
    
    getSequenceRange(sequence, interval_num) {
        let tmp = {};
        let interval_point = [];
        let interval_name = [];
        
        let min = Math.min(...sequence);
        let max = Math.max(...sequence);
        let interval = (max-min)/interval_num
        
        let left = min;
        let right = left + interval;
        for (let i = 0; i < interval_num; i++) {
            interval_point.push(left);

            right = left + interval;
            let range = left.toFixed(0) + ' ~ ' + right.toFixed(0);
            interval_name.push(range);

            tmp[i] = 0;

            left = right;
        }
        interval_point.push(left);
        tmp['interval_point'] = interval_point;
        tmp['interval_name'] = interval_name;
        return tmp;
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

    calculateQuartiles(sequence) {
        const SortedSequence = sequence;
        const sortedSequence = SortedSequence.sort((a, b) => a - b);
        const n = sortedSequence.length;
        const upperQuartileIndex = Math.floor(n * 0.75);
        // const constlowerQuartileIndex = Math.floor(n * 0.25);

        const upperQuartile = sortedSequence[upperQuartileIndex];
        // const lowerQuartile = sortedSequence[lowerQuartileIndex];

        // return { upperQuartile, lowerQuartile };
        return upperQuartile;
    }

    calculateMean(sequence) {
        const filteredSequence = sequence.filter(value => isFinite(value));
        const sum = filteredSequence.reduce((acc, value) => acc + value, 0);
        const mean = sum / filteredSequence.length;
        return mean;
    }

    calculateStandardDeviation(sequence) {
        const mean = this.calculateMean(sequence);
        const squaredDifferences = sequence.map(value => Math.pow(value - mean, 2));
        const sumSquaredDifferences = squaredDifferences.reduce((acc, value) => acc + value, 0);
        const variance = sumSquaredDifferences / sequence.length;
        const standardDeviation = Math.sqrt(variance);
        return standardDeviation;
    }

    calculate_local_rmse(pd, gt) {
        let time_length = pd.length;
        let total_rmse_variance = 0;
        for (let i=0; i<time_length; i++) {
            total_rmse_variance += Math.pow(Math.abs(pd[i]-gt[i]), 2);
        }
        let rmse = Math.sqrt(total_rmse_variance / time_length);
        return rmse;
    }


    MapWeekDay(param) {
        const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return weekdays.indexOf(param);
    }
    
    get24HourSeries() {
        let hour_series = [];
        for (let i=0; i<24; i++) {
            hour_series.push(i.toString().padStart(2, '0'))
        }
        return hour_series;
    }

}