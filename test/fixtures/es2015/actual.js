function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var concatFooBar = function (args) {
  const f = 'foo';
  const b = 'bar';
  return [f, b].concat(_toConsumableArray(args));
};