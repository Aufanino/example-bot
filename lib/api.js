const {
    reject
} = require('async');
const {
    default: Axios
} = require('axios');
const api = 'https://api.justaqul.xyz';
const moment = require('moment-timezone');

function ytmp4(url, quality) {
    return new Promise((resolve, reject) => {
        if (!quality) quality = '360p'
        Axios.get(api + '/ytmp4?apikey=' + global.config.apikey + '&url=' + url + '&quality=' + quality)
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
            .catch(({
                data
            }) => {
                reject(data.message)
            })
    })
}

function ytmp3(url) {
    return new Promise((resolve, reject) => {
        Axios.get(api + '/ytmp3?apikey=' + global.config.apikey + '&url=' + url)
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
            .catch(({
                data
            }) => {
                reject(data.message)
            })
    })
}

function tiktok(url) {
    return new Promise((resolve, reject) => {
        Axios.get(api + '/tiktok?apikey=' + global.config.apikey + '&url=' + url)
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
            .catch(({
                data
            }) => {
                reject(data.message)
            })
    })
}

function pinterest(query) {
    return new Promise((resolve, reject) => {
        Axios.get(api + '/pinterest?apikey=' + global.config.apikey + '&q=' + encodeURIComponent(query))
            .then(({
                data
            }) => {
                resolve(data.image)
            })
            .catch(reject)
    })
}
module.exports = {
    ytmp4,
    ytmp3,
    tiktok,
    pinterest
}