<p align="center">
<img src="https://justaqul.xyz/assets/img/profile/c507c50fcedc1ab55a9e8e436a2081d5.jpg" alt="EXAMPLE BOT" width="128" height="128"/>
</p>
<p align="center">
<a href="#"><img title="EXAMPLE BOT" src="https://img.shields.io/badge/EXAMPLE BOT-green?colorA=%23ff0000&colorB=%23017e40&style=for-the-badge"></a>
</p>
<p align="center">
<a href="https://github.com/zennn08"><img title="Author" src="https://img.shields.io/badge/Author-zennn08-red.svg?style=for-the-badge&logo=github"></a>
</p>
<p align="center">
<a href="https://github.com/zennn08/followers"><img title="Followers" src="https://img.shields.io/github/followers/zennn08?color=blue&style=flat-square"></a>
<a href="https://github.com/zennn08/megumikato2/stargazers/"><img title="Stars" src="https://img.shields.io/github/stars/zennn08/example-bot?color=red&style=flat-square"></a>
<a href="https://github.com/zennn08/megumikato2/network/members"><img title="Forks" src="https://img.shields.io/github/forks/zennn08/example-bot?color=red&style=flat-square"></a>
<a href="https://github.com/zennn08/megumikato2/watchers"><img title="Watching" src="https://img.shields.io/github/watchers/zennn08/example-bot?label=Watchers&color=blue&style=flat-square"></a>
</p>

<p align="center">
  <a href="https://github.com/zennn08/example-bot#information">Information</a> •
  <a href="https://github.com/zennn08/example-bot#requirements">Requirements</a> •
  <a href="https://github.com/zennn08/example-bot#instalasi">Installation</a> •
  <a href="https://github.com/zennn08/example-bot#thanks-to">Thanks to</a>
</p>
</div>


---


# Information
This script is open to anyone! If you want to add commands, please contribute / pull request! Buying and selling scripts is prohibited!

# Requirements
* [Node.js](https://nodejs.org/en/)
* [Git](https://git-scm.com/downloads)
* [FFmpeg](https://github.com/BtbN/FFmpeg-Builds/releases/download/autobuild-2020-12-08-13-03/ffmpeg-n4.3.1-26-gca55240b8c-win64-gpl-4.3.zip) (for sticker command)
* [Libwebp](https://developers.google.com/speed/webp/download) (for sticker wm)
* Any text editor

# Instalasi
## For Windows
```bash
git clone https://github.com/zennn08/example-bot.git
cd example-bot
npm install
node main
```
## For Termux
```bash
apt update && apt upgrade
pkg install nodejs git ffmpeg libwebp
git clone https://github.com/zennn08/example-bot.git
cd example-bot
npm install
```

## For VPS
```bash
apt install nodejs git ffmpeg libwebp
git clone https://github.com/zennn08/example-bot.git
cd example-bot
npm install
```

## Edit file
- Change packName Sticker on [this section](https://github.com/zennn08/example-bot/blob/47d703284ad198befe5b470fd4418df4a1e07a69/config.json#L2)
- Change authorName Sticker on [this section](https://github.com/zennn08/example-bot/blob/47d703284ad198befe5b470fd4418df4a1e07a69/config.json#L3)
- Change ownerNumber on [this section](https://github.com/zennn08/example-bot/blob/47d703284ad198befe5b470fd4418df4a1e07a69/config.json#L4)
- Change Apikey on [this section](https://github.com/zennn08/example-bot/blob/47d703284ad198befe5b470fd4418df4a1e07a69/config.json#L9) and you buy / get apikey on [this section](https://justaqul.xyz)


## Installing the FFmpeg for Windows
* Unduh salah satu versi FFmpeg yang tersedia dengan mengklik [di sini](https://www.gyan.dev/ffmpeg/builds/).
* Extract file ke `C:\` path.
* Ganti nama folder yang telah di-extract menjadi `ffmpeg`.
* Run Command Prompt as Administrator.
* Jalankan perintah berikut::
```cmd
> setx /m PATH "C:\ffmpeg\bin;%PATH%"
```
Jika berhasil, akan memberikanmu pesan seperti: `SUCCESS: specified value was saved`.
* Sekarang setelah Anda menginstal FFmpeg, verifikasi bahwa itu berhasil dengan menjalankan perintah ini untuk melihat versi:
```cmd
> ffmpeg -version
```


## Installing the libwebp for Windows
* Unduh salah satu versi libwebp yang tersedia dengan mengklik [di sini](https://developers.google.com/speed/webp/download).
* Extract file ke `C:\` path.
* Ganti nama folder yang telah di-extract menjadi `libwebp`.
* Run Command Prompt as Administrator.
* Jalankan perintah berikut::
```cmd
setx /m PATH "C:\libwebp\bin;%PATH%"
```
Jika berhasil, akan memberikanmu pesan seperti: `SUCCESS: specified value was saved`.
* Sekarang setelah Anda menginstal libwebp, verifikasi bahwa itu berhasil dengan menjalankan perintah ini untuk melihat versi:
```cmd
webpmux -version
```

## Donate
- [Saweria](https://saweria.co/aqulzz)
- [Trakteer](https://trakteer.id/aqulzz)

# Thanks to
* [`Baileys`](https://github.com/adiwajshing/Baileys)
* [`Xinz-Team`](https://github.com/Xinz-Team)
* [`Nurutomo`](https://github.com/Nurutomo)
* [`MhankBarBar`](https://github.com/MhankBarBar)
* [`MRHRTZ`](https://github.com/MRHRTZ)
* [`Mamet`](https://github.com/mamet8/)
* [`SlavyanDesu`](https://github.com/SlavyanDesu)
* [`VideFrelan`](https://github.com/VideFrelan)
* [`TobyG74`](https://github.com/TobyG74)