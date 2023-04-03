import {IsolationForest} from 'ml-isolation-forest';
const { jStat } = require('jstat')
// const ss = require('simple-statistics');


function normalize(X) {
    let matrix = X.flat();
    let min = Math.min(...matrix);
    let max = Math.max(...matrix);

    for (let i = 0; i < X.length; i++) {
        X[i] = (X[i] - min) / (max - min);
    }
    return X
}

/**
 * 构建 Isolation Forest 模型
 * @param {Array} data 输入数据集，每行为一个样本，每列为一个特征
 * @param {Number} t 树的数量
 * @param {Number} h 树的最大深度
 * @returns {Object} Isolation Forest 模型
 */
function buildIsolationForest(data, t, h) {
    var forest = [];

    for (var i = 0; i < t; i++) {
        var tree = buildIsolationTree(data, 0, h);
        forest.push(tree);
    }

    return {
        forest: forest,
        avgPathLength: getAveragePathLength(data.length)
    };
}

/**
 * 构建 Isolation Tree
 * @param {Array} data 输入数据集，每行为一个样本，每列为一个特征
 * @param {Number} curHeight 当前树的深度
 * @param {Number} maxHeight 树的最大深度
 * @returns {Object} Isolation Tree
 */
function buildIsolationTree(data, curHeight, maxHeight) {
    if (curHeight >= maxHeight || data.length <= 1) {
        return {
            type: 'external',
            size: data.length
        };
    }

    var splitAttr = getRandomAttribute(data[0].length);
    var splitValue = getRandomValue(data, splitAttr);

    var leftData = [];
    var rightData = [];

    for (var i = 0; i < data.length; i++) {
        if (data[i][splitAttr] < splitValue) {
            leftData.push(data[i]);
        } else {
            rightData.push(data[i]);
        }
    }

    return {
        type: 'internal',
        splitAttr: splitAttr,
        splitValue: splitValue,
        leftChild: buildIsolationTree(leftData, curHeight + 1, maxHeight),
        rightChild: buildIsolationTree(rightData, curHeight + 1, maxHeight)
    };
}

/**
 * 获取随机属性
 * @param {Number} n 属性的数量
 * @returns {Number} 随机属性的索引
 */
function getRandomAttribute(n) {
    return Math.floor(Math.random() * n);
}

/**
 * 获取随机分割点
 * @param {Array} data 输入数据集，每行为一个样本，每列为一个特征
 * @param {Number} attr 分割属性的索引
 * @returns {Number} 随机分割点的值
 */
function getRandomValue(data, attr) {
    var min = Number.MAX_VALUE;
    var max = Number.MIN_VALUE;

    for (var i = 0; i < data.length; i++) {
        if (data[i][attr] < min) {
            min = data[i][attr];
        }
        if (data[i][attr] > max) {
            max = data[i][attr];
        }
    }

    return Math.random() * (max - min) + min;
}

/**
 * 获取样本的平均路径长度
 * @param {Object} model Isolation Forest 模型
 * @param {Array} sample 输入样本，每列为一个特征
 * @returns {Number} 样本的平均路径长度
 */
function getAveragePathLength(model, sample) {
    var pathLengths = [];

    for (var i = 0; i < model.forest.length; i++) {
        var tree = model.forest[i];
        var pathLength = 0;
        var node = tree;

        while (node.type === 'internal') {
            if (sample[node.splitAttr] < node.splitValue) {
                node = node.leftChild;
            } else {
                node = node.rightChild;
            }
            pathLength++;
        }

        pathLength += c(node.size);

        pathLengths.push(pathLength);
    }

    var sum = pathLengths.reduce(function(a, b) { return a + b; }, 0);
    return Math.pow(2, -sum / (model.forest.length * model.avgPathLength));
}

/**
 * 计算 c(n)
 * @param {Number} n 样本数
 * @returns {Number} c(n)
 */
function c(n) {
    if (n > 2) {
        return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n);
    } else if (n === 2) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * 检测离群值
 * @param {Object} model Isolation Forest 模型
 * @param {Array} data 输入数据集，每行为一个样本，每列为一个特征
 * @param {Number} threshold 阈值，小于该值的样本将被认为是离群值
 * @returns {Array} 离群值的索引
 */
function detectOutliers(model, data, threshold) {
    var outliers = [];

    for (var i = 0; i < data.length; i++) {
        var sample = data[i];
        var avgPathLength = getAveragePathLength(model, sample);
        if (avgPathLength < threshold) {
            outliers.push(i);
        }
    }

    return outliers;
}

/**
 * 将时间序列划分成窗口，并将每个窗口作为一个样本
 * @param {Array} timeSeries 时间序列数据，每个元素为一个时间点的值
 * @param {Number} windowSize 窗口大小
 * @returns {Array} 样本集，每个样本为一个窗口，每个窗口包含 windowSize 个时间点的值
 */
function splitTimeSeriesToSamples(timeSeries, windowSize) {
    var samples = [];

    for (var i = 0; i < timeSeries.length - windowSize + 1; i++) {
        var sample = timeSeries.slice(i, i + windowSize);
        samples.push(sample);
    }

    return samples;
}


export function iforest() {
    /*
    let x_train = diff_normal;
    let x_test = diff_normal;
    console.log("训练值：", x_train);
    let anomalyDetector = new IsolationForest();
    anomalyDetector.train(x_train);
    let result = anomalyDetector.predict(x_test);
    console.log(result);
    */
    // data preparation

    // 归一化
    let diff = Prediction.map(function (item, index) {
        return Math.abs(item-GroundTruth[index]);
    });
    let diff_normal = normalize(diff);
    console.log("after normalize:", diff_normal)

    // 判断数据是否符合正态分布
// // 进行Shapiro-Wilk检验
    const pvalue = jStat.shapiroWilk(diff_normal);
    console.log(pvalue); // 输出正态分布检验结果
    // // 判断p值是否小于0.05，即是否拒绝原假设（数据不服从正态分布）
    if (pvalue < 0.05) {
        console.log('数据不服从正态分布');
    } else {
        console.log('数据服从正态分布');
    }


    // 划分时间窗口
    var windowSize = 10;
    var samples = splitTimeSeriesToSamples(diff_normal, windowSize);
    console.log(samples); // 输出样本集，每个样本为一个窗口，每个窗口包含 10 个时间点的值
    let x_train = samples.slice(0, samples.length / 2);
    let x_test = samples.slice(samples.length / 2);
    console.log("训练值：", x_train);
    console.log("测试值：", x_test);
    let anomalyDetector = new IsolationForest();
    anomalyDetector.train(x_train);
    let result = anomalyDetector.predict(x_test);
    console.log(result);

}