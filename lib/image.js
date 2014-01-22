
/*
PDFImage - embeds images in PDF documents
By Devon Govett
*/


(function() {
  var Data, JPEG, PDFImage, PNG, fs;

  fs = require('fs');

  Data = require('./data');

  JPEG = require('./image/jpeg');

  PNG = require('./image/png');

  PDFImage = (function() {

    function PDFImage() {}

    PDFImage.open = function(filenameOrBuffer) {
      var data, firstByte;
      if (typeof filenameOrBuffer === 'object' && filenameOrBuffer instanceof Buffer) {
        this.contents = filenameOrBuffer;
      } else {
        this.contents = fs.readFileSync(filenameOrBuffer);
        if (!this.contents) {
          return;
        }
      }
      this.data = new Data(this.contents);
      this.filter = null;
      data = this.data;
      firstByte = data.byteAt(0);
      if (firstByte === 0xFF && data.byteAt(1) === 0xD8) {
        return new JPEG(data);
      } else if (firstByte === 0x89 && data.stringAt(1, 3) === "PNG") {
        return new PNG(data);
      } else {
        throw new Error('Unknown image format.');
      }
    };

    return PDFImage;

  })();

  module.exports = PDFImage;

}).call(this);