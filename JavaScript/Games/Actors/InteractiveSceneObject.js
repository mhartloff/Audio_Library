function InteractiveSceneObject(options) {
	SceneObject.call(this, options);
}

InteractiveSceneObject.prototype = Object.create(SceneObject.prototype);
InteractiveSceneObject.prototype.constructor = InteractiveSceneObject;


InteractiveSceneObject.prototype.onBehavior = function (scene) {

};