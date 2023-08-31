const fs = require('fs');
const pako = require("pako");
const os = require('os')
const path = require('path')

function getFiles(dir) {
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
        const name = `${dir}/${file}`;
        if (fs.statSync(name).isDirectory()) {
            getFiles(name);
        } else {
            console.log(name)

            let data = fs.readFileSync(name, { encoding: 'utf-8', flag: 'r' });
            let json = JSON.parse(data);
            console.log(json);
            delete json['logid'];
            let base64 = btoa(
                pako.gzip(JSON.stringify(json), { to: "string", level: 9 })
            );
            let raw = JSON.stringify(json);

            let newpath = name.replace(/BD/, 'BDe').replace('Dict', 'Dicte');

            console.log(newpath, path.dirname(newpath));
            let wrapContent = JSON.stringify({ enc: base64 });

            console.log(base64.length, raw.length);
            console.log((wrapContent.length / raw.length * 100) + "%");
            fs.mkdirSync(path.dirname(newpath), { recursive: true });
            fs.writeFileSync(newpath, wrapContent);
            console.log(wrapContent);
            process.exit(0)
        }
    }
}

