function EngagedBehavior(sceneObject, distance) {
	this.sceneObject = sceneObject;
	this.distance = distance;
}

EngagedBehavior.prototype.onBehavior = function (scene) {
	if(this.triggered(scene)){
		this.sceneObject.disengage();
	}
};

EngagedBehavior.prototype.triggered = function (scene) {
	var distanceToPlayer = scene.getPlayerPosition().distance(this.sceneObject.getPosition());
	return distanceToPlayer > this.distance;
};