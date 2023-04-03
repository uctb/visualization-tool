/**
 * Returns the average path length of the nodes in a tree from the root given the number of training data points
 * @param {number} sizeDataset - the number of data training points
 * @returns - the average path length from the root
 */
export default function averagePathLengthFromRoot(sizeDataset) {
  if (sizeDataset === 0 || sizeDataset === 1) {
    return 0;
  } else if (sizeDataset === 2) {
    return 1;
  }
  return (
    2 * Math.log(sizeDataset - 1) +
    0.57721 -
    (2 * (sizeDataset - 1)) / sizeDataset
  );
}
