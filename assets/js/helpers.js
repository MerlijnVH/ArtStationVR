// Randomize array element order in-place
// Using Durstenfeld shuffle algorithm

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

// Convert from degrees to radians

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

// Convert from radians to degrees

Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};
