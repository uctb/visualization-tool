import Tree from './TreeNode';
import averagePathLengthFromRoot from './Utils';

export class IsolationForest {
  /**
   * Create a new instance of IsolationForest
   * @constructor
   * @param {object} options - options for the IsolationForest
   * @param {number} [options.nEstimators=100] - number of trees/estimators to use in the forest
   */
  constructor(options) {
    if (options) {
      this.nEstimators = options.nEstimators || 100;
    }
    this.nEstimators = this.nEstimators || 100;
    this.forest = [];
  }

  /**
   * Train the trees in the Isolation Forest with the given training set
   * @param {number[][]} - trainingSet for building the isolation forest
   */
  train(trainingSet) {
    this.trainingSet = trainingSet;
    const maxDepth = Math.ceil(Math.log2(this.trainingSet.length));

    for (let i = 0; i < this.nEstimators; i++) {
      const tree = new Tree({ depth: 0, maxDepth: maxDepth });
      tree.train(trainingSet, 0);
      this.forest.push(tree);
    }
  }

  /**
   * Predict the anomalies in the set
   * @param {number[][]} - set of data for which to find the anomalies
   * @return {number[]} - returns the anomaly scores for the data points
   */
  predict(data) {
    const anomalyScores = [];
    for (const row of data) {
      let totalLengthsOfPathsFromRoot = 0;
      for (let i = 0; i < this.nEstimators; i++) {
        totalLengthsOfPathsFromRoot += this.forest[i].pathLengthFromRoot(
          row,
          0,
        );
      }
      const averagePathLength = totalLengthsOfPathsFromRoot / this.nEstimators;
      const anomalyScore =
        2 **
        (-averagePathLength /
          averagePathLengthFromRoot(this.trainingSet.length));
      anomalyScores.push(anomalyScore);
    }
    return anomalyScores;
  }
}
