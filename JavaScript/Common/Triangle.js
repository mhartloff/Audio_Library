
//////////////////////////////////////////////////////////////
// Triangle

define(["./Vector3"], function (Vector3) {

	function Triangle(p1, p2, p3) {
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
	}

	Triangle.prototype.set = function (p1, p2, p3) {
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
	}

	Triangle.prototype.getCentroid = function (triangle) {
		var center = this.p1.clone();
		center.add(this.p2);
		center.add(this.p3);
		center.div(3);
		return center;
	}

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
	}

	return Triangle;
});