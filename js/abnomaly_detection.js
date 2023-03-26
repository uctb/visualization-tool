// 准备数据
function generateData(numPoints) {
    const data = [];
    for (let i = 0; i < numPoints; i++) {
        data.push(Math.sin(i / 10));
    }
    return data;
}

const abnomaly_data = generateData(1000);

// 定义LSTM模型
function createModel() {
    const model = tf.sequential();

    model.add(tf.layers.lstm({ units: 10, inputShape: [1, 1], returnSequences: true }));
    model.add(tf.layers.lstm({ units: 10 }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: "adam", loss: "meanSquaredError" });

    return model;
}

const model = createModel();

// 训练模型
async function trainModel(model, data, epochs = 10) {
    const inputTensor = tf.tensor3d(data.slice(0, -1), [data.length - 1, 1, 1]);
    const outputTensor = tf.tensor2d(data.slice(1), [data.length - 1, 1]);

    await model.fit(inputTensor, outputTensor, { epochs });

    inputTensor.dispose();
    outputTensor.dispose();
}


trainModel(model, abnomaly_data);

// 在预测阶段检测异常
async function detectAnomalies(model, data, threshold = 0.1) {
    const inputTensor = tf.tensor3d(data.slice(0, -1), [data.length - 1, 1, 1]);
    const predictions = model.predict(inputTensor);
    const errorTensor = tf.abs(tf.sub(predictions, tf.tensor2d(data.slice(1), [data.length - 1, 1])));
    const errors = await errorTensor.array();

    const anomalies = [];
    for (let i = 0; i < errors.length; i++) {
        if (errors[i] > threshold) {
            anomalies.push(i);
        }
    }

    inputTensor.dispose();
    predictions.dispose();
    errorTensor.dispose();

    return anomalies;
}

detectAnomalies(model, abnomaly_data).then((anomalies) => {
    console.log("Anomalies detected at indices:", anomalies);
});

