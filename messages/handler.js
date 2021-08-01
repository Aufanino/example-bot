/*
Hanya example untuk https://justaqul.xyz
Mau recode? ya terserah asal jangan ganti WaterMark
Mau jual? jangan deh
Dapetin apikey? Regist di https://justaqul.xyz
Sorry sc nya banyak kekurangan
*/
"use strict";
const {
    MessageType
} = require("@adiwajshing/baileys");
const {
    default: Axios
} = require("axios");

const {
    color
} = require("../lib/color");
const func = require("../lib/function");
const {
    toSticker,
    webpToPng,
    webpToMp4,
    toAudio
} = require("../lib/convert");
const api = require("../lib/api");

const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:shorts\/)?(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/

module.exports = {
    async chatUpdate(conn, chat) {
        if (!chat.hasNewMessage) return
        let msg = chat.messages.all()[0]
        try {
            if (!msg.message) return // Mengskip message yang ga ada message
            await func.serialize(conn, msg) // biar ez
            switch (msg.type) { // Update media
                case MessageType.image:
                case MessageType.video:
                case MessageType.audio:
                case MessageType.sticker:
                    if (!msg.fromMe) await func.sleep(1000)
                    if (!msg.message[msg.type].url) await conn.updateMediaMessage(msg);
                    break
            }
            const {
                type,
                quotedMsg,
                isGroup,
                isQuotedMsg,
                mentioned,
                sender,
                from,
                fromMe,
                pushname,
                body,
                isBaileys,
                userData,
                groupMetadata
            } = msg
            const {
                text,
                extendedText,
                contact,
                location,
                liveLocation,
                image,
                video,
                sticker,
                document,
                audio,
                product
            } = MessageType

            if (msg.isBaileys) return

            const args = body.split(' ')
            const command = body.toLowerCase().split(' ')[0] || ''

            const prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(command) ? command.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : '#'
            const isCmd = command.startsWith(prefix)
            const q = body.slice(command.length + 1, body.length)

            const print = function (teks) {
                if (typeof teks !== 'string') teks = require('util').inspect(teks)
                teks = require('util').format(teks)
                return conn.reply(from, teks, msg)
            }
            // Console.log
            if (isCmd && isGroup) console.log(color('[ COMMAND ]', 'yellow'), color(command), color('from', 'yellow'), color(pushname), color('in', 'yellow'), color(groupMetadata.subject))
            if (isCmd && !isGroup) console.log(color('[ COMMAND ]', 'yellow'), color(command), color('from', 'yellow'), color(pushname), color('in', 'yellow'), color('Private Chat'))

            switch (command) {
                case '=>': {
                    if (!userData.isOwner) return
                    try {
                        let evaled = eval(`(async() => {` + q + `})()`)
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                        conn.reply(from, evaled, msg)
                    } catch (e) {
                        conn.reply(from, `${e}`, msg)
                    }
                }
                break
            case prefix + 'menu':
            case prefix + 'help': {
                let tmt = `${prefix}sticker\n`
                tmt += `${prefix}toimg\n`
                tmt += `${prefix}ytmp4\n`
                tmt += `${prefix}ytmp3\n`
                tmt += `${prefix}tiktokwm\n`
                tmt += `${prefix}tiktoknowm\n`
                tmt += `${prefix}tiktokmusic\n`
                tmt += `${prefix}tomp3\n`
                tmt += `${prefix}toptt\n`
                tmt += `${prefix}tourl\n`
                tmt += `${prefix}pinterest\n`
                tmt += `${prefix}igstalk\n`
                tmt += `${prefix}igdl\n`
                tmt += `${prefix}flower\n`
                tmt += `${prefix}write-text\n`
                tmt += `${prefix}shadow-text\n`
                conn.reply(from, tmt, msg)
            }
            break
            case prefix + 's':
            case prefix + 'sticker':
            case prefix + 'stiker': {
                if (msg.isImage || msg.isQuotedImage || msg.isVideo && msg.message[msg.type].seconds < 10 || msg.isQuotedVideo && quotedMsg[quotedMsg.type].seconds < 10) {
                    const media = isQuotedMsg ? await quotedMsg.toBuffer() : await msg.toBuffer()
                    toSticker(media, global.config.packName, global.config.authName)
                        .then((res) => conn.sendSticker(from, res, msg))
                        .catch((err) => {
                            console.log(err)
                            conn.reply(from, `Maaf terjadi kesalahan`, msg)
                        })
                } else {
                    let tmt = `Kirim/reply image/video dengan caption ${command}`
                    conn.reply(from, tmt, msg)
                }
            }
            break
            case prefix + 'tovideo':
            case prefix + 'toimg': {
                if (msg.isQuotedSticker) {
                    let isAnimated = quotedMsg[quotedMsg.type].isAnimated
                    if (isAnimated) {
                        const media = await quotedMsg.toBuffer()
                        webpToMp4(media)
                            .then((res) => conn.sendVideo(from, res, 'Nih kak', msg))
                            .catch((err) => {
                                console.log(err)
                                conn.reply(from, `Maaf terjadi kesalahan`, msg)
                            })
                    } else {
                        const media = await quotedMsg.toBuffer()
                        webpToPng(media)
                            .then((res) => {
                                conn.sendImage(from, res, 'Nih kak', msg)
                            })
                            .catch((err) => {
                                console.log(err)
                                conn.reply(from, `Maaf terjadi kesalahan`, msg)
                            })
                    }
                } else {
                    let tmt = `Reply sticker dengan caption ${command}`
                    conn.reply(from, tmt, msg)
                }
            }
            break
            case prefix + 'ytmp4': {
                if (!q) return conn.reply(from, `Penggunaan ${command} link youtube`, msg)
                if (!ytIdRegex.test(args[1])) return conn.reply(from, 'Harap berikan link yang benar', msg)
                await conn.reply(from, global.db.mess.wait, msg)
                await api.ytmp4(args[1])
                    .then(res => {
                        conn.sendImage(from, res.image, res.caption, msg)
                        if (res.isLimit) return conn.reply(from, 'Media terlalu besar silahkan download sendiri\n\n' + res.video, msg)
                        conn.sendVideo(from, res.video, '', msg)
                    })
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'ytmp3': {
                if (!q) return conn.reply(from, `Penggunaan ${command} link youtube`, msg)
                if (!ytIdRegex.test(args[1])) return conn.reply(from, 'Harap berikan link yang benar', msg)
                await conn.reply(from, global.db.mess.wait, msg)
                await api.ytmp3(args[1])
                    .then(res => {
                        conn.sendImage(from, res.image, res.caption, msg)
                        if (res.isLimit) return conn.reply(from, 'Media terlalu besar silahkan download sendiri\n\n' + res.video, msg)
                        conn.sendAudio(from, res.audio, msg)
                    })
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'tiktok':
            case prefix + 'tiktoknowm': {
                if (!q) return conn.reply(from, `Penggunaan ${command} link tiktok`, msg)
                if (!isUrl(args[1]) && !args[1].includes('tiktok.com')) return conn.reply(from, 'Harap berikan link yang benar', msg)
                await conn.reply(from, global.db.mess.wait, msg)
                await api.tiktok(args[1])
                    .then(res => conn.sendVideo(from, res.nowm, res.caption, msg))
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'tiktokwm': {
                if (!q) return conn.reply(from, `Penggunaan ${command} link tiktok`, msg)
                if (!isUrl(args[1]) && !args[1].includes('tiktok.com')) return conn.reply(from, 'Harap berikan link yang benar', msg)
                await conn.reply(from, global.db.mess.wait, msg)
                await api.tiktok(args[1])
                    .then(res => conn.sendVideo(from, res.wm, res.caption, msg))
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'tiktokmusic': {
                if (!q) return conn.reply(from, `Penggunaan ${command} link tiktok`, msg)
                if (!isUrl(args[1]) && !args[1].includes('tiktok.com')) return conn.reply(from, 'Harap berikan link yang benar', msg)
                await conn.reply(from, global.db.mess.wait, msg)
                await api.tiktok(args[1])
                    .then(res => {
                        toAudio(res.nowm)
                            .then(res => conn.sendAudio(from, res, msg))
                            .catch(err => conn.reply(from, global.db.mess.error.api, msg))
                    })
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'tomp3': {
                if (!msg.isQuotedVideo) return conn.reply(from, 'Reply video', msg)
                let media = await quotedMsg.toBuffer()
                await conn.reply(from, global.db.mess.wait, msg)
                toAudio(media)
                    .then(res => conn.sendAudio(from, res, msg))
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'toptt': {
                if (!msg.isQuotedVideo && !msg.isQuotedAudio) return conn.reply(from, 'Reply video / audio', msg)
                let media = await quotedMsg.toBuffer()
                await conn.reply(from, global.db.mess.wait, msg)
                if (isQuotedAudio) return conn.sendAudio(from, media, msg, true)
                toAudio(media)
                    .then(res => conn.sendAudio(from, res, msg))
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'pinterest':
            case prefix + 'pin': {
                if (!q) return conn.reply(from, `Penggunaan ${command} query`, msg)
                await conn.reply(from, global.db.mess.wait, msg)
                api.pinterest(q)
                    .then(res => conn.sendImage(from, res, '*Pencarian :* ' + q + '\n*URL :* ' + res, msg))
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'ss': {
                if (!q) return conn.reply(from, `Penggunaan ${command} url`, msg)
                if (!isUrl(args[1])) return conn.reply(from, 'Harap berikan link yang benar', msg)
                await conn.reply(from, global.db.mess.wait, msg)
                conn.sendImage(from, global.config.api + '/screenshot?apikey=' + global.config.apikey + '&url=' + args[1], '', msg)
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'tourl': {
                if (!msg.isMedia && !msg.isQuotedMedia) return conn.reply(from, 'Kirim / reply media', msg)
                let media = msg.isQuotedMedia ? await quotedMsg.toBuffer() : await msg.toBuffer()
                await conn.reply(from, global.db.mess.wait, msg)
                api.upload(media)
                    .then(res => conn.reply(from, res, msg))
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'igstalk': {
                if (!q) return conn.reply(from, `Penggunaan ${command} username`, msg)
                await conn.reply(from, global.db.mess.wait, msg)
                api.igstalk(q)
                    .then(res => conn.sendImage(from, res.image, res.caption, msg))
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, 'User tidak ditemukan', msg)
                    })
            }
            break
            case prefix + 'instagram':
            case prefix + 'ig':
            case prefix + 'igdl': {
                if (!q) return conn.reply(from, `Penggunaan ${command} link ig`, msg)
                if (!isUrl(args[1]) && !args[1].includes('instagram.com')) return conn.reply(from, 'Harap berikan link yang benar', msg)
                await conn.reply(from, global.db.mess.wait, msg)
                await api.igdl(args[1])
                    .then(res => {
                        let post = res.post
                        for (let i = 0; i < post.length; i++) {
                            let cp = i == 0 ? res.caption : ''
                            if (post[i].type == 'image') conn.sendImage(from, post[i].url, cp, msg)
                            else conn.sendVideo(from, post[i].url, cp, msg)
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, "Error, mungkin private", msg)
                    })
            }
            break
            case prefix + 'flower':
            case prefix + 'shadow-text':
            case prefix + 'write-text': {
                if (!q) return conn.reply(from, `Penggunaan ${command} text`, msg)
                await api.photooxy(q, command.slice(1))
                    .then(res => conn.sendImage(from, res, res, msg))
                    .catch(err => {
                        console.log(err)
                        conn.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            }
        } catch (err) {
            console.log(err)
        }
    }
}