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
  // else {
  //   var obj = factory();
  //   root.$ = obj.$;
  //   root.debug = obj.debug;
  //   root.Origin = obj.Origin;
  //   root.Localize = obj.Localize;
  //   root.Service = obj.Service;
  // }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /**
   * helpers for optimizing the code
   */
  const global = typeof self !== "undefined" ? self : this;
  const debugStr = "Olum [warn]:";
  const quotes = str => "“" + str + "”";
  const isDev = () => !!["localhost", "127.0.0.1"].includes(location.hostname);
  const isObj = obj => !!(obj !== null && typeof obj === "object");
  const isFullArr = arr => !!(isObj(arr) && Array.isArray(arr) && arr.length);
  const isFullObj = obj => !!(isObj(obj) && Array.isArray(Object.keys(obj)) && Object.keys(obj).length);
  const isDef = val => !!(val !== undefined && val !== null);
  const hasProp = (obj, key) => !!obj.hasOwnProperty(key);

  String.prototype.upper = function () {
    return this.toUpperCase();
  };
  String.prototype.lower = function () {
    return this.toLowerCase();
  };

  /* Capitalize a string */
  String.prototype.cap = function () {
    return this.toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /* For debuging purposes, works in dev mode */
  const debug = (args, level = "log") => {
    level = level == "err" ? "error" : level;
    if (isDev()) Array.isArray(args) ? console[level](...args) : console[level](args);
  };

  /**
   * A shorthand for selecting nodes from dom
   *
   * @example $(".header") // returns 1st element
   * @example $(".header", true) // returns array
   * @example $(elm).get("li") // returns 1st li inside elm
   * @example $(elm).get("li", true) // returns array of li inside elm
   * @param {String} target can be class, id, tag or Element
   * @param {Boolean} level (optional) boolean if omited it returns 1st element otherwise (true) returns array
   */
  const $ = (target, level, el = document) => {
    if (typeof target == "string") {
      const elms = [].slice.call(el.querySelectorAll(target));
      if (isFullArr(elms)) {
        if (level) return elms;
        else return elms[0];
      } else {
        if (level) {
          return [];
        } else {
          return null;
        }
      }
    } else {
      if (!Array.isArray(target) && !!target && target instanceof Element) target.get = (t, l) => $(t, l, target);
      return target;
    }
  };

  /**
   * A shorthand for addEventListener() - removeEventListener()
   */
  function on(event, cb, propagation = false) {
    return this.addEventListener(event, cb, propagation);
  }

  function off(event, cb, propagation = false) {
    return this.removeEventListener(event, cb, propagation);
  }
  Element.prototype.on = on;
  Element.prototype.off = off;
  Document.prototype.on = on;
  Document.prototype.off = off;
  global.on = on;
  global.off = off;

  /**
   * Replace string with values
   *
   * @example setTemp(`<div>{{name}}</div>`, {name:"olumjs"})
   */
  const setTemp = (temp, obj, delimit = ["{{", "}}"]) => {
    for (let key in obj) {
      temp = temp.replace(new RegExp(`\\${delimit[0][0]}\\${delimit[0][1]}${key}\\${delimit[1][0]}\\${delimit[1][1]}`, "g"), obj[key]);
    }
    return temp;
  };

  /**
   * Expand/Collapse element height
   *
   * @example elm.toggle(0.6)
   * @Hint CSS must have `height: 0; overflow: hidden;`
   */
  Element.prototype.toggle = function (time = 0.3) {
    this.style.transition = `height ${time}s ease-in-out`;
    if (this.clientHeight == 0) {
      this.style.height = "auto";
      const h = this.clientHeight + "px";
      this.style.height = "0";
      setTimeout(() => (this.style.height = h), 0);
    } else this.style.height = "0";
  };

  // translations
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

  /**
   * @example origin.method(url, { body: {name:"olumjs"},"Content-Type": "application/json" }).then(console.log).catch(console.error)
   */
  class Origin {
    constructor() {
      if (!(this instanceof Origin)) console.error(`${debugStr} can't invoke ${quotes("Origin constructor")} without new keyword`);
      this.xhr = new XMLHttpRequest();
    }

    setParams(data) {
      if (isFullObj(data)) {
        for (let key in data) {
          if (key !== "body") this.xhr.setRequestHeader(key, data[key]);
        }
        if (hasProp(data, "body") && isFullObj(data.body)) {
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
            reject(`${debugStr} couldn't reach the server`);
          }
        }
      });
    }

    req(method, url, data = {}) {
      return new Promise((resolve, reject) => {
        this.xhr.open(method, url, true);
        const form = this.setParams(data);
        this.onload(resolve, reject);
        this.xhr.onerror = () => reject(`${debugStr} network error`);
        form !== null ? this.xhr.send(form) : this.xhr.send();
      });
    }

    get = (url, data = {}) => this.req("GET", url, data);
    post = (url, data = {}) => this.req("POST", url, data);
    delete = (url, data = {}) => this.req("DELETE", url, data);
    put = (url, data = {}) => this.req("PUT", url, data);
    patch = (url, data = {}) => this.req("PATCH", url, data);
  }

  /**
   * @example const event = new Service("eventName");
   * window.on(event.event, () => console.log("fired"));
   * event.trigger()
   */
  class Service {
    constructor(event) {
      if (!(this instanceof Service)) console.error(`${debugStr} can't invoke ${quotes("Service constructor")} without new keyword`);
      this.event = event;
      this.init();
      return this;
    }

    init() {
      this.serviceEvent = new CustomEvent(this.event, {
        detail: {},
        bubbles: true,
        cancelable: true,
        composed: false,
      });
    }

    trigger() {
      if (isDef(this.serviceEvent)) dispatchEvent(this.serviceEvent);
    }
  }

  return {
    Service,
    Origin,
    $,
    debug,
    setTemp,
    Localize,
  };
});
