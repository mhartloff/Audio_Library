function ProximityBehavior(sceneObject, distance) {
	this.sceneObject = sceneObject;
	this.distance = distance;
}

ProximityBehavior.prototype.onBehavior = function (scene) {
	if(this.triggered(scene)){
		this.sceneObject.engage();
	}
};

ProximityBehavior.prototype.triggered = function (scene) {
	var distanceToPlayer = scene.getPlayerPosition().distance(this.sceneObject.getPosition());
	console.log(distanceToPlayer);
	return distanceToPlayer < this.distance;
};