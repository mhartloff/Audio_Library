
// Fireball.js
// Subclass of SceneObject.

define(function (require) {

	var SceneObject = require("SceneObject");
	var Vector3 = require("Common/Vector3");

	function Fireball (source, options){
		SceneObject.call(this, source, options);
		this.velocity = new Vector3(0,0,0);
		if(options.velocity) {
			this.velocity = options.velocity;
		}
	}

	Fireball.prototype = Object.create(SceneObject.prototype);
	Fireball.prototype.constructor = Fireball;

	Fireball.prototype.updatePosition = function (){
		this.setPosition(this.getPosition().add(this.velocity));
	};

	return Fireball;
});
