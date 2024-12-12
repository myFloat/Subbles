var Crch = {
    ALG_LINMIX: 0,
    alphabetAscii: [],
    decrypt(message, key=0, algorithm=0) {
        return this.encrypt(message, key, algorithm, true);
    },
    digest(asciiString, toString=true) {
        const codes = new Int8Array([...asciiString].map(a => a.charCodeAt()));
        const startedDigest = crypto.subtle.digest("SHA-256", codes);
        const convertToString = (digest) => {
            let result = "";
            const array = new Int8Array(digest);
            if (!toString) {
                return array;
            }
            for (const entry of array) {
                result += String.fromCharCode(math.mod(entry, 128));
            }
            return result;
        };
        return startedDigest.then(convertToString);
    },
    encrypt(message, key=0, algorithm=0, doInvert=false) {
        if (!doInvert && key === 0) {
            key = Crch.randomBigNumber();
            console.log("'" + this.exportKey(key) + "'");
        } else if (!math.isBigNumber(key)) {
            key = math.bignumber(key);
        }
        if (algorithm === this.ALG_LINMIX) {
            const sup = this;
            const routine = [ (input) => this.toAscii(input, doInvert), (input) => {
                const constant = math.bignumber("0.4002332866061823562797519172503221388317886084728");
                const shiftKey = math.mod(math.add(key, constant), 1);
                return this.shift(input, shiftKey, doInvert);
            }
            , (input) => {
                const constant = math.bignumber("0.63263993440675427874135975265190764295461292232884210134434165");
                const delta = math.floor(math.mod(math.add(key, constant), 1) * 128);
                return this.shiftLinear(input, delta, doInvert);
            }
            , (input) => {
                const constant = math.bignumber('0.635570674543001111093865647861310497181278139182');
                const mixKey = math.mod(math.add(key, constant), 1);
                return this.mix(input, mixKey, doInvert, this.getAlphabet());
            }
            , ];
            if (doInvert) {
                routine.reverse();
            }
            let output = message;
            for (const action of routine) {
                output = action(output);
            }
            return output;
        }
    },
    exportKey(key) {
        if (math.isBigNumber(key)) {
            return key.toString();
        }
        return key.toString();
    },
    factorialToGreaterPower(n) {
        let exponent = 1;
        let power = n;
        let product = 1;
        for (let factor = n; factor > 1; factor--) {
            product *= factor;
            if (power === product) {
                power = 1;
                product = 1;
            } else if (power < product) {
                exponent++;
                product /= n;
            }
        }
        return exponent;
    },
    fromAscii(message) {
        return this.toAscii(message, true);
    },
    getAlphabet(message = "", frequencies=null) {
        let characters = new Set();
        if (message.length > 0) {
            for (const c of message) {
                characters.add(c);
                if (frequencies) {
                    if (frequencies[c] === undefined) {
                        frequencies[c] = 1;
                    } else {
                        frequencies[c]++;
                    }
                }
            }
            return [...characters];
        } else {
            if (this.alphabetAscii.length < 128) {
                this.alphabetAscii = [];
                for (let k = 0; k < 128; k++) {
                    this.alphabetAscii.push(String.fromCharCode(k));
                }
            }
            return this.alphabetAscii;
        }
    },
    getBignumberFromIntArray(intArray) {
        let bignumber = math.bignumber(0);
        for (let k = 0; k < intArray.length; k++) {
            let entry = intArray[intArray.length - k];
            let powerOf256 = math.bignumber("0x100...");
        }
    },
    getOrder(key, n) {
        let rest;
        if (!math.isBigNumber(key)) {
            rest = math.bignumber(key);
        } else {
            rest = key;
        }
        let order = [...new Int32Array(n)];
        let integers = [...order.keys()];
        if (-1 < rest.e && rest > 0) {
            throw "Error: first argument must be between 0 and 1 (including 0)";
        }
        for (let k = n; 0 < k; k--) {
            const scaledRest = math.multiply(rest, k);
            const i = math.floor(scaledRest);
            const entry = integers[i];
            order[n - k] = entry;
            integers.splice(i, 1);
            rest = math.subtract(scaledRest, i);
            if (rest < 0) {
                rest = 0;
            }
        }
        return order;
    },
    invertOrder(order) {
        const result = [...order];
        for (const key of order) {
            result[order[key]] = key * 1;
        }
        return result;
    },
    mix(message, key=undefined, doInvert=false, alphabet=null) {
        if (key === undefined) {
            key = Math.random();
        }
        if (!alphabet) {
            alphabet = this.getAlphabet(message, null);
        }
        let order = this.getOrder(key, alphabet.length);
        if (doInvert) {
            order = this.invertOrder(order);
        }
        let result = "";
        for (const c of message) {
            const index = alphabet.indexOf(c);
            result += alphabet[order[index]];
        }
        return result;
    },
    randomBigNumber(n=3) {
        if (n === 0) {
            return 0;
        }
        let string = "";
        string += math.random();
        for (let k = 1; k < n; k++) {
            string += math.randomInt(2 ** 54);
        }
        return math.bignumber(string);
    },
    shift(message, key, doInvert=false, onlyAscii=true) {
        const messageArray = [...message];
        let maxCode;
        if (onlyAscii) {
            maxCode = 128;
        } else {
            maxCode = 65536;
        }
        const delta = Math.floor(key * maxCode);
        for (let k = 0; k < messageArray.length; k++) {
            const charCode = messageArray[k].charCodeAt();
            let newCode;
            if (doInvert) {
                newCode = math.mod(charCode - delta, maxCode);
            } else {
                newCode = math.mod(charCode + delta, maxCode);
            }
            messageArray[k] = String.fromCharCode(newCode);
        }
        return messageArray.join("");
    },
    shiftLinear(message, delta, doInvert=false) {
        const messageArray = [...message];
        let deltaMod = 0;
        for (let k = 0; k < messageArray.length; k++) {
            const charCode = messageArray[k].charCodeAt();
            let newCode;
            if (doInvert) {
                deltaMod = math.mod(deltaMod - delta, 128);
            } else {
                deltaMod = math.mod(deltaMod + delta, 128);
            }
            newCode = math.mod(charCode + deltaMod, 128);
            messageArray[k] = String.fromCharCode(newCode);
        }
        return messageArray.join("");
    },
    toAscii(message, doInvert=false) {
        if (doInvert) {
            const formatError = "Error: the message format is wrong";
            if (message.length < 3) {
                throw formatError;
            }
            const separatorCode = message.charCodeAt(0) + message.charCodeAt(1);
            if (separatorCode >= 128) {
                return message.substr(2);
            }
            const separator = String.fromCharCode(separatorCode);
            let result = "";
            for (let k = 2; k < message.length; k++) {
                const c = message[k];
                if (c === separator) {
                    if (message.length <= k + 2) {
                        console.log(formatError);
                        return false;
                    }
                    k++;
                    function readTuple() {
                        const nextCode = message.charCodeAt(k);
                        k++;
                        const secondNextCode = message.charCodeAt(k);
                        k++;
                        const aUnicode = 128 * nextCode + secondNextCode;
                        result += String.fromCharCode(aUnicode);
                    }
                    if (0 < message.charCodeAt(k)) {
                        readTuple();
                        k--;
                    } else {
                        if (0 < message.charCodeAt(k + 1)) {
                            k++;
                            while (0 < message.charCodeAt(k)) {
                                readTuple();
                            }
                        } else {
                            k++;
                            result += c;
                        }
                    }
                } else {
                    result += c;
                }
            }
            return result;
        }
        let result = "";
        const frequencies = {};
        const alphabet = this.getAlphabet(message, frequencies);
        const codes = alphabet.map(a => a.charCodeAt());
        const nonAsciiCodes = codes.filter(a => a >= 128);
        if (nonAsciiCodes.length === 0) {
            codes.sort( (a, b) => b - a);
            if (codes[0] === 0) {
                result += String.fromCharCode(63, 69);
            } else if (codes[0] + codes[1] >= 128) {
                result += String.fromCharCode(codes[0], codes[1]);
            } else {
                result += String.fromCharCode(codes[0], 128 - codes[0]);
            }
            result += message;
            return result;
        }
        const sortedCharacters = Object.entries(frequencies).sort( (a, b) => a[1] - b[1]);
        const separator = sortedCharacters.filter(a => a[0].charCodeAt() < 128)[0][0];
        const code = separator.charCodeAt();
        result += String.fromCharCode(Math.floor(code / 2), Math.ceil(code / 2));
        const nullChar = String.fromCharCode(0);
        for (let k = 0; k < message.length; k++) {
            const c = message[k];
            if (c.charCodeAt() < 128) {
                result += c;
                if (c === separator) {
                    result += nullChar + nullChar;
                }
            } else {
                function writeTuple(k) {
                    const charCode = message.charCodeAt(k);
                    result += String.fromCharCode(Math.floor(charCode / 128), charCode % 128);
                }
                result += separator;
                if (128 <= message.charCodeAt(k + 1)) {
                    result += nullChar;
                    while (128 <= message.charCodeAt(k + 1)) {
                        writeTuple(k);
                        k++;
                    }
                    writeTuple(k);
                    result += nullChar;
                } else {
                    writeTuple(k);
                }
            }
        }
        return result;
    },
};