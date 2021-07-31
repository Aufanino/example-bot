"use strict";
const {
    MessageType
} = require("@adiwajshing/baileys");

const func = require("../lib/function");
const {
    toSticker,
    webpToPng,
    webpToMp4,
    toAudio
} = require("../lib/convert");
const menu = require("../lib/menu");
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
            func.serialize(this, msg) // biar ez
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
                chats,
                isBaileys
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
            const args = chats.split(' ')
            const command = chats.toLowerCase().split(' ')[0] || ''

            const prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(command) ? command.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : '#'
            const isCmd = command.startsWith(prefix)
            const q = chats.slice(command.length + 1, chats.length)
            const body = chats.startsWith(prefix) ? chats : ''

            const isOwner = global['config'].ownerNumber.includes(sender)

            const isImage = (type === 'imageMessage')
            const isVideo = (type === 'videoMessage')
            const isSticker = (type == 'stickerMessage')
            const isMedia = isImage || isVideo || isSticker || (type == 'audioMessage') || (type == 'documentMessage')
            const isQuotedImage = isQuotedMsg ? (quotedMsg.type === 'imageMessage') ? true : false : false
            const isQuotedVideo = isQuotedMsg ? (quotedMsg.type === 'videoMessage') ? true : false : false
            const isQuotedSticker = isQuotedMsg ? (quotedMsg.type === 'stickerMessage') ? true : false : false

            if (isCmd) console.log(body)
            switch (command) {
                case '>': {
                    if (!isOwner) return
                    try {
                        let evaled = await eval(chats.slice(2))
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                        this.reply(from, `${evaled}`, msg)
                    } catch (err) {
                        this.reply(from, `${err}`, msg)
                    }
                }
                break
            case prefix + 'menu':
            case prefix + 'help': {
                let tmt = `1. ${prefix}sticker\n`
                tmt += `Ga ada`
                this.reply(from, tmt, msg)
            }
            break
            case prefix + 's':
            case prefix + 'sticker':
            case prefix + 'stiker': {
                if (isImage || isQuotedImage || isVideo && msg.message[msg.type].seconds < 10 || isQuotedVideo && quotedMsg[quotedMsg.type].seconds < 10) {
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
                if (isQuotedSticker) {
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
                if (!isQuotedVideo) return this.reply(from, 'Reply video', msg)
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
            }
        } catch (err) {
            console.log(err)
        }
    }
}