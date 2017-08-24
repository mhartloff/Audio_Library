
////////////////////////////////////////////////////////////////
// Plane

define(function (require) {

	var Vector3 = require("Common/Vector3");

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

	return Plane;
});