import http from 'http';
import fs from 'fs';
import path from 'path';

const getHttpReqCallback = (imgSrc, dirName, index) => {
    const fileName = `${index}-${path.basename(imgSrc)}`;

    return (res) => {
        // console.log("request: " + imgSrc + " return status: " + res.statusCode);
        const contentLength = parseInt(res.headers['content-length'], 10);
        const fileBuff = [];
        res.on('data', (chunk) => {
            const buffer = new Buffer(chunk);
            fileBuff.push(buffer);
        });
        res.on('end', () => {
            // console.log("end downloading " + imgSrc);
            if (isNaN(contentLength)) {
                // console.log(imgSrc + " content length error");
                return;
            }
            const totalBuff = Buffer.concat(fileBuff);
            // console.log("totalBuff.length = " + totalBuff.length + " " + "contentLength = " + contentLength);
            if (totalBuff.length < contentLength) {
                // console.log(imgSrc + " download error, try again");
                startDownloadTask(imgSrc, dirName, index);
                return;
            }
            fs.appendFile(`${dirName}/${fileName}`, totalBuff);
        });
    };
};

const startDownloadTask = (imgSrc, dirName, index) => {
    // console.log("start downloading " + imgSrc);
    const req = http.request(imgSrc, getHttpReqCallback(imgSrc, dirName, index));
    req.on('error', () => {
        // console.log("request " + imgSrc + " error, try again");
        startDownloadTask(imgSrc, dirName, index);
    });
    req.end();
};

export default startDownloadTask;
