class Button {
		constructor(VAR, X, Y, MIN, MAX, START, LENGTH, COLOR, THICKNESS, RADIUS) {
			let sibs = Buttons.instances.length +1;
			if (X === undefined) 
			X = width /2;
			if (Y === undefined) 
			Y = height *0.8;
			if (START === undefined) 
			START = window[VAR];
			if (LENGTH === undefined) 
			LENGTH = width*0.8;
			if (COLOR === undefined)
			COLOR = color(255 /sibs, 127 /sibs, 255 -255 /sibs);
			if (THICKNESS === undefined) 
			T = 4;
			if (RADIUS === undefined) 
			R = max(18, height /30);
			if (MIN === undefined || MAX === undefined) {
				MIN = -L/2;
				MAX = L/2;
				START = window[VAR];
			}
			this.val = START;
			this.x = X;
			this.y = Y;
			this.var = VAR; //Name of global variable declared with 'var' (and not 'let') that the slider changes
			this.min = MIN;
			this.max = MAX;
			this.length = LENGTH;
			this.color = COLOR;
			this.thickness = THICKNESS;
			this.radius = RADIUS;
			this.slideX = X +(START -(MIN +MAX)/2) *LENGTH /(-MIN +MAX);
			this.held = false;	//Wether mouse is currently pressing/dragging this object
		}
		collision() {
			const deltaX = -mouseX +this.slideX;
			const deltaY = -mouseY +this.y;
			if (sq(deltaX) +sq(deltaY) < sq(this.radius)) {
				Buttons.instancesHeld.push(this);
				if (window.DrawZ !== undefined) {
					DrawZ.mouseForCamera = false;
				}
			}
		}
		draw() {
			Buttons.renderButtons = true;
			strokeWeight(this.thickness);
			stroke(127, 127, 127);
			line(this.x -this.length/2, this.y, this.x +this.length/2, this.y);
			strokeWeight(1);
			fill(this.color);
			ellipse(this.slideX, this.y, this.radius, this.radius);
		}
	}
var Buttons = {
	instances: [], 
	instancesHeld: [], 
	renderButtons: false, 
	createButton(...ARGS) {
		this.instances.push(new this.Button(...ARGS));
	}, 
	//Call from cameraMoved() if you are using DrawZ.js and you wish buttons to hide when panning camera
	cameraMoved() {
		this.renderButtons = false;
	}, 
	//Call from mouseDragged() if it is defined and from touchMoved() if it is defined
	cursorMoved() {
		for(const obj1 of this.instancesHeld) {
			if (mouseX < obj1.x -obj1.length /2) {
				obj1.slideX = obj1.x -obj1.length /2;
				obj1.val = obj1.min;
			} else {
				if (mouseX > obj1.x +obj1.length /2) {
					obj1.slideX = obj1.x +obj1.length /2;
					obj1.val = obj1.max;
				} else {
					obj1.slideX += -pmouseX +mouseX;
					obj1.val += (-pmouseX +mouseX) /obj1.length *(-obj1.min +obj1.max);
				}
			}
			window[obj1.var] = obj1.val;
		}
	}, 
	//Call from P5.touchEnded()
	touchEnded() {
		if (this.renderButtons) {
			this.instancesHeld = [];
		}
	}, 
	//Call from touchStarted() and from mousePressed() if it is defined
	collisionAll() {
		if (Buttons.renderButtons) {
			for(const obj1 of this.instances) {
				obj1.collision();
			}
		}
	}, 
	//Call every draw tick
	drawAll() {
		if (Buttons.renderButtons) {
			for(const obj1 of Buttons.instances) {
				obj1.draw();
			}
		}
	}, 
	Button
}
