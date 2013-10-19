// Convenience hacks
var print = function (data) {
    "use strict";
    document.write(data);
};

var math = function (data) {
    "use strict";
    return "$" + data + "$";
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
    var Create2DArray = function (m, n) {
        var arr = [];
        for (var i = 0; i < m; i++) {
            arr[i] = [];
            for (var j = 0; j < n; j++) {
                arr[i][j] = 0.0;
            }
        }
        return arr;
    };

    Matrix.new = function (m, n) {
        var mat = new Create2DArray(m, n);

        var checkRange = function (i, j) {
            if (i >= m || j >= n || i < 0 || j < 0) {
                throw "asked for index (" + i + "," + j + ") but max index is (" + m + "," + n + ")";
            }
        };

        var getter = function (i, j) {
            checkRange(i, j);
            return mat[i][j];
        };

        var setter = function (i, j, val) {
            checkRange(i, j);
            mat[i][j] = val;
        };

        var latexifier = function () {
            var str = "$\\begin{bmatrix}\n";
            for (var i = 0; i < m; i++) {

                for (var j = 0; j < n; j++) {
                    str += mat[i][j];
                    if (j !== n - 1) {
                        str += " & ";
                    }
                }
                if (i !== m - 1) {
                    str += "\\\\ \n";
                }
            }
            return str + "\\end{bmatrix}$";
        };

        return {
            get: getter,
            set: setter,
            latexify: latexifier,
            m: m,
            n: n
        };
    };

    Matrix.stdMatrixMul = function (a, b) {
        if (a.n !== b.m) {
            throw "incompatible matrices";
        }
        var c = Matrix.new(a.n, b.m);
        for (var i = 0; i < a.n; i++) {
            for (var j = 0; j < b.m; j++) {
                var val = 0.0;
                for (var aRow = 0; aRow < a.m; aRow++) {
                    for (var bCol = 0; bCol < b.n; bCol++) {
                        var aCell = a.get(aRow, j);
                        var bCell = b.get(i, bCol);
                        var tmp = Scalar.mulFunc(aCell, bCell);
                        val = Scalar.addFunc(val, tmp);
                    }
                }
                c.set(i, j, val);
            }
        }
        return c;
    };
})();


