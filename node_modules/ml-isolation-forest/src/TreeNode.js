import max from 'ml-array-max';
import min from 'ml-array-min';

import averagePathLengthFromRoot from './Utils';

export default class TreeNode {
  /**
   * Constructor for a tree node used in an isolation forest
   * @param {object} options - options for the TreeNode
   * @param {number} options.depth - the depth of the TreeNode
   * @param {number} options.maxDepth - the maximum depth possible for the TreeNode
   * @constructor
   */
  constructor(options) {
    if (options) {
      this.depth = options.depth;
      this.maxDepth = options.maxDepth;
    }
  }

  /**
   * Train a node for the isolation forest given the training set
   * @param {number[][]} trainingSet - training set used to train the isolation tree
   * @param {number} currentDepth - depth of the node which is currently trained
   */
  train(trainingSet, currentDepth) {
    if (currentDepth <= this.maxDepth && trainingSet.length > 1) {
      this.left = new TreeNode(this);
      this.right = new TreeNode(this);

      const numberFeatures = trainingSet[0].length;
      this.splitColumn = Math.floor(Math.random() * numberFeatures);
      const valuesForFeature = trainingSet.map((row) => row[this.splitColumn]);

      const maxValueFeature = max(valuesForFeature);
      const minValueFeature = min(valuesForFeature);

      this.splitValue =
        Math.random() * (maxValueFeature - minValueFeature) + minValueFeature;

      const smallerThanSplitValue = trainingSet.filter(
        (row) => row[this.splitColumn] < this.splitValue,
      );
      const biggerThanSplitValue = trainingSet.filter(
        (row) => row[this.splitColumn] >= this.splitValue,
      );

      this.left.train(smallerThanSplitValue, currentDepth + 1);
      this.right.train(biggerThanSplitValue, currentDepth + 1);
    } else {
      this.trainingSet = trainingSet;
    }
  }

  /**
   * Verifies whether the current node is a leaf node in the tree it belongs to
   * @returns a boolean
   */
  isLeafNode() {
    return this.left === undefined && this.right === undefined;
  }

  /**
   * Verifies whether the current node is an inner node in the tree it belongs to
   * @returns a boolean
   */
  isInnerNode() {
    return this.left !== undefined && this.right !== undefined;
  }

  /**
   * Returns the number of data points in the current node
   * @returns the number of data points
   */
  numberDataPoints() {
    if (this.trainingSet !== undefined) {
      return this.trainingSet.length;
    }
    return 0;
  }

  /**
   * Returns the length of the path from the root to isolate the data point
   * @param {number[]} data - data point for which to predict the anomaly score
   * @param {number} currentPathLengthFromRoot - the current path length from the root
   * @returns
   */
  pathLengthFromRoot(data, currentPathLengthFromRoot) {
    if (this.isLeafNode()) {
      return (
        currentPathLengthFromRoot +
        averagePathLengthFromRoot(this.numberDataPoints())
      );
    }
    const splitColumn = this.splitColumn;
    if (data[splitColumn] < this.splitValue) {
      return this.left.pathLengthFromRoot(data, currentPathLengthFromRoot + 1);
    } else {
      return this.right.pathLengthFromRoot(data, currentPathLengthFromRoot + 1);
    }
  }
}
