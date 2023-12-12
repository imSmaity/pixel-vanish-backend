const https = require('https');
const fs = require('fs');
const { API_KEY } = require('../../config');

function removeBackground(imagePath, savePath) {
  return new Promise((resolve, reject) => {
    const boundary = '--------------------------' + Date.now().toString(16);

    const postOptions = {
      hostname: 'sdk.photoroom.com',
      path: '/v1/segment',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-API-Key': API_KEY,
      },
    };

    const req = https.request(postOptions, (res) => {
      // Check if the response is an image
      const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(
        res.headers['content-type'],
      );

      if (!isImage) {
        let errorData = '';
        res.on('data', (chunk) => (errorData += chunk));
        res.on('end', () =>
          reject(
            new Error(`Expected an image response, but received: ${errorData}`),
          ),
        );
        return;
      }

      // Create a write stream to save the image
      const fileStream = fs.createWriteStream(savePath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        resolve(`Image saved to ${savePath}`);
      });

      fileStream.on('error', (error) => {
        reject(new Error(`Failed to save the image: ${error.message}`));
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Write form data
    req.write(`--${boundary}\r\n`);
    req.write(
      `Content-Disposition: form-data; name="image_file"; filename="${imagePath
        .split('/')
        .pop()}"\r\n`,
    );
    req.write('Content-Type: image/jpeg\r\n\r\n'); // assuming JPEG, adjust if another format is used

    const uploadStream = fs.createReadStream(imagePath);
    uploadStream.on('end', () => {
      req.write('\r\n');
      req.write(`--${boundary}--\r\n`);
      req.end();
    });

    uploadStream.pipe(req, { end: false });
  });
}

const getImage = async (req, res) => {
  const { base64String, fileName } = req.body;
  const savePath = `output_${fileName}`;

  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  fs.writeFile(fileName, buffer, (err) => {
    if (err) {
      console.error('Error writing the image:', err);
    } else {
      console.log('Image written successfully to', fileName);
      removeBackground(fileName, savePath)
        .then((message) => {
          console.log(message);
          fs.readFile(savePath, (err, data) => {
            if (err) {
              console.error('Error reading the image:', err);
              res.status(500).send('Internal Server Error');
            } else {
              let bitmap = fs.readFileSync(savePath);
              const base64Image = new Buffer(bitmap).toString('base64');

              fs.unlink(fileName, (unlinkErr) => {
                if (unlinkErr) {
                  console.error('Error deleting the image:', unlinkErr);
                  return res.status(400).send({ success: false });
                } else {
                  console.log('Image deleted successfully:', fileName);
                  fs.unlink(savePath, (unlinkErr) => {
                    if (unlinkErr) {
                      console.error('Error deleting the image:', unlinkErr);
                      return res.status(400).send({ success: false });
                    } else {
                      console.log('Image deleted successfully:', savePath);

                      // Send the image data as the response
                      res.status(200).send({ success: true, base64Image });
                    }
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Error:', error);
          return res.status(400).send({ success: false });
        });
    }
  });
};

module.exports = getImage;
