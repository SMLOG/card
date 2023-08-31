const fs = require('fs');
const pako = require("pako");
const os = require('os')
const path = require('path')
const lzma = require("lzma");
const uint8base64 = require("byte-base64");


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
            output = uint8base64.bytesToBase64(new Uint8Array(output));

            //    output = uint8base64.base64ToBytes(output);
            //   output = lzma.decompress(output);




            let newpath = name.replace(/BDe/, 'BDa').replace('Dicte', 'Dicta');
            // console.log(raw)

            console.log(newpath, path.dirname(newpath));
            let wrapContent = JSON.stringify({ anc: output });

            let len2 = wrapContent.length;
            console.log((len2 / len1 * 100) + "%");
            fs.mkdirSync(path.dirname(newpath), { recursive: true });
            fs.writeFileSync(newpath, wrapContent);
            // console.log(wrapContent);
            //  process.exit(0)
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

