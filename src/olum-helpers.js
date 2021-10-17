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
    this.style.transition = "height " + time + "s ease-in-out";
    if (this.clientHeight == 0) {
      this.style.height = "auto";
      var h = this.clientHeight + "px";
      this.style.height = "0";
      setTimeout(function () {
        this.style.height = h
      }, 0);
    } else this.style.height = "0";
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


  /**
   * @example 
   * origin.method(url, {
    body: {
      name: "olumjs"
    },
    headers:{
      "Content-Type": "application/json"
    }
  }).then(console.log).catch(console.error)
   */

  class Origin {
    constructor() {
      if (!(this instanceof Origin)) console.error("can't invoke 'Origin' without 'new' keyword");
      this.xhr = new XMLHttpRequest();
    }

    setParams(data) {
      if (isFullObj(data)) {
        if (data.hasOwnProperty("headers") && isFullObj(data.headers)) {
          for (let key in data.headers) {
            this.xhr.setRequestHeader(key, data.headers[key]);
          }
        }
        if (data.hasOwnProperty("body") && isFullObj(data.body)) {
          return JSON.stringify(data.body);
        }
        return null;
      }
    }

    onload(resolve, reject) {
      return (this.xhr.onreadystatechange = () => {
        if (this.xhr.readyState === 4) {
          if (this.xhr.status === 0 || (this.xhr.status >= 200 && this.xhr.status <= 299)) {
            try {
              resolve(JSON.parse(this.xhr.responseText));
            } catch (err) {
              resolve(this.xhr.responseText);
            }
          } else if (this.xhr.status >= 400 && this.xhr.status <= 599) {
            reject(`couldn't reach the server`);
          }
        }
      });
    }

    req(method, url, data = {}) {
      return new Promise((resolve, reject) => {
        this.xhr.open(method, url, true);
        const form = this.setParams(data);
        this.onload(resolve, reject);
        this.xhr.onerror = () => reject(`network error`);
        form !== null ? this.xhr.send(form) : this.xhr.send();
      });
    }

    get = (url, data = {}) => this.req("GET", url, data);
    post = (url, data = {}) => this.req("POST", url, data);
    delete = (url, data = {}) => this.req("DELETE", url, data);
    put = (url, data = {}) => this.req("PUT", url, data);
    patch = (url, data = {}) => this.req("PATCH", url, data);
  }

  class Localize {
    key = "tolang";

    constructor(dictionary, rtlLangs = []) {
      this.dictionary = dictionary;
      this.rtlLangs = rtlLangs;
      this.init();
    }

    init() {
      this.detect();
      const _this = this;
      String.prototype.trans = function trans() {
        const str = this;
        const locales = _this.dictionary;
        const lang = _this.current();
        const langObj = locales[lang];
        const err = `"${str}" property is misspelled or missed at "src/locales/${lang}.js"`;
        let translatedStr;

        if (typeof locales != "undefined" && typeof langObj != "undefined") {
          for (let key in langObj) {
            if (str === key) translatedStr = langObj[key];
          }
        } else {
          debug("locales or langObj are not defined! @ String.prototype.trans", "warn");
        }

        return translatedStr || err;
      };
      this.tolang();
    }

    detect() {
      const html = $("html");
      const body = $("body");
      if (html && body) {
        if (this.rtlLangs.includes(this.current())) {
          body.classList.add("RTL");
          html.dir = "rtl";
        } else {
          body.classList.remove("RTL");
          html.dir = "";
        }
      }
    }

    current() {
      return localStorage.getItem(this.key) || "en";
    }

    tolang() {
      document.on("click", e => {
        if (e.target.hasAttribute(this.key)) {
          // disable href in anchor
          if (e.target.nodeName === "A") e.target.setAttribute("href", "javascript:void(0)");
          // disable icons in links
          [...e.target.children].forEach(icon => (icon.style.pointerEvents = "none"));
          // update current lang
          const lang = e.target.getAttribute(this.key);
          localStorage.setItem(this.key, lang);
          location.reload();
        }
      });
    }
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