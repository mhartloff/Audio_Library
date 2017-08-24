// Copywrite Hartloff Gaming 2017
// Line2.js

define(function (require) {

	var Vector2 = require("Common/Vector2");

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

	return Line2;
});
