const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/video', function (req, res) {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send('Requires Range Header');
  }

  const videoPath = './nevergonna.mp4';
  const videoSize = fs.statSync(videoPath).size;

  // parse Range
  // Example: "bytes=32324-"
  const chunkSize = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + chunkSize, videoSize - 1);

  const contentLength = end - start + 1;
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };
  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, { start, end });

  videoStream.on('data', (chunk) => {
    console.log(`Received ${chunk.length} bytes of data.`);
  });

  videoStream.on('end', () => {
    console.log('Finished reading file.');
  });

  videoStream.on('error', (err) => {
    console.error('Error reading file:', err);
  });

  videoStream.pipe(res);
});

app.listen(8000, function () {
  console.log('Listening on port 8000!');
});
