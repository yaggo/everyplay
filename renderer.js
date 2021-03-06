// Generated by CoffeeScript 1.6.3
var Renderer,
  __slice = [].slice;

Renderer = (function() {
  Renderer.prototype.stack = [];

  Renderer.prototype.push = function(context) {
    return this.stack.unshift(context);
  };

  Renderer.prototype.pop = function() {
    return this.stack.shift();
  };

  Renderer.prototype.get = function(key) {
    var context, obj, _i, _len, _ref;
    _ref = this.stack;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      context = _ref[_i];
      obj = context[key];
      if (typeof obj !== 'undefined') {
        return typeof obj === 'function' && (obj.bind(context)) || obj;
      }
    }
    return console.log('not found from stack', key, this.stack);
  };

  Renderer.prototype.resolve = function(keypath) {
    var key, obj, parent, path, _i, _len;
    if (path = keypath.split('.')) {
      obj = this.get(path.shift());
      for (_i = 0, _len = path.length; _i < _len; _i++) {
        key = path[_i];
        if (!(obj != null)) {
          continue;
        }
        parent = obj;
        obj = obj[key];
      }
      if (obj == null) {
        console.log("cannot resolve keypath " + keypath);
      }
      return typeof obj === 'function' && (parent && obj.bind(parent)) || obj;
    }
  };

  Renderer.prototype.molds = [];

  function Renderer(node, context) {
    var args, attr, attr_name, attr_val, bool, cb, child, clone, cls, handler, item, iterables, keypath, mold, name, navigate, obj, path, result, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
      _this = this;
    if (context) {
      this.push(context);
    }
    if (node.nodeType === window.Node.ELEMENT_NODE) {
      attr = node.attributes;
      if (value = (_ref = attr['data-if']) != null ? _ref.value : void 0) {
        if (!this.resolve(value)) {
          this.molds.push(node);
          return;
        }
      }
      if (value = (_ref1 = attr['data-unless']) != null ? _ref1.value : void 0) {
        if (this.resolve(value)) {
          this.molds.push(node);
          return;
        }
      }
      if (value = (_ref2 = attr['data-each']) != null ? _ref2.value : void 0) {
        _ref3 = value.split(' '), iterables = _ref3[0], item = _ref3[1];
        _ref4 = (this.resolve(iterables)) || [];
        for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
          obj = _ref4[_i];
          node.removeAttribute('data-each');
          node.parentNode.insertBefore(clone = node.cloneNode(true));
          context = {};
          context[item] = obj;
          this.constructor(clone, context);
        }
        this.molds.push(node);
        return;
      }
      if (value = (_ref5 = attr['data-attr']) != null ? _ref5.value : void 0) {
        _ref6 = value.split(', ');
        for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
          value = _ref6[_j];
          _ref7 = value.split(' '), attr_name = _ref7[0], keypath = _ref7[1];
          attr_val = this.resolve(keypath);
          if (attr_val === true) {
            node.setAttribute(attr_name, attr_name);
          } else if (attr_val !== false) {
            node.setAttribute(attr_name, (_ref8 = this.resolve(keypath)) != null ? _ref8 : '');
          }
        }
      }
      if (value = (_ref9 = attr['data-style']) != null ? _ref9.value : void 0) {
        _ref10 = value.split(', ');
        for (_k = 0, _len2 = _ref10.length; _k < _len2; _k++) {
          item = _ref10[_k];
          _ref11 = item.split(' '), attr = _ref11[0], keypath = _ref11[1];
          node.style[attr] = this.resolve(keypath != null ? keypath : '');
        }
      }
      if (value = (_ref12 = attr['data-class']) != null ? _ref12.value : void 0) {
        _ref13 = value.split(', ');
        for (_l = 0, _len3 = _ref13.length; _l < _len3; _l++) {
          item = _ref13[_l];
          _ref14 = item.split(' '), cls = _ref14[0], keypath = _ref14[1];
          if (!keypath) {
            result = this.resolve(cls);
            if (result instanceof Array) {
              for (_m = 0, _len4 = result.length; _m < _len4; _m++) {
                cls = result[_m];
                node.classList.add(cls);
              }
            } else if (typeof result === 'object') {
              for (cls in result) {
                bool = result[cls];
                node.classList[bool && 'add' || 'remove'](cls);
              }
            } else {
              node.classList.add(result);
            }
          } else {
            node.classList[(this.resolve(keypath)) && 'add' || 'remove'](cls);
          }
        }
      }
      if (value = (_ref15 = attr['data-route']) != null ? _ref15.value : void 0) {
        path = this.resolve(value);
        navigate = this.resolve('navigate');
        node.addEventListener('click', function(event) {
          event.preventDefault();
          return navigate(path);
        }, true);
        if (node.tagName === 'A') {
          node.setAttribute('href', path);
        }
      }
      if (value = (_ref16 = attr['data-event']) != null ? _ref16.value : void 0) {
        _ref17 = value.split(' '), name = _ref17[0], keypath = _ref17[1], args = 3 <= _ref17.length ? __slice.call(_ref17, 2) : [];
        args = args.map(function(arg) {
          return _this.resolve(arg);
        });
        handler = this.resolve(keypath);
        cb = function(event) {
          var data, form, _len5, _n, _ref18;
          if (name === 'submit') {
            event.preventDefault();
            form = event.target;
            data = {};
            _ref18 = form.elements;
            for (_n = 0, _len5 = _ref18.length; _n < _len5; _n++) {
              node = _ref18[_n];
              if (node.name) {
                data[node.name] = node.value;
              }
            }
            return handler.apply(null, [data].concat(__slice.call(args), [event]));
          } else {
            return handler.apply(null, __slice.call(args).concat([event]));
          }
        };
        node.addEventListener(name, cb, true);
      }
      if (keypath = (_ref18 = attr['data-text']) != null ? _ref18.value : void 0) {
        node.textContent = (_ref19 = this.resolve(keypath)) != null ? _ref19 : '';
      } else if (keypath = (_ref20 = attr['data-html']) != null ? _ref20.value : void 0) {
        node.innerHTML = (_ref21 = this.resolve(keypath)) != null ? _ref21 : '';
      } else {
        _ref22 = node.childNodes;
        for (_n = 0, _len5 = _ref22.length; _n < _len5; _n++) {
          child = _ref22[_n];
          this.constructor(child);
        }
      }
    }
    if (context) {
      this.pop();
    }
    while (mold = this.molds.pop()) {
      mold.parentNode.removeChild(mold);
    }
  }

  return Renderer;

})();
