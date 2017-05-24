// Copywright Matthew Hartloff 2016
// Utils.js

////////////////////////////////////////////////////////////////
// Color

// values are floats from 0.0 - 1.0
function Color(r, g, b, a) {
	this.set(r, g, b, a);
}

Color.prototype.set = function (r, g, b, a) {

	// Catch attempt to set rgb to values between 0-255.
	if (r > 1.0 || g > 1.0 || b > 1.0 || a > 1.0) {	
		this.r = r / 255;
		this.g = g / 255;
		this.b = b / 255;
		this.a = (a == undefined) ? 1.0 : a / 255;
	}
	else {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = (a == undefined) ? 1.0 : a;
	}
};

Color.prototype.adjustBrightness = function (fraction) {

	this.r = Math.min(1.0, this.r * fraction);
	this.g = Math.min(1.0, this.g * fraction);
	this.b = Math.min(1.0, this.b * fraction);
};


////////////////////////////////////////////////////////////////
// Range

function Range(value1, value2) {
    this.start = 1e7;
    this.end = -1e7;
    this.set(value1, value2);
}

Range.prototype.set = function (value1, value2) {
    if (value1 != null)
        this.start = value1 < value2 ? value1 : value2;
    if (value2 != null)
        this.end = value2 > value1 ? value2 : value1;
};

Range.prototype.isValid = function () {
    return this.start <= this.end;
};

Range.prototype.contains = function (val) {
	return this.isValid() && val >= this.start && val <= this.end;
}

// Reduces the range to that which is included in both ranges.
Range.prototype.inclusive = function(other /* Range */) {
    
    this.start = this.start > other.start ? this.start : other.start;
    this.end = this.end < other.end ? this.end : other.end;
};

Range.prototype.isWithin = function (min, max) {
    return this.isValid() && this.end >= min && this.start <= max;
};

////////////////////////////////////////////////////////////////
// Vector2 - a 2D vector

function Vector2 (x, y) {
	this.x = x;
	this.y = y;
};

Vector2.prototype.clone = function () {
    return new Vector2(this.x, this.y);
};

Vector2.prototype.set = function (x, y) {
	this.x = x;
	this.y = y;
};

// Returns the counter clockwise perpedicular to this ray.
Vector2.prototype.perpedicular = function () {
	return new Vector2(-this.y, this.x);
};

Vector2.prototype.length = function () {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector2.prototype.setLength = function (newLength) {
	var length = this.length();
	this.mult(newLength / length);
	return this;
};

Vector2.prototype.distance = function (other /* Vector2 */) {
	var p = this.subc(other);
	return p.length();
};

Vector2.prototype.add = function (other) {
	this.x += other.x;
	this.y += other.y;
	return this;
};

Vector2.prototype.addc = function (other /* Vector2 */) {
	return new Vector2(this.x + other.x, this.y + other.y);
};


Vector2.prototype.sub = function (other) {
	this.x -= other.x;
	this.y -= other.y;
	return this;
};

Vector2.prototype.subc = function (other /* Vector2 */) {

	return new Vector2(this.x - other.x, this.y - other.y);
};

Vector2.prototype.mult = function (scalar) {
	this.x *= scalar;
	this.y *= scalar;
	return this;
};

Vector2.prototype.multc = function (other /* Vector2 */) {

	return new Vector2(this.x * scalar, this.y * scalar);
};

Vector2.prototype.div = function (scalar) {
	this.x /= scalar;
	this.y /= scalar;
	return this;
};

Vector2.prototype.divc = function (other /* Vector2 */) {

	return new Vector2(this.x * scalar, this.y * scalar);
};

Vector2.prototype.dot = function (other /* Vector2 */) {
	return other.x * this.x + other.y * this.y;
};

Vector2.prototype.normalize = function () {
	this.div(this.length());
	return this;
};

Vector2.prototype.normalized = function () {
   var result = this.clone();
   result.div(this.length());
   return result;
}

Vector2.prototype.angleBetween = function (other /* Vector2 */) {
   var a = this.normalized();
   var b = other.normalized();
   var dot = a.dot(b);
   return Math.acos(dot);
}

// The angle from 0,1, returned in radians.  Range = {0, 2 * PI}
Vector2.prototype.angle = function () {
	var p = this.normalized();
		
	var angle = Math.acos(p.x);	// This will return a value between 
	if (p.y < 0)
		angle = Math.PI + (Math.PI - angle);
	return angle;
}

Vector2.prototype.toString = function (precision) {
	var p = precision ? precision : 4;
   return "X: " + this.x.toFixed(p) + "\tY: " + this.y.toFixed(p);
}



////////////////////////////////////////////////////////////////
// Line2

function Line2(p1 /* Vector 2 */, p2 /* Vector2 */) {
	this.p1 = p1;
	this.p2 = p2;
}

Line2.prototype.normal = function () {
	var normal = this.direction().perpedicular();
	normal.normalize();
	return normal;
};

Line2.prototype.direction = function () {
	return this.p2.subc(this.p1);
};

Line2.prototype.distance = function (point) {
	var p = point.subc(this.p1);
	var distance = p.dot(this.normal());
	return Math.abs(distance);
};

Line2.prototype.getCenter = function () {
	return new Vector2((this.p1.x+this.p2.x)/2.0, (this.p1.y+this.p2.y)/2.0);
};

// Get the intersection between 2 rays.
Line2.prototype.intersection = function (other /* Line2 */) {

	var direction = this.direction().normalize();
	var normal = other.normal();

	var dot = Math.abs(direction.dot(normal));	// Approach speed
	if (dot < 0.001)
		return null;		// Lines are parallel.
	var distance = other.distance(this.p1);
	var param = distance / dot;		// This could be checked against the length to ensure it's still on a line.
	var intersection = this.p1.addc(direction.mult(param));

	if (other.distance(intersection) > distance)
		return null;	// Rays are moving away from each other.
	return intersection;
};

// Get the intersection between 2 line segments.
Line2.prototype.segmentIntersection = function (other /* Line2 */) {

	// this all seems terrible..

	var tx1;
	var tx2;
	var ty1;
	var ty2;

	var ox1;
	var ox2;
	var oy1;
	var oy2;

	// order segments points by increasing x
	if(this.p1.x < this.p2.x){
		tx1 = this.p1.x;
		tx2 = this.p2.x;
		ty1 = this.p1.y;
		ty2 = this.p2.y;
	}else{
		tx1 = this.p2.x;
		tx2 = this.p1.x;
		ty1 = this.p2.y;
		ty2 = this.p1.y;
	}

	if(other.p1.x < other.p2.x){
		ox1 = other.p1.x;
		ox2 = other.p2.x;
		oy1 = other.p1.y;
		oy2 = other.p2.y;
	}else{
		ox1 = other.p2.x;
		ox2 = other.p1.x;
		oy1 = other.p2.y;
		oy2 = other.p1.y;
	}




	if(other.p1.x)
	var direction = this.direction().normalize();
	var normal = other.normal();

	var dot = Math.abs(direction.dot(normal));	// Approach speed
	if (dot < 0.001)
		return null;		// Lines are parallel.
	var distance = other.distance(this.p1);
	var param = distance / dot;		// This could be checked against the length to ensure it's still on a line.
	var intersection = this.p1.addc(direction.mult(param));

	if (other.distance(intersection) > distance)
		return null;	// Rays are moving away from each other.
	return intersection;
};

////////////////////////////////////////////////////////////////
// Line

function Line (p1 /* Vector3 */, p2 /* Vector3 */) {
    this.p1 = p1;
    this.p2 = p2;
}

Line.prototype.set = function (p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
};

Line.prototype.length = function () {
    return this.p1.distance(this.p2);
};

Line.prototype.getDirection = function () {
    var dir = this.p2.subc(this.p1);
    dir.normalize();
    return dir;
};

////////////////////////////////////////////////////////////////
// Plane

function Plane(point, normal) {
    this.point = point;
    this.normal = normal;
    normal.normalize();
}

Plane.prototype.set = function(point, normal) {
    this.point = point;
    this.normal = normal;
    normal.normalize();
};

Plane.prototype.getPointDistance = function (point /* Vector */) {
    var distance = this.point.subc(point).dot(this.normal);
    return Math.abs(distance);
};

Plane.prototype.getLineIntersection = function (line /* Line */) {
    var distanceFromPlane1 = this.getPointDistance(line.p1);
    var distanceFromPlane2 = this.getPointDistance(line.p2);
    var distanceFromPlane = Math.max(distanceFromPlane1, distanceFromPlane2);
    var reverse = distanceFromPlane2 > distanceFromPlane1;
            
    var lineDir = line.getDirection();
    var dot = Math.abs(lineDir.dot(this.normal));     // This is how fast the line approaches the plane.
    if (dot < 0.00001)
        return null;        // normal and this line are parallel.
    var distanceOnLine = distanceFromPlane / Math.abs(dot);
    var lineLength = line.length();
    if (distanceOnLine > line.length())
        return null;        // Intersect point is beyond the point where the line ends.
    var moveVector = lineDir.mult(distanceOnLine);
    var inter = reverse ? line.p2.subc(moveVector) : line.p1.addc(moveVector);
    return {
        intersection: inter,
        param: distanceOnLine / lineLength
    };
};

Plane.createFromPoints = function (p1, p2, p3) {
    var seg = p3.subc(p1);
    var seg2 = p2.subc(p1);
    var plane = new Plane(p1, seg2.cross(seg));
    return plane;
};

////////////////////////////////////////////////////////////////
// Bounding Box

function BoundingBox(p1, p2) {
	this.min = { x: 1e8, y: 1e8, z: 1e8 };
	this.max = { x: -1e8, y: -1e8, z: -1e8 };
        
    if (p1 != null)
        this.addPoint(p1);
    if (p2 != null)
        this.addPoint(p2);
}


BoundingBox.prototype.isValid = function () {
    return this.min.x <= this.max.x;
};

BoundingBox.prototype.addPoint = function (p /* Vector */) {
    if (p.x < this.min.x) this.min.x = p.x;
    if (p.y < this.min.y) this.min.y = p.y;
    if (p.z < this.min.z) this.min.z = p.z;
    if (p.x > this.max.x) this.max.x = p.x;
    if (p.y > this.max.y) this.max.y = p.y;
    if (p.z > this.max.z) this.max.z = p.z;
};

BoundingBox.prototype.addPoint2 = function (x, y, z) {
    if (x < this.min.x) this.min.x = x;
    if (y < this.min.y) this.min.y = y;
    if (z < this.min.z) this.min.z = z;
    if (x > this.max.x) this.max.x = x;
    if (y > this.max.y) this.max.y = y;
    if (z > this.max.z) this.max.z = z;
};

BoundingBox.prototype.getSize = function () {
    return new Vector(this.max.x - this.min.x,
                      this.max.y - this.min.y,
                      this.max.z - this.min.z);
};

BoundingBox.prototype.contains = function (p /* Vector */) {
    return p.x >= this.min.x
        && p.x <= this.max.x
        && p.y >= this.min.y
        && p.y <= this.max.y
        && p.z >= this.min.z
        && p.z <= this.max.z;
};

BoundingBox.prototype.clear = function() {
    this.min.x = this.min.y = this.min.z = 1e8;
    this.max.x = this.max.y = this.max.z = -1e8;
};



var il_range1 = new Range();    // Because this function will be called often, it can save time by declaring these as global.
var il_range2 = new Range();
var il_range3 = new Range();

BoundingBox.prototype.intersectsLine = function (line /* Line */) {
    var p1 = line.p1;
    var p2 = line.p2;
    
    var delta = p2.x - p1.x;
    il_range1.set((this.min.x - p1.x) / delta, (this.max.x - p1.x) / delta);
    if (!il_range1.isWithin(0, 1))
        return false;

    delta = p2.y - p1.y;
    il_range2.set((this.min.y - p1.y) / delta, (this.max.y - p1.y) / delta);
    il_range1.inclusive(il_range2);
    if (!il_range1.isWithin(0, 1))
        return false;

    delta = p2.z - p1.z;
    il_range2.set((this.min.z - p1.z) / delta, (this.max.z - p1.z) / delta);
    il_range1.inclusive(il_range2);
    
    return il_range1.isWithin(0, 1);
};


////////////////////////////////////////////////////////////////
// Vector 

function Vector(x/*float*/, y/*float*/, z/*float*/) {
    this.x = x == undefined ? 0.0 : x;
    this.y = y == undefined ? 0.0 : y;
    this.z = z == undefined ? 0.0 : z;
}

// set (x,y,z) or set(vec)
Vector.prototype.set = function (xOrVec, y, z) {
	if (xOrVec.x !== undefined) {
		this.x = xOrVec.x;
		this.y = xOrVec.y;
		this.z = xOrVec.z;
	}
	else {
		this.x = xOrVec;
		this.y = y;
		this.z = z;
	}
};

// Get a single component with an index, starting at 0.
Vector.prototype.getComponent = function (i) {
	if (i == 0)		 return this.x;
	else if (i == 1) return this.y;
	else if (i == 2) return this.z;
};

Vector.prototype.setComponent = function (i, value) {
	if (i == 0)		 this.x = value;
	else if (i == 1) this.y = value;
	else if (i == 2) this.z = value;
};

Vector.prototype.clone = function () {
    return new Vector(this.x, this.y, this.z);
};

Vector.prototype.equals = function (other /* vector */, tolerance) {
    var d = this.distance(other);
    if (tolerance == null)
        return d < 0.00001;
    return d < tolerance;
};

// returns number
Vector.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

Vector.prototype.setLength = function (newLength) {
	var length = this.length();
	this.mult(newLength / length);
	return this;
};

Vector.prototype.distance = function (other /* vector */) {
    var temp = this.clone();
    temp.sub(other);
    return temp.length();
};

Vector.prototype.normalize = function () {
	this.div(this.length());
	return this;
};

Vector.prototype.normalized = function () {
    var result = this.clone();
    result.div(this.length());
    return result;
};

Vector.prototype.reverse = function () {
	this.x = -this.x;
	this.y = -this.y;
	this.z = -this.z;
};

Vector.prototype.reversed = function () {
	return new Vector(-this.x, -this.y, -this.z);
};

// returns number
Vector.prototype.dot = function (other /* vector */) {
    return other.x * this.x + other.y * this.y + other.z * this.z;
};

// returns vector
Vector.prototype.cross = function (other /* vector */) {
    var result = new Vector();
    result.x = this.y * other.z - this.z * other.y;
    result.y = this.z * other.x - this.x * other.z;
    result.z = this.x * other.y - this.y * other.x;
    return result;
};

Vector.prototype.angle = function (other /* vector */) {
    var a = this.normalized();
    var b = other.normalized();
    var dot = a.dot(b);
    return Math.acos(dot);
};

Vector.prototype.angleDeg = function (other /* vector */) {
    return MathExt.radToDeg(this.angle(other));
};

Vector.prototype.sub = function (other /* vector */) {
    this.x = this.x - other.x;
    this.y = this.y - other.y;
    this.z = this.z - other.z;
};

Vector.prototype.subc = function (other /* vector */) {
    var result = this.clone();
    result.sub(other);
    return result;
};

Vector.prototype.add = function (other /* vector */) {
    this.x = this.x + other.x;
    this.y = this.y + other.y;
    this.z = this.z + other.z;
    return this;
};

Vector.prototype.addc = function (other /* vector */) {
	var result = this.clone();
	result.add(other);
	return result;
};

// Add passing individual components.
Vector.prototype.addComp = function (x, y, z) {
	this.x += x;
	this.y += y;
	this.z += z;

	return this;
};

Vector.prototype.mult = function (scalar) {
    this.x = this.x * scalar;
    this.y = this.y * scalar;
    this.z = this.z * scalar;
    return this;
};

Vector.prototype.multc = function (scalar) {
    var result = this.clone();
    result.mult(scalar);
    return result;
};

Vector.prototype.div = function (scalar) {
    this.x = this.x / scalar;
    this.y = this.y / scalar;
    this.z = this.z / scalar;
    return this;
};

Vector.prototype.divc = function (scalar) {
    var result = this.clone();
    result.div(scalar);
    return result;
};

Vector.prototype.toString = function (precision) {
	var p = precision ? precision : 4;
   return "X: " + this.x.toFixed(p) + "\tY: " + this.y.toFixed(p) + "\tZ: " + this.z.toFixed(p);
};

//////////////////////////////////////////////////////////////
// Triangle


function Triangle(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
}

// From http://math.oregonstate.edu/home/programs/undergrad/CalculusQuestStudyGuides/vcalc/crossprod/crossprod.html
Triangle.prototype.getArea = function (triangle) {
    this.p2.sub(this.p1); // triangle.b is now vec ab
    this.p3.sub(this.p1); // triangle.c is now vec ac
    var cross = this.p2.cross(this.p3);
    var area = cross.length() / 2.0;
    return area;
};

Triangle.prototype.getCentroid = function (triangle) {
	var center = this.p1.clone();
	center.add(this.p2);
	center.add(this.p3);
	center.div(3);
	return center;
};

Triangle.prototype.isPointWithin = function (point) {
    var e12 = this.p1.subc(this.p2);
    var e23 = this.p2.subc(this.p3);
    var e31 = this.p3.subc(this.p1);
    var normal = e12.cross(e23);

    var cross_e12 = e12.cross(normal);
    var v12 = point.subc(this.p2);
    var dot_e12 = v12.dot(cross_e12);
    if (dot_e12 < 0.0)
        return false;

    var cross_e23 = e23.cross(normal);
    var v23 = point.subc(this.p3);
    var dot_e23 = v23.dot(cross_e23);
    if (dot_e23 < 0.0)
        return false;

    var cross_e31 = e31.cross(normal);
    var v31 = point.subc(this.p1);
    var dot_e31 = v31.dot(cross_e31);
    if (dot_e31 < 0.0)
        return false;

    return true;
};

//////////////////////////////////////////////////////////////
// MathExt
// - Extension to the normal javascript Math library

var MathExt = {

	radToDeg: function (rad) { return rad * 57.2957795; },
	degToRad: function (deg) { return deg / 57.2957795; },

	/* passed in 3 points on a triangle */
	normal: function (a, b, c) {
		var ba = b.subc(a);
		var bc = b.subc(c);
		ba = ba.cross(bc);
		ba.normalize();
		return ba;
	},
	close: function (a, b, tol) {
		return Math.abs(a - b) <= (tol ? tol : 0.001);
	},

	// Returns the height of the sphere centered on 0, 0 at the passed x, y
	heightOfSphere: function (sphereRadius, x, y) {
		var h = Math.cos(x / sphereRadius) * Math.cos(y / sphereRadius) * sphereRadius;
		return h;
	}


};



//////////////////////////////////////////////////////////
// Matrix
// Matrix math.  Based on examples in WebGL: Programming Guide.


function Matrix()
{
	// Set to identity
	this.e = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

Matrix.prototype.set = function (other /* Matrix */)
{
	for (var i = 0; i < 16; i++) {
		this.e[i] = other.e[i];
	}
};

Matrix.prototype.clone = function ()
{
	var n = new Matrix();
	for (var i = 0; i < 16; i++) {
		n.e[i] = this.e[i];
	}
	return n;
};

Matrix.prototype.reset = function ()
{
	var e = this.e;
	e[0] = 1; e[4] = 0; e[8] = 0; e[12] = 0;
	e[1] = 0; e[5] = 1; e[9] = 0; e[13] = 0;
	e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
	e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
	return this;
};

Matrix.prototype.applyToVec2 = function (vec /* Vector2 */) {
	var e = this.e;
	var x, y;

	x = vec.x * e[0] + vec.y * e[4] + e[12];
	y = vec.x * e[1] + vec.y * e[5] + e[13];
	vec.set(x, y);
	return vec;
}

Matrix.prototype.applyToVector = function (vec /* Vector */) {
	var e = this.e;
	var x, y, z;

	x = vec.x * e[0] + vec.y * e[4] + vec.z * e[8] + e[12];
	y = vec.x * e[1] + vec.y * e[5] + vec.z * e[9] + e[13];
	z = vec.x * e[2] + vec.y * e[6] + vec.z * e[10] + e[14];
	vec.set(x, y, z);
	return vec;
};

// Deprecated
Matrix.prototype.applyToVec = function (vec /* Vector */)  {
	return this.applyToVector(vec);
};


// Using floating point precision, the rotation matrix can get off after several multiplications.  This renormalizes the rotation matrix.
Matrix.prototype.normalizeRotation = function (tolerance /* number */)  {
	var e = this.e;
	var tol = tolerance == null ? 0.001 : tolerance;
	var xMag = e[0] * e[0] + e[1] * e[1] + e[2] * e[2];
	var yMag = e[4] * e[4] + e[5] * e[5] + e[6] * e[6];
	var zMag = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
	if (Math.abs(xMag - 1.0) > tol || Math.abs(yMag - 1.0) > tol || Math.abs(zMag - 1.0) > tol) {
		var xVec = new Vector(e[0], e[1], e[2]);
		xVec.normalize();
		var yVec = new Vector(e[4], e[5], e[6]);
		var zVec = xVec.cross(yVec);
		zVec.normalize();
		yVec = zVec.cross(xVec);
		e[0] = xVec.x; e[1] = xVec.y; e[2] = xVec.z;
		e[4] = yVec.x; e[5] = yVec.y; e[6] = yVec.z;
		e[8] = zVec.x; e[9] = zVec.y; e[10] = zVec.z;
	}
};

// Retrieve the x axis by going horizontally (row-major?)
Matrix.prototype.getXAxisH = function (result /* Vector */) {
	if (!result) result = new Vector();
	result.x = this.e[0];
	result.y = this.e[1];
	result.z = this.e[2];
	return result;
};

Matrix.prototype.getYAxisH = function (result /* Vector */) {
	if (!result) result = new Vector();
	result.x = this.e[4];
	result.y = this.e[5];
	result.z = this.e[6];
	return result;
};

Matrix.prototype.getZAxisH = function (result /* Vector */) {
	if (!result) result = new Vector();
	result.x = this.e[8];
	result.y = this.e[9];
	result.z = this.e[10];
	return result;
};

// Retrieve the y axis by going vertically (column-major?)
Matrix.prototype.getXAxisV = function (result /* Vector */) {
	if (!result) result = new Vector();
	result.x = this.e[0];
	result.y = this.e[4];
	result.z = this.e[8];
	return result;
};

Matrix.prototype.getYAxisV = function (result /* Vector */) {
	if (!result) result = new Vector();
	result.x = this.e[1];
	result.y = this.e[5];
	result.z = this.e[9];
	return result;
};

Matrix.prototype.getZAxisV = function (result /* Vector */) {
	if (!result) result = new Vector();
	result.x = this.e[2];
	result.y = this.e[6];
	result.z = this.e[10];
	return result;
};

// Set the orientation of the axis where the z vec appears to point in the passed direction.
Matrix.prototype.setAxes = function (xVec, yVec, zVec) {
	var e = this.e;
	e[0] = xVec.x; e[1] = xVec.y; e[2] = xVec.z;
	e[4] = yVec.x; e[5] = yVec.y; e[6] = yVec.z;
	if (zVec)
		e[8] = zVec.x; e[9] = zVec.y; e[10] = zVec.z;
};

// Set the orientation of the axes where the z vec goes into the screen.
Matrix.prototype.setAxes2 = function (xVec, yVec, zVec) {
	var e = this.e;
	e[0] = xVec.x; e[4] = xVec.y; e[8] = xVec.z;
	e[1] = yVec.x; e[5] = yVec.y; e[9] = yVec.z;
	if (zVec)
		e[2] = zVec.x; e[6] = zVec.y; e[10] = zVec.z;
};


Matrix.prototype.setToTranslation = function (x, y, z)  {
	var e = this.e;
	e[0] = 1; e[4] = 0; e[8] = 0; e[12] = x;
	e[1] = 0; e[5] = 1; e[9] = 0; e[13] = y;
	e[2] = 0; e[6] = 0; e[10] = 1; 
	if (z !== undefined)
		e[14] = z;
	e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
	return this;
};

Matrix.prototype.translate = function (x, y, z)
{
	var e = this.e;

	if (z === undefined) {
		e[12] += e[0] * x + e[4] * y;
		e[13] += e[1] * x + e[5] * y;
		e[14] += e[2] * x + e[6] * y;
		e[15] += e[3] * x + e[7] * y;
	}
	else {
		e[12] += e[0] * x + e[4] * y + e[8] *  z;
		e[13] += e[1] * x + e[5] * y + e[9] *  z;
		e[14] += e[2] * x + e[6] * y + e[10] * z;
		e[15] += e[3] * x + e[7] * y + e[11] * z;
	}
	return this;
};

// Set the rotation to an angle around a rotation axis.  Angle in radians.
Matrix.prototype.setToRotation = function (x, y, z, angle)
{
	var e, s, c, len, rlen, nc, xy, yz, zx, xs, ys, zs;

	var e = this.e;

	var s = Math.sin(angle);
	var c = Math.cos(angle);
	
	// Rotation around another axis
	var len = Math.sqrt(x * x + y * y + z * z);
	if (len !== 1) {
		var rlen = 1 / len;
		x *= rlen;
		y *= rlen;
		z *= rlen;
	}
	nc = 1 - c;
	xy = x * y;
	yz = y * z;
	zx = z * x;
	xs = x * s;
	ys = y * s;
	zs = z * s;

	e[0] = x * x * nc + c;
	e[1] = xy * nc + zs;
	e[2] = zx * nc - ys;
	e[3] = 0;

	e[4] = xy * nc - zs;
	e[5] = y * y * nc + c;
	e[6] = yz * nc + xs;
	e[7] = 0;

	e[8] = zx * nc + ys;
	e[9] = yz * nc - xs;
	e[10] = z * z * nc + c;
	e[11] = 0;

	e[12] = 0;
	e[13] = 0;
	e[14] = 0;
	e[15] = 1;

	return this;
};

// Rotate the matrix around the passed axis, angle in radians
Matrix.prototype.rotate = function (x, y, z, angle) {
	var m = new Matrix();
	m.setToRotation(x, y, z, angle);
	var x = this.clone();
	var xMag = m.e[0] * m.e[0] + m.e[1] * m.e[1] + m.e[2] * m.e[2];
	var thisXMag = this.e[0] * this.e[0] + this.e[1] * this.e[1] + this.e[2] * this.e[2];
	this.preMultiply(m);
	var thisXMag2 = this.e[0] * this.e[0] + this.e[1] * this.e[1] + this.e[2] * this.e[2];
	this.normalizeRotation();
	return this;
};

// Generally objects are built on the xz plane and y is up.  So this is useful for orienting such objects.
// Xvector is optional.
Matrix.prototype.setFromTransform = function (center, yVector, xVector) {
	if (!xVector)
		xVector = new Vector (1, 0, 0);
	if (xVector.distance(yVector) < 0.005) {
		xVector.set (0, 1, 0);
		if (xVector.distance(yVector < 0.005)) 
			xVector.set(1, 0, 0);
	}
	var offset = center.clone();
	var yVec = yVector.clone();
	yVec.normalize();
	var xVec = xVector;
	var zVec = xVec.cross(yVec);
	zVec.normalize();
	xVec = yVec.cross(zVec);

	this.translate(offset.x, offset.y, offset.z ? offset.z : 0.0);	// may be a vector2
	this.setAxes(xVec, yVec, zVec);
};

// Useful for setting the orientation of the camera for which the z vector is significant.
Matrix.prototype.setFromOrientation = function(zVec, yUp) {
	zVec.normalize();
	var yVec = yUp.clone();
	yVec.normalize();
	if (zVec.distance(yVec) < 0.005) {
		if (yVec.distance(new Vector(0, 1, 0) < 0.005)) 
			yVec.set(0, 0, 1);
		else 
			yVec.set(0, 1, 0);  // try for true y up.
	}
	var xVec = yVec.cross(zVec);
	xVec.normalize();
	yVec = zVec.cross(xVec);
	yVec.normalize();
	this.setAxes2(xVec, yVec, zVec);
};

// Multiply this matrix by the passed matrix.  
Matrix.prototype.multiply = function (other /* matrix */, optResult)
{    
	var e = this.e;
	var b = other.e;
	var r = optResult != null ? optResult.e : this.e;

	var ai0, ai1, ai2, ai3;
	for (var i = 0; i < 4; i++) {
		ai0 = e[i]; ai1 = e[i + 4]; ai2 = e[i + 8]; ai3 = e[i + 12];
		r[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];   
		r[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
		r[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
		r[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
	}
};

// Multiply this matrix by the passed matrix.  
Matrix.prototype.preMultiply = function (other /* matrix */, optResult) {
	var a = other.e;
	var b = this.e;
	var r = optResult != null ? optResult.e : this.e;

	//r[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
	//r[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
	//r[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
	//r[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

	//r[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
	//r[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
	//r[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
	//r[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

	//r[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
	//r[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
	//r[10] = a[8] * b[2] + a[10] * b[6] + a[10] * b[10] + a[11] * b[14];
	//r[11] = a[8] * b[3] + a[10] * b[7] + a[10] * b[11] + a[11] * b[15];

	//r[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
	//r[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
	//r[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
	//r[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

	var ai0, ai1, ai2, ai3;
	for (var i = 0; i < 4; i++) {
		ai0 = a[i]; ai1 = a[i + 4]; ai2 = a[i + 8]; ai3 = a[i + 12];
		r[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
		r[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
		r[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
		r[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
	}


	//console.log(r[0] * r[0] + r[1] * r[1] + r[2] * r[2]);
	//console.log(r[4] * r[4] + r[5] * r[5] + r[6] * r[6]);
	//console.log(r[8] * r[8] + r[9] * r[9] + r[10] * r[10]);
	//console.log(r[0] * r[0] + r[4] * r[4] + r[8] * r[8]);
	//console.log(r[1] * r[1] + r[5] * r[5] + r[9] * r[9]);
	//console.log(r[2] * r[2] + r[6] * r[6] + r[10] * r[10]);
	//console.log(r[3] + " " + r[7] + " " + r[11]);
	//console.log(" ");
	//console.log(r[0] * r[0] + r[1] * r[1] + r[2] * r[2]);
};

// Const.  Multiply a matrix by this one, returning the result.  
Matrix.prototype.multiplied = function (other /* matrix */) {
	var n = this.clone();
	n.multiply(other);
	return n;
};

// Const.  Multiply a matrix by this one, returning the result.  
Matrix.prototype.premultiplied = function (other /* matrix */) {
	var n = this.clone();
	n.preMultiply(other);
	return n;
};

Matrix.prototype.invert = function (optResult) {
	var e = this.e;
	var r = optResult != null ? optResult.e : this.e;
	var inv = new Float32Array(16);

	inv[0] = e[5] * e[10] * e[15] - e[5] * e[11] * e[14] - e[9] * e[6] * e[15]
				+ e[9] * e[7] * e[14] + e[13] * e[6] * e[11] - e[13] * e[7] * e[10];
	inv[4] = -e[4] * e[10] * e[15] + e[4] * e[11] * e[14] + e[8] * e[6] * e[15]
				- e[8] * e[7] * e[14] - e[12] * e[6] * e[11] + e[12] * e[7] * e[10];
	inv[8] = e[4] * e[9] * e[15] - e[4] * e[11] * e[13] - e[8] * e[5] * e[15]
				+ e[8] * e[7] * e[13] + e[12] * e[5] * e[11] - e[12] * e[7] * e[9];
	inv[12] = -e[4] * e[9] * e[14] + e[4] * e[10] * e[13] + e[8] * e[5] * e[14]
				- e[8] * e[6] * e[13] - e[12] * e[5] * e[10] + e[12] * e[6] * e[9];

	inv[1] = -e[1] * e[10] * e[15] + e[1] * e[11] * e[14] + e[9] * e[2] * e[15]
				- e[9] * e[3] * e[14] - e[13] * e[2] * e[11] + e[13] * e[3] * e[10];
	inv[5] = e[0] * e[10] * e[15] - e[0] * e[11] * e[14] - e[8] * e[2] * e[15]
				+ e[8] * e[3] * e[14] + e[12] * e[2] * e[11] - e[12] * e[3] * e[10];
	inv[9] = -e[0] * e[9] * e[15] + e[0] * e[11] * e[13] + e[8] * e[1] * e[15]
				- e[8] * e[3] * e[13] - e[12] * e[1] * e[11] + e[12] * e[3] * e[9];
	inv[13] = e[0] * e[9] * e[14] - e[0] * e[10] * e[13] - e[8] * e[1] * e[14]
				+ e[8] * e[2] * e[13] + e[12] * e[1] * e[10] - e[12] * e[2] * e[9];

	inv[2] = e[1] * e[6] * e[15] - e[1] * e[7] * e[14] - e[5] * e[2] * e[15]
				+ e[5] * e[3] * e[14] + e[13] * e[2] * e[7] - e[13] * e[3] * e[6];
	inv[6] = -e[0] * e[6] * e[15] + e[0] * e[7] * e[14] + e[4] * e[2] * e[15]
				- e[4] * e[3] * e[14] - e[12] * e[2] * e[7] + e[12] * e[3] * e[6];
	inv[10] = e[0] * e[5] * e[15] - e[0] * e[7] * e[13] - e[4] * e[1] * e[15]
				+ e[4] * e[3] * e[13] + e[12] * e[1] * e[7] - e[12] * e[3] * e[5];
	inv[14] = -e[0] * e[5] * e[14] + e[0] * e[6] * e[13] + e[4] * e[1] * e[14]
				- e[4] * e[2] * e[13] - e[12] * e[1] * e[6] + e[12] * e[2] * e[5];

	inv[3] = -e[1] * e[6] * e[11] + e[1] * e[7] * e[10] + e[5] * e[2] * e[11]
				- e[5] * e[3] * e[10] - e[9] * e[2] * e[7] + e[9] * e[3] * e[6];
	inv[7] = e[0] * e[6] * e[11] - e[0] * e[7] * e[10] - e[4] * e[2] * e[11]
				+ e[4] * e[3] * e[10] + e[8] * e[2] * e[7] - e[8] * e[3] * e[6];
	inv[11] = -e[0] * e[5] * e[11] + e[0] * e[7] * e[9] + e[4] * e[1] * e[11]
				- e[4] * e[3] * e[9] - e[8] * e[1] * e[7] + e[8] * e[3] * e[5];
	inv[15] = e[0] * e[5] * e[10] - e[0] * e[6] * e[9] - e[4] * e[1] * e[10]
				+ e[4] * e[2] * e[9] + e[8] * e[1] * e[6] - e[8] * e[2] * e[5];

	var det = e[0] * inv[0] + e[1] * inv[4] + e[2] * inv[8] + e[3] * inv[12];
	if (det === 0) {
		return;
	}

	det = 1 / det;
	for (var i = 0; i < 16; i++) {
		r[i] = inv[i] * det;
	}

	
};

Matrix.prototype.inverted = function () {
	var r = this.clone();
	r.invert();
	return r;
};

// PROJECTION -------------------------------------

// Set the matrix to the orthographic projection.
// left, right: The scene point x at the left and right if the view matrix does not alter the scene.
// bottom, top: The scene point y that would map to the bottom and top if the view matrix does not alter the scene.
// near, far: The near and far clip planes. 
Matrix.prototype.setToOrtho = function (left, right, bottom, top, near, far) {
	if (left === right || bottom === top || near === far) {
		throw 'null frustum';
	}

	var rw = 1 / (right - left);
	var rh = 1 / (top - bottom);
	var rd = 1 / (far - near);

	var e = this.e;

	e[0] = 2 * rw;
	e[1] = 0;
	e[2] = 0;
	e[3] = 0;

	e[4] = 0;
	e[5] = 2 * rh;
	e[6] = 0;
	e[7] = 0;

	e[8] = 0;
	e[9] = 0;
	e[10] = -2 * rd;
	e[11] = 0;

	e[12] = -(right + left) * rw;
	e[13] = -(top + bottom) * rh;
	e[14] = -(far + near) * rd;
	e[15] = 1;

	return this;
};

// Set projection matrix to perspective.  
// fovy: field of view in the vertical direction
// ar: The ascpect ratio
// near, far: the near and far clip planes.  Both must be greater than 0.
Matrix.prototype.setToPerspective = function (fovy, near, far, ar) {
	if (near === far || near <= 0 || far <= 0 || fovy <= 0) {
		throw 'invalid params to setPerspective()';
	}

	fovy = Math.PI * fovy / 180 / 2;
	var s = Math.sin(fovy);
	var rd = 1 / (far - near);
	var ct = Math.cos(fovy) / s;

	var e = this.e;

	e[0] = ct / ar;
	e[1] = 0;
	e[2] = 0;
	e[3] = 0;

	e[4] = 0;
	e[5] = ct;
	e[6] = 0;
	e[7] = 0;

	e[8] = 0;
	e[9] = 0;
	e[10] = -(far + near) * rd;
	e[11] = -1;

	e[12] = 0;
	e[13] = 0;
	e[14] = -2 * near * far * rd;
	e[15] = 0;

	return this;
};
