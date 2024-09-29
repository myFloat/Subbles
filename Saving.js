//Open bubble before its subbles
//Optimize size by indexing additional parents according to only other additional parents

var Saving = {
    additionalParents: new Map(),
    error: "Error: save data corrupted",
    loadingGeneration: 0,
    savedSubbles: new Set(),
    saveString: "",
    separators: [],
    trash: [],
    convert(string) {
        if (string[0] !== "[") {
            string = string.substr(1, string.length - 2);
        }
        let fromStorage = JSON.parse(string);
        Sbls.instances = [];
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
        console.log("Save data converted from older format.");
        return Saving.save();
    },
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
        if (string.substr(0, 2) !== "v2") {
            if (string.substr(1, 2) === "v2") {
                string = string.substr(1, string.length - 2);
            } else if (!(string = this.convert(string))) {
                throw "Error: save data is not in the requested format";
            }
        }
        Sbls.instances = [];
        this.separators = [...string.substr(2, 3)];
        string = string.substr(5);
        this.loadingGeneration = 0;
        const subbles = [];
        const searcher = RegExp(["[" + this.separators[1] + this.separators[2] + "]"], "g");
        let depth = 0;
        let lastDepth = depth;
        let k = 0;
        let json = "[";
        for (const match of string.matchAll(searcher)) {
            if (match[0] === this.separators[1]) {
                if (lastDepth === depth + 1) {
                    json += ',';
                }
                const subString = string.substr(k, match.index - k);
                const subbleData = '"' + subString.replaceAll('"', '\\"') + '",[';
                json += subbleData;
                lastDepth = depth;
                depth++;
            } else {
                json += ']';
                lastDepth = depth;
                depth--;
                if (depth < 0) {
                    throw this.error + " (ref:1)";
                }
            }
            k = match.index + 1;
        }
        if (depth !== 0) {
            throw this.error + " (ref:2)";
        }
        json += "]";
        const data = JSON.parse(json);
        this.loadSubbles(data);
        this.synchronizeRelations();
        Sbls.render();
        this.trash = [];
        return data;
    },
    loadSubbles(dataTree, parent=null) {
        for (let j = 0; j < dataTree.length; j += 2) {
            const string = dataTree[j];
            let k = 0;
            let l = string.indexOf(this.separators[0]);
            const name = string.substr(k, l - k);
            k = l + 1;
            l = string.indexOf(this.separators[0], k);
            let x = string.substr(k, l - k) * 1;
            k = l + 1;
            l = string.indexOf(this.separators[0], k)
            if (l < 0 || string.length < l) {
                l = string.length;
            }
            let y = string.substr(k, l - k) * 1;
            if (x !== x || y !== y) {
                throw this.error + " (ref:3)";
            }
            const gridPos = [x, y];
            k = l + 1;
            const parentIndexes = [];
            const moreParentData = string.substr(k, string.length - k);
            for (const data of moreParentData.split(this.separators[0])) {
                if (data === "") {
                    break;
                }
                const index = Number(data);
                if (index !== index) {
                    throw this.error + " (ref:4)";
                }
                parentIndexes.push(index);
            }
            const parents = [];
            let parentPos = [0, 0];
            if (parent) {
                parents.push(parent);
                parentPos = parent.pos;
            }
            const genScalar = pow(1 / Sbls.generationGap, this.loadingGeneration);
            const pos = math.add(math.divide(gridPos, genScalar), parentPos);
            const generation = this.loadingGeneration;
            const radius = 144 * pow(Sbls.generationGap, generation);
            const subble = Sbls.createSubble(pos[0], pos[1], radius, name, parents, this.loadingGeneration);
            if (parentIndexes.length) {
                this.additionalParents.set(subble, parentIndexes);
            }
            this.loadingGeneration++;
            this.loadSubbles(dataTree[j + 1], subble);
        }
        this.loadingGeneration--;
    },
    restoreFromTrash() {
        let trash = this.trash;
        Sbls.instances = trash;
        this.trash = [];
        return trash;
    },
    save() {
        this.separators = this.findSeparators();
        this.savedSubbles.clear();
        this.saveString = "v2" + this.separators.join("");
        for (const subble of this.getAncestors()) {
            this.saveSubble(subble);
        }
        return this.saveString;
    },
    saveSubble(subble) {
        if (this.savedSubbles.has(subble)) {
            return false;
        } else {
            this.savedSubbles.add(subble);
        }
        subble.gridAlign([subble]);
        const s = this.separators[0];
        this.saveString += subble.name + s;
        if (subble.parents.length === 0) {
            this.saveString += Math.round(subble.pos[0]) + s + Math.round(subble.pos[1]);
        } else {
            this.saveString += subble.gridPos[0] + s + subble.gridPos[1];
        }
        const additionalParents = new Set(subble.parents);
        additionalParents.delete(subble.parents[0]);
        if (additionalParents.size) {
            for (const parent of additionalParents) {
                const index = Sbls.instances.indexOf(parent);
                this.saveString += s + index;
            }
        }
        this.saveString += this.separators[1];
        for (const child of new Set(subble.children)) {
            if (subble === child.parents[0]) {
                this.saveSubble(child);
            }
        }
        this.saveString += this.separators[2];
        return this.saveString;
    },
    synchronizeRelations() { //Needed for Version 0
        for (const child of this.additionalParents.keys()) {
            for (const index of this.additionalParents.get(child)) {
                const parent = Sbls.instances[index];
                parent.adopt(child);
            }
        }
    }
};
