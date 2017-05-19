
function Fireball (source, options){
	SceneObject.call(this, source, options);
	this.velocity = new Vector(0,0,0);
	if(options.velocity) {
		this.velocity = options.velocity;
	}
	this.gone = false;
}

Fireball.prototype = Object.create(SceneObject.prototype);
//Fireball.prototype.constructor = SpatialSound;

Fireball.prototype.updatePosition = function (){
	this.setPosition(this.getPosition().add(this.velocity));
};

