const fetch = require('node-fetch');
const ffmpeg = require("fluent-ffmpeg");
const Exif = require("./exif");
const exif = new Exif();
const path = require('path');
const {
    exec
} = require("child_process");
const fs = require('fs');
const cheerio = require('cheerio');
const FormData = require('form-data')
const {
    default: Axios
} = require('axios');

const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}
const tmp = path.join(__dirname, '../tmp')

function webp2gifFile(path) {
    return new Promise((resolve, reject) => {
        const bodyForm = new FormData()
        bodyForm.append('new-image-url', '')
        bodyForm.append('new-image', fs.createReadStream(path))
        Axios({
            method: 'post',
            url: 'https://s6.ezgif.com/webp-to-mp4',
            data: bodyForm,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${bodyForm._boundary}`
            }
        }).then(({
            data
        }) => {
            const bodyFormThen = new FormData()
            const $ = cheerio.load(data)
            const file = $('input[name="file"]').attr('value')
            const token = $('input[name="token"]').attr('value')
            const convert = $('input[name="file"]').attr('value')
            const gotdata = {
                file: file,
                token: token,
                convert: convert
            }
            bodyFormThen.append('file', gotdata.file)
            bodyFormThen.append('token', gotdata.token)
            bodyFormThen.append('convert', gotdata.convert)
            Axios({
                method: 'post',
                url: 'https://ezgif.com/webp-to-mp4/' + gotdata.file,
                data: bodyFormThen,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
                }
            }).then(({
                data
            }) => {
                const $ = cheerio.load(data)
                const result = 'https:' + $('div#output > p.outfile > video > source').attr('src')
                resolve({
                    status: true,
                    message: "Created By MRHRTZ",
                    result: result
                })
            }).catch(reject)
        }).catch(reject)
    })
}

function toSticker(buf, packName, authName) {
    return new Promise(async (resolve, reject) => {
        try {
            let name = Date.now()

            if (!packName) packName = global.db.config.packName
            if (!authName) authName = global.db.config.authName

            exif.create(packName, authName, name);

            if (typeof buf == 'string' && isUrl(buf)) {
                let res = await fetch(buf)
                if (res.status !== 200) throw await res.text()
                buf = await res.buffer()
            }

            let input = path.join(tmp, +name + '.jpeg')
            let exifnya = './tmp/' + name + '.exif'
            await fs.promises.writeFile(input, buf)
            let output = path.join(tmp, +name + '.webp')

            await ffmpeg(input)
                .input(input)
                .on('start', function (cmd) {
                    console.log(`Create Sticker`)
                })
                .on('error', function (err) {
                    console.log(`Error : ${err}`)
                    if (fs.existsSync(input)) fs.unlinkSync(input)
                    if (fs.existsSync(output)) fs.unlinkSync(output)
                    if (fs.existsSync(exifnya)) fs.unlinkSync(exifnya)
                    reject(err)
                })
                .on('end', function () {
                    console.log('Finish')
                    exec(`webpmux -set exif ./tmp/${name}.exif ./tmp/${name}.webp -o ./tmp/${name}.webp`, async (error) => {
                        if (error) {
                            console.log(error)
                            let hasil = fs.readFileSync(output)
                            if (fs.existsSync(input)) fs.unlinkSync(input)
                            if (fs.existsSync(output)) fs.unlinkSync(output)
                            if (fs.existsSync(exifnya)) fs.unlinkSync(exifnya)
                            return resolve(hasil)
                        }
                        let hasil = fs.readFileSync(output)
                        fs.unlinkSync(exifnya)
                        fs.unlinkSync(input)
                        fs.unlinkSync(output)
                        resolve(hasil)
                    })
                })
                .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                .toFormat('webp')
                .save(output)
        } catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

function webpToPng(buf) {
    return new Promise(async (resolve, reject) => {
        try {
            let name = Date.now()

            if (typeof buf == 'string' && isUrl(buf)) {
                let res = await fetch(buf)
                if (res.status !== 200) throw await res.text()
                buf = await res.buffer()
            }

            let input = path.join(tmp, +name + '.webp')
            await fs.promises.writeFile(input, buf)
            let output = path.join(tmp, +name + '.png')
            exec(`ffmpeg -i ./tmp/${name}.webp ./tmp/${name}.png`, (err) => {
                if (err) {
                    console.log(err)
                    if (fs.existsSync(input)) fs.unlinkSync(input)
                    if (fs.existsSync(output)) fs.unlinkSync(output)
                    return reject(err)
                }
                let hasil = fs.readFileSync(output)
                fs.unlinkSync(input)
                fs.unlinkSync(output)
                resolve(hasil)
            })
        } catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

function webpToMp4(buf) {
    return new Promise(async (resolve, reject) => {
        try {
            let name = Date.now()

            if (typeof buf == 'string' && isUrl(buf)) {
                let res = await fetch(buf)
                if (res.status !== 200) throw await res.text()
                buf = await res.buffer()
            }

            let input = path.join(tmp, +name + '.webp')
            await fs.promises.writeFile(input, buf)

            webp2gifFile(input)
                .then((res) => {
                    fs.unlinkSync(input)
                    resolve(res.result)
                })
                .catch(reject)
        } catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

function toAudio(buf) {
    return new Promise(async (resolve, reject) => {
        try {
            let name = Date.now()

            if (typeof buf == 'string' && isUrl(buf)) {
                let res = await fetch(buf)
                if (res.status !== 200) throw await res.text()
                buf = await res.buffer()
            }

            let input = path.join(tmp, +name + '.mp4')
            await fs.promises.writeFile(input, buf)
            let output = path.join(tmp, +name + '.mp3')

            await ffmpeg(input)
                .format('mp3')
                .on('start', function (cmd) {
                    console.log(`Create Mp3`)
                })
                .on('error', function (err) {
                    console.log(`Error Convert`)
                    if (fs.existsSync(input)) fs.unlinkSync(input)
                    if (fs.existsSync(output)) fs.unlinkSync(output)
                    resolve(buf)
                })
                .on('end', function () {
                    console.log('Finish')
                    let hasil = fs.readFileSync(output)
                    if (fs.existsSync(input)) fs.unlinkSync(input)
                    if (fs.existsSync(output)) fs.unlinkSync(output)
                    resolve(hasil)
                })
                .save(output)
        } catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

module.exports = {
    toSticker,
    webpToPng,
    webpToMp4,
    toAudio
}