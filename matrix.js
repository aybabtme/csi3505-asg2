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

  var windower = function(win) {
    var _win = win || {};
    return {
      from_i: _win.from_i || 0,
      to_i:     _win.to_i || 0,
      from_j: _win.from_j || 0,
      to_j:     _win.to_j || 0
    };
  };

  var randomizer = function (matrix, from, to) {
    for (var i = 0; i < matrix.n; i++) {
      for (var j = 0; j < matrix.m; j++) {
        matrix.setVal(i, j, randomInt(from, to));
      }
    }
    return matrix;
  };

  Matrix.new = function(n, m) {
    var win = windower({to_i:n, to_j: m});
    return newWindowedMatrix(new Create2DArray(n,m), win);
  };

  var newWindowedMatrix = function (mat, windows) {
    var i0 = windows.from_i,
        i1 = windows.to_i,
        j0 = windows.from_j,
        j1 = windows.to_j;

    var partitioner = function(from_i, from_j, to_i, to_j) {
      var win = windower({
        from_i: i0 + from_i,
        to_i: i0 + to_i,
        from_j: j0 + from_j,
        to_j: j0 + to_j
      });
      return newWindowedMatrix(mat, win);
    };

    var checkRange = function(i, j) {
      if (i < i0)       {
        throw "i too low";
      }
      if (i >= i1) {
        throw "i too high";
      }
      if (j < j0)       {
        throw "j too low";
      }
      if (j >= j1) {
        throw "j too high";
      }
    };

    var getter = function(i, j) {
      var real_i = i + i0,
          real_j = j + j0;
      checkRange(real_i, real_j);
      return mat[real_i][real_j];
    };

    var setter = function(i, j, val) {
      var real_i = i + i0,
          real_j = j + j0;
      checkRange(real_i, real_j);
      mat[real_i][real_j] = val;
    };

    var latexifier = function () {
      var n = i1 - i0,
          m = j1 - j0;
      var str = "\\overset{" + n + "\\times" + m + "}{\\begin{bmatrix}\n";
      for (var i = i0; i < i1; i++) {

        for (var j = j0; j < j1; j++) {
          str += mat[i][j];
          if (j !== j1 - 1) {
            str += " & ";
          }
        }
        if (i !== i1 - 1) {
          str += "\\\\";
        }
      }
      return str + "\\end{bmatrix}}";
    };

    return {
      partition: partitioner,
      randomize: function(from, to) { return randomizer(this, from, to); },
      getVal: getter,
      setVal: setter,
      toLaTeX: latexifier,
      n: i1,
      m: j1
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


