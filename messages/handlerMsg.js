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
    async chatUpdate(chat) {
        if (!chat.hasNewMessage) return
        let msg = chat.messages.all()[0]
        try {
            if (!msg.message) return // Mengskip message yang ga ada message
            await func.serialize(this, msg) // biar ez
            switch (msg.type) { // Update media
                case MessageType.image:
                case MessageType.video:
                case MessageType.audio:
                case MessageType.sticker:
                    if (!msg.fromMe) await func.sleep(1000)
                    if (!msg.message[msg.type].url) await this.updateMediaMessage(msg);
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
            const args = body.split(' ')
            const command = body.toLowerCase().split(' ')[0] || ''

            const prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(command) ? command.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : '#'
            const isCmd = command.startsWith(prefix)
            const q = body.slice(command.length + 1, body.length)

            // Console.log
            if (isCmd && isGroup) console.log(color('[ COMMAND ]', 'yellow'), color(command), color('from', 'yellow'), color(pushname), color('in', 'yellow'), color(groupMetadata.subject))
            if (isCmd && !isGroup) console.log(color('[ COMMAND ]', 'yellow'), color(command), color('from', 'yellow'), color(pushname), color('in', 'yellow'), color('Private Chat'))

            switch (command) {
                case '=>': {
                    if (!userData.isOwner) return
                    try {
                        let evaled = eval(`(async() => {` + q + `})()`)
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                        this.reply(from, evaled, msg)
                    } catch (e) {
                        this.reply(from, `${e}`, msg)
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
                this.reply(from, tmt, msg)
            }
            break
            case prefix + 's':
            case prefix + 'sticker':
            case prefix + 'stiker': {
                if (msg.isImage || msg.isQuotedImage || msg.isVideo && msg.message[msg.type].seconds < 10 || msg.isQuotedVideo && quotedMsg[quotedMsg.type].seconds < 10) {
                    const media = isQuotedMsg ? await quotedMsg.toBuffer() : await msg.toBuffer()
                    toSticker(media, global.config.packName, global.config.authName)
                        .then((res) => this.sendSticker(from, res, msg))
                        .catch((err) => {
                            console.log(err)
                            this.reply(from, `Maaf terjadi kesalahan`, msg)
                        })
                } else {
                    let tmt = `Kirim/reply image/video dengan caption ${command}`
                    this.reply(from, tmt, msg)
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
                            .then((res) => this.sendVideo(from, res, 'Nih kak', msg))
                            .catch((err) => {
                                console.log(err)
                                this.reply(from, `Maaf terjadi kesalahan`, msg)
                            })
                    } else {
                        const media = await quotedMsg.toBuffer()
                        webpToPng(media)
                            .then((res) => {
                                this.sendImage(from, res, 'Nih kak', msg)
                            })
                            .catch((err) => {
                                console.log(err)
                                this.reply(from, `Maaf terjadi kesalahan`, msg)
                            })
                    }
                } else {
                    let tmt = `Reply sticker dengan caption ${command}`
                    this.reply(from, tmt, msg)
                }
            }
            break
            case prefix + 'ytmp4': {
                if (!q) return this.reply(from, `Penggunaan ${command} link youtube`, msg)
                if (!ytIdRegex.test(args[1])) return this.reply(from, 'Harap berikan link yang benar', msg)
                await this.reply(from, global.db.mess.wait, msg)
                await api.ytmp4(args[1])
                    .then(res => {
                        this.sendImage(from, res.image, res.caption, msg)
                        if (res.isLimit) return this.reply(from, 'Media terlalu besar silahkan download sendiri\n\n' + res.video, msg)
                        this.sendVideo(from, res.video, '', msg)
                    })
                    .catch(err => {
                        console.log(err)
                        this.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'ytmp3': {
                if (!q) return this.reply(from, `Penggunaan ${command} link youtube`, msg)
                if (!ytIdRegex.test(args[1])) return this.reply(from, 'Harap berikan link yang benar', msg)
                await this.reply(from, global.db.mess.wait, msg)
                await api.ytmp3(args[1])
                    .then(res => {
                        this.sendImage(from, res.image, res.caption, msg)
                        if (res.isLimit) return this.reply(from, 'Media terlalu besar silahkan download sendiri\n\n' + res.video, msg)
                        this.sendAudio(from, res.audio, msg)
                    })
                    .catch(err => {
                        console.log(err)
                        this.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'tiktok':
            case prefix + 'tiktoknowm': {
                if (!q) return this.reply(from, `Penggunaan ${command} link tiktok`, msg)
                if (!isUrl(args[1]) && !args[1].includes('tiktok.com')) return this.reply(from, 'Harap berikan link yang benar', msg)
                await this.reply(from, global.db.mess.wait, msg)
                await api.tiktok(args[1])
                    .then(res => this.sendVideo(from, res.nowm, res.caption, msg))
                    .catch(err => {
                        console.log(err)
                        this.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'tiktokwm': {
                if (!q) return this.reply(from, `Penggunaan ${command} link tiktok`, msg)
                if (!isUrl(args[1]) && !args[1].includes('tiktok.com')) return this.reply(from, 'Harap berikan link yang benar', msg)
                await this.reply(from, global.db.mess.wait, msg)
                await api.tiktok(args[1])
                    .then(res => this.sendVideo(from, res.wm, res.caption, msg))
                    .catch(err => {
                        console.log(err)
                        this.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'tiktokmusic': {
                if (!q) return this.reply(from, `Penggunaan ${command} link tiktok`, msg)
                if (!isUrl(args[1]) && !args[1].includes('tiktok.com')) return this.reply(from, 'Harap berikan link yang benar', msg)
                await this.reply(from, global.db.mess.wait, msg)
                await api.tiktok(args[1])
                    .then(res => {
                        toAudio(res.nowm)
                            .then(res => this.sendAudio(from, res, msg))
                            .catch(err => this.reply(from, global.db.mess.error.api, msg))
                    })
                    .catch(err => {
                        console.log(err)
                        this.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'tomp3': {
                if (!msg.isQuotedVideo) return this.reply(from, 'Reply video', msg)
                let media = await quotedMsg.toBuffer()
                await this.reply(from, global.db.mess.wait, msg)
                toAudio(media)
                    .then(res => this.sendAudio(from, res, msg))
                    .catch(err => {
                        console.log(err)
                        this.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'toptt': {
                if (!msg.isQuotedVideo && !msg.isQuotedAudio) return this.reply(from, 'Reply video / audio', msg)
                let media = await quotedMsg.toBuffer()
                await this.reply(from, global.db.mess.wait, msg)
                if (isQuotedAudio) return this.sendAudio(from, media, msg, true)
                toAudio(media)
                    .then(res => this.sendAudio(from, res, msg))
                    .catch(err => {
                        console.log(err)
                        this.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'pinterest':
            case prefix + 'pin': {
                if (!q) return this.reply(from, `Penggunaan ${command} query`, msg)
                await this.reply(from, global.db.mess.wait, msg)
                api.pinterest(q)
                    .then(res => this.sendImage(from, res, '*Pencarian :* ' + q + '\n*URL :* ' + res, msg))
                    .catch(err => {
                        console.log(err)
                        this.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'ss': {
                if (!q) return this.reply(from, `Penggunaan ${command} url`, msg)
                if (!isUrl(args[1])) return this.reply(from, 'Harap berikan link yang benar', msg)
                await this.reply(from, global.db.mess.wait, msg)
                this.sendImage(from, global.config.api + '/screenshot?apikey=' + global.config.apikey + '&url=' + args[1], '', msg)
                    .catch(err => {
                        console.log(err)
                        this.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'tourl': {
                if (!msg.isMedia && !msg.isQuotedMedia) return this.reply(from, 'Kirim / reply media', msg)
                let media = msg.isQuotedMedia ? await quotedMsg.toBuffer() : await msg.toBuffer()
                await this.reply(from, global.db.mess.wait, msg)
                api.upload(media)
                    .then(res => this.reply(from, res, msg))
                    .catch(err => {
                        console.log(err)
                        this.reply(from, global.db.mess.error.api, msg)
                    })
            }
            break
            case prefix + 'igstalk': {
                if (!q) return this.reply(from, `Penggunaan ${command} username`, msg)
                await this.reply(from, global.db.mess.wait, msg)
                api.igstalk(q)
                    .then(res => this.sendImage(from, res.image, res.caption, msg))
                    .catch(err => {
                        console.log(err)
                        this.reply(from, global.db.mess.error.api, msg)
                    })
            }
            }
        } catch (err) {
            console.log(err)
        }
    }
}