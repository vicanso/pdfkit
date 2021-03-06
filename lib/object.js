
/*
PDFObject - converts JavaScript types into their corrisponding PDF types.
By Devon Govett
*/


(function() {
  var PDFObject, PDFReference;

  PDFObject = (function() {
    var pad, swapBytes;

    function PDFObject() {}

    pad = function(str, length) {
      return (Array(length + 1).join('0') + str).slice(-length);
    };

    PDFObject.convert = function(object) {
      var e, items, key, out, val;
      if (Array.isArray(object)) {
        items = ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = object.length; _i < _len; _i++) {
            e = object[_i];
            _results.push(PDFObject.convert(e));
          }
          return _results;
        })()).join(' ');
        return '[' + items + ']';
      } else if (typeof object === 'string') {
        return '/' + object;
      } else if (object != null ? object.isString : void 0) {
        return '(' + object + ')';
      } else if (object instanceof PDFReference) {
        return object.toString();
      } else if (object instanceof Date) {
        return '(D:' + pad(object.getUTCFullYear(), 4) + pad(object.getUTCMonth(), 2) + pad(object.getUTCDate(), 2) + pad(object.getUTCHours(), 2) + pad(object.getUTCMinutes(), 2) + pad(object.getUTCSeconds(), 2) + 'Z)';
      } else if ({}.toString.call(object) === '[object Object]') {
        out = ['<<'];
        for (key in object) {
          val = object[key];
          out.push('/' + key + ' ' + PDFObject.convert(val));
        }
        out.push('>>');
        return out.join('\n');
      } else {
        return '' + object;
      }
    };

    swapBytes = function(buff) {
      var a, i, l, _i, _ref;
      l = buff.length;
      if (l & 0x01) {
        throw new Error("Buffer length must be even");
      } else {
        for (i = _i = 0, _ref = l - 1; _i < _ref; i = _i += 2) {
          a = buff[i];
          buff[i] = buff[i + 1];
          buff[i + 1] = a;
        }
      }
      return buff;
    };

    PDFObject.s = function(string, swap) {
      if (swap == null) {
        swap = false;
      }
      string = string.replace(/\\/g, '\\\\\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      if (swap) {
        string = swapBytes(new Buffer('\ufeff' + string, 'ucs-2')).toString('binary');
      }
      return {
        isString: true,
        toString: function() {
          return string;
        }
      };
    };

    return PDFObject;

  })();

  module.exports = PDFObject;

  PDFReference = require('./reference');

}).call(this);
