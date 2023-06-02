/*目前没用到的函数*/

// update(jsonData) {
//
//     this.time_range = jsonData.time_range;
//     this.time_fitness = jsonData.time_fitness;
//     this.station_lats = jsonData.station_lats;
//     this.station_lngs = jsonData.station_lngs;
//
//
//     this.st_raster_gt = jsonData.st_raster_gt;
//     this.st_raster_pred = jsonData.st_raster_pred;
//     this.time_length = this.st_raster_gt[0].length;
//     this.station_num = this.st_raster_gt.length;
//     let error_matrix = new Array(this.time_length);
//     let mae_for_each_station = new Array(this.station_num);
//     let st_raster_diff = new Array(this.station_num);
//     //TODO: 下面内容可以封装成函数
//     for (var i = 0; i < this.station_num; i++) {
//
//         var tmp_mae = 0;
//         error_matrix[i] = new Array(this.time_length);
//         st_raster_diff[i] = [];
//         for (var j = 0; j < this.time_length; j++) {
//             error_matrix[i][j] = this.st_raster_pred[i][j] - this.st_raster_gt[i][j];
//             tmp_mae += Math.abs(error_matrix[i][j]);
//             st_raster_diff[i].push(Math.abs(this.st_raster_pred[i][j]-this.st_raster_gt[i][j]));
//         }
//         mae_for_each_station[i] = tmp_mae / this.station_num;
//     }
//     this.error_matrix = error_matrix;
//     this.mae_for_each_station = mae_for_each_station;
//     this.st_raster_diff = st_raster_diff;
//
//     this.emitBadCase();
// }

emitTimeseries_gt(spatial_ind) {
    return this.st_raster_gt[spatial_ind];
}

emitTimeseries_pred(spatial_ind) {
    return this.st_raster_pred[spatial_ind];
}

emitErrorSeries(spatial_ind) {
    return this.error_matrix[spatial_ind]
}

// 获得error hotspot
emitErrorHotspotIndex() {
    // 计算所有bad case的长度和rmse
    let bad_case_len_list = [];
    let bad_case_error_list = [];
    for (let i=0; i<this.station_num; i++) {
        // 获得站点对应的索引值
        // let index = this.PointSortedRMSE[i][0];
        // console.log("worest statation index:", index);
        // 获得站点对应的bad case list
        let bad_case_list = this.bad_case[i];
        for (let j=0; j<bad_case_list.length; j++) {
            // 对于每个bad case
            let left = bad_case_list[j][0]['xAxis'];
            let right = bad_case_list[j][1]['xAxis'];
            // 计算bad case持续的长度
            let bad_case_len = right - left;
            bad_case_len_list.push({'index': [i, j], 'length': bad_case_len});
            // 计算局部local rmse
            let rmse = this.ct.calculate_local_rmse(this.st_raster_pred[i].slice(left, right+1), this.st_raster_gt[i].slice(left, right+1))
            bad_case_error_list.push({'index': [i, j], 'error': rmse});
        }
    }

    // 取前1%的bad case作为top-k error hotspot
    this.semi_k = Math.ceil(0.01 * bad_case_len_list.length);
    this.k = 2 * this.semi_k;
    bad_case_len_list.sort((a, b) => a.length > b.length ? -1 : a.length < b.length ? 1 : 0);
    bad_case_error_list.sort((a, b) => a.error > b.error ? -1 : a.error< b.error ? 1 : 0);
    // console.log("sorted_bad_case_len_list:", bad_case_len_list);
    // console.log("sorted_bad_case_error_list:", bad_case_error_list);

    // 取top-k error hotspot的索引
    this.error_hotspot_index = {
        'length': [],
        'error': [],
    };
    for (let i=0; i<this.semi_k; i++) {
        this.error_hotspot_index['length'].push(bad_case_len_list[i]['index']);
        this.error_hotspot_index['error'].push(bad_case_error_list[i]['index']);
    }
    // console.log("error hotpost index:", this.error_hotspot_index);
}
// error hotspot
getErrorHotspotParam(type, index) {
    // index：画的是第index个error hotspot
    console.log("=========plot error hotspot===========");
    let station_ind = this.error_hotspot_index[type][index][0];
    let bad_case_ind = this.error_hotspot_index[type][index][1];
    let left = this.bad_case[station_ind][bad_case_ind][0]['xAxis'];
    let right = this.bad_case[station_ind][bad_case_ind][1]['xAxis'];

    let pd = this.st_raster_pred[station_ind].slice(left, right+1);
    let gt = this.st_raster_gt[station_ind].slice(left, right+1);

    let ts = this.ts;

    this.error_hotspot_param = {
        'groundtruth':gt,
        'prediction':pd,
        'axisvalue':ts,
    }
    console.log("error_hotspot_param:", this.error_hotspot_param);

}

// 获得各时间片bad case的个数
emitBadcaseTemporalDistribution() {
    let badcase_temp_num = Array(this.time_length).fill(0);
    for (let i=0; i<this.station_num; i++) {
        let diff = this.st_raster_diff[i];
        const mean = this.ct.calculateMean(diff);
        for (let j=0; j<this.time_length; j++) {
            if (diff[j] > mean || diff[j] === Infinity) {
                badcase_temp_num[j] += 1;
            }
        }
    }
    this.badcase_temp_distribution = badcase_temp_num;
    // console.log("badcase_temporal_distribution:", badcase_temp_num);
}

// bad case distribution - temporal view
getBadcaseTemporalDistributionParam() {
    console.log("=========plot bad case temporal distribution=========")
    let ts = this.ts;
    this.badcase_temp_distribution_param = {
        'axisvalue': ts,
        'badcase_num': this.badcase_temp_distribution,
        'name': 'Local Bad Case Temporal Distribution'
    }
    console.log("badcase_temporal_distribution_param:", this.badcase_temp_distribution_param);
}


// 聚类
// emitCluster() {
//     console.log("==========cluster===========");
//     const nClusters = 3;
//
//     const trainingData = [
//         [123.456, 45.678, 8.5],
//         [12.345, 67.890, 7.2]
//     ];
//
//     // 创建 K-Means 聚类器并训练模型
//     const kmeans = new KMeans({ nClusters });
//     kmeans.fit(trainingData);
//
//     // 获取聚类结果
//     const labels = kmeans.predict(trainingData);
//
//     // 找出评价指标高的点所在的经纬度范围
//     const highScoreCluster = labels.find(label => {
//         const clusterPoints = dataset.filter((_, index) => labels[index] === label);
//         const clusterScores = clusterPoints.map(item => item.score);
//         const maxScore = Math.max(...clusterScores);
//         return maxScore >= 8.0; // 评价指标大于等于8.0的簇
//     });
//
//     if (highScoreCluster) {
//         const clusterPoints = dataset.filter((_, index) => labels[index] === highScoreCluster);
//         const longitudes = clusterPoints.map(item => item.longitude);
//         const latitudes = clusterPoints.map(item => item.latitude);
//         const minLongitude = Math.min(...longitudes);
//         const maxLongitude = Math.max(...longitudes);
//         const minLatitude = Math.min(...latitudes);
//         const maxLatitude = Math.max(...latitudes);
//
//         console.log('评价指标高的点所在的经纬度范围：');
//         console.log('最小经度：', minLongitude);
//         console.log('最大经度：', maxLongitude);
//         console.log('最小纬度：', minLatitude);
//         console.log('最大纬度：', maxLatitude);
//     }
// }

