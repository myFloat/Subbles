"use strict";

//Consequences of adopting child already having parent
//Drawing lines to non-rendered family
//Menu
//	Button for touchscreen
//General do for all children method (maybe)

window.oncontextmenu = function() {
	return false;
}
function mouseDragged() {
	dragged();
	DrawZ.mouseDragged();
}
function touchMoved() {
	dragged();
	DrawZ.touchMoved();
	return false;
}
function touchStarted() {
	DrawZ.touchStarted();
	DrawZ.mouseForCamera = false;
	Sbls.collisionMouse();
	if (touches.length === 3) {
		if (clickedObject !== null) {
			Sbls.menuShift(clickedObject);
		}
	}
}
function touchEnded() {
	DrawZ.touchEnded();
	Sbls.collisionOther();
	if (Sbls.menu !== null && DrawZ.isTouchscreen && touches.length === 0) {
		const vec = DrawZ.vectorScaled(Sbls.menu.pos);
		Sbls.alternatives[Sbls.circleIndex(Sbls.alternatives.length, vec)][0]();
	}
}
function mouseWheel() {
	DrawZ.mouseWheel(event);
	cameraMoved();
}
function cameraMoved() {
	Sbls.render();
}
function singleTap() {
	if (clickedObject !== null) {
		if (DrawZ.isTouchscreen || mouseButton === LEFT) {
			if (Sbls.mouseForSelection) {
				clickedObject.selectShift();
				clickedObject = null;
			}
		} else { //Does else mean nor?
			Sbls.menuShift(clickedObject);
		}
	} else { //Not used. Note: triggered if clickedObject is set to null in previous block
		
	}
	if (Sbls.menu !== null && mouseButton !== RIGHT) {
		const vec = DrawZ.vectorScaled(Sbls.menu.pos);
		Sbls.alternatives[Sbls.circleIndex(Sbls.alternatives.length, vec)][0]();
	}
}
//P5

//Mouse colission
	var clickedObject = null; //This points at one object that is currently being clicked
	var clickOffset = []; //Holds the vector for the offset of the mouse position from the clicked objects origin
//Keyboard
/*var keyboard = {
	camera: 32 //Currently not used
}*/
//Debug
	var s;

function setup() {
	createCanvas(windowWidth, windowHeight);
	DrawZ.setup();
	DrawZ.zoomOnPoint = true;

	Sbls.createSubble(0, 0, 144);
	//Subbles
	Sbls.render();
  
	s = "noll";
}


class Subble {
	constructor(X, Y, R, NAME, PARENTS, GENERATION) {
		this.pos = [X, Y];
		//edit
		this.gridPos = [X, Y];
		if (NAME === undefined) {
			NAME = char(65 +floor(random(25)));
			for(let i = 0; i < 4; i++) {
				NAME += char(97 +floor(random(25)));
			}
		}
		this.pickedUpPos = [X, Y];
		this.radius = R;
		this.color = color(127, 127, 255, 255);
		this.name = NAME;
		this.selected = false;
		this.generation = 0;
		this.children = [];
		this.parents = [];
		if (GENERATION !== undefined) {
		    this.generation = GENERATION;
		    }
		if (PARENTS === [null]) {
			this.parents = [];
		} else {
			if (PARENTS !== undefined) {
				for(const obj1 of PARENTS) {
					obj1.adopt(this);
				}
			}
		}
		if (this.parents.length > 0) {
			this.ancestor = this.parents[0].ancestor;
		} else {
			this.ancestor = this;
		}
	}
	decideTravelers(BOOL) {
		for(const obj1 of this.children) {
			if (obj1.selected === BOOL) {
				Sbls.travelers.push(obj1);
			}
			obj1.decideTravelers(BOOL);
		}
	}
	gridAlign() {
		const delta = math.subtract(this.pos, this.parents[0].pos);
		const genScalar = pow(2, this.generation);
		this.gridPos = [round(delta[0] *genScalar), round(delta[1] *genScalar)];
		this.pos = math.add(math.divide(this.gridPos, genScalar), this.parents[0].pos);
	}
	adopt(CHILD) {
		if (this.parents.indexOf(CHILD) === -1) {
			if (CHILD.generation <= this.generation || CHILD.parents.length < 1) {
			    CHILD.changeGeneration(this.generation +1);
			}
			CHILD.parents.push(this);
			this.children.push(CHILD);
			CHILD.changeAncestor(this.ancestor);
		} else {
			CHILD.abandon(this);
		}
	}
	abandon(CHILD) {
		CHILD.parents.splice(CHILD.parents.indexOf(this), 1);
		this.children.splice(this.children.indexOf(CHILD), 1);
		if (CHILD.parents.length > 0) {
			CHILD.changeAncestor(CHILD.parents[0].ancestor);
			//CHILD.changeGeneration(this.generation +1);
		} else {
			CHILD.changeGeneration(this.generation);
			CHILD.changeAncestor(CHILD);
		}
	}
	changeGeneration(GEN) {
		this.generation = GEN;
		this.radius = 144 *pow(1/2, GEN);
		const f = function(CHILD, PARENT) {
			if (CHILD.generation <= PARENT.generation || CHILD.parents.length === 1) {
				CHILD.changeGeneration(PARENT.generation +1);
			}
		}
		this.forOffspring(f);
	}
	changeAncestor(ANCESTOR) {
		this.ancestor = ANCESTOR;
		for(const obj1 of this.children) {
			obj1.changeAncestor(ANCESTOR);
		}
	}
	forOffspring(FUNCTION) { //Do for all children, grandchildren, a.s.f...
		for(const obj1 of this.children) {
			FUNCTION(obj1, this);
			obj1.forOffspring(FUNCTION);
		}
	}
	selectShift() {
		this.selected = !this.selected;
		if (this.selected) {
			Sbls.instancesSelected.push(this);
		} else {
			Sbls.instancesSelected.splice(Sbls.instancesSelected.indexOf(this), 1);
		}
	}
}
var Sbls = {
	instances: [], 
	instancesRendered: [], 
	instancesSelected: [], 
	travelers: [], 
	mouseForSelection: true, 
	menu: null, 
	input: null, 
	//Menu
	alternatives: [], 

	createSubble(X, Y, R, NAME, PARENTS, GENERATION) {
		this.instances.push(new this.Subble(X, Y, R, NAME, PARENTS, GENERATION));
		return this.instances[this.instances.length -1];
	}, 
	removeSubble(INSTANCE) {
		this.instances.splice(this.instances.indexOf(INSTANCE), 1);
		const index = this.instancesRendered.indexOf(INSTANCE);
		if (index != -1) {
			this.instancesRendered.splice(index, 1);
		}
		if (INSTANCE.parents.length > 0) {
			for(const obj1 of INSTANCE.parents) {
				obj1.children.splice(obj1.children.indexOf(INSTANCE), 1);
			}
			if (INSTANCE.children.length > 0) {
				for(const obj1 of INSTANCE.children) {
					obj1.parents.splice(obj1.parents.indexOf(INSTANCE), 1);
					if (obj1.parents.length > 0) {
						obj1.ancestor = obj1.parents[0].ancestor;
					} else {
						INSTANCE.parents[0].adopt(obj1);
					}
				}
			}
		} else {
			if (INSTANCE.children.length > 0) {
				for(const obj1 of INSTANCE.children) {
					obj1.parents.splice(obj1.parents.indexOf(INSTANCE), 1);
					if (obj1.parents.length > 0) {
						obj1.ancestor = obj1.parents[0].ancestor;
					} else {
						obj1.ancestor = obj1;
					}
				}
			}
		}
	}, 
	render() {
		this.instancesRendered.length = 0;
		for(const obj1 of this.instances) {
			const vec = DrawZ.vectorScaled(obj1.pos[0], obj1.pos[1]);
			const scaledR = obj1.radius *DrawZ.zoom;
			if (-scaledR < vec[0] && vec[0] < width +scaledR) {
				if (-scaledR < vec[1] && vec[1] < height +scaledR) {
					this.instancesRendered.push(obj1);
				}
			}
		}
	}, 
	collisionMouse() {
		clickedObject = null;
		for(const obj1 of this.instancesRendered) {
			const vec = DrawZ.vectorScaled(obj1.pos[0], obj1.pos[1]);
			if (sq(-vec[0] +mouseX) +sq(-vec[1] +mouseY) <= sq(obj1.radius *DrawZ.zoom)) {
				clickedObject = obj1;
				if (this.mouseForSelection) {
					const mousePos = DrawZ.invertScaled(mouseX, mouseY);
					clickOffset = [-mousePos[0] +obj1.pos[0], -mousePos[1] +obj1.pos[1]];
					obj1.pickedUpPos = obj1.pos.slice();
					this.travelers = [];
					if (obj1.selected) {
						for(const obj2 of this.instancesSelected) {
							obj2.decideTravelers(obj2.selected);
						}
						for(const obj2 of this.instancesSelected) {
							let index = this.travelers.indexOf(obj2);
							while(index !== -1) {
								this.travelers.splice(index, 1);
								index = this.travelers.indexOf(obj2);
							}
							this.travelers.push(obj2);
						}
					} else {
						Sbls.travelers.push(obj1);
						obj1.decideTravelers(obj1.selected);
					}
				}
			}
		}
	}, 
	collisionOther() {
		if (clickedObject !== null) {
			const obj1 = clickedObject;
			let parent = false;
			for(const obj2 of this.instancesRendered) {
				if (obj2 !== obj1) {
					if (sq(-obj1.pos[0] +obj2.pos[0]) +sq(-obj1.pos[1] +obj2.pos[1]) < sq(obj2.radius)) {
 						if (obj2.children.indexOf(obj1) === -1) {
							parent = [obj2, false];
						} else {
							parent = [obj2, true];
						}
					}
				}
			}
			if (parent !== false) { //If "parent" contains an object
				if (parent[1] === false) {
					parent[0].adopt(obj1);
				} else {
					parent[0].abandon(obj1);
				}
				const deltaX = -obj1.pos[0] +obj1.pickedUpPos[0];
				const deltaY = -obj1.pos[1] +obj1.pickedUpPos[1];
				this.moveTravelers(deltaX, deltaY);
			}
			obj1.gridAlign();
		}
		if (this.input !== null) {
			if (this.input.elt !== document.activeElement) {
				this.quitEdit();
			}
		}
	}, 
	draw() {
		stroke(255);
		for(const obj1 of this.instancesRendered) {
			for(const obj2 of obj1.parents) {
				DrawZ.lineScaled(obj1.pos[0], obj1.pos[1], obj2.pos[0], obj2.pos[1]);
			}
		}
		noStroke();
		textAlign(CENTER);
		for(const obj1 of this.instancesRendered) {
			if (obj1.selected) {
				obj1.color.setAlpha(127);
				fill(obj1.color);
				DrawZ.ellipseScaled(obj1.pos[0], obj1.pos[1], obj1.radius *2 +9 /DrawZ.zoom);
				obj1.color.setAlpha(255);
			}
			fill(obj1.color);
			DrawZ.ellipseScaled(obj1.pos[0], obj1.pos[1], obj1.radius *2);
			fill(0);
			DrawZ.textScaled(obj1.name, obj1.pos[0] -obj1.radius *0, obj1.pos[1], obj1.radius /2);
		}
		if (this.menu !== null) {
			const vec = DrawZ.vectorScaled(this.menu.pos);
			const l = this.alternatives.length;
			const selectedIndex = this.circleIndex(l, vec);
			for(let i = 0; i < l; i++) {
				const alt = this.alternatives[i];
				if (i === selectedIndex) {
					fill(95, 0, 0);
				} else {
					fill(95, 95, 95);
				}
				ellipse(vec[0] +alt[1][0], vec[1] +alt[1][1], alt[2] *2);
				alt[3](math.add(vec, alt[1]));
			}
		}
	}, 
	circleIndex(N, POINT) {
		return floor(math.mod(-atan2(-POINT[0] +mouseX, -POINT[1] +mouseY) -PI /N, 2 *PI) /(2 *PI) *N);
	}, 
	moveTravelers(X, Y) {
		for(const obj1 of this.travelers) {
			obj1.pos[0] += X;
			obj1.pos[1] += Y;
		}
	}, 
	menuShift(OBJ) {
		let forMenu = null;
		if (this.menu === null) {
			s = OBJ.generation;
			forMenu = OBJ;
			this.alternatives = [];
			const optionRadius = height /24;
			const circleRadius = height /6;
			const increment = PI *2/3;	//Change this when adding alt-functions
			let theta = PI /2;
			
			//To add subble
			const alt1 = function() {
				const vec = DrawZ.invertScaled(mouseX, mouseY);
				const subble = Sbls.createSubble(vec[0], vec[1], optionRadius /DrawZ.zoom, "New", [forMenu], forMenu.generation +1);
				Sbls.render();
				Sbls.editName(subble);
				Sbls.menuShift(forMenu); //Last edit
			}
			const draw1 = function(POS) {
				fill(0);
				textSize(optionRadius *2);
				text("+", POS[0], POS[1] +optionRadius *0.6);
			}
			theta += increment;
			this.alternatives.push([alt1, [cos(theta) *circleRadius, sin(theta) *circleRadius], optionRadius, draw1]);
			
			//To edit name
			const alt2 = function() {
				Sbls.editName(forMenu);
				Sbls.menuShift(forMenu);
			}
			const draw2 = function(POS) {
				textSize(optionRadius /2);
				fill(0);
				text('"' +forMenu.name +'"', POS[0], POS[1] +optionRadius *0.1);
			}
			theta += increment;
			this.alternatives.push([alt2, [cos(theta) *circleRadius, sin(theta) *circleRadius], optionRadius, draw2]);
			
			//To remove bubble
			const alt3 = function() {
				Sbls.menuShift(forMenu);
				Sbls.removeSubble(forMenu);
				Sbls.render();
			}
			const draw3 = function(POS) {
				fill(0);
				textSize(optionRadius *2);
				text("🗑", POS[0], POS[1] +optionRadius *0.6);
			}
			theta += increment;
			this.alternatives.push([alt3, [cos(theta) *circleRadius, sin(theta) *circleRadius], optionRadius, draw3]);

			this.mouseForSelection = false;
		} else {
			this.mouseForSelection = true;
		}
		this.menu = forMenu;
	}, 
	editName(OBJ) {
		const target = OBJ;
		this.input = createInput(target.name);
		const inputEvent = function() {
			target.name = this.value();
		}
		this.input.input(inputEvent);
		const vec = DrawZ.vectorScaled(target.pos);
		const size = height /6;
		if (vec[0] < size || vec[0] > width -size) {
			vec[0] = DrawZ.midScreenX;
		}
		if (vec[1] < size /5 || vec[1] > height -size /5) {
			vec[1] = DrawZ.midScreenY;
		}
		this.input.elt.setAttribute("style", "text-align: center; font-size: " +str(size /5) +"pt;");
		this.input.size(size *2);
		this.input.position(vec[0] -size, vec[1] -size /5);
		this.input.elt.focus();
	}, 
	quitEdit() {
		if (this.input !== null) {
			this.input.remove();
			this.input = null;
		}
	}, 
	Subble
}
function dragged() {
	if (clickedObject !== null && Sbls.mouseForSelection) {
		if (DrawZ.isTouchscreen || mouseButton === LEFT) {
			if (touches.length < 2) {
				let obj1 = clickedObject;
				let mousePos = DrawZ.invertScaled(mouseX, mouseY);
				if (0 <= mouseX && mouseX <= width) {
					const deltaX = -obj1.pos[0] +mousePos[0] +clickOffset[0];
					Sbls.moveTravelers(deltaX, 0);
				}
				if (0 <= mouseY && mouseY <= height) {
					const deltaY = -obj1.pos[1] +mousePos[1] +clickOffset[1];
					Sbls.moveTravelers(0, deltaY);
				}
			}
		} else {
			DrawZ.mouseForCamera = true;
		}
	} else {
		if (mouseButton === RIGHT) {
			DrawZ.mouseForCamera = true;
		}
	}
}

function draw() {
	DrawZ.everyTick();
	
	background(0);
	Sbls.draw();
	textSize(12);
	fill(255);
	text(str(DrawZ.isTouchscreen) +" " +str(str(s)), 400, 400);
}
