"use strict";
let {
    WAConnection: _WAConnection,
    MessageType
} = require("@adiwajshing/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const figlet = require("figlet");

const func = require('./lib/function');
const handler = require("./messages/handlerMsg");
const {
    color
} = require("./lib/color");

let WAConnection = func.WAConnection(_WAConnection);

// Global
global['config'] = JSON.parse(fs.readFileSync('./config.json'));
global['db'] = {};
global['db']['mess'] = {
    "wait": "*_Tunggu permintaan anda sedang diproses_*",
    "error": {
        "Iv": "Link yang kamu berikan tidak valid",
        "api": "Maaf terjadi kesalahan"
    },
    "OnlyGrup": "Perintah ini hanya bisa digunakan di grup",
    "OnlyPM": "Perintah ini hanya bisa digunakan di private message",
    "GrupAdmin": "Perintah ini hanya bisa digunakan oleh Admin Grup",
    "BotAdmin": "Bot Harus menjadi admin",
    "OnlyOwner": "Perintah ini hanya dapat digunakan oleh owner bot",
    "OnlyPrem": "Perintah ini khusus member premium",
}

let conn;

async function start(sesion, conn = new WAConnection) {
    console.log(color(figlet.textSync('Example Bot', 'Larry 3D'), 'cyan'))
    conn.logger.level = 'warn';
    console.log(color('[ SYSTEM ]', 'yellow'), color('Loading...'));

    // Menunggu QR
    conn.on('qr', qr => {
        qrcode.generate(qr, {
            small: true
        });
        console.log(color('[ SYSTEM ]', 'yellow'), color('Please scan qr code'));
    })

    // Restore Sesion
    fs.existsSync(sesion) && conn.loadAuthInfo(sesion)

    // Mencoba menghubungkan
    conn.on('connecting', () => {
        console.log(color('[ SYSTEM ]', 'yellow'), color(' ⏳ Connecting...'));
    })

    // Konek
    conn.on('open', (json) => {
        console.log(color('[ SYSTEM ]', 'yellow'), color('Bot is now online!'));
    })

    // Write Sesion
    await conn.connect({
        timeoutMs: 30 * 1000
    })
    fs.writeFileSync(sesion, JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))

    // Action Call
    conn.on('CB:action,,call', async json => {
        conn.query({
            json: ["action", "call", ["call", {
                    "from": conn.user.jid,
                    "to": json[1].from,
                    "id": func.generateMessageID()
                },
                [
                    ["reject", {
                        "call-id": json[1].id,
                        "call-creator": json[1].from,
                        "count": "0"
                    }, null]
                ]
            ]]
        }).then(() => {
            const callerid = json[2][0][1].from;
            console.log(color('[ SYSTEM ]', 'yellow'), color('Bot on Incoming Call | '), color(callerid, 'cyan'));
            conn.sendMessage(callerid, `Maaf bot tidak menerima call`, MessageType.text)
                .then(() => {
                    conn.blockUser(callerid, "add")
                })
        })
    })

    conn.on('chat-update', handler.chatUpdate)
}

start('session.json')
    .catch(console.log)

exports.conn