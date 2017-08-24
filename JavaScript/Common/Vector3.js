
////////////////////////////////////////////////////////////////
// Vector3

define(function (require) {

	var MathExt = require("Common/MathExt");
			
	function Vector3(xOrVec /*float*/, y /*float*/, z /*float*/) {
		if (xOrVec && xOrVec.x !== undefined) {
			this.x = xOrVec.x;
			this.y = xOrVec.y;
			this.z = xOrVec.z;
			return;
		}
		this.x = xOrVec == undefined ? 0.0 : xOrVec;
		this.y = y == undefined ? 0.0 : y;
		this.z = z == undefined ? 0.0 : z;
	}

	Vector3.X = function () { return new Vector3(1, 0, 0);   }
	Vector3.Y = function () { return new Vector3(0, 1, 0);	}
	Vector3.Z = function () { return new Vector3(0, 0, 1);	}
	Vector3.NegX = function () { return new Vector3(-1, 0, 0);	}
	Vector3.NegY = function () { return new Vector3(0, -1, 0);	}
	Vector3.NegZ = function () { return new Vector3(0, 0, -1);  }

	// set (x, y, z) or set(vec)
	Vector3.prototype.set = function (xOrVec, y, z) {
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
	}

	Vector3.prototype.toJSON = function (precision) {
		if (!precision)
			precision = 3;
		return {
			v: [MathExt.round(this.x, precision), MathExt.round(this.y, precision), MathExt.round(this.z, precision)]
		};
	};

	Vector3.FromJSON = function (json) {
		return new Vector3(json.v[0], json.v[1], json.v[2]);
	};

	// Efficiently convert an array of Vector3 points to JSON
	Vector3.ArrayToJSON = function (array /* Vector3[] */, precision) {
		if (!precision)
			precision = 3;

		var jsonArray = new Array(array.length * 3);
		for (var i = 0; i < array.length; i++) {
			jsonArray[i * 3] = MathExt.round(array[i].x, precision);
			jsonArray[i * 3 + 1] = MathExt.round(array[i].y, precision);
			jsonArray[i * 3 + 2] = MathExt.round(array[i].z, precision);
		}
		return { a: jsonArray };
	};

	// Convert a JSON object that was created by ArrayToJSON back to an array of Vector3 points.
	Vector3.ArrayFromJSON = function (json) {
		var jsonArray = json.a;
		var array = new Array(jsonArray.length / 3);

		for (var i = 0; i < array.length; i++) {
			array[i] = new Vector3(jsonArray[i * 3], jsonArray[i * 3 + 1], jsonArray[i * 3 + 2]);
		}
		return array;
	};

	// Get a single component with an index, starting at 0.
	Vector3.prototype.getComponent = function (i) {
		if (i == 0) return this.x;
		else if (i == 1) return this.y;
		else if (i == 2) return this.z;
	}

	Vector3.prototype.setComponent = function (i, value) {
		if (i == 0) this.x = value;
		else if (i == 1) this.y = value;
		else if (i == 2) this.z = value;
	}

	Vector3.prototype.clone = function () {
		return new Vector3(this.x, this.y, this.z);
	};

	Vector3.prototype.equals = function (other /* vector */, tolerance) {
		var d = this.distance(other);
		if (tolerance == null)
			return d < 0.00001;
		return d < tolerance;
	}

	// returns number
	Vector3.prototype.length = function () {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	};

	Vector3.prototype.setLength = function (newLength) {
		var length = this.length();
		this.mult(newLength / length);
		return this;
	};

	Vector3.prototype.distance = function (other /* vector */) {
		var temp = this.clone();
		temp.sub(other);
		return temp.length();
	};

	Vector3.prototype.normalize = function () {
		this.div(this.length());
		return this;
	};

	Vector3.prototype.normalized = function () {
		var result = this.clone();
		result.div(this.length());
		return result;
	};

	Vector3.prototype.reverse = function () {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		return this;
	}

	Vector3.prototype.reversed = function () {
		return new Vector3(-this.x, -this.y, -this.z);
	}

	// returns number
	Vector3.prototype.dot = function (other /* vector */) {
		return other.x * this.x + other.y * this.y + other.z * this.z;
	};

	// returns vector
	Vector3.prototype.cross = function (other /* vector */) {
		var result = new Vector3();
		result.x = this.y * other.z - this.z * other.y;
		result.y = this.z * other.x - this.x * other.z;
		result.z = this.x * other.y - this.y * other.x;
		return result;
	};

	Vector3.prototype.angle = function (other /* vector */) {
		var a = this.normalized();
		var b = other.normalized();
		var dot = a.dot(b);
		if (dot >= 1.0)		// dot can sometimes be something like 1.000002.
			return 0.0;
		if (dot <= -1.0)
			return Math.PI;	// 180 degrees
		return Math.acos(dot);
	};

	Vector3.prototype.angleDeg = function (other /* vector */) {
		return MathExt.radToDeg(this.angle(other));
	};

	// Angle is relative to the view vector.  View vector points toward the tested vectors.
	// If other is CCW, the result is positive.  CW = negative.
	Vector3.prototype.relAngle = function (other /* vector */, viewVector) {
		var angle = this.angle(other);
				
		var testVec = this.cross(other);
		if (testVec.angle(viewVector) > Math.PI / 2.0)
			testVec.reverse();
		testVec = this.cross(testVec);
		testVec.normalize();
		var testAngle = testVec.angle(other);
		if (testAngle > Math.PI / 2.0)		// 90 deg
			angle = -angle;
		return angle;
	};

	Vector3.prototype.sub = function (other /* vector */) {
		this.x = this.x - other.x;
		this.y = this.y - other.y;
		this.z = this.z - other.z;
		return this;
	};

	Vector3.prototype.subc = function (other /* vector */) {
		var result = this.clone();
		result.sub(other);
		return result;
	}

	Vector3.prototype.addScalar = function (scalar) {
	   this.x += scalar;
	   this.y += scalar;
	   this.z += scalar;
		return this;
	};
		
	Vector3.prototype.add = function (other /* vector */) {
		this.x = this.x + other.x;
		this.y = this.y + other.y;
		this.z = this.z + other.z;
		return this;
	};

	Vector3.prototype.addc = function (other /* vector */) {
		var result = this.clone();
		result.add(other);
		return result;
	}

	// Add passing individual components.
	Vector3.prototype.addComp = function (x, y, z) {
		this.x += x;
		this.y += y;
		this.z += z;
		return this;
	}

	Vector3.prototype.addScalar = function (scalar) {
		this.x += scalar;
		this.y += scalar;
		this.z += scalar;
		return this;
	};

	Vector3.prototype.mult = function (scalar) {
		this.x = this.x * scalar;
		this.y = this.y * scalar;
		this.z = this.z * scalar;
		return this;
	}

	Vector3.prototype.multc = function (scalar) {
		var result = this.clone();
		result.mult(scalar);
		return result;
	};

	Vector3.prototype.div = function (scalar) {
		this.x = this.x / scalar;
		this.y = this.y / scalar;
		this.z = this.z / scalar;
		return this;
	};

	Vector3.prototype.divc = function (scalar) {
		var result = this.clone();
		result.div(scalar);
		return result;
	};

	Vector3.prototype.rounded = function (digits) {
		return new Vector3(MathExt.round(this.x, digits),
								 MathExt.round(this.y, digits),
								 MathExt.round(this.z, digits));
	};
		

	Vector3.prototype.toString = function (precision) {
		var p = precision ? precision : 4;
		return "X: " + this.x.toFixed(p) + "\tY: " + this.y.toFixed(p) + "\tZ: " + this.z.toFixed(p);
	};

	return Vector3;
});