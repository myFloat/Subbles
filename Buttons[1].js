class Button {
		constructor(VAR, X, Y, MIN, MAX, S, L, C, T, R) {
			let sibs = Buttons.instances.length +1;
			if (X === undefined) 
			X = width /2;
			if (Y === undefined) 
			Y = height *0.8;
			if (S === undefined) 
			S = window[VAR];
			if (L === undefined) 
			L = width*0.8;
			if (C === undefined)
			C = color(255 /sibs, 127 /sibs, 255 -255 /sibs);
			if (T === undefined) 
			T = 4;
			if (R === undefined) 
			R = max(18, height /30);
			if (MIN === undefined || MAX === undefined) {
				MIN = -L/2;
				MAX = L/2;
				S = window[VAR];
			}
			this.val = S;
			this.x = X;
			this.y = Y;
			this.var = VAR; //Name of global variable declared with 'var' (and not 'let') that the slider changes
			this.min = MIN;
			this.max = MAX;
			this.length = L;
			this.color = C;
			this.thickness = T;
			this.radius = R;
			this.slideX = X +(S -(MIN +MAX)/2) *L /(-MIN +MAX);
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
	createButton(P1, P2, P3, P4, P5, P6, P7, P8, P9, P10) {
		this.instances.push(new this.Button(P1, P2, P3, P4, P5, P6, P7, P8, P9, P10));
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