/**
 * @name olum-helpers
 * @version 0.1.0
 * @copyright 2021
 * @author Eissa Saber
 * @license MIT
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else if (typeof define === "function" && define.amd) define(factory);
  else {
    var obj = factory();
    for (var key in obj) {
      root[key] = obj[key];
    }
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* helpers */
  var global = typeof self !== "undefined" ? self : this;

  function isDef(val) {
    return (val !== undefined && val !== null);
  }

  function isDev() {
    return ["localhost", "127.0.0.1"].indexOf(global.location.hostname) !== -1;
  }

  function isObj(obj) {
    return (obj !== null && typeof obj === "object");
  }

  function isFullArr(arr) {
    return !!(isObj(arr) && Array.isArray(arr) && arr.length);
  }

  function isFullObj(obj) {
    return !!(isObj(obj) && Array.isArray(Object.keys(obj)) && Object.keys(obj).length);
  }

  /* String Methods - uppercase, lowercase, capitalize */
  String.prototype.upper = function () {
    return this.toUpperCase();
  };
  String.prototype.lower = function () {
    return this.toLowerCase();
  };
  String.prototype.cap = function () {
    return this.toLowerCase().split(" ").map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(" ");
  };

  /* shortcut for add/remove event listeners */
  function on(event, cb, propagation) {
    if (!isDef(propagation)) propagation = false;
    return this.addEventListener(event, cb, propagation);
  }

  function off(event, cb, propagation) {
    if (!isDef(propagation)) propagation = false;
    return this.removeEventListener(event, cb, propagation);
  }
  Element.prototype.on = on;
  Element.prototype.off = off;
  Document.prototype.on = on;
  Document.prototype.off = off;
  global.on = on;
  global.off = off;

  /* toggle height of elements */
  Element.prototype.toggle = function (time) {
    if (!isDef(time)) time = 0.3;
    var elm = this;
    elm.style.transition = "height " + time + "s ease-in-out";
    elm.style.overflow = "hidden";
    elm.style.height = elm.clientHeight + "px";
    setTimeout(function () {
      if (elm.clientHeight == 0) {
        elm.style.height = "auto";
        var h = elm.clientHeight + "px";
        elm.style.height = "0";
        setTimeout(function () {
          elm.style.height = h;
        }, 0);
      } else elm.style.height = "0";
    }, 100);
  };

  /* works in browser in dev mode */
  function debug(args, level) {
    if (!isDef(level)) level = "log";
    level = level == "err" ? "error" : level;
    if (isDev()) Array.isArray(args) ? console[level].apply(console, args) : console[level](args);
  }

  /* nodes selector */
  function $(target, level, el) {
    if (!isDef(el)) el = document;
    if (typeof target == "string") {
      var elms = [].slice.call(el.querySelectorAll(target));
      if (isFullArr(elms)) {
        if (isDef(level) && level === true) return elms;
        else return elms[0];
      } else {
        if (isDef(level)) return [];
        else return null;
      }
    } else {
      if (!Array.isArray(target) && target && target instanceof Element) {
        target.get = function (t, l) {
          return $(t, l, target);
        }
      }
      return target;
    }
  }

  /* replace {{stuff}} in a string */
  function setTemp(temp, obj, delimiters) {
    if (!isDef(delimiters)) delimiters = ["{{", "}}"];
    for (var key in obj) {
      temp = temp.replace(new RegExp("\\" + delimiters[0][0] + "\\" + delimiters[0][1] + key + "\\" + delimiters[1][0] + "\\" + delimiters[1][1], "g"), obj[key]);
    }
    return temp;
  }

  /* A service for sharing data between components */
  function Service(event) {
    if (!(this instanceof Service)) throw new Error("can't invoke 'Service' without 'new' keyword");
    if (!isDef(event)) throw new Error("event name is not defined in 'Service'");
    this.event = event;

    var e = new CustomEvent(event, {
      detail: {},
      bubbles: true,
      cancelable: true,
      composed: false,
    });

    this.trigger = function () {
      if (isDef(e)) dispatchEvent(e);
      else throw new Error("event object is not defined");
    }
  }

  /* fetch api */
  function Origin() {
    if (!(this instanceof Origin)) throw new Error("can't invoke 'Origin' without 'new' keyword");
    var xhr = new XMLHttpRequest();

    function setParams(data) {
      if (isFullObj(data)) {
        // headers
        if (data.hasOwnProperty("headers") && isFullObj(data.headers)) {
          for (var key in data.headers) {
            xhr.setRequestHeader(key, data.headers[key]);
          }
        }
        // body 
        if (data.hasOwnProperty("body")) {
          if (isFullObj(data.body)) return JSON.stringify(data.body); // payload
          else if (typeof data.body == "string") return data.body; // form data
        }
      }
      return null;
    }

    function req(method, url, data) {
      return new Promise((resolve, reject) => {
        if (!isDef(data)) data = {};
        xhr.open(method, url, true);
        var body = setParams(data);

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 0 || (xhr.status >= 200 && xhr.status <= 299)) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (err) {
                resolve(xhr.responseText);
              }
            } else if (xhr.status >= 400 && xhr.status <= 599) {
              reject("Couldn't reach the server");
            }
          }
        }

        xhr.onerror = function () {
          return reject("Network Error");
        }
        body !== null ? xhr.send(body) : xhr.send();
      });
    }

    this.get = function (url, data) {
      return req("GET", url, data);
    };
    this.post = function (url, data) {
      return req("POST", url, data);
    };
    this.delete = function (url, data) {
      return req("DELETE", url, data);
    };
    this.put = function (url, data) {
      return req("PUT", url, data);
    };
    this.patch = function (url, data) {
      return req("PATCH", url, data);
    };
  }

  /* translate string */
  function Localize(dictionary, rtlLangs) {
    console.warn("localize");
    if (!(this instanceof Localize)) throw new Error("can't invoke 'Localize' without 'new' keyword");
    if (!isDef(dictionary)) throw new Error("dictionary object is missing!");
    if (!isDef(rtlLangs)) rtlLangs = [];

    var key = "tolang";
    var current = localStorage.getItem(key) || "en";

    // handle DOM
    var html = $("html");
    var body = $("body");
    if (html && body) {
      if (rtlLangs.indexOf(current) !== -1) {
        body.className += " RTL";
        html.dir = "rtl";
      } else {
        body.className = body.className.replace(/RTL/g, "");
        html.dir = "";
      }
    }

    // enable lang btns 
    document.on("click", function (e) {
      if (e.target.hasAttribute(key)) {
        // disable href in anchor
        if (e.target.nodeName === "A") e.target.setAttribute("href", "javascript:void(0)");
        // update current lang
        localStorage.setItem(key, e.target.getAttribute(key));
        location.reload();
      }
    });

    String.prototype.trans = function () {
      var str = this;
      var langObj = dictionary[current];
      var warn = str + " property is misspelled or missed";
      var sentence;

      if (typeof dictionary != "undefined" && typeof langObj != "undefined") {
        for (var _key in langObj) {
          if (str === _key) sentence = langObj[_key];
        }
      } else {
        console.warn("dictionary is not defined @trans()");
      }
      return sentence || warn;
    };

  }

  return {
    $,
    debug,
    setTemp,
    Service,
    Origin,
    Localize,
  };
});