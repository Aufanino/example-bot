const {
    default: Axios
} = require('axios');
const moment = require('moment-timezone');
const FormData = require('form-data');
const fileType = require('file-type');
const fs = require('fs');
const path = require('path');
const tmp = path.join(__dirname, '../tmp')

function ytmp4(url, quality) {
    return new Promise((resolve, reject) => {
        if (!quality) quality = '360p'
        Axios.get(global.config.api + '/ytmp4?apikey=' + global.config.apikey + '&url=' + url + '&quality=' + quality)
            .then(({
                data
            }) => {
                let {
                    result,
                    metaData
                } = data.result
                let isLimit = false
                let cp = '*Youtube Downloader*\n\n'
                cp += '*VideoID :* ' + metaData.videoId + '\n'
                cp += '*Judul :* ' + metaData.title + '\n'
                cp += '*Type :* ' + result.type + '\n'
                cp += '*Size :* ' + result.filesizeF + '\n'
                cp += '*Channel :* ' + metaData.author.name + '\n'
                cp += '*Durasi :* ' + metaData.timestamp + '\n'
                cp += '*Tayangan :* ' + metaData.views + '\n'
                cp += '*Upload :* ' + metaData.ago + '\n'
                cp += '*Deskripsi :*\n' + metaData.description + '\n\n'
                cp += '_*Harap tunggu sebentar*_'
                if (Number(result.filesizeF.split(' MB')[0]) > 40) isLimit = true
                resolve({
                    image: result.thumb,
                    video: result.dl_link,
                    caption: cp,
                    isLimit
                })
            })
            .catch(reject)
    })
}

function ytmp3(url) {
    return new Promise((resolve, reject) => {
        Axios.get(global.config.api + '/ytmp3?apikey=' + global.config.apikey + '&url=' + url)
            .then(({
                data
            }) => {
                let {
                    result,
                    metaData
                } = data.result
                let isLimit = false
                let cp = '*Youtube Downloader*\n\n'
                cp += '*VideoID :* ' + metaData.videoId + '\n'
                cp += '*Judul :* ' + metaData.title + '\n'
                cp += '*Type :* ' + result.type + '\n'
                cp += '*Size :* ' + result.filesizeF + '\n'
                cp += '*Channel :* ' + metaData.author.name + '\n'
                cp += '*Durasi :* ' + metaData.timestamp + '\n'
                cp += '*Tayangan :* ' + metaData.views + '\n'
                cp += '*Upload :* ' + metaData.ago + '\n'
                cp += '*Deskripsi :*\n' + metaData.description + '\n\n'
                cp += '_*Harap tunggu sebentar*_'
                if (Number(result.filesizeF.split(' MB')[0]) > 40) isLimit = true
                resolve({
                    image: result.thumb,
                    audio: result.dl_link,
                    caption: cp,
                    isLimit
                })
            })
            .catch(reject)
    })
}

function tiktok(url) {
    return new Promise((resolve, reject) => {
        Axios.get(global.config.api + '/tiktok?apikey=' + global.config.apikey + '&url=' + url)
            .then(({
                data
            }) => {
                data = data.result
                let cp = `*Tiktok Downloader*\n\n`
                cp += '*ID :* ' + data.id + '\n'
                cp += '*Name / Nickname :* ' + data.authorMeta.name + '/' + data.authorMeta.nickName + '\n'
                cp += '*Durasi :* ' + data.videoMeta.duration + '\n'
                cp += '*Upload :* ' + moment(data.createTime * 1000).locale('id').format('LL') + '\n'
                cp += '*Like :* ' + data.diggCount + '\n'
                cp += '*Komentar :* ' + data.commentCount + '\n'
                cp += '*Share :* ' + data.shareCount + '\n'
                cp += '*Tayangan :* ' + data.playCount + '\n'
                cp += '*Nama Musik :* ' + data.musicMeta.musicName + '\n'
                cp += '*Author Musik :* ' + data.musicMeta.musicAuthor + '\n'
                cp += '*Deskripsi :* \n' + data.caption
                resolve({
                    nowm: data.noWaterMarkUrl,
                    wm: data.waterMarkUrl,
                    caption: cp
                })
            })
            .catch(reject)
    })
}

function pinterest(query) {
    return new Promise((resolve, reject) => {
        Axios.get(global.config.api + '/pinterest?apikey=' + global.config.apikey + '&q=' + encodeURIComponent(query))
            .then(({
                data
            }) => {
                resolve(data.image)
            })
            .catch(reject)
    })
}

function igstalk(username) {
    return new Promise((resolve, reject) => {
        username = username.replace("@", '')
        Axios.get(global.config.api + '/igstalk?apikey=' + global.config.apikey + '&username=' + username)
            .then(({
                data
            }) => {
                data = data.result
                let tmt = `*Instagram Stalk*\n\n`
                tmt += `*ID :* ${data.id}\n`
                tmt += `*Username :* ${data.username}\n`
                tmt += `*Fullname :* ${data.fullName}\n`
                tmt += `*Followers :* ${data.subscribersCount}\n`
                tmt += `*Following :* ${data.subscribtions}\n`
                tmt += `*Private :* ${data.isPrivate ? 'Ya' : 'Tidak'}\n`
                tmt += `*Verified :* ${data.isVerified ? 'Ya' : 'Tidak'}\n`
                tmt += `*Bisnis :* ${data.isBusinessAccount ? 'Ya' : 'Tidak'}\n`
                tmt += `*Highlight :* ${data.highlightCount}\n`
                tmt += `*Post Count :* ${data.postsCount}\n`
                tmt += `*Bio :* \n${data.biography}`
                resolve({
                    image: data.profilePicHD,
                    caption: tmt
                })
            })
            .catch(reject)
    })
}

function upload(buf) {
    return new Promise(async (resolve, reject) => {
        const name = Date.now()
        const form = new FormData()

        if (typeof buf == 'string' && isUrl(buf)) {
            let res = await fetch(buf)
            if (res.status !== 200) throw await res.text()
            buf = await res.buffer()
        }

        let type = await fileType(buf)

        let input = path.join(tmp, +name + '.' + type.ext)
        await fs.promises.writeFile(input, buf)

        form.append('apikey', global.config.apikey)
        form.append('fileToUpload', fs.createReadStream(input))
        Axios({
                method: "POST",
                url: "https://justaqul.xyz/upload",
                data: form,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${form._boundary}`
                }
            })
            .then(({
                data
            }) => {
                if (fs.existsSync(input)) fs.unlinkSync(input)
                resolve(data.result)
            })
            .catch(err => {
                if (fs.existsSync(input)) fs.unlinkSync(input)
                reject(err)
            })
    })
}

module.exports = {
    ytmp4,
    ytmp3,
    tiktok,
    pinterest,
    igstalk,
    upload
}