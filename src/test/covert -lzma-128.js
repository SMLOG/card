const fs = require('fs');
const pako = require("pako");
const os = require('os')
const path = require('path')
const lzma = require("lzma");


let bytesToBase128 = (bytesArr) => {
    // 128 characters to encode as json-string
    let c = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz¼½ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"
    let fbits = [];
    let bits = (n, b = 8) => [...Array(b)].map((x, i) => n >> i & 1);
    bytesArr.map(x => fbits.push(...bits(x)));

    let fout = [];
    for (let i = 0; i < fbits.length / 7; i++) {
        fout.push(parseInt(fbits.slice(i * 7, i * 7 + 7).reverse().join(''), 2))
    };

    return (fout.map(x => c[x])).join('');
}


let base128ToBytes = (base128str) => {
    // 128 characters to encode as json-string
    let c = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz¼½ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"

    dfout = base128str.split('').map(x => c.indexOf(x));
    let dfbits = [];
    let bits = (n, b = 8) => [...Array(b)].map((x, i) => n >> i & 1);
    dfout.map(x => dfbits.push(...bits(x, 7)));

    let dfbytes = [];
    let m1 = dfbits.length % 8 ? 1 : 0;
    for (let i = 0; i < dfbits.length / 8 - m1; i++) {
        dfbytes.push(parseInt(dfbits.slice(i * 8, i * 8 + 8).reverse().join(''), 2))
    };

    return dfbytes;
}


async function getFiles(dir) {
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
        const name = `${dir}/${file}`;
        if (fs.statSync(name).isDirectory()) {
            await getFiles(name);
        } else {
            console.log(name)

            let estr = fs.readFileSync(name, { encoding: 'utf-8', flag: 'r' });
            let len1 = estr.length;
            let json = JSON.parse(estr);


            console.log('original enc length:' + json.enc.length);
            json = JSON.parse(pako.ungzip(atob(json.enc), { to: "string" }));



            let raw = JSON.stringify(json);
            let output = lzma.compress(raw, 9)
            output = bytesToBase128(new Uint8Array(output));

            //    output = uint8base64.base64ToBytes(output);
            //   output = lzma.decompress(output);
            console.log(output)
            console.log(base128ToBytes(output));




            let newpath = name.replace(/BDe/, 'BD8').replace('Dicte', 'Dict8');
            // console.log(raw)

            console.log(newpath, path.dirname(newpath));
            let wrapContent = JSON.stringify({ anc: output });

            let len2 = wrapContent.length;
            console.log((len2 / len1 * 100) + "%");
            fs.mkdirSync(path.dirname(newpath), { recursive: true });
            fs.writeFileSync(newpath, wrapContent);
            // console.log(wrapContent);
            process.exit(0)
        }
    }
}


/*
lzma.compress('hello', 9, function on_finish(result, error) {
    console.log(result.length);
    //console.log(result);
    console.log('hex:' + convert_to_formated_hex(result).length)
    console.log('base64:' + btoa(result))
    console.log('base64:' + btoa(result).length)

}, function on_progress(percent) {
    console.log('percent')
});
console.log(pako.gzip('hello', { to: "string", level: 9 }).length);

*/

