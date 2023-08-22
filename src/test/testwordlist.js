var wordlist = require('wordlist-english');
var fs = require('fs')
var os = require('os')
const userHomeDir = os.homedir();

const file = userHomeDir + '/wordlist.json';
fs.writeFileSync(file, JSON.stringify(wordlist));
console.log(wordlist)