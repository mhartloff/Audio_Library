
function Fireball (source, options){
	SceneObject.call(this, source, options);
	this.velocity = new Vector(0,0,0);
	if(options.velocity) {
		this.velocity = options.velocity;
	}
}

Fireball.prototype = Object.create(SceneObject.prototype);
Fireball.prototype.constructor = Fireball;

Fireball.prototype.updatePosition = function (){
	this.setPosition(this.getPosition().add(this.velocity));
};

