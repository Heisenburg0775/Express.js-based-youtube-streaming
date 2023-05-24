## **Additional Tool Required**

## [FFmpeg](https://ffmpeg.org/)

## [Python(for pip)](https://www.python.org/)

## yt-dlp

## **Installation**

## Installing node modules

```bash
npm install
```

## [Download FFmpeg](https://ffmpeg.org/)

## Installing yt-dlp

```bash
pip install yt-dlp
```

## **Generate OpenSSL key and certificate**

## Generate a self signed key and certificate for https

## For key

```bash
openssl genrsa -out private.key 2048

```

## For Certificate

```bash
openssl req -new -x509 -sha256 -key private.key -out certificate.crt -days 365
```

## After generate both key and certificate make a folder called `certs` in same folder of this repo and copy-paste `key` and `certificate` there.

## **Executing code**

```bash
node . "<youtube query or link>"
```

## Server must be running at _https://localhost:3000_
