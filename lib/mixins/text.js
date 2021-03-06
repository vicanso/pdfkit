(function() {
  var LineWrapper, WORD_RE;

  WORD_RE = /([^ ,\/!.?:;\-\n]*[ ,\/!.?:;\-]*)|\n/g;

  LineWrapper = require('../line_wrapper');

  module.exports = {
    initText: function() {
      this.x = 0;
      this.y = 0;
      this._lineGap = 0;
      return this._textState = {
        mode: 0,
        wordSpacing: 0,
        characterSpacing: 0
      };
    },
    lineGap: function(_lineGap) {
      this._lineGap = _lineGap;
      return this;
    },
    moveDown: function(lines) {
      if (lines == null) {
        lines = 1;
      }
      this.y += this.currentLineHeight(true) * lines + this._lineGap;
      return this;
    },
    moveUp: function(lines) {
      if (lines == null) {
        lines = 1;
      }
      this.y -= this.currentLineHeight(true) * lines + this._lineGap;
      return this;
    },
    text: function(text, x, y, options) {
      var line, paragraphs, wrapper, _i, _len;
      options = this._initOptions(x, y, options);
      text = '' + text;
      if (options.wordSpacing) {
        text = text.replace(/\s{2,}/g, ' ');
      }
      paragraphs = text.split('\n');
      if (options.width) {
        wrapper = new LineWrapper(this);
        wrapper.on('line', this._line.bind(this));
        wrapper.wrap(paragraphs, options);
      } else {
        for (_i = 0, _len = paragraphs.length; _i < _len; _i++) {
          line = paragraphs[_i];
          this._line(line, options);
        }
      }
      return this;
    },
    list: function(list, x, y, options, wrapper) {
      var flatten, i, indent, itemIndent, items, level, levels, r,
        _this = this;
      options = this._initOptions(x, y, options);
      r = Math.round((this._font.ascender / 1000 * this._fontSize) / 3);
      indent = options.textIndent || r * 5;
      itemIndent = options.bulletIndent || r * 8;
      level = 1;
      items = [];
      levels = [];
      flatten = function(list) {
        var i, item, _i, _len, _results;
        _results = [];
        for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
          item = list[i];
          if (Array.isArray(item)) {
            level++;
            flatten(item);
            _results.push(level--);
          } else {
            items.push(item);
            _results.push(levels.push(level));
          }
        }
        return _results;
      };
      flatten(list);
      wrapper = new LineWrapper(this);
      wrapper.on('line', this._line.bind(this));
      level = 1;
      i = 0;
      wrapper.on('firstLine', function() {
        var diff, l;
        if ((l = levels[i++]) !== level) {
          diff = itemIndent * (l - level);
          _this.x += diff;
          wrapper.lineWidth -= diff;
          level = l;
        }
        _this.circle(_this.x - indent + r, _this.y + r + (r / 2), r);
        return _this.fill();
      });
      wrapper.on('sectionStart', function() {
        var pos;
        pos = indent + itemIndent * (level - 1);
        _this.x += pos;
        return wrapper.lineWidth -= pos;
      });
      wrapper.on('sectionEnd', function() {
        var pos;
        pos = indent + itemIndent * (level - 1);
        _this.x -= pos;
        return wrapper.lineWidth += pos;
      });
      wrapper.wrap(items, options);
      this.x -= indent;
      return this;
    },
    _initOptions: function(x, y, options) {
      var margins, _ref, _ref1, _ref2;
      if (x == null) {
        x = {};
      }
      if (options == null) {
        options = {};
      }
      if (typeof x === 'object') {
        options = x;
        x = null;
      }
      options = (function() {
        var k, opts, v;
        opts = {};
        for (k in options) {
          v = options[k];
          opts[k] = v;
        }
        return opts;
      })();
      if (x != null) {
        this.x = x;
      }
      if (y != null) {
        this.y = y;
      }
      if (options.lineBreak !== false) {
        margins = this.page.margins;
        if ((_ref = options.width) == null) {
          options.width = this.page.width - this.x - margins.right;
        }
        if ((_ref1 = options.height) == null) {
          options.height = this.page.height - this.y - margins.bottom;
        }
      }
      options.columns || (options.columns = 0);
      if ((_ref2 = options.columnGap) == null) {
        options.columnGap = 18;
      }
      return options;
    },
    widthOfString: function(string, options) {
      if (options == null) {
        options = {};
      }
      return this._font.widthOfString(string, this._fontSize) + (options.characterSpacing || 0) * (string.length - 1);
    },
    _line: function(text, options, wrapper) {
      var lineGap;
      if (options == null) {
        options = {};
      }
      this._fragment(text, this.x, this.y, options);
      lineGap = options.lineGap || this._lineGap || 0;
      if (!wrapper || (wrapper.lastLine && options.lineBreak === false)) {
        return this.x += this.widthOfString(text);
      } else {
        return this.y += this.currentLineHeight(true) + lineGap;
      }
    },
    _fragment: function(text, x, y, options) {
      var align, characterSpacing, i, mode, spaceWidth, state, textWidth, wordSpacing, words, _base, _name, _ref;
      text = '' + text;
      if (text.length === 0) {
        return;
      }
      state = this._textState;
      align = options.align || 'left';
      wordSpacing = options.wordSpacing || 0;
      characterSpacing = options.characterSpacing || 0;
      if (options.width) {
        switch (align) {
          case 'right':
            x += options.lineWidth - options.textWidth;
            break;
          case 'center':
            x += options.lineWidth / 2 - options.textWidth / 2;
            break;
          case 'justify':
            words = text.match(WORD_RE) || [text];
            if (!words) {
              break;
            }
            textWidth = this.widthOfString(text.replace(/\s+/g, ''), options);
            spaceWidth = this.widthOfString(' ') + characterSpacing;
            wordSpacing = (options.lineWidth - textWidth) / (words.length - 1) - spaceWidth;
        }
      }
      this.save();
      this.transform(1, 0, 0, -1, 0, this.page.height);
      y = this.page.height - y - (this._font.ascender / 1000 * this._fontSize);
      if ((_ref = (_base = this.page.fonts)[_name = this._font.id]) == null) {
        _base[_name] = this._font.ref;
      }
      this._font.use(text);
      text = this._font.encode(text);
      text = ((function() {
        var _i, _ref1, _results;
        _results = [];
        for (i = _i = 0, _ref1 = text.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          _results.push(text.charCodeAt(i).toString(16));
        }
        return _results;
      })()).join('');
      this.addContent("BT");
      this.addContent("" + x + " " + y + " Td");
      this.addContent("/" + this._font.id + " " + this._fontSize + " Tf");
      mode = options.fill && options.stroke ? 2 : options.stroke ? 1 : 0;
      if (mode !== state.mode) {
        this.addContent("" + mode + " Tr");
      }
      if (wordSpacing !== state.wordSpacing) {
        this.addContent(wordSpacing + ' Tw');
      }
      if (characterSpacing !== state.characterSpacing) {
        this.addContent(characterSpacing + ' Tc');
      }
      this.addContent("<" + text + "> Tj");
      this.addContent("ET");
      this.restore();
      state.mode = mode;
      return state.wordSpacing = wordSpacing;
    }
  };

}).call(this);
