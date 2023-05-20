export default class TimeInfoProcessor
{
    /*专门处理时间有关的信息 */
    constructor() {

    }
    updateParam(start_date,end_date,time_fitness){
        this.start_date = start_date
        this.end_date = end_date
        this.time_fitness = time_fitness
    }
    emitTimeSeries() {
        console.log("here")
        console.log(typeof this.start_date)
        // 先自定义Start Date, End Date做测试
        start_date = new Date(2017, 8, 1)
        end_data = new Date(2017, 9, 20)
        const Gap = 1000*60*now_Timefitness // 将timefitness转化为ms
        
    }


}