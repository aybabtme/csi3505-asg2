// Convenience hacks
var puts = function (data) {
  "use strict";
  document.write(data);
};

var math = function (data) {
  "use strict";
  return "$" + data + "$";
};

var randomInt = function (from, to) {
  var r = Math.random();
  return Math.round((to - from) * r) + from;
};

// To make HTML tables from JS
var VerticalTable = function (header) {
  "use strict";
  var rows = [];

  var rowAdder = function (row) {
    rows.push(row);
    return this;
  };

  var htmler = function () {
    var str = "<table>" +
      "\n\t<tr>";
    header.forEach(function (el) {
      str += "<th>" + el;
    });
    rows.forEach(function (row) {
      str += "\n\t<tr>";
      row.forEach(function (col) {
        str += "\t\t<td>" + col;
      });
    });
    return str += "\n</table>";
  };

  return {
    addEntry: rowAdder,
    toHTML: htmler
  };
};

var HorizontalTable = function (header) {
  "use strict";
  var cols = [];
  for (var i = 0; i < header.length; i++) {
    cols[i] = [header[i]];
  }

  var colAdder = function (col) {
    for (var i = 0; i < cols.length; i++) {
      cols[i].push(col[i]);
    }
    return this;
  };

  var htmler = function () {
    var str = "<table>";

    cols.forEach(function (row) {
      str += "\n\t<tr>";
      row.forEach(function (col) {
        str += "\t\t<td>" + col;
      });
    });

    return str += "\n</table>";
  };

  return {
    addEntry: colAdder,
    toHTML: htmler
  };
};


// Scalar stuff
var Scalar = {};
(function () {
  "use strict";
  Scalar.mulFunc = function (first, second) {
    return first * second;
  };

  Scalar.addFunc = function (first, second) {
    return first + second;
  };

  Scalar.subFunc = function (first, second) {
    return first - second;
  };
})();

// Matrix stuff
var Matrix = {};
(function () {
  "use strict";
  var Create2DArray = function (a, b) {
    var arr = [];
    for (var i = 0; i < a; i++) {
      arr[i] = [];
      for (var j = 0; j < b; j++) {
        arr[i][j] = 0.0;
      }
    }
    return arr;
  };

  Matrix.new = function (n, m) {
    var mat = new Create2DArray(n, m);

    var checkRange = function(i, j, minI, maxI, minJ, maxJ) {
      if (i < 0) {
        throw "i too low";
      }
      if (i >= maxI - minI) {
        throw "i too high";
      }
      if (j < 0) {
        throw "j too low";
      }
      if (j >= maxJ - minJ) {
        throw "j too high";
      }
    };

    var getter = function (iOff, iMax, jOff, jMax) {
      return function(i, j) {
        checkRange(i, j, iOff, iMax, jOff, jMax);
        return mat[i + iOff][j + jOff];
      };
    };

    var setter = function (iOff, iMax, jOff, jMax) {
      return function(i, j, val) {
        checkRange(i, j, iOff, iMax, jOff, jMax);
        mat[i + iOff][j + jOff] = val;
      };
    };

    var partitioner = function (from_i, from_j, to_i, to_j) {
      return {
        getVal: getter(from_i, to_i, from_j, to_i),
        setVal: setter(from_i, to_i, from_j, to_i),
        toLaTeX: latexifier(from_i, to_i, from_j, to_i),
        randomize: function(){}, // no-op
        n: from_i - to_i,
        m: from_j - to_j
      };
    };

    var latexifier = function(iOff, iMax, jOff, jMax) {
      var n = iMax - iOff;
      var m = jMax - jOff;
      return function () {
        var str = "\\overset{" + n + "\\times" + m + "}{\\begin{bmatrix}\n";
        for (var i = iOff; i < iMax; i++) {

          for (var j = jOff; j < jMax; j++) {
            str += mat[i][j];
            if (j !== jMax - 1) {
              str += " & ";
            }
          }
          if (i !== iMax - 1) {
            str += "\\\\";
          }
        }
        return str + "\\end{bmatrix}}";
      };
    };

    var randomizer = function (from, to) {
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < m; j++) {
          mat[i][j] = randomInt(from, to);
        }
      }
      return this;
    };

    return {
      getVal: getter(0, n, 0, m),
      setVal: setter(0, n, 0, m),
      toLaTeX: latexifier(0, n, 0, m),
      randomize: randomizer,
      partition: partitioner,
      n: n,
      m: m
    };
  };

  Matrix.stdMatrixMul = function (a, b) {
    if (a.m !== b.n) {
      throw "incompatible matrices";
    }
    var c = Matrix.new(a.n, b.m);
    for (var i = 0; i < a.n; i++) {
      for (var j = 0; j < b.m; j++) {
        var val = 0.0;
        for (var k = 0; k < a.m; k++) {
          var aCell = a.getVal(i, k);
          var bCell = b.getVal(k, j);
          var tmp = Scalar.mulFunc(aCell, bCell);
          val = Scalar.addFunc(val, tmp);
        }
        c.setVal(i, j, val);
      }
    }
    return c;
  };

  Matrix.straussenMatrixMul = function (a, b, leafSize) {
    if (a.m !== b.n) {
      throw "incompatible matrices";
    }

    if (a.n <= leafSize) {
      return Matrix.stdMatrixMul(a, b);
    }


  };
})();


