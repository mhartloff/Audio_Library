// Copywrite Hartloff Gaming 2017

//////////////////////////////////////////////////////////
// Matrix
// Matrix math.  Based on examples in WebGL: Programming Guide.

define(function (require) {
	
	var Vector3 = require("Common/Vector3");
	var MathExt = require("Common/MathExt");
	
	function Matrix() {
		// Set to identity
		this.e = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	};

	Matrix.prototype.set = function (other /* Matrix */) {
		for (var i = 0; i < 16; i++) {
			this.e[i] = other.e[i];
		}
	}

	Matrix.prototype.clone = function () {
		var n = new Matrix();
		for (var i = 0; i < 16; i++) {
			n.e[i] = this.e[i];
		}
		return n;
	};

	Matrix.prototype.toJSON = function () {
		var jsonE = [];
		for (var i = 0; i < this.e.length; i++) {
			jsonE.push(MathExt.round(this.e[i], 5));
		};
		return { e: jsonE };
	};

	Matrix.FromJSON = function (json) {
		var m = new Matrix();
		for (var i = 0; i < json.e.length; i++) {
			m.e[i] = json.e[i];
		}
		return m;
	};

	Matrix.prototype.reset = function () {
		var e = this.e;
		e[0] = 1; e[4] = 0; e[8] = 0; e[12] = 0;
		e[1] = 0; e[5] = 1; e[9] = 0; e[13] = 0;
		e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
		e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
		return this;
	};

	Matrix.prototype.applyToVector = function (vec /* Vector3 */) {
		var e = this.e;
		var x, y, z;

		x = vec.x * e[0] + vec.y * e[4] + vec.z * e[8] + e[12];
		y = vec.x * e[1] + vec.y * e[5] + vec.z * e[9] + e[13];
		z = vec.x * e[2] + vec.y * e[6] + vec.z * e[10] + e[14];
		vec.set(x, y, z);
		return vec;
	};

	// Deprecated
	Matrix.prototype.applyToVec = function (vec /* Vector3 */) {
		return this.applyToVector(vec);
	};

	Matrix.prototype.applyToVec2 = function (vec /* Vector2 */) {
		var e = this.e;
		var x, y;

		x = vec.x * e[0] + vec.y * e[4] + e[12];
		y = vec.x * e[1] + vec.y * e[5] + e[13];
		vec.set(x, y);
		return vec;
	};

	// Using floating point precision, the rotation matrix can get off after several multiplications.  This renormalizes the rotation matrix.
	Matrix.prototype.normalizeRotation = function (tolerance /* number */) {
		var e = this.e;
		var tol = tolerance == null ? 0.001 : tolerance;
		var xMag = e[0] * e[0] + e[1] * e[1] + e[2] * e[2];
		var yMag = e[4] * e[4] + e[5] * e[5] + e[6] * e[6];
		var zMag = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
		if (Math.abs(xMag - 1.0) > tol || Math.abs(yMag - 1.0) > tol || Math.abs(zMag - 1.0) > tol) {
			var xVec = new Vector3(e[0], e[1], e[2]);
			xVec.normalize();
			var yVec = new Vector3(e[4], e[5], e[6]);
			var zVec = xVec.cross(yVec);
			zVec.normalize();
			yVec = zVec.cross(xVec);
			e[0] = xVec.x; e[1] = xVec.y; e[2] = xVec.z;
			e[4] = yVec.x; e[5] = yVec.y; e[6] = yVec.z;
			e[8] = zVec.x; e[9] = zVec.y; e[10] = zVec.z;
		}
	}

	// Retrieve the x axis by going horizontally (row-major?)
	Matrix.prototype.getXAxisH = function (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[0];
		result.y = this.e[1];
		result.z = this.e[2];
		return result;
	}

	Matrix.prototype.getYAxisH = function (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[4];
		result.y = this.e[5];
		result.z = this.e[6];
		return result;
	}

	Matrix.prototype.getZAxisH = function (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[8];
		result.y = this.e[9];
		result.z = this.e[10];
		return result;
	}

	// Retrieve the y axis by going vertically (column-major?)
	Matrix.prototype.getXAxisV = function (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[0];
		result.y = this.e[4];
		result.z = this.e[8];
		return result;
	}

	Matrix.prototype.getYAxisV = function (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[1];
		result.y = this.e[5];
		result.z = this.e[9];
		return result;
	}

	Matrix.prototype.getZAxisV = function (result /* Vector3 */) {
		if (!result) result = new Vector3();
		result.x = this.e[2];
		result.y = this.e[6];
		result.z = this.e[10];
		return result;
	}

	// Set the orientation of the axis where the z vec appears to point in the passed direction.
	Matrix.prototype.setAxes = function (xVec, yVec, zVec) {
		var e = this.e;
		e[0] = xVec.x; e[1] = xVec.y; e[2] = xVec.z;
		e[4] = yVec.x; e[5] = yVec.y; e[6] = yVec.z;
		e[8] = zVec.x; e[9] = zVec.y; e[10] = zVec.z;
	}

	// Set the orientation of the axes where the z vec goes into the screen.
	Matrix.prototype.setAxes2 = function (xVec, yVec, zVec) {
		var e = this.e;
		e[0] = xVec.x; e[4] = xVec.y; e[8] = xVec.z;
		e[1] = yVec.x; e[5] = yVec.y; e[9] = yVec.z;
		e[2] = zVec.x; e[6] = zVec.y; e[10] = zVec.z;
	}


	Matrix.prototype.setToTranslation = function (x, y, z) {
		var e = this.e;
		e[0] = 1; e[4] = 0; e[8] = 0; e[12] = x;
		e[1] = 0; e[5] = 1; e[9] = 0; e[13] = y;
		e[2] = 0; e[6] = 0; e[10] = 1; e[14] = z;
		e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
		return this;
	};

	Matrix.prototype.translate = function (x, y, z) {
		var e = this.e;
		e[12] += e[0] * x + e[4] * y + e[8] * z;
		e[13] += e[1] * x + e[5] * y + e[9] * z;
		e[14] += e[2] * x + e[6] * y + e[10] * z;
		e[15] += e[3] * x + e[7] * y + e[11] * z;
		return this;
	};

	// Set the rotation to an angle around a rotation axis.  Angle in radians.
	Matrix.prototype.setToRotation = function (x, y, z, angle) {
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
		this.premultiply(m);
		var thisXMag2 = this.e[0] * this.e[0] + this.e[1] * this.e[1] + this.e[2] * this.e[2];
		this.normalizeRotation();
		return this;
	};

	// Generally objects are built on the xy plane and z is up.  So this is useful for orienting such objects.
	// Xvector is optional.
	Matrix.prototype.setFromZXVectors = function (zVector, xVector /* Vector3 - optional */, translation /* Vector3 - optional */) {
		if (!xVector)
			xVector = new Vector3(1, 0, 0);
		if (xVector.distance(zVector) < 0.005) {
			xVector.set(0, 1, 0);
			if (xVector.distance(zVector < 0.005))
				xVector.set(1, 0, 0);
		}

		var zVec = zVector.clone();
		zVec.normalize();
		var xVec = xVector;
		var yVec = zVec.cross(xVec);
		yVec.normalize();
		xVec = yVec.cross(zVec);
				
		if (translation) 
		    this.translate(translation.x, translation.y, translation.z);
		    
		this.setAxes(xVec, yVec, zVec);
	}

	
	Matrix.prototype.setFromZYVectors = function (zVector, yVector /* Vector3 - optional */, translation /* Vector3 - optional */) {
		if (!yVector)
			yVector = new Vector3(0, 1, 0);
		if (yVector.distance(zVector) < 0.005) {
			yVector.set(0, 1, 0);
			if (yVector.distance(zVector < 0.005))
				yVector.set(1, 0, 0);
		}

		var zVec = zVector.clone();
		zVec.normalize();
		var yVec = yVector;
		var xVec = yVec.cross(zVec);
		xVec.normalize();
		yVec = zVec.cross(xVec);
				
		if (translation) 
		    this.translate(translation.x, translation.y, translation.z);
		    
		this.setAxes(xVec, yVec, zVec);
	}

	// Useful for setting the orientation of the camera for which the z vector is significant.
	Matrix.prototype.setFromOrientation = function (zVec, yUp /* Vector3 */) {
		zVec.normalize();
		var yVec = yUp.clone();
		yVec.normalize();
		if (zVec.distance(yVec) < 0.005) {
			if (yVec.distance(new Vector3(0, 1, 0) < 0.005))
				yVec.set(0, 0, 1);
			else
				yVec.set(0, 1, 0);  // try for true y up.
		}
		var xVec = yVec.cross(zVec);
		xVec.normalize();
		yVec = zVec.cross(xVec);
		yVec.normalize();
		this.setAxes2(xVec, yVec, zVec);
	}

    
    // static. Create a matrix from a point on the globe and direction is the 'forward direction'.  Used for text placement.
	Matrix.createFromSpherePoint = function (position, direction) {

		var normal = position.clone();
		normal.normalize();
        				
		var xVec = direction.normalized();
		var zVec = normal;
		var yVec = zVec.cross(xVec);

		var m = new Matrix();
		m.setAxes(xVec, yVec, zVec);

		var n = new Matrix();
		n.setToTranslation(position.x, position.y, position.z);
		m.premultiply(n);
		return m;
	}
    
	// Multiply this matrix by the passed matrix.  
	Matrix.prototype.multiply = function (other /* matrix */, optResult) {
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
	Matrix.prototype.premultiply = function (other /* matrix */, optResult) {
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
		n.premultiply(other);
		return n;
	};

	Matrix.prototype.invert = function (optResult) {
		var e = this.e
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
	return Matrix;
});