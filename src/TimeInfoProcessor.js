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
        // let start_year = this.start_date.split(" ")[0]
        // console.log(start_year)
    }


}