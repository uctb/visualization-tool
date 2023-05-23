export default class TimeInfoProcessor
{
    /*专门处理时间有关的信息 */
    constructor() {
        this.start_time = ""
        this.end_time = ""
        this.time_fitness = 0
        this.time_type = ""
        this.flag = false
        this.MorningPeak = ['07', '08', '09']  // 定义早高峰为7-10点（后续应该改成可手动选择的）
        this.EveningPeak = ['18', '19'] // 定义晚高峰为6-8点
    }
    updateParam(start_time,end_time,time_fitness,time_type){
        this.start_time = start_time
        this.end_time = end_time
        this.time_fitness = time_fitness
        this.time_type = time_type
        this.flag = true
    }
    refresh(){
        this.start_time = ""
        this.end_time = ""
        this.time_fitness = 0
        this.time_type = ""
        this.flag = false
    }

    getWeekDay(date) {
        const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return weekdays[date.getDay()];
    }

    emitTimeSeries() {
        console.log("Time Series!")
        console.log(this.start_time, this.end_time, this.time_fitness, this.time_type)
        let currentTime = new Date(this.start_time)
        let endTime = new Date(this.end_time)

        const TimeSeries = []
        const WeekSeries = []
        const PeakSeries = []
        const HourSeries = []

        while (currentTime <= endTime) {
            const year = currentTime.getFullYear().toString().slice(-2);
            const month = (currentTime.getMonth() + 1).toString().padStart(2, '0');
            const day = currentTime.getDate().toString().padStart(2, '0');
            const hour = currentTime.getHours().toString().padStart(2, '0');
            const minute = currentTime.getMinutes().toString().padStart(2, '0');
            const weekday = this.getWeekDay(currentTime);
            const hour_num_type = currentTime.getHours();

            const timeString = `${year}/${month}/${day} ${hour}:${minute}`;
            
            if (this.MorningPeak.includes(hour)) {
                PeakSeries.push('mp');
            }
            else if (this.EveningPeak.includes(hour)) {
                PeakSeries.push('ep');
            }
            else {
                PeakSeries.push('none')
            }

            TimeSeries.push(timeString);
            WeekSeries.push(weekday);
            HourSeries.push(hour_num_type);

            currentTime.setTime(currentTime.getTime() + this.time_fitness * 60 * 1000); // Add interval minutes
        }
        this.TimeSeries = TimeSeries;
        this.WeekSeries = WeekSeries;
        this.PeakSeries = PeakSeries;
        this.HourSeries = HourSeries;
        // console.log("Time Series is:", this.TimeSeries);
        // console.log("Week Series is:", this.WeekSeries);
        // console.log("Peak Series is:", this.PeakSeries);
        // console.log("Hour Series is:", this.HourSeries);
    }


}
