# isolation-forest

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Find anomalies in a set of data using the isolation forest algorithm.

## Installation

`$ npm i ml-isolation-forest`

## Usage

The IsolationForest function is trained on a set of data, and can be used on new data to predict anomaly scores. The closer to one the anomaly score, the more anomalous is the data. Score closer to zero are considered normal data points. If all data points have anomaly scores close to 0.5, then we can consider all data to be normal points.

You may specify the number of trees or estimators constructed in the forest. By default the number of estimators is 100.

The return value is an array of floating point numbers from 0 to 1 representing an anomaly score for each entry in the testing data.

Inspired from the following research paper : https://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/icdm08b.pdf?q=isolation-forest, and partially from the following work : https://github.com/jayhaluska/isolation-forest-js.

```js
import IsolationForest from 'ml-isolation-forest';

let X = [
  [200, 50],
  [0.3, 0.1],
  [0.5, 0.3],
  [0.2, 0.1],
  [0.1, 0.1],
  [0.2, 0.05],
  [0.3, 0.3],
  [0.4, 0.2],
  [0.3, 0.4],
  [0.1, 0.1],
  [0.05, 0.1],
];
let anomalyDetector = new IsolationForest();
anomalyDetector.train(X);
let result = anomalyDetector.predict([
  [200, 300],
  [0, 0.1],
  [0.2, 0.1],
  [0.1, 0.2],
]);
console.log(result);
// 0.8138034871711983,0.36863229603385717,0.30237588018462913,0.3277350851756707
```

## [API Documentation](https://mljs.github.io/isolation-forest/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-isolation-forest.svg
[npm-url]: https://www.npmjs.com/package/ml-isolation-forest
[ci-image]: https://github.com/mljs/isolation-forest/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/mljs/isolation-forest/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/mljs/isolation-forest.svg
[codecov-url]: https://codecov.io/gh/mljs/isolation-forest
[download-image]: https://img.shields.io/npm/dm/ml-isolation-forest.svg
[download-url]: https://www.npmjs.com/package/ml-isolation-forest
