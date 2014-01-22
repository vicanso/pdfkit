(function() {
  var Data, JPEG, fs,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  Data = '../data';

  JPEG = (function() {

    function JPEG(data) {
      var channels, len, marker, markers;
      this.data = data;
      len = data.length;
      if (data.readUInt16() !== 0xFFD8) {
        throw "SOI not found in JPEG";
      }
      markers = [0xFFC0, 0xFFC1, 0xFFC2, 0xFFC3, 0xFFC5, 0xFFC6, 0xFFC7, 0xFFC8, 0xFFC9, 0xFFCA, 0xFFCB, 0xFFCC, 0xFFCD, 0xFFCE, 0xFFCF];
      while (data.pos < len) {
        marker = data.readUInt16();
        if (__indexOf.call(markers, marker) >= 0) {
          break;
        }
        data.pos += data.readUInt16();
      }
      if (__indexOf.call(markers, marker) < 0) {
        throw "Invalid JPEG.";
      }
      data.pos += 2;
      this.bits = data.readByte();
      this.height = data.readShort();
      this.width = data.readShort();
      channels = data.readByte();
      this.colorSpace = (function() {
        switch (channels) {
          case 1:
            return 'DeviceGray';
          case 3:
            return 'DeviceRGB';
          case 4:
            return 'DeviceCMYK';
        }
      })();
      this.imgData = this.data;
    }

    JPEG.prototype.object = function(document, fn) {
      var obj;
      obj = document.ref({
        Type: 'XObject',
        Subtype: 'Image',
        BitsPerComponent: this.bits,
        Width: this.width,
        Height: this.height,
        Length: this.data.length,
        ColorSpace: this.colorSpace,
        Filter: 'DCTDecode'
      });
      if (this.colorSpace === 'DeviceCMYK') {
        obj.data['Decode'] = [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0];
      }
      obj.add(this.data.data);
      return fn(obj);
    };

    return JPEG;

  })();

  module.exports = JPEG;

}).call(this);