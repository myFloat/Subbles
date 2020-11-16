"use strict";

//Consequences of adopting child already having parent
//Drawing lines to non-rendered family
//Menu
//	Button for touchscreen
//General do for all children method (maybe)

function compile() {
	const string = "This function is no longer needed before saving."; 
	print(string);
}
let toStorage;
function prepareSave() {
    let content = [];
    for(const obj1 of Sbls.instances) {
        const obj2 = Object.assign({}, obj1)
        content.push(obj2);
    }
    toStorage = content;
    for(let j = 0; j < Sbls.instances.length; j++) {
        const obj1 = toStorage[j];
        const obj2 = Sbls.instances[j];
        obj1.parents = obj2.parents.splice();
        obj1.children = obj2.children.splice();
        for(let i = 0; i < obj2.parents.length; i++) {
            obj1.parents[i] = Sbls.instances.indexOf(Sbls.instances[j].parents[i]);
        }
        for(let i = 0; i < obj2.children.length; i++) {
            obj1.children[i] = Sbls.instances.indexOf(Sbls.instances[j].children[i]);
        }
        obj1.ancestor = Sbls.instances.indexOf(Sbls.instances[j].ancestor);
    }
}
function saveFile(NAME) {
    prepareSave();
    localStorage.setItem(NAME, JSON.stringify(toStorage));
}
function saveText() {
    prepareSave();
    return JSON.stringify(toStorage);
}

function loadFile(NAME) {
	Sbls.instances = [];
	let fromStorage = JSON.parse(localStorage.getItem(NAME));
	for(let i = 0; i < fromStorage.length; i++) {
		const obj1 = fromStorage[i];
		Sbls.createSubble(obj1.pos[0], obj1.pos[1], obj1.radius, obj1.name, [], obj1.generation);
	}
	for(let j = 0; j < fromStorage.length; j++) {
		const obj1 = Sbls.instances[j];
		for(let i = 0; i < fromStorage[j].parents.length; i++) {
			obj1.parents[i] = Sbls.instances[fromStorage[j].parents[i]];
		}
		for(let i = 0; i < fromStorage[j].children.length; i++) {
			obj1.children[i] = Sbls.instances[fromStorage[j].children[i]];
		}
		obj1.ancestor = Sbls.instances[fromStorage[j].ancestor];
	}
	Sbls.render();
}
function loadText(TEXT) {
	Sbls.instances = [];
	let fromStorage = JSON.parse(TEXT);
	for(let i = 0; i < fromStorage.length; i++) {
		const obj1 = fromStorage[i];
		Sbls.createSubble(obj1.pos[0], obj1.pos[1], obj1.radius, obj1.name, [], obj1.generation);
	}
	for(let j = 0; j < fromStorage.length; j++) {
		const obj1 = Sbls.instances[j];
		for(let i = 0; i < fromStorage[j].parents.length; i++) {
			obj1.parents[i] = Sbls.instances[fromStorage[j].parents[i]];
		}
		for(let i = 0; i < fromStorage[j].children.length; i++) {
			obj1.children[i] = Sbls.instances[fromStorage[j].children[i]];
		}
		obj1.ancestor = Sbls.instances[fromStorage[j].ancestor];
	}
	Sbls.render();
}

window.oncontextmenu = function() {
	if (Sbls.input === null) {
		return false;
	}
}
function mouseDragged() {
	cursorDragged();
	DrawZ.mouseDragged();
}
function touchMoved() {
	cursorDragged();
	DrawZ.touchMoved();
	return false;
}
function mousePressed() {
	cursorPressed();
}
function touchStarted() {
	cursorPressed();
}
function mouseReleased() {
	cursorReleased();
}
function touchEnded() {
	cursorReleased();
}
function mouseWheel() {
	DrawZ.mouseWheel(event);
	cameraMoved();
}
function cameraMoved() {
	Sbls.quitEdit();
	Sbls.render();
}
function singleTap() {
	if (clickedObject === null) {
		if (!DrawZ.isTouchScreen && mouseButton === RIGHT) {
			Sbls.menuShift([mouseX, mouseY]);
		}
	} else {
		if (DrawZ.isTouchscreen || mouseButton === LEFT) {
			if (Sbls.mouseForSelection) {
				clickedObject.selectShift();
				clickedObject = null;
			}
		} else {
			Sbls.menuShift(clickedObject);
		}
	}
	if (Sbls.menu !== null && mouseButton !== RIGHT) {
		const vec = DrawZ.vectorScaled(Sbls.menuPos);
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

	//Subbles
	if (localStorage.saved_mindmap !== undefined) {
		loadFile("saved_mindmap");
	} else {
		Sbls.createSubble(0, 0, 144, "Mindmap");
		Sbls.render();
	}
	
	s = "Version 0";
}


function cursorDragged() {
	if (clickedObject !== null && Sbls.mouseForSelection) {
		if (DrawZ.isTouchscreen || mouseButton === LEFT) {
			if (touches.length < 2) {
				let obj1 = clickedObject;
				let mousePos = DrawZ.invertScaled(mouseX, mouseY);
				if (0 <= mouseX && mouseX <= width) {
					const deltaX = -obj1.pos[0] +mousePos[0] +clickOffset[0];
					Sbls.moveTravelers(deltaX, 0, Sbls.travelers);
				}
				if (0 <= mouseY && mouseY <= height) {
					const deltaY = -obj1.pos[1] +mousePos[1] +clickOffset[1];
					Sbls.moveTravelers(0, deltaY, Sbls.travelers);
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
function cursorPressed() {
	DrawZ.touchStarted();
	DrawZ.mouseForCamera = false;
	Sbls.collisionMouse();
	if (touches.length === 3) {
		if (clickedObject !== null) {
			Sbls.menuShift(clickedObject);
		} else {
			Sbls.menuShift([touches[0].x, touches[0].y]);
		}
	}
}
function cursorReleased() {
	DrawZ.touchEnded();
	Sbls.collisionOther();
	if (Sbls.menu !== null && DrawZ.isTouchscreen && touches.length === 0) {
		const vec = DrawZ.vectorScaled(Sbls.menuPos);
		Sbls.alternatives[Sbls.circleIndex(Sbls.alternatives.length, vec)][0]();
	}
}
class Subble {
	constructor(X, Y, R, NAME, PARENTS, GENERATION) {
		this.pos = [X, Y];
		this.gridPos = [X, Y]; //a.k.a. local coordinates
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
		this.gridAlign();
	}
	decideTravelers(SELECTED) {
		for (const node of this.subtree()) {
			if (node.selected === SELECTED) {
				Sbls.travelers.add(node);
			}
		}
	}
	gridAlign() {
		let newPos;
		if (this.parents.length > 0) {
			const parentPos = this.parents[0].pos;
			const delta = math.subtract(this.pos, parentPos);
			const genScalar = pow(1 /Sbls.generationGap, this.parents[0].generation +1);
			this.gridPos = [round(delta[0] *genScalar), round(delta[1] *genScalar)];
			if (max(abs(this.gridPos[0]), abs(this.gridPos[1])) > Sbls.parentMaxGap) { //If any coordinate is beyond limit
				if (this.gridPos[0] < -Sbls.parentMaxGap) {
					this.gridPos[0] = -Sbls.parentMaxGap;
				} else if (this.gridPos[0] > Sbls.parentMaxGap) {
					this.gridPos[0] = Sbls.parentMaxGap;
				}
				if (this.gridPos[1] < -Sbls.parentMaxGap) {
					this.gridPos[1] = -Sbls.parentMaxGap;
				} else if (this.gridPos[1] > Sbls.parentMaxGap) {
					this.gridPos[1] = Sbls.parentMaxGap;
				}
			}
			newPos = math.add(math.divide(this.gridPos, genScalar), parentPos);
		} else {
			this.gridPos = [round(this.pos[0]), round(this.pos[1])];
			newPos = this.gridPos;
		}
		const correction = math.subtract(newPos, this.pos);

		const rootSelected = this.selected;
		function *similarDescendants(PARENT) {
			yield PARENT;
			for (const child of PARENT.children) {
				if (child.selected === rootSelected) {
					yield *similarDescendants(child);
				} else {
					child.gridAlign();
				}
			}
		}
		Sbls.moveTravelers(correction[0], correction[1], similarDescendants(this));
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
		this.radius = 144 *pow(Sbls.generationGap, GEN);
		const f = function(CHILD, PARENT) {
			if (CHILD.generation <= PARENT.generation || CHILD.parents.length === 1) {
				CHILD.changeGeneration(PARENT.generation +1);
			}
		}
		this.forOffspring(f);
	}
	changeAncestor(ANCESTOR) {
		for (const node of this.subtree()) {
			node.ancestor = ANCESTOR;
		}
	}
	*subtree() {
		yield this;
		for (const child of this.children) {
			yield *child.subtree();
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
			Sbls.instancesSelected.add(this);
		} else {
			Sbls.instancesSelected.delete(this);
		}
	}
}
var Sbls = {
	instances: [], 
	instancesRendered: [], 
	instancesSelected: new Set(), 
	travelers: new Set(), 
	mouseForSelection: true, 
	generationGap: 1/2, //Size proportion from each subble to its child
	parentMaxGap: 9999, //Max allowed distance to parents in local coordinates
	input: null, 
	//Menu
	menu: null, 
	menuPos: [0, 0], 
	alternatives: [], 

	createSubble(X, Y, R, NAME, PARENTS, GENERATION) {
		this.instances.push(new this.Subble(X, Y, R, NAME, PARENTS, GENERATION));
		return this.instances[this.instances.length -1];
	}, 
	removeSubble(INSTANCE) {
		this.instances.splice(this.instances.indexOf(INSTANCE), 1);
		const index = this.instancesRendered.indexOf(INSTANCE);
		if (index !== -1) {
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
					if (obj1.selected) {
						Sbls.travelers = new Set(Sbls.instancesSelected);
					} else {
						obj1.decideTravelers(obj1.selected);
					}
				}
			}
		}
	}, 
	collisionOther() {
		if (this.input !== null) {
			if (this.input.elt !== document.activeElement) {
				this.quitEdit();
			}
		}
		if (clickedObject !== null && (mouseButton === LEFT || DrawZ.isTouchscreen) && Sbls.mouseForSelection) {
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
				this.moveTravelers(deltaX, deltaY, Sbls.travelers);
			}
			if (obj1.selected) {
				const ancestors = new Set();
				for(const instance of Sbls.instancesSelected) {
					if (! ancestors.has(instance.ancestor)) {
						instance.ancestor.gridAlign();
						ancestors.add(instance.ancestor);
					}
				}
			} else {
				clickedObject.gridAlign();
			}
		}
		Sbls.travelers.clear()
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
			fill(255);
			DrawZ.textScaled(obj1.name, obj1.pos[0] -obj1.radius *0, obj1.pos[1], obj1.radius /2);
		}
		if (this.menu !== null) {
			const vec = DrawZ.vectorScaled(this.menuPos);
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
	moveTravelers(X, Y, TRAVELERS) {
		for(const obj1 of TRAVELERS) {
			obj1.pos[0] += X;
			obj1.pos[1] += Y;
		}
	}, 
	lowestSubble(SUBBLES) {
		let oldest;
		for(const obj1 of SUBBLES) {
			if (!oldest || obj1.generation < oldest.generation) {
				oldest = obj1;
			}
		}
		return oldest;
	}, 
	menuShift(OBJ) {
		if (this.input === null) {
			let forMenu = null;
			if (this.menu === null) {
				forMenu = OBJ;
				this.alternatives = [];
				const optionRadius = height /24;
				const circleRadius = height /6;
				let theta = PI /2;
				if (OBJ.length === undefined) {
					this.menuPos = OBJ.pos;
					const increment = PI *2/3;	//Change this when adding alt-functions (or beautify this block of code so that you don't have to)

					//To add subble to bubble
					const alt1 = function() {
						const vec = DrawZ.invertScaled(mouseX, mouseY);
						const subble = Sbls.createSubble(vec[0], vec[1], optionRadius /DrawZ.zoom, "New", [forMenu], forMenu.generation +1);
						Sbls.render();
						Sbls.menuShift(forMenu); //This has to come before next line
						Sbls.editName(subble);
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
						Sbls.menuShift(forMenu); //This has to come before next line
						Sbls.editName(forMenu);
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
				} else {
					saveFile("saved_mindmap");
					s = "Saved!"
					
					this.menuPos = DrawZ.invertScaled(OBJ[0], OBJ[1]);
					const increment = PI *2/3;	//Change this when adding alt-functions (or beautify this block of code so that you don't have to)

					//To add parentless bubble
					const alt1 = function() {
						const vec = DrawZ.invertScaled(OBJ[0], OBJ[1]);
						const subble = Sbls.createSubble(vec[0], vec[1], 144, "New");
						Sbls.render();
						Sbls.menuShift(forMenu); //This has to come before next line
						Sbls.editName(subble);
					}
					const draw1 = function(POS) {
						fill(0);
						textSize(optionRadius *2);
						text("+", POS[0], POS[1] +optionRadius *0.6);
					}
					theta += increment;
					this.alternatives.push([alt1, [cos(theta) *circleRadius, sin(theta) *circleRadius], optionRadius, draw1]);

					//To save
					const alt2 = function() {
						const vec = DrawZ.invertScaled(OBJ[0], OBJ[1]);
						const string = saveText();
						const subble = Sbls.createSubble(vec[0], vec[1], optionRadius /DrawZ.zoom, string);
						Sbls.render();
						Sbls.menuShift(forMenu); //This has to come before next line
						Sbls.editName(subble);
					}
					const draw2 = function(POS) {
						fill(0);
						textSize(optionRadius *2);
						text("💾", POS[0], POS[1] +optionRadius *0.6);
					}
					theta += increment;
					this.alternatives.push([alt2, [cos(theta) *circleRadius, sin(theta) *circleRadius], optionRadius, draw2]);

					//To load
					const alt3 = function() {
						let name = "";
						for(const obj1 of Sbls.instances) {
							if (obj1.name === "LOAD") {
								for(const obj2 of obj1.children) {
									name = obj2.name;
								}
							}
						}
						if (name !== "") {
							loadText(name);
							Sbls.menuShift(forMenu);
						} else {
							const vec = DrawZ.invertScaled(OBJ[0], OBJ[1]);
							const subble = Sbls.createSubble(vec[0], vec[1], 144, 'Create bubble named "LOAD" and add subble to it named with load-code');
							Sbls.render();
							Sbls.menuShift(forMenu); //This has to come before next line
							Sbls.editName(subble);
						}
					}
					const draw3 = function(POS) {
						fill(0);
						textSize(optionRadius *2);
						text("📁", POS[0], POS[1] +optionRadius *0.6);
					}
					theta += increment;
					this.alternatives.push([alt3, [cos(theta) *circleRadius, sin(theta) *circleRadius], optionRadius, draw3]);
				}
				this.mouseForSelection = false;
			} else {
				this.mouseForSelection = true;
				s = "";
				this.menuPos = [0, 0];
			}
			this.menu = forMenu;
		}
	}, 
	editName(OBJ) {
		this.quitEdit();
		Sbls.mouseForSelection = false;
		Sbls.mouseForCamera = false;
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
		this.input.elt.select();
	}, 
	quitEdit() {
		if (this.input !== null) {
			this.input.remove();
			this.input = null;
			Sbls.mouseForSelection = true;
			Sbls.mouseForCamera = true;
		}
	}, 
	Subble
}

function draw() {
	DrawZ.everyTick();
	
	background(0);
	Sbls.draw();
	let size = height *0.03;
	textSize(size);
	fill(255);
	text(str(s), size *4, size *2);
}
