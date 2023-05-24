const express = require("express")
const ytdl = require("ytdl-core")
const ytsr = require("ytsr")
const https = require("https")
const fs = require("fs")
const { spawn } = require("child_process");
const { readFileSync } = require("fs");
async function Main() {
    const video_url = await Search();
    const playback_v = await GetVideoPlayback(video_url)
    const pre_a = await preloadPlaybackA(video_url)
    console.clear()
    const app = express()
    const options = {
        key: readFileSync('./certs/private.key'),
        cert: fs.readFileSync('./certs/certificate.crt'),
    }
    app.get("/video", async (req, res) => {
        const ffmpeg = spawn('ffmpeg', [
            '-i', '-',
            '-i', playback_v,
            '-map', '0',
            '-map', '1',
            '-c:v', 'copy',
            '-bufsize','100M',
            '-f', 'mp4',
            '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
            '-loglevel', 'debug',
            'pipe:1' // Output to pipe
        ]);
        ffmpeg.stdin.write(pre_a)
        ffmpeg.stdin.end()
        ffmpeg.stderr.on("data", (data) => {
            console.error("\u001B[38;5;2m"+data.toString()+"\u001B[0m");
        });

        ffmpeg.stdout.pipe(res)
        let chunks = [];
        ffmpeg.stdout.on("data", (chunk) => {
            chunks.push(chunk)
        })
        ffmpeg.stdout.on('error', (error) => {
            console.log(error)
        })
        ffmpeg.stdout.on("close", (code) => {
            if (code !== 0) {
                console.log("\u001B[38;5;99mRender finshed\u001B[0m")
            } else {
                let buffer = Buffer.concat(chunks)
                const videosize = buffer.length
                if (!range) {
                    console.log("Range is required")

                }
                const chunk = 2048;
                const start = Number(range.replace(/\D/g, ""))
                const end = Math.min(start + chunk, videosize - 1)
                const ContentLength = end - start + 1;
                const headers = {
                    "Content-Range": `bytes ${start}-${end}/${videosize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": ContentLength,
                    "Content-Type": "video/mp4",

                }
                res.writeHead(206, headers)
            }
        })

    })
    const server = https.createServer(options, app)

    server.listen(3000, () => {
        const host = server.address().address
        const port = server.address().port
        console.log(`Server is running at https://${host}:${port}/video`)
    })
}
async function Search() {
    const input = process.argv[2];
    const video_url = (await ytsr(input, { pages: 1 })).items[0].url
    return video_url
}

async function GetVideoPlayback(video_url) {
    const info = await ytdl.getInfo(video_url)
    const playback = ytdl.chooseFormat(info.formats, { quality: "highestvideo" }).url
    return playback
}

async function preloadPlaybackA(url) {
    const process = new Promise((resolve, reject) => {
        const ytDlp = spawn("yt-dlp", [
            '-f', 'bestaudio',
            `${url}`,
            '-o', '-',
        ])

        let chunks = [];
        ytDlp.stderr.on('data', (errr) => {
            console.log("\u001B[38;5;1m"+errr.toString()+"\u001B[0m")
        })
        ytDlp.stdout.on('data', (chunk) => {
            chunks.push(chunk)
        })
        ytDlp.on('close', (code) => {
            if (code === 0) {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            } else {
                reject(console.error(`yt-dlp process exited with code ${code}`));
            }
        })
    })
    return process
}

Main()