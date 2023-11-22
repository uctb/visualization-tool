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

    calculate_quantile(arr, q) {
        const sorted = arr.slice().sort((a, b) => a - b);
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;

        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    }

    calculateMean(sequence) {
        const filteredSequence = sequence.filter(value => isFinite(value));
        const sum = filteredSequence.reduce((acc, value) => acc + value, 0);
        const mean = sum / filteredSequence.length;
        return mean;
    }

    // 计算相对误差&绝对误差
    calculateAEpoint(pred, gt) {
        return Math.abs(gt - pred);
    }

    calculateAE(pred,gt) {
        return gt.map((gt, index) => this.calculateAEpoint(gt, pred[index]));
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

    calculate_ratio(all, sum) {
        let result = {};
        const all_keys = Object.keys(all)
        const sum_keys = Object.keys(sum)
        for (let i=0; i<all_keys.length; i++) {
            let all_key = all_keys[i]
            let sum_key = sum_keys[i]
            if (all[all_key] !== 0) {
                result[all_key] = sum[sum_key] / all[all_key];
            }else {
                result[all_key] = 0;
            }
        }
        return result;
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

    /* 判断bad case */
    isArrayAllZero(array) {
        return array.every(element => element === 0);
    }

    isVariationWithinOne(array) {
        for (let i = 0; i < array.length - 1; i++) {
            if (Math.abs(array[i] - array[i + 1]) > 1) {
                return false;
            }
        }
        return true;
    }

    bootstrap(data, predictions, numResamples, statistic) {
        let resamples = [];
        for (let i = 0; i < numResamples; i++) {
            let resampleErrors = [];
            for (let j = 0; j < data.length; j++) {
                const errorIndex = Math.floor(Math.random() * data.length);
                const error = data[errorIndex] - predictions[errorIndex];
                resampleErrors.push(error);
            }
            resamples.push(statistic(resampleErrors));
        }
        return resamples;
    }

    mean(data) {
        return data.reduce((a, b) => a + b, 0) / data.length;
    }

    bootstrapT(data, numResamples, statistic) {
        const originalStat = statistic(data);
        let tValues = [];

        for (let i = 0; i < numResamples; i++) {
            let resample = data.map(() => data[Math.floor(Math.random() * data.length)]);
            let resampleStat = statistic(resample);

            // Calculate standard error of the resample
            let se = Math.sqrt(resample.map(x => Math.pow(x - resampleStat, 2)).reduce((a, b) => a + b, 0) / resample.length);

            // Avoid division by zero in case of a resample with no variation
            if (se === 0) continue;

            // Calculate the t-value for the resample
            let tValue = (resampleStat - originalStat) / se;
            tValues.push(tValue);
        }

        // Calculate the percentiles for t-distribution to get the confidence interval
        tValues.sort((a, b) => a - b);
        let lowerPercentile = tValues[Math.floor(2.5 / 100 * tValues.length)];
        let upperPercentile = tValues[Math.floor(97.5 / 100 * tValues.length)];

        // Calculate the standard error of the original data
        let seOriginal = Math.sqrt(data.map(x => Math.pow(x - originalStat, 2)).reduce((a, b) => a + b, 0) / data.length);

        // Calculate the confidence interval for the original statistic
        let ciLower = originalStat + lowerPercentile * seOriginal;
        let ciUpper = originalStat + upperPercentile * seOriginal;

        return { ciLower, ciUpper, tValues };
    }
}