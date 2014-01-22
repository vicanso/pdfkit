(function() {
  var EventEmitter, LineWrapper, WORD_RE,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  WORD_RE = /([^ ,\/!.?:;\-\n]*[ ,\/!.?:;\-]*)|\n/g;

  EventEmitter = require('events').EventEmitter;

  LineWrapper = (function(_super) {

    __extends(LineWrapper, _super);

    function LineWrapper(document) {
      var _this = this;
      this.document = document;
      this.on('firstLine', function(options) {
        var indent;
        indent = options.indent || 0;
        _this.document.x += indent;
        options.lineWidth -= indent;
        return _this.once('line', function() {
          _this.document.x -= indent;
          return options.lineWidth += indent;
        });
      });
      this.on('lastLine', function(options) {
        var align;
        align = options.align;
        if (align === 'justify') {
          options.align = 'left';
        }
        return _this.once('line', function() {
          _this.document.y += options.paragraphGap || 0;
          return options.align = align;
        });
      });
    }

    LineWrapper.prototype.wrap = function(paragraphs, options) {
      var buffer, charSpacing, cutChineseWord, i, indent, len, nextY, spaceLeft, text, w, wc, wi, width, word, wordSpacing, wordWidths, words, _i, _j, _len, _len1, _ref, _ref1;
      cutChineseWord = function(wordsList) {
        var cutWords, result, words, _i, _len;
        cutWords = function(words) {
          var ch, code, cutResult, str, _i, _len;
          str = '';
          cutResult = [];
          for (_i = 0, _len = words.length; _i < _len; _i++) {
            ch = words[_i];
            code = ch.charCodeAt(0);
            if (code < 0xff) {
              str += ch;
            } else {
              if (str) {
                cutResult.push(str);
                str = '';
              }
              cutResult.push(ch);
            }
          }
          if (str) {
            cutResult.push(str);
          }
          return cutResult;
        };
        result = [];
        for (_i = 0, _len = wordsList.length; _i < _len; _i++) {
          words = wordsList[_i];
          result = result.concat(cutWords(words));
        }
        return result;
      };
      width = this.document.widthOfString.bind(this.document);
      indent = options.indent || 0;
      charSpacing = options.characterSpacing || 0;
      wordSpacing = options.wordSpacing === 0;
      this.columns = options.columns || 1;
      this.columnGap = (_ref = options.columnGap) != null ? _ref : 18;
      this.lineWidth = (options.width - (this.columnGap * (this.columns - 1))) / this.columns;
      this.startY = this.document.y;
      this.column = 1;
      this.maxY = this.startY + options.height;
      nextY = this.document.y + this.document.currentLineHeight(true);
      if (this.document.y > this.maxY || nextY > this.maxY) {
        this.nextSection();
      }
      wordWidths = {};
      this.emit('sectionStart', options, this);
      for (i = _i = 0, _len = paragraphs.length; _i < _len; i = ++_i) {
        text = paragraphs[i];
        this.emit('firstLine', options, this);
        words = text.match(WORD_RE) || [text];
        words = cutChineseWord(words);
        spaceLeft = this.lineWidth - indent;
        options.lineWidth = spaceLeft;
        len = words.length;
        buffer = '';
        wc = 0;
        for (wi = _j = 0, _len1 = words.length; _j < _len1; wi = ++_j) {
          word = words[wi];
          w = (_ref1 = wordWidths[word]) != null ? _ref1 : wordWidths[word] = width(word, options) + charSpacing + wordSpacing;
          if (w > spaceLeft || word === '\n') {
            options.textWidth = width(buffer.trim(), options) + wordSpacing * (wc - 1);
            this.emit('line', buffer.trim(), options, this);
            if (this.document.y > this.maxY) {
              this.nextSection();
            }
            spaceLeft = this.lineWidth - w;
            buffer = word === '\n' ? '' : word;
            wc = 1;
          } else {
            spaceLeft -= w;
            buffer += word;
            wc++;
          }
        }
        this.lastLine = true;
        this.emit('lastLine', options, this);
        options.textWidth = width(buffer.trim(), options) + wordSpacing * (wc - 1);
        this.emit('line', buffer.trim(), options, this);
        nextY = this.document.y + this.document.currentLineHeight(true);
        if (i < paragraphs.length - 1 && nextY > this.maxY) {
          this.nextSection();
        }
      }
      return this.emit('sectionEnd', options, this);
    };

    LineWrapper.prototype.nextSection = function(options) {
      this.emit('sectionEnd', options, this);
      if (++this.column > this.columns) {
        this.document.addPage();
        this.column = 1;
        this.startY = this.document.page.margins.top;
        this.maxY = this.document.page.maxY();
        this.emit('pageBreak', options, this);
      } else {
        this.document.x += this.lineWidth + this.columnGap;
        this.document.y = this.startY;
        this.emit('columnBreak', options, this);
      }
      return this.emit('sectionStart', options, this);
    };

    return LineWrapper;

  })(EventEmitter);

  module.exports = LineWrapper;

}).call(this);
