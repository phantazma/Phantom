class JsUnpacker {
    constructor(packedJS) {
      this.packedJS = packedJS;
    }
  
    detect() {
      const js = this.packedJS.replace(/\s+/g, '');
      const regex = /eval\(function\(p,a,c,k,e,(?:r|d)/;
      return regex.test(js);
    }
  
    unpack() {
      const js = this.packedJS;
      try {
        const regex = /\}\s*\('(.*)',\s*(.*?),\s*(\d+),\s*'(.*?)'\.split\('\|'\)/s;
        const match = regex.exec(js);
        if (match && match.length === 5) {
          const payload = match[1].replace(/\\'/g, "'");
          const radixStr = match[2];
          const countStr = match[3];
          const symtab = match[4].split('|');
  
          let radix = 36;
          let count = 0;
          try {
            radix = parseInt(radixStr, 10);
          } catch (e) {}
          try {
            count = parseInt(countStr, 10);
          } catch (e) {}
  
          if (symtab.length !== count) {
            throw new Error("Unknown P.A.C.K.E.R. encoding");
          }
  
          const unbase = new Unbase(radix);
          const wordRegex = /\b\w+\b/g;
          let decoded = payload;
          let replaceOffset = 0;
          let matchWord;
  
          while ((matchWord = wordRegex.exec(payload)) !== null) {
            const word = matchWord[0];
            const x = unbase.unbase(word);
            let value = null;
            if (x < symtab.length) {
              value = symtab[x];
            }
  
            if (value !== null && value.length > 0) {
              decoded =
                decoded.substring(0, matchWord.index + replaceOffset) +
                value +
                decoded.substring(matchWord.index + replaceOffset + word.length);
              replaceOffset += value.length - word.length;
            }
          }
          return decoded;
        }
      } catch (e) {
        console.error(e);
      }
      return null;
    }
  }
  
  class Unbase {
    constructor(radix) {
      this.ALPHABET_62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      this.ALPHABET_95 = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
      this.alphabet = null;
      this.dictionary = {};
      this.radix = radix;
  
      if (radix > 36) {
        if (radix < 62) {
          this.alphabet = this.ALPHABET_62.substring(0, radix);
        } else if (radix > 62 && radix < 95) {
          this.alphabet = this.ALPHABET_95.substring(0, radix);
        } else if (radix === 62) {
          this.alphabet = this.ALPHABET_62;
        } else if (radix === 95) {
          this.alphabet = this.ALPHABET_95;
        }
  
        for (let i = 0; i < this.alphabet.length; i++) {
          this.dictionary[this.alphabet.charAt(i)] = i;
        }
      }
    }
  
    unbase(str) {
      let ret = 0;
  
      if (!this.alphabet) {
        ret = parseInt(str, this.radix);
      } else {
        const tmp = str.split('').reverse().join('');
        for (let i = 0; i < tmp.length; i++) {
          ret += Math.pow(this.radix, i) * this.dictionary[tmp.charAt(i)];
        }
      }
      return ret;
    }
  }
  
  module.exports = JsUnpacker;
  