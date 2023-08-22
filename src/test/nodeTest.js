var request = require('request');
const fs = require('fs');
const pako = require("pako");
const os = require("os");

const base = 'https://fanyi.baidu.com/gettts?lan'
const dict = "https://smlog.github.io/data/dict.js";
const userHomeDir = os.homedir();


const data = fs.readFileSync(userHomeDir + '/.npmrc',
    { encoding: 'utf8', flag: 'r' });
const proxy = data.split(/\n/)[0].trim().split(/=/)[1];

let audioDir = data.split(/\n/).filter(e => e.indexOf('tmpdir') > -1)[0].trim().split('=')[1].trim();



let tts = request.defaults({ jar: true, proxy: proxy });
let dictrequest = request.defaults({ jar: true, proxy: proxy });



function download(lan, str, dest, cb) {
    console.log(lan, str);
    return new Promise((resolve, reject) => {

        const sendReq = tts({
            url: `${base}=${encodeURIComponent(
                lan
            )}&text=${encodeURIComponent(str.trim())}&spd=3&source=web`,
            proxy: proxy
        })
            .on('response', function (response) {
                console.log(response.headers['content-type'])
                if (response.statusCode !== 200 || response.headers['content-type'].indexOf('html') > -1) {
                    console.log('unlink ' + dest);
                    fs.unlink(dest, () => { });
                    reject();
                } else {
                    sendReq.pipe(fs.createWriteStream(dest));
                    resolve();
                }


            })
            .on('error', (err) => {
                console.log('unlink ' + dest);

                fs.unlink(dest, () => { }); // delete the (partial) file and then return the error
                reject();
            })
            ;


    });
}




(async () => {
    let r = await dictrequest.get(dict);
    let data = '';
    await new Promise((resolve, rject) => {

        r.on('data', (d) => {
            data += d;
        })
        r.on('end', resolve)
    });
    data = data.trim();
    data = data.substring(4, data.length - 3);
    let items = JSON.parse(pako.ungzip(atob(data), { to: "string" }))[
        "items"
    ];
    console.log(items);
    let lansMap = { en: 'en', zh: 'zh', yue: 'cte' };
    let lans = Object.keys(lansMap);


    for (var j = 0; j < items.length; j++) {

        let item = items[j];
        console.log(j + "/" + items.length)

        for (var k = 0; k < lans.length; k++) {
            let lan = lans[k];
            let file = audioDir + `/${lan}/${item[lan].replace(/[?.!]/i, '_')}.mp3`;
            console.log(file)
            if (fs.existsSync(file)) continue;

            let dir = audioDir + `/${lan}`;
            if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }



            for (let i = 0; i < 10; i++) {

                try {
                    await download(lansMap[lan], item[lan], file, (result) => {
                        console.log(result)
                    })
                } catch (error) {

                    continue;
                }
                console.log('ok')
                break;

            }
            await new Promise((resolve) => {
                setTimeout(resolve, 1000)
            });
        }

    }



})();

