function DelayedBehavior(sceneObject, delay, triggerFunction) {
	this.startTime = Date.now();
	this.sceneObject = sceneObject;
	this.delay = delay;
	this.triggerFunction = triggerFunction;
}

DelayedBehavior.prototype.onBehavior = function (scene) {
	if(this.triggered()){
		this.triggerFunction();
	}
};

DelayedBehavior.prototype.triggered = function () {
	return Date.now() - this.startTime > this.delay;
};