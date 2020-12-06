//DrawZ - Panning and zooming camera in 2D with mouse or touch screen and drawing shapes, scaled according to pan / zoom.

var DrawZ = {
	camX: 0,
	camY: 0,
	zoom: 1,
	pzoom: 0,
	zoomingRate: 1.003, //For maschines without touch screen
	zoomOnPoint: false, //Wether zooming should be centered on the point of the cursor, alternatively the point between two touches, or simply applied on the center of the view
	isTouchscreen: 'ontouchstart' in window, //Wether the device run on has a touchscreen not
	touchedTwice: false, //Becomes true every first frame two touches are moving
	singleTapped: true, //Becomes false when an ongoing touch/click stops meeting the requirements for a single tap
	touchEndCalled: 0, //Prevents touchEnded() from being called when > 0, in order to remove effects of rapid double taps with touches
	tapCooldown: 8, //The value to set touchEndCalled to in touchEnded()
	touchMoveCalled: false, //False when there are no moving touches. Used in resetting touchedTwice.
	pTouchSquareDis: undefined,
	mouseForCamera: true, //When true, cursor may drag background and trigger singleTap()
	
	//Allows a function, if you define it, to be called when you tap (touch and release) with a single finger or simply click with a mouse
	singleTap() {
		if (window.singleTap !== undefined) {
			singleTap(); //The function lying directly on window is called
		}
	},
	//Allows a function, if you define it, to be called when the camera is moved
	cameraMoved() {
		if (window.cameraMoved !== undefined) {
			cameraMoved(); //The function lying directly on window is called
		}
	},

	//Call after canvas is created in setup()
	setup() {
		this.midScreenX = width /2;
		this.midScreenY = height /2;
	},
	//Call before (or in the beginning of) every collision and draw tick
	everyTick() {
		if (this.touchEndCalled > 0) {
			this.touchEndCalled--;
		}
		if (this.touchedTwice) {
			if (this.touchMoveCalled == false) {
				this.touchedTwice = false;
			}
		}
		this.touchMoveCalled = false;
	},
	//Call from P5.mouseDragged()
	mouseDragged() {
		if (touches.length < 1) {
			if (this.mouseForCamera) { //Similar to that in method "touchMoved()" under "if (-mouseX +pmouseX"...
				this.camX += -movedX /this.zoom;
				this.camY += -movedY /this.zoom;
				this.cameraMoved();
			}
		}
		this.singleTapped = false;
	},
	//Call from P5.touchMoved(). Also add "return false;" in the P5 function if you want to prevent translation of the window in browser.
	touchMoved() {
		this.touchMoveCalled = true;
		if (touches.length === 2) {
			if (this.touchedTwice == false) {
				this.pTouchSquareDis = sq(-touches[0].x +touches[1].x) +sq(-touches[0].y +touches[1].y);
				this.pzoom = this.zoom;
				this.touchedTwice = true;
			} else {
				const touchSquareDis = sq(-touches[0].x +touches[1].x) +sq(-touches[0].y +touches[1].y);
				if (this.zoomOnPoint) {
					this.zooming(
						this.pzoom *touchSquareDis /this.pTouchSquareDis, 
						(touches[0].x +touches[1].x) /2, 
						(touches[0].y +touches[1].y) /2
					);
				} else {
					this.zooming(
						this.pzoom *touchSquareDis /this.pTouchSquareDis
					);
				}
				if (-mouseX +pmouseX != 0 || -mouseY +pmouseY != 0) { //Similar to that in "mouseDragged()"
					this.camX += (-mouseX +pmouseX) /this.zoom;
					this.camY += (-mouseY +pmouseY) /this.zoom;
				}
			}
			this.cameraMoved();
		} else {
			//if (this.mouseForCamera === false) { //why conditioned?
				this.singleTapped = false;
			//}
		}
	},
	//Call from P5.touchStarted()
	touchStarted() {
		if (touches.length > 1) {
			this.singleTapped = false;
		}
	},
	//Call from P5.touchEnded()
	touchEnded() {
		if (this.touchEndCalled <= 0) {
			if (this.singleTapped) {
				this.singleTap();
			}
			this.touchEndCalled = this.tapCooldown;
		}
		if (touches.length < 1) {
			this.singleTapped = true;
		}
		this.mouseForCamera = true;
	},
	//Call with parameter event from P5.mouseWheel()
	mouseWheel(event) {
		this.zooming(this.zoom *pow(this.zoomingRate, -event.delta), mouseX, mouseY);
	},
	zooming(VALUE, CX, CY) {
		if (this.zoomOnPoint) {
			const translation = 1 /this.zoom -1 /VALUE;
			this.camX += (-this.midScreenX +CX) *translation;
			this.camY += (-this.midScreenY +CY) *translation;
			this.zoom = VALUE;
		} else {
			this.zoom = VALUE;
		}
	}, 
	ellipseScaled(X, Y, W, H) {
		if (typeof X === "object") {
			H = W;
			W = Y;
			Y = X[1];
			X = X[0];
		}
		if (H === undefined) {
			H = W;
		}
		ellipse(
			(X -this.camX) *this.zoom +this.midScreenX, 
			(Y -this.camY) *this.zoom +this.midScreenY, 
			W *this.zoom, 
			H *this.zoom
		);
	},
	invertScaled(X, Y) {
		if (typeof X === "object") {
			Y = X[1];
			X = X[0];
		}
		const vec = [
			(X -this.midScreenX) /this.zoom +this.camX, 
			(Y -this.midScreenY) /this.zoom +this.camY 
		];
		return vec;
	},
	lineScaled(X1, Y1, X2, Y2) {
		if (typeof X1 === "object") {
			Y2 = Y1[1];
			X2 = Y1[0];
			Y1 = X1[1];
			X1 = X1[0];
		}
		line(
			(X1 -this.camX) *this.zoom +this.midScreenX, 
			(Y1 -this.camY) *this.zoom +this.midScreenY, 
			(X2 -this.camX) *this.zoom +this.midScreenX, 
			(Y2 -this.camY) *this.zoom +this.midScreenY
		);
	},
	pointScaled(X, Y) {
		if (typeof X === "object") {
			Y = X[1];
			X = X[0];
		}
		point(
			(X -this.camX) *this.zoom +this.midScreenX, 
			(Y -this.camY) *this.zoom +this.midScreenY
		);
	},
	textScaled(T, X, Y, S) {
		if (typeof X === "object") {
			S = Y;
			Y = X[1];
			X = X[0];
		}
		if (S === undefined) {}
		else {
			textSize(S *this.zoom);
		}
		text(T, 
			(X -this.camX) *this.zoom +this.midScreenX, 
			(Y -this.camY) *this.zoom +this.midScreenY
		);
	},
	vectorScaled(X, Y) {
		if (typeof X === "object") {
			Y = X[1];
			X = X[0];
		}
		const vec = [
			(X -this.camX) *this.zoom +this.midScreenX, 
			(Y -this.camY) *this.zoom +this.midScreenY
		];
		return vec;
	},
	vertexScaled(X, Y) {
		if (typeof X === "object") {
			Y = X[1];
			X = X[0];
		}
		vertex(
			(X -this.camX) *this.zoom +this.midScreenX, 
			(Y -this.camY) *this.zoom +this.midScreenY, 
		);
	}
};
