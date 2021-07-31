"use strict";
let {
    WAConnection: _WAConnection,
    MessageType
} = require("@adiwajshing/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const cron = require("node-cron");

const func = require('./lib/function');
const handler = require("./messages/chat-update");

let WAConnection = func.WAConnection(_WAConnection);

// Global
global['config'] = JSON.parse(fs.readFileSync('./config.json'));
global['db'] = {};
global['db']['category_menu'] = JSON.parse(fs.readFileSync('./database/category-menu.json'));
global['db']['list_menu'] = JSON.parse(fs.readFileSync('./database/listmenu.json'));
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
    conn.logger.level = 'warn';
    console.log("Starting...");

    // Menunggu QR
    conn.on('qr', qr => {
        qrcode.generate(qr, {
            small: true
        });
        console.log("Scan QR");
    })

    // Restore Sesion
    fs.existsSync(sesion) && conn.loadAuthInfo(sesion)

    // Mencoba menghubungkan
    conn.on('connecting', () => {
        console.log('Connecting...')
    })

    // Konek
    conn.on('open', (json) => {
        console.log('Connect')
    })

    // Write Sesion
    await conn.connect({
        timeoutMs: 30 * 1000
    })
    fs.writeFileSync(sesion, JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))

    // Ya gitulah
    conn.on('ws-close', () => {
        console.log('Koneksi terputus, mencoba menghubungkan kembali..')
    })

    // Ntahlah
    conn.on('close', async ({
        reason,
        isReconnecting
    }) => {
        console.log('Terputus, Alasan :' + reason + '\nMencoba mengkoneksi ulang :' + isReconnecting)
        if (!isReconnecting) {
            console.log('Connect To Phone Rejected and Shutting Down.')
        }
    })

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

cron.schedule('*/1 * * * *', () => {
    fs.writeFileSync("./database/menu.json", JSON.stringify(global['db']['menu'], null, '\t'));
    console.log('Saving menu!')
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
})

exports.conn