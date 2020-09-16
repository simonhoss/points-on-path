module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(354);
/******/ 	};
/******/ 	// initialize runtime
/******/ 	runtime(__webpack_require__);
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 354:
/***/ (function(__unusedmodule, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/points-on-curve/lib/index.js
// distance between 2 points
function lib_distance(p1, p2) {
    return Math.sqrt(distanceSq(p1, p2));
}
// distance between 2 points squared
function distanceSq(p1, p2) {
    return Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2);
}
// Sistance squared from a point p to the line segment vw
function distanceToSegmentSq(p, v, w) {
    const l2 = distanceSq(v, w);
    if (l2 === 0) {
        return distanceSq(p, v);
    }
    let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return distanceSq(p, lerp(v, w, t));
}
function lerp(a, b, t) {
    return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
    ];
}
// Adapted from https://seant23.wordpress.com/2010/11/12/offset-bezier-curves/
function flatness(points, offset) {
    const p1 = points[offset + 0];
    const p2 = points[offset + 1];
    const p3 = points[offset + 2];
    const p4 = points[offset + 3];
    let ux = 3 * p2[0] - 2 * p1[0] - p4[0];
    ux *= ux;
    let uy = 3 * p2[1] - 2 * p1[1] - p4[1];
    uy *= uy;
    let vx = 3 * p3[0] - 2 * p4[0] - p1[0];
    vx *= vx;
    let vy = 3 * p3[1] - 2 * p4[1] - p1[1];
    vy *= vy;
    if (ux < vx) {
        ux = vx;
    }
    if (uy < vy) {
        uy = vy;
    }
    return ux + uy;
}
function getPointsOnBezierCurveWithSplitting(points, offset, tolerance, newPoints) {
    const outPoints = newPoints || [];
    if (flatness(points, offset) < tolerance) {
        const p0 = points[offset + 0];
        if (outPoints.length) {
            const d = lib_distance(outPoints[outPoints.length - 1], p0);
            if (d > 1) {
                outPoints.push(p0);
            }
        }
        else {
            outPoints.push(p0);
        }
        outPoints.push(points[offset + 3]);
    }
    else {
        // subdivide
        const t = .5;
        const p1 = points[offset + 0];
        const p2 = points[offset + 1];
        const p3 = points[offset + 2];
        const p4 = points[offset + 3];
        const q1 = lerp(p1, p2, t);
        const q2 = lerp(p2, p3, t);
        const q3 = lerp(p3, p4, t);
        const r1 = lerp(q1, q2, t);
        const r2 = lerp(q2, q3, t);
        const red = lerp(r1, r2, t);
        getPointsOnBezierCurveWithSplitting([p1, q1, r1, red], 0, tolerance, outPoints);
        getPointsOnBezierCurveWithSplitting([red, r2, q3, p4], 0, tolerance, outPoints);
    }
    return outPoints;
}
function simplify(points, distance) {
    return simplifyPoints(points, 0, points.length, distance);
}
// Ramer–Douglas–Peucker algorithm
// https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm
function simplifyPoints(points, start, end, epsilon, newPoints) {
    const outPoints = newPoints || [];
    // find the most distance point from the endpoints
    const s = points[start];
    const e = points[end - 1];
    let maxDistSq = 0;
    let maxNdx = 1;
    for (let i = start + 1; i < end - 1; ++i) {
        const distSq = distanceToSegmentSq(points[i], s, e);
        if (distSq > maxDistSq) {
            maxDistSq = distSq;
            maxNdx = i;
        }
    }
    // if that point is too far, split
    if (Math.sqrt(maxDistSq) > epsilon) {
        simplifyPoints(points, start, maxNdx + 1, epsilon, outPoints);
        simplifyPoints(points, maxNdx, end, epsilon, outPoints);
    }
    else {
        if (!outPoints.length) {
            outPoints.push(s);
        }
        outPoints.push(e);
    }
    return outPoints;
}
function pointsOnBezierCurves(points, tolerance = 0.15, distance) {
    const newPoints = [];
    const numSegments = (points.length - 1) / 3;
    for (let i = 0; i < numSegments; i++) {
        const offset = i * 3;
        getPointsOnBezierCurveWithSplitting(points, offset, tolerance, newPoints);
    }
    if (distance && distance > 0) {
        return simplifyPoints(newPoints, 0, newPoints.length, distance);
    }
    return newPoints;
}

// CONCATENATED MODULE: ./node_modules/path-data-parser/lib/parser.js
const COMMAND = 0;
const NUMBER = 1;
const EOD = 2;
const PARAMS = { A: 7, a: 7, C: 6, c: 6, H: 1, h: 1, L: 2, l: 2, M: 2, m: 2, Q: 4, q: 4, S: 4, s: 4, T: 2, t: 2, V: 1, v: 1, Z: 0, z: 0 };
function tokenize(d) {
    const tokens = new Array();
    while (d !== '') {
        if (d.match(/^([ \t\r\n,]+)/)) {
            d = d.substr(RegExp.$1.length);
        }
        else if (d.match(/^([aAcChHlLmMqQsStTvVzZ])/)) {
            tokens[tokens.length] = { type: COMMAND, text: RegExp.$1 };
            d = d.substr(RegExp.$1.length);
        }
        else if (d.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) {
            tokens[tokens.length] = { type: NUMBER, text: `${parseFloat(RegExp.$1)}` };
            d = d.substr(RegExp.$1.length);
        }
        else {
            return [];
        }
    }
    tokens[tokens.length] = { type: EOD, text: '' };
    return tokens;
}
function isType(token, type) {
    return token.type === type;
}
function parsePath(d) {
    const segments = [];
    const tokens = tokenize(d);
    let mode = 'BOD';
    let index = 0;
    let token = tokens[index];
    while (!isType(token, EOD)) {
        let paramsCount = 0;
        const params = [];
        if (mode === 'BOD') {
            if (token.text === 'M' || token.text === 'm') {
                index++;
                paramsCount = PARAMS[token.text];
                mode = token.text;
            }
            else {
                return parsePath('M0,0' + d);
            }
        }
        else if (isType(token, NUMBER)) {
            paramsCount = PARAMS[mode];
        }
        else {
            index++;
            paramsCount = PARAMS[token.text];
            mode = token.text;
        }
        if ((index + paramsCount) < tokens.length) {
            for (let i = index; i < index + paramsCount; i++) {
                const numbeToken = tokens[i];
                if (isType(numbeToken, NUMBER)) {
                    params[params.length] = +numbeToken.text;
                }
                else {
                    throw new Error('Param not a number: ' + mode + ',' + numbeToken.text);
                }
            }
            if (typeof PARAMS[mode] === 'number') {
                const segment = { key: mode, data: params };
                segments.push(segment);
                index += paramsCount;
                token = tokens[index];
                if (mode === 'M')
                    mode = 'L';
                if (mode === 'm')
                    mode = 'l';
            }
            else {
                throw new Error('Bad segment: ' + mode);
            }
        }
        else {
            throw new Error('Path data ended short');
        }
    }
    return segments;
}
function serialize(segments) {
    const tokens = [];
    for (const { key, data } of segments) {
        tokens.push(key);
        switch (key) {
            case 'C':
            case 'c':
                tokens.push(data[0], `${data[1]},`, data[2], `${data[3]},`, data[4], data[5]);
                break;
            case 'S':
            case 's':
            case 'Q':
            case 'q':
                tokens.push(data[0], `${data[1]},`, data[2], data[3]);
                break;
            default:
                tokens.push(...data);
                break;
        }
    }
    return tokens.join(' ');
}

// CONCATENATED MODULE: ./node_modules/path-data-parser/lib/absolutize.js
// Translate relative commands to absolute commands
function absolutize(segments) {
    let cx = 0, cy = 0;
    let subx = 0, suby = 0;
    const out = [];
    for (const { key, data } of segments) {
        switch (key) {
            case 'M':
                out.push({ key: 'M', data: [...data] });
                [cx, cy] = data;
                [subx, suby] = data;
                break;
            case 'm':
                cx += data[0];
                cy += data[1];
                out.push({ key: 'M', data: [cx, cy] });
                subx = cx;
                suby = cy;
                break;
            case 'L':
                out.push({ key: 'L', data: [...data] });
                [cx, cy] = data;
                break;
            case 'l':
                cx += data[0];
                cy += data[1];
                out.push({ key: 'L', data: [cx, cy] });
                break;
            case 'C':
                out.push({ key: 'C', data: [...data] });
                cx = data[4];
                cy = data[5];
                break;
            case 'c': {
                const newdata = data.map((d, i) => (i % 2) ? (d + cy) : (d + cx));
                out.push({ key: 'C', data: newdata });
                cx = newdata[4];
                cy = newdata[5];
                break;
            }
            case 'Q':
                out.push({ key: 'Q', data: [...data] });
                cx = data[2];
                cy = data[3];
                break;
            case 'q': {
                const newdata = data.map((d, i) => (i % 2) ? (d + cy) : (d + cx));
                out.push({ key: 'Q', data: newdata });
                cx = newdata[2];
                cy = newdata[3];
                break;
            }
            case 'A':
                out.push({ key: 'A', data: [...data] });
                cx = data[5];
                cy = data[6];
                break;
            case 'a':
                cx += data[5];
                cy += data[6];
                out.push({ key: 'A', data: [data[0], data[1], data[2], data[3], data[4], cx, cy] });
                break;
            case 'H':
                out.push({ key: 'H', data: [...data] });
                cx = data[0];
                break;
            case 'h':
                cx += data[0];
                out.push({ key: 'H', data: [cx] });
                break;
            case 'V':
                out.push({ key: 'V', data: [...data] });
                cy = data[0];
                break;
            case 'v':
                cy += data[0];
                out.push({ key: 'V', data: [cy] });
                break;
            case 'S':
                out.push({ key: 'S', data: [...data] });
                cx = data[2];
                cy = data[3];
                break;
            case 's': {
                const newdata = data.map((d, i) => (i % 2) ? (d + cy) : (d + cx));
                out.push({ key: 'S', data: newdata });
                cx = newdata[2];
                cy = newdata[3];
                break;
            }
            case 'T':
                out.push({ key: 'T', data: [...data] });
                cx = data[0];
                cy = data[1];
                break;
            case 't':
                cx += data[0];
                cy += data[1];
                out.push({ key: 'T', data: [cx, cy] });
                break;
            case 'Z':
            case 'z':
                out.push({ key: 'Z', data: [] });
                cx = subx;
                cy = suby;
                break;
        }
    }
    return out;
}

// CONCATENATED MODULE: ./node_modules/path-data-parser/lib/normalize.js
// Normalize path to include only M, L, C, and Z commands
function normalize(segments) {
    const out = [];
    let lastType = '';
    let cx = 0, cy = 0;
    let subx = 0, suby = 0;
    let lcx = 0, lcy = 0;
    for (const { key, data } of segments) {
        switch (key) {
            case 'M':
                out.push({ key: 'M', data: [...data] });
                [cx, cy] = data;
                [subx, suby] = data;
                break;
            case 'C':
                out.push({ key: 'C', data: [...data] });
                cx = data[4];
                cy = data[5];
                lcx = data[2];
                lcy = data[3];
                break;
            case 'L':
                out.push({ key: 'L', data: [...data] });
                [cx, cy] = data;
                break;
            case 'H':
                cx = data[0];
                out.push({ key: 'L', data: [cx, cy] });
                break;
            case 'V':
                cy = data[0];
                out.push({ key: 'L', data: [cx, cy] });
                break;
            case 'S': {
                let cx1 = 0, cy1 = 0;
                if (lastType === 'C' || lastType === 'S') {
                    cx1 = cx + (cx - lcx);
                    cy1 = cy + (cy - lcy);
                }
                else {
                    cx1 = cx;
                    cy1 = cy;
                }
                out.push({ key: 'C', data: [cx1, cy1, ...data] });
                lcx = data[0];
                lcy = data[1];
                cx = data[2];
                cy = data[3];
                break;
            }
            case 'T': {
                const [x, y] = data;
                let x1 = 0, y1 = 0;
                if (lastType === 'Q' || lastType === 'T') {
                    x1 = cx + (cx - lcx);
                    y1 = cy + (cy - lcy);
                }
                else {
                    x1 = cx;
                    y1 = cy;
                }
                const cx1 = cx + 2 * (x1 - cx) / 3;
                const cy1 = cy + 2 * (y1 - cy) / 3;
                const cx2 = x + 2 * (x1 - x) / 3;
                const cy2 = y + 2 * (y1 - y) / 3;
                out.push({ key: 'C', data: [cx1, cy1, cx2, cy2, x, y] });
                lcx = x1;
                lcy = y1;
                cx = x;
                cy = y;
                break;
            }
            case 'Q': {
                const [x1, y1, x, y] = data;
                const cx1 = cx + 2 * (x1 - cx) / 3;
                const cy1 = cy + 2 * (y1 - cy) / 3;
                const cx2 = x + 2 * (x1 - x) / 3;
                const cy2 = y + 2 * (y1 - y) / 3;
                out.push({ key: 'C', data: [cx1, cy1, cx2, cy2, x, y] });
                lcx = x1;
                lcy = y1;
                cx = x;
                cy = y;
                break;
            }
            case 'A': {
                const r1 = Math.abs(data[0]);
                const r2 = Math.abs(data[1]);
                const angle = data[2];
                const largeArcFlag = data[3];
                const sweepFlag = data[4];
                const x = data[5];
                const y = data[6];
                if (r1 === 0 || r2 === 0) {
                    out.push({ key: 'C', data: [cx, cy, x, y, x, y] });
                    cx = x;
                    cy = y;
                }
                else {
                    if (cx !== x || cy !== y) {
                        const curves = arcToCubicCurves(cx, cy, x, y, r1, r2, angle, largeArcFlag, sweepFlag);
                        curves.forEach(function (curve) {
                            out.push({ key: 'C', data: curve });
                        });
                        cx = x;
                        cy = y;
                    }
                }
                break;
            }
            case 'Z':
                out.push({ key: 'Z', data: [] });
                cx = subx;
                cy = suby;
                break;
        }
        lastType = key;
    }
    return out;
}
function degToRad(degrees) {
    return (Math.PI * degrees) / 180;
}
function rotate(x, y, angleRad) {
    const X = x * Math.cos(angleRad) - y * Math.sin(angleRad);
    const Y = x * Math.sin(angleRad) + y * Math.cos(angleRad);
    return [X, Y];
}
function arcToCubicCurves(x1, y1, x2, y2, r1, r2, angle, largeArcFlag, sweepFlag, recursive) {
    const angleRad = degToRad(angle);
    let params = [];
    let f1 = 0, f2 = 0, cx = 0, cy = 0;
    if (recursive) {
        [f1, f2, cx, cy] = recursive;
    }
    else {
        [x1, y1] = rotate(x1, y1, -angleRad);
        [x2, y2] = rotate(x2, y2, -angleRad);
        const x = (x1 - x2) / 2;
        const y = (y1 - y2) / 2;
        let h = (x * x) / (r1 * r1) + (y * y) / (r2 * r2);
        if (h > 1) {
            h = Math.sqrt(h);
            r1 = h * r1;
            r2 = h * r2;
        }
        const sign = (largeArcFlag === sweepFlag) ? -1 : 1;
        const r1Pow = r1 * r1;
        const r2Pow = r2 * r2;
        const left = r1Pow * r2Pow - r1Pow * y * y - r2Pow * x * x;
        const right = r1Pow * y * y + r2Pow * x * x;
        const k = sign * Math.sqrt(Math.abs(left / right));
        cx = k * r1 * y / r2 + (x1 + x2) / 2;
        cy = k * -r2 * x / r1 + (y1 + y2) / 2;
        f1 = Math.asin(parseFloat(((y1 - cy) / r2).toFixed(9)));
        f2 = Math.asin(parseFloat(((y2 - cy) / r2).toFixed(9)));
        if (x1 < cx) {
            f1 = Math.PI - f1;
        }
        if (x2 < cx) {
            f2 = Math.PI - f2;
        }
        if (f1 < 0) {
            f1 = Math.PI * 2 + f1;
        }
        if (f2 < 0) {
            f2 = Math.PI * 2 + f2;
        }
        if (sweepFlag && f1 > f2) {
            f1 = f1 - Math.PI * 2;
        }
        if (!sweepFlag && f2 > f1) {
            f2 = f2 - Math.PI * 2;
        }
    }
    let df = f2 - f1;
    if (Math.abs(df) > (Math.PI * 120 / 180)) {
        const f2old = f2;
        const x2old = x2;
        const y2old = y2;
        if (sweepFlag && f2 > f1) {
            f2 = f1 + (Math.PI * 120 / 180) * (1);
        }
        else {
            f2 = f1 + (Math.PI * 120 / 180) * (-1);
        }
        x2 = cx + r1 * Math.cos(f2);
        y2 = cy + r2 * Math.sin(f2);
        params = arcToCubicCurves(x2, y2, x2old, y2old, r1, r2, angle, 0, sweepFlag, [f2, f2old, cx, cy]);
    }
    df = f2 - f1;
    const c1 = Math.cos(f1);
    const s1 = Math.sin(f1);
    const c2 = Math.cos(f2);
    const s2 = Math.sin(f2);
    const t = Math.tan(df / 4);
    const hx = 4 / 3 * r1 * t;
    const hy = 4 / 3 * r2 * t;
    const m1 = [x1, y1];
    const m2 = [x1 + hx * s1, y1 - hy * c1];
    const m3 = [x2 + hx * s2, y2 - hy * c2];
    const m4 = [x2, y2];
    m2[0] = 2 * m1[0] - m2[0];
    m2[1] = 2 * m1[1] - m2[1];
    if (recursive) {
        return [m2, m3, m4].concat(params);
    }
    else {
        params = [m2, m3, m4].concat(params);
        const curves = [];
        for (let i = 0; i < params.length; i += 3) {
            const r1 = rotate(params[i][0], params[i][1], angleRad);
            const r2 = rotate(params[i + 1][0], params[i + 1][1], angleRad);
            const r3 = rotate(params[i + 2][0], params[i + 2][1], angleRad);
            curves.push([r1[0], r1[1], r2[0], r2[1], r3[0], r3[1]]);
        }
        return curves;
    }
}

// CONCATENATED MODULE: ./node_modules/path-data-parser/lib/index.js




// CONCATENATED MODULE: ./src/index.ts
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pointsOnPath", function() { return pointsOnPath; });


function pointsOnPath(path, tolerance, distance) {
    const segments = parsePath(path);
    const normalized = normalize(absolutize(segments));
    const sets = [];
    let currentPoints = [];
    let start = [0, 0];
    let pendingCurve = [];
    const appendPendingCurve = () => {
        if (pendingCurve.length >= 4) {
            currentPoints.push(...pointsOnBezierCurves(pendingCurve, tolerance));
        }
        pendingCurve = [];
    };
    const appendPendingPoints = () => {
        appendPendingCurve();
        if (currentPoints.length) {
            sets.push(currentPoints);
            currentPoints = [];
        }
    };
    for (const { key, data } of normalized) {
        switch (key) {
            case 'M':
                appendPendingPoints();
                start = [data[0], data[1]];
                currentPoints.push(start);
                break;
            case 'L':
                appendPendingCurve();
                currentPoints.push([data[0], data[1]]);
                break;
            case 'C':
                if (!pendingCurve.length) {
                    const lastPoint = currentPoints.length ? currentPoints[currentPoints.length - 1] : start;
                    pendingCurve.push([lastPoint[0], lastPoint[1]]);
                }
                pendingCurve.push([data[0], data[1]]);
                pendingCurve.push([data[2], data[3]]);
                pendingCurve.push([data[4], data[5]]);
                break;
            case 'Z':
                appendPendingCurve();
                currentPoints.push([start[0], start[1]]);
                break;
        }
    }
    appendPendingPoints();
    if (!distance) {
        return sets;
    }
    const out = [];
    for (const set of sets) {
        const simplifiedSet = simplify(set, distance);
        if (simplifiedSet.length) {
            out.push(simplifiedSet);
        }
    }
    return out;
}


/***/ })

/******/ },
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ 	"use strict";
/******/ 
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getter */
/******/ 	!function() {
/******/ 		// define getter function for harmony exports
/******/ 		var hasOwnProperty = Object.prototype.hasOwnProperty;
/******/ 		__webpack_require__.d = function(exports, name, getter) {
/******/ 			if(!hasOwnProperty.call(exports, name)) {
/******/ 				Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ }
);