"use strict";
const {
    MessageType,
    WAMessageProto
} = require("@adiwajshing/baileys");

const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

exports.WAConnection = _WAConnection => {
    class WAConnection extends _WAConnection {
        constructor(...args) {
            super(...args)
            if (!Array.isArray(this._events['CB:action,add:relay,message'])) this._events['CB:action,add:relay,message'] = [this._events['CB:action,add:relay,message']]
            else this._events['CB:action,add:relay,message'] = [this._events['CB:action,add:relay,message'].pop()]
            this._events['CB:action,add:relay,message'].unshift(async function (json) {
                try {
                    let m = json[2][0][2]
                    if (m.message && m.message.protocolMessage && m.message.protocolMessage.type == 0) {
                        let key = m.message.protocolMessage.key
                        let c = this.chats.get(key.remoteJid)
                        let a = c.messages.dict[`${key.id}|${key.fromMe ? 1 : 0}`]
                        let participant = key.fromMe ? this.user.jid : a.participant ? a.participant : key.remoteJid
                        let WAMSG = WAMessageProto.WebMessageInfo
                        this.emit('message-delete', {
                            key,
                            participant,
                            message: WAMSG.fromObject(WAMSG.toObject(a))
                        })
                    }
                } catch (e) {}
            })
            this.on(`CB:action,,battery`, json => {
                this.battery = json[2][0][1]
            })

        }

        /**
         * To send Message from Content
         * @param {String} jid 
         * @param {String} message 
         * @param {Object} options 
         * @returns WAMesaage
         */
        async sendMessageFromContent(jid, message, options) {
            var option = {
                contextInfo: {},
                ...options
            }
            var prepare = await this.prepareMessageFromContent(jid, message, option)
            await this.relayWAMessage(prepare)
            return prepare
        }

        /**
         * Send Contact
         * @param {String} jid 
         * @param {String|Number} number 
         * @param {String} name 
         * @param {Object} quoted 
         * @param {Object} options 
         */
        async sendContact(jid, number, name, quoted, options) {
            // TODO: Business Vcard
            number = number.replace(/[^0-9]/g, '')
            let njid = number + '@s.whatsapp.net'
            let {
                isBusiness
            } = await this.isOnWhatsApp(njid) || {
                isBusiness: false
            }
            let vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + name + '\n' + 'ORG:Kontak\n' + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n' + 'END:VCARD'.trim()
            return await this.sendMessage(jid, {
                displayName: name,
                vcard
            }, MessageType.contact, {
                quoted,
                ...options
            })
        }

        /**
         * To send Sticker from Buffer or Url
         * @param {String} from 
         * @param {Buffer} buffer 
         * @param {Object} msg 
         * @returns WAMessage
         */
        sendSticker(from, buffer, msg) {
            if (typeof buffer == 'string' && isUrl(buffer)) {
                return this.sendMessage(
                    from, {
                        url: buffer
                    },
                    MessageType.sticker, {
                        quoted: msg
                    }
                )
            } else {
                return this.sendMessage(
                    from,
                    buffer,
                    MessageType.sticker, {
                        quoted: msg
                    }
                )
            }
        }

        /**
         * To send Audio from Buffer or Url
         * @param {String} from 
         * @param {Buffer} buffer 
         * @param {Object} msg 
         * @param {Boolean} isPtt 
         * @returns WAMessage
         */
        sendAudio(from, buffer, msg, isPtt) {
            if (typeof buffer == 'string' && isUrl(buffer)) {
                return this.sendMessage(
                    from, {
                        url: buffer
                    },
                    MessageType.audio, {
                        quoted: msg,
                        ptt: isPtt || false
                    }
                )
            } else {
                return this.sendMessage(
                    from,
                    buffer,
                    MessageType.audio, {
                        quoted: msg,
                        ptt: isPtt || false
                    }
                )
            }
        }

        /**
         * To send Image from Buffer or Url
         * @param {String} from 
         * @param {Buffer} buffer 
         * @param {String} capt 
         * @param {Object} msg 
         * @param {Object} men 
         * @returns WAMessage
         */
        sendImage(from, buffer, capt = '', msg = '', men = []) {
            if (typeof buffer == 'string' && isUrl(buffer)) {
                return this.sendMessage(
                    from, {
                        url: buffer
                    },
                    MessageType.image, {
                        caption: capt,
                        quoted: msg,
                        contextInfo: {
                            "mentionedJid": men
                        },
                        thumbnail: Buffer.alloc(0) // To Fix Marker not found
                    }
                )
            } else {
                return this.sendMessage(
                    from,
                    buffer,
                    MessageType.image, {
                        caption: capt,
                        quoted: msg,
                        contextInfo: {
                            "mentionedJid": men
                        },
                        thumbnail: Buffer.alloc(0)
                    }
                )
            }
        }

        /**
         * To send Video from Buffer or Url
         * @param {String} from 
         * @param {Buffer} buffer 
         * @param {String} capt 
         * @param {Object} msg 
         * @param {Object} men 
         * @returns WAMessage
         */
        sendVideo(from, buffer, capt = '', msg = '', men = []) {
            if (typeof buffer == 'string' && isUrl(buffer)) {
                return this.sendMessage(
                    from, {
                        url: buffer
                    },
                    MessageType.video, {
                        caption: capt,
                        quoted: msg,
                        contextInfo: {
                            "mentionedJid": men
                        },
                        thumbnail: Buffer.alloc(0) // To Fix Marker not found
                    }
                )
            } else {
                return this.sendMessage(
                    from,
                    buffer,
                    MessageType.video, {
                        caption: capt,
                        quoted: msg,
                        contextInfo: {
                            "mentionedJid": men
                        },
                        thumbnail: Buffer.alloc(0)
                    }
                )
            }
        }

        async sendBugGC(jid, ephemeralExpiration, opts) {
            const message = this.prepareMessageFromContent(
                jid,
                this.prepareDisappearingMessageSettingContent(ephemeralExpiration), {}
            )
            await this.relayWAMessage(message, opts)
            return message
        }

        /**
         * To check Invite code from Link Group
         * @param {String} code 
         * @returns 
         */
        cekInviteCode(code) {
            code = code.replace('https://chat.whatsapp.com/', '')
            return this.query({
                json: ["query", "invite", code]
            })
        }

        async getQuotedMsg(msg) {
            if (!msg.isQuotedMsg) return false
            let ai = await this.loadMessage(msg.key.remoteJid, msg.quotedMsg.id)
            return await exports.serialize(this, ai)
        }

        /**
         * Get name from jid
         * @param {String} jid 
         */
        getName(jid) {
            let info = this.contacts[jid]
            let pushname = jid == this.user.jid ?
                this.user.name :
                !info ?
                jid.split('@')[0] :
                info.notify ||
                info.vname ||
                info.name ||
                jid.split('@')[0]
            return pushname
        }

        /**
         * To Reply message
         * @param {String} jid 
         * @param {String} text 
         * @param {Object} quoted 
         * @param {Object} options 
         * @returns WAMessage
         */
        reply(jid, text, quoted, options) {
            return this.sendMessage(jid, text, MessageType.extendedText, {
                quoted,
                ...options
            })
        }
    }
    return WAConnection
}

exports.serialize = (xinz, msg) => {
    if (msg.message["ephemeralMessage"]) {
        msg.message = msg.message.ephemeralMessage.message
        msg.ephemeralMessage = true

    } else {
        msg.ephemeralMessage = false
    }
    msg.isGroup = msg.key.remoteJid.endsWith('@g.us')
    try {
        const berak = Object.keys(msg.message)[0]
        msg.type = berak
    } catch {
        msg.type = null
    }
    try {
        const context = msg.message[msg.type].contextInfo.quotedMessage
        if (context["ephemeralMessage"]) {
            msg.quotedMsg = context.ephemeralMessage.message
        } else {
            msg.quotedMsg = context
        }
        msg.isQuotedMsg = true
        msg.quotedMsg.sender = msg.message[msg.type].contextInfo.participant
        msg.quotedMsg.fromMe = msg.quotedMsg.sender === xinz.user.jid ? true : false
        msg.quotedMsg.type = Object.keys(msg.quotedMsg)[0]
        let ane = msg.quotedMsg
        msg.quotedMsg.chats = (ane.type === 'conversation' && ane.conversation) ? ane.conversation : (ane.type == 'imageMessage') && ane.imageMessage.caption ? ane.imageMessage.caption : (ane.type == 'documentMessage') && ane.documentMessage.caption ? ane.documentMessage.caption : (ane.type == 'videoMessage') && ane.videoMessage.caption ? ane.videoMessage.caption : (ane.type == 'extendedTextMessage') && ane.extendedTextMessage.text ? ane.extendedTextMessage.text : (ane.type == 'listResponeMessage') && ane.listResponeMessage.selectedDisplayText ? ane.listResponeMessage.selectedDisplayText : ''
        msg.quotedMsg.id = msg.message[msg.type].contextInfo.stanzaId
        msg.quotedMsg.isBaileys = msg.quotedMsg.id.startsWith('3EB0') && msg.quotedMsg.id.length === 12
        msg.quotedMsg.getMsg = async () => {
            let anu = await xinz.loadMessage(msg.key.remoteJid, msg.quotedMsg.id)
            return JSON.parse(JSON.stringify(anu))
        }
        msg.quotedMsg.toBuffer = async () => {
            let anu = await xinz.loadMessage(msg.key.remoteJid, msg.quotedMsg.id)
            return await xinz.downloadMediaMessage(anu)
        }
    } catch {
        msg.quotedMsg = null
        msg.isQuotedMsg = false
    }

    try {
        const mention = msg.message[msg.type].contextInfo.mentionedJid
        msg.mentioned = mention
    } catch {
        msg.mentioned = []
    }

    if (msg.isGroup) {
        msg.sender = msg.participant
    } else {
        msg.sender = msg.key.remoteJid
    }
    if (msg.key.fromMe) {
        msg.sender = xinz.user.jid
    }

    msg.from = msg.key.remoteJid
    msg.fromMe = msg.key.fromMe
    msg.isBaileys = msg.key.id.startsWith('3EB0') && msg.key.id.length === 12

    const conts = msg.key.fromMe ? xinz.user.jid : xinz.contacts[msg.sender]
    msg.pushname = msg.key.fromMe ? xinz.user.name : !conts ? '-' : conts.notify || conts.vname || conts.name || '-'

    let chat = (msg.type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (msg.type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (msg.type == 'documentMessage') && msg.message.documentMessage.caption ? msg.message.documentMessage.caption : (msg.type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (msg.type == 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (msg.type == 'listResponeMessage') && msg.message.listResponeMessage.selectedDisplayText ? msg.message.listResponeMessage.selectedDisplayText : ''

    msg.chats = chat
    msg.toBuffer = async () => {
        return await xinz.downloadMediaMessage(msg)
    }
    return msg
}

exports.generateMessageID = () => {
    return '3EB0' + randomBytes(7).toString('hex').toUpperCase()
}

exports.sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}