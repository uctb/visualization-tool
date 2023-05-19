export default class TimeInfoProcessor
{
    /*专门处理时间有关的信息 */
    constructor() {
        this.start_time = ""
        this.end_time = ""
        this.time_fitness = 0
        this.time_type = ""
    }
    updateParam(start_time,end_time,time_fitness,time_type){
        this.start_time = start_time
        this.end_time = end_time
        this.time_fitness = time_fitness
        this.time_type = time_type
    }
    refresh(){
        this.start_time = ""
        this.end_time = ""
        this.time_fitness = 0
        this.time_type = ""
    }
    emitTimeSeries() {
        console.log("here")
        console.log("start",this)
        // let start_year = this.start_date.split(" ")[0]
        // console.log(start_year)
    }


}
