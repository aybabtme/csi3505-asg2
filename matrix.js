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
        matrix.set(i, j, randomInt(from, to));
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
      add: function(other) { return Matrix.add(this, other); },
      sub: function(other) { return Matrix.sub(this, other); },
      get: getter,
      set: setter,
      toLaTeX: latexifier,
      n: i1,
      m: j1
    };
  };

  Matrix.add = function(a, b) {
    if (a.n !== b.n || a.m !== b.m) {
      throw "incompatible matrices, different dimensions";
    }
    var c = Matrix.new(a.n, a.m);
    for (var i = 0; i < c.n; i++) {
      for (var j = 0; j < c.m; j++) {
        var sum = Scalar.addFunc(a.get(i, j),b.get(i, j));
        c.set(i, j, sum);
      }
    }
    return c;
  };

  Matrix.sub = function(a, b) {
    if (a.n !== b.n || a.m !== b.m) {
      throw "incompatible matrices, different dimensions";
    }
    var c = Matrix.new(a.n, a.m);
    for (var i = 0; i < c.n; i++) {
      for (var j = 0; j < c.m; j++) {
        var diff = Scalar.subFunc(a.get(i, j),b.get(i, j));
        c.set(i, j, diff);
      }
    }
    return c;
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
          var aCell = a.get(i, k);
          var bCell = b.get(k, j);
          var tmp = Scalar.mulFunc(aCell, bCell);
          val = Scalar.addFunc(val, tmp);
        }
        c.set(i, j, val);
      }
    }
    return c;
  };

  var growNextPowerOf2 = function(orig) {
    if (orig.n !== orig.m) {
      throw "incompatible matrices, different dimensions";
    }
    var n = orig.n;
    if (n % 2 === 0) {
      // No need to grow it
      return orig;
    }

    var nextPow2 = function(n) {
      var currentPow2 = Math.floor(Math.log(n)/Math.log(2));
      return Math.pow(2, currentPow2 + 1);
    };

    var nextN = nextPow2(n);
    var grownMat = Matrix.new(nextN, nextN);
    for (var i = 0; i < orig.n; i++) {
      for (var j = 0; j < orig.n; j++) {
        grownMat.set(i, j, orig.get(i, j));
      }
    }
    return grownMat;
  };

  var straussen = function(a, b, c, leafSize) {
    if (a.n !== b.n || a.m !== b.m) {
      throw "incompatible matrices, different dimensions";
    }
    if (a.n !== a.m) {
      throw "incompatible matrices, not square matrices";
    }

    if (a.n <= leafSize) {
      return Matrix.stdMatrixMul(a, b);
    }

    var grownA = growNextPowerOf2(a);
    var grownB = growNextPowerOf2(b);
    var grownC = growNextPowerOf2(c);

    var partA = { n: grownA.n / 2, m: grownA.m / 2 };
    var a11 = a.partition(0,       0,       partA.n,  partA.m);
    var a12 = a.partition(0,       partA.m, partA.n,  grownA.m);
    var a21 = a.partition(partA.n, 0,       grownA.n, partA.m);
    var a22 = a.partition(partA.n, partA.m, grownA.n, grownA.m);

    var partB = { n: grownB.n / 2, m: grownB.m / 2 };
    var b11 = b.partition(0,       0,       partB.n,  partB.m);
    var b12 = b.partition(0,       partB.m, partB.n,  grownB.m);
    var b21 = b.partition(partB.n, 0,       grownB.n, partB.m);
    var b22 = b.partition(partB.n, partB.m, grownB.n, grownB.m);

    var m1 = Matrix.new(a11.n, b11.m);
    var m2 = Matrix.new(a21.n, b11.m);
    var m3 = Matrix.new(a11.n, b12.m);
    var m4 = Matrix.new(a22.n, b11.m);
    var m5 = Matrix.new(a11.n, b22.m);
    var m6 = Matrix.new(a11.n, b11.m);
    var m7 = Matrix.new(a12.n, b22.m);

    straussen(a11.add(a22), b11.add(b22), m1, leafSize);
    straussen(a21.add(a22), b11         , m2, leafSize);
    straussen(a11         , b12.sub(b22), m3, leafSize);
    straussen(a22         , b21.sub(b11), m4, leafSize);
    straussen(a11.add(a12), b22         , m5, leafSize);
    straussen(a21.sub(a11), b11.add(b12), m6, leafSize);
    straussen(a12.sub(a22), b21.add(b22), m7, leafSize);

    var c11 = m1.add(m4).sub(m5).add(m7);
    var c12 = m3.add(m5);
    var c21 = m2.add(m4);
    var c22 = m1.add(m3).sub(m2).add(m6);

    for (var i = 0; i < grownC.n; i++) {
      for (var j = 0; j < grownC.m; j++) {
        if (i < grownC.n && j < grownC.m) {
          grownC.set(i, j, c11.get(i, j));
        }
        if (i < grownC.n && j >= grownC.m) {
          grownC.set(i, j, c12.get(i, j + grownC.m/2));
        }
        if (i >= grownC.n && j < grownC.m) {
          grownC.set(i, j, c21.get(i + grownC.n/2, j));
        }
        if (i >= grownC.n && j >= grownC.m) {
          grownC.set(i, j, c22.get(i + grownC.n/2, j + grownC.m/2));
        }
      }
      if (i < c.n && j < c.m) {
        c.set(i,j, grownC.get(i,j));
      }
    }

  };

  Matrix.straussenMatrixMul = function (a, b, leafSize) {
    var c = Matrix.new(a.n, b.m);
    straussen(a,b,c,leafSize);
    return c;
  };
})();


