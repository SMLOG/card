function calculateDistance(point1, point2) {
    const [x1, y1] = point1;
    const [x2, y2] = point2;
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return distance;
  }
  
  function comparePointsRecursive(points1, points2, tolerance) {
    if (points1.length === 0 || points2.length === 0) {
      return true;
    }
  
    const startDistance = calculateDistance(points1[0], points2[0]);
    const endDistance = calculateDistance(points1[points1.length - 1], points2[points2.length - 1]);
  
    if (startDistance > tolerance || endDistance > tolerance) {
      return false;
    }
    
    if(points1.length<2||points2.length<2)return true;
    
    const middleIndex1 = Math.floor(points1.length / 2);
    const middleIndex2 = Math.floor(points2.length / 2);
    const middleDistance = calculateDistance(points1[middleIndex1], points2[middleIndex2]);
  
    if (middleDistance > tolerance) {
      return false;
    }
  
    const remainingPoints1 = points1.slice(1, points1.length - 1);
    const remainingPoints2 = points2.slice(1, points2.length - 1);
  
    return comparePointsRecursive(remainingPoints1, remainingPoints2, tolerance);
  }
  
  function comparePaths(path1, path2, tolerance) {
    const result = comparePointsRecursive(path1, path2, tolerance);
  
    if (result) {
      console.log("Start, end, and middle points are similar within the tolerance.");
    } else {
      console.log("Start, end, or middle points are not similar within the tolerance.");
    }
  }
  
  // Example usage
  //const path1 = [[0, 0], [1, 1], [2, 2], [3, 3]];
  //const path2 = [[0, 0], [2, 2], [3, 3], [4, 4], [5, 5]];
 // const tolerance = 10;
  
 // comparePaths(path1, path2, tolerance);