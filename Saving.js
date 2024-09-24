//Open bubble before its subbles
//Optimize size by indexing additional parents according to only other additional parents

var Saving = {
    loadingGeneration: 0,
    saveString: "",
    separators: [],
    trash: [],
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
    getAncestors() {
        const ancestors = new Set();
        for (const subble of Sbls.instances) {
            if (subble.parents.length === 0) {
                ancestors.add(subble);
            }
        }
        return ancestors;
    },
    load(string) {
        this.trash = Sbls.instances;
        Sbls.instances = [];
        if (string.substr(0, 2) !== "v2") {
            throw "Error: save data is not in the requested format";
        }
        this.separators = [...string.substr(2, 3)];
        this.loadingGeneration = 0;
        /*const phrase = "";
        let phase = 0;
        for (let c of string.substr(5)) {
            if (separators.indexOf(c) >= 0) {
                if (c === separator[0]) {
                    if (phase === 0) {
                        
                    }
                }
            } else {
                phrase += c;
            }
        }*/
        for (let k = 5; k < string.length; ) {
            const end = string.indexOf(this.separators[2], k);
            const subbleString = string.substr(k, end - k);
            this.loadSubble(subbleString);
        }
        this.trash = [];
    },
    loadSubble(string, parent = null) {
        const error = "Error: save data corrupted";
        let k = 0;
        let l = string.indexOf(this.separators[0]);
        const name = string.substr(k, l - k);
        k = l + 1;
        l = string.indexOf(this.separators[0], k);
        let x = string.substr(k, l - k) * 1;
        k = l + 1;
        l = string.indexOf(this.separators[0], k)
        const m = string.indexOf(this.separators[1], k);
        let additionalParents = true;
        if (l < 0 || m < l) {
            l = m;
            additionalParents = false;
        }
        let y = string.substr(k, l - k) * 1;
        if (x !== x || y !== y) {
            throw error;
        }
        const gridPos = [x, y];
        k = l + 1;
        const parentIndexes = [];
        if (additionalParents) {
            for ( ; k < m; ) {
                l = string.indexOf(separators[0], k);
                let index = string.substr(k, l - k) * 1;
                if (index !== index) {
                    throw error;
                }
                parentIndexes.push(index);
                k = l + 1;
            }
            k = m + 1;
        }
        const parents = [];
        let parentPos = [0, 0];
        if (parent) {
            parents.push(parent);
            parentPos = parent.pos;
        }
        for(let index of parentIndexes) {
            parents.push(Sbls.instances[index]);
        }
        const genScalar = pow(1 / Sbls.generationGap, this.loadingGeneration);
        const pos = math.add(math.divide(gridPos, genScalar), parentPos);
        const generation = this.loadingGeneration;
        const radius = 144 * pow(Sbls.generationGap, generation);
        const subble = Sbls.createSubble(pos[0], pos[1], radius, name, parents, this.loadingGeneration);
        if (k < string.length) {
            const newString = string.substr(k);
            this.loadingGeneration++;
            while (newString.length > 0) {
                newString = this.loadSubble(newString, subble);
            }
            this.loadingGeneration--;
        }
        return string.substr(k);
    },
    restoreFromTrash() {
        let trash = this.trash;
        Sbls.instances = trash;
        this.trash = [];
        return trash;
    },
    save() {
        this.separators = this.findSeparators();
        this.saveString = "v2" + this.separators.join("");
        for (const subble of this.getAncestors()) {
            this.saveSubble(subble);
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
