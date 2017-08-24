////////////////////////////////////////////////////////////////
// Vector2 - a 2D vector

define(function (require) {

	var MathExt = require("Common/MathExt");

	function Vector2(x, y) {
		this.x = x;
		this.y = y;
	}

	Vector2.prototype.clone = function () {
		return new Vector2(this.x, this.y);
	};

	// set (x, y) or set(vec)
	Vector2.prototype.set = function (xOrVec, y) {
		if (xOrVec.x !== undefined) {
			this.x = xOrVec.x;
			this.y = xOrVec.y;
		}
		else {
			this.x = xOrVec;
			this.y = y;
		}
		return this;
	};

	Vector2.prototype.toJSON = function (precision) {
		if (!precision)
			precision = 3;
		return {
			v: [MathExt.round(this.x, precision), MathExt.round(this.y, precision)]
		};
	};

	Vector2.FromJSON = function (json) {
		return new Vector2(json.v[0], json.v[1]);
	};

	// Efficiently convert an array of Vector2 points to JSON
	Vector2.ArrayToJSON = function (array /* Vector2[] */, precision) {
		if (!precision)
			precision = 3;

		var jsonArray = new Array(array.length * 2);
		for (var i = 0; i < array.length; i++) {
			jsonArray[i * 2] = MathExt.round(array[i].x, precision);
			jsonArray[i * 2 + 1] = MathExt.round(array[i].y, precision);
		}
		return { a: jsonArray };
	};

	// Convert a JSON object that was created by ArrayToJSON back to an array of Vector2 points.
	Vector2.ArrayFromJSON = function (json) {
		var jsonArray = json.a;
		var array = new Array(jsonArray.length / 2);

		for (var i = 0; i < array.length; i++) {
			array[i] = new Vector2(jsonArray[i * 2], jsonArray[i * 2 + 1]);
		}
		return array;
	};
		
	Vector2.prototype.toString = function (precision) {
		var p = precision ? precision : 4;
		return "X: " + this.x.toFixed(p) + "\tY: " + this.y.toFixed(p);
	};

	Vector2.prototype.reverse = function () {
		this.x = -this.x;
		this.y = -this.y;
		return this;
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

    // Angle between two vec2 objects.  In radians.
    Vector2.prototype.angleBetween = function (other /* Vector2 */) {
        var a = this.normalized();
        var b = other.normalized();
        var dot = a.dot(b);
        return Math.acos(dot);
    };

    // The angle from (0,1) in radians.  Range = {0, 2 * PI}
    Vector2.prototype.angle = function () {
        var p = this.normalized();
		
        var angle = Math.acos(p.x);	    // Returns a value between 0 and PI.
        if (p.y < 0)
	        angle = Math.PI + (Math.PI - angle);
        return angle;
    };

	Vector2.prototype.addScalar = function (scalar) {
	   this.x += scalar;
	   this.y += scalar;
	   return this;
	};

	Vector2.prototype.add = function (other) {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	Vector2.prototype.addc = function (other /* Vector2 */) {
		return new Vector2(this.x + other.x, this.y + other.y);
	}


	Vector2.prototype.sub = function (other) {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	Vector2.prototype.subc = function (other /* Vector2 */) {
		return new Vector2(this.x - other.x, this.y - other.y);
	}

	Vector2.prototype.mult = function (scalar) {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	Vector2.prototype.multc = function (other /* Vector2 */) {
		return new Vector2(this.x * scalar, this.y * scalar);
	}

	Vector2.prototype.div = function (scalar) {
		this.x /= scalar;
		this.y /= scalar;
		return this;
	}

	Vector2.prototype.divc = function (other /* Vector2 */) {
		return new Vector2(this.x * scalar, this.y * scalar);
	}

    

	return Vector2;
});
