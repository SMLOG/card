const config = {
    imgBase: "",
    ttsBase: "audio/",
    passNum: 40,
    gameTime1: 3,
    gameTime2: 6,
    langs: ["en", "zh", "yue"],
    tips: {
        en: ["no no no", "oh sorry.", "incorrect", "come on."],
        zh: ["继续努力", "加油！"],
        yue: ["继续努力", "加油！"],
    },
    ttslan: { en: "en", zh: "zh", yue: "cte" },
    url: "https://smlog.github.io/data/dict.js",
    games: [
        {
            _blank: 1,
            name: "pbskids.org games",
            imgUrl:
                "https://cms-tc.pbskids.org/global/mezzanines/_shellTopicBlock/Sesame_Puppy-Pet-Care_PBSGameFeature_908x510.jpg",
            url: "https://pbskids.org/games",
        },
        {
            name: "圈小猫",
            imgUrl: "images/logo.jpg",
            path: "cat",
        },
        {
            name: "匹配游戏",
            path: "card",
        },
        {
            name: "方块消除",
            imgUrl: "bitmap/logo.png",
            path: "remove",
        },
        {
            name: "数字推盘",
            path: "szhrdGame",
        },
        {
            name: "Bubble",
        },
        {
            name: "五子棋",
            path: "wuziqi",
        },
        {
            name: "五子棋2",
            path: "wuziqi2",
        },
        {
            name: "unlock",
        },
        {
            name: "connection",
        },
        {
            name: "master_checkers_v3",
        },
        {
            name: "numpuz",
        },
        {
            name: "pintu",
            imgUrl: "assets/img_480/game_logo.png",
        },
        {
            name: "blue casino",
            path: "blue2",
        },
        {
            name: "lollipop",
        },
        {
            path: "smarty-bubbles-2",
            name: "smarty bubbles",
            imgUrl: "SmartyBubbles2Teaser.jpg",
        },
        {
            name: "ppiano",
            imgUrl: "PerfectPiano_Teaser.jpg",
        },
        {
            name: "pianoonline",
        },
        {
            path: "pvz",
            name: "Plant zombie",
            imgUrl: "images/interface/Logo.jpg",
            src: "http://crge.cn/games",
        },
    ],
}
export default config;