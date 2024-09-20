//Open bubble before its subbles
//Optimize size by indexing additional parents according to only other additional parents

var Saving = {
    loadingGeneration: 0,
    saveString: "",
    separators: [],
    findSeparators() {
        let usedCharCodes = new Set();
        for (const subble of Sbls.instances) {
            for (const char of subble.name) {
                usedCharCodes.add(char.charCodeAt());
            }
        }
        let separators = [];
        for (let k = 32; k < 2 ** 16; k++) {
            if (!usedCharCodes.has(k)) {
                let separator = String.fromCharCode(k);
                separators.push(separator);
                usedCharCodes.add(separator);
                if (separators.length >= 3) {
                    break;
                }
            }
        }
        if (separators.length === 0) {
            throw "Error: too many different unicode characters used in mindmap for it to be saved";
        }
        return separators;
    },
    load(string) {
        if (string.substr(0, 2) !== "v2") {
            throw "Error: save data is not in the requested format";
        }
        
    },
    loadSubble(subble, parentPos) {
        
        const genScalar = pow(1 / Sbls.generationGap, this.loadingGeneration);
        const pos = math.add(math.divide(this.gridPos, genScalar), parentPos);
        const radius = 0;
        const generation = this.loadingGeneration;
        const parents = [];
    },
    save() {
        this.separators = this.findSeparators();
        this.saveString = "v2" + this.separators.join("");
        for (const subble of Sbls.instances) {
            if (subble.parents.length === 0) {
                this.saveSubble(subble);
            }
        }
        return this.saveString;
    },
    saveSubble(subble) {
        const s = this.separators[0];
        this.saveString += subble.name + s;
        if (subble.parents.length === 0) {
            this.saveString += Math.round(subble.pos[0]) + s + Math.round(subble.pos[1]);
        } else {
            this.saveString += subble.gridPos[0] + s + subble.gridPos[1];
        }
        if (subble.parents.length > 1) {
            for (const parent of subble.parents) {
                const index = Sbls.instances.indexOf(parent);
                this.saveString += s + index;
            }
        }
        this.saveString += this.separators[1];
        for (const child of subble.children) {
            this.saveSubble(child);
        }
        this.saveString += this.separators[2];
        return this.saveString;
    },
};
function temp(NAME) {
    Sbls.instances = [];
    let fromStorage = JSON.parse(localStorage.getItem(NAME));
    for (let i = 0; i < fromStorage.length; i++) {
        const obj1 = fromStorage[i];
        Sbls.createSubble(obj1.pos[0], obj1.pos[1], obj1.radius, obj1.name, [], obj1.generation);
    }
    for (let j = 0; j < fromStorage.length; j++) {
        const obj1 = Sbls.instances[j];
        for (let i = 0; i < fromStorage[j].parents.length; i++) {
            obj1.parents[i] = Sbls.instances[fromStorage[j].parents[i]];
        }
        for (let i = 0; i < fromStorage[j].children.length; i++) {
            obj1.children[i] = Sbls.instances[fromStorage[j].children[i]];
        }
        obj1.ancestor = Sbls.instances[fromStorage[j].ancestor];
    }
    Sbls.render();
}
