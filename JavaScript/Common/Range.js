// Copywrite Hartloff Gaming 2017

define(function (require) {

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

	return Range;
});