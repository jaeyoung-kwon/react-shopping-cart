var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var _executor, _decorate, decorate_fn, _a2, _executor2, _decorate2, decorate_fn2, _b2, _c2;
var POSITIONALS_EXP$1 = /(%?)(%([sdijo]))/g;
function serializePositional$1(positional, flag) {
  switch (flag) {
    case "s":
      return positional;
    case "d":
    case "i":
      return Number(positional);
    case "j":
      return JSON.stringify(positional);
    case "o": {
      if (typeof positional === "string") {
        return positional;
      }
      const json = JSON.stringify(positional);
      if (json === "{}" || json === "[]" || /^\[object .+?\]$/.test(json)) {
        return positional;
      }
      return json;
    }
  }
}
function format$1(message2, ...positionals) {
  if (positionals.length === 0) {
    return message2;
  }
  let positionalIndex = 0;
  let formattedMessage = message2.replace(
    POSITIONALS_EXP$1,
    (match2, isEscaped, _, flag) => {
      const positional = positionals[positionalIndex];
      const value = serializePositional$1(positional, flag);
      if (!isEscaped) {
        positionalIndex++;
        return value;
      }
      return match2;
    }
  );
  if (positionalIndex < positionals.length) {
    formattedMessage += ` ${positionals.slice(positionalIndex).join(" ")}`;
  }
  formattedMessage = formattedMessage.replace(/%{2,2}/g, "%");
  return formattedMessage;
}
var STACK_FRAMES_TO_IGNORE$1 = 2;
function cleanErrorStack$1(error2) {
  if (!error2.stack) {
    return;
  }
  const nextStack = error2.stack.split("\n");
  nextStack.splice(1, STACK_FRAMES_TO_IGNORE$1);
  error2.stack = nextStack.join("\n");
}
var InvariantError$1 = class InvariantError extends Error {
  constructor(message2, ...positionals) {
    super(message2);
    this.message = message2;
    this.name = "Invariant Violation";
    this.message = format$1(message2, ...positionals);
    cleanErrorStack$1(this);
  }
};
var invariant$1 = (predicate, message2, ...positionals) => {
  if (!predicate) {
    throw new InvariantError$1(message2, ...positionals);
  }
};
invariant$1.as = (ErrorConstructor, predicate, message2, ...positionals) => {
  if (!predicate) {
    const formatMessage2 = positionals.length === 0 ? message2 : format$1(message2, ...positionals);
    let error2;
    try {
      error2 = Reflect.construct(ErrorConstructor, [
        formatMessage2
      ]);
    } catch (err) {
      error2 = ErrorConstructor(formatMessage2);
    }
    throw error2;
  }
};
const LIBRARY_PREFIX = "[MSW]";
function formatMessage(message2, ...positionals) {
  const interpolatedMessage = format$1(message2, ...positionals);
  return `${LIBRARY_PREFIX} ${interpolatedMessage}`;
}
function warn$2(message2, ...positionals) {
  console.warn(formatMessage(message2, ...positionals));
}
function error$2(message2, ...positionals) {
  console.error(formatMessage(message2, ...positionals));
}
const devUtils = {
  formatMessage,
  warn: warn$2,
  error: error$2
};
class InternalError extends Error {
  constructor(message2) {
    super(message2);
    this.name = "InternalError";
  }
}
const SOURCE_FRAME = /[\/\\]msw[\/\\]src[\/\\](.+)/;
const BUILD_FRAME = /(node_modules)?[\/\\]lib[\/\\](core|browser|node|native|iife)[\/\\]|^[^\/\\]*$/;
function getCallFrame(error2) {
  const stack = error2.stack;
  if (!stack) {
    return;
  }
  const frames = stack.split("\n").slice(1);
  const declarationFrame = frames.find((frame) => {
    return !(SOURCE_FRAME.test(frame) || BUILD_FRAME.test(frame));
  });
  if (!declarationFrame) {
    return;
  }
  const declarationPath = declarationFrame.replace(/\s*at [^()]*\(([^)]+)\)/, "$1").replace(/^@/, "");
  return declarationPath;
}
function isIterable(fn) {
  if (!fn) {
    return false;
  }
  return Reflect.has(fn, Symbol.iterator) || Reflect.has(fn, Symbol.asyncIterator);
}
const _RequestHandler = class _RequestHandler {
  constructor(args) {
    __publicField(this, "__kind");
    __publicField(this, "info");
    /**
     * Indicates whether this request handler has been used
     * (its resolver has successfully executed).
     */
    __publicField(this, "isUsed");
    __publicField(this, "resolver");
    __publicField(this, "resolverIterator");
    __publicField(this, "resolverIteratorResult");
    __publicField(this, "options");
    this.resolver = args.resolver;
    this.options = args.options;
    const callFrame = getCallFrame(new Error());
    this.info = {
      ...args.info,
      callFrame
    };
    this.isUsed = false;
    this.__kind = "RequestHandler";
  }
  /**
   * Parse the intercepted request to extract additional information from it.
   * Parsed result is then exposed to other methods of this request handler.
   */
  async parse(_args) {
    return {};
  }
  /**
   * Test if this handler matches the given request.
   *
   * This method is not used internally but is exposed
   * as a convenience method for consumers writing custom
   * handlers.
   */
  async test(args) {
    const parsedResult = await this.parse({
      request: args.request,
      resolutionContext: args.resolutionContext
    });
    return this.predicate({
      request: args.request,
      parsedResult,
      resolutionContext: args.resolutionContext
    });
  }
  extendResolverArgs(_args) {
    return {};
  }
  // Clone the request instance before it's passed to the handler phases
  // and the response resolver so we can always read it for logging.
  // We only clone it once per request to avoid unnecessary overhead.
  cloneRequestOrGetFromCache(request) {
    const existingClone = _RequestHandler.cache.get(request);
    if (typeof existingClone !== "undefined") {
      return existingClone;
    }
    const clonedRequest = request.clone();
    _RequestHandler.cache.set(request, clonedRequest);
    return clonedRequest;
  }
  /**
   * Execute this request handler and produce a mocked response
   * using the given resolver function.
   */
  async run(args) {
    var _a3, _b3;
    if (this.isUsed && ((_a3 = this.options) == null ? void 0 : _a3.once)) {
      return null;
    }
    const requestClone = this.cloneRequestOrGetFromCache(args.request);
    const parsedResult = await this.parse({
      request: args.request,
      resolutionContext: args.resolutionContext
    });
    const shouldInterceptRequest = this.predicate({
      request: args.request,
      parsedResult,
      resolutionContext: args.resolutionContext
    });
    if (!shouldInterceptRequest) {
      return null;
    }
    if (this.isUsed && ((_b3 = this.options) == null ? void 0 : _b3.once)) {
      return null;
    }
    this.isUsed = true;
    const executeResolver = this.wrapResolver(this.resolver);
    const resolverExtras = this.extendResolverArgs({
      request: args.request,
      parsedResult
    });
    const mockedResponsePromise = executeResolver({
      ...resolverExtras,
      requestId: args.requestId,
      request: args.request
    }).catch((errorOrResponse) => {
      if (errorOrResponse instanceof Response) {
        return errorOrResponse;
      }
      throw errorOrResponse;
    });
    const mockedResponse = await mockedResponsePromise;
    const executionResult = this.createExecutionResult({
      // Pass the cloned request to the result so that logging
      // and other consumers could read its body once more.
      request: requestClone,
      requestId: args.requestId,
      response: mockedResponse,
      parsedResult
    });
    return executionResult;
  }
  wrapResolver(resolver) {
    return async (info) => {
      var _a3;
      if (!this.resolverIterator) {
        const result = await resolver(info);
        if (!isIterable(result)) {
          return result;
        }
        this.resolverIterator = Symbol.iterator in result ? result[Symbol.iterator]() : result[Symbol.asyncIterator]();
      }
      this.isUsed = false;
      const { done, value } = await this.resolverIterator.next();
      const nextResponse = await value;
      if (nextResponse) {
        this.resolverIteratorResult = nextResponse.clone();
      }
      if (done) {
        this.isUsed = true;
        return (_a3 = this.resolverIteratorResult) == null ? void 0 : _a3.clone();
      }
      return nextResponse;
    };
  }
  createExecutionResult(args) {
    return {
      handler: this,
      request: args.request,
      requestId: args.requestId,
      response: args.response,
      parsedResult: args.parsedResult
    };
  }
};
__publicField(_RequestHandler, "cache", /* @__PURE__ */ new WeakMap());
let RequestHandler = _RequestHandler;
var until$1 = async (promise) => {
  try {
    const data = await promise().catch((error2) => {
      throw error2;
    });
    return { error: null, data };
  } catch (error2) {
    return { error: error2, data: null };
  }
};
const executeHandlers = async ({
  request,
  requestId,
  handlers: handlers2,
  resolutionContext
}) => {
  let matchingHandler = null;
  let result = null;
  for (const handler of handlers2) {
    result = await handler.run({ request, requestId, resolutionContext });
    if (result !== null) {
      matchingHandler = handler;
    }
    if (result == null ? void 0 : result.response) {
      break;
    }
  }
  if (matchingHandler) {
    return {
      handler: matchingHandler,
      parsedResult: result == null ? void 0 : result.parsedResult,
      response: result == null ? void 0 : result.response
    };
  }
  return null;
};
function toPublicUrl(url) {
  if (typeof location === "undefined") {
    return url.toString();
  }
  const urlInstance = url instanceof URL ? url : new URL(url);
  return urlInstance.origin === location.origin ? urlInstance.pathname : urlInstance.origin + urlInstance.pathname;
}
function isCommonAssetRequest(request) {
  const url = new URL(request.url);
  if (url.protocol === "file:") {
    return true;
  }
  if (/(fonts\.googleapis\.com)/.test(url.hostname)) {
    return true;
  }
  if (/node_modules/.test(url.pathname)) {
    return true;
  }
  if (url.pathname.includes("@vite")) {
    return true;
  }
  return /\.(s?css|less|m?jsx?|m?tsx?|html|ttf|otf|woff|woff2|eot|gif|jpe?g|png|avif|webp|svg|mp4|webm|ogg|mov|mp3|wav|ogg|flac|aac|pdf|txt|csv|json|xml|md|zip|tar|gz|rar|7z)$/i.test(
    url.pathname
  );
}
async function onUnhandledRequest(request, strategy = "warn") {
  const url = new URL(request.url);
  const publicUrl = toPublicUrl(url) + url.search;
  const requestBody = request.method === "HEAD" || request.method === "GET" ? null : await request.clone().text();
  const messageDetails = `

  • ${request.method} ${publicUrl}

${requestBody ? `  • Request body: ${requestBody}

` : ""}`;
  const unhandledRequestMessage = `intercepted a request without a matching request handler:${messageDetails}If you still wish to intercept this unhandled request, please create a request handler for it.
Read more: https://mswjs.io/docs/getting-started/mocks`;
  function applyStrategy(strategy2) {
    switch (strategy2) {
      case "error": {
        devUtils.error("Error: %s", unhandledRequestMessage);
        throw new InternalError(
          devUtils.formatMessage(
            'Cannot bypass a request when using the "error" strategy for the "onUnhandledRequest" option.'
          )
        );
      }
      case "warn": {
        devUtils.warn("Warning: %s", unhandledRequestMessage);
        break;
      }
      case "bypass":
        break;
      default:
        throw new InternalError(
          devUtils.formatMessage(
            'Failed to react to an unhandled request: unknown strategy "%s". Please provide one of the supported strategies ("bypass", "warn", "error") or a custom callback function as the value of the "onUnhandledRequest" option.',
            strategy2
          )
        );
    }
  }
  if (typeof strategy === "function") {
    strategy(request, {
      warning: applyStrategy.bind(null, "warn"),
      error: applyStrategy.bind(null, "error")
    });
    return;
  }
  if (!isCommonAssetRequest(request)) {
    applyStrategy(strategy);
  }
}
function isNodeProcess$1() {
  if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
    return true;
  }
  if (typeof process !== "undefined") {
    const type = process.type;
    if (type === "renderer" || type === "worker") {
      return false;
    }
    return !!(process.versions && process.versions.node);
  }
  return false;
}
var __create$3 = Object.create;
var __defProp$5 = Object.defineProperty;
var __getOwnPropDesc$3 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$3 = Object.getOwnPropertyNames;
var __getProtoOf$3 = Object.getPrototypeOf;
var __hasOwnProp$3 = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS$3 = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames$3(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps$3 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames$3(from))
      if (!__hasOwnProp$3.call(to, key) && key !== except)
        __defProp$5(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc$3(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM$3 = (mod, isNodeMode, target) => (target = mod != null ? __create$3(__getProtoOf$3(mod)) : {}, __copyProps$3(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp$5(target, "default", { value: mod, enumerable: true }),
  mod
));
var require_punycode = __commonJS$3({
  "node_modules/punycode/punycode.js"(exports, module) {
    var maxInt = 2147483647;
    var base = 36;
    var tMin = 1;
    var tMax = 26;
    var skew = 38;
    var damp = 700;
    var initialBias = 72;
    var initialN = 128;
    var delimiter = "-";
    var regexPunycode = /^xn--/;
    var regexNonASCII = /[^\0-\x7F]/;
    var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
    var errors = {
      "overflow": "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input"
    };
    var baseMinusTMin = base - tMin;
    var floor = Math.floor;
    var stringFromCharCode = String.fromCharCode;
    function error2(type) {
      throw new RangeError(errors[type]);
    }
    function map(array, callback) {
      const result = [];
      let length = array.length;
      while (length--) {
        result[length] = callback(array[length]);
      }
      return result;
    }
    function mapDomain(domain, callback) {
      const parts = domain.split("@");
      let result = "";
      if (parts.length > 1) {
        result = parts[0] + "@";
        domain = parts[1];
      }
      domain = domain.replace(regexSeparators, ".");
      const labels = domain.split(".");
      const encoded = map(labels, callback).join(".");
      return result + encoded;
    }
    function ucs2decode(string) {
      const output = [];
      let counter = 0;
      const length = string.length;
      while (counter < length) {
        const value = string.charCodeAt(counter++);
        if (value >= 55296 && value <= 56319 && counter < length) {
          const extra = string.charCodeAt(counter++);
          if ((extra & 64512) == 56320) {
            output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
          } else {
            output.push(value);
            counter--;
          }
        } else {
          output.push(value);
        }
      }
      return output;
    }
    var ucs2encode = (codePoints) => String.fromCodePoint(...codePoints);
    var basicToDigit = function(codePoint) {
      if (codePoint >= 48 && codePoint < 58) {
        return 26 + (codePoint - 48);
      }
      if (codePoint >= 65 && codePoint < 91) {
        return codePoint - 65;
      }
      if (codePoint >= 97 && codePoint < 123) {
        return codePoint - 97;
      }
      return base;
    };
    var digitToBasic = function(digit, flag) {
      return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
    };
    var adapt = function(delta, numPoints, firstTime) {
      let k = 0;
      delta = firstTime ? floor(delta / damp) : delta >> 1;
      delta += floor(delta / numPoints);
      for (; delta > baseMinusTMin * tMax >> 1; k += base) {
        delta = floor(delta / baseMinusTMin);
      }
      return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
    };
    var decode = function(input) {
      const output = [];
      const inputLength = input.length;
      let i = 0;
      let n = initialN;
      let bias = initialBias;
      let basic = input.lastIndexOf(delimiter);
      if (basic < 0) {
        basic = 0;
      }
      for (let j = 0; j < basic; ++j) {
        if (input.charCodeAt(j) >= 128) {
          error2("not-basic");
        }
        output.push(input.charCodeAt(j));
      }
      for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
        const oldi = i;
        for (let w = 1, k = base; ; k += base) {
          if (index >= inputLength) {
            error2("invalid-input");
          }
          const digit = basicToDigit(input.charCodeAt(index++));
          if (digit >= base) {
            error2("invalid-input");
          }
          if (digit > floor((maxInt - i) / w)) {
            error2("overflow");
          }
          i += digit * w;
          const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (digit < t) {
            break;
          }
          const baseMinusT = base - t;
          if (w > floor(maxInt / baseMinusT)) {
            error2("overflow");
          }
          w *= baseMinusT;
        }
        const out = output.length + 1;
        bias = adapt(i - oldi, out, oldi == 0);
        if (floor(i / out) > maxInt - n) {
          error2("overflow");
        }
        n += floor(i / out);
        i %= out;
        output.splice(i++, 0, n);
      }
      return String.fromCodePoint(...output);
    };
    var encode = function(input) {
      const output = [];
      input = ucs2decode(input);
      const inputLength = input.length;
      let n = initialN;
      let delta = 0;
      let bias = initialBias;
      for (const currentValue of input) {
        if (currentValue < 128) {
          output.push(stringFromCharCode(currentValue));
        }
      }
      const basicLength = output.length;
      let handledCPCount = basicLength;
      if (basicLength) {
        output.push(delimiter);
      }
      while (handledCPCount < inputLength) {
        let m = maxInt;
        for (const currentValue of input) {
          if (currentValue >= n && currentValue < m) {
            m = currentValue;
          }
        }
        const handledCPCountPlusOne = handledCPCount + 1;
        if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
          error2("overflow");
        }
        delta += (m - n) * handledCPCountPlusOne;
        n = m;
        for (const currentValue of input) {
          if (currentValue < n && ++delta > maxInt) {
            error2("overflow");
          }
          if (currentValue === n) {
            let q = delta;
            for (let k = base; ; k += base) {
              const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
              if (q < t) {
                break;
              }
              const qMinusT = q - t;
              const baseMinusT = base - t;
              output.push(
                stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
              );
              q = floor(qMinusT / baseMinusT);
            }
            output.push(stringFromCharCode(digitToBasic(q, 0)));
            bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
            delta = 0;
            ++handledCPCount;
          }
        }
        ++delta;
        ++n;
      }
      return output.join("");
    };
    var toUnicode = function(input) {
      return mapDomain(input, function(string) {
        return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
      });
    };
    var toASCII = function(input) {
      return mapDomain(input, function(string) {
        return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
      });
    };
    var punycode = {
      /**
       * A string representing the current Punycode.js version number.
       * @memberOf punycode
       * @type String
       */
      "version": "2.3.1",
      /**
       * An object of methods to convert from JavaScript's internal character
       * representation (UCS-2) to Unicode code points, and back.
       * @see <https://mathiasbynens.be/notes/javascript-encoding>
       * @memberOf punycode
       * @type Object
       */
      "ucs2": {
        "decode": ucs2decode,
        "encode": ucs2encode
      },
      "decode": decode,
      "encode": encode,
      "toASCII": toASCII,
      "toUnicode": toUnicode
    };
    module.exports = punycode;
  }
});
var require_requires_port = __commonJS$3({
  "node_modules/requires-port/index.js"(exports, module) {
    module.exports = function required(port, protocol) {
      protocol = protocol.split(":")[0];
      port = +port;
      if (!port)
        return false;
      switch (protocol) {
        case "http":
        case "ws":
          return port !== 80;
        case "https":
        case "wss":
          return port !== 443;
        case "ftp":
          return port !== 21;
        case "gopher":
          return port !== 70;
        case "file":
          return false;
      }
      return port !== 0;
    };
  }
});
var require_querystringify = __commonJS$3({
  "node_modules/querystringify/index.js"(exports) {
    var has = Object.prototype.hasOwnProperty;
    var undef;
    function decode(input) {
      try {
        return decodeURIComponent(input.replace(/\+/g, " "));
      } catch (e) {
        return null;
      }
    }
    function encode(input) {
      try {
        return encodeURIComponent(input);
      } catch (e) {
        return null;
      }
    }
    function querystring(query) {
      var parser = /([^=?#&]+)=?([^&]*)/g, result = {}, part;
      while (part = parser.exec(query)) {
        var key = decode(part[1]), value = decode(part[2]);
        if (key === null || value === null || key in result)
          continue;
        result[key] = value;
      }
      return result;
    }
    function querystringify(obj, prefix) {
      prefix = prefix || "";
      var pairs = [], value, key;
      if ("string" !== typeof prefix)
        prefix = "?";
      for (key in obj) {
        if (has.call(obj, key)) {
          value = obj[key];
          if (!value && (value === null || value === undef || isNaN(value))) {
            value = "";
          }
          key = encode(key);
          value = encode(value);
          if (key === null || value === null)
            continue;
          pairs.push(key + "=" + value);
        }
      }
      return pairs.length ? prefix + pairs.join("&") : "";
    }
    exports.stringify = querystringify;
    exports.parse = querystring;
  }
});
var require_url_parse = __commonJS$3({
  "node_modules/url-parse/index.js"(exports, module) {
    var required = require_requires_port();
    var qs = require_querystringify();
    var controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/;
    var CRHTLF = /[\n\r\t]/g;
    var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
    var port = /:\d+$/;
    var protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i;
    var windowsDriveLetter = /^[a-zA-Z]:/;
    function trimLeft(str) {
      return (str ? str : "").toString().replace(controlOrWhitespace, "");
    }
    var rules = [
      ["#", "hash"],
      // Extract from the back.
      ["?", "query"],
      // Extract from the back.
      function sanitize(address, url) {
        return isSpecial(url.protocol) ? address.replace(/\\/g, "/") : address;
      },
      ["/", "pathname"],
      // Extract from the back.
      ["@", "auth", 1],
      // Extract from the front.
      [NaN, "host", void 0, 1, 1],
      // Set left over value.
      [/:(\d*)$/, "port", void 0, 1],
      // RegExp the back.
      [NaN, "hostname", void 0, 1, 1]
      // Set left over.
    ];
    var ignore = { hash: 1, query: 1 };
    function lolcation(loc) {
      var globalVar;
      if (typeof window !== "undefined")
        globalVar = window;
      else if (typeof global !== "undefined")
        globalVar = global;
      else if (typeof self !== "undefined")
        globalVar = self;
      else
        globalVar = {};
      var location2 = globalVar.location || {};
      loc = loc || location2;
      var finaldestination = {}, type = typeof loc, key;
      if ("blob:" === loc.protocol) {
        finaldestination = new Url(unescape(loc.pathname), {});
      } else if ("string" === type) {
        finaldestination = new Url(loc, {});
        for (key in ignore)
          delete finaldestination[key];
      } else if ("object" === type) {
        for (key in loc) {
          if (key in ignore)
            continue;
          finaldestination[key] = loc[key];
        }
        if (finaldestination.slashes === void 0) {
          finaldestination.slashes = slashes.test(loc.href);
        }
      }
      return finaldestination;
    }
    function isSpecial(scheme) {
      return scheme === "file:" || scheme === "ftp:" || scheme === "http:" || scheme === "https:" || scheme === "ws:" || scheme === "wss:";
    }
    function extractProtocol(address, location2) {
      address = trimLeft(address);
      address = address.replace(CRHTLF, "");
      location2 = location2 || {};
      var match2 = protocolre.exec(address);
      var protocol = match2[1] ? match2[1].toLowerCase() : "";
      var forwardSlashes = !!match2[2];
      var otherSlashes = !!match2[3];
      var slashesCount = 0;
      var rest;
      if (forwardSlashes) {
        if (otherSlashes) {
          rest = match2[2] + match2[3] + match2[4];
          slashesCount = match2[2].length + match2[3].length;
        } else {
          rest = match2[2] + match2[4];
          slashesCount = match2[2].length;
        }
      } else {
        if (otherSlashes) {
          rest = match2[3] + match2[4];
          slashesCount = match2[3].length;
        } else {
          rest = match2[4];
        }
      }
      if (protocol === "file:") {
        if (slashesCount >= 2) {
          rest = rest.slice(2);
        }
      } else if (isSpecial(protocol)) {
        rest = match2[4];
      } else if (protocol) {
        if (forwardSlashes) {
          rest = rest.slice(2);
        }
      } else if (slashesCount >= 2 && isSpecial(location2.protocol)) {
        rest = match2[4];
      }
      return {
        protocol,
        slashes: forwardSlashes || isSpecial(protocol),
        slashesCount,
        rest
      };
    }
    function resolve(relative, base) {
      if (relative === "")
        return base;
      var path = (base || "/").split("/").slice(0, -1).concat(relative.split("/")), i = path.length, last = path[i - 1], unshift = false, up = 0;
      while (i--) {
        if (path[i] === ".") {
          path.splice(i, 1);
        } else if (path[i] === "..") {
          path.splice(i, 1);
          up++;
        } else if (up) {
          if (i === 0)
            unshift = true;
          path.splice(i, 1);
          up--;
        }
      }
      if (unshift)
        path.unshift("");
      if (last === "." || last === "..")
        path.push("");
      return path.join("/");
    }
    function Url(address, location2, parser) {
      address = trimLeft(address);
      address = address.replace(CRHTLF, "");
      if (!(this instanceof Url)) {
        return new Url(address, location2, parser);
      }
      var relative, extracted, parse2, instruction, index, key, instructions = rules.slice(), type = typeof location2, url = this, i = 0;
      if ("object" !== type && "string" !== type) {
        parser = location2;
        location2 = null;
      }
      if (parser && "function" !== typeof parser)
        parser = qs.parse;
      location2 = lolcation(location2);
      extracted = extractProtocol(address || "", location2);
      relative = !extracted.protocol && !extracted.slashes;
      url.slashes = extracted.slashes || relative && location2.slashes;
      url.protocol = extracted.protocol || location2.protocol || "";
      address = extracted.rest;
      if (extracted.protocol === "file:" && (extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) || !extracted.slashes && (extracted.protocol || extracted.slashesCount < 2 || !isSpecial(url.protocol))) {
        instructions[3] = [/(.*)/, "pathname"];
      }
      for (; i < instructions.length; i++) {
        instruction = instructions[i];
        if (typeof instruction === "function") {
          address = instruction(address, url);
          continue;
        }
        parse2 = instruction[0];
        key = instruction[1];
        if (parse2 !== parse2) {
          url[key] = address;
        } else if ("string" === typeof parse2) {
          index = parse2 === "@" ? address.lastIndexOf(parse2) : address.indexOf(parse2);
          if (~index) {
            if ("number" === typeof instruction[2]) {
              url[key] = address.slice(0, index);
              address = address.slice(index + instruction[2]);
            } else {
              url[key] = address.slice(index);
              address = address.slice(0, index);
            }
          }
        } else if (index = parse2.exec(address)) {
          url[key] = index[1];
          address = address.slice(0, index.index);
        }
        url[key] = url[key] || (relative && instruction[3] ? location2[key] || "" : "");
        if (instruction[4])
          url[key] = url[key].toLowerCase();
      }
      if (parser)
        url.query = parser(url.query);
      if (relative && location2.slashes && url.pathname.charAt(0) !== "/" && (url.pathname !== "" || location2.pathname !== "")) {
        url.pathname = resolve(url.pathname, location2.pathname);
      }
      if (url.pathname.charAt(0) !== "/" && isSpecial(url.protocol)) {
        url.pathname = "/" + url.pathname;
      }
      if (!required(url.port, url.protocol)) {
        url.host = url.hostname;
        url.port = "";
      }
      url.username = url.password = "";
      if (url.auth) {
        index = url.auth.indexOf(":");
        if (~index) {
          url.username = url.auth.slice(0, index);
          url.username = encodeURIComponent(decodeURIComponent(url.username));
          url.password = url.auth.slice(index + 1);
          url.password = encodeURIComponent(decodeURIComponent(url.password));
        } else {
          url.username = encodeURIComponent(decodeURIComponent(url.auth));
        }
        url.auth = url.password ? url.username + ":" + url.password : url.username;
      }
      url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
      url.href = url.toString();
    }
    function set(part, value, fn) {
      var url = this;
      switch (part) {
        case "query":
          if ("string" === typeof value && value.length) {
            value = (fn || qs.parse)(value);
          }
          url[part] = value;
          break;
        case "port":
          url[part] = value;
          if (!required(value, url.protocol)) {
            url.host = url.hostname;
            url[part] = "";
          } else if (value) {
            url.host = url.hostname + ":" + value;
          }
          break;
        case "hostname":
          url[part] = value;
          if (url.port)
            value += ":" + url.port;
          url.host = value;
          break;
        case "host":
          url[part] = value;
          if (port.test(value)) {
            value = value.split(":");
            url.port = value.pop();
            url.hostname = value.join(":");
          } else {
            url.hostname = value;
            url.port = "";
          }
          break;
        case "protocol":
          url.protocol = value.toLowerCase();
          url.slashes = !fn;
          break;
        case "pathname":
        case "hash":
          if (value) {
            var char = part === "pathname" ? "/" : "#";
            url[part] = value.charAt(0) !== char ? char + value : value;
          } else {
            url[part] = value;
          }
          break;
        case "username":
        case "password":
          url[part] = encodeURIComponent(value);
          break;
        case "auth":
          var index = value.indexOf(":");
          if (~index) {
            url.username = value.slice(0, index);
            url.username = encodeURIComponent(decodeURIComponent(url.username));
            url.password = value.slice(index + 1);
            url.password = encodeURIComponent(decodeURIComponent(url.password));
          } else {
            url.username = encodeURIComponent(decodeURIComponent(value));
          }
      }
      for (var i = 0; i < rules.length; i++) {
        var ins = rules[i];
        if (ins[4])
          url[ins[1]] = url[ins[1]].toLowerCase();
      }
      url.auth = url.password ? url.username + ":" + url.password : url.username;
      url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
      url.href = url.toString();
      return url;
    }
    function toString(stringify) {
      if (!stringify || "function" !== typeof stringify)
        stringify = qs.stringify;
      var query, url = this, host = url.host, protocol = url.protocol;
      if (protocol && protocol.charAt(protocol.length - 1) !== ":")
        protocol += ":";
      var result = protocol + (url.protocol && url.slashes || isSpecial(url.protocol) ? "//" : "");
      if (url.username) {
        result += url.username;
        if (url.password)
          result += ":" + url.password;
        result += "@";
      } else if (url.password) {
        result += ":" + url.password;
        result += "@";
      } else if (url.protocol !== "file:" && isSpecial(url.protocol) && !host && url.pathname !== "/") {
        result += "@";
      }
      if (host[host.length - 1] === ":" || port.test(url.hostname) && !url.port) {
        host += ":";
      }
      result += host + url.pathname;
      query = "object" === typeof url.query ? stringify(url.query) : url.query;
      if (query)
        result += "?" !== query.charAt(0) ? "?" + query : query;
      if (url.hash)
        result += url.hash;
      return result;
    }
    Url.prototype = { set, toString };
    Url.extractProtocol = extractProtocol;
    Url.location = lolcation;
    Url.trimLeft = trimLeft;
    Url.qs = qs;
    module.exports = Url;
  }
});
var require_rules = __commonJS$3({
  "node_modules/psl/data/rules.json"(exports, module) {
    module.exports = [
      "ac",
      "com.ac",
      "edu.ac",
      "gov.ac",
      "net.ac",
      "mil.ac",
      "org.ac",
      "ad",
      "nom.ad",
      "ae",
      "co.ae",
      "net.ae",
      "org.ae",
      "sch.ae",
      "ac.ae",
      "gov.ae",
      "mil.ae",
      "aero",
      "accident-investigation.aero",
      "accident-prevention.aero",
      "aerobatic.aero",
      "aeroclub.aero",
      "aerodrome.aero",
      "agents.aero",
      "aircraft.aero",
      "airline.aero",
      "airport.aero",
      "air-surveillance.aero",
      "airtraffic.aero",
      "air-traffic-control.aero",
      "ambulance.aero",
      "amusement.aero",
      "association.aero",
      "author.aero",
      "ballooning.aero",
      "broker.aero",
      "caa.aero",
      "cargo.aero",
      "catering.aero",
      "certification.aero",
      "championship.aero",
      "charter.aero",
      "civilaviation.aero",
      "club.aero",
      "conference.aero",
      "consultant.aero",
      "consulting.aero",
      "control.aero",
      "council.aero",
      "crew.aero",
      "design.aero",
      "dgca.aero",
      "educator.aero",
      "emergency.aero",
      "engine.aero",
      "engineer.aero",
      "entertainment.aero",
      "equipment.aero",
      "exchange.aero",
      "express.aero",
      "federation.aero",
      "flight.aero",
      "fuel.aero",
      "gliding.aero",
      "government.aero",
      "groundhandling.aero",
      "group.aero",
      "hanggliding.aero",
      "homebuilt.aero",
      "insurance.aero",
      "journal.aero",
      "journalist.aero",
      "leasing.aero",
      "logistics.aero",
      "magazine.aero",
      "maintenance.aero",
      "media.aero",
      "microlight.aero",
      "modelling.aero",
      "navigation.aero",
      "parachuting.aero",
      "paragliding.aero",
      "passenger-association.aero",
      "pilot.aero",
      "press.aero",
      "production.aero",
      "recreation.aero",
      "repbody.aero",
      "res.aero",
      "research.aero",
      "rotorcraft.aero",
      "safety.aero",
      "scientist.aero",
      "services.aero",
      "show.aero",
      "skydiving.aero",
      "software.aero",
      "student.aero",
      "trader.aero",
      "trading.aero",
      "trainer.aero",
      "union.aero",
      "workinggroup.aero",
      "works.aero",
      "af",
      "gov.af",
      "com.af",
      "org.af",
      "net.af",
      "edu.af",
      "ag",
      "com.ag",
      "org.ag",
      "net.ag",
      "co.ag",
      "nom.ag",
      "ai",
      "off.ai",
      "com.ai",
      "net.ai",
      "org.ai",
      "al",
      "com.al",
      "edu.al",
      "gov.al",
      "mil.al",
      "net.al",
      "org.al",
      "am",
      "co.am",
      "com.am",
      "commune.am",
      "net.am",
      "org.am",
      "ao",
      "ed.ao",
      "gv.ao",
      "og.ao",
      "co.ao",
      "pb.ao",
      "it.ao",
      "aq",
      "ar",
      "bet.ar",
      "com.ar",
      "coop.ar",
      "edu.ar",
      "gob.ar",
      "gov.ar",
      "int.ar",
      "mil.ar",
      "musica.ar",
      "mutual.ar",
      "net.ar",
      "org.ar",
      "senasa.ar",
      "tur.ar",
      "arpa",
      "e164.arpa",
      "in-addr.arpa",
      "ip6.arpa",
      "iris.arpa",
      "uri.arpa",
      "urn.arpa",
      "as",
      "gov.as",
      "asia",
      "at",
      "ac.at",
      "co.at",
      "gv.at",
      "or.at",
      "sth.ac.at",
      "au",
      "com.au",
      "net.au",
      "org.au",
      "edu.au",
      "gov.au",
      "asn.au",
      "id.au",
      "info.au",
      "conf.au",
      "oz.au",
      "act.au",
      "nsw.au",
      "nt.au",
      "qld.au",
      "sa.au",
      "tas.au",
      "vic.au",
      "wa.au",
      "act.edu.au",
      "catholic.edu.au",
      "nsw.edu.au",
      "nt.edu.au",
      "qld.edu.au",
      "sa.edu.au",
      "tas.edu.au",
      "vic.edu.au",
      "wa.edu.au",
      "qld.gov.au",
      "sa.gov.au",
      "tas.gov.au",
      "vic.gov.au",
      "wa.gov.au",
      "schools.nsw.edu.au",
      "aw",
      "com.aw",
      "ax",
      "az",
      "com.az",
      "net.az",
      "int.az",
      "gov.az",
      "org.az",
      "edu.az",
      "info.az",
      "pp.az",
      "mil.az",
      "name.az",
      "pro.az",
      "biz.az",
      "ba",
      "com.ba",
      "edu.ba",
      "gov.ba",
      "mil.ba",
      "net.ba",
      "org.ba",
      "bb",
      "biz.bb",
      "co.bb",
      "com.bb",
      "edu.bb",
      "gov.bb",
      "info.bb",
      "net.bb",
      "org.bb",
      "store.bb",
      "tv.bb",
      "*.bd",
      "be",
      "ac.be",
      "bf",
      "gov.bf",
      "bg",
      "a.bg",
      "b.bg",
      "c.bg",
      "d.bg",
      "e.bg",
      "f.bg",
      "g.bg",
      "h.bg",
      "i.bg",
      "j.bg",
      "k.bg",
      "l.bg",
      "m.bg",
      "n.bg",
      "o.bg",
      "p.bg",
      "q.bg",
      "r.bg",
      "s.bg",
      "t.bg",
      "u.bg",
      "v.bg",
      "w.bg",
      "x.bg",
      "y.bg",
      "z.bg",
      "0.bg",
      "1.bg",
      "2.bg",
      "3.bg",
      "4.bg",
      "5.bg",
      "6.bg",
      "7.bg",
      "8.bg",
      "9.bg",
      "bh",
      "com.bh",
      "edu.bh",
      "net.bh",
      "org.bh",
      "gov.bh",
      "bi",
      "co.bi",
      "com.bi",
      "edu.bi",
      "or.bi",
      "org.bi",
      "biz",
      "bj",
      "asso.bj",
      "barreau.bj",
      "gouv.bj",
      "bm",
      "com.bm",
      "edu.bm",
      "gov.bm",
      "net.bm",
      "org.bm",
      "bn",
      "com.bn",
      "edu.bn",
      "gov.bn",
      "net.bn",
      "org.bn",
      "bo",
      "com.bo",
      "edu.bo",
      "gob.bo",
      "int.bo",
      "org.bo",
      "net.bo",
      "mil.bo",
      "tv.bo",
      "web.bo",
      "academia.bo",
      "agro.bo",
      "arte.bo",
      "blog.bo",
      "bolivia.bo",
      "ciencia.bo",
      "cooperativa.bo",
      "democracia.bo",
      "deporte.bo",
      "ecologia.bo",
      "economia.bo",
      "empresa.bo",
      "indigena.bo",
      "industria.bo",
      "info.bo",
      "medicina.bo",
      "movimiento.bo",
      "musica.bo",
      "natural.bo",
      "nombre.bo",
      "noticias.bo",
      "patria.bo",
      "politica.bo",
      "profesional.bo",
      "plurinacional.bo",
      "pueblo.bo",
      "revista.bo",
      "salud.bo",
      "tecnologia.bo",
      "tksat.bo",
      "transporte.bo",
      "wiki.bo",
      "br",
      "9guacu.br",
      "abc.br",
      "adm.br",
      "adv.br",
      "agr.br",
      "aju.br",
      "am.br",
      "anani.br",
      "aparecida.br",
      "app.br",
      "arq.br",
      "art.br",
      "ato.br",
      "b.br",
      "barueri.br",
      "belem.br",
      "bhz.br",
      "bib.br",
      "bio.br",
      "blog.br",
      "bmd.br",
      "boavista.br",
      "bsb.br",
      "campinagrande.br",
      "campinas.br",
      "caxias.br",
      "cim.br",
      "cng.br",
      "cnt.br",
      "com.br",
      "contagem.br",
      "coop.br",
      "coz.br",
      "cri.br",
      "cuiaba.br",
      "curitiba.br",
      "def.br",
      "des.br",
      "det.br",
      "dev.br",
      "ecn.br",
      "eco.br",
      "edu.br",
      "emp.br",
      "enf.br",
      "eng.br",
      "esp.br",
      "etc.br",
      "eti.br",
      "far.br",
      "feira.br",
      "flog.br",
      "floripa.br",
      "fm.br",
      "fnd.br",
      "fortal.br",
      "fot.br",
      "foz.br",
      "fst.br",
      "g12.br",
      "geo.br",
      "ggf.br",
      "goiania.br",
      "gov.br",
      "ac.gov.br",
      "al.gov.br",
      "am.gov.br",
      "ap.gov.br",
      "ba.gov.br",
      "ce.gov.br",
      "df.gov.br",
      "es.gov.br",
      "go.gov.br",
      "ma.gov.br",
      "mg.gov.br",
      "ms.gov.br",
      "mt.gov.br",
      "pa.gov.br",
      "pb.gov.br",
      "pe.gov.br",
      "pi.gov.br",
      "pr.gov.br",
      "rj.gov.br",
      "rn.gov.br",
      "ro.gov.br",
      "rr.gov.br",
      "rs.gov.br",
      "sc.gov.br",
      "se.gov.br",
      "sp.gov.br",
      "to.gov.br",
      "gru.br",
      "imb.br",
      "ind.br",
      "inf.br",
      "jab.br",
      "jampa.br",
      "jdf.br",
      "joinville.br",
      "jor.br",
      "jus.br",
      "leg.br",
      "lel.br",
      "log.br",
      "londrina.br",
      "macapa.br",
      "maceio.br",
      "manaus.br",
      "maringa.br",
      "mat.br",
      "med.br",
      "mil.br",
      "morena.br",
      "mp.br",
      "mus.br",
      "natal.br",
      "net.br",
      "niteroi.br",
      "*.nom.br",
      "not.br",
      "ntr.br",
      "odo.br",
      "ong.br",
      "org.br",
      "osasco.br",
      "palmas.br",
      "poa.br",
      "ppg.br",
      "pro.br",
      "psc.br",
      "psi.br",
      "pvh.br",
      "qsl.br",
      "radio.br",
      "rec.br",
      "recife.br",
      "rep.br",
      "ribeirao.br",
      "rio.br",
      "riobranco.br",
      "riopreto.br",
      "salvador.br",
      "sampa.br",
      "santamaria.br",
      "santoandre.br",
      "saobernardo.br",
      "saogonca.br",
      "seg.br",
      "sjc.br",
      "slg.br",
      "slz.br",
      "sorocaba.br",
      "srv.br",
      "taxi.br",
      "tc.br",
      "tec.br",
      "teo.br",
      "the.br",
      "tmp.br",
      "trd.br",
      "tur.br",
      "tv.br",
      "udi.br",
      "vet.br",
      "vix.br",
      "vlog.br",
      "wiki.br",
      "zlg.br",
      "bs",
      "com.bs",
      "net.bs",
      "org.bs",
      "edu.bs",
      "gov.bs",
      "bt",
      "com.bt",
      "edu.bt",
      "gov.bt",
      "net.bt",
      "org.bt",
      "bv",
      "bw",
      "co.bw",
      "org.bw",
      "by",
      "gov.by",
      "mil.by",
      "com.by",
      "of.by",
      "bz",
      "com.bz",
      "net.bz",
      "org.bz",
      "edu.bz",
      "gov.bz",
      "ca",
      "ab.ca",
      "bc.ca",
      "mb.ca",
      "nb.ca",
      "nf.ca",
      "nl.ca",
      "ns.ca",
      "nt.ca",
      "nu.ca",
      "on.ca",
      "pe.ca",
      "qc.ca",
      "sk.ca",
      "yk.ca",
      "gc.ca",
      "cat",
      "cc",
      "cd",
      "gov.cd",
      "cf",
      "cg",
      "ch",
      "ci",
      "org.ci",
      "or.ci",
      "com.ci",
      "co.ci",
      "edu.ci",
      "ed.ci",
      "ac.ci",
      "net.ci",
      "go.ci",
      "asso.ci",
      "aéroport.ci",
      "int.ci",
      "presse.ci",
      "md.ci",
      "gouv.ci",
      "*.ck",
      "!www.ck",
      "cl",
      "co.cl",
      "gob.cl",
      "gov.cl",
      "mil.cl",
      "cm",
      "co.cm",
      "com.cm",
      "gov.cm",
      "net.cm",
      "cn",
      "ac.cn",
      "com.cn",
      "edu.cn",
      "gov.cn",
      "net.cn",
      "org.cn",
      "mil.cn",
      "公司.cn",
      "网络.cn",
      "網絡.cn",
      "ah.cn",
      "bj.cn",
      "cq.cn",
      "fj.cn",
      "gd.cn",
      "gs.cn",
      "gz.cn",
      "gx.cn",
      "ha.cn",
      "hb.cn",
      "he.cn",
      "hi.cn",
      "hl.cn",
      "hn.cn",
      "jl.cn",
      "js.cn",
      "jx.cn",
      "ln.cn",
      "nm.cn",
      "nx.cn",
      "qh.cn",
      "sc.cn",
      "sd.cn",
      "sh.cn",
      "sn.cn",
      "sx.cn",
      "tj.cn",
      "xj.cn",
      "xz.cn",
      "yn.cn",
      "zj.cn",
      "hk.cn",
      "mo.cn",
      "tw.cn",
      "co",
      "arts.co",
      "com.co",
      "edu.co",
      "firm.co",
      "gov.co",
      "info.co",
      "int.co",
      "mil.co",
      "net.co",
      "nom.co",
      "org.co",
      "rec.co",
      "web.co",
      "com",
      "coop",
      "cr",
      "ac.cr",
      "co.cr",
      "ed.cr",
      "fi.cr",
      "go.cr",
      "or.cr",
      "sa.cr",
      "cu",
      "com.cu",
      "edu.cu",
      "org.cu",
      "net.cu",
      "gov.cu",
      "inf.cu",
      "cv",
      "com.cv",
      "edu.cv",
      "int.cv",
      "nome.cv",
      "org.cv",
      "cw",
      "com.cw",
      "edu.cw",
      "net.cw",
      "org.cw",
      "cx",
      "gov.cx",
      "cy",
      "ac.cy",
      "biz.cy",
      "com.cy",
      "ekloges.cy",
      "gov.cy",
      "ltd.cy",
      "mil.cy",
      "net.cy",
      "org.cy",
      "press.cy",
      "pro.cy",
      "tm.cy",
      "cz",
      "de",
      "dj",
      "dk",
      "dm",
      "com.dm",
      "net.dm",
      "org.dm",
      "edu.dm",
      "gov.dm",
      "do",
      "art.do",
      "com.do",
      "edu.do",
      "gob.do",
      "gov.do",
      "mil.do",
      "net.do",
      "org.do",
      "sld.do",
      "web.do",
      "dz",
      "art.dz",
      "asso.dz",
      "com.dz",
      "edu.dz",
      "gov.dz",
      "org.dz",
      "net.dz",
      "pol.dz",
      "soc.dz",
      "tm.dz",
      "ec",
      "com.ec",
      "info.ec",
      "net.ec",
      "fin.ec",
      "k12.ec",
      "med.ec",
      "pro.ec",
      "org.ec",
      "edu.ec",
      "gov.ec",
      "gob.ec",
      "mil.ec",
      "edu",
      "ee",
      "edu.ee",
      "gov.ee",
      "riik.ee",
      "lib.ee",
      "med.ee",
      "com.ee",
      "pri.ee",
      "aip.ee",
      "org.ee",
      "fie.ee",
      "eg",
      "com.eg",
      "edu.eg",
      "eun.eg",
      "gov.eg",
      "mil.eg",
      "name.eg",
      "net.eg",
      "org.eg",
      "sci.eg",
      "*.er",
      "es",
      "com.es",
      "nom.es",
      "org.es",
      "gob.es",
      "edu.es",
      "et",
      "com.et",
      "gov.et",
      "org.et",
      "edu.et",
      "biz.et",
      "name.et",
      "info.et",
      "net.et",
      "eu",
      "fi",
      "aland.fi",
      "fj",
      "ac.fj",
      "biz.fj",
      "com.fj",
      "gov.fj",
      "info.fj",
      "mil.fj",
      "name.fj",
      "net.fj",
      "org.fj",
      "pro.fj",
      "*.fk",
      "com.fm",
      "edu.fm",
      "net.fm",
      "org.fm",
      "fm",
      "fo",
      "fr",
      "asso.fr",
      "com.fr",
      "gouv.fr",
      "nom.fr",
      "prd.fr",
      "tm.fr",
      "aeroport.fr",
      "avocat.fr",
      "avoues.fr",
      "cci.fr",
      "chambagri.fr",
      "chirurgiens-dentistes.fr",
      "experts-comptables.fr",
      "geometre-expert.fr",
      "greta.fr",
      "huissier-justice.fr",
      "medecin.fr",
      "notaires.fr",
      "pharmacien.fr",
      "port.fr",
      "veterinaire.fr",
      "ga",
      "gb",
      "edu.gd",
      "gov.gd",
      "gd",
      "ge",
      "com.ge",
      "edu.ge",
      "gov.ge",
      "org.ge",
      "mil.ge",
      "net.ge",
      "pvt.ge",
      "gf",
      "gg",
      "co.gg",
      "net.gg",
      "org.gg",
      "gh",
      "com.gh",
      "edu.gh",
      "gov.gh",
      "org.gh",
      "mil.gh",
      "gi",
      "com.gi",
      "ltd.gi",
      "gov.gi",
      "mod.gi",
      "edu.gi",
      "org.gi",
      "gl",
      "co.gl",
      "com.gl",
      "edu.gl",
      "net.gl",
      "org.gl",
      "gm",
      "gn",
      "ac.gn",
      "com.gn",
      "edu.gn",
      "gov.gn",
      "org.gn",
      "net.gn",
      "gov",
      "gp",
      "com.gp",
      "net.gp",
      "mobi.gp",
      "edu.gp",
      "org.gp",
      "asso.gp",
      "gq",
      "gr",
      "com.gr",
      "edu.gr",
      "net.gr",
      "org.gr",
      "gov.gr",
      "gs",
      "gt",
      "com.gt",
      "edu.gt",
      "gob.gt",
      "ind.gt",
      "mil.gt",
      "net.gt",
      "org.gt",
      "gu",
      "com.gu",
      "edu.gu",
      "gov.gu",
      "guam.gu",
      "info.gu",
      "net.gu",
      "org.gu",
      "web.gu",
      "gw",
      "gy",
      "co.gy",
      "com.gy",
      "edu.gy",
      "gov.gy",
      "net.gy",
      "org.gy",
      "hk",
      "com.hk",
      "edu.hk",
      "gov.hk",
      "idv.hk",
      "net.hk",
      "org.hk",
      "公司.hk",
      "教育.hk",
      "敎育.hk",
      "政府.hk",
      "個人.hk",
      "个��.hk",
      "箇人.hk",
      "網络.hk",
      "网络.hk",
      "组織.hk",
      "網絡.hk",
      "网絡.hk",
      "组织.hk",
      "組織.hk",
      "組织.hk",
      "hm",
      "hn",
      "com.hn",
      "edu.hn",
      "org.hn",
      "net.hn",
      "mil.hn",
      "gob.hn",
      "hr",
      "iz.hr",
      "from.hr",
      "name.hr",
      "com.hr",
      "ht",
      "com.ht",
      "shop.ht",
      "firm.ht",
      "info.ht",
      "adult.ht",
      "net.ht",
      "pro.ht",
      "org.ht",
      "med.ht",
      "art.ht",
      "coop.ht",
      "pol.ht",
      "asso.ht",
      "edu.ht",
      "rel.ht",
      "gouv.ht",
      "perso.ht",
      "hu",
      "co.hu",
      "info.hu",
      "org.hu",
      "priv.hu",
      "sport.hu",
      "tm.hu",
      "2000.hu",
      "agrar.hu",
      "bolt.hu",
      "casino.hu",
      "city.hu",
      "erotica.hu",
      "erotika.hu",
      "film.hu",
      "forum.hu",
      "games.hu",
      "hotel.hu",
      "ingatlan.hu",
      "jogasz.hu",
      "konyvelo.hu",
      "lakas.hu",
      "media.hu",
      "news.hu",
      "reklam.hu",
      "sex.hu",
      "shop.hu",
      "suli.hu",
      "szex.hu",
      "tozsde.hu",
      "utazas.hu",
      "video.hu",
      "id",
      "ac.id",
      "biz.id",
      "co.id",
      "desa.id",
      "go.id",
      "mil.id",
      "my.id",
      "net.id",
      "or.id",
      "ponpes.id",
      "sch.id",
      "web.id",
      "ie",
      "gov.ie",
      "il",
      "ac.il",
      "co.il",
      "gov.il",
      "idf.il",
      "k12.il",
      "muni.il",
      "net.il",
      "org.il",
      "im",
      "ac.im",
      "co.im",
      "com.im",
      "ltd.co.im",
      "net.im",
      "org.im",
      "plc.co.im",
      "tt.im",
      "tv.im",
      "in",
      "co.in",
      "firm.in",
      "net.in",
      "org.in",
      "gen.in",
      "ind.in",
      "nic.in",
      "ac.in",
      "edu.in",
      "res.in",
      "gov.in",
      "mil.in",
      "info",
      "int",
      "eu.int",
      "io",
      "com.io",
      "iq",
      "gov.iq",
      "edu.iq",
      "mil.iq",
      "com.iq",
      "org.iq",
      "net.iq",
      "ir",
      "ac.ir",
      "co.ir",
      "gov.ir",
      "id.ir",
      "net.ir",
      "org.ir",
      "sch.ir",
      "ایران.ir",
      "ايران.ir",
      "is",
      "net.is",
      "com.is",
      "edu.is",
      "gov.is",
      "org.is",
      "int.is",
      "it",
      "gov.it",
      "edu.it",
      "abr.it",
      "abruzzo.it",
      "aosta-valley.it",
      "aostavalley.it",
      "bas.it",
      "basilicata.it",
      "cal.it",
      "calabria.it",
      "cam.it",
      "campania.it",
      "emilia-romagna.it",
      "emiliaromagna.it",
      "emr.it",
      "friuli-v-giulia.it",
      "friuli-ve-giulia.it",
      "friuli-vegiulia.it",
      "friuli-venezia-giulia.it",
      "friuli-veneziagiulia.it",
      "friuli-vgiulia.it",
      "friuliv-giulia.it",
      "friulive-giulia.it",
      "friulivegiulia.it",
      "friulivenezia-giulia.it",
      "friuliveneziagiulia.it",
      "friulivgiulia.it",
      "fvg.it",
      "laz.it",
      "lazio.it",
      "lig.it",
      "liguria.it",
      "lom.it",
      "lombardia.it",
      "lombardy.it",
      "lucania.it",
      "mar.it",
      "marche.it",
      "mol.it",
      "molise.it",
      "piedmont.it",
      "piemonte.it",
      "pmn.it",
      "pug.it",
      "puglia.it",
      "sar.it",
      "sardegna.it",
      "sardinia.it",
      "sic.it",
      "sicilia.it",
      "sicily.it",
      "taa.it",
      "tos.it",
      "toscana.it",
      "trentin-sud-tirol.it",
      "trentin-süd-tirol.it",
      "trentin-sudtirol.it",
      "trentin-südtirol.it",
      "trentin-sued-tirol.it",
      "trentin-suedtirol.it",
      "trentino-a-adige.it",
      "trentino-aadige.it",
      "trentino-alto-adige.it",
      "trentino-altoadige.it",
      "trentino-s-tirol.it",
      "trentino-stirol.it",
      "trentino-sud-tirol.it",
      "trentino-süd-tirol.it",
      "trentino-sudtirol.it",
      "trentino-südtirol.it",
      "trentino-sued-tirol.it",
      "trentino-suedtirol.it",
      "trentino.it",
      "trentinoa-adige.it",
      "trentinoaadige.it",
      "trentinoalto-adige.it",
      "trentinoaltoadige.it",
      "trentinos-tirol.it",
      "trentinostirol.it",
      "trentinosud-tirol.it",
      "trentinosüd-tirol.it",
      "trentinosudtirol.it",
      "trentinosüdtirol.it",
      "trentinosued-tirol.it",
      "trentinosuedtirol.it",
      "trentinsud-tirol.it",
      "trentinsüd-tirol.it",
      "trentinsudtirol.it",
      "trentinsüdtirol.it",
      "trentinsued-tirol.it",
      "trentinsuedtirol.it",
      "tuscany.it",
      "umb.it",
      "umbria.it",
      "val-d-aosta.it",
      "val-daosta.it",
      "vald-aosta.it",
      "valdaosta.it",
      "valle-aosta.it",
      "valle-d-aosta.it",
      "valle-daosta.it",
      "valleaosta.it",
      "valled-aosta.it",
      "valledaosta.it",
      "vallee-aoste.it",
      "vallée-aoste.it",
      "vallee-d-aoste.it",
      "vallée-d-aoste.it",
      "valleeaoste.it",
      "valléeaoste.it",
      "valleedaoste.it",
      "valléedaoste.it",
      "vao.it",
      "vda.it",
      "ven.it",
      "veneto.it",
      "ag.it",
      "agrigento.it",
      "al.it",
      "alessandria.it",
      "alto-adige.it",
      "altoadige.it",
      "an.it",
      "ancona.it",
      "andria-barletta-trani.it",
      "andria-trani-barletta.it",
      "andriabarlettatrani.it",
      "andriatranibarletta.it",
      "ao.it",
      "aosta.it",
      "aoste.it",
      "ap.it",
      "aq.it",
      "aquila.it",
      "ar.it",
      "arezzo.it",
      "ascoli-piceno.it",
      "ascolipiceno.it",
      "asti.it",
      "at.it",
      "av.it",
      "avellino.it",
      "ba.it",
      "balsan-sudtirol.it",
      "balsan-südtirol.it",
      "balsan-suedtirol.it",
      "balsan.it",
      "bari.it",
      "barletta-trani-andria.it",
      "barlettatraniandria.it",
      "belluno.it",
      "benevento.it",
      "bergamo.it",
      "bg.it",
      "bi.it",
      "biella.it",
      "bl.it",
      "bn.it",
      "bo.it",
      "bologna.it",
      "bolzano-altoadige.it",
      "bolzano.it",
      "bozen-sudtirol.it",
      "bozen-südtirol.it",
      "bozen-suedtirol.it",
      "bozen.it",
      "br.it",
      "brescia.it",
      "brindisi.it",
      "bs.it",
      "bt.it",
      "bulsan-sudtirol.it",
      "bulsan-südtirol.it",
      "bulsan-suedtirol.it",
      "bulsan.it",
      "bz.it",
      "ca.it",
      "cagliari.it",
      "caltanissetta.it",
      "campidano-medio.it",
      "campidanomedio.it",
      "campobasso.it",
      "carbonia-iglesias.it",
      "carboniaiglesias.it",
      "carrara-massa.it",
      "carraramassa.it",
      "caserta.it",
      "catania.it",
      "catanzaro.it",
      "cb.it",
      "ce.it",
      "cesena-forli.it",
      "cesena-forlì.it",
      "cesenaforli.it",
      "cesenaforlì.it",
      "ch.it",
      "chieti.it",
      "ci.it",
      "cl.it",
      "cn.it",
      "co.it",
      "como.it",
      "cosenza.it",
      "cr.it",
      "cremona.it",
      "crotone.it",
      "cs.it",
      "ct.it",
      "cuneo.it",
      "cz.it",
      "dell-ogliastra.it",
      "dellogliastra.it",
      "en.it",
      "enna.it",
      "fc.it",
      "fe.it",
      "fermo.it",
      "ferrara.it",
      "fg.it",
      "fi.it",
      "firenze.it",
      "florence.it",
      "fm.it",
      "foggia.it",
      "forli-cesena.it",
      "forlì-cesena.it",
      "forlicesena.it",
      "forlìcesena.it",
      "fr.it",
      "frosinone.it",
      "ge.it",
      "genoa.it",
      "genova.it",
      "go.it",
      "gorizia.it",
      "gr.it",
      "grosseto.it",
      "iglesias-carbonia.it",
      "iglesiascarbonia.it",
      "im.it",
      "imperia.it",
      "is.it",
      "isernia.it",
      "kr.it",
      "la-spezia.it",
      "laquila.it",
      "laspezia.it",
      "latina.it",
      "lc.it",
      "le.it",
      "lecce.it",
      "lecco.it",
      "li.it",
      "livorno.it",
      "lo.it",
      "lodi.it",
      "lt.it",
      "lu.it",
      "lucca.it",
      "macerata.it",
      "mantova.it",
      "massa-carrara.it",
      "massacarrara.it",
      "matera.it",
      "mb.it",
      "mc.it",
      "me.it",
      "medio-campidano.it",
      "mediocampidano.it",
      "messina.it",
      "mi.it",
      "milan.it",
      "milano.it",
      "mn.it",
      "mo.it",
      "modena.it",
      "monza-brianza.it",
      "monza-e-della-brianza.it",
      "monza.it",
      "monzabrianza.it",
      "monzaebrianza.it",
      "monzaedellabrianza.it",
      "ms.it",
      "mt.it",
      "na.it",
      "naples.it",
      "napoli.it",
      "no.it",
      "novara.it",
      "nu.it",
      "nuoro.it",
      "og.it",
      "ogliastra.it",
      "olbia-tempio.it",
      "olbiatempio.it",
      "or.it",
      "oristano.it",
      "ot.it",
      "pa.it",
      "padova.it",
      "padua.it",
      "palermo.it",
      "parma.it",
      "pavia.it",
      "pc.it",
      "pd.it",
      "pe.it",
      "perugia.it",
      "pesaro-urbino.it",
      "pesarourbino.it",
      "pescara.it",
      "pg.it",
      "pi.it",
      "piacenza.it",
      "pisa.it",
      "pistoia.it",
      "pn.it",
      "po.it",
      "pordenone.it",
      "potenza.it",
      "pr.it",
      "prato.it",
      "pt.it",
      "pu.it",
      "pv.it",
      "pz.it",
      "ra.it",
      "ragusa.it",
      "ravenna.it",
      "rc.it",
      "re.it",
      "reggio-calabria.it",
      "reggio-emilia.it",
      "reggiocalabria.it",
      "reggioemilia.it",
      "rg.it",
      "ri.it",
      "rieti.it",
      "rimini.it",
      "rm.it",
      "rn.it",
      "ro.it",
      "roma.it",
      "rome.it",
      "rovigo.it",
      "sa.it",
      "salerno.it",
      "sassari.it",
      "savona.it",
      "si.it",
      "siena.it",
      "siracusa.it",
      "so.it",
      "sondrio.it",
      "sp.it",
      "sr.it",
      "ss.it",
      "suedtirol.it",
      "südtirol.it",
      "sv.it",
      "ta.it",
      "taranto.it",
      "te.it",
      "tempio-olbia.it",
      "tempioolbia.it",
      "teramo.it",
      "terni.it",
      "tn.it",
      "to.it",
      "torino.it",
      "tp.it",
      "tr.it",
      "trani-andria-barletta.it",
      "trani-barletta-andria.it",
      "traniandriabarletta.it",
      "tranibarlettaandria.it",
      "trapani.it",
      "trento.it",
      "treviso.it",
      "trieste.it",
      "ts.it",
      "turin.it",
      "tv.it",
      "ud.it",
      "udine.it",
      "urbino-pesaro.it",
      "urbinopesaro.it",
      "va.it",
      "varese.it",
      "vb.it",
      "vc.it",
      "ve.it",
      "venezia.it",
      "venice.it",
      "verbania.it",
      "vercelli.it",
      "verona.it",
      "vi.it",
      "vibo-valentia.it",
      "vibovalentia.it",
      "vicenza.it",
      "viterbo.it",
      "vr.it",
      "vs.it",
      "vt.it",
      "vv.it",
      "je",
      "co.je",
      "net.je",
      "org.je",
      "*.jm",
      "jo",
      "com.jo",
      "org.jo",
      "net.jo",
      "edu.jo",
      "sch.jo",
      "gov.jo",
      "mil.jo",
      "name.jo",
      "jobs",
      "jp",
      "ac.jp",
      "ad.jp",
      "co.jp",
      "ed.jp",
      "go.jp",
      "gr.jp",
      "lg.jp",
      "ne.jp",
      "or.jp",
      "aichi.jp",
      "akita.jp",
      "aomori.jp",
      "chiba.jp",
      "ehime.jp",
      "fukui.jp",
      "fukuoka.jp",
      "fukushima.jp",
      "gifu.jp",
      "gunma.jp",
      "hiroshima.jp",
      "hokkaido.jp",
      "hyogo.jp",
      "ibaraki.jp",
      "ishikawa.jp",
      "iwate.jp",
      "kagawa.jp",
      "kagoshima.jp",
      "kanagawa.jp",
      "kochi.jp",
      "kumamoto.jp",
      "kyoto.jp",
      "mie.jp",
      "miyagi.jp",
      "miyazaki.jp",
      "nagano.jp",
      "nagasaki.jp",
      "nara.jp",
      "niigata.jp",
      "oita.jp",
      "okayama.jp",
      "okinawa.jp",
      "osaka.jp",
      "saga.jp",
      "saitama.jp",
      "shiga.jp",
      "shimane.jp",
      "shizuoka.jp",
      "tochigi.jp",
      "tokushima.jp",
      "tokyo.jp",
      "tottori.jp",
      "toyama.jp",
      "wakayama.jp",
      "yamagata.jp",
      "yamaguchi.jp",
      "yamanashi.jp",
      "栃木.jp",
      "愛知.jp",
      "愛媛.jp",
      "兵庫.jp",
      "熊本.jp",
      "茨城.jp",
      "北海道.jp",
      "千葉.jp",
      "和歌山.jp",
      "長崎.jp",
      "長野.jp",
      "新潟.jp",
      "青森.jp",
      "静岡.jp",
      "東京.jp",
      "石川.jp",
      "埼玉.jp",
      "三重.jp",
      "京都.jp",
      "佐賀.jp",
      "大分.jp",
      "大阪.jp",
      "奈良.jp",
      "宮城.jp",
      "宮崎.jp",
      "富山.jp",
      "山口.jp",
      "山形.jp",
      "山梨.jp",
      "岩手.jp",
      "岐阜.jp",
      "岡山.jp",
      "島根.jp",
      "広島.jp",
      "徳島.jp",
      "沖縄.jp",
      "滋賀.jp",
      "神奈川.jp",
      "福井.jp",
      "福岡.jp",
      "福島.jp",
      "秋田.jp",
      "群馬.jp",
      "香川.jp",
      "高知.jp",
      "鳥取.jp",
      "鹿児島.jp",
      "*.kawasaki.jp",
      "*.kitakyushu.jp",
      "*.kobe.jp",
      "*.nagoya.jp",
      "*.sapporo.jp",
      "*.sendai.jp",
      "*.yokohama.jp",
      "!city.kawasaki.jp",
      "!city.kitakyushu.jp",
      "!city.kobe.jp",
      "!city.nagoya.jp",
      "!city.sapporo.jp",
      "!city.sendai.jp",
      "!city.yokohama.jp",
      "aisai.aichi.jp",
      "ama.aichi.jp",
      "anjo.aichi.jp",
      "asuke.aichi.jp",
      "chiryu.aichi.jp",
      "chita.aichi.jp",
      "fuso.aichi.jp",
      "gamagori.aichi.jp",
      "handa.aichi.jp",
      "hazu.aichi.jp",
      "hekinan.aichi.jp",
      "higashiura.aichi.jp",
      "ichinomiya.aichi.jp",
      "inazawa.aichi.jp",
      "inuyama.aichi.jp",
      "isshiki.aichi.jp",
      "iwakura.aichi.jp",
      "kanie.aichi.jp",
      "kariya.aichi.jp",
      "kasugai.aichi.jp",
      "kira.aichi.jp",
      "kiyosu.aichi.jp",
      "komaki.aichi.jp",
      "konan.aichi.jp",
      "kota.aichi.jp",
      "mihama.aichi.jp",
      "miyoshi.aichi.jp",
      "nishio.aichi.jp",
      "nisshin.aichi.jp",
      "obu.aichi.jp",
      "oguchi.aichi.jp",
      "oharu.aichi.jp",
      "okazaki.aichi.jp",
      "owariasahi.aichi.jp",
      "seto.aichi.jp",
      "shikatsu.aichi.jp",
      "shinshiro.aichi.jp",
      "shitara.aichi.jp",
      "tahara.aichi.jp",
      "takahama.aichi.jp",
      "tobishima.aichi.jp",
      "toei.aichi.jp",
      "togo.aichi.jp",
      "tokai.aichi.jp",
      "tokoname.aichi.jp",
      "toyoake.aichi.jp",
      "toyohashi.aichi.jp",
      "toyokawa.aichi.jp",
      "toyone.aichi.jp",
      "toyota.aichi.jp",
      "tsushima.aichi.jp",
      "yatomi.aichi.jp",
      "akita.akita.jp",
      "daisen.akita.jp",
      "fujisato.akita.jp",
      "gojome.akita.jp",
      "hachirogata.akita.jp",
      "happou.akita.jp",
      "higashinaruse.akita.jp",
      "honjo.akita.jp",
      "honjyo.akita.jp",
      "ikawa.akita.jp",
      "kamikoani.akita.jp",
      "kamioka.akita.jp",
      "katagami.akita.jp",
      "kazuno.akita.jp",
      "kitaakita.akita.jp",
      "kosaka.akita.jp",
      "kyowa.akita.jp",
      "misato.akita.jp",
      "mitane.akita.jp",
      "moriyoshi.akita.jp",
      "nikaho.akita.jp",
      "noshiro.akita.jp",
      "odate.akita.jp",
      "oga.akita.jp",
      "ogata.akita.jp",
      "semboku.akita.jp",
      "yokote.akita.jp",
      "yurihonjo.akita.jp",
      "aomori.aomori.jp",
      "gonohe.aomori.jp",
      "hachinohe.aomori.jp",
      "hashikami.aomori.jp",
      "hiranai.aomori.jp",
      "hirosaki.aomori.jp",
      "itayanagi.aomori.jp",
      "kuroishi.aomori.jp",
      "misawa.aomori.jp",
      "mutsu.aomori.jp",
      "nakadomari.aomori.jp",
      "noheji.aomori.jp",
      "oirase.aomori.jp",
      "owani.aomori.jp",
      "rokunohe.aomori.jp",
      "sannohe.aomori.jp",
      "shichinohe.aomori.jp",
      "shingo.aomori.jp",
      "takko.aomori.jp",
      "towada.aomori.jp",
      "tsugaru.aomori.jp",
      "tsuruta.aomori.jp",
      "abiko.chiba.jp",
      "asahi.chiba.jp",
      "chonan.chiba.jp",
      "chosei.chiba.jp",
      "choshi.chiba.jp",
      "chuo.chiba.jp",
      "funabashi.chiba.jp",
      "futtsu.chiba.jp",
      "hanamigawa.chiba.jp",
      "ichihara.chiba.jp",
      "ichikawa.chiba.jp",
      "ichinomiya.chiba.jp",
      "inzai.chiba.jp",
      "isumi.chiba.jp",
      "kamagaya.chiba.jp",
      "kamogawa.chiba.jp",
      "kashiwa.chiba.jp",
      "katori.chiba.jp",
      "katsuura.chiba.jp",
      "kimitsu.chiba.jp",
      "kisarazu.chiba.jp",
      "kozaki.chiba.jp",
      "kujukuri.chiba.jp",
      "kyonan.chiba.jp",
      "matsudo.chiba.jp",
      "midori.chiba.jp",
      "mihama.chiba.jp",
      "minamiboso.chiba.jp",
      "mobara.chiba.jp",
      "mutsuzawa.chiba.jp",
      "nagara.chiba.jp",
      "nagareyama.chiba.jp",
      "narashino.chiba.jp",
      "narita.chiba.jp",
      "noda.chiba.jp",
      "oamishirasato.chiba.jp",
      "omigawa.chiba.jp",
      "onjuku.chiba.jp",
      "otaki.chiba.jp",
      "sakae.chiba.jp",
      "sakura.chiba.jp",
      "shimofusa.chiba.jp",
      "shirako.chiba.jp",
      "shiroi.chiba.jp",
      "shisui.chiba.jp",
      "sodegaura.chiba.jp",
      "sosa.chiba.jp",
      "tako.chiba.jp",
      "tateyama.chiba.jp",
      "togane.chiba.jp",
      "tohnosho.chiba.jp",
      "tomisato.chiba.jp",
      "urayasu.chiba.jp",
      "yachimata.chiba.jp",
      "yachiyo.chiba.jp",
      "yokaichiba.chiba.jp",
      "yokoshibahikari.chiba.jp",
      "yotsukaido.chiba.jp",
      "ainan.ehime.jp",
      "honai.ehime.jp",
      "ikata.ehime.jp",
      "imabari.ehime.jp",
      "iyo.ehime.jp",
      "kamijima.ehime.jp",
      "kihoku.ehime.jp",
      "kumakogen.ehime.jp",
      "masaki.ehime.jp",
      "matsuno.ehime.jp",
      "matsuyama.ehime.jp",
      "namikata.ehime.jp",
      "niihama.ehime.jp",
      "ozu.ehime.jp",
      "saijo.ehime.jp",
      "seiyo.ehime.jp",
      "shikokuchuo.ehime.jp",
      "tobe.ehime.jp",
      "toon.ehime.jp",
      "uchiko.ehime.jp",
      "uwajima.ehime.jp",
      "yawatahama.ehime.jp",
      "echizen.fukui.jp",
      "eiheiji.fukui.jp",
      "fukui.fukui.jp",
      "ikeda.fukui.jp",
      "katsuyama.fukui.jp",
      "mihama.fukui.jp",
      "minamiechizen.fukui.jp",
      "obama.fukui.jp",
      "ohi.fukui.jp",
      "ono.fukui.jp",
      "sabae.fukui.jp",
      "sakai.fukui.jp",
      "takahama.fukui.jp",
      "tsuruga.fukui.jp",
      "wakasa.fukui.jp",
      "ashiya.fukuoka.jp",
      "buzen.fukuoka.jp",
      "chikugo.fukuoka.jp",
      "chikuho.fukuoka.jp",
      "chikujo.fukuoka.jp",
      "chikushino.fukuoka.jp",
      "chikuzen.fukuoka.jp",
      "chuo.fukuoka.jp",
      "dazaifu.fukuoka.jp",
      "fukuchi.fukuoka.jp",
      "hakata.fukuoka.jp",
      "higashi.fukuoka.jp",
      "hirokawa.fukuoka.jp",
      "hisayama.fukuoka.jp",
      "iizuka.fukuoka.jp",
      "inatsuki.fukuoka.jp",
      "kaho.fukuoka.jp",
      "kasuga.fukuoka.jp",
      "kasuya.fukuoka.jp",
      "kawara.fukuoka.jp",
      "keisen.fukuoka.jp",
      "koga.fukuoka.jp",
      "kurate.fukuoka.jp",
      "kurogi.fukuoka.jp",
      "kurume.fukuoka.jp",
      "minami.fukuoka.jp",
      "miyako.fukuoka.jp",
      "miyama.fukuoka.jp",
      "miyawaka.fukuoka.jp",
      "mizumaki.fukuoka.jp",
      "munakata.fukuoka.jp",
      "nakagawa.fukuoka.jp",
      "nakama.fukuoka.jp",
      "nishi.fukuoka.jp",
      "nogata.fukuoka.jp",
      "ogori.fukuoka.jp",
      "okagaki.fukuoka.jp",
      "okawa.fukuoka.jp",
      "oki.fukuoka.jp",
      "omuta.fukuoka.jp",
      "onga.fukuoka.jp",
      "onojo.fukuoka.jp",
      "oto.fukuoka.jp",
      "saigawa.fukuoka.jp",
      "sasaguri.fukuoka.jp",
      "shingu.fukuoka.jp",
      "shinyoshitomi.fukuoka.jp",
      "shonai.fukuoka.jp",
      "soeda.fukuoka.jp",
      "sue.fukuoka.jp",
      "tachiarai.fukuoka.jp",
      "tagawa.fukuoka.jp",
      "takata.fukuoka.jp",
      "toho.fukuoka.jp",
      "toyotsu.fukuoka.jp",
      "tsuiki.fukuoka.jp",
      "ukiha.fukuoka.jp",
      "umi.fukuoka.jp",
      "usui.fukuoka.jp",
      "yamada.fukuoka.jp",
      "yame.fukuoka.jp",
      "yanagawa.fukuoka.jp",
      "yukuhashi.fukuoka.jp",
      "aizubange.fukushima.jp",
      "aizumisato.fukushima.jp",
      "aizuwakamatsu.fukushima.jp",
      "asakawa.fukushima.jp",
      "bandai.fukushima.jp",
      "date.fukushima.jp",
      "fukushima.fukushima.jp",
      "furudono.fukushima.jp",
      "futaba.fukushima.jp",
      "hanawa.fukushima.jp",
      "higashi.fukushima.jp",
      "hirata.fukushima.jp",
      "hirono.fukushima.jp",
      "iitate.fukushima.jp",
      "inawashiro.fukushima.jp",
      "ishikawa.fukushima.jp",
      "iwaki.fukushima.jp",
      "izumizaki.fukushima.jp",
      "kagamiishi.fukushima.jp",
      "kaneyama.fukushima.jp",
      "kawamata.fukushima.jp",
      "kitakata.fukushima.jp",
      "kitashiobara.fukushima.jp",
      "koori.fukushima.jp",
      "koriyama.fukushima.jp",
      "kunimi.fukushima.jp",
      "miharu.fukushima.jp",
      "mishima.fukushima.jp",
      "namie.fukushima.jp",
      "nango.fukushima.jp",
      "nishiaizu.fukushima.jp",
      "nishigo.fukushima.jp",
      "okuma.fukushima.jp",
      "omotego.fukushima.jp",
      "ono.fukushima.jp",
      "otama.fukushima.jp",
      "samegawa.fukushima.jp",
      "shimogo.fukushima.jp",
      "shirakawa.fukushima.jp",
      "showa.fukushima.jp",
      "soma.fukushima.jp",
      "sukagawa.fukushima.jp",
      "taishin.fukushima.jp",
      "tamakawa.fukushima.jp",
      "tanagura.fukushima.jp",
      "tenei.fukushima.jp",
      "yabuki.fukushima.jp",
      "yamato.fukushima.jp",
      "yamatsuri.fukushima.jp",
      "yanaizu.fukushima.jp",
      "yugawa.fukushima.jp",
      "anpachi.gifu.jp",
      "ena.gifu.jp",
      "gifu.gifu.jp",
      "ginan.gifu.jp",
      "godo.gifu.jp",
      "gujo.gifu.jp",
      "hashima.gifu.jp",
      "hichiso.gifu.jp",
      "hida.gifu.jp",
      "higashishirakawa.gifu.jp",
      "ibigawa.gifu.jp",
      "ikeda.gifu.jp",
      "kakamigahara.gifu.jp",
      "kani.gifu.jp",
      "kasahara.gifu.jp",
      "kasamatsu.gifu.jp",
      "kawaue.gifu.jp",
      "kitagata.gifu.jp",
      "mino.gifu.jp",
      "minokamo.gifu.jp",
      "mitake.gifu.jp",
      "mizunami.gifu.jp",
      "motosu.gifu.jp",
      "nakatsugawa.gifu.jp",
      "ogaki.gifu.jp",
      "sakahogi.gifu.jp",
      "seki.gifu.jp",
      "sekigahara.gifu.jp",
      "shirakawa.gifu.jp",
      "tajimi.gifu.jp",
      "takayama.gifu.jp",
      "tarui.gifu.jp",
      "toki.gifu.jp",
      "tomika.gifu.jp",
      "wanouchi.gifu.jp",
      "yamagata.gifu.jp",
      "yaotsu.gifu.jp",
      "yoro.gifu.jp",
      "annaka.gunma.jp",
      "chiyoda.gunma.jp",
      "fujioka.gunma.jp",
      "higashiagatsuma.gunma.jp",
      "isesaki.gunma.jp",
      "itakura.gunma.jp",
      "kanna.gunma.jp",
      "kanra.gunma.jp",
      "katashina.gunma.jp",
      "kawaba.gunma.jp",
      "kiryu.gunma.jp",
      "kusatsu.gunma.jp",
      "maebashi.gunma.jp",
      "meiwa.gunma.jp",
      "midori.gunma.jp",
      "minakami.gunma.jp",
      "naganohara.gunma.jp",
      "nakanojo.gunma.jp",
      "nanmoku.gunma.jp",
      "numata.gunma.jp",
      "oizumi.gunma.jp",
      "ora.gunma.jp",
      "ota.gunma.jp",
      "shibukawa.gunma.jp",
      "shimonita.gunma.jp",
      "shinto.gunma.jp",
      "showa.gunma.jp",
      "takasaki.gunma.jp",
      "takayama.gunma.jp",
      "tamamura.gunma.jp",
      "tatebayashi.gunma.jp",
      "tomioka.gunma.jp",
      "tsukiyono.gunma.jp",
      "tsumagoi.gunma.jp",
      "ueno.gunma.jp",
      "yoshioka.gunma.jp",
      "asaminami.hiroshima.jp",
      "daiwa.hiroshima.jp",
      "etajima.hiroshima.jp",
      "fuchu.hiroshima.jp",
      "fukuyama.hiroshima.jp",
      "hatsukaichi.hiroshima.jp",
      "higashihiroshima.hiroshima.jp",
      "hongo.hiroshima.jp",
      "jinsekikogen.hiroshima.jp",
      "kaita.hiroshima.jp",
      "kui.hiroshima.jp",
      "kumano.hiroshima.jp",
      "kure.hiroshima.jp",
      "mihara.hiroshima.jp",
      "miyoshi.hiroshima.jp",
      "naka.hiroshima.jp",
      "onomichi.hiroshima.jp",
      "osakikamijima.hiroshima.jp",
      "otake.hiroshima.jp",
      "saka.hiroshima.jp",
      "sera.hiroshima.jp",
      "seranishi.hiroshima.jp",
      "shinichi.hiroshima.jp",
      "shobara.hiroshima.jp",
      "takehara.hiroshima.jp",
      "abashiri.hokkaido.jp",
      "abira.hokkaido.jp",
      "aibetsu.hokkaido.jp",
      "akabira.hokkaido.jp",
      "akkeshi.hokkaido.jp",
      "asahikawa.hokkaido.jp",
      "ashibetsu.hokkaido.jp",
      "ashoro.hokkaido.jp",
      "assabu.hokkaido.jp",
      "atsuma.hokkaido.jp",
      "bibai.hokkaido.jp",
      "biei.hokkaido.jp",
      "bifuka.hokkaido.jp",
      "bihoro.hokkaido.jp",
      "biratori.hokkaido.jp",
      "chippubetsu.hokkaido.jp",
      "chitose.hokkaido.jp",
      "date.hokkaido.jp",
      "ebetsu.hokkaido.jp",
      "embetsu.hokkaido.jp",
      "eniwa.hokkaido.jp",
      "erimo.hokkaido.jp",
      "esan.hokkaido.jp",
      "esashi.hokkaido.jp",
      "fukagawa.hokkaido.jp",
      "fukushima.hokkaido.jp",
      "furano.hokkaido.jp",
      "furubira.hokkaido.jp",
      "haboro.hokkaido.jp",
      "hakodate.hokkaido.jp",
      "hamatonbetsu.hokkaido.jp",
      "hidaka.hokkaido.jp",
      "higashikagura.hokkaido.jp",
      "higashikawa.hokkaido.jp",
      "hiroo.hokkaido.jp",
      "hokuryu.hokkaido.jp",
      "hokuto.hokkaido.jp",
      "honbetsu.hokkaido.jp",
      "horokanai.hokkaido.jp",
      "horonobe.hokkaido.jp",
      "ikeda.hokkaido.jp",
      "imakane.hokkaido.jp",
      "ishikari.hokkaido.jp",
      "iwamizawa.hokkaido.jp",
      "iwanai.hokkaido.jp",
      "kamifurano.hokkaido.jp",
      "kamikawa.hokkaido.jp",
      "kamishihoro.hokkaido.jp",
      "kamisunagawa.hokkaido.jp",
      "kamoenai.hokkaido.jp",
      "kayabe.hokkaido.jp",
      "kembuchi.hokkaido.jp",
      "kikonai.hokkaido.jp",
      "kimobetsu.hokkaido.jp",
      "kitahiroshima.hokkaido.jp",
      "kitami.hokkaido.jp",
      "kiyosato.hokkaido.jp",
      "koshimizu.hokkaido.jp",
      "kunneppu.hokkaido.jp",
      "kuriyama.hokkaido.jp",
      "kuromatsunai.hokkaido.jp",
      "kushiro.hokkaido.jp",
      "kutchan.hokkaido.jp",
      "kyowa.hokkaido.jp",
      "mashike.hokkaido.jp",
      "matsumae.hokkaido.jp",
      "mikasa.hokkaido.jp",
      "minamifurano.hokkaido.jp",
      "mombetsu.hokkaido.jp",
      "moseushi.hokkaido.jp",
      "mukawa.hokkaido.jp",
      "muroran.hokkaido.jp",
      "naie.hokkaido.jp",
      "nakagawa.hokkaido.jp",
      "nakasatsunai.hokkaido.jp",
      "nakatombetsu.hokkaido.jp",
      "nanae.hokkaido.jp",
      "nanporo.hokkaido.jp",
      "nayoro.hokkaido.jp",
      "nemuro.hokkaido.jp",
      "niikappu.hokkaido.jp",
      "niki.hokkaido.jp",
      "nishiokoppe.hokkaido.jp",
      "noboribetsu.hokkaido.jp",
      "numata.hokkaido.jp",
      "obihiro.hokkaido.jp",
      "obira.hokkaido.jp",
      "oketo.hokkaido.jp",
      "okoppe.hokkaido.jp",
      "otaru.hokkaido.jp",
      "otobe.hokkaido.jp",
      "otofuke.hokkaido.jp",
      "otoineppu.hokkaido.jp",
      "oumu.hokkaido.jp",
      "ozora.hokkaido.jp",
      "pippu.hokkaido.jp",
      "rankoshi.hokkaido.jp",
      "rebun.hokkaido.jp",
      "rikubetsu.hokkaido.jp",
      "rishiri.hokkaido.jp",
      "rishirifuji.hokkaido.jp",
      "saroma.hokkaido.jp",
      "sarufutsu.hokkaido.jp",
      "shakotan.hokkaido.jp",
      "shari.hokkaido.jp",
      "shibecha.hokkaido.jp",
      "shibetsu.hokkaido.jp",
      "shikabe.hokkaido.jp",
      "shikaoi.hokkaido.jp",
      "shimamaki.hokkaido.jp",
      "shimizu.hokkaido.jp",
      "shimokawa.hokkaido.jp",
      "shinshinotsu.hokkaido.jp",
      "shintoku.hokkaido.jp",
      "shiranuka.hokkaido.jp",
      "shiraoi.hokkaido.jp",
      "shiriuchi.hokkaido.jp",
      "sobetsu.hokkaido.jp",
      "sunagawa.hokkaido.jp",
      "taiki.hokkaido.jp",
      "takasu.hokkaido.jp",
      "takikawa.hokkaido.jp",
      "takinoue.hokkaido.jp",
      "teshikaga.hokkaido.jp",
      "tobetsu.hokkaido.jp",
      "tohma.hokkaido.jp",
      "tomakomai.hokkaido.jp",
      "tomari.hokkaido.jp",
      "toya.hokkaido.jp",
      "toyako.hokkaido.jp",
      "toyotomi.hokkaido.jp",
      "toyoura.hokkaido.jp",
      "tsubetsu.hokkaido.jp",
      "tsukigata.hokkaido.jp",
      "urakawa.hokkaido.jp",
      "urausu.hokkaido.jp",
      "uryu.hokkaido.jp",
      "utashinai.hokkaido.jp",
      "wakkanai.hokkaido.jp",
      "wassamu.hokkaido.jp",
      "yakumo.hokkaido.jp",
      "yoichi.hokkaido.jp",
      "aioi.hyogo.jp",
      "akashi.hyogo.jp",
      "ako.hyogo.jp",
      "amagasaki.hyogo.jp",
      "aogaki.hyogo.jp",
      "asago.hyogo.jp",
      "ashiya.hyogo.jp",
      "awaji.hyogo.jp",
      "fukusaki.hyogo.jp",
      "goshiki.hyogo.jp",
      "harima.hyogo.jp",
      "himeji.hyogo.jp",
      "ichikawa.hyogo.jp",
      "inagawa.hyogo.jp",
      "itami.hyogo.jp",
      "kakogawa.hyogo.jp",
      "kamigori.hyogo.jp",
      "kamikawa.hyogo.jp",
      "kasai.hyogo.jp",
      "kasuga.hyogo.jp",
      "kawanishi.hyogo.jp",
      "miki.hyogo.jp",
      "minamiawaji.hyogo.jp",
      "nishinomiya.hyogo.jp",
      "nishiwaki.hyogo.jp",
      "ono.hyogo.jp",
      "sanda.hyogo.jp",
      "sannan.hyogo.jp",
      "sasayama.hyogo.jp",
      "sayo.hyogo.jp",
      "shingu.hyogo.jp",
      "shinonsen.hyogo.jp",
      "shiso.hyogo.jp",
      "sumoto.hyogo.jp",
      "taishi.hyogo.jp",
      "taka.hyogo.jp",
      "takarazuka.hyogo.jp",
      "takasago.hyogo.jp",
      "takino.hyogo.jp",
      "tamba.hyogo.jp",
      "tatsuno.hyogo.jp",
      "toyooka.hyogo.jp",
      "yabu.hyogo.jp",
      "yashiro.hyogo.jp",
      "yoka.hyogo.jp",
      "yokawa.hyogo.jp",
      "ami.ibaraki.jp",
      "asahi.ibaraki.jp",
      "bando.ibaraki.jp",
      "chikusei.ibaraki.jp",
      "daigo.ibaraki.jp",
      "fujishiro.ibaraki.jp",
      "hitachi.ibaraki.jp",
      "hitachinaka.ibaraki.jp",
      "hitachiomiya.ibaraki.jp",
      "hitachiota.ibaraki.jp",
      "ibaraki.ibaraki.jp",
      "ina.ibaraki.jp",
      "inashiki.ibaraki.jp",
      "itako.ibaraki.jp",
      "iwama.ibaraki.jp",
      "joso.ibaraki.jp",
      "kamisu.ibaraki.jp",
      "kasama.ibaraki.jp",
      "kashima.ibaraki.jp",
      "kasumigaura.ibaraki.jp",
      "koga.ibaraki.jp",
      "miho.ibaraki.jp",
      "mito.ibaraki.jp",
      "moriya.ibaraki.jp",
      "naka.ibaraki.jp",
      "namegata.ibaraki.jp",
      "oarai.ibaraki.jp",
      "ogawa.ibaraki.jp",
      "omitama.ibaraki.jp",
      "ryugasaki.ibaraki.jp",
      "sakai.ibaraki.jp",
      "sakuragawa.ibaraki.jp",
      "shimodate.ibaraki.jp",
      "shimotsuma.ibaraki.jp",
      "shirosato.ibaraki.jp",
      "sowa.ibaraki.jp",
      "suifu.ibaraki.jp",
      "takahagi.ibaraki.jp",
      "tamatsukuri.ibaraki.jp",
      "tokai.ibaraki.jp",
      "tomobe.ibaraki.jp",
      "tone.ibaraki.jp",
      "toride.ibaraki.jp",
      "tsuchiura.ibaraki.jp",
      "tsukuba.ibaraki.jp",
      "uchihara.ibaraki.jp",
      "ushiku.ibaraki.jp",
      "yachiyo.ibaraki.jp",
      "yamagata.ibaraki.jp",
      "yawara.ibaraki.jp",
      "yuki.ibaraki.jp",
      "anamizu.ishikawa.jp",
      "hakui.ishikawa.jp",
      "hakusan.ishikawa.jp",
      "kaga.ishikawa.jp",
      "kahoku.ishikawa.jp",
      "kanazawa.ishikawa.jp",
      "kawakita.ishikawa.jp",
      "komatsu.ishikawa.jp",
      "nakanoto.ishikawa.jp",
      "nanao.ishikawa.jp",
      "nomi.ishikawa.jp",
      "nonoichi.ishikawa.jp",
      "noto.ishikawa.jp",
      "shika.ishikawa.jp",
      "suzu.ishikawa.jp",
      "tsubata.ishikawa.jp",
      "tsurugi.ishikawa.jp",
      "uchinada.ishikawa.jp",
      "wajima.ishikawa.jp",
      "fudai.iwate.jp",
      "fujisawa.iwate.jp",
      "hanamaki.iwate.jp",
      "hiraizumi.iwate.jp",
      "hirono.iwate.jp",
      "ichinohe.iwate.jp",
      "ichinoseki.iwate.jp",
      "iwaizumi.iwate.jp",
      "iwate.iwate.jp",
      "joboji.iwate.jp",
      "kamaishi.iwate.jp",
      "kanegasaki.iwate.jp",
      "karumai.iwate.jp",
      "kawai.iwate.jp",
      "kitakami.iwate.jp",
      "kuji.iwate.jp",
      "kunohe.iwate.jp",
      "kuzumaki.iwate.jp",
      "miyako.iwate.jp",
      "mizusawa.iwate.jp",
      "morioka.iwate.jp",
      "ninohe.iwate.jp",
      "noda.iwate.jp",
      "ofunato.iwate.jp",
      "oshu.iwate.jp",
      "otsuchi.iwate.jp",
      "rikuzentakata.iwate.jp",
      "shiwa.iwate.jp",
      "shizukuishi.iwate.jp",
      "sumita.iwate.jp",
      "tanohata.iwate.jp",
      "tono.iwate.jp",
      "yahaba.iwate.jp",
      "yamada.iwate.jp",
      "ayagawa.kagawa.jp",
      "higashikagawa.kagawa.jp",
      "kanonji.kagawa.jp",
      "kotohira.kagawa.jp",
      "manno.kagawa.jp",
      "marugame.kagawa.jp",
      "mitoyo.kagawa.jp",
      "naoshima.kagawa.jp",
      "sanuki.kagawa.jp",
      "tadotsu.kagawa.jp",
      "takamatsu.kagawa.jp",
      "tonosho.kagawa.jp",
      "uchinomi.kagawa.jp",
      "utazu.kagawa.jp",
      "zentsuji.kagawa.jp",
      "akune.kagoshima.jp",
      "amami.kagoshima.jp",
      "hioki.kagoshima.jp",
      "isa.kagoshima.jp",
      "isen.kagoshima.jp",
      "izumi.kagoshima.jp",
      "kagoshima.kagoshima.jp",
      "kanoya.kagoshima.jp",
      "kawanabe.kagoshima.jp",
      "kinko.kagoshima.jp",
      "kouyama.kagoshima.jp",
      "makurazaki.kagoshima.jp",
      "matsumoto.kagoshima.jp",
      "minamitane.kagoshima.jp",
      "nakatane.kagoshima.jp",
      "nishinoomote.kagoshima.jp",
      "satsumasendai.kagoshima.jp",
      "soo.kagoshima.jp",
      "tarumizu.kagoshima.jp",
      "yusui.kagoshima.jp",
      "aikawa.kanagawa.jp",
      "atsugi.kanagawa.jp",
      "ayase.kanagawa.jp",
      "chigasaki.kanagawa.jp",
      "ebina.kanagawa.jp",
      "fujisawa.kanagawa.jp",
      "hadano.kanagawa.jp",
      "hakone.kanagawa.jp",
      "hiratsuka.kanagawa.jp",
      "isehara.kanagawa.jp",
      "kaisei.kanagawa.jp",
      "kamakura.kanagawa.jp",
      "kiyokawa.kanagawa.jp",
      "matsuda.kanagawa.jp",
      "minamiashigara.kanagawa.jp",
      "miura.kanagawa.jp",
      "nakai.kanagawa.jp",
      "ninomiya.kanagawa.jp",
      "odawara.kanagawa.jp",
      "oi.kanagawa.jp",
      "oiso.kanagawa.jp",
      "sagamihara.kanagawa.jp",
      "samukawa.kanagawa.jp",
      "tsukui.kanagawa.jp",
      "yamakita.kanagawa.jp",
      "yamato.kanagawa.jp",
      "yokosuka.kanagawa.jp",
      "yugawara.kanagawa.jp",
      "zama.kanagawa.jp",
      "zushi.kanagawa.jp",
      "aki.kochi.jp",
      "geisei.kochi.jp",
      "hidaka.kochi.jp",
      "higashitsuno.kochi.jp",
      "ino.kochi.jp",
      "kagami.kochi.jp",
      "kami.kochi.jp",
      "kitagawa.kochi.jp",
      "kochi.kochi.jp",
      "mihara.kochi.jp",
      "motoyama.kochi.jp",
      "muroto.kochi.jp",
      "nahari.kochi.jp",
      "nakamura.kochi.jp",
      "nankoku.kochi.jp",
      "nishitosa.kochi.jp",
      "niyodogawa.kochi.jp",
      "ochi.kochi.jp",
      "okawa.kochi.jp",
      "otoyo.kochi.jp",
      "otsuki.kochi.jp",
      "sakawa.kochi.jp",
      "sukumo.kochi.jp",
      "susaki.kochi.jp",
      "tosa.kochi.jp",
      "tosashimizu.kochi.jp",
      "toyo.kochi.jp",
      "tsuno.kochi.jp",
      "umaji.kochi.jp",
      "yasuda.kochi.jp",
      "yusuhara.kochi.jp",
      "amakusa.kumamoto.jp",
      "arao.kumamoto.jp",
      "aso.kumamoto.jp",
      "choyo.kumamoto.jp",
      "gyokuto.kumamoto.jp",
      "kamiamakusa.kumamoto.jp",
      "kikuchi.kumamoto.jp",
      "kumamoto.kumamoto.jp",
      "mashiki.kumamoto.jp",
      "mifune.kumamoto.jp",
      "minamata.kumamoto.jp",
      "minamioguni.kumamoto.jp",
      "nagasu.kumamoto.jp",
      "nishihara.kumamoto.jp",
      "oguni.kumamoto.jp",
      "ozu.kumamoto.jp",
      "sumoto.kumamoto.jp",
      "takamori.kumamoto.jp",
      "uki.kumamoto.jp",
      "uto.kumamoto.jp",
      "yamaga.kumamoto.jp",
      "yamato.kumamoto.jp",
      "yatsushiro.kumamoto.jp",
      "ayabe.kyoto.jp",
      "fukuchiyama.kyoto.jp",
      "higashiyama.kyoto.jp",
      "ide.kyoto.jp",
      "ine.kyoto.jp",
      "joyo.kyoto.jp",
      "kameoka.kyoto.jp",
      "kamo.kyoto.jp",
      "kita.kyoto.jp",
      "kizu.kyoto.jp",
      "kumiyama.kyoto.jp",
      "kyotamba.kyoto.jp",
      "kyotanabe.kyoto.jp",
      "kyotango.kyoto.jp",
      "maizuru.kyoto.jp",
      "minami.kyoto.jp",
      "minamiyamashiro.kyoto.jp",
      "miyazu.kyoto.jp",
      "muko.kyoto.jp",
      "nagaokakyo.kyoto.jp",
      "nakagyo.kyoto.jp",
      "nantan.kyoto.jp",
      "oyamazaki.kyoto.jp",
      "sakyo.kyoto.jp",
      "seika.kyoto.jp",
      "tanabe.kyoto.jp",
      "uji.kyoto.jp",
      "ujitawara.kyoto.jp",
      "wazuka.kyoto.jp",
      "yamashina.kyoto.jp",
      "yawata.kyoto.jp",
      "asahi.mie.jp",
      "inabe.mie.jp",
      "ise.mie.jp",
      "kameyama.mie.jp",
      "kawagoe.mie.jp",
      "kiho.mie.jp",
      "kisosaki.mie.jp",
      "kiwa.mie.jp",
      "komono.mie.jp",
      "kumano.mie.jp",
      "kuwana.mie.jp",
      "matsusaka.mie.jp",
      "meiwa.mie.jp",
      "mihama.mie.jp",
      "minamiise.mie.jp",
      "misugi.mie.jp",
      "miyama.mie.jp",
      "nabari.mie.jp",
      "shima.mie.jp",
      "suzuka.mie.jp",
      "tado.mie.jp",
      "taiki.mie.jp",
      "taki.mie.jp",
      "tamaki.mie.jp",
      "toba.mie.jp",
      "tsu.mie.jp",
      "udono.mie.jp",
      "ureshino.mie.jp",
      "watarai.mie.jp",
      "yokkaichi.mie.jp",
      "furukawa.miyagi.jp",
      "higashimatsushima.miyagi.jp",
      "ishinomaki.miyagi.jp",
      "iwanuma.miyagi.jp",
      "kakuda.miyagi.jp",
      "kami.miyagi.jp",
      "kawasaki.miyagi.jp",
      "marumori.miyagi.jp",
      "matsushima.miyagi.jp",
      "minamisanriku.miyagi.jp",
      "misato.miyagi.jp",
      "murata.miyagi.jp",
      "natori.miyagi.jp",
      "ogawara.miyagi.jp",
      "ohira.miyagi.jp",
      "onagawa.miyagi.jp",
      "osaki.miyagi.jp",
      "rifu.miyagi.jp",
      "semine.miyagi.jp",
      "shibata.miyagi.jp",
      "shichikashuku.miyagi.jp",
      "shikama.miyagi.jp",
      "shiogama.miyagi.jp",
      "shiroishi.miyagi.jp",
      "tagajo.miyagi.jp",
      "taiwa.miyagi.jp",
      "tome.miyagi.jp",
      "tomiya.miyagi.jp",
      "wakuya.miyagi.jp",
      "watari.miyagi.jp",
      "yamamoto.miyagi.jp",
      "zao.miyagi.jp",
      "aya.miyazaki.jp",
      "ebino.miyazaki.jp",
      "gokase.miyazaki.jp",
      "hyuga.miyazaki.jp",
      "kadogawa.miyazaki.jp",
      "kawaminami.miyazaki.jp",
      "kijo.miyazaki.jp",
      "kitagawa.miyazaki.jp",
      "kitakata.miyazaki.jp",
      "kitaura.miyazaki.jp",
      "kobayashi.miyazaki.jp",
      "kunitomi.miyazaki.jp",
      "kushima.miyazaki.jp",
      "mimata.miyazaki.jp",
      "miyakonojo.miyazaki.jp",
      "miyazaki.miyazaki.jp",
      "morotsuka.miyazaki.jp",
      "nichinan.miyazaki.jp",
      "nishimera.miyazaki.jp",
      "nobeoka.miyazaki.jp",
      "saito.miyazaki.jp",
      "shiiba.miyazaki.jp",
      "shintomi.miyazaki.jp",
      "takaharu.miyazaki.jp",
      "takanabe.miyazaki.jp",
      "takazaki.miyazaki.jp",
      "tsuno.miyazaki.jp",
      "achi.nagano.jp",
      "agematsu.nagano.jp",
      "anan.nagano.jp",
      "aoki.nagano.jp",
      "asahi.nagano.jp",
      "azumino.nagano.jp",
      "chikuhoku.nagano.jp",
      "chikuma.nagano.jp",
      "chino.nagano.jp",
      "fujimi.nagano.jp",
      "hakuba.nagano.jp",
      "hara.nagano.jp",
      "hiraya.nagano.jp",
      "iida.nagano.jp",
      "iijima.nagano.jp",
      "iiyama.nagano.jp",
      "iizuna.nagano.jp",
      "ikeda.nagano.jp",
      "ikusaka.nagano.jp",
      "ina.nagano.jp",
      "karuizawa.nagano.jp",
      "kawakami.nagano.jp",
      "kiso.nagano.jp",
      "kisofukushima.nagano.jp",
      "kitaaiki.nagano.jp",
      "komagane.nagano.jp",
      "komoro.nagano.jp",
      "matsukawa.nagano.jp",
      "matsumoto.nagano.jp",
      "miasa.nagano.jp",
      "minamiaiki.nagano.jp",
      "minamimaki.nagano.jp",
      "minamiminowa.nagano.jp",
      "minowa.nagano.jp",
      "miyada.nagano.jp",
      "miyota.nagano.jp",
      "mochizuki.nagano.jp",
      "nagano.nagano.jp",
      "nagawa.nagano.jp",
      "nagiso.nagano.jp",
      "nakagawa.nagano.jp",
      "nakano.nagano.jp",
      "nozawaonsen.nagano.jp",
      "obuse.nagano.jp",
      "ogawa.nagano.jp",
      "okaya.nagano.jp",
      "omachi.nagano.jp",
      "omi.nagano.jp",
      "ookuwa.nagano.jp",
      "ooshika.nagano.jp",
      "otaki.nagano.jp",
      "otari.nagano.jp",
      "sakae.nagano.jp",
      "sakaki.nagano.jp",
      "saku.nagano.jp",
      "sakuho.nagano.jp",
      "shimosuwa.nagano.jp",
      "shinanomachi.nagano.jp",
      "shiojiri.nagano.jp",
      "suwa.nagano.jp",
      "suzaka.nagano.jp",
      "takagi.nagano.jp",
      "takamori.nagano.jp",
      "takayama.nagano.jp",
      "tateshina.nagano.jp",
      "tatsuno.nagano.jp",
      "togakushi.nagano.jp",
      "togura.nagano.jp",
      "tomi.nagano.jp",
      "ueda.nagano.jp",
      "wada.nagano.jp",
      "yamagata.nagano.jp",
      "yamanouchi.nagano.jp",
      "yasaka.nagano.jp",
      "yasuoka.nagano.jp",
      "chijiwa.nagasaki.jp",
      "futsu.nagasaki.jp",
      "goto.nagasaki.jp",
      "hasami.nagasaki.jp",
      "hirado.nagasaki.jp",
      "iki.nagasaki.jp",
      "isahaya.nagasaki.jp",
      "kawatana.nagasaki.jp",
      "kuchinotsu.nagasaki.jp",
      "matsuura.nagasaki.jp",
      "nagasaki.nagasaki.jp",
      "obama.nagasaki.jp",
      "omura.nagasaki.jp",
      "oseto.nagasaki.jp",
      "saikai.nagasaki.jp",
      "sasebo.nagasaki.jp",
      "seihi.nagasaki.jp",
      "shimabara.nagasaki.jp",
      "shinkamigoto.nagasaki.jp",
      "togitsu.nagasaki.jp",
      "tsushima.nagasaki.jp",
      "unzen.nagasaki.jp",
      "ando.nara.jp",
      "gose.nara.jp",
      "heguri.nara.jp",
      "higashiyoshino.nara.jp",
      "ikaruga.nara.jp",
      "ikoma.nara.jp",
      "kamikitayama.nara.jp",
      "kanmaki.nara.jp",
      "kashiba.nara.jp",
      "kashihara.nara.jp",
      "katsuragi.nara.jp",
      "kawai.nara.jp",
      "kawakami.nara.jp",
      "kawanishi.nara.jp",
      "koryo.nara.jp",
      "kurotaki.nara.jp",
      "mitsue.nara.jp",
      "miyake.nara.jp",
      "nara.nara.jp",
      "nosegawa.nara.jp",
      "oji.nara.jp",
      "ouda.nara.jp",
      "oyodo.nara.jp",
      "sakurai.nara.jp",
      "sango.nara.jp",
      "shimoichi.nara.jp",
      "shimokitayama.nara.jp",
      "shinjo.nara.jp",
      "soni.nara.jp",
      "takatori.nara.jp",
      "tawaramoto.nara.jp",
      "tenkawa.nara.jp",
      "tenri.nara.jp",
      "uda.nara.jp",
      "yamatokoriyama.nara.jp",
      "yamatotakada.nara.jp",
      "yamazoe.nara.jp",
      "yoshino.nara.jp",
      "aga.niigata.jp",
      "agano.niigata.jp",
      "gosen.niigata.jp",
      "itoigawa.niigata.jp",
      "izumozaki.niigata.jp",
      "joetsu.niigata.jp",
      "kamo.niigata.jp",
      "kariwa.niigata.jp",
      "kashiwazaki.niigata.jp",
      "minamiuonuma.niigata.jp",
      "mitsuke.niigata.jp",
      "muika.niigata.jp",
      "murakami.niigata.jp",
      "myoko.niigata.jp",
      "nagaoka.niigata.jp",
      "niigata.niigata.jp",
      "ojiya.niigata.jp",
      "omi.niigata.jp",
      "sado.niigata.jp",
      "sanjo.niigata.jp",
      "seiro.niigata.jp",
      "seirou.niigata.jp",
      "sekikawa.niigata.jp",
      "shibata.niigata.jp",
      "tagami.niigata.jp",
      "tainai.niigata.jp",
      "tochio.niigata.jp",
      "tokamachi.niigata.jp",
      "tsubame.niigata.jp",
      "tsunan.niigata.jp",
      "uonuma.niigata.jp",
      "yahiko.niigata.jp",
      "yoita.niigata.jp",
      "yuzawa.niigata.jp",
      "beppu.oita.jp",
      "bungoono.oita.jp",
      "bungotakada.oita.jp",
      "hasama.oita.jp",
      "hiji.oita.jp",
      "himeshima.oita.jp",
      "hita.oita.jp",
      "kamitsue.oita.jp",
      "kokonoe.oita.jp",
      "kuju.oita.jp",
      "kunisaki.oita.jp",
      "kusu.oita.jp",
      "oita.oita.jp",
      "saiki.oita.jp",
      "taketa.oita.jp",
      "tsukumi.oita.jp",
      "usa.oita.jp",
      "usuki.oita.jp",
      "yufu.oita.jp",
      "akaiwa.okayama.jp",
      "asakuchi.okayama.jp",
      "bizen.okayama.jp",
      "hayashima.okayama.jp",
      "ibara.okayama.jp",
      "kagamino.okayama.jp",
      "kasaoka.okayama.jp",
      "kibichuo.okayama.jp",
      "kumenan.okayama.jp",
      "kurashiki.okayama.jp",
      "maniwa.okayama.jp",
      "misaki.okayama.jp",
      "nagi.okayama.jp",
      "niimi.okayama.jp",
      "nishiawakura.okayama.jp",
      "okayama.okayama.jp",
      "satosho.okayama.jp",
      "setouchi.okayama.jp",
      "shinjo.okayama.jp",
      "shoo.okayama.jp",
      "soja.okayama.jp",
      "takahashi.okayama.jp",
      "tamano.okayama.jp",
      "tsuyama.okayama.jp",
      "wake.okayama.jp",
      "yakage.okayama.jp",
      "aguni.okinawa.jp",
      "ginowan.okinawa.jp",
      "ginoza.okinawa.jp",
      "gushikami.okinawa.jp",
      "haebaru.okinawa.jp",
      "higashi.okinawa.jp",
      "hirara.okinawa.jp",
      "iheya.okinawa.jp",
      "ishigaki.okinawa.jp",
      "ishikawa.okinawa.jp",
      "itoman.okinawa.jp",
      "izena.okinawa.jp",
      "kadena.okinawa.jp",
      "kin.okinawa.jp",
      "kitadaito.okinawa.jp",
      "kitanakagusuku.okinawa.jp",
      "kumejima.okinawa.jp",
      "kunigami.okinawa.jp",
      "minamidaito.okinawa.jp",
      "motobu.okinawa.jp",
      "nago.okinawa.jp",
      "naha.okinawa.jp",
      "nakagusuku.okinawa.jp",
      "nakijin.okinawa.jp",
      "nanjo.okinawa.jp",
      "nishihara.okinawa.jp",
      "ogimi.okinawa.jp",
      "okinawa.okinawa.jp",
      "onna.okinawa.jp",
      "shimoji.okinawa.jp",
      "taketomi.okinawa.jp",
      "tarama.okinawa.jp",
      "tokashiki.okinawa.jp",
      "tomigusuku.okinawa.jp",
      "tonaki.okinawa.jp",
      "urasoe.okinawa.jp",
      "uruma.okinawa.jp",
      "yaese.okinawa.jp",
      "yomitan.okinawa.jp",
      "yonabaru.okinawa.jp",
      "yonaguni.okinawa.jp",
      "zamami.okinawa.jp",
      "abeno.osaka.jp",
      "chihayaakasaka.osaka.jp",
      "chuo.osaka.jp",
      "daito.osaka.jp",
      "fujiidera.osaka.jp",
      "habikino.osaka.jp",
      "hannan.osaka.jp",
      "higashiosaka.osaka.jp",
      "higashisumiyoshi.osaka.jp",
      "higashiyodogawa.osaka.jp",
      "hirakata.osaka.jp",
      "ibaraki.osaka.jp",
      "ikeda.osaka.jp",
      "izumi.osaka.jp",
      "izumiotsu.osaka.jp",
      "izumisano.osaka.jp",
      "kadoma.osaka.jp",
      "kaizuka.osaka.jp",
      "kanan.osaka.jp",
      "kashiwara.osaka.jp",
      "katano.osaka.jp",
      "kawachinagano.osaka.jp",
      "kishiwada.osaka.jp",
      "kita.osaka.jp",
      "kumatori.osaka.jp",
      "matsubara.osaka.jp",
      "minato.osaka.jp",
      "minoh.osaka.jp",
      "misaki.osaka.jp",
      "moriguchi.osaka.jp",
      "neyagawa.osaka.jp",
      "nishi.osaka.jp",
      "nose.osaka.jp",
      "osakasayama.osaka.jp",
      "sakai.osaka.jp",
      "sayama.osaka.jp",
      "sennan.osaka.jp",
      "settsu.osaka.jp",
      "shijonawate.osaka.jp",
      "shimamoto.osaka.jp",
      "suita.osaka.jp",
      "tadaoka.osaka.jp",
      "taishi.osaka.jp",
      "tajiri.osaka.jp",
      "takaishi.osaka.jp",
      "takatsuki.osaka.jp",
      "tondabayashi.osaka.jp",
      "toyonaka.osaka.jp",
      "toyono.osaka.jp",
      "yao.osaka.jp",
      "ariake.saga.jp",
      "arita.saga.jp",
      "fukudomi.saga.jp",
      "genkai.saga.jp",
      "hamatama.saga.jp",
      "hizen.saga.jp",
      "imari.saga.jp",
      "kamimine.saga.jp",
      "kanzaki.saga.jp",
      "karatsu.saga.jp",
      "kashima.saga.jp",
      "kitagata.saga.jp",
      "kitahata.saga.jp",
      "kiyama.saga.jp",
      "kouhoku.saga.jp",
      "kyuragi.saga.jp",
      "nishiarita.saga.jp",
      "ogi.saga.jp",
      "omachi.saga.jp",
      "ouchi.saga.jp",
      "saga.saga.jp",
      "shiroishi.saga.jp",
      "taku.saga.jp",
      "tara.saga.jp",
      "tosu.saga.jp",
      "yoshinogari.saga.jp",
      "arakawa.saitama.jp",
      "asaka.saitama.jp",
      "chichibu.saitama.jp",
      "fujimi.saitama.jp",
      "fujimino.saitama.jp",
      "fukaya.saitama.jp",
      "hanno.saitama.jp",
      "hanyu.saitama.jp",
      "hasuda.saitama.jp",
      "hatogaya.saitama.jp",
      "hatoyama.saitama.jp",
      "hidaka.saitama.jp",
      "higashichichibu.saitama.jp",
      "higashimatsuyama.saitama.jp",
      "honjo.saitama.jp",
      "ina.saitama.jp",
      "iruma.saitama.jp",
      "iwatsuki.saitama.jp",
      "kamiizumi.saitama.jp",
      "kamikawa.saitama.jp",
      "kamisato.saitama.jp",
      "kasukabe.saitama.jp",
      "kawagoe.saitama.jp",
      "kawaguchi.saitama.jp",
      "kawajima.saitama.jp",
      "kazo.saitama.jp",
      "kitamoto.saitama.jp",
      "koshigaya.saitama.jp",
      "kounosu.saitama.jp",
      "kuki.saitama.jp",
      "kumagaya.saitama.jp",
      "matsubushi.saitama.jp",
      "minano.saitama.jp",
      "misato.saitama.jp",
      "miyashiro.saitama.jp",
      "miyoshi.saitama.jp",
      "moroyama.saitama.jp",
      "nagatoro.saitama.jp",
      "namegawa.saitama.jp",
      "niiza.saitama.jp",
      "ogano.saitama.jp",
      "ogawa.saitama.jp",
      "ogose.saitama.jp",
      "okegawa.saitama.jp",
      "omiya.saitama.jp",
      "otaki.saitama.jp",
      "ranzan.saitama.jp",
      "ryokami.saitama.jp",
      "saitama.saitama.jp",
      "sakado.saitama.jp",
      "satte.saitama.jp",
      "sayama.saitama.jp",
      "shiki.saitama.jp",
      "shiraoka.saitama.jp",
      "soka.saitama.jp",
      "sugito.saitama.jp",
      "toda.saitama.jp",
      "tokigawa.saitama.jp",
      "tokorozawa.saitama.jp",
      "tsurugashima.saitama.jp",
      "urawa.saitama.jp",
      "warabi.saitama.jp",
      "yashio.saitama.jp",
      "yokoze.saitama.jp",
      "yono.saitama.jp",
      "yorii.saitama.jp",
      "yoshida.saitama.jp",
      "yoshikawa.saitama.jp",
      "yoshimi.saitama.jp",
      "aisho.shiga.jp",
      "gamo.shiga.jp",
      "higashiomi.shiga.jp",
      "hikone.shiga.jp",
      "koka.shiga.jp",
      "konan.shiga.jp",
      "kosei.shiga.jp",
      "koto.shiga.jp",
      "kusatsu.shiga.jp",
      "maibara.shiga.jp",
      "moriyama.shiga.jp",
      "nagahama.shiga.jp",
      "nishiazai.shiga.jp",
      "notogawa.shiga.jp",
      "omihachiman.shiga.jp",
      "otsu.shiga.jp",
      "ritto.shiga.jp",
      "ryuoh.shiga.jp",
      "takashima.shiga.jp",
      "takatsuki.shiga.jp",
      "torahime.shiga.jp",
      "toyosato.shiga.jp",
      "yasu.shiga.jp",
      "akagi.shimane.jp",
      "ama.shimane.jp",
      "gotsu.shimane.jp",
      "hamada.shimane.jp",
      "higashiizumo.shimane.jp",
      "hikawa.shimane.jp",
      "hikimi.shimane.jp",
      "izumo.shimane.jp",
      "kakinoki.shimane.jp",
      "masuda.shimane.jp",
      "matsue.shimane.jp",
      "misato.shimane.jp",
      "nishinoshima.shimane.jp",
      "ohda.shimane.jp",
      "okinoshima.shimane.jp",
      "okuizumo.shimane.jp",
      "shimane.shimane.jp",
      "tamayu.shimane.jp",
      "tsuwano.shimane.jp",
      "unnan.shimane.jp",
      "yakumo.shimane.jp",
      "yasugi.shimane.jp",
      "yatsuka.shimane.jp",
      "arai.shizuoka.jp",
      "atami.shizuoka.jp",
      "fuji.shizuoka.jp",
      "fujieda.shizuoka.jp",
      "fujikawa.shizuoka.jp",
      "fujinomiya.shizuoka.jp",
      "fukuroi.shizuoka.jp",
      "gotemba.shizuoka.jp",
      "haibara.shizuoka.jp",
      "hamamatsu.shizuoka.jp",
      "higashiizu.shizuoka.jp",
      "ito.shizuoka.jp",
      "iwata.shizuoka.jp",
      "izu.shizuoka.jp",
      "izunokuni.shizuoka.jp",
      "kakegawa.shizuoka.jp",
      "kannami.shizuoka.jp",
      "kawanehon.shizuoka.jp",
      "kawazu.shizuoka.jp",
      "kikugawa.shizuoka.jp",
      "kosai.shizuoka.jp",
      "makinohara.shizuoka.jp",
      "matsuzaki.shizuoka.jp",
      "minamiizu.shizuoka.jp",
      "mishima.shizuoka.jp",
      "morimachi.shizuoka.jp",
      "nishiizu.shizuoka.jp",
      "numazu.shizuoka.jp",
      "omaezaki.shizuoka.jp",
      "shimada.shizuoka.jp",
      "shimizu.shizuoka.jp",
      "shimoda.shizuoka.jp",
      "shizuoka.shizuoka.jp",
      "susono.shizuoka.jp",
      "yaizu.shizuoka.jp",
      "yoshida.shizuoka.jp",
      "ashikaga.tochigi.jp",
      "bato.tochigi.jp",
      "haga.tochigi.jp",
      "ichikai.tochigi.jp",
      "iwafune.tochigi.jp",
      "kaminokawa.tochigi.jp",
      "kanuma.tochigi.jp",
      "karasuyama.tochigi.jp",
      "kuroiso.tochigi.jp",
      "mashiko.tochigi.jp",
      "mibu.tochigi.jp",
      "moka.tochigi.jp",
      "motegi.tochigi.jp",
      "nasu.tochigi.jp",
      "nasushiobara.tochigi.jp",
      "nikko.tochigi.jp",
      "nishikata.tochigi.jp",
      "nogi.tochigi.jp",
      "ohira.tochigi.jp",
      "ohtawara.tochigi.jp",
      "oyama.tochigi.jp",
      "sakura.tochigi.jp",
      "sano.tochigi.jp",
      "shimotsuke.tochigi.jp",
      "shioya.tochigi.jp",
      "takanezawa.tochigi.jp",
      "tochigi.tochigi.jp",
      "tsuga.tochigi.jp",
      "ujiie.tochigi.jp",
      "utsunomiya.tochigi.jp",
      "yaita.tochigi.jp",
      "aizumi.tokushima.jp",
      "anan.tokushima.jp",
      "ichiba.tokushima.jp",
      "itano.tokushima.jp",
      "kainan.tokushima.jp",
      "komatsushima.tokushima.jp",
      "matsushige.tokushima.jp",
      "mima.tokushima.jp",
      "minami.tokushima.jp",
      "miyoshi.tokushima.jp",
      "mugi.tokushima.jp",
      "nakagawa.tokushima.jp",
      "naruto.tokushima.jp",
      "sanagochi.tokushima.jp",
      "shishikui.tokushima.jp",
      "tokushima.tokushima.jp",
      "wajiki.tokushima.jp",
      "adachi.tokyo.jp",
      "akiruno.tokyo.jp",
      "akishima.tokyo.jp",
      "aogashima.tokyo.jp",
      "arakawa.tokyo.jp",
      "bunkyo.tokyo.jp",
      "chiyoda.tokyo.jp",
      "chofu.tokyo.jp",
      "chuo.tokyo.jp",
      "edogawa.tokyo.jp",
      "fuchu.tokyo.jp",
      "fussa.tokyo.jp",
      "hachijo.tokyo.jp",
      "hachioji.tokyo.jp",
      "hamura.tokyo.jp",
      "higashikurume.tokyo.jp",
      "higashimurayama.tokyo.jp",
      "higashiyamato.tokyo.jp",
      "hino.tokyo.jp",
      "hinode.tokyo.jp",
      "hinohara.tokyo.jp",
      "inagi.tokyo.jp",
      "itabashi.tokyo.jp",
      "katsushika.tokyo.jp",
      "kita.tokyo.jp",
      "kiyose.tokyo.jp",
      "kodaira.tokyo.jp",
      "koganei.tokyo.jp",
      "kokubunji.tokyo.jp",
      "komae.tokyo.jp",
      "koto.tokyo.jp",
      "kouzushima.tokyo.jp",
      "kunitachi.tokyo.jp",
      "machida.tokyo.jp",
      "meguro.tokyo.jp",
      "minato.tokyo.jp",
      "mitaka.tokyo.jp",
      "mizuho.tokyo.jp",
      "musashimurayama.tokyo.jp",
      "musashino.tokyo.jp",
      "nakano.tokyo.jp",
      "nerima.tokyo.jp",
      "ogasawara.tokyo.jp",
      "okutama.tokyo.jp",
      "ome.tokyo.jp",
      "oshima.tokyo.jp",
      "ota.tokyo.jp",
      "setagaya.tokyo.jp",
      "shibuya.tokyo.jp",
      "shinagawa.tokyo.jp",
      "shinjuku.tokyo.jp",
      "suginami.tokyo.jp",
      "sumida.tokyo.jp",
      "tachikawa.tokyo.jp",
      "taito.tokyo.jp",
      "tama.tokyo.jp",
      "toshima.tokyo.jp",
      "chizu.tottori.jp",
      "hino.tottori.jp",
      "kawahara.tottori.jp",
      "koge.tottori.jp",
      "kotoura.tottori.jp",
      "misasa.tottori.jp",
      "nanbu.tottori.jp",
      "nichinan.tottori.jp",
      "sakaiminato.tottori.jp",
      "tottori.tottori.jp",
      "wakasa.tottori.jp",
      "yazu.tottori.jp",
      "yonago.tottori.jp",
      "asahi.toyama.jp",
      "fuchu.toyama.jp",
      "fukumitsu.toyama.jp",
      "funahashi.toyama.jp",
      "himi.toyama.jp",
      "imizu.toyama.jp",
      "inami.toyama.jp",
      "johana.toyama.jp",
      "kamiichi.toyama.jp",
      "kurobe.toyama.jp",
      "nakaniikawa.toyama.jp",
      "namerikawa.toyama.jp",
      "nanto.toyama.jp",
      "nyuzen.toyama.jp",
      "oyabe.toyama.jp",
      "taira.toyama.jp",
      "takaoka.toyama.jp",
      "tateyama.toyama.jp",
      "toga.toyama.jp",
      "tonami.toyama.jp",
      "toyama.toyama.jp",
      "unazuki.toyama.jp",
      "uozu.toyama.jp",
      "yamada.toyama.jp",
      "arida.wakayama.jp",
      "aridagawa.wakayama.jp",
      "gobo.wakayama.jp",
      "hashimoto.wakayama.jp",
      "hidaka.wakayama.jp",
      "hirogawa.wakayama.jp",
      "inami.wakayama.jp",
      "iwade.wakayama.jp",
      "kainan.wakayama.jp",
      "kamitonda.wakayama.jp",
      "katsuragi.wakayama.jp",
      "kimino.wakayama.jp",
      "kinokawa.wakayama.jp",
      "kitayama.wakayama.jp",
      "koya.wakayama.jp",
      "koza.wakayama.jp",
      "kozagawa.wakayama.jp",
      "kudoyama.wakayama.jp",
      "kushimoto.wakayama.jp",
      "mihama.wakayama.jp",
      "misato.wakayama.jp",
      "nachikatsuura.wakayama.jp",
      "shingu.wakayama.jp",
      "shirahama.wakayama.jp",
      "taiji.wakayama.jp",
      "tanabe.wakayama.jp",
      "wakayama.wakayama.jp",
      "yuasa.wakayama.jp",
      "yura.wakayama.jp",
      "asahi.yamagata.jp",
      "funagata.yamagata.jp",
      "higashine.yamagata.jp",
      "iide.yamagata.jp",
      "kahoku.yamagata.jp",
      "kaminoyama.yamagata.jp",
      "kaneyama.yamagata.jp",
      "kawanishi.yamagata.jp",
      "mamurogawa.yamagata.jp",
      "mikawa.yamagata.jp",
      "murayama.yamagata.jp",
      "nagai.yamagata.jp",
      "nakayama.yamagata.jp",
      "nanyo.yamagata.jp",
      "nishikawa.yamagata.jp",
      "obanazawa.yamagata.jp",
      "oe.yamagata.jp",
      "oguni.yamagata.jp",
      "ohkura.yamagata.jp",
      "oishida.yamagata.jp",
      "sagae.yamagata.jp",
      "sakata.yamagata.jp",
      "sakegawa.yamagata.jp",
      "shinjo.yamagata.jp",
      "shirataka.yamagata.jp",
      "shonai.yamagata.jp",
      "takahata.yamagata.jp",
      "tendo.yamagata.jp",
      "tozawa.yamagata.jp",
      "tsuruoka.yamagata.jp",
      "yamagata.yamagata.jp",
      "yamanobe.yamagata.jp",
      "yonezawa.yamagata.jp",
      "yuza.yamagata.jp",
      "abu.yamaguchi.jp",
      "hagi.yamaguchi.jp",
      "hikari.yamaguchi.jp",
      "hofu.yamaguchi.jp",
      "iwakuni.yamaguchi.jp",
      "kudamatsu.yamaguchi.jp",
      "mitou.yamaguchi.jp",
      "nagato.yamaguchi.jp",
      "oshima.yamaguchi.jp",
      "shimonoseki.yamaguchi.jp",
      "shunan.yamaguchi.jp",
      "tabuse.yamaguchi.jp",
      "tokuyama.yamaguchi.jp",
      "toyota.yamaguchi.jp",
      "ube.yamaguchi.jp",
      "yuu.yamaguchi.jp",
      "chuo.yamanashi.jp",
      "doshi.yamanashi.jp",
      "fuefuki.yamanashi.jp",
      "fujikawa.yamanashi.jp",
      "fujikawaguchiko.yamanashi.jp",
      "fujiyoshida.yamanashi.jp",
      "hayakawa.yamanashi.jp",
      "hokuto.yamanashi.jp",
      "ichikawamisato.yamanashi.jp",
      "kai.yamanashi.jp",
      "kofu.yamanashi.jp",
      "koshu.yamanashi.jp",
      "kosuge.yamanashi.jp",
      "minami-alps.yamanashi.jp",
      "minobu.yamanashi.jp",
      "nakamichi.yamanashi.jp",
      "nanbu.yamanashi.jp",
      "narusawa.yamanashi.jp",
      "nirasaki.yamanashi.jp",
      "nishikatsura.yamanashi.jp",
      "oshino.yamanashi.jp",
      "otsuki.yamanashi.jp",
      "showa.yamanashi.jp",
      "tabayama.yamanashi.jp",
      "tsuru.yamanashi.jp",
      "uenohara.yamanashi.jp",
      "yamanakako.yamanashi.jp",
      "yamanashi.yamanashi.jp",
      "ke",
      "ac.ke",
      "co.ke",
      "go.ke",
      "info.ke",
      "me.ke",
      "mobi.ke",
      "ne.ke",
      "or.ke",
      "sc.ke",
      "kg",
      "org.kg",
      "net.kg",
      "com.kg",
      "edu.kg",
      "gov.kg",
      "mil.kg",
      "*.kh",
      "ki",
      "edu.ki",
      "biz.ki",
      "net.ki",
      "org.ki",
      "gov.ki",
      "info.ki",
      "com.ki",
      "km",
      "org.km",
      "nom.km",
      "gov.km",
      "prd.km",
      "tm.km",
      "edu.km",
      "mil.km",
      "ass.km",
      "com.km",
      "coop.km",
      "asso.km",
      "presse.km",
      "medecin.km",
      "notaires.km",
      "pharmaciens.km",
      "veterinaire.km",
      "gouv.km",
      "kn",
      "net.kn",
      "org.kn",
      "edu.kn",
      "gov.kn",
      "kp",
      "com.kp",
      "edu.kp",
      "gov.kp",
      "org.kp",
      "rep.kp",
      "tra.kp",
      "kr",
      "ac.kr",
      "co.kr",
      "es.kr",
      "go.kr",
      "hs.kr",
      "kg.kr",
      "mil.kr",
      "ms.kr",
      "ne.kr",
      "or.kr",
      "pe.kr",
      "re.kr",
      "sc.kr",
      "busan.kr",
      "chungbuk.kr",
      "chungnam.kr",
      "daegu.kr",
      "daejeon.kr",
      "gangwon.kr",
      "gwangju.kr",
      "gyeongbuk.kr",
      "gyeonggi.kr",
      "gyeongnam.kr",
      "incheon.kr",
      "jeju.kr",
      "jeonbuk.kr",
      "jeonnam.kr",
      "seoul.kr",
      "ulsan.kr",
      "kw",
      "com.kw",
      "edu.kw",
      "emb.kw",
      "gov.kw",
      "ind.kw",
      "net.kw",
      "org.kw",
      "ky",
      "com.ky",
      "edu.ky",
      "net.ky",
      "org.ky",
      "kz",
      "org.kz",
      "edu.kz",
      "net.kz",
      "gov.kz",
      "mil.kz",
      "com.kz",
      "la",
      "int.la",
      "net.la",
      "info.la",
      "edu.la",
      "gov.la",
      "per.la",
      "com.la",
      "org.la",
      "lb",
      "com.lb",
      "edu.lb",
      "gov.lb",
      "net.lb",
      "org.lb",
      "lc",
      "com.lc",
      "net.lc",
      "co.lc",
      "org.lc",
      "edu.lc",
      "gov.lc",
      "li",
      "lk",
      "gov.lk",
      "sch.lk",
      "net.lk",
      "int.lk",
      "com.lk",
      "org.lk",
      "edu.lk",
      "ngo.lk",
      "soc.lk",
      "web.lk",
      "ltd.lk",
      "assn.lk",
      "grp.lk",
      "hotel.lk",
      "ac.lk",
      "lr",
      "com.lr",
      "edu.lr",
      "gov.lr",
      "org.lr",
      "net.lr",
      "ls",
      "ac.ls",
      "biz.ls",
      "co.ls",
      "edu.ls",
      "gov.ls",
      "info.ls",
      "net.ls",
      "org.ls",
      "sc.ls",
      "lt",
      "gov.lt",
      "lu",
      "lv",
      "com.lv",
      "edu.lv",
      "gov.lv",
      "org.lv",
      "mil.lv",
      "id.lv",
      "net.lv",
      "asn.lv",
      "conf.lv",
      "ly",
      "com.ly",
      "net.ly",
      "gov.ly",
      "plc.ly",
      "edu.ly",
      "sch.ly",
      "med.ly",
      "org.ly",
      "id.ly",
      "ma",
      "co.ma",
      "net.ma",
      "gov.ma",
      "org.ma",
      "ac.ma",
      "press.ma",
      "mc",
      "tm.mc",
      "asso.mc",
      "md",
      "me",
      "co.me",
      "net.me",
      "org.me",
      "edu.me",
      "ac.me",
      "gov.me",
      "its.me",
      "priv.me",
      "mg",
      "org.mg",
      "nom.mg",
      "gov.mg",
      "prd.mg",
      "tm.mg",
      "edu.mg",
      "mil.mg",
      "com.mg",
      "co.mg",
      "mh",
      "mil",
      "mk",
      "com.mk",
      "org.mk",
      "net.mk",
      "edu.mk",
      "gov.mk",
      "inf.mk",
      "name.mk",
      "ml",
      "com.ml",
      "edu.ml",
      "gouv.ml",
      "gov.ml",
      "net.ml",
      "org.ml",
      "presse.ml",
      "*.mm",
      "mn",
      "gov.mn",
      "edu.mn",
      "org.mn",
      "mo",
      "com.mo",
      "net.mo",
      "org.mo",
      "edu.mo",
      "gov.mo",
      "mobi",
      "mp",
      "mq",
      "mr",
      "gov.mr",
      "ms",
      "com.ms",
      "edu.ms",
      "gov.ms",
      "net.ms",
      "org.ms",
      "mt",
      "com.mt",
      "edu.mt",
      "net.mt",
      "org.mt",
      "mu",
      "com.mu",
      "net.mu",
      "org.mu",
      "gov.mu",
      "ac.mu",
      "co.mu",
      "or.mu",
      "museum",
      "academy.museum",
      "agriculture.museum",
      "air.museum",
      "airguard.museum",
      "alabama.museum",
      "alaska.museum",
      "amber.museum",
      "ambulance.museum",
      "american.museum",
      "americana.museum",
      "americanantiques.museum",
      "americanart.museum",
      "amsterdam.museum",
      "and.museum",
      "annefrank.museum",
      "anthro.museum",
      "anthropology.museum",
      "antiques.museum",
      "aquarium.museum",
      "arboretum.museum",
      "archaeological.museum",
      "archaeology.museum",
      "architecture.museum",
      "art.museum",
      "artanddesign.museum",
      "artcenter.museum",
      "artdeco.museum",
      "arteducation.museum",
      "artgallery.museum",
      "arts.museum",
      "artsandcrafts.museum",
      "asmatart.museum",
      "assassination.museum",
      "assisi.museum",
      "association.museum",
      "astronomy.museum",
      "atlanta.museum",
      "austin.museum",
      "australia.museum",
      "automotive.museum",
      "aviation.museum",
      "axis.museum",
      "badajoz.museum",
      "baghdad.museum",
      "bahn.museum",
      "bale.museum",
      "baltimore.museum",
      "barcelona.museum",
      "baseball.museum",
      "basel.museum",
      "baths.museum",
      "bauern.museum",
      "beauxarts.museum",
      "beeldengeluid.museum",
      "bellevue.museum",
      "bergbau.museum",
      "berkeley.museum",
      "berlin.museum",
      "bern.museum",
      "bible.museum",
      "bilbao.museum",
      "bill.museum",
      "birdart.museum",
      "birthplace.museum",
      "bonn.museum",
      "boston.museum",
      "botanical.museum",
      "botanicalgarden.museum",
      "botanicgarden.museum",
      "botany.museum",
      "brandywinevalley.museum",
      "brasil.museum",
      "bristol.museum",
      "british.museum",
      "britishcolumbia.museum",
      "broadcast.museum",
      "brunel.museum",
      "brussel.museum",
      "brussels.museum",
      "bruxelles.museum",
      "building.museum",
      "burghof.museum",
      "bus.museum",
      "bushey.museum",
      "cadaques.museum",
      "california.museum",
      "cambridge.museum",
      "can.museum",
      "canada.museum",
      "capebreton.museum",
      "carrier.museum",
      "cartoonart.museum",
      "casadelamoneda.museum",
      "castle.museum",
      "castres.museum",
      "celtic.museum",
      "center.museum",
      "chattanooga.museum",
      "cheltenham.museum",
      "chesapeakebay.museum",
      "chicago.museum",
      "children.museum",
      "childrens.museum",
      "childrensgarden.museum",
      "chiropractic.museum",
      "chocolate.museum",
      "christiansburg.museum",
      "cincinnati.museum",
      "cinema.museum",
      "circus.museum",
      "civilisation.museum",
      "civilization.museum",
      "civilwar.museum",
      "clinton.museum",
      "clock.museum",
      "coal.museum",
      "coastaldefence.museum",
      "cody.museum",
      "coldwar.museum",
      "collection.museum",
      "colonialwilliamsburg.museum",
      "coloradoplateau.museum",
      "columbia.museum",
      "columbus.museum",
      "communication.museum",
      "communications.museum",
      "community.museum",
      "computer.museum",
      "computerhistory.museum",
      "comunicações.museum",
      "contemporary.museum",
      "contemporaryart.museum",
      "convent.museum",
      "copenhagen.museum",
      "corporation.museum",
      "correios-e-telecomunicações.museum",
      "corvette.museum",
      "costume.museum",
      "countryestate.museum",
      "county.museum",
      "crafts.museum",
      "cranbrook.museum",
      "creation.museum",
      "cultural.museum",
      "culturalcenter.museum",
      "culture.museum",
      "cyber.museum",
      "cymru.museum",
      "dali.museum",
      "dallas.museum",
      "database.museum",
      "ddr.museum",
      "decorativearts.museum",
      "delaware.museum",
      "delmenhorst.museum",
      "denmark.museum",
      "depot.museum",
      "design.museum",
      "detroit.museum",
      "dinosaur.museum",
      "discovery.museum",
      "dolls.museum",
      "donostia.museum",
      "durham.museum",
      "eastafrica.museum",
      "eastcoast.museum",
      "education.museum",
      "educational.museum",
      "egyptian.museum",
      "eisenbahn.museum",
      "elburg.museum",
      "elvendrell.museum",
      "embroidery.museum",
      "encyclopedic.museum",
      "england.museum",
      "entomology.museum",
      "environment.museum",
      "environmentalconservation.museum",
      "epilepsy.museum",
      "essex.museum",
      "estate.museum",
      "ethnology.museum",
      "exeter.museum",
      "exhibition.museum",
      "family.museum",
      "farm.museum",
      "farmequipment.museum",
      "farmers.museum",
      "farmstead.museum",
      "field.museum",
      "figueres.museum",
      "filatelia.museum",
      "film.museum",
      "fineart.museum",
      "finearts.museum",
      "finland.museum",
      "flanders.museum",
      "florida.museum",
      "force.museum",
      "fortmissoula.museum",
      "fortworth.museum",
      "foundation.museum",
      "francaise.museum",
      "frankfurt.museum",
      "franziskaner.museum",
      "freemasonry.museum",
      "freiburg.museum",
      "fribourg.museum",
      "frog.museum",
      "fundacio.museum",
      "furniture.museum",
      "gallery.museum",
      "garden.museum",
      "gateway.museum",
      "geelvinck.museum",
      "gemological.museum",
      "geology.museum",
      "georgia.museum",
      "giessen.museum",
      "glas.museum",
      "glass.museum",
      "gorge.museum",
      "grandrapids.museum",
      "graz.museum",
      "guernsey.museum",
      "halloffame.museum",
      "hamburg.museum",
      "handson.museum",
      "harvestcelebration.museum",
      "hawaii.museum",
      "health.museum",
      "heimatunduhren.museum",
      "hellas.museum",
      "helsinki.museum",
      "hembygdsforbund.museum",
      "heritage.museum",
      "histoire.museum",
      "historical.museum",
      "historicalsociety.museum",
      "historichouses.museum",
      "historisch.museum",
      "historisches.museum",
      "history.museum",
      "historyofscience.museum",
      "horology.museum",
      "house.museum",
      "humanities.museum",
      "illustration.museum",
      "imageandsound.museum",
      "indian.museum",
      "indiana.museum",
      "indianapolis.museum",
      "indianmarket.museum",
      "intelligence.museum",
      "interactive.museum",
      "iraq.museum",
      "iron.museum",
      "isleofman.museum",
      "jamison.museum",
      "jefferson.museum",
      "jerusalem.museum",
      "jewelry.museum",
      "jewish.museum",
      "jewishart.museum",
      "jfk.museum",
      "journalism.museum",
      "judaica.museum",
      "judygarland.museum",
      "juedisches.museum",
      "juif.museum",
      "karate.museum",
      "karikatur.museum",
      "kids.museum",
      "koebenhavn.museum",
      "koeln.museum",
      "kunst.museum",
      "kunstsammlung.museum",
      "kunstunddesign.museum",
      "labor.museum",
      "labour.museum",
      "lajolla.museum",
      "lancashire.museum",
      "landes.museum",
      "lans.museum",
      "läns.museum",
      "larsson.museum",
      "lewismiller.museum",
      "lincoln.museum",
      "linz.museum",
      "living.museum",
      "livinghistory.museum",
      "localhistory.museum",
      "london.museum",
      "losangeles.museum",
      "louvre.museum",
      "loyalist.museum",
      "lucerne.museum",
      "luxembourg.museum",
      "luzern.museum",
      "mad.museum",
      "madrid.museum",
      "mallorca.museum",
      "manchester.museum",
      "mansion.museum",
      "mansions.museum",
      "manx.museum",
      "marburg.museum",
      "maritime.museum",
      "maritimo.museum",
      "maryland.museum",
      "marylhurst.museum",
      "media.museum",
      "medical.museum",
      "medizinhistorisches.museum",
      "meeres.museum",
      "memorial.museum",
      "mesaverde.museum",
      "michigan.museum",
      "midatlantic.museum",
      "military.museum",
      "mill.museum",
      "miners.museum",
      "mining.museum",
      "minnesota.museum",
      "missile.museum",
      "missoula.museum",
      "modern.museum",
      "moma.museum",
      "money.museum",
      "monmouth.museum",
      "monticello.museum",
      "montreal.museum",
      "moscow.museum",
      "motorcycle.museum",
      "muenchen.museum",
      "muenster.museum",
      "mulhouse.museum",
      "muncie.museum",
      "museet.museum",
      "museumcenter.museum",
      "museumvereniging.museum",
      "music.museum",
      "national.museum",
      "nationalfirearms.museum",
      "nationalheritage.museum",
      "nativeamerican.museum",
      "naturalhistory.museum",
      "naturalhistorymuseum.museum",
      "naturalsciences.museum",
      "nature.museum",
      "naturhistorisches.museum",
      "natuurwetenschappen.museum",
      "naumburg.museum",
      "naval.museum",
      "nebraska.museum",
      "neues.museum",
      "newhampshire.museum",
      "newjersey.museum",
      "newmexico.museum",
      "newport.museum",
      "newspaper.museum",
      "newyork.museum",
      "niepce.museum",
      "norfolk.museum",
      "north.museum",
      "nrw.museum",
      "nyc.museum",
      "nyny.museum",
      "oceanographic.museum",
      "oceanographique.museum",
      "omaha.museum",
      "online.museum",
      "ontario.museum",
      "openair.museum",
      "oregon.museum",
      "oregontrail.museum",
      "otago.museum",
      "oxford.museum",
      "pacific.museum",
      "paderborn.museum",
      "palace.museum",
      "paleo.museum",
      "palmsprings.museum",
      "panama.museum",
      "paris.museum",
      "pasadena.museum",
      "pharmacy.museum",
      "philadelphia.museum",
      "philadelphiaarea.museum",
      "philately.museum",
      "phoenix.museum",
      "photography.museum",
      "pilots.museum",
      "pittsburgh.museum",
      "planetarium.museum",
      "plantation.museum",
      "plants.museum",
      "plaza.museum",
      "portal.museum",
      "portland.museum",
      "portlligat.museum",
      "posts-and-telecommunications.museum",
      "preservation.museum",
      "presidio.museum",
      "press.museum",
      "project.museum",
      "public.museum",
      "pubol.museum",
      "quebec.museum",
      "railroad.museum",
      "railway.museum",
      "research.museum",
      "resistance.museum",
      "riodejaneiro.museum",
      "rochester.museum",
      "rockart.museum",
      "roma.museum",
      "russia.museum",
      "saintlouis.museum",
      "salem.museum",
      "salvadordali.museum",
      "salzburg.museum",
      "sandiego.museum",
      "sanfrancisco.museum",
      "santabarbara.museum",
      "santacruz.museum",
      "santafe.museum",
      "saskatchewan.museum",
      "satx.museum",
      "savannahga.museum",
      "schlesisches.museum",
      "schoenbrunn.museum",
      "schokoladen.museum",
      "school.museum",
      "schweiz.museum",
      "science.museum",
      "scienceandhistory.museum",
      "scienceandindustry.museum",
      "sciencecenter.museum",
      "sciencecenters.museum",
      "science-fiction.museum",
      "sciencehistory.museum",
      "sciences.museum",
      "sciencesnaturelles.museum",
      "scotland.museum",
      "seaport.museum",
      "settlement.museum",
      "settlers.museum",
      "shell.museum",
      "sherbrooke.museum",
      "sibenik.museum",
      "silk.museum",
      "ski.museum",
      "skole.museum",
      "society.museum",
      "sologne.museum",
      "soundandvision.museum",
      "southcarolina.museum",
      "southwest.museum",
      "space.museum",
      "spy.museum",
      "square.museum",
      "stadt.museum",
      "stalbans.museum",
      "starnberg.museum",
      "state.museum",
      "stateofdelaware.museum",
      "station.museum",
      "steam.museum",
      "steiermark.museum",
      "stjohn.museum",
      "stockholm.museum",
      "stpetersburg.museum",
      "stuttgart.museum",
      "suisse.museum",
      "surgeonshall.museum",
      "surrey.museum",
      "svizzera.museum",
      "sweden.museum",
      "sydney.museum",
      "tank.museum",
      "tcm.museum",
      "technology.museum",
      "telekommunikation.museum",
      "television.museum",
      "texas.museum",
      "textile.museum",
      "theater.museum",
      "time.museum",
      "timekeeping.museum",
      "topology.museum",
      "torino.museum",
      "touch.museum",
      "town.museum",
      "transport.museum",
      "tree.museum",
      "trolley.museum",
      "trust.museum",
      "trustee.museum",
      "uhren.museum",
      "ulm.museum",
      "undersea.museum",
      "university.museum",
      "usa.museum",
      "usantiques.museum",
      "usarts.museum",
      "uscountryestate.museum",
      "usculture.museum",
      "usdecorativearts.museum",
      "usgarden.museum",
      "ushistory.museum",
      "ushuaia.museum",
      "uslivinghistory.museum",
      "utah.museum",
      "uvic.museum",
      "valley.museum",
      "vantaa.museum",
      "versailles.museum",
      "viking.museum",
      "village.museum",
      "virginia.museum",
      "virtual.museum",
      "virtuel.museum",
      "vlaanderen.museum",
      "volkenkunde.museum",
      "wales.museum",
      "wallonie.museum",
      "war.museum",
      "washingtondc.museum",
      "watchandclock.museum",
      "watch-and-clock.museum",
      "western.museum",
      "westfalen.museum",
      "whaling.museum",
      "wildlife.museum",
      "williamsburg.museum",
      "windmill.museum",
      "workshop.museum",
      "york.museum",
      "yorkshire.museum",
      "yosemite.museum",
      "youth.museum",
      "zoological.museum",
      "zoology.museum",
      "ירושלים.museum",
      "иком.museum",
      "mv",
      "aero.mv",
      "biz.mv",
      "com.mv",
      "coop.mv",
      "edu.mv",
      "gov.mv",
      "info.mv",
      "int.mv",
      "mil.mv",
      "museum.mv",
      "name.mv",
      "net.mv",
      "org.mv",
      "pro.mv",
      "mw",
      "ac.mw",
      "biz.mw",
      "co.mw",
      "com.mw",
      "coop.mw",
      "edu.mw",
      "gov.mw",
      "int.mw",
      "museum.mw",
      "net.mw",
      "org.mw",
      "mx",
      "com.mx",
      "org.mx",
      "gob.mx",
      "edu.mx",
      "net.mx",
      "my",
      "biz.my",
      "com.my",
      "edu.my",
      "gov.my",
      "mil.my",
      "name.my",
      "net.my",
      "org.my",
      "mz",
      "ac.mz",
      "adv.mz",
      "co.mz",
      "edu.mz",
      "gov.mz",
      "mil.mz",
      "net.mz",
      "org.mz",
      "na",
      "info.na",
      "pro.na",
      "name.na",
      "school.na",
      "or.na",
      "dr.na",
      "us.na",
      "mx.na",
      "ca.na",
      "in.na",
      "cc.na",
      "tv.na",
      "ws.na",
      "mobi.na",
      "co.na",
      "com.na",
      "org.na",
      "name",
      "nc",
      "asso.nc",
      "nom.nc",
      "ne",
      "net",
      "nf",
      "com.nf",
      "net.nf",
      "per.nf",
      "rec.nf",
      "web.nf",
      "arts.nf",
      "firm.nf",
      "info.nf",
      "other.nf",
      "store.nf",
      "ng",
      "com.ng",
      "edu.ng",
      "gov.ng",
      "i.ng",
      "mil.ng",
      "mobi.ng",
      "name.ng",
      "net.ng",
      "org.ng",
      "sch.ng",
      "ni",
      "ac.ni",
      "biz.ni",
      "co.ni",
      "com.ni",
      "edu.ni",
      "gob.ni",
      "in.ni",
      "info.ni",
      "int.ni",
      "mil.ni",
      "net.ni",
      "nom.ni",
      "org.ni",
      "web.ni",
      "nl",
      "no",
      "fhs.no",
      "vgs.no",
      "fylkesbibl.no",
      "folkebibl.no",
      "museum.no",
      "idrett.no",
      "priv.no",
      "mil.no",
      "stat.no",
      "dep.no",
      "kommune.no",
      "herad.no",
      "aa.no",
      "ah.no",
      "bu.no",
      "fm.no",
      "hl.no",
      "hm.no",
      "jan-mayen.no",
      "mr.no",
      "nl.no",
      "nt.no",
      "of.no",
      "ol.no",
      "oslo.no",
      "rl.no",
      "sf.no",
      "st.no",
      "svalbard.no",
      "tm.no",
      "tr.no",
      "va.no",
      "vf.no",
      "gs.aa.no",
      "gs.ah.no",
      "gs.bu.no",
      "gs.fm.no",
      "gs.hl.no",
      "gs.hm.no",
      "gs.jan-mayen.no",
      "gs.mr.no",
      "gs.nl.no",
      "gs.nt.no",
      "gs.of.no",
      "gs.ol.no",
      "gs.oslo.no",
      "gs.rl.no",
      "gs.sf.no",
      "gs.st.no",
      "gs.svalbard.no",
      "gs.tm.no",
      "gs.tr.no",
      "gs.va.no",
      "gs.vf.no",
      "akrehamn.no",
      "åkrehamn.no",
      "algard.no",
      "ålgård.no",
      "arna.no",
      "brumunddal.no",
      "bryne.no",
      "bronnoysund.no",
      "brønnøysund.no",
      "drobak.no",
      "drøbak.no",
      "egersund.no",
      "fetsund.no",
      "floro.no",
      "florø.no",
      "fredrikstad.no",
      "hokksund.no",
      "honefoss.no",
      "hønefoss.no",
      "jessheim.no",
      "jorpeland.no",
      "jørpeland.no",
      "kirkenes.no",
      "kopervik.no",
      "krokstadelva.no",
      "langevag.no",
      "langevåg.no",
      "leirvik.no",
      "mjondalen.no",
      "mjøndalen.no",
      "mo-i-rana.no",
      "mosjoen.no",
      "mosjøen.no",
      "nesoddtangen.no",
      "orkanger.no",
      "osoyro.no",
      "osøyro.no",
      "raholt.no",
      "råholt.no",
      "sandnessjoen.no",
      "sandnessjøen.no",
      "skedsmokorset.no",
      "slattum.no",
      "spjelkavik.no",
      "stathelle.no",
      "stavern.no",
      "stjordalshalsen.no",
      "stjørdalshalsen.no",
      "tananger.no",
      "tranby.no",
      "vossevangen.no",
      "afjord.no",
      "åfjord.no",
      "agdenes.no",
      "al.no",
      "ål.no",
      "alesund.no",
      "ålesund.no",
      "alstahaug.no",
      "alta.no",
      "áltá.no",
      "alaheadju.no",
      "álaheadju.no",
      "alvdal.no",
      "amli.no",
      "åmli.no",
      "amot.no",
      "åmot.no",
      "andebu.no",
      "andoy.no",
      "andøy.no",
      "andasuolo.no",
      "ardal.no",
      "årdal.no",
      "aremark.no",
      "arendal.no",
      "ås.no",
      "aseral.no",
      "åseral.no",
      "asker.no",
      "askim.no",
      "askvoll.no",
      "askoy.no",
      "askøy.no",
      "asnes.no",
      "åsnes.no",
      "audnedaln.no",
      "aukra.no",
      "aure.no",
      "aurland.no",
      "aurskog-holand.no",
      "aurskog-høland.no",
      "austevoll.no",
      "austrheim.no",
      "averoy.no",
      "averøy.no",
      "balestrand.no",
      "ballangen.no",
      "balat.no",
      "bálát.no",
      "balsfjord.no",
      "bahccavuotna.no",
      "báhccavuotna.no",
      "bamble.no",
      "bardu.no",
      "beardu.no",
      "beiarn.no",
      "bajddar.no",
      "bájddar.no",
      "baidar.no",
      "báidár.no",
      "berg.no",
      "bergen.no",
      "berlevag.no",
      "berlevåg.no",
      "bearalvahki.no",
      "bearalváhki.no",
      "bindal.no",
      "birkenes.no",
      "bjarkoy.no",
      "bjarkøy.no",
      "bjerkreim.no",
      "bjugn.no",
      "bodo.no",
      "bodø.no",
      "badaddja.no",
      "bådåddjå.no",
      "budejju.no",
      "bokn.no",
      "bremanger.no",
      "bronnoy.no",
      "brønnøy.no",
      "bygland.no",
      "bykle.no",
      "barum.no",
      "bærum.no",
      "bo.telemark.no",
      "bø.telemark.no",
      "bo.nordland.no",
      "bø.nordland.no",
      "bievat.no",
      "bievát.no",
      "bomlo.no",
      "bømlo.no",
      "batsfjord.no",
      "båtsfjord.no",
      "bahcavuotna.no",
      "báhcavuotna.no",
      "dovre.no",
      "drammen.no",
      "drangedal.no",
      "dyroy.no",
      "dyrøy.no",
      "donna.no",
      "dønna.no",
      "eid.no",
      "eidfjord.no",
      "eidsberg.no",
      "eidskog.no",
      "eidsvoll.no",
      "eigersund.no",
      "elverum.no",
      "enebakk.no",
      "engerdal.no",
      "etne.no",
      "etnedal.no",
      "evenes.no",
      "evenassi.no",
      "evenášši.no",
      "evje-og-hornnes.no",
      "farsund.no",
      "fauske.no",
      "fuossko.no",
      "fuoisku.no",
      "fedje.no",
      "fet.no",
      "finnoy.no",
      "finnøy.no",
      "fitjar.no",
      "fjaler.no",
      "fjell.no",
      "flakstad.no",
      "flatanger.no",
      "flekkefjord.no",
      "flesberg.no",
      "flora.no",
      "fla.no",
      "flå.no",
      "folldal.no",
      "forsand.no",
      "fosnes.no",
      "frei.no",
      "frogn.no",
      "froland.no",
      "frosta.no",
      "frana.no",
      "fræna.no",
      "froya.no",
      "frøya.no",
      "fusa.no",
      "fyresdal.no",
      "forde.no",
      "førde.no",
      "gamvik.no",
      "gangaviika.no",
      "gáŋgaviika.no",
      "gaular.no",
      "gausdal.no",
      "gildeskal.no",
      "gildeskål.no",
      "giske.no",
      "gjemnes.no",
      "gjerdrum.no",
      "gjerstad.no",
      "gjesdal.no",
      "gjovik.no",
      "gjøvik.no",
      "gloppen.no",
      "gol.no",
      "gran.no",
      "grane.no",
      "granvin.no",
      "gratangen.no",
      "grimstad.no",
      "grong.no",
      "kraanghke.no",
      "kråanghke.no",
      "grue.no",
      "gulen.no",
      "hadsel.no",
      "halden.no",
      "halsa.no",
      "hamar.no",
      "hamaroy.no",
      "habmer.no",
      "hábmer.no",
      "hapmir.no",
      "hápmir.no",
      "hammerfest.no",
      "hammarfeasta.no",
      "hámmárfeasta.no",
      "haram.no",
      "hareid.no",
      "harstad.no",
      "hasvik.no",
      "aknoluokta.no",
      "ákŋoluokta.no",
      "hattfjelldal.no",
      "aarborte.no",
      "haugesund.no",
      "hemne.no",
      "hemnes.no",
      "hemsedal.no",
      "heroy.more-og-romsdal.no",
      "herøy.møre-og-romsdal.no",
      "heroy.nordland.no",
      "herøy.nordland.no",
      "hitra.no",
      "hjartdal.no",
      "hjelmeland.no",
      "hobol.no",
      "hobøl.no",
      "hof.no",
      "hol.no",
      "hole.no",
      "holmestrand.no",
      "holtalen.no",
      "holtålen.no",
      "hornindal.no",
      "horten.no",
      "hurdal.no",
      "hurum.no",
      "hvaler.no",
      "hyllestad.no",
      "hagebostad.no",
      "hægebostad.no",
      "hoyanger.no",
      "høyanger.no",
      "hoylandet.no",
      "høylandet.no",
      "ha.no",
      "hå.no",
      "ibestad.no",
      "inderoy.no",
      "inderøy.no",
      "iveland.no",
      "jevnaker.no",
      "jondal.no",
      "jolster.no",
      "jølster.no",
      "karasjok.no",
      "karasjohka.no",
      "kárášjohka.no",
      "karlsoy.no",
      "galsa.no",
      "gálsá.no",
      "karmoy.no",
      "karmøy.no",
      "kautokeino.no",
      "guovdageaidnu.no",
      "klepp.no",
      "klabu.no",
      "klæbu.no",
      "kongsberg.no",
      "kongsvinger.no",
      "kragero.no",
      "kragerø.no",
      "kristiansand.no",
      "kristiansund.no",
      "krodsherad.no",
      "krødsherad.no",
      "kvalsund.no",
      "rahkkeravju.no",
      "ráhkkerávju.no",
      "kvam.no",
      "kvinesdal.no",
      "kvinnherad.no",
      "kviteseid.no",
      "kvitsoy.no",
      "kvitsøy.no",
      "kvafjord.no",
      "kvæfjord.no",
      "giehtavuoatna.no",
      "kvanangen.no",
      "kvænangen.no",
      "navuotna.no",
      "návuotna.no",
      "kafjord.no",
      "kåfjord.no",
      "gaivuotna.no",
      "gáivuotna.no",
      "larvik.no",
      "lavangen.no",
      "lavagis.no",
      "loabat.no",
      "loabát.no",
      "lebesby.no",
      "davvesiida.no",
      "leikanger.no",
      "leirfjord.no",
      "leka.no",
      "leksvik.no",
      "lenvik.no",
      "leangaviika.no",
      "leaŋgaviika.no",
      "lesja.no",
      "levanger.no",
      "lier.no",
      "lierne.no",
      "lillehammer.no",
      "lillesand.no",
      "lindesnes.no",
      "lindas.no",
      "lindås.no",
      "lom.no",
      "loppa.no",
      "lahppi.no",
      "láhppi.no",
      "lund.no",
      "lunner.no",
      "luroy.no",
      "lurøy.no",
      "luster.no",
      "lyngdal.no",
      "lyngen.no",
      "ivgu.no",
      "lardal.no",
      "lerdal.no",
      "lærdal.no",
      "lodingen.no",
      "lødingen.no",
      "lorenskog.no",
      "lørenskog.no",
      "loten.no",
      "løten.no",
      "malvik.no",
      "masoy.no",
      "måsøy.no",
      "muosat.no",
      "muosát.no",
      "mandal.no",
      "marker.no",
      "marnardal.no",
      "masfjorden.no",
      "meland.no",
      "meldal.no",
      "melhus.no",
      "meloy.no",
      "meløy.no",
      "meraker.no",
      "meråker.no",
      "moareke.no",
      "moåreke.no",
      "midsund.no",
      "midtre-gauldal.no",
      "modalen.no",
      "modum.no",
      "molde.no",
      "moskenes.no",
      "moss.no",
      "mosvik.no",
      "malselv.no",
      "målselv.no",
      "malatvuopmi.no",
      "málatvuopmi.no",
      "namdalseid.no",
      "aejrie.no",
      "namsos.no",
      "namsskogan.no",
      "naamesjevuemie.no",
      "nååmesjevuemie.no",
      "laakesvuemie.no",
      "nannestad.no",
      "narvik.no",
      "narviika.no",
      "naustdal.no",
      "nedre-eiker.no",
      "nes.akershus.no",
      "nes.buskerud.no",
      "nesna.no",
      "nesodden.no",
      "nesseby.no",
      "unjarga.no",
      "unjárga.no",
      "nesset.no",
      "nissedal.no",
      "nittedal.no",
      "nord-aurdal.no",
      "nord-fron.no",
      "nord-odal.no",
      "norddal.no",
      "nordkapp.no",
      "davvenjarga.no",
      "davvenjárga.no",
      "nordre-land.no",
      "nordreisa.no",
      "raisa.no",
      "ráisa.no",
      "nore-og-uvdal.no",
      "notodden.no",
      "naroy.no",
      "nærøy.no",
      "notteroy.no",
      "nøtterøy.no",
      "odda.no",
      "oksnes.no",
      "øksnes.no",
      "oppdal.no",
      "oppegard.no",
      "oppegård.no",
      "orkdal.no",
      "orland.no",
      "ørland.no",
      "orskog.no",
      "ørskog.no",
      "orsta.no",
      "ørsta.no",
      "os.hedmark.no",
      "os.hordaland.no",
      "osen.no",
      "osteroy.no",
      "osterøy.no",
      "ostre-toten.no",
      "østre-toten.no",
      "overhalla.no",
      "ovre-eiker.no",
      "øvre-eiker.no",
      "oyer.no",
      "øyer.no",
      "oygarden.no",
      "øygarden.no",
      "oystre-slidre.no",
      "øystre-slidre.no",
      "porsanger.no",
      "porsangu.no",
      "porsáŋgu.no",
      "porsgrunn.no",
      "radoy.no",
      "radøy.no",
      "rakkestad.no",
      "rana.no",
      "ruovat.no",
      "randaberg.no",
      "rauma.no",
      "rendalen.no",
      "rennebu.no",
      "rennesoy.no",
      "rennesøy.no",
      "rindal.no",
      "ringebu.no",
      "ringerike.no",
      "ringsaker.no",
      "rissa.no",
      "risor.no",
      "risør.no",
      "roan.no",
      "rollag.no",
      "rygge.no",
      "ralingen.no",
      "rælingen.no",
      "rodoy.no",
      "rødøy.no",
      "romskog.no",
      "rømskog.no",
      "roros.no",
      "røros.no",
      "rost.no",
      "røst.no",
      "royken.no",
      "røyken.no",
      "royrvik.no",
      "røyrvik.no",
      "rade.no",
      "råde.no",
      "salangen.no",
      "siellak.no",
      "saltdal.no",
      "salat.no",
      "sálát.no",
      "sálat.no",
      "samnanger.no",
      "sande.more-og-romsdal.no",
      "sande.møre-og-romsdal.no",
      "sande.vestfold.no",
      "sandefjord.no",
      "sandnes.no",
      "sandoy.no",
      "sandøy.no",
      "sarpsborg.no",
      "sauda.no",
      "sauherad.no",
      "sel.no",
      "selbu.no",
      "selje.no",
      "seljord.no",
      "sigdal.no",
      "siljan.no",
      "sirdal.no",
      "skaun.no",
      "skedsmo.no",
      "ski.no",
      "skien.no",
      "skiptvet.no",
      "skjervoy.no",
      "skjervøy.no",
      "skierva.no",
      "skiervá.no",
      "skjak.no",
      "skjåk.no",
      "skodje.no",
      "skanland.no",
      "skånland.no",
      "skanit.no",
      "skánit.no",
      "smola.no",
      "smøla.no",
      "snillfjord.no",
      "snasa.no",
      "snåsa.no",
      "snoasa.no",
      "snaase.no",
      "snåase.no",
      "sogndal.no",
      "sokndal.no",
      "sola.no",
      "solund.no",
      "songdalen.no",
      "sortland.no",
      "spydeberg.no",
      "stange.no",
      "stavanger.no",
      "steigen.no",
      "steinkjer.no",
      "stjordal.no",
      "stjørdal.no",
      "stokke.no",
      "stor-elvdal.no",
      "stord.no",
      "stordal.no",
      "storfjord.no",
      "omasvuotna.no",
      "strand.no",
      "stranda.no",
      "stryn.no",
      "sula.no",
      "suldal.no",
      "sund.no",
      "sunndal.no",
      "surnadal.no",
      "sveio.no",
      "svelvik.no",
      "sykkylven.no",
      "sogne.no",
      "søgne.no",
      "somna.no",
      "sømna.no",
      "sondre-land.no",
      "søndre-land.no",
      "sor-aurdal.no",
      "sør-aurdal.no",
      "sor-fron.no",
      "sør-fron.no",
      "sor-odal.no",
      "sør-odal.no",
      "sor-varanger.no",
      "sør-varanger.no",
      "matta-varjjat.no",
      "mátta-várjjat.no",
      "sorfold.no",
      "sørfold.no",
      "sorreisa.no",
      "sørreisa.no",
      "sorum.no",
      "sørum.no",
      "tana.no",
      "deatnu.no",
      "time.no",
      "tingvoll.no",
      "tinn.no",
      "tjeldsund.no",
      "dielddanuorri.no",
      "tjome.no",
      "tjøme.no",
      "tokke.no",
      "tolga.no",
      "torsken.no",
      "tranoy.no",
      "tranøy.no",
      "tromso.no",
      "tromsø.no",
      "tromsa.no",
      "romsa.no",
      "trondheim.no",
      "troandin.no",
      "trysil.no",
      "trana.no",
      "træna.no",
      "trogstad.no",
      "trøgstad.no",
      "tvedestrand.no",
      "tydal.no",
      "tynset.no",
      "tysfjord.no",
      "divtasvuodna.no",
      "divttasvuotna.no",
      "tysnes.no",
      "tysvar.no",
      "tysvær.no",
      "tonsberg.no",
      "tønsberg.no",
      "ullensaker.no",
      "ullensvang.no",
      "ulvik.no",
      "utsira.no",
      "vadso.no",
      "vadsø.no",
      "cahcesuolo.no",
      "čáhcesuolo.no",
      "vaksdal.no",
      "valle.no",
      "vang.no",
      "vanylven.no",
      "vardo.no",
      "vardø.no",
      "varggat.no",
      "várggát.no",
      "vefsn.no",
      "vaapste.no",
      "vega.no",
      "vegarshei.no",
      "vegårshei.no",
      "vennesla.no",
      "verdal.no",
      "verran.no",
      "vestby.no",
      "vestnes.no",
      "vestre-slidre.no",
      "vestre-toten.no",
      "vestvagoy.no",
      "vestvågøy.no",
      "vevelstad.no",
      "vik.no",
      "vikna.no",
      "vindafjord.no",
      "volda.no",
      "voss.no",
      "varoy.no",
      "værøy.no",
      "vagan.no",
      "vågan.no",
      "voagat.no",
      "vagsoy.no",
      "vågsøy.no",
      "vaga.no",
      "vågå.no",
      "valer.ostfold.no",
      "våler.østfold.no",
      "valer.hedmark.no",
      "våler.hedmark.no",
      "*.np",
      "nr",
      "biz.nr",
      "info.nr",
      "gov.nr",
      "edu.nr",
      "org.nr",
      "net.nr",
      "com.nr",
      "nu",
      "nz",
      "ac.nz",
      "co.nz",
      "cri.nz",
      "geek.nz",
      "gen.nz",
      "govt.nz",
      "health.nz",
      "iwi.nz",
      "kiwi.nz",
      "maori.nz",
      "mil.nz",
      "māori.nz",
      "net.nz",
      "org.nz",
      "parliament.nz",
      "school.nz",
      "om",
      "co.om",
      "com.om",
      "edu.om",
      "gov.om",
      "med.om",
      "museum.om",
      "net.om",
      "org.om",
      "pro.om",
      "onion",
      "org",
      "pa",
      "ac.pa",
      "gob.pa",
      "com.pa",
      "org.pa",
      "sld.pa",
      "edu.pa",
      "net.pa",
      "ing.pa",
      "abo.pa",
      "med.pa",
      "nom.pa",
      "pe",
      "edu.pe",
      "gob.pe",
      "nom.pe",
      "mil.pe",
      "org.pe",
      "com.pe",
      "net.pe",
      "pf",
      "com.pf",
      "org.pf",
      "edu.pf",
      "*.pg",
      "ph",
      "com.ph",
      "net.ph",
      "org.ph",
      "gov.ph",
      "edu.ph",
      "ngo.ph",
      "mil.ph",
      "i.ph",
      "pk",
      "com.pk",
      "net.pk",
      "edu.pk",
      "org.pk",
      "fam.pk",
      "biz.pk",
      "web.pk",
      "gov.pk",
      "gob.pk",
      "gok.pk",
      "gon.pk",
      "gop.pk",
      "gos.pk",
      "info.pk",
      "pl",
      "com.pl",
      "net.pl",
      "org.pl",
      "aid.pl",
      "agro.pl",
      "atm.pl",
      "auto.pl",
      "biz.pl",
      "edu.pl",
      "gmina.pl",
      "gsm.pl",
      "info.pl",
      "mail.pl",
      "miasta.pl",
      "media.pl",
      "mil.pl",
      "nieruchomosci.pl",
      "nom.pl",
      "pc.pl",
      "powiat.pl",
      "priv.pl",
      "realestate.pl",
      "rel.pl",
      "sex.pl",
      "shop.pl",
      "sklep.pl",
      "sos.pl",
      "szkola.pl",
      "targi.pl",
      "tm.pl",
      "tourism.pl",
      "travel.pl",
      "turystyka.pl",
      "gov.pl",
      "ap.gov.pl",
      "ic.gov.pl",
      "is.gov.pl",
      "us.gov.pl",
      "kmpsp.gov.pl",
      "kppsp.gov.pl",
      "kwpsp.gov.pl",
      "psp.gov.pl",
      "wskr.gov.pl",
      "kwp.gov.pl",
      "mw.gov.pl",
      "ug.gov.pl",
      "um.gov.pl",
      "umig.gov.pl",
      "ugim.gov.pl",
      "upow.gov.pl",
      "uw.gov.pl",
      "starostwo.gov.pl",
      "pa.gov.pl",
      "po.gov.pl",
      "psse.gov.pl",
      "pup.gov.pl",
      "rzgw.gov.pl",
      "sa.gov.pl",
      "so.gov.pl",
      "sr.gov.pl",
      "wsa.gov.pl",
      "sko.gov.pl",
      "uzs.gov.pl",
      "wiih.gov.pl",
      "winb.gov.pl",
      "pinb.gov.pl",
      "wios.gov.pl",
      "witd.gov.pl",
      "wzmiuw.gov.pl",
      "piw.gov.pl",
      "wiw.gov.pl",
      "griw.gov.pl",
      "wif.gov.pl",
      "oum.gov.pl",
      "sdn.gov.pl",
      "zp.gov.pl",
      "uppo.gov.pl",
      "mup.gov.pl",
      "wuoz.gov.pl",
      "konsulat.gov.pl",
      "oirm.gov.pl",
      "augustow.pl",
      "babia-gora.pl",
      "bedzin.pl",
      "beskidy.pl",
      "bialowieza.pl",
      "bialystok.pl",
      "bielawa.pl",
      "bieszczady.pl",
      "boleslawiec.pl",
      "bydgoszcz.pl",
      "bytom.pl",
      "cieszyn.pl",
      "czeladz.pl",
      "czest.pl",
      "dlugoleka.pl",
      "elblag.pl",
      "elk.pl",
      "glogow.pl",
      "gniezno.pl",
      "gorlice.pl",
      "grajewo.pl",
      "ilawa.pl",
      "jaworzno.pl",
      "jelenia-gora.pl",
      "jgora.pl",
      "kalisz.pl",
      "kazimierz-dolny.pl",
      "karpacz.pl",
      "kartuzy.pl",
      "kaszuby.pl",
      "katowice.pl",
      "kepno.pl",
      "ketrzyn.pl",
      "klodzko.pl",
      "kobierzyce.pl",
      "kolobrzeg.pl",
      "konin.pl",
      "konskowola.pl",
      "kutno.pl",
      "lapy.pl",
      "lebork.pl",
      "legnica.pl",
      "lezajsk.pl",
      "limanowa.pl",
      "lomza.pl",
      "lowicz.pl",
      "lubin.pl",
      "lukow.pl",
      "malbork.pl",
      "malopolska.pl",
      "mazowsze.pl",
      "mazury.pl",
      "mielec.pl",
      "mielno.pl",
      "mragowo.pl",
      "naklo.pl",
      "nowaruda.pl",
      "nysa.pl",
      "olawa.pl",
      "olecko.pl",
      "olkusz.pl",
      "olsztyn.pl",
      "opoczno.pl",
      "opole.pl",
      "ostroda.pl",
      "ostroleka.pl",
      "ostrowiec.pl",
      "ostrowwlkp.pl",
      "pila.pl",
      "pisz.pl",
      "podhale.pl",
      "podlasie.pl",
      "polkowice.pl",
      "pomorze.pl",
      "pomorskie.pl",
      "prochowice.pl",
      "pruszkow.pl",
      "przeworsk.pl",
      "pulawy.pl",
      "radom.pl",
      "rawa-maz.pl",
      "rybnik.pl",
      "rzeszow.pl",
      "sanok.pl",
      "sejny.pl",
      "slask.pl",
      "slupsk.pl",
      "sosnowiec.pl",
      "stalowa-wola.pl",
      "skoczow.pl",
      "starachowice.pl",
      "stargard.pl",
      "suwalki.pl",
      "swidnica.pl",
      "swiebodzin.pl",
      "swinoujscie.pl",
      "szczecin.pl",
      "szczytno.pl",
      "tarnobrzeg.pl",
      "tgory.pl",
      "turek.pl",
      "tychy.pl",
      "ustka.pl",
      "walbrzych.pl",
      "warmia.pl",
      "warszawa.pl",
      "waw.pl",
      "wegrow.pl",
      "wielun.pl",
      "wlocl.pl",
      "wloclawek.pl",
      "wodzislaw.pl",
      "wolomin.pl",
      "wroclaw.pl",
      "zachpomor.pl",
      "zagan.pl",
      "zarow.pl",
      "zgora.pl",
      "zgorzelec.pl",
      "pm",
      "pn",
      "gov.pn",
      "co.pn",
      "org.pn",
      "edu.pn",
      "net.pn",
      "post",
      "pr",
      "com.pr",
      "net.pr",
      "org.pr",
      "gov.pr",
      "edu.pr",
      "isla.pr",
      "pro.pr",
      "biz.pr",
      "info.pr",
      "name.pr",
      "est.pr",
      "prof.pr",
      "ac.pr",
      "pro",
      "aaa.pro",
      "aca.pro",
      "acct.pro",
      "avocat.pro",
      "bar.pro",
      "cpa.pro",
      "eng.pro",
      "jur.pro",
      "law.pro",
      "med.pro",
      "recht.pro",
      "ps",
      "edu.ps",
      "gov.ps",
      "sec.ps",
      "plo.ps",
      "com.ps",
      "org.ps",
      "net.ps",
      "pt",
      "net.pt",
      "gov.pt",
      "org.pt",
      "edu.pt",
      "int.pt",
      "publ.pt",
      "com.pt",
      "nome.pt",
      "pw",
      "co.pw",
      "ne.pw",
      "or.pw",
      "ed.pw",
      "go.pw",
      "belau.pw",
      "py",
      "com.py",
      "coop.py",
      "edu.py",
      "gov.py",
      "mil.py",
      "net.py",
      "org.py",
      "qa",
      "com.qa",
      "edu.qa",
      "gov.qa",
      "mil.qa",
      "name.qa",
      "net.qa",
      "org.qa",
      "sch.qa",
      "re",
      "asso.re",
      "com.re",
      "nom.re",
      "ro",
      "arts.ro",
      "com.ro",
      "firm.ro",
      "info.ro",
      "nom.ro",
      "nt.ro",
      "org.ro",
      "rec.ro",
      "store.ro",
      "tm.ro",
      "www.ro",
      "rs",
      "ac.rs",
      "co.rs",
      "edu.rs",
      "gov.rs",
      "in.rs",
      "org.rs",
      "ru",
      "rw",
      "ac.rw",
      "co.rw",
      "coop.rw",
      "gov.rw",
      "mil.rw",
      "net.rw",
      "org.rw",
      "sa",
      "com.sa",
      "net.sa",
      "org.sa",
      "gov.sa",
      "med.sa",
      "pub.sa",
      "edu.sa",
      "sch.sa",
      "sb",
      "com.sb",
      "edu.sb",
      "gov.sb",
      "net.sb",
      "org.sb",
      "sc",
      "com.sc",
      "gov.sc",
      "net.sc",
      "org.sc",
      "edu.sc",
      "sd",
      "com.sd",
      "net.sd",
      "org.sd",
      "edu.sd",
      "med.sd",
      "tv.sd",
      "gov.sd",
      "info.sd",
      "se",
      "a.se",
      "ac.se",
      "b.se",
      "bd.se",
      "brand.se",
      "c.se",
      "d.se",
      "e.se",
      "f.se",
      "fh.se",
      "fhsk.se",
      "fhv.se",
      "g.se",
      "h.se",
      "i.se",
      "k.se",
      "komforb.se",
      "kommunalforbund.se",
      "komvux.se",
      "l.se",
      "lanbib.se",
      "m.se",
      "n.se",
      "naturbruksgymn.se",
      "o.se",
      "org.se",
      "p.se",
      "parti.se",
      "pp.se",
      "press.se",
      "r.se",
      "s.se",
      "t.se",
      "tm.se",
      "u.se",
      "w.se",
      "x.se",
      "y.se",
      "z.se",
      "sg",
      "com.sg",
      "net.sg",
      "org.sg",
      "gov.sg",
      "edu.sg",
      "per.sg",
      "sh",
      "com.sh",
      "net.sh",
      "gov.sh",
      "org.sh",
      "mil.sh",
      "si",
      "sj",
      "sk",
      "sl",
      "com.sl",
      "net.sl",
      "edu.sl",
      "gov.sl",
      "org.sl",
      "sm",
      "sn",
      "art.sn",
      "com.sn",
      "edu.sn",
      "gouv.sn",
      "org.sn",
      "perso.sn",
      "univ.sn",
      "so",
      "com.so",
      "edu.so",
      "gov.so",
      "me.so",
      "net.so",
      "org.so",
      "sr",
      "ss",
      "biz.ss",
      "com.ss",
      "edu.ss",
      "gov.ss",
      "me.ss",
      "net.ss",
      "org.ss",
      "sch.ss",
      "st",
      "co.st",
      "com.st",
      "consulado.st",
      "edu.st",
      "embaixada.st",
      "mil.st",
      "net.st",
      "org.st",
      "principe.st",
      "saotome.st",
      "store.st",
      "su",
      "sv",
      "com.sv",
      "edu.sv",
      "gob.sv",
      "org.sv",
      "red.sv",
      "sx",
      "gov.sx",
      "sy",
      "edu.sy",
      "gov.sy",
      "net.sy",
      "mil.sy",
      "com.sy",
      "org.sy",
      "sz",
      "co.sz",
      "ac.sz",
      "org.sz",
      "tc",
      "td",
      "tel",
      "tf",
      "tg",
      "th",
      "ac.th",
      "co.th",
      "go.th",
      "in.th",
      "mi.th",
      "net.th",
      "or.th",
      "tj",
      "ac.tj",
      "biz.tj",
      "co.tj",
      "com.tj",
      "edu.tj",
      "go.tj",
      "gov.tj",
      "int.tj",
      "mil.tj",
      "name.tj",
      "net.tj",
      "nic.tj",
      "org.tj",
      "test.tj",
      "web.tj",
      "tk",
      "tl",
      "gov.tl",
      "tm",
      "com.tm",
      "co.tm",
      "org.tm",
      "net.tm",
      "nom.tm",
      "gov.tm",
      "mil.tm",
      "edu.tm",
      "tn",
      "com.tn",
      "ens.tn",
      "fin.tn",
      "gov.tn",
      "ind.tn",
      "info.tn",
      "intl.tn",
      "mincom.tn",
      "nat.tn",
      "net.tn",
      "org.tn",
      "perso.tn",
      "tourism.tn",
      "to",
      "com.to",
      "gov.to",
      "net.to",
      "org.to",
      "edu.to",
      "mil.to",
      "tr",
      "av.tr",
      "bbs.tr",
      "bel.tr",
      "biz.tr",
      "com.tr",
      "dr.tr",
      "edu.tr",
      "gen.tr",
      "gov.tr",
      "info.tr",
      "mil.tr",
      "k12.tr",
      "kep.tr",
      "name.tr",
      "net.tr",
      "org.tr",
      "pol.tr",
      "tel.tr",
      "tsk.tr",
      "tv.tr",
      "web.tr",
      "nc.tr",
      "gov.nc.tr",
      "tt",
      "co.tt",
      "com.tt",
      "org.tt",
      "net.tt",
      "biz.tt",
      "info.tt",
      "pro.tt",
      "int.tt",
      "coop.tt",
      "jobs.tt",
      "mobi.tt",
      "travel.tt",
      "museum.tt",
      "aero.tt",
      "name.tt",
      "gov.tt",
      "edu.tt",
      "tv",
      "tw",
      "edu.tw",
      "gov.tw",
      "mil.tw",
      "com.tw",
      "net.tw",
      "org.tw",
      "idv.tw",
      "game.tw",
      "ebiz.tw",
      "club.tw",
      "網路.tw",
      "組織.tw",
      "商業.tw",
      "tz",
      "ac.tz",
      "co.tz",
      "go.tz",
      "hotel.tz",
      "info.tz",
      "me.tz",
      "mil.tz",
      "mobi.tz",
      "ne.tz",
      "or.tz",
      "sc.tz",
      "tv.tz",
      "ua",
      "com.ua",
      "edu.ua",
      "gov.ua",
      "in.ua",
      "net.ua",
      "org.ua",
      "cherkassy.ua",
      "cherkasy.ua",
      "chernigov.ua",
      "chernihiv.ua",
      "chernivtsi.ua",
      "chernovtsy.ua",
      "ck.ua",
      "cn.ua",
      "cr.ua",
      "crimea.ua",
      "cv.ua",
      "dn.ua",
      "dnepropetrovsk.ua",
      "dnipropetrovsk.ua",
      "donetsk.ua",
      "dp.ua",
      "if.ua",
      "ivano-frankivsk.ua",
      "kh.ua",
      "kharkiv.ua",
      "kharkov.ua",
      "kherson.ua",
      "khmelnitskiy.ua",
      "khmelnytskyi.ua",
      "kiev.ua",
      "kirovograd.ua",
      "km.ua",
      "kr.ua",
      "krym.ua",
      "ks.ua",
      "kv.ua",
      "kyiv.ua",
      "lg.ua",
      "lt.ua",
      "lugansk.ua",
      "lutsk.ua",
      "lv.ua",
      "lviv.ua",
      "mk.ua",
      "mykolaiv.ua",
      "nikolaev.ua",
      "od.ua",
      "odesa.ua",
      "odessa.ua",
      "pl.ua",
      "poltava.ua",
      "rivne.ua",
      "rovno.ua",
      "rv.ua",
      "sb.ua",
      "sebastopol.ua",
      "sevastopol.ua",
      "sm.ua",
      "sumy.ua",
      "te.ua",
      "ternopil.ua",
      "uz.ua",
      "uzhgorod.ua",
      "vinnica.ua",
      "vinnytsia.ua",
      "vn.ua",
      "volyn.ua",
      "yalta.ua",
      "zaporizhzhe.ua",
      "zaporizhzhia.ua",
      "zhitomir.ua",
      "zhytomyr.ua",
      "zp.ua",
      "zt.ua",
      "ug",
      "co.ug",
      "or.ug",
      "ac.ug",
      "sc.ug",
      "go.ug",
      "ne.ug",
      "com.ug",
      "org.ug",
      "uk",
      "ac.uk",
      "co.uk",
      "gov.uk",
      "ltd.uk",
      "me.uk",
      "net.uk",
      "nhs.uk",
      "org.uk",
      "plc.uk",
      "police.uk",
      "*.sch.uk",
      "us",
      "dni.us",
      "fed.us",
      "isa.us",
      "kids.us",
      "nsn.us",
      "ak.us",
      "al.us",
      "ar.us",
      "as.us",
      "az.us",
      "ca.us",
      "co.us",
      "ct.us",
      "dc.us",
      "de.us",
      "fl.us",
      "ga.us",
      "gu.us",
      "hi.us",
      "ia.us",
      "id.us",
      "il.us",
      "in.us",
      "ks.us",
      "ky.us",
      "la.us",
      "ma.us",
      "md.us",
      "me.us",
      "mi.us",
      "mn.us",
      "mo.us",
      "ms.us",
      "mt.us",
      "nc.us",
      "nd.us",
      "ne.us",
      "nh.us",
      "nj.us",
      "nm.us",
      "nv.us",
      "ny.us",
      "oh.us",
      "ok.us",
      "or.us",
      "pa.us",
      "pr.us",
      "ri.us",
      "sc.us",
      "sd.us",
      "tn.us",
      "tx.us",
      "ut.us",
      "vi.us",
      "vt.us",
      "va.us",
      "wa.us",
      "wi.us",
      "wv.us",
      "wy.us",
      "k12.ak.us",
      "k12.al.us",
      "k12.ar.us",
      "k12.as.us",
      "k12.az.us",
      "k12.ca.us",
      "k12.co.us",
      "k12.ct.us",
      "k12.dc.us",
      "k12.de.us",
      "k12.fl.us",
      "k12.ga.us",
      "k12.gu.us",
      "k12.ia.us",
      "k12.id.us",
      "k12.il.us",
      "k12.in.us",
      "k12.ks.us",
      "k12.ky.us",
      "k12.la.us",
      "k12.ma.us",
      "k12.md.us",
      "k12.me.us",
      "k12.mi.us",
      "k12.mn.us",
      "k12.mo.us",
      "k12.ms.us",
      "k12.mt.us",
      "k12.nc.us",
      "k12.ne.us",
      "k12.nh.us",
      "k12.nj.us",
      "k12.nm.us",
      "k12.nv.us",
      "k12.ny.us",
      "k12.oh.us",
      "k12.ok.us",
      "k12.or.us",
      "k12.pa.us",
      "k12.pr.us",
      "k12.sc.us",
      "k12.tn.us",
      "k12.tx.us",
      "k12.ut.us",
      "k12.vi.us",
      "k12.vt.us",
      "k12.va.us",
      "k12.wa.us",
      "k12.wi.us",
      "k12.wy.us",
      "cc.ak.us",
      "cc.al.us",
      "cc.ar.us",
      "cc.as.us",
      "cc.az.us",
      "cc.ca.us",
      "cc.co.us",
      "cc.ct.us",
      "cc.dc.us",
      "cc.de.us",
      "cc.fl.us",
      "cc.ga.us",
      "cc.gu.us",
      "cc.hi.us",
      "cc.ia.us",
      "cc.id.us",
      "cc.il.us",
      "cc.in.us",
      "cc.ks.us",
      "cc.ky.us",
      "cc.la.us",
      "cc.ma.us",
      "cc.md.us",
      "cc.me.us",
      "cc.mi.us",
      "cc.mn.us",
      "cc.mo.us",
      "cc.ms.us",
      "cc.mt.us",
      "cc.nc.us",
      "cc.nd.us",
      "cc.ne.us",
      "cc.nh.us",
      "cc.nj.us",
      "cc.nm.us",
      "cc.nv.us",
      "cc.ny.us",
      "cc.oh.us",
      "cc.ok.us",
      "cc.or.us",
      "cc.pa.us",
      "cc.pr.us",
      "cc.ri.us",
      "cc.sc.us",
      "cc.sd.us",
      "cc.tn.us",
      "cc.tx.us",
      "cc.ut.us",
      "cc.vi.us",
      "cc.vt.us",
      "cc.va.us",
      "cc.wa.us",
      "cc.wi.us",
      "cc.wv.us",
      "cc.wy.us",
      "lib.ak.us",
      "lib.al.us",
      "lib.ar.us",
      "lib.as.us",
      "lib.az.us",
      "lib.ca.us",
      "lib.co.us",
      "lib.ct.us",
      "lib.dc.us",
      "lib.fl.us",
      "lib.ga.us",
      "lib.gu.us",
      "lib.hi.us",
      "lib.ia.us",
      "lib.id.us",
      "lib.il.us",
      "lib.in.us",
      "lib.ks.us",
      "lib.ky.us",
      "lib.la.us",
      "lib.ma.us",
      "lib.md.us",
      "lib.me.us",
      "lib.mi.us",
      "lib.mn.us",
      "lib.mo.us",
      "lib.ms.us",
      "lib.mt.us",
      "lib.nc.us",
      "lib.nd.us",
      "lib.ne.us",
      "lib.nh.us",
      "lib.nj.us",
      "lib.nm.us",
      "lib.nv.us",
      "lib.ny.us",
      "lib.oh.us",
      "lib.ok.us",
      "lib.or.us",
      "lib.pa.us",
      "lib.pr.us",
      "lib.ri.us",
      "lib.sc.us",
      "lib.sd.us",
      "lib.tn.us",
      "lib.tx.us",
      "lib.ut.us",
      "lib.vi.us",
      "lib.vt.us",
      "lib.va.us",
      "lib.wa.us",
      "lib.wi.us",
      "lib.wy.us",
      "pvt.k12.ma.us",
      "chtr.k12.ma.us",
      "paroch.k12.ma.us",
      "ann-arbor.mi.us",
      "cog.mi.us",
      "dst.mi.us",
      "eaton.mi.us",
      "gen.mi.us",
      "mus.mi.us",
      "tec.mi.us",
      "washtenaw.mi.us",
      "uy",
      "com.uy",
      "edu.uy",
      "gub.uy",
      "mil.uy",
      "net.uy",
      "org.uy",
      "uz",
      "co.uz",
      "com.uz",
      "net.uz",
      "org.uz",
      "va",
      "vc",
      "com.vc",
      "net.vc",
      "org.vc",
      "gov.vc",
      "mil.vc",
      "edu.vc",
      "ve",
      "arts.ve",
      "bib.ve",
      "co.ve",
      "com.ve",
      "e12.ve",
      "edu.ve",
      "firm.ve",
      "gob.ve",
      "gov.ve",
      "info.ve",
      "int.ve",
      "mil.ve",
      "net.ve",
      "nom.ve",
      "org.ve",
      "rar.ve",
      "rec.ve",
      "store.ve",
      "tec.ve",
      "web.ve",
      "vg",
      "vi",
      "co.vi",
      "com.vi",
      "k12.vi",
      "net.vi",
      "org.vi",
      "vn",
      "com.vn",
      "net.vn",
      "org.vn",
      "edu.vn",
      "gov.vn",
      "int.vn",
      "ac.vn",
      "biz.vn",
      "info.vn",
      "name.vn",
      "pro.vn",
      "health.vn",
      "vu",
      "com.vu",
      "edu.vu",
      "net.vu",
      "org.vu",
      "wf",
      "ws",
      "com.ws",
      "net.ws",
      "org.ws",
      "gov.ws",
      "edu.ws",
      "yt",
      "امارات",
      "հայ",
      "বাংলা",
      "бг",
      "البحرين",
      "бел",
      "中国",
      "中國",
      "الجزائر",
      "مصر",
      "ею",
      "ευ",
      "موريتانيا",
      "გე",
      "ελ",
      "香港",
      "公司.香港",
      "教育.香港",
      "政府.香港",
      "個人.香港",
      "網絡.香港",
      "組織.香港",
      "ಭಾರತ",
      "ଭାରତ",
      "ভাৰত",
      "भारतम्",
      "भारोत",
      "ڀارت",
      "ഭാരതം",
      "भारत",
      "بارت",
      "بھارت",
      "భారత్",
      "ભારત",
      "ਭਾਰਤ",
      "ভারত",
      "இந்தியா",
      "ایران",
      "ايران",
      "عراق",
      "الاردن",
      "한국",
      "қаз",
      "ລາວ",
      "ලංකා",
      "இலங்கை",
      "المغرب",
      "мкд",
      "мон",
      "澳門",
      "澳门",
      "مليسيا",
      "عمان",
      "پاکستان",
      "پاكستان",
      "فلسطين",
      "срб",
      "пр.срб",
      "орг.срб",
      "обр.срб",
      "од.срб",
      "упр.срб",
      "ак.срб",
      "рф",
      "قطر",
      "السعودية",
      "السعودیة",
      "السعودیۃ",
      "السعوديه",
      "سودان",
      "新加坡",
      "சிங்கப்பூர்",
      "سورية",
      "سوريا",
      "ไทย",
      "ศึกษา.ไทย",
      "ธุรกิจ.ไทย",
      "รัฐบาล.ไทย",
      "ทหาร.ไทย",
      "เน็ต.ไทย",
      "องค์กร.ไทย",
      "تونس",
      "台灣",
      "台湾",
      "臺灣",
      "укр",
      "اليمن",
      "xxx",
      "ye",
      "com.ye",
      "edu.ye",
      "gov.ye",
      "net.ye",
      "mil.ye",
      "org.ye",
      "ac.za",
      "agric.za",
      "alt.za",
      "co.za",
      "edu.za",
      "gov.za",
      "grondar.za",
      "law.za",
      "mil.za",
      "net.za",
      "ngo.za",
      "nic.za",
      "nis.za",
      "nom.za",
      "org.za",
      "school.za",
      "tm.za",
      "web.za",
      "zm",
      "ac.zm",
      "biz.zm",
      "co.zm",
      "com.zm",
      "edu.zm",
      "gov.zm",
      "info.zm",
      "mil.zm",
      "net.zm",
      "org.zm",
      "sch.zm",
      "zw",
      "ac.zw",
      "co.zw",
      "gov.zw",
      "mil.zw",
      "org.zw",
      "aaa",
      "aarp",
      "abarth",
      "abb",
      "abbott",
      "abbvie",
      "abc",
      "able",
      "abogado",
      "abudhabi",
      "academy",
      "accenture",
      "accountant",
      "accountants",
      "aco",
      "actor",
      "adac",
      "ads",
      "adult",
      "aeg",
      "aetna",
      "afl",
      "africa",
      "agakhan",
      "agency",
      "aig",
      "airbus",
      "airforce",
      "airtel",
      "akdn",
      "alfaromeo",
      "alibaba",
      "alipay",
      "allfinanz",
      "allstate",
      "ally",
      "alsace",
      "alstom",
      "amazon",
      "americanexpress",
      "americanfamily",
      "amex",
      "amfam",
      "amica",
      "amsterdam",
      "analytics",
      "android",
      "anquan",
      "anz",
      "aol",
      "apartments",
      "app",
      "apple",
      "aquarelle",
      "arab",
      "aramco",
      "archi",
      "army",
      "art",
      "arte",
      "asda",
      "associates",
      "athleta",
      "attorney",
      "auction",
      "audi",
      "audible",
      "audio",
      "auspost",
      "author",
      "auto",
      "autos",
      "avianca",
      "aws",
      "axa",
      "azure",
      "baby",
      "baidu",
      "banamex",
      "bananarepublic",
      "band",
      "bank",
      "bar",
      "barcelona",
      "barclaycard",
      "barclays",
      "barefoot",
      "bargains",
      "baseball",
      "basketball",
      "bauhaus",
      "bayern",
      "bbc",
      "bbt",
      "bbva",
      "bcg",
      "bcn",
      "beats",
      "beauty",
      "beer",
      "bentley",
      "berlin",
      "best",
      "bestbuy",
      "bet",
      "bharti",
      "bible",
      "bid",
      "bike",
      "bing",
      "bingo",
      "bio",
      "black",
      "blackfriday",
      "blockbuster",
      "blog",
      "bloomberg",
      "blue",
      "bms",
      "bmw",
      "bnpparibas",
      "boats",
      "boehringer",
      "bofa",
      "bom",
      "bond",
      "boo",
      "book",
      "booking",
      "bosch",
      "bostik",
      "boston",
      "bot",
      "boutique",
      "box",
      "bradesco",
      "bridgestone",
      "broadway",
      "broker",
      "brother",
      "brussels",
      "bugatti",
      "build",
      "builders",
      "business",
      "buy",
      "buzz",
      "bzh",
      "cab",
      "cafe",
      "cal",
      "call",
      "calvinklein",
      "cam",
      "camera",
      "camp",
      "cancerresearch",
      "canon",
      "capetown",
      "capital",
      "capitalone",
      "car",
      "caravan",
      "cards",
      "care",
      "career",
      "careers",
      "cars",
      "casa",
      "case",
      "cash",
      "casino",
      "catering",
      "catholic",
      "cba",
      "cbn",
      "cbre",
      "cbs",
      "center",
      "ceo",
      "cern",
      "cfa",
      "cfd",
      "chanel",
      "channel",
      "charity",
      "chase",
      "chat",
      "cheap",
      "chintai",
      "christmas",
      "chrome",
      "church",
      "cipriani",
      "circle",
      "cisco",
      "citadel",
      "citi",
      "citic",
      "city",
      "cityeats",
      "claims",
      "cleaning",
      "click",
      "clinic",
      "clinique",
      "clothing",
      "cloud",
      "club",
      "clubmed",
      "coach",
      "codes",
      "coffee",
      "college",
      "cologne",
      "comcast",
      "commbank",
      "community",
      "company",
      "compare",
      "computer",
      "comsec",
      "condos",
      "construction",
      "consulting",
      "contact",
      "contractors",
      "cooking",
      "cookingchannel",
      "cool",
      "corsica",
      "country",
      "coupon",
      "coupons",
      "courses",
      "cpa",
      "credit",
      "creditcard",
      "creditunion",
      "cricket",
      "crown",
      "crs",
      "cruise",
      "cruises",
      "cuisinella",
      "cymru",
      "cyou",
      "dabur",
      "dad",
      "dance",
      "data",
      "date",
      "dating",
      "datsun",
      "day",
      "dclk",
      "dds",
      "deal",
      "dealer",
      "deals",
      "degree",
      "delivery",
      "dell",
      "deloitte",
      "delta",
      "democrat",
      "dental",
      "dentist",
      "desi",
      "design",
      "dev",
      "dhl",
      "diamonds",
      "diet",
      "digital",
      "direct",
      "directory",
      "discount",
      "discover",
      "dish",
      "diy",
      "dnp",
      "docs",
      "doctor",
      "dog",
      "domains",
      "dot",
      "download",
      "drive",
      "dtv",
      "dubai",
      "dunlop",
      "dupont",
      "durban",
      "dvag",
      "dvr",
      "earth",
      "eat",
      "eco",
      "edeka",
      "education",
      "email",
      "emerck",
      "energy",
      "engineer",
      "engineering",
      "enterprises",
      "epson",
      "equipment",
      "ericsson",
      "erni",
      "esq",
      "estate",
      "etisalat",
      "eurovision",
      "eus",
      "events",
      "exchange",
      "expert",
      "exposed",
      "express",
      "extraspace",
      "fage",
      "fail",
      "fairwinds",
      "faith",
      "family",
      "fan",
      "fans",
      "farm",
      "farmers",
      "fashion",
      "fast",
      "fedex",
      "feedback",
      "ferrari",
      "ferrero",
      "fiat",
      "fidelity",
      "fido",
      "film",
      "final",
      "finance",
      "financial",
      "fire",
      "firestone",
      "firmdale",
      "fish",
      "fishing",
      "fit",
      "fitness",
      "flickr",
      "flights",
      "flir",
      "florist",
      "flowers",
      "fly",
      "foo",
      "food",
      "foodnetwork",
      "football",
      "ford",
      "forex",
      "forsale",
      "forum",
      "foundation",
      "fox",
      "free",
      "fresenius",
      "frl",
      "frogans",
      "frontdoor",
      "frontier",
      "ftr",
      "fujitsu",
      "fun",
      "fund",
      "furniture",
      "futbol",
      "fyi",
      "gal",
      "gallery",
      "gallo",
      "gallup",
      "game",
      "games",
      "gap",
      "garden",
      "gay",
      "gbiz",
      "gdn",
      "gea",
      "gent",
      "genting",
      "george",
      "ggee",
      "gift",
      "gifts",
      "gives",
      "giving",
      "glass",
      "gle",
      "global",
      "globo",
      "gmail",
      "gmbh",
      "gmo",
      "gmx",
      "godaddy",
      "gold",
      "goldpoint",
      "golf",
      "goo",
      "goodyear",
      "goog",
      "google",
      "gop",
      "got",
      "grainger",
      "graphics",
      "gratis",
      "green",
      "gripe",
      "grocery",
      "group",
      "guardian",
      "gucci",
      "guge",
      "guide",
      "guitars",
      "guru",
      "hair",
      "hamburg",
      "hangout",
      "haus",
      "hbo",
      "hdfc",
      "hdfcbank",
      "health",
      "healthcare",
      "help",
      "helsinki",
      "here",
      "hermes",
      "hgtv",
      "hiphop",
      "hisamitsu",
      "hitachi",
      "hiv",
      "hkt",
      "hockey",
      "holdings",
      "holiday",
      "homedepot",
      "homegoods",
      "homes",
      "homesense",
      "honda",
      "horse",
      "hospital",
      "host",
      "hosting",
      "hot",
      "hoteles",
      "hotels",
      "hotmail",
      "house",
      "how",
      "hsbc",
      "hughes",
      "hyatt",
      "hyundai",
      "ibm",
      "icbc",
      "ice",
      "icu",
      "ieee",
      "ifm",
      "ikano",
      "imamat",
      "imdb",
      "immo",
      "immobilien",
      "inc",
      "industries",
      "infiniti",
      "ing",
      "ink",
      "institute",
      "insurance",
      "insure",
      "international",
      "intuit",
      "investments",
      "ipiranga",
      "irish",
      "ismaili",
      "ist",
      "istanbul",
      "itau",
      "itv",
      "jaguar",
      "java",
      "jcb",
      "jeep",
      "jetzt",
      "jewelry",
      "jio",
      "jll",
      "jmp",
      "jnj",
      "joburg",
      "jot",
      "joy",
      "jpmorgan",
      "jprs",
      "juegos",
      "juniper",
      "kaufen",
      "kddi",
      "kerryhotels",
      "kerrylogistics",
      "kerryproperties",
      "kfh",
      "kia",
      "kids",
      "kim",
      "kinder",
      "kindle",
      "kitchen",
      "kiwi",
      "koeln",
      "komatsu",
      "kosher",
      "kpmg",
      "kpn",
      "krd",
      "kred",
      "kuokgroup",
      "kyoto",
      "lacaixa",
      "lamborghini",
      "lamer",
      "lancaster",
      "lancia",
      "land",
      "landrover",
      "lanxess",
      "lasalle",
      "lat",
      "latino",
      "latrobe",
      "law",
      "lawyer",
      "lds",
      "lease",
      "leclerc",
      "lefrak",
      "legal",
      "lego",
      "lexus",
      "lgbt",
      "lidl",
      "life",
      "lifeinsurance",
      "lifestyle",
      "lighting",
      "like",
      "lilly",
      "limited",
      "limo",
      "lincoln",
      "linde",
      "link",
      "lipsy",
      "live",
      "living",
      "llc",
      "llp",
      "loan",
      "loans",
      "locker",
      "locus",
      "loft",
      "lol",
      "london",
      "lotte",
      "lotto",
      "love",
      "lpl",
      "lplfinancial",
      "ltd",
      "ltda",
      "lundbeck",
      "luxe",
      "luxury",
      "macys",
      "madrid",
      "maif",
      "maison",
      "makeup",
      "man",
      "management",
      "mango",
      "map",
      "market",
      "marketing",
      "markets",
      "marriott",
      "marshalls",
      "maserati",
      "mattel",
      "mba",
      "mckinsey",
      "med",
      "media",
      "meet",
      "melbourne",
      "meme",
      "memorial",
      "men",
      "menu",
      "merckmsd",
      "miami",
      "microsoft",
      "mini",
      "mint",
      "mit",
      "mitsubishi",
      "mlb",
      "mls",
      "mma",
      "mobile",
      "moda",
      "moe",
      "moi",
      "mom",
      "monash",
      "money",
      "monster",
      "mormon",
      "mortgage",
      "moscow",
      "moto",
      "motorcycles",
      "mov",
      "movie",
      "msd",
      "mtn",
      "mtr",
      "music",
      "mutual",
      "nab",
      "nagoya",
      "natura",
      "navy",
      "nba",
      "nec",
      "netbank",
      "netflix",
      "network",
      "neustar",
      "new",
      "news",
      "next",
      "nextdirect",
      "nexus",
      "nfl",
      "ngo",
      "nhk",
      "nico",
      "nike",
      "nikon",
      "ninja",
      "nissan",
      "nissay",
      "nokia",
      "northwesternmutual",
      "norton",
      "now",
      "nowruz",
      "nowtv",
      "nra",
      "nrw",
      "ntt",
      "nyc",
      "obi",
      "observer",
      "office",
      "okinawa",
      "olayan",
      "olayangroup",
      "oldnavy",
      "ollo",
      "omega",
      "one",
      "ong",
      "onl",
      "online",
      "ooo",
      "open",
      "oracle",
      "orange",
      "organic",
      "origins",
      "osaka",
      "otsuka",
      "ott",
      "ovh",
      "page",
      "panasonic",
      "paris",
      "pars",
      "partners",
      "parts",
      "party",
      "passagens",
      "pay",
      "pccw",
      "pet",
      "pfizer",
      "pharmacy",
      "phd",
      "philips",
      "phone",
      "photo",
      "photography",
      "photos",
      "physio",
      "pics",
      "pictet",
      "pictures",
      "pid",
      "pin",
      "ping",
      "pink",
      "pioneer",
      "pizza",
      "place",
      "play",
      "playstation",
      "plumbing",
      "plus",
      "pnc",
      "pohl",
      "poker",
      "politie",
      "porn",
      "pramerica",
      "praxi",
      "press",
      "prime",
      "prod",
      "productions",
      "prof",
      "progressive",
      "promo",
      "properties",
      "property",
      "protection",
      "pru",
      "prudential",
      "pub",
      "pwc",
      "qpon",
      "quebec",
      "quest",
      "racing",
      "radio",
      "read",
      "realestate",
      "realtor",
      "realty",
      "recipes",
      "red",
      "redstone",
      "redumbrella",
      "rehab",
      "reise",
      "reisen",
      "reit",
      "reliance",
      "ren",
      "rent",
      "rentals",
      "repair",
      "report",
      "republican",
      "rest",
      "restaurant",
      "review",
      "reviews",
      "rexroth",
      "rich",
      "richardli",
      "ricoh",
      "ril",
      "rio",
      "rip",
      "rocher",
      "rocks",
      "rodeo",
      "rogers",
      "room",
      "rsvp",
      "rugby",
      "ruhr",
      "run",
      "rwe",
      "ryukyu",
      "saarland",
      "safe",
      "safety",
      "sakura",
      "sale",
      "salon",
      "samsclub",
      "samsung",
      "sandvik",
      "sandvikcoromant",
      "sanofi",
      "sap",
      "sarl",
      "sas",
      "save",
      "saxo",
      "sbi",
      "sbs",
      "sca",
      "scb",
      "schaeffler",
      "schmidt",
      "scholarships",
      "school",
      "schule",
      "schwarz",
      "science",
      "scot",
      "search",
      "seat",
      "secure",
      "security",
      "seek",
      "select",
      "sener",
      "services",
      "ses",
      "seven",
      "sew",
      "sex",
      "sexy",
      "sfr",
      "shangrila",
      "sharp",
      "shaw",
      "shell",
      "shia",
      "shiksha",
      "shoes",
      "shop",
      "shopping",
      "shouji",
      "show",
      "showtime",
      "silk",
      "sina",
      "singles",
      "site",
      "ski",
      "skin",
      "sky",
      "skype",
      "sling",
      "smart",
      "smile",
      "sncf",
      "soccer",
      "social",
      "softbank",
      "software",
      "sohu",
      "solar",
      "solutions",
      "song",
      "sony",
      "soy",
      "spa",
      "space",
      "sport",
      "spot",
      "srl",
      "stada",
      "staples",
      "star",
      "statebank",
      "statefarm",
      "stc",
      "stcgroup",
      "stockholm",
      "storage",
      "store",
      "stream",
      "studio",
      "study",
      "style",
      "sucks",
      "supplies",
      "supply",
      "support",
      "surf",
      "surgery",
      "suzuki",
      "swatch",
      "swiss",
      "sydney",
      "systems",
      "tab",
      "taipei",
      "talk",
      "taobao",
      "target",
      "tatamotors",
      "tatar",
      "tattoo",
      "tax",
      "taxi",
      "tci",
      "tdk",
      "team",
      "tech",
      "technology",
      "temasek",
      "tennis",
      "teva",
      "thd",
      "theater",
      "theatre",
      "tiaa",
      "tickets",
      "tienda",
      "tiffany",
      "tips",
      "tires",
      "tirol",
      "tjmaxx",
      "tjx",
      "tkmaxx",
      "tmall",
      "today",
      "tokyo",
      "tools",
      "top",
      "toray",
      "toshiba",
      "total",
      "tours",
      "town",
      "toyota",
      "toys",
      "trade",
      "trading",
      "training",
      "travel",
      "travelchannel",
      "travelers",
      "travelersinsurance",
      "trust",
      "trv",
      "tube",
      "tui",
      "tunes",
      "tushu",
      "tvs",
      "ubank",
      "ubs",
      "unicom",
      "university",
      "uno",
      "uol",
      "ups",
      "vacations",
      "vana",
      "vanguard",
      "vegas",
      "ventures",
      "verisign",
      "versicherung",
      "vet",
      "viajes",
      "video",
      "vig",
      "viking",
      "villas",
      "vin",
      "vip",
      "virgin",
      "visa",
      "vision",
      "viva",
      "vivo",
      "vlaanderen",
      "vodka",
      "volkswagen",
      "volvo",
      "vote",
      "voting",
      "voto",
      "voyage",
      "vuelos",
      "wales",
      "walmart",
      "walter",
      "wang",
      "wanggou",
      "watch",
      "watches",
      "weather",
      "weatherchannel",
      "webcam",
      "weber",
      "website",
      "wedding",
      "weibo",
      "weir",
      "whoswho",
      "wien",
      "wiki",
      "williamhill",
      "win",
      "windows",
      "wine",
      "winners",
      "wme",
      "wolterskluwer",
      "woodside",
      "work",
      "works",
      "world",
      "wow",
      "wtc",
      "wtf",
      "xbox",
      "xerox",
      "xfinity",
      "xihuan",
      "xin",
      "कॉम",
      "セール",
      "佛山",
      "慈善",
      "集团",
      "在线",
      "点看",
      "คอม",
      "八卦",
      "موقع",
      "公益",
      "公司",
      "香格里拉",
      "网站",
      "移动",
      "我爱你",
      "москва",
      "католик",
      "онлайн",
      "сайт",
      "联通",
      "קום",
      "时尚",
      "微博",
      "淡马锡",
      "ファッション",
      "орг",
      "नेट",
      "ストア",
      "アマゾン",
      "삼성",
      "商标",
      "商店",
      "商城",
      "дети",
      "ポイント",
      "新闻",
      "家電",
      "كوم",
      "中文网",
      "中信",
      "娱乐",
      "谷歌",
      "電訊盈科",
      "购物",
      "クラウド",
      "通販",
      "网店",
      "संगठन",
      "餐厅",
      "网络",
      "ком",
      "亚马逊",
      "诺基亚",
      "食品",
      "飞利浦",
      "手机",
      "ارامكو",
      "العليان",
      "اتصالات",
      "بازار",
      "ابوظبي",
      "كاثوليك",
      "همراه",
      "닷컴",
      "政府",
      "شبكة",
      "بيتك",
      "عرب",
      "机构",
      "组织机构",
      "健康",
      "招聘",
      "рус",
      "大拿",
      "みんな",
      "グーグル",
      "世界",
      "書籍",
      "网址",
      "닷넷",
      "コム",
      "天主教",
      "游戏",
      "vermögensberater",
      "vermögensberatung",
      "企业",
      "信息",
      "嘉里大酒店",
      "嘉里",
      "广东",
      "政务",
      "xyz",
      "yachts",
      "yahoo",
      "yamaxun",
      "yandex",
      "yodobashi",
      "yoga",
      "yokohama",
      "you",
      "youtube",
      "yun",
      "zappos",
      "zara",
      "zero",
      "zip",
      "zone",
      "zuerich",
      "cc.ua",
      "inf.ua",
      "ltd.ua",
      "611.to",
      "graphox.us",
      "*.devcdnaccesso.com",
      "adobeaemcloud.com",
      "*.dev.adobeaemcloud.com",
      "hlx.live",
      "adobeaemcloud.net",
      "hlx.page",
      "hlx3.page",
      "beep.pl",
      "airkitapps.com",
      "airkitapps-au.com",
      "airkitapps.eu",
      "aivencloud.com",
      "barsy.ca",
      "*.compute.estate",
      "*.alces.network",
      "kasserver.com",
      "altervista.org",
      "alwaysdata.net",
      "cloudfront.net",
      "*.compute.amazonaws.com",
      "*.compute-1.amazonaws.com",
      "*.compute.amazonaws.com.cn",
      "us-east-1.amazonaws.com",
      "cn-north-1.eb.amazonaws.com.cn",
      "cn-northwest-1.eb.amazonaws.com.cn",
      "elasticbeanstalk.com",
      "ap-northeast-1.elasticbeanstalk.com",
      "ap-northeast-2.elasticbeanstalk.com",
      "ap-northeast-3.elasticbeanstalk.com",
      "ap-south-1.elasticbeanstalk.com",
      "ap-southeast-1.elasticbeanstalk.com",
      "ap-southeast-2.elasticbeanstalk.com",
      "ca-central-1.elasticbeanstalk.com",
      "eu-central-1.elasticbeanstalk.com",
      "eu-west-1.elasticbeanstalk.com",
      "eu-west-2.elasticbeanstalk.com",
      "eu-west-3.elasticbeanstalk.com",
      "sa-east-1.elasticbeanstalk.com",
      "us-east-1.elasticbeanstalk.com",
      "us-east-2.elasticbeanstalk.com",
      "us-gov-west-1.elasticbeanstalk.com",
      "us-west-1.elasticbeanstalk.com",
      "us-west-2.elasticbeanstalk.com",
      "*.elb.amazonaws.com",
      "*.elb.amazonaws.com.cn",
      "awsglobalaccelerator.com",
      "s3.amazonaws.com",
      "s3-ap-northeast-1.amazonaws.com",
      "s3-ap-northeast-2.amazonaws.com",
      "s3-ap-south-1.amazonaws.com",
      "s3-ap-southeast-1.amazonaws.com",
      "s3-ap-southeast-2.amazonaws.com",
      "s3-ca-central-1.amazonaws.com",
      "s3-eu-central-1.amazonaws.com",
      "s3-eu-west-1.amazonaws.com",
      "s3-eu-west-2.amazonaws.com",
      "s3-eu-west-3.amazonaws.com",
      "s3-external-1.amazonaws.com",
      "s3-fips-us-gov-west-1.amazonaws.com",
      "s3-sa-east-1.amazonaws.com",
      "s3-us-gov-west-1.amazonaws.com",
      "s3-us-east-2.amazonaws.com",
      "s3-us-west-1.amazonaws.com",
      "s3-us-west-2.amazonaws.com",
      "s3.ap-northeast-2.amazonaws.com",
      "s3.ap-south-1.amazonaws.com",
      "s3.cn-north-1.amazonaws.com.cn",
      "s3.ca-central-1.amazonaws.com",
      "s3.eu-central-1.amazonaws.com",
      "s3.eu-west-2.amazonaws.com",
      "s3.eu-west-3.amazonaws.com",
      "s3.us-east-2.amazonaws.com",
      "s3.dualstack.ap-northeast-1.amazonaws.com",
      "s3.dualstack.ap-northeast-2.amazonaws.com",
      "s3.dualstack.ap-south-1.amazonaws.com",
      "s3.dualstack.ap-southeast-1.amazonaws.com",
      "s3.dualstack.ap-southeast-2.amazonaws.com",
      "s3.dualstack.ca-central-1.amazonaws.com",
      "s3.dualstack.eu-central-1.amazonaws.com",
      "s3.dualstack.eu-west-1.amazonaws.com",
      "s3.dualstack.eu-west-2.amazonaws.com",
      "s3.dualstack.eu-west-3.amazonaws.com",
      "s3.dualstack.sa-east-1.amazonaws.com",
      "s3.dualstack.us-east-1.amazonaws.com",
      "s3.dualstack.us-east-2.amazonaws.com",
      "s3-website-us-east-1.amazonaws.com",
      "s3-website-us-west-1.amazonaws.com",
      "s3-website-us-west-2.amazonaws.com",
      "s3-website-ap-northeast-1.amazonaws.com",
      "s3-website-ap-southeast-1.amazonaws.com",
      "s3-website-ap-southeast-2.amazonaws.com",
      "s3-website-eu-west-1.amazonaws.com",
      "s3-website-sa-east-1.amazonaws.com",
      "s3-website.ap-northeast-2.amazonaws.com",
      "s3-website.ap-south-1.amazonaws.com",
      "s3-website.ca-central-1.amazonaws.com",
      "s3-website.eu-central-1.amazonaws.com",
      "s3-website.eu-west-2.amazonaws.com",
      "s3-website.eu-west-3.amazonaws.com",
      "s3-website.us-east-2.amazonaws.com",
      "t3l3p0rt.net",
      "tele.amune.org",
      "apigee.io",
      "siiites.com",
      "appspacehosted.com",
      "appspaceusercontent.com",
      "appudo.net",
      "on-aptible.com",
      "user.aseinet.ne.jp",
      "gv.vc",
      "d.gv.vc",
      "user.party.eus",
      "pimienta.org",
      "poivron.org",
      "potager.org",
      "sweetpepper.org",
      "myasustor.com",
      "cdn.prod.atlassian-dev.net",
      "translated.page",
      "myfritz.net",
      "onavstack.net",
      "*.awdev.ca",
      "*.advisor.ws",
      "ecommerce-shop.pl",
      "b-data.io",
      "backplaneapp.io",
      "balena-devices.com",
      "rs.ba",
      "*.banzai.cloud",
      "app.banzaicloud.io",
      "*.backyards.banzaicloud.io",
      "base.ec",
      "official.ec",
      "buyshop.jp",
      "fashionstore.jp",
      "handcrafted.jp",
      "kawaiishop.jp",
      "supersale.jp",
      "theshop.jp",
      "shopselect.net",
      "base.shop",
      "*.beget.app",
      "betainabox.com",
      "bnr.la",
      "bitbucket.io",
      "blackbaudcdn.net",
      "of.je",
      "bluebite.io",
      "boomla.net",
      "boutir.com",
      "boxfuse.io",
      "square7.ch",
      "bplaced.com",
      "bplaced.de",
      "square7.de",
      "bplaced.net",
      "square7.net",
      "shop.brendly.rs",
      "browsersafetymark.io",
      "uk0.bigv.io",
      "dh.bytemark.co.uk",
      "vm.bytemark.co.uk",
      "cafjs.com",
      "mycd.eu",
      "drr.ac",
      "uwu.ai",
      "carrd.co",
      "crd.co",
      "ju.mp",
      "ae.org",
      "br.com",
      "cn.com",
      "com.de",
      "com.se",
      "de.com",
      "eu.com",
      "gb.net",
      "hu.net",
      "jp.net",
      "jpn.com",
      "mex.com",
      "ru.com",
      "sa.com",
      "se.net",
      "uk.com",
      "uk.net",
      "us.com",
      "za.bz",
      "za.com",
      "ar.com",
      "hu.com",
      "kr.com",
      "no.com",
      "qc.com",
      "uy.com",
      "africa.com",
      "gr.com",
      "in.net",
      "web.in",
      "us.org",
      "co.com",
      "aus.basketball",
      "nz.basketball",
      "radio.am",
      "radio.fm",
      "c.la",
      "certmgr.org",
      "cx.ua",
      "discourse.group",
      "discourse.team",
      "cleverapps.io",
      "clerk.app",
      "clerkstage.app",
      "*.lcl.dev",
      "*.lclstage.dev",
      "*.stg.dev",
      "*.stgstage.dev",
      "clickrising.net",
      "c66.me",
      "cloud66.ws",
      "cloud66.zone",
      "jdevcloud.com",
      "wpdevcloud.com",
      "cloudaccess.host",
      "freesite.host",
      "cloudaccess.net",
      "cloudcontrolled.com",
      "cloudcontrolapp.com",
      "*.cloudera.site",
      "pages.dev",
      "trycloudflare.com",
      "workers.dev",
      "wnext.app",
      "co.ca",
      "*.otap.co",
      "co.cz",
      "c.cdn77.org",
      "cdn77-ssl.net",
      "r.cdn77.net",
      "rsc.cdn77.org",
      "ssl.origin.cdn77-secure.org",
      "cloudns.asia",
      "cloudns.biz",
      "cloudns.club",
      "cloudns.cc",
      "cloudns.eu",
      "cloudns.in",
      "cloudns.info",
      "cloudns.org",
      "cloudns.pro",
      "cloudns.pw",
      "cloudns.us",
      "cnpy.gdn",
      "codeberg.page",
      "co.nl",
      "co.no",
      "webhosting.be",
      "hosting-cluster.nl",
      "ac.ru",
      "edu.ru",
      "gov.ru",
      "int.ru",
      "mil.ru",
      "test.ru",
      "dyn.cosidns.de",
      "dynamisches-dns.de",
      "dnsupdater.de",
      "internet-dns.de",
      "l-o-g-i-n.de",
      "dynamic-dns.info",
      "feste-ip.net",
      "knx-server.net",
      "static-access.net",
      "realm.cz",
      "*.cryptonomic.net",
      "cupcake.is",
      "curv.dev",
      "*.customer-oci.com",
      "*.oci.customer-oci.com",
      "*.ocp.customer-oci.com",
      "*.ocs.customer-oci.com",
      "cyon.link",
      "cyon.site",
      "fnwk.site",
      "folionetwork.site",
      "platform0.app",
      "daplie.me",
      "localhost.daplie.me",
      "dattolocal.com",
      "dattorelay.com",
      "dattoweb.com",
      "mydatto.com",
      "dattolocal.net",
      "mydatto.net",
      "biz.dk",
      "co.dk",
      "firm.dk",
      "reg.dk",
      "store.dk",
      "dyndns.dappnode.io",
      "*.dapps.earth",
      "*.bzz.dapps.earth",
      "builtwithdark.com",
      "demo.datadetect.com",
      "instance.datadetect.com",
      "edgestack.me",
      "ddns5.com",
      "debian.net",
      "deno.dev",
      "deno-staging.dev",
      "dedyn.io",
      "deta.app",
      "deta.dev",
      "*.rss.my.id",
      "*.diher.solutions",
      "discordsays.com",
      "discordsez.com",
      "jozi.biz",
      "dnshome.de",
      "online.th",
      "shop.th",
      "drayddns.com",
      "shoparena.pl",
      "dreamhosters.com",
      "mydrobo.com",
      "drud.io",
      "drud.us",
      "duckdns.org",
      "bip.sh",
      "bitbridge.net",
      "dy.fi",
      "tunk.org",
      "dyndns-at-home.com",
      "dyndns-at-work.com",
      "dyndns-blog.com",
      "dyndns-free.com",
      "dyndns-home.com",
      "dyndns-ip.com",
      "dyndns-mail.com",
      "dyndns-office.com",
      "dyndns-pics.com",
      "dyndns-remote.com",
      "dyndns-server.com",
      "dyndns-web.com",
      "dyndns-wiki.com",
      "dyndns-work.com",
      "dyndns.biz",
      "dyndns.info",
      "dyndns.org",
      "dyndns.tv",
      "at-band-camp.net",
      "ath.cx",
      "barrel-of-knowledge.info",
      "barrell-of-knowledge.info",
      "better-than.tv",
      "blogdns.com",
      "blogdns.net",
      "blogdns.org",
      "blogsite.org",
      "boldlygoingnowhere.org",
      "broke-it.net",
      "buyshouses.net",
      "cechire.com",
      "dnsalias.com",
      "dnsalias.net",
      "dnsalias.org",
      "dnsdojo.com",
      "dnsdojo.net",
      "dnsdojo.org",
      "does-it.net",
      "doesntexist.com",
      "doesntexist.org",
      "dontexist.com",
      "dontexist.net",
      "dontexist.org",
      "doomdns.com",
      "doomdns.org",
      "dvrdns.org",
      "dyn-o-saur.com",
      "dynalias.com",
      "dynalias.net",
      "dynalias.org",
      "dynathome.net",
      "dyndns.ws",
      "endofinternet.net",
      "endofinternet.org",
      "endoftheinternet.org",
      "est-a-la-maison.com",
      "est-a-la-masion.com",
      "est-le-patron.com",
      "est-mon-blogueur.com",
      "for-better.biz",
      "for-more.biz",
      "for-our.info",
      "for-some.biz",
      "for-the.biz",
      "forgot.her.name",
      "forgot.his.name",
      "from-ak.com",
      "from-al.com",
      "from-ar.com",
      "from-az.net",
      "from-ca.com",
      "from-co.net",
      "from-ct.com",
      "from-dc.com",
      "from-de.com",
      "from-fl.com",
      "from-ga.com",
      "from-hi.com",
      "from-ia.com",
      "from-id.com",
      "from-il.com",
      "from-in.com",
      "from-ks.com",
      "from-ky.com",
      "from-la.net",
      "from-ma.com",
      "from-md.com",
      "from-me.org",
      "from-mi.com",
      "from-mn.com",
      "from-mo.com",
      "from-ms.com",
      "from-mt.com",
      "from-nc.com",
      "from-nd.com",
      "from-ne.com",
      "from-nh.com",
      "from-nj.com",
      "from-nm.com",
      "from-nv.com",
      "from-ny.net",
      "from-oh.com",
      "from-ok.com",
      "from-or.com",
      "from-pa.com",
      "from-pr.com",
      "from-ri.com",
      "from-sc.com",
      "from-sd.com",
      "from-tn.com",
      "from-tx.com",
      "from-ut.com",
      "from-va.com",
      "from-vt.com",
      "from-wa.com",
      "from-wi.com",
      "from-wv.com",
      "from-wy.com",
      "ftpaccess.cc",
      "fuettertdasnetz.de",
      "game-host.org",
      "game-server.cc",
      "getmyip.com",
      "gets-it.net",
      "go.dyndns.org",
      "gotdns.com",
      "gotdns.org",
      "groks-the.info",
      "groks-this.info",
      "ham-radio-op.net",
      "here-for-more.info",
      "hobby-site.com",
      "hobby-site.org",
      "home.dyndns.org",
      "homedns.org",
      "homeftp.net",
      "homeftp.org",
      "homeip.net",
      "homelinux.com",
      "homelinux.net",
      "homelinux.org",
      "homeunix.com",
      "homeunix.net",
      "homeunix.org",
      "iamallama.com",
      "in-the-band.net",
      "is-a-anarchist.com",
      "is-a-blogger.com",
      "is-a-bookkeeper.com",
      "is-a-bruinsfan.org",
      "is-a-bulls-fan.com",
      "is-a-candidate.org",
      "is-a-caterer.com",
      "is-a-celticsfan.org",
      "is-a-chef.com",
      "is-a-chef.net",
      "is-a-chef.org",
      "is-a-conservative.com",
      "is-a-cpa.com",
      "is-a-cubicle-slave.com",
      "is-a-democrat.com",
      "is-a-designer.com",
      "is-a-doctor.com",
      "is-a-financialadvisor.com",
      "is-a-geek.com",
      "is-a-geek.net",
      "is-a-geek.org",
      "is-a-green.com",
      "is-a-guru.com",
      "is-a-hard-worker.com",
      "is-a-hunter.com",
      "is-a-knight.org",
      "is-a-landscaper.com",
      "is-a-lawyer.com",
      "is-a-liberal.com",
      "is-a-libertarian.com",
      "is-a-linux-user.org",
      "is-a-llama.com",
      "is-a-musician.com",
      "is-a-nascarfan.com",
      "is-a-nurse.com",
      "is-a-painter.com",
      "is-a-patsfan.org",
      "is-a-personaltrainer.com",
      "is-a-photographer.com",
      "is-a-player.com",
      "is-a-republican.com",
      "is-a-rockstar.com",
      "is-a-socialist.com",
      "is-a-soxfan.org",
      "is-a-student.com",
      "is-a-teacher.com",
      "is-a-techie.com",
      "is-a-therapist.com",
      "is-an-accountant.com",
      "is-an-actor.com",
      "is-an-actress.com",
      "is-an-anarchist.com",
      "is-an-artist.com",
      "is-an-engineer.com",
      "is-an-entertainer.com",
      "is-by.us",
      "is-certified.com",
      "is-found.org",
      "is-gone.com",
      "is-into-anime.com",
      "is-into-cars.com",
      "is-into-cartoons.com",
      "is-into-games.com",
      "is-leet.com",
      "is-lost.org",
      "is-not-certified.com",
      "is-saved.org",
      "is-slick.com",
      "is-uberleet.com",
      "is-very-bad.org",
      "is-very-evil.org",
      "is-very-good.org",
      "is-very-nice.org",
      "is-very-sweet.org",
      "is-with-theband.com",
      "isa-geek.com",
      "isa-geek.net",
      "isa-geek.org",
      "isa-hockeynut.com",
      "issmarterthanyou.com",
      "isteingeek.de",
      "istmein.de",
      "kicks-ass.net",
      "kicks-ass.org",
      "knowsitall.info",
      "land-4-sale.us",
      "lebtimnetz.de",
      "leitungsen.de",
      "likes-pie.com",
      "likescandy.com",
      "merseine.nu",
      "mine.nu",
      "misconfused.org",
      "mypets.ws",
      "myphotos.cc",
      "neat-url.com",
      "office-on-the.net",
      "on-the-web.tv",
      "podzone.net",
      "podzone.org",
      "readmyblog.org",
      "saves-the-whales.com",
      "scrapper-site.net",
      "scrapping.cc",
      "selfip.biz",
      "selfip.com",
      "selfip.info",
      "selfip.net",
      "selfip.org",
      "sells-for-less.com",
      "sells-for-u.com",
      "sells-it.net",
      "sellsyourhome.org",
      "servebbs.com",
      "servebbs.net",
      "servebbs.org",
      "serveftp.net",
      "serveftp.org",
      "servegame.org",
      "shacknet.nu",
      "simple-url.com",
      "space-to-rent.com",
      "stuff-4-sale.org",
      "stuff-4-sale.us",
      "teaches-yoga.com",
      "thruhere.net",
      "traeumtgerade.de",
      "webhop.biz",
      "webhop.info",
      "webhop.net",
      "webhop.org",
      "worse-than.tv",
      "writesthisblog.com",
      "ddnss.de",
      "dyn.ddnss.de",
      "dyndns.ddnss.de",
      "dyndns1.de",
      "dyn-ip24.de",
      "home-webserver.de",
      "dyn.home-webserver.de",
      "myhome-server.de",
      "ddnss.org",
      "definima.net",
      "definima.io",
      "ondigitalocean.app",
      "*.digitaloceanspaces.com",
      "bci.dnstrace.pro",
      "ddnsfree.com",
      "ddnsgeek.com",
      "giize.com",
      "gleeze.com",
      "kozow.com",
      "loseyourip.com",
      "ooguy.com",
      "theworkpc.com",
      "casacam.net",
      "dynu.net",
      "accesscam.org",
      "camdvr.org",
      "freeddns.org",
      "mywire.org",
      "webredirect.org",
      "myddns.rocks",
      "blogsite.xyz",
      "dynv6.net",
      "e4.cz",
      "eero.online",
      "eero-stage.online",
      "elementor.cloud",
      "elementor.cool",
      "en-root.fr",
      "mytuleap.com",
      "tuleap-partners.com",
      "encr.app",
      "encoreapi.com",
      "onred.one",
      "staging.onred.one",
      "eu.encoway.cloud",
      "eu.org",
      "al.eu.org",
      "asso.eu.org",
      "at.eu.org",
      "au.eu.org",
      "be.eu.org",
      "bg.eu.org",
      "ca.eu.org",
      "cd.eu.org",
      "ch.eu.org",
      "cn.eu.org",
      "cy.eu.org",
      "cz.eu.org",
      "de.eu.org",
      "dk.eu.org",
      "edu.eu.org",
      "ee.eu.org",
      "es.eu.org",
      "fi.eu.org",
      "fr.eu.org",
      "gr.eu.org",
      "hr.eu.org",
      "hu.eu.org",
      "ie.eu.org",
      "il.eu.org",
      "in.eu.org",
      "int.eu.org",
      "is.eu.org",
      "it.eu.org",
      "jp.eu.org",
      "kr.eu.org",
      "lt.eu.org",
      "lu.eu.org",
      "lv.eu.org",
      "mc.eu.org",
      "me.eu.org",
      "mk.eu.org",
      "mt.eu.org",
      "my.eu.org",
      "net.eu.org",
      "ng.eu.org",
      "nl.eu.org",
      "no.eu.org",
      "nz.eu.org",
      "paris.eu.org",
      "pl.eu.org",
      "pt.eu.org",
      "q-a.eu.org",
      "ro.eu.org",
      "ru.eu.org",
      "se.eu.org",
      "si.eu.org",
      "sk.eu.org",
      "tr.eu.org",
      "uk.eu.org",
      "us.eu.org",
      "eurodir.ru",
      "eu-1.evennode.com",
      "eu-2.evennode.com",
      "eu-3.evennode.com",
      "eu-4.evennode.com",
      "us-1.evennode.com",
      "us-2.evennode.com",
      "us-3.evennode.com",
      "us-4.evennode.com",
      "twmail.cc",
      "twmail.net",
      "twmail.org",
      "mymailer.com.tw",
      "url.tw",
      "onfabrica.com",
      "apps.fbsbx.com",
      "ru.net",
      "adygeya.ru",
      "bashkiria.ru",
      "bir.ru",
      "cbg.ru",
      "com.ru",
      "dagestan.ru",
      "grozny.ru",
      "kalmykia.ru",
      "kustanai.ru",
      "marine.ru",
      "mordovia.ru",
      "msk.ru",
      "mytis.ru",
      "nalchik.ru",
      "nov.ru",
      "pyatigorsk.ru",
      "spb.ru",
      "vladikavkaz.ru",
      "vladimir.ru",
      "abkhazia.su",
      "adygeya.su",
      "aktyubinsk.su",
      "arkhangelsk.su",
      "armenia.su",
      "ashgabad.su",
      "azerbaijan.su",
      "balashov.su",
      "bashkiria.su",
      "bryansk.su",
      "bukhara.su",
      "chimkent.su",
      "dagestan.su",
      "east-kazakhstan.su",
      "exnet.su",
      "georgia.su",
      "grozny.su",
      "ivanovo.su",
      "jambyl.su",
      "kalmykia.su",
      "kaluga.su",
      "karacol.su",
      "karaganda.su",
      "karelia.su",
      "khakassia.su",
      "krasnodar.su",
      "kurgan.su",
      "kustanai.su",
      "lenug.su",
      "mangyshlak.su",
      "mordovia.su",
      "msk.su",
      "murmansk.su",
      "nalchik.su",
      "navoi.su",
      "north-kazakhstan.su",
      "nov.su",
      "obninsk.su",
      "penza.su",
      "pokrovsk.su",
      "sochi.su",
      "spb.su",
      "tashkent.su",
      "termez.su",
      "togliatti.su",
      "troitsk.su",
      "tselinograd.su",
      "tula.su",
      "tuva.su",
      "vladikavkaz.su",
      "vladimir.su",
      "vologda.su",
      "channelsdvr.net",
      "u.channelsdvr.net",
      "edgecompute.app",
      "fastly-terrarium.com",
      "fastlylb.net",
      "map.fastlylb.net",
      "freetls.fastly.net",
      "map.fastly.net",
      "a.prod.fastly.net",
      "global.prod.fastly.net",
      "a.ssl.fastly.net",
      "b.ssl.fastly.net",
      "global.ssl.fastly.net",
      "fastvps-server.com",
      "fastvps.host",
      "myfast.host",
      "fastvps.site",
      "myfast.space",
      "fedorainfracloud.org",
      "fedorapeople.org",
      "cloud.fedoraproject.org",
      "app.os.fedoraproject.org",
      "app.os.stg.fedoraproject.org",
      "conn.uk",
      "copro.uk",
      "hosp.uk",
      "mydobiss.com",
      "fh-muenster.io",
      "filegear.me",
      "filegear-au.me",
      "filegear-de.me",
      "filegear-gb.me",
      "filegear-ie.me",
      "filegear-jp.me",
      "filegear-sg.me",
      "firebaseapp.com",
      "fireweb.app",
      "flap.id",
      "onflashdrive.app",
      "fldrv.com",
      "fly.dev",
      "edgeapp.net",
      "shw.io",
      "flynnhosting.net",
      "forgeblocks.com",
      "id.forgerock.io",
      "framer.app",
      "framercanvas.com",
      "*.frusky.de",
      "ravpage.co.il",
      "0e.vc",
      "freebox-os.com",
      "freeboxos.com",
      "fbx-os.fr",
      "fbxos.fr",
      "freebox-os.fr",
      "freeboxos.fr",
      "freedesktop.org",
      "freemyip.com",
      "wien.funkfeuer.at",
      "*.futurecms.at",
      "*.ex.futurecms.at",
      "*.in.futurecms.at",
      "futurehosting.at",
      "futuremailing.at",
      "*.ex.ortsinfo.at",
      "*.kunden.ortsinfo.at",
      "*.statics.cloud",
      "independent-commission.uk",
      "independent-inquest.uk",
      "independent-inquiry.uk",
      "independent-panel.uk",
      "independent-review.uk",
      "public-inquiry.uk",
      "royal-commission.uk",
      "campaign.gov.uk",
      "service.gov.uk",
      "api.gov.uk",
      "gehirn.ne.jp",
      "usercontent.jp",
      "gentapps.com",
      "gentlentapis.com",
      "lab.ms",
      "cdn-edges.net",
      "ghost.io",
      "gsj.bz",
      "githubusercontent.com",
      "githubpreview.dev",
      "github.io",
      "gitlab.io",
      "gitapp.si",
      "gitpage.si",
      "glitch.me",
      "nog.community",
      "co.ro",
      "shop.ro",
      "lolipop.io",
      "angry.jp",
      "babyblue.jp",
      "babymilk.jp",
      "backdrop.jp",
      "bambina.jp",
      "bitter.jp",
      "blush.jp",
      "boo.jp",
      "boy.jp",
      "boyfriend.jp",
      "but.jp",
      "candypop.jp",
      "capoo.jp",
      "catfood.jp",
      "cheap.jp",
      "chicappa.jp",
      "chillout.jp",
      "chips.jp",
      "chowder.jp",
      "chu.jp",
      "ciao.jp",
      "cocotte.jp",
      "coolblog.jp",
      "cranky.jp",
      "cutegirl.jp",
      "daa.jp",
      "deca.jp",
      "deci.jp",
      "digick.jp",
      "egoism.jp",
      "fakefur.jp",
      "fem.jp",
      "flier.jp",
      "floppy.jp",
      "fool.jp",
      "frenchkiss.jp",
      "girlfriend.jp",
      "girly.jp",
      "gloomy.jp",
      "gonna.jp",
      "greater.jp",
      "hacca.jp",
      "heavy.jp",
      "her.jp",
      "hiho.jp",
      "hippy.jp",
      "holy.jp",
      "hungry.jp",
      "icurus.jp",
      "itigo.jp",
      "jellybean.jp",
      "kikirara.jp",
      "kill.jp",
      "kilo.jp",
      "kuron.jp",
      "littlestar.jp",
      "lolipopmc.jp",
      "lolitapunk.jp",
      "lomo.jp",
      "lovepop.jp",
      "lovesick.jp",
      "main.jp",
      "mods.jp",
      "mond.jp",
      "mongolian.jp",
      "moo.jp",
      "namaste.jp",
      "nikita.jp",
      "nobushi.jp",
      "noor.jp",
      "oops.jp",
      "parallel.jp",
      "parasite.jp",
      "pecori.jp",
      "peewee.jp",
      "penne.jp",
      "pepper.jp",
      "perma.jp",
      "pigboat.jp",
      "pinoko.jp",
      "punyu.jp",
      "pupu.jp",
      "pussycat.jp",
      "pya.jp",
      "raindrop.jp",
      "readymade.jp",
      "sadist.jp",
      "schoolbus.jp",
      "secret.jp",
      "staba.jp",
      "stripper.jp",
      "sub.jp",
      "sunnyday.jp",
      "thick.jp",
      "tonkotsu.jp",
      "under.jp",
      "upper.jp",
      "velvet.jp",
      "verse.jp",
      "versus.jp",
      "vivian.jp",
      "watson.jp",
      "weblike.jp",
      "whitesnow.jp",
      "zombie.jp",
      "heteml.net",
      "cloudapps.digital",
      "london.cloudapps.digital",
      "pymnt.uk",
      "homeoffice.gov.uk",
      "ro.im",
      "goip.de",
      "run.app",
      "a.run.app",
      "web.app",
      "*.0emm.com",
      "appspot.com",
      "*.r.appspot.com",
      "codespot.com",
      "googleapis.com",
      "googlecode.com",
      "pagespeedmobilizer.com",
      "publishproxy.com",
      "withgoogle.com",
      "withyoutube.com",
      "*.gateway.dev",
      "cloud.goog",
      "translate.goog",
      "*.usercontent.goog",
      "cloudfunctions.net",
      "blogspot.ae",
      "blogspot.al",
      "blogspot.am",
      "blogspot.ba",
      "blogspot.be",
      "blogspot.bg",
      "blogspot.bj",
      "blogspot.ca",
      "blogspot.cf",
      "blogspot.ch",
      "blogspot.cl",
      "blogspot.co.at",
      "blogspot.co.id",
      "blogspot.co.il",
      "blogspot.co.ke",
      "blogspot.co.nz",
      "blogspot.co.uk",
      "blogspot.co.za",
      "blogspot.com",
      "blogspot.com.ar",
      "blogspot.com.au",
      "blogspot.com.br",
      "blogspot.com.by",
      "blogspot.com.co",
      "blogspot.com.cy",
      "blogspot.com.ee",
      "blogspot.com.eg",
      "blogspot.com.es",
      "blogspot.com.mt",
      "blogspot.com.ng",
      "blogspot.com.tr",
      "blogspot.com.uy",
      "blogspot.cv",
      "blogspot.cz",
      "blogspot.de",
      "blogspot.dk",
      "blogspot.fi",
      "blogspot.fr",
      "blogspot.gr",
      "blogspot.hk",
      "blogspot.hr",
      "blogspot.hu",
      "blogspot.ie",
      "blogspot.in",
      "blogspot.is",
      "blogspot.it",
      "blogspot.jp",
      "blogspot.kr",
      "blogspot.li",
      "blogspot.lt",
      "blogspot.lu",
      "blogspot.md",
      "blogspot.mk",
      "blogspot.mr",
      "blogspot.mx",
      "blogspot.my",
      "blogspot.nl",
      "blogspot.no",
      "blogspot.pe",
      "blogspot.pt",
      "blogspot.qa",
      "blogspot.re",
      "blogspot.ro",
      "blogspot.rs",
      "blogspot.ru",
      "blogspot.se",
      "blogspot.sg",
      "blogspot.si",
      "blogspot.sk",
      "blogspot.sn",
      "blogspot.td",
      "blogspot.tw",
      "blogspot.ug",
      "blogspot.vn",
      "goupile.fr",
      "gov.nl",
      "awsmppl.com",
      "günstigbestellen.de",
      "günstigliefern.de",
      "fin.ci",
      "free.hr",
      "caa.li",
      "ua.rs",
      "conf.se",
      "hs.zone",
      "hs.run",
      "hashbang.sh",
      "hasura.app",
      "hasura-app.io",
      "pages.it.hs-heilbronn.de",
      "hepforge.org",
      "herokuapp.com",
      "herokussl.com",
      "ravendb.cloud",
      "myravendb.com",
      "ravendb.community",
      "ravendb.me",
      "development.run",
      "ravendb.run",
      "homesklep.pl",
      "secaas.hk",
      "hoplix.shop",
      "orx.biz",
      "biz.gl",
      "col.ng",
      "firm.ng",
      "gen.ng",
      "ltd.ng",
      "ngo.ng",
      "edu.scot",
      "sch.so",
      "hostyhosting.io",
      "häkkinen.fi",
      "*.moonscale.io",
      "moonscale.net",
      "iki.fi",
      "ibxos.it",
      "iliadboxos.it",
      "impertrixcdn.com",
      "impertrix.com",
      "smushcdn.com",
      "wphostedmail.com",
      "wpmucdn.com",
      "tempurl.host",
      "wpmudev.host",
      "dyn-berlin.de",
      "in-berlin.de",
      "in-brb.de",
      "in-butter.de",
      "in-dsl.de",
      "in-dsl.net",
      "in-dsl.org",
      "in-vpn.de",
      "in-vpn.net",
      "in-vpn.org",
      "biz.at",
      "info.at",
      "info.cx",
      "ac.leg.br",
      "al.leg.br",
      "am.leg.br",
      "ap.leg.br",
      "ba.leg.br",
      "ce.leg.br",
      "df.leg.br",
      "es.leg.br",
      "go.leg.br",
      "ma.leg.br",
      "mg.leg.br",
      "ms.leg.br",
      "mt.leg.br",
      "pa.leg.br",
      "pb.leg.br",
      "pe.leg.br",
      "pi.leg.br",
      "pr.leg.br",
      "rj.leg.br",
      "rn.leg.br",
      "ro.leg.br",
      "rr.leg.br",
      "rs.leg.br",
      "sc.leg.br",
      "se.leg.br",
      "sp.leg.br",
      "to.leg.br",
      "pixolino.com",
      "na4u.ru",
      "iopsys.se",
      "ipifony.net",
      "iservschule.de",
      "mein-iserv.de",
      "schulplattform.de",
      "schulserver.de",
      "test-iserv.de",
      "iserv.dev",
      "iobb.net",
      "mel.cloudlets.com.au",
      "cloud.interhostsolutions.be",
      "users.scale.virtualcloud.com.br",
      "mycloud.by",
      "alp1.ae.flow.ch",
      "appengine.flow.ch",
      "es-1.axarnet.cloud",
      "diadem.cloud",
      "vip.jelastic.cloud",
      "jele.cloud",
      "it1.eur.aruba.jenv-aruba.cloud",
      "it1.jenv-aruba.cloud",
      "keliweb.cloud",
      "cs.keliweb.cloud",
      "oxa.cloud",
      "tn.oxa.cloud",
      "uk.oxa.cloud",
      "primetel.cloud",
      "uk.primetel.cloud",
      "ca.reclaim.cloud",
      "uk.reclaim.cloud",
      "us.reclaim.cloud",
      "ch.trendhosting.cloud",
      "de.trendhosting.cloud",
      "jele.club",
      "amscompute.com",
      "clicketcloud.com",
      "dopaas.com",
      "hidora.com",
      "paas.hosted-by-previder.com",
      "rag-cloud.hosteur.com",
      "rag-cloud-ch.hosteur.com",
      "jcloud.ik-server.com",
      "jcloud-ver-jpc.ik-server.com",
      "demo.jelastic.com",
      "kilatiron.com",
      "paas.massivegrid.com",
      "jed.wafaicloud.com",
      "lon.wafaicloud.com",
      "ryd.wafaicloud.com",
      "j.scaleforce.com.cy",
      "jelastic.dogado.eu",
      "fi.cloudplatform.fi",
      "demo.datacenter.fi",
      "paas.datacenter.fi",
      "jele.host",
      "mircloud.host",
      "paas.beebyte.io",
      "sekd1.beebyteapp.io",
      "jele.io",
      "cloud-fr1.unispace.io",
      "jc.neen.it",
      "cloud.jelastic.open.tim.it",
      "jcloud.kz",
      "upaas.kazteleport.kz",
      "cloudjiffy.net",
      "fra1-de.cloudjiffy.net",
      "west1-us.cloudjiffy.net",
      "jls-sto1.elastx.net",
      "jls-sto2.elastx.net",
      "jls-sto3.elastx.net",
      "faststacks.net",
      "fr-1.paas.massivegrid.net",
      "lon-1.paas.massivegrid.net",
      "lon-2.paas.massivegrid.net",
      "ny-1.paas.massivegrid.net",
      "ny-2.paas.massivegrid.net",
      "sg-1.paas.massivegrid.net",
      "jelastic.saveincloud.net",
      "nordeste-idc.saveincloud.net",
      "j.scaleforce.net",
      "jelastic.tsukaeru.net",
      "sdscloud.pl",
      "unicloud.pl",
      "mircloud.ru",
      "jelastic.regruhosting.ru",
      "enscaled.sg",
      "jele.site",
      "jelastic.team",
      "orangecloud.tn",
      "j.layershift.co.uk",
      "phx.enscaled.us",
      "mircloud.us",
      "myjino.ru",
      "*.hosting.myjino.ru",
      "*.landing.myjino.ru",
      "*.spectrum.myjino.ru",
      "*.vps.myjino.ru",
      "jotelulu.cloud",
      "*.triton.zone",
      "*.cns.joyent.com",
      "js.org",
      "kaas.gg",
      "khplay.nl",
      "ktistory.com",
      "kapsi.fi",
      "keymachine.de",
      "kinghost.net",
      "uni5.net",
      "knightpoint.systems",
      "koobin.events",
      "oya.to",
      "kuleuven.cloud",
      "ezproxy.kuleuven.be",
      "co.krd",
      "edu.krd",
      "krellian.net",
      "webthings.io",
      "git-repos.de",
      "lcube-server.de",
      "svn-repos.de",
      "leadpages.co",
      "lpages.co",
      "lpusercontent.com",
      "lelux.site",
      "co.business",
      "co.education",
      "co.events",
      "co.financial",
      "co.network",
      "co.place",
      "co.technology",
      "app.lmpm.com",
      "linkyard.cloud",
      "linkyard-cloud.ch",
      "members.linode.com",
      "*.nodebalancer.linode.com",
      "*.linodeobjects.com",
      "ip.linodeusercontent.com",
      "we.bs",
      "*.user.localcert.dev",
      "localzone.xyz",
      "loginline.app",
      "loginline.dev",
      "loginline.io",
      "loginline.services",
      "loginline.site",
      "servers.run",
      "lohmus.me",
      "krasnik.pl",
      "leczna.pl",
      "lubartow.pl",
      "lublin.pl",
      "poniatowa.pl",
      "swidnik.pl",
      "glug.org.uk",
      "lug.org.uk",
      "lugs.org.uk",
      "barsy.bg",
      "barsy.co.uk",
      "barsyonline.co.uk",
      "barsycenter.com",
      "barsyonline.com",
      "barsy.club",
      "barsy.de",
      "barsy.eu",
      "barsy.in",
      "barsy.info",
      "barsy.io",
      "barsy.me",
      "barsy.menu",
      "barsy.mobi",
      "barsy.net",
      "barsy.online",
      "barsy.org",
      "barsy.pro",
      "barsy.pub",
      "barsy.ro",
      "barsy.shop",
      "barsy.site",
      "barsy.support",
      "barsy.uk",
      "*.magentosite.cloud",
      "mayfirst.info",
      "mayfirst.org",
      "hb.cldmail.ru",
      "cn.vu",
      "mazeplay.com",
      "mcpe.me",
      "mcdir.me",
      "mcdir.ru",
      "mcpre.ru",
      "vps.mcdir.ru",
      "mediatech.by",
      "mediatech.dev",
      "hra.health",
      "miniserver.com",
      "memset.net",
      "messerli.app",
      "*.cloud.metacentrum.cz",
      "custom.metacentrum.cz",
      "flt.cloud.muni.cz",
      "usr.cloud.muni.cz",
      "meteorapp.com",
      "eu.meteorapp.com",
      "co.pl",
      "*.azurecontainer.io",
      "azurewebsites.net",
      "azure-mobile.net",
      "cloudapp.net",
      "azurestaticapps.net",
      "1.azurestaticapps.net",
      "centralus.azurestaticapps.net",
      "eastasia.azurestaticapps.net",
      "eastus2.azurestaticapps.net",
      "westeurope.azurestaticapps.net",
      "westus2.azurestaticapps.net",
      "csx.cc",
      "mintere.site",
      "forte.id",
      "mozilla-iot.org",
      "bmoattachments.org",
      "net.ru",
      "org.ru",
      "pp.ru",
      "hostedpi.com",
      "customer.mythic-beasts.com",
      "caracal.mythic-beasts.com",
      "fentiger.mythic-beasts.com",
      "lynx.mythic-beasts.com",
      "ocelot.mythic-beasts.com",
      "oncilla.mythic-beasts.com",
      "onza.mythic-beasts.com",
      "sphinx.mythic-beasts.com",
      "vs.mythic-beasts.com",
      "x.mythic-beasts.com",
      "yali.mythic-beasts.com",
      "cust.retrosnub.co.uk",
      "ui.nabu.casa",
      "pony.club",
      "of.fashion",
      "in.london",
      "of.london",
      "from.marketing",
      "with.marketing",
      "for.men",
      "repair.men",
      "and.mom",
      "for.mom",
      "for.one",
      "under.one",
      "for.sale",
      "that.win",
      "from.work",
      "to.work",
      "cloud.nospamproxy.com",
      "netlify.app",
      "4u.com",
      "ngrok.io",
      "nh-serv.co.uk",
      "nfshost.com",
      "*.developer.app",
      "noop.app",
      "*.northflank.app",
      "*.build.run",
      "*.code.run",
      "*.database.run",
      "*.migration.run",
      "noticeable.news",
      "dnsking.ch",
      "mypi.co",
      "n4t.co",
      "001www.com",
      "ddnslive.com",
      "myiphost.com",
      "forumz.info",
      "16-b.it",
      "32-b.it",
      "64-b.it",
      "soundcast.me",
      "tcp4.me",
      "dnsup.net",
      "hicam.net",
      "now-dns.net",
      "ownip.net",
      "vpndns.net",
      "dynserv.org",
      "now-dns.org",
      "x443.pw",
      "now-dns.top",
      "ntdll.top",
      "freeddns.us",
      "crafting.xyz",
      "zapto.xyz",
      "nsupdate.info",
      "nerdpol.ovh",
      "blogsyte.com",
      "brasilia.me",
      "cable-modem.org",
      "ciscofreak.com",
      "collegefan.org",
      "couchpotatofries.org",
      "damnserver.com",
      "ddns.me",
      "ditchyourip.com",
      "dnsfor.me",
      "dnsiskinky.com",
      "dvrcam.info",
      "dynns.com",
      "eating-organic.net",
      "fantasyleague.cc",
      "geekgalaxy.com",
      "golffan.us",
      "health-carereform.com",
      "homesecuritymac.com",
      "homesecuritypc.com",
      "hopto.me",
      "ilovecollege.info",
      "loginto.me",
      "mlbfan.org",
      "mmafan.biz",
      "myactivedirectory.com",
      "mydissent.net",
      "myeffect.net",
      "mymediapc.net",
      "mypsx.net",
      "mysecuritycamera.com",
      "mysecuritycamera.net",
      "mysecuritycamera.org",
      "net-freaks.com",
      "nflfan.org",
      "nhlfan.net",
      "no-ip.ca",
      "no-ip.co.uk",
      "no-ip.net",
      "noip.us",
      "onthewifi.com",
      "pgafan.net",
      "point2this.com",
      "pointto.us",
      "privatizehealthinsurance.net",
      "quicksytes.com",
      "read-books.org",
      "securitytactics.com",
      "serveexchange.com",
      "servehumour.com",
      "servep2p.com",
      "servesarcasm.com",
      "stufftoread.com",
      "ufcfan.org",
      "unusualperson.com",
      "workisboring.com",
      "3utilities.com",
      "bounceme.net",
      "ddns.net",
      "ddnsking.com",
      "gotdns.ch",
      "hopto.org",
      "myftp.biz",
      "myftp.org",
      "myvnc.com",
      "no-ip.biz",
      "no-ip.info",
      "no-ip.org",
      "noip.me",
      "redirectme.net",
      "servebeer.com",
      "serveblog.net",
      "servecounterstrike.com",
      "serveftp.com",
      "servegame.com",
      "servehalflife.com",
      "servehttp.com",
      "serveirc.com",
      "serveminecraft.net",
      "servemp3.com",
      "servepics.com",
      "servequake.com",
      "sytes.net",
      "webhop.me",
      "zapto.org",
      "stage.nodeart.io",
      "pcloud.host",
      "nyc.mn",
      "static.observableusercontent.com",
      "cya.gg",
      "omg.lol",
      "cloudycluster.net",
      "omniwe.site",
      "service.one",
      "nid.io",
      "opensocial.site",
      "opencraft.hosting",
      "orsites.com",
      "operaunite.com",
      "tech.orange",
      "authgear-staging.com",
      "authgearapps.com",
      "skygearapp.com",
      "outsystemscloud.com",
      "*.webpaas.ovh.net",
      "*.hosting.ovh.net",
      "ownprovider.com",
      "own.pm",
      "*.owo.codes",
      "ox.rs",
      "oy.lc",
      "pgfog.com",
      "pagefrontapp.com",
      "pagexl.com",
      "*.paywhirl.com",
      "bar0.net",
      "bar1.net",
      "bar2.net",
      "rdv.to",
      "art.pl",
      "gliwice.pl",
      "krakow.pl",
      "poznan.pl",
      "wroc.pl",
      "zakopane.pl",
      "pantheonsite.io",
      "gotpantheon.com",
      "mypep.link",
      "perspecta.cloud",
      "lk3.ru",
      "on-web.fr",
      "bc.platform.sh",
      "ent.platform.sh",
      "eu.platform.sh",
      "us.platform.sh",
      "*.platformsh.site",
      "*.tst.site",
      "platter-app.com",
      "platter-app.dev",
      "platterp.us",
      "pdns.page",
      "plesk.page",
      "pleskns.com",
      "dyn53.io",
      "onporter.run",
      "co.bn",
      "postman-echo.com",
      "pstmn.io",
      "mock.pstmn.io",
      "httpbin.org",
      "prequalifyme.today",
      "xen.prgmr.com",
      "priv.at",
      "prvcy.page",
      "*.dweb.link",
      "protonet.io",
      "chirurgiens-dentistes-en-france.fr",
      "byen.site",
      "pubtls.org",
      "pythonanywhere.com",
      "eu.pythonanywhere.com",
      "qoto.io",
      "qualifioapp.com",
      "qbuser.com",
      "cloudsite.builders",
      "instances.spawn.cc",
      "instantcloud.cn",
      "ras.ru",
      "qa2.com",
      "qcx.io",
      "*.sys.qcx.io",
      "dev-myqnapcloud.com",
      "alpha-myqnapcloud.com",
      "myqnapcloud.com",
      "*.quipelements.com",
      "vapor.cloud",
      "vaporcloud.io",
      "rackmaze.com",
      "rackmaze.net",
      "g.vbrplsbx.io",
      "*.on-k3s.io",
      "*.on-rancher.cloud",
      "*.on-rio.io",
      "readthedocs.io",
      "rhcloud.com",
      "app.render.com",
      "onrender.com",
      "repl.co",
      "id.repl.co",
      "repl.run",
      "resindevice.io",
      "devices.resinstaging.io",
      "hzc.io",
      "wellbeingzone.eu",
      "wellbeingzone.co.uk",
      "adimo.co.uk",
      "itcouldbewor.se",
      "git-pages.rit.edu",
      "rocky.page",
      "биз.рус",
      "ком.рус",
      "крым.рус",
      "мир.рус",
      "мск.рус",
      "орг.рус",
      "самара.рус",
      "сочи.рус",
      "спб.рус",
      "я.рус",
      "*.builder.code.com",
      "*.dev-builder.code.com",
      "*.stg-builder.code.com",
      "sandcats.io",
      "logoip.de",
      "logoip.com",
      "fr-par-1.baremetal.scw.cloud",
      "fr-par-2.baremetal.scw.cloud",
      "nl-ams-1.baremetal.scw.cloud",
      "fnc.fr-par.scw.cloud",
      "functions.fnc.fr-par.scw.cloud",
      "k8s.fr-par.scw.cloud",
      "nodes.k8s.fr-par.scw.cloud",
      "s3.fr-par.scw.cloud",
      "s3-website.fr-par.scw.cloud",
      "whm.fr-par.scw.cloud",
      "priv.instances.scw.cloud",
      "pub.instances.scw.cloud",
      "k8s.scw.cloud",
      "k8s.nl-ams.scw.cloud",
      "nodes.k8s.nl-ams.scw.cloud",
      "s3.nl-ams.scw.cloud",
      "s3-website.nl-ams.scw.cloud",
      "whm.nl-ams.scw.cloud",
      "k8s.pl-waw.scw.cloud",
      "nodes.k8s.pl-waw.scw.cloud",
      "s3.pl-waw.scw.cloud",
      "s3-website.pl-waw.scw.cloud",
      "scalebook.scw.cloud",
      "smartlabeling.scw.cloud",
      "dedibox.fr",
      "schokokeks.net",
      "gov.scot",
      "service.gov.scot",
      "scrysec.com",
      "firewall-gateway.com",
      "firewall-gateway.de",
      "my-gateway.de",
      "my-router.de",
      "spdns.de",
      "spdns.eu",
      "firewall-gateway.net",
      "my-firewall.org",
      "myfirewall.org",
      "spdns.org",
      "seidat.net",
      "sellfy.store",
      "senseering.net",
      "minisite.ms",
      "magnet.page",
      "biz.ua",
      "co.ua",
      "pp.ua",
      "shiftcrypto.dev",
      "shiftcrypto.io",
      "shiftedit.io",
      "myshopblocks.com",
      "myshopify.com",
      "shopitsite.com",
      "shopware.store",
      "mo-siemens.io",
      "1kapp.com",
      "appchizi.com",
      "applinzi.com",
      "sinaapp.com",
      "vipsinaapp.com",
      "siteleaf.net",
      "bounty-full.com",
      "alpha.bounty-full.com",
      "beta.bounty-full.com",
      "small-web.org",
      "vp4.me",
      "try-snowplow.com",
      "srht.site",
      "stackhero-network.com",
      "musician.io",
      "novecore.site",
      "static.land",
      "dev.static.land",
      "sites.static.land",
      "storebase.store",
      "vps-host.net",
      "atl.jelastic.vps-host.net",
      "njs.jelastic.vps-host.net",
      "ric.jelastic.vps-host.net",
      "playstation-cloud.com",
      "apps.lair.io",
      "*.stolos.io",
      "spacekit.io",
      "customer.speedpartner.de",
      "myspreadshop.at",
      "myspreadshop.com.au",
      "myspreadshop.be",
      "myspreadshop.ca",
      "myspreadshop.ch",
      "myspreadshop.com",
      "myspreadshop.de",
      "myspreadshop.dk",
      "myspreadshop.es",
      "myspreadshop.fi",
      "myspreadshop.fr",
      "myspreadshop.ie",
      "myspreadshop.it",
      "myspreadshop.net",
      "myspreadshop.nl",
      "myspreadshop.no",
      "myspreadshop.pl",
      "myspreadshop.se",
      "myspreadshop.co.uk",
      "api.stdlib.com",
      "storj.farm",
      "utwente.io",
      "soc.srcf.net",
      "user.srcf.net",
      "temp-dns.com",
      "supabase.co",
      "supabase.in",
      "supabase.net",
      "su.paba.se",
      "*.s5y.io",
      "*.sensiosite.cloud",
      "syncloud.it",
      "dscloud.biz",
      "direct.quickconnect.cn",
      "dsmynas.com",
      "familyds.com",
      "diskstation.me",
      "dscloud.me",
      "i234.me",
      "myds.me",
      "synology.me",
      "dscloud.mobi",
      "dsmynas.net",
      "familyds.net",
      "dsmynas.org",
      "familyds.org",
      "vpnplus.to",
      "direct.quickconnect.to",
      "tabitorder.co.il",
      "taifun-dns.de",
      "beta.tailscale.net",
      "ts.net",
      "gda.pl",
      "gdansk.pl",
      "gdynia.pl",
      "med.pl",
      "sopot.pl",
      "site.tb-hosting.com",
      "edugit.io",
      "s3.teckids.org",
      "telebit.app",
      "telebit.io",
      "*.telebit.xyz",
      "gwiddle.co.uk",
      "*.firenet.ch",
      "*.svc.firenet.ch",
      "reservd.com",
      "thingdustdata.com",
      "cust.dev.thingdust.io",
      "cust.disrec.thingdust.io",
      "cust.prod.thingdust.io",
      "cust.testing.thingdust.io",
      "reservd.dev.thingdust.io",
      "reservd.disrec.thingdust.io",
      "reservd.testing.thingdust.io",
      "tickets.io",
      "arvo.network",
      "azimuth.network",
      "tlon.network",
      "torproject.net",
      "pages.torproject.net",
      "bloxcms.com",
      "townnews-staging.com",
      "tbits.me",
      "12hp.at",
      "2ix.at",
      "4lima.at",
      "lima-city.at",
      "12hp.ch",
      "2ix.ch",
      "4lima.ch",
      "lima-city.ch",
      "trafficplex.cloud",
      "de.cool",
      "12hp.de",
      "2ix.de",
      "4lima.de",
      "lima-city.de",
      "1337.pictures",
      "clan.rip",
      "lima-city.rocks",
      "webspace.rocks",
      "lima.zone",
      "*.transurl.be",
      "*.transurl.eu",
      "*.transurl.nl",
      "site.transip.me",
      "tuxfamily.org",
      "dd-dns.de",
      "diskstation.eu",
      "diskstation.org",
      "dray-dns.de",
      "draydns.de",
      "dyn-vpn.de",
      "dynvpn.de",
      "mein-vigor.de",
      "my-vigor.de",
      "my-wan.de",
      "syno-ds.de",
      "synology-diskstation.de",
      "synology-ds.de",
      "typedream.app",
      "pro.typeform.com",
      "uber.space",
      "*.uberspace.de",
      "hk.com",
      "hk.org",
      "ltd.hk",
      "inc.hk",
      "name.pm",
      "sch.tf",
      "biz.wf",
      "sch.wf",
      "org.yt",
      "virtualuser.de",
      "virtual-user.de",
      "upli.io",
      "urown.cloud",
      "dnsupdate.info",
      "lib.de.us",
      "2038.io",
      "vercel.app",
      "vercel.dev",
      "now.sh",
      "router.management",
      "v-info.info",
      "voorloper.cloud",
      "neko.am",
      "nyaa.am",
      "be.ax",
      "cat.ax",
      "es.ax",
      "eu.ax",
      "gg.ax",
      "mc.ax",
      "us.ax",
      "xy.ax",
      "nl.ci",
      "xx.gl",
      "app.gp",
      "blog.gt",
      "de.gt",
      "to.gt",
      "be.gy",
      "cc.hn",
      "blog.kg",
      "io.kg",
      "jp.kg",
      "tv.kg",
      "uk.kg",
      "us.kg",
      "de.ls",
      "at.md",
      "de.md",
      "jp.md",
      "to.md",
      "indie.porn",
      "vxl.sh",
      "ch.tc",
      "me.tc",
      "we.tc",
      "nyan.to",
      "at.vg",
      "blog.vu",
      "dev.vu",
      "me.vu",
      "v.ua",
      "*.vultrobjects.com",
      "wafflecell.com",
      "*.webhare.dev",
      "reserve-online.net",
      "reserve-online.com",
      "bookonline.app",
      "hotelwithflight.com",
      "wedeploy.io",
      "wedeploy.me",
      "wedeploy.sh",
      "remotewd.com",
      "pages.wiardweb.com",
      "wmflabs.org",
      "toolforge.org",
      "wmcloud.org",
      "panel.gg",
      "daemon.panel.gg",
      "messwithdns.com",
      "woltlab-demo.com",
      "myforum.community",
      "community-pro.de",
      "diskussionsbereich.de",
      "community-pro.net",
      "meinforum.net",
      "affinitylottery.org.uk",
      "raffleentry.org.uk",
      "weeklylottery.org.uk",
      "wpenginepowered.com",
      "js.wpenginepowered.com",
      "wixsite.com",
      "editorx.io",
      "half.host",
      "xnbay.com",
      "u2.xnbay.com",
      "u2-local.xnbay.com",
      "cistron.nl",
      "demon.nl",
      "xs4all.space",
      "yandexcloud.net",
      "storage.yandexcloud.net",
      "website.yandexcloud.net",
      "official.academy",
      "yolasite.com",
      "ybo.faith",
      "yombo.me",
      "homelink.one",
      "ybo.party",
      "ybo.review",
      "ybo.science",
      "ybo.trade",
      "ynh.fr",
      "nohost.me",
      "noho.st",
      "za.net",
      "za.org",
      "bss.design",
      "basicserver.io",
      "virtualserver.io",
      "enterprisecloud.nu"
    ];
  }
});
var require_psl = __commonJS$3({
  "node_modules/psl/index.js"(exports) {
    var Punycode = require_punycode();
    var internals = {};
    internals.rules = require_rules().map(function(rule) {
      return {
        rule,
        suffix: rule.replace(/^(\*\.|\!)/, ""),
        punySuffix: -1,
        wildcard: rule.charAt(0) === "*",
        exception: rule.charAt(0) === "!"
      };
    });
    internals.endsWith = function(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };
    internals.findRule = function(domain) {
      var punyDomain = Punycode.toASCII(domain);
      return internals.rules.reduce(function(memo, rule) {
        if (rule.punySuffix === -1) {
          rule.punySuffix = Punycode.toASCII(rule.suffix);
        }
        if (!internals.endsWith(punyDomain, "." + rule.punySuffix) && punyDomain !== rule.punySuffix) {
          return memo;
        }
        return rule;
      }, null);
    };
    exports.errorCodes = {
      DOMAIN_TOO_SHORT: "Domain name too short.",
      DOMAIN_TOO_LONG: "Domain name too long. It should be no more than 255 chars.",
      LABEL_STARTS_WITH_DASH: "Domain name label can not start with a dash.",
      LABEL_ENDS_WITH_DASH: "Domain name label can not end with a dash.",
      LABEL_TOO_LONG: "Domain name label should be at most 63 chars long.",
      LABEL_TOO_SHORT: "Domain name label should be at least 1 character long.",
      LABEL_INVALID_CHARS: "Domain name label can only contain alphanumeric characters or dashes."
    };
    internals.validate = function(input) {
      var ascii = Punycode.toASCII(input);
      if (ascii.length < 1) {
        return "DOMAIN_TOO_SHORT";
      }
      if (ascii.length > 255) {
        return "DOMAIN_TOO_LONG";
      }
      var labels = ascii.split(".");
      var label;
      for (var i = 0; i < labels.length; ++i) {
        label = labels[i];
        if (!label.length) {
          return "LABEL_TOO_SHORT";
        }
        if (label.length > 63) {
          return "LABEL_TOO_LONG";
        }
        if (label.charAt(0) === "-") {
          return "LABEL_STARTS_WITH_DASH";
        }
        if (label.charAt(label.length - 1) === "-") {
          return "LABEL_ENDS_WITH_DASH";
        }
        if (!/^[a-z0-9\-]+$/.test(label)) {
          return "LABEL_INVALID_CHARS";
        }
      }
    };
    exports.parse = function(input) {
      if (typeof input !== "string") {
        throw new TypeError("Domain name must be a string.");
      }
      var domain = input.slice(0).toLowerCase();
      if (domain.charAt(domain.length - 1) === ".") {
        domain = domain.slice(0, domain.length - 1);
      }
      var error2 = internals.validate(domain);
      if (error2) {
        return {
          input,
          error: {
            message: exports.errorCodes[error2],
            code: error2
          }
        };
      }
      var parsed = {
        input,
        tld: null,
        sld: null,
        domain: null,
        subdomain: null,
        listed: false
      };
      var domainParts = domain.split(".");
      if (domainParts[domainParts.length - 1] === "local") {
        return parsed;
      }
      var handlePunycode = function() {
        if (!/xn--/.test(domain)) {
          return parsed;
        }
        if (parsed.domain) {
          parsed.domain = Punycode.toASCII(parsed.domain);
        }
        if (parsed.subdomain) {
          parsed.subdomain = Punycode.toASCII(parsed.subdomain);
        }
        return parsed;
      };
      var rule = internals.findRule(domain);
      if (!rule) {
        if (domainParts.length < 2) {
          return parsed;
        }
        parsed.tld = domainParts.pop();
        parsed.sld = domainParts.pop();
        parsed.domain = [parsed.sld, parsed.tld].join(".");
        if (domainParts.length) {
          parsed.subdomain = domainParts.pop();
        }
        return handlePunycode();
      }
      parsed.listed = true;
      var tldParts = rule.suffix.split(".");
      var privateParts = domainParts.slice(0, domainParts.length - tldParts.length);
      if (rule.exception) {
        privateParts.push(tldParts.shift());
      }
      parsed.tld = tldParts.join(".");
      if (!privateParts.length) {
        return handlePunycode();
      }
      if (rule.wildcard) {
        tldParts.unshift(privateParts.pop());
        parsed.tld = tldParts.join(".");
      }
      if (!privateParts.length) {
        return handlePunycode();
      }
      parsed.sld = privateParts.pop();
      parsed.domain = [parsed.sld, parsed.tld].join(".");
      if (privateParts.length) {
        parsed.subdomain = privateParts.join(".");
      }
      return handlePunycode();
    };
    exports.get = function(domain) {
      if (!domain) {
        return null;
      }
      return exports.parse(domain).domain || null;
    };
    exports.isValid = function(domain) {
      var parsed = exports.parse(domain);
      return Boolean(parsed.domain && parsed.listed);
    };
  }
});
var require_pubsuffix_psl = __commonJS$3({
  "node_modules/tough-cookie/lib/pubsuffix-psl.js"(exports) {
    var psl = require_psl();
    var SPECIAL_USE_DOMAINS = [
      "local",
      "example",
      "invalid",
      "localhost",
      "test"
    ];
    var SPECIAL_TREATMENT_DOMAINS = ["localhost", "invalid"];
    function getPublicSuffix(domain, options = {}) {
      const domainParts = domain.split(".");
      const topLevelDomain = domainParts[domainParts.length - 1];
      const allowSpecialUseDomain = !!options.allowSpecialUseDomain;
      const ignoreError = !!options.ignoreError;
      if (allowSpecialUseDomain && SPECIAL_USE_DOMAINS.includes(topLevelDomain)) {
        if (domainParts.length > 1) {
          const secondLevelDomain = domainParts[domainParts.length - 2];
          return `${secondLevelDomain}.${topLevelDomain}`;
        } else if (SPECIAL_TREATMENT_DOMAINS.includes(topLevelDomain)) {
          return `${topLevelDomain}`;
        }
      }
      if (!ignoreError && SPECIAL_USE_DOMAINS.includes(topLevelDomain)) {
        throw new Error(
          `Cookie has domain set to the public suffix "${topLevelDomain}" which is a special use domain. To allow this, configure your CookieJar with {allowSpecialUseDomain:true, rejectPublicSuffixes: false}.`
        );
      }
      return psl.get(domain);
    }
    exports.getPublicSuffix = getPublicSuffix;
  }
});
var require_store = __commonJS$3({
  "node_modules/tough-cookie/lib/store.js"(exports) {
    var Store2 = class {
      constructor() {
        this.synchronous = false;
      }
      findCookie(domain, path, key, cb) {
        throw new Error("findCookie is not implemented");
      }
      findCookies(domain, path, allowSpecialUseDomain, cb) {
        throw new Error("findCookies is not implemented");
      }
      putCookie(cookie, cb) {
        throw new Error("putCookie is not implemented");
      }
      updateCookie(oldCookie, newCookie, cb) {
        throw new Error("updateCookie is not implemented");
      }
      removeCookie(domain, path, key, cb) {
        throw new Error("removeCookie is not implemented");
      }
      removeCookies(domain, path, cb) {
        throw new Error("removeCookies is not implemented");
      }
      removeAllCookies(cb) {
        throw new Error("removeAllCookies is not implemented");
      }
      getAllCookies(cb) {
        throw new Error(
          "getAllCookies is not implemented (therefore jar cannot be serialized)"
        );
      }
    };
    exports.Store = Store2;
  }
});
var require_universalify = __commonJS$3({
  "node_modules/universalify/index.js"(exports) {
    exports.fromCallback = function(fn) {
      return Object.defineProperty(function() {
        if (typeof arguments[arguments.length - 1] === "function")
          fn.apply(this, arguments);
        else {
          return new Promise((resolve, reject) => {
            arguments[arguments.length] = (err, res) => {
              if (err)
                return reject(err);
              resolve(res);
            };
            arguments.length++;
            fn.apply(this, arguments);
          });
        }
      }, "name", { value: fn.name });
    };
    exports.fromPromise = function(fn) {
      return Object.defineProperty(function() {
        const cb = arguments[arguments.length - 1];
        if (typeof cb !== "function")
          return fn.apply(this, arguments);
        else {
          delete arguments[arguments.length - 1];
          arguments.length--;
          fn.apply(this, arguments).then((r) => cb(null, r), cb);
        }
      }, "name", { value: fn.name });
    };
  }
});
var require_permuteDomain = __commonJS$3({
  "node_modules/tough-cookie/lib/permuteDomain.js"(exports) {
    var pubsuffix = require_pubsuffix_psl();
    function permuteDomain(domain, allowSpecialUseDomain) {
      const pubSuf = pubsuffix.getPublicSuffix(domain, {
        allowSpecialUseDomain
      });
      if (!pubSuf) {
        return null;
      }
      if (pubSuf == domain) {
        return [domain];
      }
      if (domain.slice(-1) == ".") {
        domain = domain.slice(0, -1);
      }
      const prefix = domain.slice(0, -(pubSuf.length + 1));
      const parts = prefix.split(".").reverse();
      let cur = pubSuf;
      const permutations = [cur];
      while (parts.length) {
        cur = `${parts.shift()}.${cur}`;
        permutations.push(cur);
      }
      return permutations;
    }
    exports.permuteDomain = permuteDomain;
  }
});
var require_pathMatch = __commonJS$3({
  "node_modules/tough-cookie/lib/pathMatch.js"(exports) {
    function pathMatch2(reqPath, cookiePath) {
      if (cookiePath === reqPath) {
        return true;
      }
      const idx = reqPath.indexOf(cookiePath);
      if (idx === 0) {
        if (cookiePath.substr(-1) === "/") {
          return true;
        }
        if (reqPath.substr(cookiePath.length, 1) === "/") {
          return true;
        }
      }
      return false;
    }
    exports.pathMatch = pathMatch2;
  }
});
var require_utilHelper = __commonJS$3({
  "node_modules/tough-cookie/lib/utilHelper.js"(exports) {
    function requireUtil() {
      try {
        return __require("util");
      } catch (e) {
        return null;
      }
    }
    function lookupCustomInspectSymbol() {
      return Symbol.for("nodejs.util.inspect.custom");
    }
    function tryReadingCustomSymbolFromUtilInspect(options) {
      const _requireUtil = options.requireUtil || requireUtil;
      const util = _requireUtil();
      return util ? util.inspect.custom : null;
    }
    exports.getUtilInspect = function getUtilInspect(fallback, options = {}) {
      const _requireUtil = options.requireUtil || requireUtil;
      const util = _requireUtil();
      return function inspect(value, showHidden, depth) {
        return util ? util.inspect(value, showHidden, depth) : fallback(value);
      };
    };
    exports.getCustomInspectSymbol = function getCustomInspectSymbol(options = {}) {
      const _lookupCustomInspectSymbol = options.lookupCustomInspectSymbol || lookupCustomInspectSymbol;
      return _lookupCustomInspectSymbol() || tryReadingCustomSymbolFromUtilInspect(options);
    };
  }
});
var require_memstore = __commonJS$3({
  "node_modules/tough-cookie/lib/memstore.js"(exports) {
    var { fromCallback } = require_universalify();
    var Store2 = require_store().Store;
    var permuteDomain = require_permuteDomain().permuteDomain;
    var pathMatch2 = require_pathMatch().pathMatch;
    var { getCustomInspectSymbol, getUtilInspect } = require_utilHelper();
    var MemoryCookieStore2 = class extends Store2 {
      constructor() {
        super();
        this.synchronous = true;
        this.idx = /* @__PURE__ */ Object.create(null);
        const customInspectSymbol = getCustomInspectSymbol();
        if (customInspectSymbol) {
          this[customInspectSymbol] = this.inspect;
        }
      }
      inspect() {
        const util = { inspect: getUtilInspect(inspectFallback) };
        return `{ idx: ${util.inspect(this.idx, false, 2)} }`;
      }
      findCookie(domain, path, key, cb) {
        if (!this.idx[domain]) {
          return cb(null, void 0);
        }
        if (!this.idx[domain][path]) {
          return cb(null, void 0);
        }
        return cb(null, this.idx[domain][path][key] || null);
      }
      findCookies(domain, path, allowSpecialUseDomain, cb) {
        const results = [];
        if (typeof allowSpecialUseDomain === "function") {
          cb = allowSpecialUseDomain;
          allowSpecialUseDomain = true;
        }
        if (!domain) {
          return cb(null, []);
        }
        let pathMatcher;
        if (!path) {
          pathMatcher = function matchAll(domainIndex) {
            for (const curPath in domainIndex) {
              const pathIndex = domainIndex[curPath];
              for (const key in pathIndex) {
                results.push(pathIndex[key]);
              }
            }
          };
        } else {
          pathMatcher = function matchRFC(domainIndex) {
            Object.keys(domainIndex).forEach((cookiePath) => {
              if (pathMatch2(path, cookiePath)) {
                const pathIndex = domainIndex[cookiePath];
                for (const key in pathIndex) {
                  results.push(pathIndex[key]);
                }
              }
            });
          };
        }
        const domains = permuteDomain(domain, allowSpecialUseDomain) || [domain];
        const idx = this.idx;
        domains.forEach((curDomain) => {
          const domainIndex = idx[curDomain];
          if (!domainIndex) {
            return;
          }
          pathMatcher(domainIndex);
        });
        cb(null, results);
      }
      putCookie(cookie, cb) {
        if (!this.idx[cookie.domain]) {
          this.idx[cookie.domain] = /* @__PURE__ */ Object.create(null);
        }
        if (!this.idx[cookie.domain][cookie.path]) {
          this.idx[cookie.domain][cookie.path] = /* @__PURE__ */ Object.create(null);
        }
        this.idx[cookie.domain][cookie.path][cookie.key] = cookie;
        cb(null);
      }
      updateCookie(oldCookie, newCookie, cb) {
        this.putCookie(newCookie, cb);
      }
      removeCookie(domain, path, key, cb) {
        if (this.idx[domain] && this.idx[domain][path] && this.idx[domain][path][key]) {
          delete this.idx[domain][path][key];
        }
        cb(null);
      }
      removeCookies(domain, path, cb) {
        if (this.idx[domain]) {
          if (path) {
            delete this.idx[domain][path];
          } else {
            delete this.idx[domain];
          }
        }
        return cb(null);
      }
      removeAllCookies(cb) {
        this.idx = /* @__PURE__ */ Object.create(null);
        return cb(null);
      }
      getAllCookies(cb) {
        const cookies = [];
        const idx = this.idx;
        const domains = Object.keys(idx);
        domains.forEach((domain) => {
          const paths = Object.keys(idx[domain]);
          paths.forEach((path) => {
            const keys = Object.keys(idx[domain][path]);
            keys.forEach((key) => {
              if (key !== null) {
                cookies.push(idx[domain][path][key]);
              }
            });
          });
        });
        cookies.sort((a, b) => {
          return (a.creationIndex || 0) - (b.creationIndex || 0);
        });
        cb(null, cookies);
      }
    };
    [
      "findCookie",
      "findCookies",
      "putCookie",
      "updateCookie",
      "removeCookie",
      "removeCookies",
      "removeAllCookies",
      "getAllCookies"
    ].forEach((name) => {
      MemoryCookieStore2.prototype[name] = fromCallback(
        MemoryCookieStore2.prototype[name]
      );
    });
    exports.MemoryCookieStore = MemoryCookieStore2;
    function inspectFallback(val) {
      const domains = Object.keys(val);
      if (domains.length === 0) {
        return "[Object: null prototype] {}";
      }
      let result = "[Object: null prototype] {\n";
      Object.keys(val).forEach((domain, i) => {
        result += formatDomain(domain, val[domain]);
        if (i < domains.length - 1) {
          result += ",";
        }
        result += "\n";
      });
      result += "}";
      return result;
    }
    function formatDomain(domainName, domainValue) {
      const indent = "  ";
      let result = `${indent}'${domainName}': [Object: null prototype] {
`;
      Object.keys(domainValue).forEach((path, i, paths) => {
        result += formatPath(path, domainValue[path]);
        if (i < paths.length - 1) {
          result += ",";
        }
        result += "\n";
      });
      result += `${indent}}`;
      return result;
    }
    function formatPath(pathName, pathValue) {
      const indent = "    ";
      let result = `${indent}'${pathName}': [Object: null prototype] {
`;
      Object.keys(pathValue).forEach((cookieName, i, cookieNames) => {
        const cookie = pathValue[cookieName];
        result += `      ${cookieName}: ${cookie.inspect()}`;
        if (i < cookieNames.length - 1) {
          result += ",";
        }
        result += "\n";
      });
      result += `${indent}}`;
      return result;
    }
    exports.inspectFallback = inspectFallback;
  }
});
var require_validators = __commonJS$3({
  "node_modules/tough-cookie/lib/validators.js"(exports) {
    var toString = Object.prototype.toString;
    function isFunction(data) {
      return typeof data === "function";
    }
    function isNonEmptyString(data) {
      return isString(data) && data !== "";
    }
    function isDate(data) {
      return isInstanceStrict(data, Date) && isInteger(data.getTime());
    }
    function isEmptyString(data) {
      return data === "" || data instanceof String && data.toString() === "";
    }
    function isString(data) {
      return typeof data === "string" || data instanceof String;
    }
    function isObject2(data) {
      return toString.call(data) === "[object Object]";
    }
    function isInstanceStrict(data, prototype) {
      try {
        return data instanceof prototype;
      } catch (error2) {
        return false;
      }
    }
    function isUrlStringOrObject(data) {
      return isNonEmptyString(data) || isObject2(data) && "hostname" in data && "pathname" in data && "protocol" in data || isInstanceStrict(data, URL);
    }
    function isInteger(data) {
      return typeof data === "number" && data % 1 === 0;
    }
    function validate(bool, cb, options) {
      if (!isFunction(cb)) {
        options = cb;
        cb = null;
      }
      if (!isObject2(options))
        options = { Error: "Failed Check" };
      if (!bool) {
        if (cb) {
          cb(new ParameterError(options));
        } else {
          throw new ParameterError(options);
        }
      }
    }
    var ParameterError = class extends Error {
      constructor(...params) {
        super(...params);
      }
    };
    exports.ParameterError = ParameterError;
    exports.isFunction = isFunction;
    exports.isNonEmptyString = isNonEmptyString;
    exports.isDate = isDate;
    exports.isEmptyString = isEmptyString;
    exports.isString = isString;
    exports.isObject = isObject2;
    exports.isUrlStringOrObject = isUrlStringOrObject;
    exports.validate = validate;
  }
});
var require_version = __commonJS$3({
  "node_modules/tough-cookie/lib/version.js"(exports, module) {
    module.exports = "4.1.4";
  }
});
var require_cookie$1 = __commonJS$3({
  "node_modules/tough-cookie/lib/cookie.js"(exports) {
    var punycode = require_punycode();
    var urlParse = require_url_parse();
    var pubsuffix = require_pubsuffix_psl();
    var Store2 = require_store().Store;
    var MemoryCookieStore2 = require_memstore().MemoryCookieStore;
    var pathMatch2 = require_pathMatch().pathMatch;
    var validators = require_validators();
    var VERSION = require_version();
    var { fromCallback } = require_universalify();
    var { getCustomInspectSymbol } = require_utilHelper();
    var COOKIE_OCTETS = /^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]+$/;
    var CONTROL_CHARS = /[\x00-\x1F]/;
    var TERMINATORS = ["\n", "\r", "\0"];
    var PATH_VALUE = /[\x20-\x3A\x3C-\x7E]+/;
    var DATE_DELIM = /[\x09\x20-\x2F\x3B-\x40\x5B-\x60\x7B-\x7E]/;
    var MONTH_TO_NUM = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11
    };
    var MAX_TIME = 2147483647e3;
    var MIN_TIME = 0;
    var SAME_SITE_CONTEXT_VAL_ERR = 'Invalid sameSiteContext option for getCookies(); expected one of "strict", "lax", or "none"';
    function checkSameSiteContext(value) {
      validators.validate(validators.isNonEmptyString(value), value);
      const context = String(value).toLowerCase();
      if (context === "none" || context === "lax" || context === "strict") {
        return context;
      } else {
        return null;
      }
    }
    var PrefixSecurityEnum = Object.freeze({
      SILENT: "silent",
      STRICT: "strict",
      DISABLED: "unsafe-disabled"
    });
    var IP_REGEX_LOWERCASE = /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-f\d]{1,4}:){7}(?:[a-f\d]{1,4}|:)|(?:[a-f\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-f\d]{1,4}|:)|(?:[a-f\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,2}|:)|(?:[a-f\d]{1,4}:){4}(?:(?::[a-f\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,3}|:)|(?:[a-f\d]{1,4}:){3}(?:(?::[a-f\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,4}|:)|(?:[a-f\d]{1,4}:){2}(?:(?::[a-f\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,5}|:)|(?:[a-f\d]{1,4}:){1}(?:(?::[a-f\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,6}|:)|(?::(?:(?::[a-f\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,7}|:)))$)/;
    var IP_V6_REGEX = `
\\[?(?:
(?:[a-fA-F\\d]{1,4}:){7}(?:[a-fA-F\\d]{1,4}|:)|
(?:[a-fA-F\\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|:[a-fA-F\\d]{1,4}|:)|
(?:[a-fA-F\\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,2}|:)|
(?:[a-fA-F\\d]{1,4}:){4}(?:(?::[a-fA-F\\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,3}|:)|
(?:[a-fA-F\\d]{1,4}:){3}(?:(?::[a-fA-F\\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,4}|:)|
(?:[a-fA-F\\d]{1,4}:){2}(?:(?::[a-fA-F\\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,5}|:)|
(?:[a-fA-F\\d]{1,4}:){1}(?:(?::[a-fA-F\\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,6}|:)|
(?::(?:(?::[a-fA-F\\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,7}|:))
)(?:%[0-9a-zA-Z]{1,})?\\]?
`.replace(/\s*\/\/.*$/gm, "").replace(/\n/g, "").trim();
    var IP_V6_REGEX_OBJECT = new RegExp(`^${IP_V6_REGEX}$`);
    function parseDigits(token, minDigits, maxDigits, trailingOK) {
      let count = 0;
      while (count < token.length) {
        const c = token.charCodeAt(count);
        if (c <= 47 || c >= 58) {
          break;
        }
        count++;
      }
      if (count < minDigits || count > maxDigits) {
        return null;
      }
      if (!trailingOK && count != token.length) {
        return null;
      }
      return parseInt(token.substr(0, count), 10);
    }
    function parseTime(token) {
      const parts = token.split(":");
      const result = [0, 0, 0];
      if (parts.length !== 3) {
        return null;
      }
      for (let i = 0; i < 3; i++) {
        const trailingOK = i == 2;
        const num = parseDigits(parts[i], 1, 2, trailingOK);
        if (num === null) {
          return null;
        }
        result[i] = num;
      }
      return result;
    }
    function parseMonth(token) {
      token = String(token).substr(0, 3).toLowerCase();
      const num = MONTH_TO_NUM[token];
      return num >= 0 ? num : null;
    }
    function parseDate(str) {
      if (!str) {
        return;
      }
      const tokens = str.split(DATE_DELIM);
      if (!tokens) {
        return;
      }
      let hour = null;
      let minute = null;
      let second = null;
      let dayOfMonth = null;
      let month = null;
      let year = null;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();
        if (!token.length) {
          continue;
        }
        let result;
        if (second === null) {
          result = parseTime(token);
          if (result) {
            hour = result[0];
            minute = result[1];
            second = result[2];
            continue;
          }
        }
        if (dayOfMonth === null) {
          result = parseDigits(token, 1, 2, true);
          if (result !== null) {
            dayOfMonth = result;
            continue;
          }
        }
        if (month === null) {
          result = parseMonth(token);
          if (result !== null) {
            month = result;
            continue;
          }
        }
        if (year === null) {
          result = parseDigits(token, 2, 4, true);
          if (result !== null) {
            year = result;
            if (year >= 70 && year <= 99) {
              year += 1900;
            } else if (year >= 0 && year <= 69) {
              year += 2e3;
            }
          }
        }
      }
      if (dayOfMonth === null || month === null || year === null || second === null || dayOfMonth < 1 || dayOfMonth > 31 || year < 1601 || hour > 23 || minute > 59 || second > 59) {
        return;
      }
      return new Date(Date.UTC(year, month, dayOfMonth, hour, minute, second));
    }
    function formatDate(date) {
      validators.validate(validators.isDate(date), date);
      return date.toUTCString();
    }
    function canonicalDomain(str) {
      if (str == null) {
        return null;
      }
      str = str.trim().replace(/^\./, "");
      if (IP_V6_REGEX_OBJECT.test(str)) {
        str = str.replace("[", "").replace("]", "");
      }
      if (punycode && /[^\u0001-\u007f]/.test(str)) {
        str = punycode.toASCII(str);
      }
      return str.toLowerCase();
    }
    function domainMatch2(str, domStr, canonicalize) {
      if (str == null || domStr == null) {
        return null;
      }
      if (canonicalize !== false) {
        str = canonicalDomain(str);
        domStr = canonicalDomain(domStr);
      }
      if (str == domStr) {
        return true;
      }
      const idx = str.lastIndexOf(domStr);
      if (idx <= 0) {
        return false;
      }
      if (str.length !== domStr.length + idx) {
        return false;
      }
      if (str.substr(idx - 1, 1) !== ".") {
        return false;
      }
      if (IP_REGEX_LOWERCASE.test(str)) {
        return false;
      }
      return true;
    }
    function defaultPath(path) {
      if (!path || path.substr(0, 1) !== "/") {
        return "/";
      }
      if (path === "/") {
        return path;
      }
      const rightSlash = path.lastIndexOf("/");
      if (rightSlash === 0) {
        return "/";
      }
      return path.slice(0, rightSlash);
    }
    function trimTerminator(str) {
      if (validators.isEmptyString(str))
        return str;
      for (let t = 0; t < TERMINATORS.length; t++) {
        const terminatorIdx = str.indexOf(TERMINATORS[t]);
        if (terminatorIdx !== -1) {
          str = str.substr(0, terminatorIdx);
        }
      }
      return str;
    }
    function parseCookiePair(cookiePair, looseMode) {
      cookiePair = trimTerminator(cookiePair);
      validators.validate(validators.isString(cookiePair), cookiePair);
      let firstEq = cookiePair.indexOf("=");
      if (looseMode) {
        if (firstEq === 0) {
          cookiePair = cookiePair.substr(1);
          firstEq = cookiePair.indexOf("=");
        }
      } else {
        if (firstEq <= 0) {
          return;
        }
      }
      let cookieName, cookieValue;
      if (firstEq <= 0) {
        cookieName = "";
        cookieValue = cookiePair.trim();
      } else {
        cookieName = cookiePair.substr(0, firstEq).trim();
        cookieValue = cookiePair.substr(firstEq + 1).trim();
      }
      if (CONTROL_CHARS.test(cookieName) || CONTROL_CHARS.test(cookieValue)) {
        return;
      }
      const c = new Cookie2();
      c.key = cookieName;
      c.value = cookieValue;
      return c;
    }
    function parse2(str, options) {
      if (!options || typeof options !== "object") {
        options = {};
      }
      if (validators.isEmptyString(str) || !validators.isString(str)) {
        return null;
      }
      str = str.trim();
      const firstSemi = str.indexOf(";");
      const cookiePair = firstSemi === -1 ? str : str.substr(0, firstSemi);
      const c = parseCookiePair(cookiePair, !!options.loose);
      if (!c) {
        return;
      }
      if (firstSemi === -1) {
        return c;
      }
      const unparsed = str.slice(firstSemi + 1).trim();
      if (unparsed.length === 0) {
        return c;
      }
      const cookie_avs = unparsed.split(";");
      while (cookie_avs.length) {
        const av = cookie_avs.shift().trim();
        if (av.length === 0) {
          continue;
        }
        const av_sep = av.indexOf("=");
        let av_key, av_value;
        if (av_sep === -1) {
          av_key = av;
          av_value = null;
        } else {
          av_key = av.substr(0, av_sep);
          av_value = av.substr(av_sep + 1);
        }
        av_key = av_key.trim().toLowerCase();
        if (av_value) {
          av_value = av_value.trim();
        }
        switch (av_key) {
          case "expires":
            if (av_value) {
              const exp = parseDate(av_value);
              if (exp) {
                c.expires = exp;
              }
            }
            break;
          case "max-age":
            if (av_value) {
              if (/^-?[0-9]+$/.test(av_value)) {
                const delta = parseInt(av_value, 10);
                c.setMaxAge(delta);
              }
            }
            break;
          case "domain":
            if (av_value) {
              const domain = av_value.trim().replace(/^\./, "");
              if (domain) {
                c.domain = domain.toLowerCase();
              }
            }
            break;
          case "path":
            c.path = av_value && av_value[0] === "/" ? av_value : null;
            break;
          case "secure":
            c.secure = true;
            break;
          case "httponly":
            c.httpOnly = true;
            break;
          case "samesite":
            const enforcement = av_value ? av_value.toLowerCase() : "";
            switch (enforcement) {
              case "strict":
                c.sameSite = "strict";
                break;
              case "lax":
                c.sameSite = "lax";
                break;
              case "none":
                c.sameSite = "none";
                break;
              default:
                c.sameSite = void 0;
                break;
            }
            break;
          default:
            c.extensions = c.extensions || [];
            c.extensions.push(av);
            break;
        }
      }
      return c;
    }
    function isSecurePrefixConditionMet(cookie) {
      validators.validate(validators.isObject(cookie), cookie);
      return !cookie.key.startsWith("__Secure-") || cookie.secure;
    }
    function isHostPrefixConditionMet(cookie) {
      validators.validate(validators.isObject(cookie));
      return !cookie.key.startsWith("__Host-") || cookie.secure && cookie.hostOnly && cookie.path != null && cookie.path === "/";
    }
    function jsonParse(str) {
      let obj;
      try {
        obj = JSON.parse(str);
      } catch (e) {
        return e;
      }
      return obj;
    }
    function fromJSON(str) {
      if (!str || validators.isEmptyString(str)) {
        return null;
      }
      let obj;
      if (typeof str === "string") {
        obj = jsonParse(str);
        if (obj instanceof Error) {
          return null;
        }
      } else {
        obj = str;
      }
      const c = new Cookie2();
      for (let i = 0; i < Cookie2.serializableProperties.length; i++) {
        const prop = Cookie2.serializableProperties[i];
        if (obj[prop] === void 0 || obj[prop] === cookieDefaults[prop]) {
          continue;
        }
        if (prop === "expires" || prop === "creation" || prop === "lastAccessed") {
          if (obj[prop] === null) {
            c[prop] = null;
          } else {
            c[prop] = obj[prop] == "Infinity" ? "Infinity" : new Date(obj[prop]);
          }
        } else {
          c[prop] = obj[prop];
        }
      }
      return c;
    }
    function cookieCompare(a, b) {
      validators.validate(validators.isObject(a), a);
      validators.validate(validators.isObject(b), b);
      let cmp = 0;
      const aPathLen = a.path ? a.path.length : 0;
      const bPathLen = b.path ? b.path.length : 0;
      cmp = bPathLen - aPathLen;
      if (cmp !== 0) {
        return cmp;
      }
      const aTime = a.creation ? a.creation.getTime() : MAX_TIME;
      const bTime = b.creation ? b.creation.getTime() : MAX_TIME;
      cmp = aTime - bTime;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = a.creationIndex - b.creationIndex;
      return cmp;
    }
    function permutePath(path) {
      validators.validate(validators.isString(path));
      if (path === "/") {
        return ["/"];
      }
      const permutations = [path];
      while (path.length > 1) {
        const lindex = path.lastIndexOf("/");
        if (lindex === 0) {
          break;
        }
        path = path.substr(0, lindex);
        permutations.push(path);
      }
      permutations.push("/");
      return permutations;
    }
    function getCookieContext(url) {
      if (url instanceof Object) {
        return url;
      }
      try {
        url = decodeURI(url);
      } catch (err) {
      }
      return urlParse(url);
    }
    var cookieDefaults = {
      // the order in which the RFC has them:
      key: "",
      value: "",
      expires: "Infinity",
      maxAge: null,
      domain: null,
      path: null,
      secure: false,
      httpOnly: false,
      extensions: null,
      // set by the CookieJar:
      hostOnly: null,
      pathIsDefault: null,
      creation: null,
      lastAccessed: null,
      sameSite: void 0
    };
    var Cookie2 = class _Cookie {
      constructor(options = {}) {
        const customInspectSymbol = getCustomInspectSymbol();
        if (customInspectSymbol) {
          this[customInspectSymbol] = this.inspect;
        }
        Object.assign(this, cookieDefaults, options);
        this.creation = this.creation || /* @__PURE__ */ new Date();
        Object.defineProperty(this, "creationIndex", {
          configurable: false,
          enumerable: false,
          // important for assert.deepEqual checks
          writable: true,
          value: ++_Cookie.cookiesCreated
        });
      }
      inspect() {
        const now = Date.now();
        const hostOnly = this.hostOnly != null ? this.hostOnly : "?";
        const createAge = this.creation ? `${now - this.creation.getTime()}ms` : "?";
        const accessAge = this.lastAccessed ? `${now - this.lastAccessed.getTime()}ms` : "?";
        return `Cookie="${this.toString()}; hostOnly=${hostOnly}; aAge=${accessAge}; cAge=${createAge}"`;
      }
      toJSON() {
        const obj = {};
        for (const prop of _Cookie.serializableProperties) {
          if (this[prop] === cookieDefaults[prop]) {
            continue;
          }
          if (prop === "expires" || prop === "creation" || prop === "lastAccessed") {
            if (this[prop] === null) {
              obj[prop] = null;
            } else {
              obj[prop] = this[prop] == "Infinity" ? "Infinity" : this[prop].toISOString();
            }
          } else if (prop === "maxAge") {
            if (this[prop] !== null) {
              obj[prop] = this[prop] == Infinity || this[prop] == -Infinity ? this[prop].toString() : this[prop];
            }
          } else {
            if (this[prop] !== cookieDefaults[prop]) {
              obj[prop] = this[prop];
            }
          }
        }
        return obj;
      }
      clone() {
        return fromJSON(this.toJSON());
      }
      validate() {
        if (!COOKIE_OCTETS.test(this.value)) {
          return false;
        }
        if (this.expires != Infinity && !(this.expires instanceof Date) && !parseDate(this.expires)) {
          return false;
        }
        if (this.maxAge != null && this.maxAge <= 0) {
          return false;
        }
        if (this.path != null && !PATH_VALUE.test(this.path)) {
          return false;
        }
        const cdomain = this.cdomain();
        if (cdomain) {
          if (cdomain.match(/\.$/)) {
            return false;
          }
          const suffix = pubsuffix.getPublicSuffix(cdomain);
          if (suffix == null) {
            return false;
          }
        }
        return true;
      }
      setExpires(exp) {
        if (exp instanceof Date) {
          this.expires = exp;
        } else {
          this.expires = parseDate(exp) || "Infinity";
        }
      }
      setMaxAge(age) {
        if (age === Infinity || age === -Infinity) {
          this.maxAge = age.toString();
        } else {
          this.maxAge = age;
        }
      }
      cookieString() {
        let val = this.value;
        if (val == null) {
          val = "";
        }
        if (this.key === "") {
          return val;
        }
        return `${this.key}=${val}`;
      }
      // gives Set-Cookie header format
      toString() {
        let str = this.cookieString();
        if (this.expires != Infinity) {
          if (this.expires instanceof Date) {
            str += `; Expires=${formatDate(this.expires)}`;
          } else {
            str += `; Expires=${this.expires}`;
          }
        }
        if (this.maxAge != null && this.maxAge != Infinity) {
          str += `; Max-Age=${this.maxAge}`;
        }
        if (this.domain && !this.hostOnly) {
          str += `; Domain=${this.domain}`;
        }
        if (this.path) {
          str += `; Path=${this.path}`;
        }
        if (this.secure) {
          str += "; Secure";
        }
        if (this.httpOnly) {
          str += "; HttpOnly";
        }
        if (this.sameSite && this.sameSite !== "none") {
          const ssCanon = _Cookie.sameSiteCanonical[this.sameSite.toLowerCase()];
          str += `; SameSite=${ssCanon ? ssCanon : this.sameSite}`;
        }
        if (this.extensions) {
          this.extensions.forEach((ext) => {
            str += `; ${ext}`;
          });
        }
        return str;
      }
      // TTL() partially replaces the "expiry-time" parts of S5.3 step 3 (setCookie()
      // elsewhere)
      // S5.3 says to give the "latest representable date" for which we use Infinity
      // For "expired" we use 0
      TTL(now) {
        if (this.maxAge != null) {
          return this.maxAge <= 0 ? 0 : this.maxAge * 1e3;
        }
        let expires = this.expires;
        if (expires != Infinity) {
          if (!(expires instanceof Date)) {
            expires = parseDate(expires) || Infinity;
          }
          if (expires == Infinity) {
            return Infinity;
          }
          return expires.getTime() - (now || Date.now());
        }
        return Infinity;
      }
      // expiryTime() replaces the "expiry-time" parts of S5.3 step 3 (setCookie()
      // elsewhere)
      expiryTime(now) {
        if (this.maxAge != null) {
          const relativeTo = now || this.creation || /* @__PURE__ */ new Date();
          const age = this.maxAge <= 0 ? -Infinity : this.maxAge * 1e3;
          return relativeTo.getTime() + age;
        }
        if (this.expires == Infinity) {
          return Infinity;
        }
        return this.expires.getTime();
      }
      // expiryDate() replaces the "expiry-time" parts of S5.3 step 3 (setCookie()
      // elsewhere), except it returns a Date
      expiryDate(now) {
        const millisec = this.expiryTime(now);
        if (millisec == Infinity) {
          return new Date(MAX_TIME);
        } else if (millisec == -Infinity) {
          return new Date(MIN_TIME);
        } else {
          return new Date(millisec);
        }
      }
      // This replaces the "persistent-flag" parts of S5.3 step 3
      isPersistent() {
        return this.maxAge != null || this.expires != Infinity;
      }
      // Mostly S5.1.2 and S5.2.3:
      canonicalizedDomain() {
        if (this.domain == null) {
          return null;
        }
        return canonicalDomain(this.domain);
      }
      cdomain() {
        return this.canonicalizedDomain();
      }
    };
    Cookie2.cookiesCreated = 0;
    Cookie2.parse = parse2;
    Cookie2.fromJSON = fromJSON;
    Cookie2.serializableProperties = Object.keys(cookieDefaults);
    Cookie2.sameSiteLevel = {
      strict: 3,
      lax: 2,
      none: 1
    };
    Cookie2.sameSiteCanonical = {
      strict: "Strict",
      lax: "Lax"
    };
    function getNormalizedPrefixSecurity(prefixSecurity) {
      if (prefixSecurity != null) {
        const normalizedPrefixSecurity = prefixSecurity.toLowerCase();
        switch (normalizedPrefixSecurity) {
          case PrefixSecurityEnum.STRICT:
          case PrefixSecurityEnum.SILENT:
          case PrefixSecurityEnum.DISABLED:
            return normalizedPrefixSecurity;
        }
      }
      return PrefixSecurityEnum.SILENT;
    }
    var CookieJar2 = class _CookieJar {
      constructor(store2, options = { rejectPublicSuffixes: true }) {
        if (typeof options === "boolean") {
          options = { rejectPublicSuffixes: options };
        }
        validators.validate(validators.isObject(options), options);
        this.rejectPublicSuffixes = options.rejectPublicSuffixes;
        this.enableLooseMode = !!options.looseMode;
        this.allowSpecialUseDomain = typeof options.allowSpecialUseDomain === "boolean" ? options.allowSpecialUseDomain : true;
        this.store = store2 || new MemoryCookieStore2();
        this.prefixSecurity = getNormalizedPrefixSecurity(options.prefixSecurity);
        this._cloneSync = syncWrap("clone");
        this._importCookiesSync = syncWrap("_importCookies");
        this.getCookiesSync = syncWrap("getCookies");
        this.getCookieStringSync = syncWrap("getCookieString");
        this.getSetCookieStringsSync = syncWrap("getSetCookieStrings");
        this.removeAllCookiesSync = syncWrap("removeAllCookies");
        this.setCookieSync = syncWrap("setCookie");
        this.serializeSync = syncWrap("serialize");
      }
      setCookie(cookie, url, options, cb) {
        validators.validate(validators.isUrlStringOrObject(url), cb, options);
        let err;
        if (validators.isFunction(url)) {
          cb = url;
          return cb(new Error("No URL was specified"));
        }
        const context = getCookieContext(url);
        if (validators.isFunction(options)) {
          cb = options;
          options = {};
        }
        validators.validate(validators.isFunction(cb), cb);
        if (!validators.isNonEmptyString(cookie) && !validators.isObject(cookie) && cookie instanceof String && cookie.length == 0) {
          return cb(null);
        }
        const host = canonicalDomain(context.hostname);
        const loose = options.loose || this.enableLooseMode;
        let sameSiteContext = null;
        if (options.sameSiteContext) {
          sameSiteContext = checkSameSiteContext(options.sameSiteContext);
          if (!sameSiteContext) {
            return cb(new Error(SAME_SITE_CONTEXT_VAL_ERR));
          }
        }
        if (typeof cookie === "string" || cookie instanceof String) {
          cookie = Cookie2.parse(cookie, { loose });
          if (!cookie) {
            err = new Error("Cookie failed to parse");
            return cb(options.ignoreError ? null : err);
          }
        } else if (!(cookie instanceof Cookie2)) {
          err = new Error(
            "First argument to setCookie must be a Cookie object or string"
          );
          return cb(options.ignoreError ? null : err);
        }
        const now = options.now || /* @__PURE__ */ new Date();
        if (this.rejectPublicSuffixes && cookie.domain) {
          const suffix = pubsuffix.getPublicSuffix(cookie.cdomain(), {
            allowSpecialUseDomain: this.allowSpecialUseDomain,
            ignoreError: options.ignoreError
          });
          if (suffix == null && !IP_V6_REGEX_OBJECT.test(cookie.domain)) {
            err = new Error("Cookie has domain set to a public suffix");
            return cb(options.ignoreError ? null : err);
          }
        }
        if (cookie.domain) {
          if (!domainMatch2(host, cookie.cdomain(), false)) {
            err = new Error(
              `Cookie not in this host's domain. Cookie:${cookie.cdomain()} Request:${host}`
            );
            return cb(options.ignoreError ? null : err);
          }
          if (cookie.hostOnly == null) {
            cookie.hostOnly = false;
          }
        } else {
          cookie.hostOnly = true;
          cookie.domain = host;
        }
        if (!cookie.path || cookie.path[0] !== "/") {
          cookie.path = defaultPath(context.pathname);
          cookie.pathIsDefault = true;
        }
        if (options.http === false && cookie.httpOnly) {
          err = new Error("Cookie is HttpOnly and this isn't an HTTP API");
          return cb(options.ignoreError ? null : err);
        }
        if (cookie.sameSite !== "none" && cookie.sameSite !== void 0 && sameSiteContext) {
          if (sameSiteContext === "none") {
            err = new Error(
              "Cookie is SameSite but this is a cross-origin request"
            );
            return cb(options.ignoreError ? null : err);
          }
        }
        const ignoreErrorForPrefixSecurity = this.prefixSecurity === PrefixSecurityEnum.SILENT;
        const prefixSecurityDisabled = this.prefixSecurity === PrefixSecurityEnum.DISABLED;
        if (!prefixSecurityDisabled) {
          let errorFound = false;
          let errorMsg;
          if (!isSecurePrefixConditionMet(cookie)) {
            errorFound = true;
            errorMsg = "Cookie has __Secure prefix but Secure attribute is not set";
          } else if (!isHostPrefixConditionMet(cookie)) {
            errorFound = true;
            errorMsg = "Cookie has __Host prefix but either Secure or HostOnly attribute is not set or Path is not '/'";
          }
          if (errorFound) {
            return cb(
              options.ignoreError || ignoreErrorForPrefixSecurity ? null : new Error(errorMsg)
            );
          }
        }
        const store2 = this.store;
        if (!store2.updateCookie) {
          store2.updateCookie = function(oldCookie, newCookie, cb2) {
            this.putCookie(newCookie, cb2);
          };
        }
        function withCookie(err2, oldCookie) {
          if (err2) {
            return cb(err2);
          }
          const next = function(err3) {
            if (err3) {
              return cb(err3);
            } else {
              cb(null, cookie);
            }
          };
          if (oldCookie) {
            if (options.http === false && oldCookie.httpOnly) {
              err2 = new Error("old Cookie is HttpOnly and this isn't an HTTP API");
              return cb(options.ignoreError ? null : err2);
            }
            cookie.creation = oldCookie.creation;
            cookie.creationIndex = oldCookie.creationIndex;
            cookie.lastAccessed = now;
            store2.updateCookie(oldCookie, cookie, next);
          } else {
            cookie.creation = cookie.lastAccessed = now;
            store2.putCookie(cookie, next);
          }
        }
        store2.findCookie(cookie.domain, cookie.path, cookie.key, withCookie);
      }
      // RFC6365 S5.4
      getCookies(url, options, cb) {
        validators.validate(validators.isUrlStringOrObject(url), cb, url);
        const context = getCookieContext(url);
        if (validators.isFunction(options)) {
          cb = options;
          options = {};
        }
        validators.validate(validators.isObject(options), cb, options);
        validators.validate(validators.isFunction(cb), cb);
        const host = canonicalDomain(context.hostname);
        const path = context.pathname || "/";
        let secure = options.secure;
        if (secure == null && context.protocol && (context.protocol == "https:" || context.protocol == "wss:")) {
          secure = true;
        }
        let sameSiteLevel = 0;
        if (options.sameSiteContext) {
          const sameSiteContext = checkSameSiteContext(options.sameSiteContext);
          sameSiteLevel = Cookie2.sameSiteLevel[sameSiteContext];
          if (!sameSiteLevel) {
            return cb(new Error(SAME_SITE_CONTEXT_VAL_ERR));
          }
        }
        let http2 = options.http;
        if (http2 == null) {
          http2 = true;
        }
        const now = options.now || Date.now();
        const expireCheck = options.expire !== false;
        const allPaths = !!options.allPaths;
        const store2 = this.store;
        function matchingCookie(c) {
          if (c.hostOnly) {
            if (c.domain != host) {
              return false;
            }
          } else {
            if (!domainMatch2(host, c.domain, false)) {
              return false;
            }
          }
          if (!allPaths && !pathMatch2(path, c.path)) {
            return false;
          }
          if (c.secure && !secure) {
            return false;
          }
          if (c.httpOnly && !http2) {
            return false;
          }
          if (sameSiteLevel) {
            const cookieLevel = Cookie2.sameSiteLevel[c.sameSite || "none"];
            if (cookieLevel > sameSiteLevel) {
              return false;
            }
          }
          if (expireCheck && c.expiryTime() <= now) {
            store2.removeCookie(c.domain, c.path, c.key, () => {
            });
            return false;
          }
          return true;
        }
        store2.findCookies(
          host,
          allPaths ? null : path,
          this.allowSpecialUseDomain,
          (err, cookies) => {
            if (err) {
              return cb(err);
            }
            cookies = cookies.filter(matchingCookie);
            if (options.sort !== false) {
              cookies = cookies.sort(cookieCompare);
            }
            const now2 = /* @__PURE__ */ new Date();
            for (const cookie of cookies) {
              cookie.lastAccessed = now2;
            }
            cb(null, cookies);
          }
        );
      }
      getCookieString(...args) {
        const cb = args.pop();
        validators.validate(validators.isFunction(cb), cb);
        const next = function(err, cookies) {
          if (err) {
            cb(err);
          } else {
            cb(
              null,
              cookies.sort(cookieCompare).map((c) => c.cookieString()).join("; ")
            );
          }
        };
        args.push(next);
        this.getCookies.apply(this, args);
      }
      getSetCookieStrings(...args) {
        const cb = args.pop();
        validators.validate(validators.isFunction(cb), cb);
        const next = function(err, cookies) {
          if (err) {
            cb(err);
          } else {
            cb(
              null,
              cookies.map((c) => {
                return c.toString();
              })
            );
          }
        };
        args.push(next);
        this.getCookies.apply(this, args);
      }
      serialize(cb) {
        validators.validate(validators.isFunction(cb), cb);
        let type = this.store.constructor.name;
        if (validators.isObject(type)) {
          type = null;
        }
        const serialized = {
          // The version of tough-cookie that serialized this jar. Generally a good
          // practice since future versions can make data import decisions based on
          // known past behavior. When/if this matters, use `semver`.
          version: `tough-cookie@${VERSION}`,
          // add the store type, to make humans happy:
          storeType: type,
          // CookieJar configuration:
          rejectPublicSuffixes: !!this.rejectPublicSuffixes,
          enableLooseMode: !!this.enableLooseMode,
          allowSpecialUseDomain: !!this.allowSpecialUseDomain,
          prefixSecurity: getNormalizedPrefixSecurity(this.prefixSecurity),
          // this gets filled from getAllCookies:
          cookies: []
        };
        if (!(this.store.getAllCookies && typeof this.store.getAllCookies === "function")) {
          return cb(
            new Error(
              "store does not support getAllCookies and cannot be serialized"
            )
          );
        }
        this.store.getAllCookies((err, cookies) => {
          if (err) {
            return cb(err);
          }
          serialized.cookies = cookies.map((cookie) => {
            cookie = cookie instanceof Cookie2 ? cookie.toJSON() : cookie;
            delete cookie.creationIndex;
            return cookie;
          });
          return cb(null, serialized);
        });
      }
      toJSON() {
        return this.serializeSync();
      }
      // use the class method CookieJar.deserialize instead of calling this directly
      _importCookies(serialized, cb) {
        let cookies = serialized.cookies;
        if (!cookies || !Array.isArray(cookies)) {
          return cb(new Error("serialized jar has no cookies array"));
        }
        cookies = cookies.slice();
        const putNext = (err) => {
          if (err) {
            return cb(err);
          }
          if (!cookies.length) {
            return cb(err, this);
          }
          let cookie;
          try {
            cookie = fromJSON(cookies.shift());
          } catch (e) {
            return cb(e);
          }
          if (cookie === null) {
            return putNext(null);
          }
          this.store.putCookie(cookie, putNext);
        };
        putNext();
      }
      clone(newStore, cb) {
        if (arguments.length === 1) {
          cb = newStore;
          newStore = null;
        }
        this.serialize((err, serialized) => {
          if (err) {
            return cb(err);
          }
          _CookieJar.deserialize(serialized, newStore, cb);
        });
      }
      cloneSync(newStore) {
        if (arguments.length === 0) {
          return this._cloneSync();
        }
        if (!newStore.synchronous) {
          throw new Error(
            "CookieJar clone destination store is not synchronous; use async API instead."
          );
        }
        return this._cloneSync(newStore);
      }
      removeAllCookies(cb) {
        validators.validate(validators.isFunction(cb), cb);
        const store2 = this.store;
        if (typeof store2.removeAllCookies === "function" && store2.removeAllCookies !== Store2.prototype.removeAllCookies) {
          return store2.removeAllCookies(cb);
        }
        store2.getAllCookies((err, cookies) => {
          if (err) {
            return cb(err);
          }
          if (cookies.length === 0) {
            return cb(null);
          }
          let completedCount = 0;
          const removeErrors = [];
          function removeCookieCb(removeErr) {
            if (removeErr) {
              removeErrors.push(removeErr);
            }
            completedCount++;
            if (completedCount === cookies.length) {
              return cb(removeErrors.length ? removeErrors[0] : null);
            }
          }
          cookies.forEach((cookie) => {
            store2.removeCookie(
              cookie.domain,
              cookie.path,
              cookie.key,
              removeCookieCb
            );
          });
        });
      }
      static deserialize(strOrObj, store2, cb) {
        if (arguments.length !== 3) {
          cb = store2;
          store2 = null;
        }
        validators.validate(validators.isFunction(cb), cb);
        let serialized;
        if (typeof strOrObj === "string") {
          serialized = jsonParse(strOrObj);
          if (serialized instanceof Error) {
            return cb(serialized);
          }
        } else {
          serialized = strOrObj;
        }
        const jar = new _CookieJar(store2, {
          rejectPublicSuffixes: serialized.rejectPublicSuffixes,
          looseMode: serialized.enableLooseMode,
          allowSpecialUseDomain: serialized.allowSpecialUseDomain,
          prefixSecurity: serialized.prefixSecurity
        });
        jar._importCookies(serialized, (err) => {
          if (err) {
            return cb(err);
          }
          cb(null, jar);
        });
      }
      static deserializeSync(strOrObj, store2) {
        const serialized = typeof strOrObj === "string" ? JSON.parse(strOrObj) : strOrObj;
        const jar = new _CookieJar(store2, {
          rejectPublicSuffixes: serialized.rejectPublicSuffixes,
          looseMode: serialized.enableLooseMode
        });
        if (!jar.store.synchronous) {
          throw new Error(
            "CookieJar store is not synchronous; use async API instead."
          );
        }
        jar._importCookiesSync(serialized);
        return jar;
      }
    };
    CookieJar2.fromJSON = CookieJar2.deserializeSync;
    [
      "_importCookies",
      "clone",
      "getCookies",
      "getCookieString",
      "getSetCookieStrings",
      "removeAllCookies",
      "serialize",
      "setCookie"
    ].forEach((name) => {
      CookieJar2.prototype[name] = fromCallback(CookieJar2.prototype[name]);
    });
    CookieJar2.deserialize = fromCallback(CookieJar2.deserialize);
    function syncWrap(method) {
      return function(...args) {
        if (!this.store.synchronous) {
          throw new Error(
            "CookieJar store is not synchronous; use async API instead."
          );
        }
        let syncErr, syncResult;
        this[method](...args, (err, result) => {
          syncErr = err;
          syncResult = result;
        });
        if (syncErr) {
          throw syncErr;
        }
        return syncResult;
      };
    }
    exports.version = VERSION;
    exports.CookieJar = CookieJar2;
    exports.Cookie = Cookie2;
    exports.Store = Store2;
    exports.MemoryCookieStore = MemoryCookieStore2;
    exports.parseDate = parseDate;
    exports.formatDate = formatDate;
    exports.parse = parse2;
    exports.fromJSON = fromJSON;
    exports.domainMatch = domainMatch2;
    exports.defaultPath = defaultPath;
    exports.pathMatch = pathMatch2;
    exports.getPublicSuffix = pubsuffix.getPublicSuffix;
    exports.cookieCompare = cookieCompare;
    exports.permuteDomain = require_permuteDomain().permuteDomain;
    exports.permutePath = permutePath;
    exports.canonicalDomain = canonicalDomain;
    exports.PrefixSecurityEnum = PrefixSecurityEnum;
    exports.ParameterError = validators.ParameterError;
  }
});
var import_tough_cookie = __toESM$3(require_cookie$1());
var source_default$2 = import_tough_cookie.default;
/*! Bundled license information:

tough-cookie/lib/pubsuffix-psl.js:
  (*!
   * Copyright (c) 2018, Salesforce.com, Inc.
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice,
   * this list of conditions and the following disclaimer.
   *
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   * this list of conditions and the following disclaimer in the documentation
   * and/or other materials provided with the distribution.
   *
   * 3. Neither the name of Salesforce.com nor the names of its contributors may
   * be used to endorse or promote products derived from this software without
   * specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   *)

tough-cookie/lib/store.js:
  (*!
   * Copyright (c) 2015, Salesforce.com, Inc.
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice,
   * this list of conditions and the following disclaimer.
   *
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   * this list of conditions and the following disclaimer in the documentation
   * and/or other materials provided with the distribution.
   *
   * 3. Neither the name of Salesforce.com nor the names of its contributors may
   * be used to endorse or promote products derived from this software without
   * specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   *)

tough-cookie/lib/permuteDomain.js:
  (*!
   * Copyright (c) 2015, Salesforce.com, Inc.
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice,
   * this list of conditions and the following disclaimer.
   *
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   * this list of conditions and the following disclaimer in the documentation
   * and/or other materials provided with the distribution.
   *
   * 3. Neither the name of Salesforce.com nor the names of its contributors may
   * be used to endorse or promote products derived from this software without
   * specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   *)

tough-cookie/lib/pathMatch.js:
  (*!
   * Copyright (c) 2015, Salesforce.com, Inc.
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice,
   * this list of conditions and the following disclaimer.
   *
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   * this list of conditions and the following disclaimer in the documentation
   * and/or other materials provided with the distribution.
   *
   * 3. Neither the name of Salesforce.com nor the names of its contributors may
   * be used to endorse or promote products derived from this software without
   * specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   *)

tough-cookie/lib/memstore.js:
  (*!
   * Copyright (c) 2015, Salesforce.com, Inc.
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice,
   * this list of conditions and the following disclaimer.
   *
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   * this list of conditions and the following disclaimer in the documentation
   * and/or other materials provided with the distribution.
   *
   * 3. Neither the name of Salesforce.com nor the names of its contributors may
   * be used to endorse or promote products derived from this software without
   * specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   *)

tough-cookie/lib/cookie.js:
  (*!
   * Copyright (c) 2015-2020, Salesforce.com, Inc.
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice,
   * this list of conditions and the following disclaimer.
   *
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   * this list of conditions and the following disclaimer in the documentation
   * and/or other materials provided with the distribution.
   *
   * 3. Neither the name of Salesforce.com nor the names of its contributors may
   * be used to endorse or promote products derived from this software without
   * specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   *)
*/
const { Cookie, CookieJar, Store, MemoryCookieStore, domainMatch, pathMatch } = source_default$2;
class WebStorageCookieStore extends Store {
  constructor() {
    super();
    __publicField(this, "storage");
    __publicField(this, "storageKey");
    invariant$1(
      typeof localStorage !== "undefined",
      "Failed to create a WebStorageCookieStore: `localStorage` is not available in this environment. This is likely an issue with MSW. Please report it on GitHub: https://github.com/mswjs/msw/issues"
    );
    this.synchronous = true;
    this.storage = localStorage;
    this.storageKey = "__msw-cookie-store__";
  }
  findCookie(domain, path, key, callback) {
    try {
      const store2 = this.getStore();
      const cookies = this.filterCookiesFromList(store2, { domain, path, key });
      callback(null, cookies[0] || null);
    } catch (error2) {
      if (error2 instanceof Error) {
        callback(error2, null);
      }
    }
  }
  findCookies(domain, path, allowSpecialUseDomain, callback) {
    if (!domain) {
      callback(null, []);
      return;
    }
    try {
      const store2 = this.getStore();
      const results = this.filterCookiesFromList(store2, {
        domain,
        path
      });
      callback(null, results);
    } catch (error2) {
      if (error2 instanceof Error) {
        callback(error2, []);
      }
    }
  }
  putCookie(cookie, callback) {
    try {
      if (cookie.maxAge === 0) {
        return;
      }
      const store2 = this.getStore();
      store2.push(cookie);
      this.updateStore(store2);
    } catch (error2) {
      if (error2 instanceof Error) {
        callback(error2);
      }
    }
  }
  updateCookie(oldCookie, newCookie, callback) {
    if (newCookie.maxAge === 0) {
      this.removeCookie(
        newCookie.domain || "",
        newCookie.path || "",
        newCookie.key,
        callback
      );
      return;
    }
    this.putCookie(newCookie, callback);
  }
  removeCookie(domain, path, key, callback) {
    try {
      const store2 = this.getStore();
      const nextStore = this.deleteCookiesFromList(store2, { domain, path, key });
      this.updateStore(nextStore);
      callback(null);
    } catch (error2) {
      if (error2 instanceof Error) {
        callback(error2);
      }
    }
  }
  removeCookies(domain, path, callback) {
    try {
      const store2 = this.getStore();
      const nextStore = this.deleteCookiesFromList(store2, { domain, path });
      this.updateStore(nextStore);
      callback(null);
    } catch (error2) {
      if (error2 instanceof Error) {
        callback(error2);
      }
    }
  }
  getAllCookies(callback) {
    try {
      callback(null, this.getStore());
    } catch (error2) {
      if (error2 instanceof Error) {
        callback(error2, []);
      }
    }
  }
  getStore() {
    try {
      const json = this.storage.getItem(this.storageKey);
      if (json == null) {
        return [];
      }
      const rawCookies = JSON.parse(json);
      const cookies = [];
      for (const rawCookie of rawCookies) {
        const cookie = Cookie.fromJSON(rawCookie);
        if (cookie != null) {
          cookies.push(cookie);
        }
      }
      return cookies;
    } catch {
      return [];
    }
  }
  updateStore(nextStore) {
    this.storage.setItem(
      this.storageKey,
      JSON.stringify(nextStore.map((cookie) => cookie.toJSON()))
    );
  }
  filterCookiesFromList(cookies, matches) {
    const result = [];
    for (const cookie of cookies) {
      if (matches.domain && !domainMatch(matches.domain, cookie.domain || "")) {
        continue;
      }
      if (matches.path && !pathMatch(matches.path, cookie.path || "")) {
        continue;
      }
      if (matches.key && cookie.key !== matches.key) {
        continue;
      }
      result.push(cookie);
    }
    return result;
  }
  deleteCookiesFromList(cookies, matches) {
    const matchingCookies = this.filterCookiesFromList(cookies, matches);
    return cookies.filter((cookie) => !matchingCookies.includes(cookie));
  }
}
const store = isNodeProcess$1() ? new MemoryCookieStore() : new WebStorageCookieStore();
const cookieStore = new CookieJar(store);
var __create$2 = Object.create;
var __defProp$4 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$2 = Object.getOwnPropertyNames;
var __getProtoOf$2 = Object.getPrototypeOf;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __commonJS$2 = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames$2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps$2 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames$2(from))
      if (!__hasOwnProp$2.call(to, key) && key !== except)
        __defProp$4(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc$2(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM$2 = (mod, isNodeMode, target) => (target = mod != null ? __create$2(__getProtoOf$2(mod)) : {}, __copyProps$2(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp$4(target, "default", { value: mod, enumerable: true }),
  mod
));
var require_codes = __commonJS$2({
  "node_modules/statuses/codes.json"(exports, module) {
    module.exports = {
      "100": "Continue",
      "101": "Switching Protocols",
      "102": "Processing",
      "103": "Early Hints",
      "200": "OK",
      "201": "Created",
      "202": "Accepted",
      "203": "Non-Authoritative Information",
      "204": "No Content",
      "205": "Reset Content",
      "206": "Partial Content",
      "207": "Multi-Status",
      "208": "Already Reported",
      "226": "IM Used",
      "300": "Multiple Choices",
      "301": "Moved Permanently",
      "302": "Found",
      "303": "See Other",
      "304": "Not Modified",
      "305": "Use Proxy",
      "307": "Temporary Redirect",
      "308": "Permanent Redirect",
      "400": "Bad Request",
      "401": "Unauthorized",
      "402": "Payment Required",
      "403": "Forbidden",
      "404": "Not Found",
      "405": "Method Not Allowed",
      "406": "Not Acceptable",
      "407": "Proxy Authentication Required",
      "408": "Request Timeout",
      "409": "Conflict",
      "410": "Gone",
      "411": "Length Required",
      "412": "Precondition Failed",
      "413": "Payload Too Large",
      "414": "URI Too Long",
      "415": "Unsupported Media Type",
      "416": "Range Not Satisfiable",
      "417": "Expectation Failed",
      "418": "I'm a Teapot",
      "421": "Misdirected Request",
      "422": "Unprocessable Entity",
      "423": "Locked",
      "424": "Failed Dependency",
      "425": "Too Early",
      "426": "Upgrade Required",
      "428": "Precondition Required",
      "429": "Too Many Requests",
      "431": "Request Header Fields Too Large",
      "451": "Unavailable For Legal Reasons",
      "500": "Internal Server Error",
      "501": "Not Implemented",
      "502": "Bad Gateway",
      "503": "Service Unavailable",
      "504": "Gateway Timeout",
      "505": "HTTP Version Not Supported",
      "506": "Variant Also Negotiates",
      "507": "Insufficient Storage",
      "508": "Loop Detected",
      "509": "Bandwidth Limit Exceeded",
      "510": "Not Extended",
      "511": "Network Authentication Required"
    };
  }
});
var require_statuses = __commonJS$2({
  "node_modules/statuses/index.js"(exports, module) {
    var codes = require_codes();
    module.exports = status2;
    status2.message = codes;
    status2.code = createMessageToStatusCodeMap(codes);
    status2.codes = createStatusCodeList(codes);
    status2.redirect = {
      300: true,
      301: true,
      302: true,
      303: true,
      305: true,
      307: true,
      308: true
    };
    status2.empty = {
      204: true,
      205: true,
      304: true
    };
    status2.retry = {
      502: true,
      503: true,
      504: true
    };
    function createMessageToStatusCodeMap(codes2) {
      var map = {};
      Object.keys(codes2).forEach(function forEachCode(code) {
        var message2 = codes2[code];
        var status3 = Number(code);
        map[message2.toLowerCase()] = status3;
      });
      return map;
    }
    function createStatusCodeList(codes2) {
      return Object.keys(codes2).map(function mapCode(code) {
        return Number(code);
      });
    }
    function getStatusCode(message2) {
      var msg = message2.toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(status2.code, msg)) {
        throw new Error('invalid status message: "' + message2 + '"');
      }
      return status2.code[msg];
    }
    function getStatusMessage(code) {
      if (!Object.prototype.hasOwnProperty.call(status2.message, code)) {
        throw new Error("invalid status code: " + code);
      }
      return status2.message[code];
    }
    function status2(code) {
      if (typeof code === "number") {
        return getStatusMessage(code);
      }
      if (typeof code !== "string") {
        throw new TypeError("code must be a number or string");
      }
      var n = parseInt(code, 10);
      if (!isNaN(n)) {
        return getStatusMessage(n);
      }
      return getStatusCode(code);
    }
  }
});
var import_statuses = __toESM$2(require_statuses());
var source_default$1 = import_statuses.default;
/*! Bundled license information:

statuses/index.js:
  (*!
   * statuses
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2016 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
var __create$1 = Object.create;
var __defProp$3 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$1 = Object.getOwnPropertyNames;
var __getProtoOf$1 = Object.getPrototypeOf;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __commonJS$1 = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames$1(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps$1 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames$1(from))
      if (!__hasOwnProp$1.call(to, key) && key !== except)
        __defProp$3(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc$1(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM$1 = (mod, isNodeMode, target) => (target = mod != null ? __create$1(__getProtoOf$1(mod)) : {}, __copyProps$1(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  !mod || !mod.__esModule ? __defProp$3(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var require_set_cookie = __commonJS$1({
  "node_modules/set-cookie-parser/lib/set-cookie.js"(exports, module) {
    var defaultParseOptions = {
      decodeValues: true,
      map: false,
      silent: false
    };
    function isNonEmptyString(str) {
      return typeof str === "string" && !!str.trim();
    }
    function parseString(setCookieValue, options) {
      var parts = setCookieValue.split(";").filter(isNonEmptyString);
      var nameValuePairStr = parts.shift();
      var parsed = parseNameValuePair(nameValuePairStr);
      var name = parsed.name;
      var value = parsed.value;
      options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
      try {
        value = options.decodeValues ? decodeURIComponent(value) : value;
      } catch (e) {
        console.error(
          "set-cookie-parser encountered an error while decoding a cookie with value '" + value + "'. Set options.decodeValues to false to disable this feature.",
          e
        );
      }
      var cookie = {
        name,
        value
      };
      parts.forEach(function(part) {
        var sides = part.split("=");
        var key = sides.shift().trimLeft().toLowerCase();
        var value2 = sides.join("=");
        if (key === "expires") {
          cookie.expires = new Date(value2);
        } else if (key === "max-age") {
          cookie.maxAge = parseInt(value2, 10);
        } else if (key === "secure") {
          cookie.secure = true;
        } else if (key === "httponly") {
          cookie.httpOnly = true;
        } else if (key === "samesite") {
          cookie.sameSite = value2;
        } else {
          cookie[key] = value2;
        }
      });
      return cookie;
    }
    function parseNameValuePair(nameValuePairStr) {
      var name = "";
      var value = "";
      var nameValueArr = nameValuePairStr.split("=");
      if (nameValueArr.length > 1) {
        name = nameValueArr.shift();
        value = nameValueArr.join("=");
      } else {
        value = nameValuePairStr;
      }
      return { name, value };
    }
    function parse2(input, options) {
      options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
      if (!input) {
        if (!options.map) {
          return [];
        } else {
          return {};
        }
      }
      if (input.headers) {
        if (typeof input.headers.getSetCookie === "function") {
          input = input.headers.getSetCookie();
        } else if (input.headers["set-cookie"]) {
          input = input.headers["set-cookie"];
        } else {
          var sch = input.headers[Object.keys(input.headers).find(function(key) {
            return key.toLowerCase() === "set-cookie";
          })];
          if (!sch && input.headers.cookie && !options.silent) {
            console.warn(
              "Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."
            );
          }
          input = sch;
        }
      }
      if (!Array.isArray(input)) {
        input = [input];
      }
      options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
      if (!options.map) {
        return input.filter(isNonEmptyString).map(function(str) {
          return parseString(str, options);
        });
      } else {
        var cookies = {};
        return input.filter(isNonEmptyString).reduce(function(cookies2, str) {
          var cookie = parseString(str, options);
          cookies2[cookie.name] = cookie;
          return cookies2;
        }, cookies);
      }
    }
    function splitCookiesString2(cookiesString) {
      if (Array.isArray(cookiesString)) {
        return cookiesString;
      }
      if (typeof cookiesString !== "string") {
        return [];
      }
      var cookiesStrings = [];
      var pos = 0;
      var start;
      var ch;
      var lastComma;
      var nextStart;
      var cookiesSeparatorFound;
      function skipWhitespace() {
        while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
          pos += 1;
        }
        return pos < cookiesString.length;
      }
      function notSpecialChar() {
        ch = cookiesString.charAt(pos);
        return ch !== "=" && ch !== ";" && ch !== ",";
      }
      while (pos < cookiesString.length) {
        start = pos;
        cookiesSeparatorFound = false;
        while (skipWhitespace()) {
          ch = cookiesString.charAt(pos);
          if (ch === ",") {
            lastComma = pos;
            pos += 1;
            skipWhitespace();
            nextStart = pos;
            while (pos < cookiesString.length && notSpecialChar()) {
              pos += 1;
            }
            if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
              cookiesSeparatorFound = true;
              pos = nextStart;
              cookiesStrings.push(cookiesString.substring(start, lastComma));
              start = pos;
            } else {
              pos = lastComma + 1;
            }
          } else {
            pos += 1;
          }
        }
        if (!cookiesSeparatorFound || pos >= cookiesString.length) {
          cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
        }
      }
      return cookiesStrings;
    }
    module.exports = parse2;
    module.exports.parse = parse2;
    module.exports.parseString = parseString;
    module.exports.splitCookiesString = splitCookiesString2;
  }
});
var import_set_cookie_parser = __toESM$1(require_set_cookie());
var HEADERS_INVALID_CHARACTERS = /[^a-z0-9\-#$%&'*+.^_`|~]/i;
function normalizeHeaderName(name) {
  if (HEADERS_INVALID_CHARACTERS.test(name) || name.trim() === "") {
    throw new TypeError("Invalid character in header field name");
  }
  return name.trim().toLowerCase();
}
var charCodesToRemove = [
  String.fromCharCode(10),
  String.fromCharCode(13),
  String.fromCharCode(9),
  String.fromCharCode(32)
];
var HEADER_VALUE_REMOVE_REGEXP = new RegExp(
  `(^[${charCodesToRemove.join("")}]|$[${charCodesToRemove.join("")}])`,
  "g"
);
function normalizeHeaderValue(value) {
  const nextValue = value.replace(HEADER_VALUE_REMOVE_REGEXP, "");
  return nextValue;
}
function isValidHeaderName(value) {
  if (typeof value !== "string") {
    return false;
  }
  if (value.length === 0) {
    return false;
  }
  for (let i = 0; i < value.length; i++) {
    const character = value.charCodeAt(i);
    if (character > 127 || !isToken(character)) {
      return false;
    }
  }
  return true;
}
function isToken(value) {
  return ![
    127,
    32,
    "(",
    ")",
    "<",
    ">",
    "@",
    ",",
    ";",
    ":",
    "\\",
    '"',
    "/",
    "[",
    "]",
    "?",
    "=",
    "{",
    "}"
  ].includes(value);
}
function isValidHeaderValue(value) {
  if (typeof value !== "string") {
    return false;
  }
  if (value.trim() !== value) {
    return false;
  }
  for (let i = 0; i < value.length; i++) {
    const character = value.charCodeAt(i);
    if (
      // NUL.
      character === 0 || // HTTP newline bytes.
      character === 10 || character === 13
    ) {
      return false;
    }
  }
  return true;
}
var NORMALIZED_HEADERS = Symbol("normalizedHeaders");
var RAW_HEADER_NAMES = Symbol("rawHeaderNames");
var HEADER_VALUE_DELIMITER = ", ";
var _a, _b, _c;
var Headers$1 = class _Headers {
  constructor(init) {
    this[_a] = {};
    this[_b] = /* @__PURE__ */ new Map();
    this[_c] = "Headers";
    if (["Headers", "HeadersPolyfill"].includes(init == null ? void 0 : init.constructor.name) || init instanceof _Headers || typeof globalThis.Headers !== "undefined" && init instanceof globalThis.Headers) {
      const initialHeaders = init;
      initialHeaders.forEach((value, name) => {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(init)) {
      init.forEach(([name, value]) => {
        this.append(
          name,
          Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value
        );
      });
    } else if (init) {
      Object.getOwnPropertyNames(init).forEach((name) => {
        const value = init[name];
        this.append(
          name,
          Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value
        );
      });
    }
  }
  [(_a = NORMALIZED_HEADERS, _b = RAW_HEADER_NAMES, _c = Symbol.toStringTag, Symbol.iterator)]() {
    return this.entries();
  }
  *keys() {
    for (const [name] of this.entries()) {
      yield name;
    }
  }
  *values() {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }
  *entries() {
    let sortedKeys = Object.keys(this[NORMALIZED_HEADERS]).sort(
      (a, b) => a.localeCompare(b)
    );
    for (const name of sortedKeys) {
      if (name === "set-cookie") {
        for (const value of this.getSetCookie()) {
          yield [name, value];
        }
      } else {
        yield [name, this.get(name)];
      }
    }
  }
  /**
   * Returns a boolean stating whether a `Headers` object contains a certain header.
   */
  has(name) {
    if (!isValidHeaderName(name)) {
      throw new TypeError(`Invalid header name "${name}"`);
    }
    return this[NORMALIZED_HEADERS].hasOwnProperty(normalizeHeaderName(name));
  }
  /**
   * Returns a `ByteString` sequence of all the values of a header with a given name.
   */
  get(name) {
    if (!isValidHeaderName(name)) {
      throw TypeError(`Invalid header name "${name}"`);
    }
    return this[NORMALIZED_HEADERS][normalizeHeaderName(name)] ?? null;
  }
  /**
   * Sets a new value for an existing header inside a `Headers` object, or adds the header if it does not already exist.
   */
  set(name, value) {
    if (!isValidHeaderName(name) || !isValidHeaderValue(value)) {
      return;
    }
    const normalizedName = normalizeHeaderName(name);
    const normalizedValue = normalizeHeaderValue(value);
    this[NORMALIZED_HEADERS][normalizedName] = normalizeHeaderValue(normalizedValue);
    this[RAW_HEADER_NAMES].set(normalizedName, name);
  }
  /**
   * Appends a new value onto an existing header inside a `Headers` object, or adds the header if it does not already exist.
   */
  append(name, value) {
    if (!isValidHeaderName(name) || !isValidHeaderValue(value)) {
      return;
    }
    const normalizedName = normalizeHeaderName(name);
    const normalizedValue = normalizeHeaderValue(value);
    let resolvedValue = this.has(normalizedName) ? `${this.get(normalizedName)}, ${normalizedValue}` : normalizedValue;
    this.set(name, resolvedValue);
  }
  /**
   * Deletes a header from the `Headers` object.
   */
  delete(name) {
    if (!isValidHeaderName(name)) {
      return;
    }
    if (!this.has(name)) {
      return;
    }
    const normalizedName = normalizeHeaderName(name);
    delete this[NORMALIZED_HEADERS][normalizedName];
    this[RAW_HEADER_NAMES].delete(normalizedName);
  }
  /**
   * Traverses the `Headers` object,
   * calling the given callback for each header.
   */
  forEach(callback, thisArg) {
    for (const [name, value] of this.entries()) {
      callback.call(thisArg, value, name, this);
    }
  }
  /**
   * Returns an array containing the values
   * of all Set-Cookie headers associated
   * with a response
   */
  getSetCookie() {
    const setCookieHeader = this.get("set-cookie");
    if (setCookieHeader === null) {
      return [];
    }
    if (setCookieHeader === "") {
      return [""];
    }
    return (0, import_set_cookie_parser.splitCookiesString)(setCookieHeader);
  }
};
const { message: message$1 } = source_default$1;
const kSetCookie = Symbol("kSetCookie");
function normalizeResponseInit(init = {}) {
  const status = (init == null ? void 0 : init.status) || 200;
  const statusText = (init == null ? void 0 : init.statusText) || message$1[status] || "";
  const headers = new Headers(init == null ? void 0 : init.headers);
  return {
    ...init,
    headers,
    status,
    statusText
  };
}
function decorateResponse(response, init) {
  if (init.type) {
    Object.defineProperty(response, "type", {
      value: init.type,
      enumerable: true,
      writable: false
    });
  }
  const responseCookies = init.headers.get("set-cookie");
  if (responseCookies) {
    Object.defineProperty(response, kSetCookie, {
      value: responseCookies,
      enumerable: false,
      writable: false
    });
    if (typeof document !== "undefined") {
      const responseCookiePairs = Headers$1.prototype.getSetCookie.call(
        init.headers
      );
      for (const cookieString of responseCookiePairs) {
        document.cookie = cookieString;
      }
    }
  }
  return response;
}
function storeResponseCookies(request, response) {
  const responseCookies = Reflect.get(response, kSetCookie);
  if (responseCookies) {
    cookieStore.setCookie(responseCookies, request.url);
  }
}
async function handleRequest(request, requestId, handlers2, options, emitter, handleRequestOptions) {
  var _a3, _b3, _c3, _d, _e, _f;
  emitter.emit("request:start", { request, requestId });
  if ((_a3 = request.headers.get("accept")) == null ? void 0 : _a3.includes("msw/passthrough")) {
    emitter.emit("request:end", { request, requestId });
    (_b3 = handleRequestOptions == null ? void 0 : handleRequestOptions.onPassthroughResponse) == null ? void 0 : _b3.call(handleRequestOptions, request);
    return;
  }
  const lookupResult = await until$1(() => {
    return executeHandlers({
      request,
      requestId,
      handlers: handlers2,
      resolutionContext: handleRequestOptions == null ? void 0 : handleRequestOptions.resolutionContext
    });
  });
  if (lookupResult.error) {
    emitter.emit("unhandledException", {
      error: lookupResult.error,
      request,
      requestId
    });
    throw lookupResult.error;
  }
  if (!lookupResult.data) {
    await onUnhandledRequest(request, options.onUnhandledRequest);
    emitter.emit("request:unhandled", { request, requestId });
    emitter.emit("request:end", { request, requestId });
    (_c3 = handleRequestOptions == null ? void 0 : handleRequestOptions.onPassthroughResponse) == null ? void 0 : _c3.call(handleRequestOptions, request);
    return;
  }
  const { response } = lookupResult.data;
  if (!response) {
    emitter.emit("request:end", { request, requestId });
    (_d = handleRequestOptions == null ? void 0 : handleRequestOptions.onPassthroughResponse) == null ? void 0 : _d.call(handleRequestOptions, request);
    return;
  }
  if (response.status === 302 && response.headers.get("x-msw-intention") === "passthrough") {
    emitter.emit("request:end", { request, requestId });
    (_e = handleRequestOptions == null ? void 0 : handleRequestOptions.onPassthroughResponse) == null ? void 0 : _e.call(handleRequestOptions, request);
    return;
  }
  storeResponseCookies(request, response);
  emitter.emit("request:match", { request, requestId });
  const requiredLookupResult = lookupResult.data;
  (_f = handleRequestOptions == null ? void 0 : handleRequestOptions.onMockedResponse) == null ? void 0 : _f.call(handleRequestOptions, response, requiredLookupResult);
  emitter.emit("request:end", { request, requestId });
  return response;
}
function toResponseInit(response) {
  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  };
}
function isHandlerKind(kind) {
  return (input) => {
    return input != null && typeof input === "object" && "__kind" in input && input.__kind === kind;
  };
}
function isObject$1(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}
function mergeRight(left, right) {
  return Object.entries(right).reduce(
    (result, [key, rightValue]) => {
      const leftValue = result[key];
      if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
        result[key] = leftValue.concat(rightValue);
        return result;
      }
      if (isObject$1(leftValue) && isObject$1(rightValue)) {
        result[key] = mergeRight(leftValue, rightValue);
        return result;
      }
      result[key] = rightValue;
      return result;
    },
    Object.assign({}, left)
  );
}
var MemoryLeakError$1 = class MemoryLeakError extends Error {
  constructor(emitter, type, count) {
    super(
      `Possible EventEmitter memory leak detected. ${count} ${type.toString()} listeners added. Use emitter.setMaxListeners() to increase limit`
    );
    this.emitter = emitter;
    this.type = type;
    this.count = count;
    this.name = "MaxListenersExceededWarning";
  }
};
var _Emitter$1 = class _Emitter {
  static listenerCount(emitter, eventName) {
    return emitter.listenerCount(eventName);
  }
  constructor() {
    this.events = /* @__PURE__ */ new Map();
    this.maxListeners = _Emitter$1.defaultMaxListeners;
    this.hasWarnedAboutPotentialMemoryLeak = false;
  }
  _emitInternalEvent(internalEventName, eventName, listener) {
    this.emit(
      internalEventName,
      ...[eventName, listener]
    );
  }
  _getListeners(eventName) {
    return Array.prototype.concat.apply([], this.events.get(eventName)) || [];
  }
  _removeListener(listeners, listener) {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    return [];
  }
  _wrapOnceListener(eventName, listener) {
    const onceListener = (...data) => {
      this.removeListener(eventName, onceListener);
      return listener.apply(this, data);
    };
    Object.defineProperty(onceListener, "name", { value: listener.name });
    return onceListener;
  }
  setMaxListeners(maxListeners) {
    this.maxListeners = maxListeners;
    return this;
  }
  /**
   * Returns the current max listener value for the `Emitter` which is
   * either set by `emitter.setMaxListeners(n)` or defaults to
   * `Emitter.defaultMaxListeners`.
   */
  getMaxListeners() {
    return this.maxListeners;
  }
  /**
   * Returns an array listing the events for which the emitter has registered listeners.
   * The values in the array will be strings or Symbols.
   */
  eventNames() {
    return Array.from(this.events.keys());
  }
  /**
   * Synchronously calls each of the listeners registered for the event named `eventName`,
   * in the order they were registered, passing the supplied arguments to each.
   * Returns `true` if the event has listeners, `false` otherwise.
   *
   * @example
   * const emitter = new Emitter<{ hello: [string] }>()
   * emitter.emit('hello', 'John')
   */
  emit(eventName, ...data) {
    const listeners = this._getListeners(eventName);
    listeners.forEach((listener) => {
      listener.apply(this, data);
    });
    return listeners.length > 0;
  }
  addListener(eventName, listener) {
    this._emitInternalEvent("newListener", eventName, listener);
    const nextListeners = this._getListeners(eventName).concat(listener);
    this.events.set(eventName, nextListeners);
    if (this.maxListeners > 0 && this.listenerCount(eventName) > this.maxListeners && !this.hasWarnedAboutPotentialMemoryLeak) {
      this.hasWarnedAboutPotentialMemoryLeak = true;
      const memoryLeakWarning = new MemoryLeakError$1(
        this,
        eventName,
        this.listenerCount(eventName)
      );
      console.warn(memoryLeakWarning);
    }
    return this;
  }
  on(eventName, listener) {
    return this.addListener(eventName, listener);
  }
  once(eventName, listener) {
    return this.addListener(
      eventName,
      this._wrapOnceListener(eventName, listener)
    );
  }
  prependListener(eventName, listener) {
    const listeners = this._getListeners(eventName);
    if (listeners.length > 0) {
      const nextListeners = [listener].concat(listeners);
      this.events.set(eventName, nextListeners);
    } else {
      this.events.set(eventName, listeners.concat(listener));
    }
    return this;
  }
  prependOnceListener(eventName, listener) {
    return this.prependListener(
      eventName,
      this._wrapOnceListener(eventName, listener)
    );
  }
  removeListener(eventName, listener) {
    const listeners = this._getListeners(eventName);
    if (listeners.length > 0) {
      this._removeListener(listeners, listener);
      this.events.set(eventName, listeners);
      this._emitInternalEvent("removeListener", eventName, listener);
    }
    return this;
  }
  /**
   * Alias for `emitter.removeListener()`.
   *
   * @example
   * emitter.off('hello', listener)
   */
  off(eventName, listener) {
    return this.removeListener(eventName, listener);
  }
  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
    return this;
  }
  /**
   * Returns a copy of the array of listeners for the event named `eventName`.
   */
  listeners(eventName) {
    return Array.from(this._getListeners(eventName));
  }
  /**
   * Returns the number of listeners listening to the event named `eventName`.
   */
  listenerCount(eventName) {
    return this._getListeners(eventName).length;
  }
  rawListeners(eventName) {
    return this.listeners(eventName);
  }
};
var Emitter$1 = _Emitter$1;
Emitter$1.defaultMaxListeners = 10;
function pipeEvents(source, destination) {
  const rawEmit = source.emit;
  if (rawEmit._isPiped) {
    return;
  }
  const sourceEmit = function sourceEmit2(event, ...data) {
    destination.emit(event, ...data);
    return rawEmit.call(this, event, ...data);
  };
  sourceEmit._isPiped = true;
  source.emit = sourceEmit;
}
function toReadonlyArray(source) {
  const clone = [...source];
  Object.freeze(clone);
  return clone;
}
class Disposable {
  constructor() {
    __publicField(this, "subscriptions", []);
  }
  dispose() {
    let subscription;
    while (subscription = this.subscriptions.shift()) {
      subscription();
    }
  }
}
class InMemoryHandlersController {
  constructor(initialHandlers) {
    __publicField(this, "handlers");
    this.initialHandlers = initialHandlers;
    this.handlers = [...initialHandlers];
  }
  prepend(runtimeHandles) {
    this.handlers.unshift(...runtimeHandles);
  }
  reset(nextHandlers) {
    this.handlers = nextHandlers.length > 0 ? [...nextHandlers] : [...this.initialHandlers];
  }
  currentHandlers() {
    return this.handlers;
  }
}
class SetupApi extends Disposable {
  constructor(...initialHandlers) {
    super();
    __publicField(this, "handlersController");
    __publicField(this, "emitter");
    __publicField(this, "publicEmitter");
    __publicField(this, "events");
    invariant$1(
      this.validateHandlers(initialHandlers),
      devUtils.formatMessage(
        `Failed to apply given request handlers: invalid input. Did you forget to spread the request handlers Array?`
      )
    );
    this.handlersController = new InMemoryHandlersController(initialHandlers);
    this.emitter = new Emitter$1();
    this.publicEmitter = new Emitter$1();
    pipeEvents(this.emitter, this.publicEmitter);
    this.events = this.createLifeCycleEvents();
    this.subscriptions.push(() => {
      this.emitter.removeAllListeners();
      this.publicEmitter.removeAllListeners();
    });
  }
  validateHandlers(handlers2) {
    return handlers2.every((handler) => !Array.isArray(handler));
  }
  use(...runtimeHandlers) {
    invariant$1(
      this.validateHandlers(runtimeHandlers),
      devUtils.formatMessage(
        `Failed to call "use()" with the given request handlers: invalid input. Did you forget to spread the array of request handlers?`
      )
    );
    this.handlersController.prepend(runtimeHandlers);
  }
  restoreHandlers() {
    this.handlersController.currentHandlers().forEach((handler) => {
      if ("isUsed" in handler) {
        handler.isUsed = false;
      }
    });
  }
  resetHandlers(...nextHandlers) {
    this.handlersController.reset(nextHandlers);
  }
  listHandlers() {
    return toReadonlyArray(this.handlersController.currentHandlers());
  }
  createLifeCycleEvents() {
    return {
      on: (...args) => {
        return this.publicEmitter.on(...args);
      },
      removeListener: (...args) => {
        return this.publicEmitter.removeListener(...args);
      },
      removeAllListeners: (...args) => {
        return this.publicEmitter.removeAllListeners(...args);
      }
    };
  }
}
function hasConfigurableGlobal$1(propertyName) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, propertyName);
  if (typeof descriptor === "undefined") {
    return false;
  }
  if (typeof descriptor.get === "function" && typeof descriptor.get() === "undefined") {
    return false;
  }
  if (typeof descriptor.get === "undefined" && descriptor.value == null) {
    return false;
  }
  if (typeof descriptor.set === "undefined" && !descriptor.configurable) {
    console.error(
      `[MSW] Failed to apply interceptor: the global \`${propertyName}\` property is non-configurable. This is likely an issue with your environment. If you are using a framework, please open an issue about this in their repository.`
    );
    return false;
  }
  return true;
}
var define_process_env_default$1 = {};
var __defProp$2 = Object.defineProperty;
var __export$1 = (target, all) => {
  for (var name in all)
    __defProp$2(target, name, { get: all[name], enumerable: true });
};
var colors_exports$1 = {};
__export$1(colors_exports$1, {
  blue: () => blue$1,
  gray: () => gray$1,
  green: () => green$1,
  red: () => red$1,
  yellow: () => yellow$1
});
function yellow$1(text) {
  return `\x1B[33m${text}\x1B[0m`;
}
function blue$1(text) {
  return `\x1B[34m${text}\x1B[0m`;
}
function gray$1(text) {
  return `\x1B[90m${text}\x1B[0m`;
}
function red$1(text) {
  return `\x1B[31m${text}\x1B[0m`;
}
function green$1(text) {
  return `\x1B[32m${text}\x1B[0m`;
}
var IS_NODE$1 = isNodeProcess$1();
var Logger$1 = class Logger {
  constructor(name) {
    __publicField(this, "prefix");
    this.name = name;
    this.prefix = `[${this.name}]`;
    const LOGGER_NAME = getVariable$1("DEBUG");
    const LOGGER_LEVEL = getVariable$1("LOG_LEVEL");
    const isLoggingEnabled = LOGGER_NAME === "1" || LOGGER_NAME === "true" || typeof LOGGER_NAME !== "undefined" && this.name.startsWith(LOGGER_NAME);
    if (isLoggingEnabled) {
      this.debug = isDefinedAndNotEquals$1(LOGGER_LEVEL, "debug") ? noop$1 : this.debug;
      this.info = isDefinedAndNotEquals$1(LOGGER_LEVEL, "info") ? noop$1 : this.info;
      this.success = isDefinedAndNotEquals$1(LOGGER_LEVEL, "success") ? noop$1 : this.success;
      this.warning = isDefinedAndNotEquals$1(LOGGER_LEVEL, "warning") ? noop$1 : this.warning;
      this.error = isDefinedAndNotEquals$1(LOGGER_LEVEL, "error") ? noop$1 : this.error;
    } else {
      this.info = noop$1;
      this.success = noop$1;
      this.warning = noop$1;
      this.error = noop$1;
      this.only = noop$1;
    }
  }
  extend(domain) {
    return new Logger$1(`${this.name}:${domain}`);
  }
  /**
   * Print a debug message.
   * @example
   * logger.debug('no duplicates found, creating a document...')
   */
  debug(message2, ...positionals) {
    this.logEntry({
      level: "debug",
      message: gray$1(message2),
      positionals,
      prefix: this.prefix,
      colors: {
        prefix: "gray"
      }
    });
  }
  /**
   * Print an info message.
   * @example
   * logger.info('start parsing...')
   */
  info(message2, ...positionals) {
    this.logEntry({
      level: "info",
      message: message2,
      positionals,
      prefix: this.prefix,
      colors: {
        prefix: "blue"
      }
    });
    const performance2 = new PerformanceEntry$1();
    return (message22, ...positionals2) => {
      performance2.measure();
      this.logEntry({
        level: "info",
        message: `${message22} ${gray$1(`${performance2.deltaTime}ms`)}`,
        positionals: positionals2,
        prefix: this.prefix,
        colors: {
          prefix: "blue"
        }
      });
    };
  }
  /**
   * Print a success message.
   * @example
   * logger.success('successfully created document')
   */
  success(message2, ...positionals) {
    this.logEntry({
      level: "info",
      message: message2,
      positionals,
      prefix: `✔ ${this.prefix}`,
      colors: {
        timestamp: "green",
        prefix: "green"
      }
    });
  }
  /**
   * Print a warning.
   * @example
   * logger.warning('found legacy document format')
   */
  warning(message2, ...positionals) {
    this.logEntry({
      level: "warning",
      message: message2,
      positionals,
      prefix: `⚠ ${this.prefix}`,
      colors: {
        timestamp: "yellow",
        prefix: "yellow"
      }
    });
  }
  /**
   * Print an error message.
   * @example
   * logger.error('something went wrong')
   */
  error(message2, ...positionals) {
    this.logEntry({
      level: "error",
      message: message2,
      positionals,
      prefix: `✖ ${this.prefix}`,
      colors: {
        timestamp: "red",
        prefix: "red"
      }
    });
  }
  /**
   * Execute the given callback only when the logging is enabled.
   * This is skipped in its entirety and has no runtime cost otherwise.
   * This executes regardless of the log level.
   * @example
   * logger.only(() => {
   *   logger.info('additional info')
   * })
   */
  only(callback) {
    callback();
  }
  createEntry(level, message2) {
    return {
      timestamp: /* @__PURE__ */ new Date(),
      level,
      message: message2
    };
  }
  logEntry(args) {
    const {
      level,
      message: message2,
      prefix,
      colors: customColors,
      positionals = []
    } = args;
    const entry = this.createEntry(level, message2);
    const timestampColor = (customColors == null ? void 0 : customColors.timestamp) || "gray";
    const prefixColor = (customColors == null ? void 0 : customColors.prefix) || "gray";
    const colorize = {
      timestamp: colors_exports$1[timestampColor],
      prefix: colors_exports$1[prefixColor]
    };
    const write = this.getWriter(level);
    write(
      [colorize.timestamp(this.formatTimestamp(entry.timestamp))].concat(prefix != null ? colorize.prefix(prefix) : []).concat(serializeInput$1(message2)).join(" "),
      ...positionals.map(serializeInput$1)
    );
  }
  formatTimestamp(timestamp) {
    return `${timestamp.toLocaleTimeString(
      "en-GB"
    )}:${timestamp.getMilliseconds()}`;
  }
  getWriter(level) {
    switch (level) {
      case "debug":
      case "success":
      case "info": {
        return log$1;
      }
      case "warning": {
        return warn$1;
      }
      case "error": {
        return error$1;
      }
    }
  }
};
var PerformanceEntry$1 = class PerformanceEntry {
  constructor() {
    __publicField(this, "startTime");
    __publicField(this, "endTime");
    __publicField(this, "deltaTime");
    this.startTime = performance.now();
  }
  measure() {
    this.endTime = performance.now();
    const deltaTime = this.endTime - this.startTime;
    this.deltaTime = deltaTime.toFixed(2);
  }
};
var noop$1 = () => void 0;
function log$1(message2, ...positionals) {
  if (IS_NODE$1) {
    process.stdout.write(format$1(message2, ...positionals) + "\n");
    return;
  }
  console.log(message2, ...positionals);
}
function warn$1(message2, ...positionals) {
  if (IS_NODE$1) {
    process.stderr.write(format$1(message2, ...positionals) + "\n");
    return;
  }
  console.warn(message2, ...positionals);
}
function error$1(message2, ...positionals) {
  if (IS_NODE$1) {
    process.stderr.write(format$1(message2, ...positionals) + "\n");
    return;
  }
  console.error(message2, ...positionals);
}
function getVariable$1(variableName) {
  var _a3;
  if (IS_NODE$1) {
    return define_process_env_default$1[variableName];
  }
  return (_a3 = globalThis[variableName]) == null ? void 0 : _a3.toString();
}
function isDefinedAndNotEquals$1(value, expected) {
  return value !== void 0 && value !== expected;
}
function serializeInput$1(message2) {
  if (typeof message2 === "undefined") {
    return "undefined";
  }
  if (message2 === null) {
    return "null";
  }
  if (typeof message2 === "string") {
    return message2;
  }
  if (typeof message2 === "object") {
    return JSON.stringify(message2);
  }
  return message2.toString();
}
function getGlobalSymbol$1(symbol) {
  return (
    // @ts-ignore https://github.com/Microsoft/TypeScript/issues/24587
    globalThis[symbol] || void 0
  );
}
function setGlobalSymbol$1(symbol, value) {
  globalThis[symbol] = value;
}
function deleteGlobalSymbol$1(symbol) {
  delete globalThis[symbol];
}
var Interceptor$1 = class Interceptor {
  constructor(symbol) {
    this.symbol = symbol;
    this.readyState = "INACTIVE";
    this.emitter = new Emitter$1();
    this.subscriptions = [];
    this.logger = new Logger$1(symbol.description);
    this.emitter.setMaxListeners(0);
    this.logger.info("constructing the interceptor...");
  }
  /**
   * Determine if this interceptor can be applied
   * in the current environment.
   */
  checkEnvironment() {
    return true;
  }
  /**
   * Apply this interceptor to the current process.
   * Returns an already running interceptor instance if it's present.
   */
  apply() {
    const logger = this.logger.extend("apply");
    logger.info("applying the interceptor...");
    if (this.readyState === "APPLIED") {
      logger.info("intercepted already applied!");
      return;
    }
    const shouldApply = this.checkEnvironment();
    if (!shouldApply) {
      logger.info("the interceptor cannot be applied in this environment!");
      return;
    }
    this.readyState = "APPLYING";
    const runningInstance = this.getInstance();
    if (runningInstance) {
      logger.info("found a running instance, reusing...");
      this.on = (event, listener) => {
        logger.info('proxying the "%s" listener', event);
        runningInstance.emitter.addListener(event, listener);
        this.subscriptions.push(() => {
          runningInstance.emitter.removeListener(event, listener);
          logger.info('removed proxied "%s" listener!', event);
        });
        return this;
      };
      this.readyState = "APPLIED";
      return;
    }
    logger.info("no running instance found, setting up a new instance...");
    this.setup();
    this.setInstance();
    this.readyState = "APPLIED";
  }
  /**
   * Setup the module augments and stubs necessary for this interceptor.
   * This method is not run if there's a running interceptor instance
   * to prevent instantiating an interceptor multiple times.
   */
  setup() {
  }
  /**
   * Listen to the interceptor's public events.
   */
  on(event, listener) {
    const logger = this.logger.extend("on");
    if (this.readyState === "DISPOSING" || this.readyState === "DISPOSED") {
      logger.info("cannot listen to events, already disposed!");
      return this;
    }
    logger.info('adding "%s" event listener:', event, listener);
    this.emitter.on(event, listener);
    return this;
  }
  once(event, listener) {
    this.emitter.once(event, listener);
    return this;
  }
  off(event, listener) {
    this.emitter.off(event, listener);
    return this;
  }
  removeAllListeners(event) {
    this.emitter.removeAllListeners(event);
    return this;
  }
  /**
   * Disposes of any side-effects this interceptor has introduced.
   */
  dispose() {
    const logger = this.logger.extend("dispose");
    if (this.readyState === "DISPOSED") {
      logger.info("cannot dispose, already disposed!");
      return;
    }
    logger.info("disposing the interceptor...");
    this.readyState = "DISPOSING";
    if (!this.getInstance()) {
      logger.info("no interceptors running, skipping dispose...");
      return;
    }
    this.clearInstance();
    logger.info("global symbol deleted:", getGlobalSymbol$1(this.symbol));
    if (this.subscriptions.length > 0) {
      logger.info("disposing of %d subscriptions...", this.subscriptions.length);
      for (const dispose of this.subscriptions) {
        dispose();
      }
      this.subscriptions = [];
      logger.info("disposed of all subscriptions!", this.subscriptions.length);
    }
    this.emitter.removeAllListeners();
    logger.info("destroyed the listener!");
    this.readyState = "DISPOSED";
  }
  getInstance() {
    var _a3;
    const instance = getGlobalSymbol$1(this.symbol);
    this.logger.info("retrieved global instance:", (_a3 = instance == null ? void 0 : instance.constructor) == null ? void 0 : _a3.name);
    return instance;
  }
  setInstance() {
    setGlobalSymbol$1(this.symbol, this);
    this.logger.info("set global instance!", this.symbol.description);
  }
  clearInstance() {
    deleteGlobalSymbol$1(this.symbol);
    this.logger.info("cleared global instance!", this.symbol.description);
  }
};
function createRequestId$1() {
  return Math.random().toString(16).slice(2);
}
function createDeferredExecutor$1() {
  const executor = (resolve, reject) => {
    executor.state = "pending";
    executor.resolve = (data) => {
      if (executor.state !== "pending") {
        return;
      }
      executor.result = data;
      const onFulfilled = (value) => {
        executor.state = "fulfilled";
        return value;
      };
      return resolve(
        data instanceof Promise ? data : Promise.resolve(data).then(onFulfilled)
      );
    };
    executor.reject = (reason) => {
      if (executor.state !== "pending") {
        return;
      }
      queueMicrotask(() => {
        executor.state = "rejected";
      });
      return reject(executor.rejectionReason = reason);
    };
  };
  return executor;
}
var DeferredPromise$1 = (_a2 = class extends Promise {
  constructor(executor = null) {
    const deferredExecutor = createDeferredExecutor$1();
    super((originalResolve, originalReject) => {
      deferredExecutor(originalResolve, originalReject);
      executor == null ? void 0 : executor(deferredExecutor.resolve, deferredExecutor.reject);
    });
    __privateAdd(this, _decorate);
    __privateAdd(this, _executor, void 0);
    __publicField(this, "resolve");
    __publicField(this, "reject");
    __privateSet(this, _executor, deferredExecutor);
    this.resolve = __privateGet(this, _executor).resolve;
    this.reject = __privateGet(this, _executor).reject;
  }
  get state() {
    return __privateGet(this, _executor).state;
  }
  get rejectionReason() {
    return __privateGet(this, _executor).rejectionReason;
  }
  then(onFulfilled, onRejected) {
    return __privateMethod(this, _decorate, decorate_fn).call(this, super.then(onFulfilled, onRejected));
  }
  catch(onRejected) {
    return __privateMethod(this, _decorate, decorate_fn).call(this, super.catch(onRejected));
  }
  finally(onfinally) {
    return __privateMethod(this, _decorate, decorate_fn).call(this, super.finally(onfinally));
  }
}, _executor = new WeakMap(), _decorate = new WeakSet(), decorate_fn = function(promise) {
  return Object.defineProperties(promise, {
    resolve: { configurable: true, value: this.resolve },
    reject: { configurable: true, value: this.reject }
  });
}, _a2);
function bindEvent(target, event) {
  Object.defineProperties(event, {
    target: {
      value: target,
      enumerable: true,
      writable: true
    },
    currentTarget: {
      value: target,
      enumerable: true,
      writable: true
    }
  });
  return event;
}
var kCancelable = Symbol("kCancelable");
var kDefaultPrevented = Symbol("kDefaultPrevented");
var CancelableMessageEvent = class extends MessageEvent {
  constructor(type, init) {
    super(type, init);
    this[kCancelable] = !!init.cancelable;
    this[kDefaultPrevented] = false;
  }
  get cancelable() {
    return this[kCancelable];
  }
  set cancelable(nextCancelable) {
    this[kCancelable] = nextCancelable;
  }
  get defaultPrevented() {
    return this[kDefaultPrevented];
  }
  set defaultPrevented(nextDefaultPrevented) {
    this[kDefaultPrevented] = nextDefaultPrevented;
  }
  preventDefault() {
    if (this.cancelable && !this[kDefaultPrevented]) {
      this[kDefaultPrevented] = true;
    }
  }
};
var CloseEvent = class extends Event {
  constructor(type, init = {}) {
    super(type, init);
    this.code = init.code === void 0 ? 0 : init.code;
    this.reason = init.reason === void 0 ? "" : init.reason;
    this.wasClean = init.wasClean === void 0 ? false : init.wasClean;
  }
};
var CancelableCloseEvent = class extends CloseEvent {
  constructor(type, init = {}) {
    super(type, init);
    this[kCancelable] = !!init.cancelable;
    this[kDefaultPrevented] = false;
  }
  get cancelable() {
    return this[kCancelable];
  }
  set cancelable(nextCancelable) {
    this[kCancelable] = nextCancelable;
  }
  get defaultPrevented() {
    return this[kDefaultPrevented];
  }
  set defaultPrevented(nextDefaultPrevented) {
    this[kDefaultPrevented] = nextDefaultPrevented;
  }
  preventDefault() {
    if (this.cancelable && !this[kDefaultPrevented]) {
      this[kDefaultPrevented] = true;
    }
  }
};
var kEmitter = Symbol("kEmitter");
var kBoundListener = Symbol("kBoundListener");
var WebSocketClientConnection = class {
  constructor(socket, transport) {
    this.socket = socket;
    this.transport = transport;
    this.id = createRequestId$1();
    this.url = new URL(socket.url);
    this[kEmitter] = new EventTarget();
    this.transport.addEventListener("outgoing", (event) => {
      const message2 = bindEvent(
        this.socket,
        new CancelableMessageEvent("message", {
          data: event.data,
          origin: event.origin,
          cancelable: true
        })
      );
      this[kEmitter].dispatchEvent(message2);
      if (message2.defaultPrevented) {
        event.preventDefault();
      }
    });
    this.transport.addEventListener("close", (event) => {
      this[kEmitter].dispatchEvent(
        bindEvent(this.socket, new CloseEvent("close", event))
      );
    });
  }
  /**
   * Listen for the outgoing events from the connected WebSocket client.
   */
  addEventListener(type, listener, options) {
    if (!Reflect.has(listener, kBoundListener)) {
      const boundListener = listener.bind(this.socket);
      Object.defineProperty(listener, kBoundListener, {
        value: boundListener,
        enumerable: false,
        configurable: false
      });
    }
    this[kEmitter].addEventListener(
      type,
      Reflect.get(listener, kBoundListener),
      options
    );
  }
  /**
   * Removes the listener for the given event.
   */
  removeEventListener(event, listener, options) {
    this[kEmitter].removeEventListener(
      event,
      Reflect.get(listener, kBoundListener),
      options
    );
  }
  /**
   * Send data to the connected client.
   */
  send(data) {
    this.transport.send(data);
  }
  /**
   * Close the WebSocket connection.
   * @param {number} code A status code (see https://www.rfc-editor.org/rfc/rfc6455#section-7.4.1).
   * @param {string} reason A custom connection close reason.
   */
  close(code, reason) {
    this.transport.close(code, reason);
  }
};
var WEBSOCKET_CLOSE_CODE_RANGE_ERROR = "InvalidAccessError: close code out of user configurable range";
var kPassthroughPromise = Symbol("kPassthroughPromise");
var kOnSend = Symbol("kOnSend");
var kClose = Symbol("kClose");
var WebSocketOverride = class extends EventTarget {
  constructor(url, protocols) {
    super();
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSING = 2;
    this.CLOSED = 3;
    this._onopen = null;
    this._onmessage = null;
    this._onerror = null;
    this._onclose = null;
    this.url = url.toString();
    this.protocol = "";
    this.extensions = "";
    this.binaryType = "blob";
    this.readyState = this.CONNECTING;
    this.bufferedAmount = 0;
    this[kPassthroughPromise] = new DeferredPromise$1();
    queueMicrotask(async () => {
      if (await this[kPassthroughPromise]) {
        return;
      }
      this.protocol = typeof protocols === "string" ? protocols : Array.isArray(protocols) && protocols.length > 0 ? protocols[0] : "";
      if (this.readyState === this.CONNECTING) {
        this.readyState = this.OPEN;
        this.dispatchEvent(bindEvent(this, new Event("open")));
      }
    });
  }
  set onopen(listener) {
    this.removeEventListener("open", this._onopen);
    this._onopen = listener;
    if (listener !== null) {
      this.addEventListener("open", listener);
    }
  }
  get onopen() {
    return this._onopen;
  }
  set onmessage(listener) {
    this.removeEventListener(
      "message",
      this._onmessage
    );
    this._onmessage = listener;
    if (listener !== null) {
      this.addEventListener("message", listener);
    }
  }
  get onmessage() {
    return this._onmessage;
  }
  set onerror(listener) {
    this.removeEventListener("error", this._onerror);
    this._onerror = listener;
    if (listener !== null) {
      this.addEventListener("error", listener);
    }
  }
  get onerror() {
    return this._onerror;
  }
  set onclose(listener) {
    this.removeEventListener("close", this._onclose);
    this._onclose = listener;
    if (listener !== null) {
      this.addEventListener("close", listener);
    }
  }
  get onclose() {
    return this._onclose;
  }
  /**
   * @see https://websockets.spec.whatwg.org/#ref-for-dom-websocket-send%E2%91%A0
   */
  send(data) {
    if (this.readyState === this.CONNECTING) {
      this.close();
      throw new DOMException("InvalidStateError");
    }
    if (this.readyState === this.CLOSING || this.readyState === this.CLOSED) {
      return;
    }
    this.bufferedAmount += getDataSize(data);
    queueMicrotask(() => {
      var _a3;
      this.bufferedAmount = 0;
      (_a3 = this[kOnSend]) == null ? void 0 : _a3.call(this, data);
    });
  }
  close(code = 1e3, reason) {
    invariant$1(code, WEBSOCKET_CLOSE_CODE_RANGE_ERROR);
    invariant$1(
      code === 1e3 || code >= 3e3 && code <= 4999,
      WEBSOCKET_CLOSE_CODE_RANGE_ERROR
    );
    this[kClose](code, reason);
  }
  [kClose](code = 1e3, reason, wasClean = true) {
    if (this.readyState === this.CLOSING || this.readyState === this.CLOSED) {
      return;
    }
    this.readyState = this.CLOSING;
    queueMicrotask(() => {
      this.readyState = this.CLOSED;
      this.dispatchEvent(
        bindEvent(
          this,
          new CloseEvent("close", {
            code,
            reason,
            wasClean
          })
        )
      );
      this._onopen = null;
      this._onmessage = null;
      this._onerror = null;
      this._onclose = null;
    });
  }
  addEventListener(type, listener, options) {
    return super.addEventListener(
      type,
      listener,
      options
    );
  }
  removeEventListener(type, callback, options) {
    return super.removeEventListener(type, callback, options);
  }
};
WebSocketOverride.CONNECTING = 0;
WebSocketOverride.OPEN = 1;
WebSocketOverride.CLOSING = 2;
WebSocketOverride.CLOSED = 3;
function getDataSize(data) {
  if (typeof data === "string") {
    return data.length;
  }
  if (data instanceof Blob) {
    return data.size;
  }
  return data.byteLength;
}
var kEmitter2 = Symbol("kEmitter");
var kBoundListener2 = Symbol("kBoundListener");
var kSend = Symbol("kSend");
var WebSocketServerConnection = class {
  constructor(client, transport, createConnection) {
    this.client = client;
    this.transport = transport;
    this.createConnection = createConnection;
    this[kEmitter2] = new EventTarget();
    this.mockCloseController = new AbortController();
    this.realCloseController = new AbortController();
    this.transport.addEventListener("outgoing", (event) => {
      if (typeof this.realWebSocket === "undefined") {
        return;
      }
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          this[kSend](event.data);
        }
      });
    });
    this.transport.addEventListener(
      "incoming",
      this.handleIncomingMessage.bind(this)
    );
  }
  /**
   * The `WebSocket` instance connected to the original server.
   * Accessing this before calling `server.connect()` will throw.
   */
  get socket() {
    invariant$1(
      this.realWebSocket,
      'Cannot access "socket" on the original WebSocket server object: the connection is not open. Did you forget to call `server.connect()`?'
    );
    return this.realWebSocket;
  }
  /**
   * Open connection to the original WebSocket server.
   */
  connect() {
    invariant$1(
      !this.realWebSocket || this.realWebSocket.readyState !== WebSocket.OPEN,
      'Failed to call "connect()" on the original WebSocket instance: the connection already open'
    );
    const realWebSocket = this.createConnection();
    realWebSocket.binaryType = this.client.binaryType;
    realWebSocket.addEventListener(
      "open",
      (event) => {
        this[kEmitter2].dispatchEvent(
          bindEvent(this.realWebSocket, new Event("open", event))
        );
      },
      { once: true }
    );
    realWebSocket.addEventListener("message", (event) => {
      this.transport.dispatchEvent(
        bindEvent(
          this.realWebSocket,
          new MessageEvent("incoming", {
            data: event.data,
            origin: event.origin
          })
        )
      );
    });
    this.client.addEventListener(
      "close",
      (event) => {
        this.handleMockClose(event);
      },
      {
        signal: this.mockCloseController.signal
      }
    );
    realWebSocket.addEventListener(
      "close",
      (event) => {
        this.handleRealClose(event);
      },
      {
        signal: this.realCloseController.signal
      }
    );
    realWebSocket.addEventListener("error", () => {
      const errorEvent = bindEvent(
        realWebSocket,
        new Event("error", { cancelable: true })
      );
      this[kEmitter2].dispatchEvent(errorEvent);
      if (!errorEvent.defaultPrevented) {
        this.client.dispatchEvent(bindEvent(this.client, new Event("error")));
      }
    });
    this.realWebSocket = realWebSocket;
  }
  /**
   * Listen for the incoming events from the original WebSocket server.
   */
  addEventListener(event, listener, options) {
    if (!Reflect.has(listener, kBoundListener2)) {
      const boundListener = listener.bind(this.client);
      Object.defineProperty(listener, kBoundListener2, {
        value: boundListener,
        enumerable: false
      });
    }
    this[kEmitter2].addEventListener(
      event,
      Reflect.get(listener, kBoundListener2),
      options
    );
  }
  /**
   * Remove the listener for the given event.
   */
  removeEventListener(event, listener, options) {
    this[kEmitter2].removeEventListener(
      event,
      Reflect.get(listener, kBoundListener2),
      options
    );
  }
  /**
   * Send data to the original WebSocket server.
   * @example
   * server.send('hello')
   * server.send(new Blob(['hello']))
   * server.send(new TextEncoder().encode('hello'))
   */
  send(data) {
    this[kSend](data);
  }
  [kSend](data) {
    const { realWebSocket } = this;
    invariant$1(
      realWebSocket,
      'Failed to call "server.send()" for "%s": the connection is not open. Did you forget to call "server.connect()"?',
      this.client.url
    );
    if (realWebSocket.readyState === WebSocket.CLOSING || realWebSocket.readyState === WebSocket.CLOSED) {
      return;
    }
    if (realWebSocket.readyState === WebSocket.CONNECTING) {
      realWebSocket.addEventListener(
        "open",
        () => {
          realWebSocket.send(data);
        },
        { once: true }
      );
      return;
    }
    realWebSocket.send(data);
  }
  /**
   * Close the actual server connection.
   */
  close() {
    const { realWebSocket } = this;
    invariant$1(
      realWebSocket,
      'Failed to close server connection for "%s": the connection is not open. Did you forget to call "server.connect()"?',
      this.client.url
    );
    this.realCloseController.abort();
    if (realWebSocket.readyState === WebSocket.CLOSING || realWebSocket.readyState === WebSocket.CLOSED) {
      return;
    }
    realWebSocket.close();
    queueMicrotask(() => {
      this[kEmitter2].dispatchEvent(
        bindEvent(
          this.realWebSocket,
          new CancelableCloseEvent("close", {
            /**
             * @note `server.close()` in the interceptor
             * always results in clean closures.
             */
            code: 1e3,
            cancelable: true
          })
        )
      );
    });
  }
  handleIncomingMessage(event) {
    const messageEvent = bindEvent(
      event.target,
      new CancelableMessageEvent("message", {
        data: event.data,
        origin: event.origin,
        cancelable: true
      })
    );
    this[kEmitter2].dispatchEvent(messageEvent);
    if (!messageEvent.defaultPrevented) {
      this.client.dispatchEvent(
        bindEvent(
          /**
           * @note Bind the forwarded original server events
           * to the mock WebSocket instance so it would
           * dispatch them straight away.
           */
          this.client,
          // Clone the message event again to prevent
          // the "already being dispatched" exception.
          new MessageEvent("message", {
            data: event.data,
            origin: event.origin
          })
        )
      );
    }
  }
  handleMockClose(_event) {
    if (this.realWebSocket) {
      this.realWebSocket.close();
    }
  }
  handleRealClose(event) {
    this.mockCloseController.abort();
    const closeEvent = bindEvent(
      this.realWebSocket,
      new CancelableCloseEvent("close", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        cancelable: true
      })
    );
    this[kEmitter2].dispatchEvent(closeEvent);
    if (!closeEvent.defaultPrevented) {
      this.client[kClose](event.code, event.reason);
    }
  }
};
var WebSocketClassTransport = class extends EventTarget {
  constructor(socket) {
    super();
    this.socket = socket;
    this.socket.addEventListener("close", (event) => {
      this.dispatchEvent(bindEvent(this.socket, new CloseEvent("close", event)));
    });
    this.socket[kOnSend] = (data) => {
      this.dispatchEvent(
        bindEvent(
          this.socket,
          // Dispatch this as cancelable because "client" connection
          // re-creates this message event (cannot dispatch the same event).
          new CancelableMessageEvent("outgoing", {
            data,
            origin: this.socket.url,
            cancelable: true
          })
        )
      );
    };
  }
  addEventListener(type, callback, options) {
    return super.addEventListener(type, callback, options);
  }
  dispatchEvent(event) {
    return super.dispatchEvent(event);
  }
  send(data) {
    queueMicrotask(() => {
      if (this.socket.readyState === this.socket.CLOSING || this.socket.readyState === this.socket.CLOSED) {
        return;
      }
      const dispatchEvent = () => {
        this.socket.dispatchEvent(
          bindEvent(
            /**
             * @note Setting this event's "target" to the
             * WebSocket override instance is important.
             * This way it can tell apart original incoming events
             * (must be forwarded to the transport) from the
             * mocked message events like the one below
             * (must be dispatched on the client instance).
             */
            this.socket,
            new MessageEvent("message", {
              data,
              origin: this.socket.url
            })
          )
        );
      };
      if (this.socket.readyState === this.socket.CONNECTING) {
        this.socket.addEventListener(
          "open",
          () => {
            dispatchEvent();
          },
          { once: true }
        );
      } else {
        dispatchEvent();
      }
    });
  }
  close(code, reason) {
    this.socket[kClose](code, reason);
  }
};
var _WebSocketInterceptor = class extends Interceptor$1 {
  constructor() {
    super(_WebSocketInterceptor.symbol);
  }
  checkEnvironment() {
    return hasConfigurableGlobal$1("WebSocket");
  }
  setup() {
    const originalWebSocketDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "WebSocket"
    );
    const WebSocketProxy = new Proxy(globalThis.WebSocket, {
      construct: (target, args, newTarget) => {
        const [url, protocols] = args;
        const createConnection = () => {
          return Reflect.construct(target, args, newTarget);
        };
        const socket = new WebSocketOverride(url, protocols);
        const transport = new WebSocketClassTransport(socket);
        queueMicrotask(() => {
          try {
            const server = new WebSocketServerConnection(
              socket,
              transport,
              createConnection
            );
            const hasConnectionListeners = this.emitter.emit("connection", {
              client: new WebSocketClientConnection(socket, transport),
              server,
              info: {
                protocols
              }
            });
            if (hasConnectionListeners) {
              socket[kPassthroughPromise].resolve(false);
            } else {
              socket[kPassthroughPromise].resolve(true);
              server.connect();
              server.addEventListener("open", () => {
                socket.dispatchEvent(bindEvent(socket, new Event("open")));
                if (server["realWebSocket"]) {
                  socket.protocol = server["realWebSocket"].protocol;
                }
              });
            }
          } catch (error2) {
            if (error2 instanceof Error) {
              socket.dispatchEvent(new Event("error"));
              if (socket.readyState !== WebSocket.CLOSING && socket.readyState !== WebSocket.CLOSED) {
                socket[kClose](1011, error2.message, false);
              }
              console.error(error2);
            }
          }
        });
        return socket;
      }
    });
    Object.defineProperty(globalThis, "WebSocket", {
      value: WebSocketProxy,
      configurable: true
    });
    this.subscriptions.push(() => {
      Object.defineProperty(
        globalThis,
        "WebSocket",
        originalWebSocketDescriptor
      );
    });
  }
};
var WebSocketInterceptor = _WebSocketInterceptor;
WebSocketInterceptor.symbol = Symbol("websocket");
const webSocketInterceptor = new WebSocketInterceptor();
new TextEncoder();
function canParseUrl$1(url) {
  try {
    new URL(url);
    return true;
  } catch (_error) {
    return false;
  }
}
function getValueBySymbol$1(symbolName, source) {
  const ownSymbols = Object.getOwnPropertySymbols(source);
  const symbol = ownSymbols.find((symbol2) => {
    return symbol2.description === symbolName;
  });
  if (symbol) {
    return Reflect.get(source, symbol);
  }
  return;
}
var _FetchResponse$1 = class _FetchResponse extends Response {
  static isConfigurableStatusCode(status) {
    return status >= 200 && status <= 599;
  }
  static isRedirectResponse(status) {
    return _FetchResponse$1.STATUS_CODES_WITH_REDIRECT.includes(status);
  }
  /**
   * Returns a boolean indicating whether the given response status
   * code represents a response that can have a body.
   */
  static isResponseWithBody(status) {
    return !_FetchResponse$1.STATUS_CODES_WITHOUT_BODY.includes(status);
  }
  static setUrl(url, response) {
    if (!url || url === "about:" || !canParseUrl$1(url)) {
      return;
    }
    const state = getValueBySymbol$1("state", response);
    if (state) {
      state.urlList.push(new URL(url));
    } else {
      Object.defineProperty(response, "url", {
        value: url,
        enumerable: true,
        configurable: true,
        writable: false
      });
    }
  }
  /**
   * Parses the given raw HTTP headers into a Fetch API `Headers` instance.
   */
  static parseRawHeaders(rawHeaders) {
    const headers = new Headers();
    for (let line = 0; line < rawHeaders.length; line += 2) {
      headers.append(rawHeaders[line], rawHeaders[line + 1]);
    }
    return headers;
  }
  constructor(body, init = {}) {
    var _a3;
    const status = (_a3 = init.status) != null ? _a3 : 200;
    const safeStatus = _FetchResponse$1.isConfigurableStatusCode(status) ? status : 200;
    const finalBody = _FetchResponse$1.isResponseWithBody(status) ? body : null;
    super(finalBody, {
      status: safeStatus,
      statusText: init.statusText,
      headers: init.headers
    });
    if (status !== safeStatus) {
      const state = getValueBySymbol$1("state", this);
      if (state) {
        state.status = status;
      } else {
        Object.defineProperty(this, "status", {
          value: status,
          enumerable: true,
          configurable: true,
          writable: false
        });
      }
    }
    _FetchResponse$1.setUrl(init.url, this);
  }
};
var FetchResponse$1 = _FetchResponse$1;
FetchResponse$1.STATUS_CODES_WITHOUT_BODY = [101, 103, 204, 205, 304];
FetchResponse$1.STATUS_CODES_WITH_REDIRECT = [301, 302, 303, 307, 308];
function getCleanUrl(url, isAbsolute = true) {
  return [isAbsolute && url.origin, url.pathname].filter(Boolean).join("");
}
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a3 = options.prefixes, prefixes = _a3 === void 0 ? "./" : _a3, _b3 = options.delimiter, delimiter = _b3 === void 0 ? "/#?" : _b3;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a4 = tokens[i], nextType = _a4.type, index = _a4.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a3 = options.decode, decode = _a3 === void 0 ? function(x) {
    return x;
  } : _a3;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a3 = options.strict, strict = _a3 === void 0 ? false : _a3, _b3 = options.start, start = _b3 === void 0 ? true : _b3, _c3 = options.end, end = _c3 === void 0 ? true : _c3, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
const REDUNDANT_CHARACTERS_EXP = /[\?|#].*$/g;
function getSearchParams(path) {
  return new URL(`/${path}`, "http://localhost").searchParams;
}
function cleanUrl(path) {
  if (path.endsWith("?")) {
    return path;
  }
  return path.replace(REDUNDANT_CHARACTERS_EXP, "");
}
function isAbsoluteUrl(url) {
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
}
function getAbsoluteUrl(path, baseUrl) {
  if (isAbsoluteUrl(path)) {
    return path;
  }
  if (path.startsWith("*")) {
    return path;
  }
  const origin = baseUrl || typeof location !== "undefined" && location.href;
  return origin ? (
    // Encode and decode the path to preserve escaped characters.
    decodeURI(new URL(encodeURI(path), origin).href)
  ) : path;
}
function normalizePath(path, baseUrl) {
  if (path instanceof RegExp) {
    return path;
  }
  const maybeAbsoluteUrl = getAbsoluteUrl(path, baseUrl);
  return cleanUrl(maybeAbsoluteUrl);
}
function coercePath(path) {
  return path.replace(
    /([:a-zA-Z_-]*)(\*{1,2})+/g,
    (_, parameterName, wildcard) => {
      const expression = "(.*)";
      if (!parameterName) {
        return expression;
      }
      return parameterName.startsWith(":") ? `${parameterName}${wildcard}` : `${parameterName}${expression}`;
    }
  ).replace(/([^\/])(:)(?=\d+)/, "$1\\$2").replace(/^([^\/]+)(:)(?=\/\/)/, "$1\\$2");
}
function matchRequestUrl(url, path, baseUrl) {
  const normalizedPath = normalizePath(path, baseUrl);
  const cleanPath = typeof normalizedPath === "string" ? coercePath(normalizedPath) : normalizedPath;
  const cleanUrl2 = getCleanUrl(url);
  const result = match(cleanPath, { decode: decodeURIComponent })(cleanUrl2);
  const params = result && result.params || {};
  return {
    matches: result !== false,
    params
  };
}
const kDispatchEvent = Symbol("kDispatchEvent");
function handleWebSocketEvent(options) {
  webSocketInterceptor.on("connection", async (connection) => {
    const handlers2 = options.getHandlers();
    const connectionEvent = new MessageEvent("connection", {
      data: connection
    });
    const matchingHandlers = [];
    for (const handler of handlers2) {
      if (isHandlerKind("EventHandler")(handler) && handler.predicate({
        event: connectionEvent,
        parsedResult: handler.parse({
          event: connectionEvent
        })
      })) {
        matchingHandlers.push(handler);
      }
    }
    if (matchingHandlers.length > 0) {
      options == null ? void 0 : options.onMockedConnection(connection);
      for (const handler of matchingHandlers) {
        handler[kDispatchEvent](connectionEvent);
      }
    } else {
      const request = new Request(connection.client.url, {
        headers: {
          upgrade: "websocket",
          connection: "upgrade"
        }
      });
      await onUnhandledRequest(
        request,
        options.getUnhandledRequestStrategy()
      ).catch((error2) => {
        const errorEvent = new Event("error");
        Object.defineProperty(errorEvent, "cause", {
          enumerable: true,
          configurable: false,
          value: error2
        });
        connection.client.socket.dispatchEvent(errorEvent);
      });
      options == null ? void 0 : options.onPassthroughConnection(connection);
      connection.server.connect();
    }
  });
}
function getTimestamp(options) {
  const now = /* @__PURE__ */ new Date();
  const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  if (options == null ? void 0 : options.milliseconds) {
    return `${timestamp}.${now.getMilliseconds().toString().padStart(3, "0")}`;
  }
  return timestamp;
}
function getMessageLength(data) {
  if (data instanceof Blob) {
    return data.size;
  }
  if (data instanceof ArrayBuffer) {
    return data.byteLength;
  }
  return new Blob([data]).size;
}
const MAX_LENGTH = 24;
function truncateMessage(message2) {
  if (message2.length <= MAX_LENGTH) {
    return message2;
  }
  return `${message2.slice(0, MAX_LENGTH)}…`;
}
async function getPublicData(data) {
  if (data instanceof Blob) {
    const text = await data.text();
    return `Blob(${truncateMessage(text)})`;
  }
  if (typeof data === "object" && "byteLength" in data) {
    const text = new TextDecoder().decode(data);
    return `ArrayBuffer(${truncateMessage(text)})`;
  }
  return truncateMessage(data);
}
const colors = {
  system: "#3b82f6",
  outgoing: "#22c55e",
  incoming: "#ef4444",
  mocked: "#ff6a33"
};
function attachWebSocketLogger(connection) {
  const { client, server } = connection;
  logConnectionOpen(client);
  client.addEventListener("message", (event) => {
    logOutgoingClientMessage(event);
  });
  client.addEventListener("close", (event) => {
    logConnectionClose(event);
  });
  client.socket.addEventListener("error", (event) => {
    logClientError(event);
  });
  client.send = new Proxy(client.send, {
    apply(target, thisArg, args) {
      const [data] = args;
      const messageEvent = new MessageEvent("message", { data });
      Object.defineProperties(messageEvent, {
        currentTarget: {
          enumerable: true,
          writable: false,
          value: client.socket
        },
        target: {
          enumerable: true,
          writable: false,
          value: client.socket
        }
      });
      queueMicrotask(() => {
        logIncomingMockedClientMessage(messageEvent);
      });
      return Reflect.apply(target, thisArg, args);
    }
  });
  server.addEventListener(
    "open",
    () => {
      server.addEventListener("message", (event) => {
        logIncomingServerMessage(event);
      });
    },
    { once: true }
  );
  server.send = new Proxy(server.send, {
    apply(target, thisArg, args) {
      const [data] = args;
      const messageEvent = new MessageEvent("message", { data });
      Object.defineProperties(messageEvent, {
        currentTarget: {
          enumerable: true,
          writable: false,
          value: server.socket
        },
        target: {
          enumerable: true,
          writable: false,
          value: server.socket
        }
      });
      logOutgoingMockedClientMessage(messageEvent);
      return Reflect.apply(target, thisArg, args);
    }
  });
}
function logConnectionOpen(client) {
  const publicUrl = toPublicUrl(client.url);
  console.groupCollapsed(
    devUtils.formatMessage(`${getTimestamp()} %c▶%c ${publicUrl}`),
    `color:${colors.system}`,
    "color:inherit"
  );
  console.log("Client:", client.socket);
  console.groupEnd();
}
function logConnectionClose(event) {
  const target = event.target;
  const publicUrl = toPublicUrl(target.url);
  console.groupCollapsed(
    devUtils.formatMessage(
      `${getTimestamp({ milliseconds: true })} %c■%c ${publicUrl}`
    ),
    `color:${colors.system}`,
    "color:inherit"
  );
  console.log(event);
  console.groupEnd();
}
function logClientError(event) {
  const socket = event.target;
  const publicUrl = toPublicUrl(socket.url);
  console.groupCollapsed(
    devUtils.formatMessage(
      `${getTimestamp({ milliseconds: true })} %c×%c ${publicUrl}`
    ),
    `color:${colors.system}`,
    "color:inherit"
  );
  console.log(event);
  console.groupEnd();
}
async function logOutgoingClientMessage(event) {
  const byteLength = getMessageLength(event.data);
  const publicData = await getPublicData(event.data);
  const arrow = event.defaultPrevented ? "⇡" : "⬆";
  console.groupCollapsed(
    devUtils.formatMessage(
      `${getTimestamp({ milliseconds: true })} %c${arrow}%c ${publicData} %c${byteLength}%c`
    ),
    `color:${colors.outgoing}`,
    "color:inherit",
    "color:gray;font-weight:normal",
    "color:inherit;font-weight:inherit"
  );
  console.log(event);
  console.groupEnd();
}
async function logOutgoingMockedClientMessage(event) {
  const byteLength = getMessageLength(event.data);
  const publicData = await getPublicData(event.data);
  console.groupCollapsed(
    devUtils.formatMessage(
      `${getTimestamp({ milliseconds: true })} %c⬆%c ${publicData} %c${byteLength}%c`
    ),
    `color:${colors.mocked}`,
    "color:inherit",
    "color:gray;font-weight:normal",
    "color:inherit;font-weight:inherit"
  );
  console.log(event);
  console.groupEnd();
}
async function logIncomingMockedClientMessage(event) {
  const byteLength = getMessageLength(event.data);
  const publicData = await getPublicData(event.data);
  console.groupCollapsed(
    devUtils.formatMessage(
      `${getTimestamp({ milliseconds: true })} %c⬇%c ${publicData} %c${byteLength}%c`
    ),
    `color:${colors.mocked}`,
    "color:inherit",
    "color:gray;font-weight:normal",
    "color:inherit;font-weight:inherit"
  );
  console.log(event);
  console.groupEnd();
}
async function logIncomingServerMessage(event) {
  const byteLength = getMessageLength(event.data);
  const publicData = await getPublicData(event.data);
  const arrow = event.defaultPrevented ? "⇣" : "⬇";
  console.groupCollapsed(
    devUtils.formatMessage(
      `${getTimestamp({ milliseconds: true })} %c${arrow}%c ${publicData} %c${byteLength}%c`
    ),
    `color:${colors.incoming}`,
    "color:inherit",
    "color:gray;font-weight:normal",
    "color:inherit;font-weight:inherit"
  );
  console.log(event);
  console.groupEnd();
}
var define_process_env_default = {};
var POSITIONALS_EXP = /(%?)(%([sdijo]))/g;
function serializePositional(positional, flag) {
  switch (flag) {
    case "s":
      return positional;
    case "d":
    case "i":
      return Number(positional);
    case "j":
      return JSON.stringify(positional);
    case "o": {
      if (typeof positional === "string") {
        return positional;
      }
      const json = JSON.stringify(positional);
      if (json === "{}" || json === "[]" || /^\[object .+?\]$/.test(json)) {
        return positional;
      }
      return json;
    }
  }
}
function format(message2, ...positionals) {
  if (positionals.length === 0) {
    return message2;
  }
  let positionalIndex = 0;
  let formattedMessage = message2.replace(
    POSITIONALS_EXP,
    (match2, isEscaped, _, flag) => {
      const positional = positionals[positionalIndex];
      const value = serializePositional(positional, flag);
      if (!isEscaped) {
        positionalIndex++;
        return value;
      }
      return match2;
    }
  );
  if (positionalIndex < positionals.length) {
    formattedMessage += ` ${positionals.slice(positionalIndex).join(" ")}`;
  }
  formattedMessage = formattedMessage.replace(/%{2,2}/g, "%");
  return formattedMessage;
}
var STACK_FRAMES_TO_IGNORE = 2;
function cleanErrorStack(error2) {
  if (!error2.stack) {
    return;
  }
  const nextStack = error2.stack.split("\n");
  nextStack.splice(1, STACK_FRAMES_TO_IGNORE);
  error2.stack = nextStack.join("\n");
}
var InvariantError2 = class extends Error {
  constructor(message2, ...positionals) {
    super(message2);
    this.message = message2;
    this.name = "Invariant Violation";
    this.message = format(message2, ...positionals);
    cleanErrorStack(this);
  }
};
var invariant = (predicate, message2, ...positionals) => {
  if (!predicate) {
    throw new InvariantError2(message2, ...positionals);
  }
};
invariant.as = (ErrorConstructor, predicate, message2, ...positionals) => {
  if (!predicate) {
    const formatMessage2 = positionals.length === 0 ? message2 : format(message2, ...positionals);
    let error2;
    try {
      error2 = Reflect.construct(ErrorConstructor, [
        formatMessage2
      ]);
    } catch (err) {
      error2 = ErrorConstructor(formatMessage2);
    }
    throw error2;
  }
};
function isNodeProcess() {
  if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
    return true;
  }
  if (typeof process !== "undefined") {
    const type = process.type;
    if (type === "renderer" || type === "worker") {
      return false;
    }
    return !!(process.versions && process.versions.node);
  }
  return false;
}
var until = async (promise) => {
  try {
    const data = await promise().catch((error2) => {
      throw error2;
    });
    return { error: null, data };
  } catch (error2) {
    return { error: error2, data: null };
  }
};
function getAbsoluteWorkerUrl(workerUrl) {
  return new URL(workerUrl, location.href).href;
}
function getWorkerByRegistration(registration, absoluteWorkerUrl, findWorker) {
  const allStates = [
    registration.active,
    registration.installing,
    registration.waiting
  ];
  const relevantStates = allStates.filter((state) => {
    return state != null;
  });
  const worker2 = relevantStates.find((worker22) => {
    return findWorker(worker22.scriptURL, absoluteWorkerUrl);
  });
  return worker2 || null;
}
var getWorkerInstance = async (url, options = {}, findWorker) => {
  const absoluteWorkerUrl = getAbsoluteWorkerUrl(url);
  const mockRegistrations = await navigator.serviceWorker.getRegistrations().then(
    (registrations) => registrations.filter(
      (registration) => getWorkerByRegistration(registration, absoluteWorkerUrl, findWorker)
    )
  );
  if (!navigator.serviceWorker.controller && mockRegistrations.length > 0) {
    location.reload();
  }
  const [existingRegistration] = mockRegistrations;
  if (existingRegistration) {
    existingRegistration.update();
    return [
      getWorkerByRegistration(
        existingRegistration,
        absoluteWorkerUrl,
        findWorker
      ),
      existingRegistration
    ];
  }
  const registrationResult = await until(
    async () => {
      const registration = await navigator.serviceWorker.register(url, options);
      return [
        // Compare existing worker registration by its worker URL,
        // to prevent irrelevant workers to resolve here (such as Codesandbox worker).
        getWorkerByRegistration(registration, absoluteWorkerUrl, findWorker),
        registration
      ];
    }
  );
  if (registrationResult.error) {
    const isWorkerMissing = registrationResult.error.message.includes("(404)");
    if (isWorkerMissing) {
      const scopeUrl = new URL((options == null ? void 0 : options.scope) || "/", location.href);
      throw new Error(
        devUtils.formatMessage(`Failed to register a Service Worker for scope ('${scopeUrl.href}') with script ('${absoluteWorkerUrl}'): Service Worker script does not exist at the given path.

Did you forget to run "npx msw init <PUBLIC_DIR>"?

Learn more about creating the Service Worker script: https://mswjs.io/docs/cli/init`)
      );
    }
    throw new Error(
      devUtils.formatMessage(
        "Failed to register the Service Worker:\n\n%s",
        registrationResult.error.message
      )
    );
  }
  return registrationResult.data;
};
function printStartMessage(args = {}) {
  if (args.quiet) {
    return;
  }
  const message2 = args.message || "Mocking enabled.";
  console.groupCollapsed(
    `%c${devUtils.formatMessage(message2)}`,
    "color:orangered;font-weight:bold;"
  );
  console.log(
    "%cDocumentation: %chttps://mswjs.io/docs",
    "font-weight:bold",
    "font-weight:normal"
  );
  console.log("Found an issue? https://github.com/mswjs/msw/issues");
  if (args.workerUrl) {
    console.log("Worker script URL:", args.workerUrl);
  }
  if (args.workerScope) {
    console.log("Worker scope:", args.workerScope);
  }
  if (args.client) {
    console.log("Client ID: %s (%s)", args.client.id, args.client.frameType);
  }
  console.groupEnd();
}
async function enableMocking(context, options) {
  var _a3, _b3;
  context.workerChannel.send("MOCK_ACTIVATE");
  const { payload } = await context.events.once("MOCKING_ENABLED");
  if (context.isMockingEnabled) {
    devUtils.warn(
      `Found a redundant "worker.start()" call. Note that starting the worker while mocking is already enabled will have no effect. Consider removing this "worker.start()" call.`
    );
    return;
  }
  context.isMockingEnabled = true;
  printStartMessage({
    quiet: options.quiet,
    workerScope: (_a3 = context.registration) == null ? void 0 : _a3.scope,
    workerUrl: (_b3 = context.worker) == null ? void 0 : _b3.scriptURL,
    client: payload.client
  });
}
var WorkerChannel = class {
  constructor(port) {
    this.port = port;
  }
  postMessage(event, ...rest) {
    const [data, transfer] = rest;
    this.port.postMessage({ type: event, data }, { transfer });
  }
};
function pruneGetRequestBody(request) {
  if (["HEAD", "GET"].includes(request.method)) {
    return void 0;
  }
  return request.body;
}
function parseWorkerRequest(incomingRequest) {
  return new Request(incomingRequest.url, {
    ...incomingRequest,
    body: pruneGetRequestBody(incomingRequest)
  });
}
var createRequestListener = (context, options) => {
  return async (event, message2) => {
    const messageChannel = new WorkerChannel(event.ports[0]);
    const requestId = message2.payload.id;
    const request = parseWorkerRequest(message2.payload);
    const requestCloneForLogs = request.clone();
    const requestClone = request.clone();
    RequestHandler.cache.set(request, requestClone);
    context.requests.set(requestId, requestClone);
    try {
      await handleRequest(
        request,
        requestId,
        context.getRequestHandlers().filter(isHandlerKind("RequestHandler")),
        options,
        context.emitter,
        {
          onPassthroughResponse() {
            messageChannel.postMessage("PASSTHROUGH");
          },
          async onMockedResponse(response, { handler, parsedResult }) {
            const responseClone = response.clone();
            const responseCloneForLogs = response.clone();
            const responseInit = toResponseInit(response);
            if (context.supports.readableStreamTransfer) {
              const responseStreamOrNull = response.body;
              messageChannel.postMessage(
                "MOCK_RESPONSE",
                {
                  ...responseInit,
                  body: responseStreamOrNull
                },
                responseStreamOrNull ? [responseStreamOrNull] : void 0
              );
            } else {
              const responseBufferOrNull = response.body === null ? null : await responseClone.arrayBuffer();
              messageChannel.postMessage("MOCK_RESPONSE", {
                ...responseInit,
                body: responseBufferOrNull
              });
            }
            if (!options.quiet) {
              context.emitter.once("response:mocked", () => {
                handler.log({
                  request: requestCloneForLogs,
                  response: responseCloneForLogs,
                  parsedResult
                });
              });
            }
          }
        }
      );
    } catch (error2) {
      if (error2 instanceof Error) {
        devUtils.error(
          `Uncaught exception in the request handler for "%s %s":

%s

This exception has been gracefully handled as a 500 response, however, it's strongly recommended to resolve this error, as it indicates a mistake in your code. If you wish to mock an error response, please see this guide: https://mswjs.io/docs/recipes/mocking-error-responses`,
          request.method,
          request.url,
          error2.stack ?? error2
        );
        messageChannel.postMessage("MOCK_RESPONSE", {
          status: 500,
          statusText: "Request Handler Error",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: error2.name,
            message: error2.message,
            stack: error2.stack
          })
        });
      }
    }
  };
};
async function checkWorkerIntegrity(context) {
  context.workerChannel.send("INTEGRITY_CHECK_REQUEST");
  const { payload } = await context.events.once("INTEGRITY_CHECK_RESPONSE");
  if (payload.checksum !== "00729d72e3b82faf54ca8b9621dbb96f") {
    devUtils.warn(
      `The currently registered Service Worker has been generated by a different version of MSW (${payload.packageVersion}) and may not be fully compatible with the installed version.

It's recommended you update your worker script by running this command:

  • npx msw init <PUBLIC_DIR>

You can also automate this process and make the worker script update automatically upon the library installations. Read more: https://mswjs.io/docs/cli/init.`
    );
  }
}
var encoder = new TextEncoder();
function encodeBuffer(text) {
  return encoder.encode(text);
}
function decodeBuffer(buffer, encoding) {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
}
function toArrayBuffer(array) {
  return array.buffer.slice(
    array.byteOffset,
    array.byteOffset + array.byteLength
  );
}
var IS_PATCHED_MODULE = Symbol("isPatchedModule");
function canParseUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (_error) {
    return false;
  }
}
function getValueBySymbol(symbolName, source) {
  const ownSymbols = Object.getOwnPropertySymbols(source);
  const symbol = ownSymbols.find((symbol2) => {
    return symbol2.description === symbolName;
  });
  if (symbol) {
    return Reflect.get(source, symbol);
  }
  return;
}
var _FetchResponse2 = class extends Response {
  static isConfigurableStatusCode(status) {
    return status >= 200 && status <= 599;
  }
  static isRedirectResponse(status) {
    return _FetchResponse2.STATUS_CODES_WITH_REDIRECT.includes(status);
  }
  /**
   * Returns a boolean indicating whether the given response status
   * code represents a response that can have a body.
   */
  static isResponseWithBody(status) {
    return !_FetchResponse2.STATUS_CODES_WITHOUT_BODY.includes(status);
  }
  static setUrl(url, response) {
    if (!url || url === "about:" || !canParseUrl(url)) {
      return;
    }
    const state = getValueBySymbol("state", response);
    if (state) {
      state.urlList.push(new URL(url));
    } else {
      Object.defineProperty(response, "url", {
        value: url,
        enumerable: true,
        configurable: true,
        writable: false
      });
    }
  }
  /**
   * Parses the given raw HTTP headers into a Fetch API `Headers` instance.
   */
  static parseRawHeaders(rawHeaders) {
    const headers = new Headers();
    for (let line = 0; line < rawHeaders.length; line += 2) {
      headers.append(rawHeaders[line], rawHeaders[line + 1]);
    }
    return headers;
  }
  constructor(body, init = {}) {
    var _a3;
    const status = (_a3 = init.status) != null ? _a3 : 200;
    const safeStatus = _FetchResponse2.isConfigurableStatusCode(status) ? status : 200;
    const finalBody = _FetchResponse2.isResponseWithBody(status) ? body : null;
    super(finalBody, {
      status: safeStatus,
      statusText: init.statusText,
      headers: init.headers
    });
    if (status !== safeStatus) {
      const state = getValueBySymbol("state", this);
      if (state) {
        state.status = status;
      } else {
        Object.defineProperty(this, "status", {
          value: status,
          enumerable: true,
          configurable: true,
          writable: false
        });
      }
    }
    _FetchResponse2.setUrl(init.url, this);
  }
};
var FetchResponse = _FetchResponse2;
FetchResponse.STATUS_CODES_WITHOUT_BODY = [101, 103, 204, 205, 304];
FetchResponse.STATUS_CODES_WITH_REDIRECT = [301, 302, 303, 307, 308];
var kRawRequest = Symbol("kRawRequest");
function setRawRequest(request, rawRequest) {
  Reflect.set(request, kRawRequest, rawRequest);
}
var __defProp$1 = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp$1(target, name, { get: all[name], enumerable: true });
};
var colors_exports = {};
__export(colors_exports, {
  blue: () => blue,
  gray: () => gray,
  green: () => green,
  red: () => red,
  yellow: () => yellow
});
function yellow(text) {
  return `\x1B[33m${text}\x1B[0m`;
}
function blue(text) {
  return `\x1B[34m${text}\x1B[0m`;
}
function gray(text) {
  return `\x1B[90m${text}\x1B[0m`;
}
function red(text) {
  return `\x1B[31m${text}\x1B[0m`;
}
function green(text) {
  return `\x1B[32m${text}\x1B[0m`;
}
var IS_NODE = isNodeProcess();
var Logger2 = class {
  constructor(name) {
    __publicField(this, "prefix");
    this.name = name;
    this.prefix = `[${this.name}]`;
    const LOGGER_NAME = getVariable("DEBUG");
    const LOGGER_LEVEL = getVariable("LOG_LEVEL");
    const isLoggingEnabled = LOGGER_NAME === "1" || LOGGER_NAME === "true" || typeof LOGGER_NAME !== "undefined" && this.name.startsWith(LOGGER_NAME);
    if (isLoggingEnabled) {
      this.debug = isDefinedAndNotEquals(LOGGER_LEVEL, "debug") ? noop : this.debug;
      this.info = isDefinedAndNotEquals(LOGGER_LEVEL, "info") ? noop : this.info;
      this.success = isDefinedAndNotEquals(LOGGER_LEVEL, "success") ? noop : this.success;
      this.warning = isDefinedAndNotEquals(LOGGER_LEVEL, "warning") ? noop : this.warning;
      this.error = isDefinedAndNotEquals(LOGGER_LEVEL, "error") ? noop : this.error;
    } else {
      this.info = noop;
      this.success = noop;
      this.warning = noop;
      this.error = noop;
      this.only = noop;
    }
  }
  extend(domain) {
    return new Logger2(`${this.name}:${domain}`);
  }
  /**
   * Print a debug message.
   * @example
   * logger.debug('no duplicates found, creating a document...')
   */
  debug(message2, ...positionals) {
    this.logEntry({
      level: "debug",
      message: gray(message2),
      positionals,
      prefix: this.prefix,
      colors: {
        prefix: "gray"
      }
    });
  }
  /**
   * Print an info message.
   * @example
   * logger.info('start parsing...')
   */
  info(message2, ...positionals) {
    this.logEntry({
      level: "info",
      message: message2,
      positionals,
      prefix: this.prefix,
      colors: {
        prefix: "blue"
      }
    });
    const performance2 = new PerformanceEntry2();
    return (message22, ...positionals2) => {
      performance2.measure();
      this.logEntry({
        level: "info",
        message: `${message22} ${gray(`${performance2.deltaTime}ms`)}`,
        positionals: positionals2,
        prefix: this.prefix,
        colors: {
          prefix: "blue"
        }
      });
    };
  }
  /**
   * Print a success message.
   * @example
   * logger.success('successfully created document')
   */
  success(message2, ...positionals) {
    this.logEntry({
      level: "info",
      message: message2,
      positionals,
      prefix: `✔ ${this.prefix}`,
      colors: {
        timestamp: "green",
        prefix: "green"
      }
    });
  }
  /**
   * Print a warning.
   * @example
   * logger.warning('found legacy document format')
   */
  warning(message2, ...positionals) {
    this.logEntry({
      level: "warning",
      message: message2,
      positionals,
      prefix: `⚠ ${this.prefix}`,
      colors: {
        timestamp: "yellow",
        prefix: "yellow"
      }
    });
  }
  /**
   * Print an error message.
   * @example
   * logger.error('something went wrong')
   */
  error(message2, ...positionals) {
    this.logEntry({
      level: "error",
      message: message2,
      positionals,
      prefix: `✖ ${this.prefix}`,
      colors: {
        timestamp: "red",
        prefix: "red"
      }
    });
  }
  /**
   * Execute the given callback only when the logging is enabled.
   * This is skipped in its entirety and has no runtime cost otherwise.
   * This executes regardless of the log level.
   * @example
   * logger.only(() => {
   *   logger.info('additional info')
   * })
   */
  only(callback) {
    callback();
  }
  createEntry(level, message2) {
    return {
      timestamp: /* @__PURE__ */ new Date(),
      level,
      message: message2
    };
  }
  logEntry(args) {
    const {
      level,
      message: message2,
      prefix,
      colors: customColors,
      positionals = []
    } = args;
    const entry = this.createEntry(level, message2);
    const timestampColor = (customColors == null ? void 0 : customColors.timestamp) || "gray";
    const prefixColor = (customColors == null ? void 0 : customColors.prefix) || "gray";
    const colorize = {
      timestamp: colors_exports[timestampColor],
      prefix: colors_exports[prefixColor]
    };
    const write = this.getWriter(level);
    write(
      [colorize.timestamp(this.formatTimestamp(entry.timestamp))].concat(prefix != null ? colorize.prefix(prefix) : []).concat(serializeInput(message2)).join(" "),
      ...positionals.map(serializeInput)
    );
  }
  formatTimestamp(timestamp) {
    return `${timestamp.toLocaleTimeString(
      "en-GB"
    )}:${timestamp.getMilliseconds()}`;
  }
  getWriter(level) {
    switch (level) {
      case "debug":
      case "success":
      case "info": {
        return log;
      }
      case "warning": {
        return warn;
      }
      case "error": {
        return error;
      }
    }
  }
};
var PerformanceEntry2 = class {
  constructor() {
    __publicField(this, "startTime");
    __publicField(this, "endTime");
    __publicField(this, "deltaTime");
    this.startTime = performance.now();
  }
  measure() {
    this.endTime = performance.now();
    const deltaTime = this.endTime - this.startTime;
    this.deltaTime = deltaTime.toFixed(2);
  }
};
var noop = () => void 0;
function log(message2, ...positionals) {
  if (IS_NODE) {
    process.stdout.write(format(message2, ...positionals) + "\n");
    return;
  }
  console.log(message2, ...positionals);
}
function warn(message2, ...positionals) {
  if (IS_NODE) {
    process.stderr.write(format(message2, ...positionals) + "\n");
    return;
  }
  console.warn(message2, ...positionals);
}
function error(message2, ...positionals) {
  if (IS_NODE) {
    process.stderr.write(format(message2, ...positionals) + "\n");
    return;
  }
  console.error(message2, ...positionals);
}
function getVariable(variableName) {
  var _a3;
  if (IS_NODE) {
    return define_process_env_default[variableName];
  }
  return (_a3 = globalThis[variableName]) == null ? void 0 : _a3.toString();
}
function isDefinedAndNotEquals(value, expected) {
  return value !== void 0 && value !== expected;
}
function serializeInput(message2) {
  if (typeof message2 === "undefined") {
    return "undefined";
  }
  if (message2 === null) {
    return "null";
  }
  if (typeof message2 === "string") {
    return message2;
  }
  if (typeof message2 === "object") {
    return JSON.stringify(message2);
  }
  return message2.toString();
}
var MemoryLeakError2 = class extends Error {
  constructor(emitter, type, count) {
    super(
      `Possible EventEmitter memory leak detected. ${count} ${type.toString()} listeners added. Use emitter.setMaxListeners() to increase limit`
    );
    this.emitter = emitter;
    this.type = type;
    this.count = count;
    this.name = "MaxListenersExceededWarning";
  }
};
var _Emitter2 = class {
  static listenerCount(emitter, eventName) {
    return emitter.listenerCount(eventName);
  }
  constructor() {
    this.events = /* @__PURE__ */ new Map();
    this.maxListeners = _Emitter2.defaultMaxListeners;
    this.hasWarnedAboutPotentialMemoryLeak = false;
  }
  _emitInternalEvent(internalEventName, eventName, listener) {
    this.emit(
      internalEventName,
      ...[eventName, listener]
    );
  }
  _getListeners(eventName) {
    return Array.prototype.concat.apply([], this.events.get(eventName)) || [];
  }
  _removeListener(listeners, listener) {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    return [];
  }
  _wrapOnceListener(eventName, listener) {
    const onceListener = (...data) => {
      this.removeListener(eventName, onceListener);
      return listener.apply(this, data);
    };
    Object.defineProperty(onceListener, "name", { value: listener.name });
    return onceListener;
  }
  setMaxListeners(maxListeners) {
    this.maxListeners = maxListeners;
    return this;
  }
  /**
   * Returns the current max listener value for the `Emitter` which is
   * either set by `emitter.setMaxListeners(n)` or defaults to
   * `Emitter.defaultMaxListeners`.
   */
  getMaxListeners() {
    return this.maxListeners;
  }
  /**
   * Returns an array listing the events for which the emitter has registered listeners.
   * The values in the array will be strings or Symbols.
   */
  eventNames() {
    return Array.from(this.events.keys());
  }
  /**
   * Synchronously calls each of the listeners registered for the event named `eventName`,
   * in the order they were registered, passing the supplied arguments to each.
   * Returns `true` if the event has listeners, `false` otherwise.
   *
   * @example
   * const emitter = new Emitter<{ hello: [string] }>()
   * emitter.emit('hello', 'John')
   */
  emit(eventName, ...data) {
    const listeners = this._getListeners(eventName);
    listeners.forEach((listener) => {
      listener.apply(this, data);
    });
    return listeners.length > 0;
  }
  addListener(eventName, listener) {
    this._emitInternalEvent("newListener", eventName, listener);
    const nextListeners = this._getListeners(eventName).concat(listener);
    this.events.set(eventName, nextListeners);
    if (this.maxListeners > 0 && this.listenerCount(eventName) > this.maxListeners && !this.hasWarnedAboutPotentialMemoryLeak) {
      this.hasWarnedAboutPotentialMemoryLeak = true;
      const memoryLeakWarning = new MemoryLeakError2(
        this,
        eventName,
        this.listenerCount(eventName)
      );
      console.warn(memoryLeakWarning);
    }
    return this;
  }
  on(eventName, listener) {
    return this.addListener(eventName, listener);
  }
  once(eventName, listener) {
    return this.addListener(
      eventName,
      this._wrapOnceListener(eventName, listener)
    );
  }
  prependListener(eventName, listener) {
    const listeners = this._getListeners(eventName);
    if (listeners.length > 0) {
      const nextListeners = [listener].concat(listeners);
      this.events.set(eventName, nextListeners);
    } else {
      this.events.set(eventName, listeners.concat(listener));
    }
    return this;
  }
  prependOnceListener(eventName, listener) {
    return this.prependListener(
      eventName,
      this._wrapOnceListener(eventName, listener)
    );
  }
  removeListener(eventName, listener) {
    const listeners = this._getListeners(eventName);
    if (listeners.length > 0) {
      this._removeListener(listeners, listener);
      this.events.set(eventName, listeners);
      this._emitInternalEvent("removeListener", eventName, listener);
    }
    return this;
  }
  /**
   * Alias for `emitter.removeListener()`.
   *
   * @example
   * emitter.off('hello', listener)
   */
  off(eventName, listener) {
    return this.removeListener(eventName, listener);
  }
  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
    return this;
  }
  /**
   * Returns a copy of the array of listeners for the event named `eventName`.
   */
  listeners(eventName) {
    return Array.from(this._getListeners(eventName));
  }
  /**
   * Returns the number of listeners listening to the event named `eventName`.
   */
  listenerCount(eventName) {
    return this._getListeners(eventName).length;
  }
  rawListeners(eventName) {
    return this.listeners(eventName);
  }
};
var Emitter = _Emitter2;
Emitter.defaultMaxListeners = 10;
var INTERNAL_REQUEST_ID_HEADER_NAME = "x-interceptors-internal-request-id";
function getGlobalSymbol(symbol) {
  return (
    // @ts-ignore https://github.com/Microsoft/TypeScript/issues/24587
    globalThis[symbol] || void 0
  );
}
function setGlobalSymbol(symbol, value) {
  globalThis[symbol] = value;
}
function deleteGlobalSymbol(symbol) {
  delete globalThis[symbol];
}
var Interceptor2 = class {
  constructor(symbol) {
    this.symbol = symbol;
    this.readyState = "INACTIVE";
    this.emitter = new Emitter();
    this.subscriptions = [];
    this.logger = new Logger2(symbol.description);
    this.emitter.setMaxListeners(0);
    this.logger.info("constructing the interceptor...");
  }
  /**
   * Determine if this interceptor can be applied
   * in the current environment.
   */
  checkEnvironment() {
    return true;
  }
  /**
   * Apply this interceptor to the current process.
   * Returns an already running interceptor instance if it's present.
   */
  apply() {
    const logger = this.logger.extend("apply");
    logger.info("applying the interceptor...");
    if (this.readyState === "APPLIED") {
      logger.info("intercepted already applied!");
      return;
    }
    const shouldApply = this.checkEnvironment();
    if (!shouldApply) {
      logger.info("the interceptor cannot be applied in this environment!");
      return;
    }
    this.readyState = "APPLYING";
    const runningInstance = this.getInstance();
    if (runningInstance) {
      logger.info("found a running instance, reusing...");
      this.on = (event, listener) => {
        logger.info('proxying the "%s" listener', event);
        runningInstance.emitter.addListener(event, listener);
        this.subscriptions.push(() => {
          runningInstance.emitter.removeListener(event, listener);
          logger.info('removed proxied "%s" listener!', event);
        });
        return this;
      };
      this.readyState = "APPLIED";
      return;
    }
    logger.info("no running instance found, setting up a new instance...");
    this.setup();
    this.setInstance();
    this.readyState = "APPLIED";
  }
  /**
   * Setup the module augments and stubs necessary for this interceptor.
   * This method is not run if there's a running interceptor instance
   * to prevent instantiating an interceptor multiple times.
   */
  setup() {
  }
  /**
   * Listen to the interceptor's public events.
   */
  on(event, listener) {
    const logger = this.logger.extend("on");
    if (this.readyState === "DISPOSING" || this.readyState === "DISPOSED") {
      logger.info("cannot listen to events, already disposed!");
      return this;
    }
    logger.info('adding "%s" event listener:', event, listener);
    this.emitter.on(event, listener);
    return this;
  }
  once(event, listener) {
    this.emitter.once(event, listener);
    return this;
  }
  off(event, listener) {
    this.emitter.off(event, listener);
    return this;
  }
  removeAllListeners(event) {
    this.emitter.removeAllListeners(event);
    return this;
  }
  /**
   * Disposes of any side-effects this interceptor has introduced.
   */
  dispose() {
    const logger = this.logger.extend("dispose");
    if (this.readyState === "DISPOSED") {
      logger.info("cannot dispose, already disposed!");
      return;
    }
    logger.info("disposing the interceptor...");
    this.readyState = "DISPOSING";
    if (!this.getInstance()) {
      logger.info("no interceptors running, skipping dispose...");
      return;
    }
    this.clearInstance();
    logger.info("global symbol deleted:", getGlobalSymbol(this.symbol));
    if (this.subscriptions.length > 0) {
      logger.info("disposing of %d subscriptions...", this.subscriptions.length);
      for (const dispose of this.subscriptions) {
        dispose();
      }
      this.subscriptions = [];
      logger.info("disposed of all subscriptions!", this.subscriptions.length);
    }
    this.emitter.removeAllListeners();
    logger.info("destroyed the listener!");
    this.readyState = "DISPOSED";
  }
  getInstance() {
    var _a3;
    const instance = getGlobalSymbol(this.symbol);
    this.logger.info("retrieved global instance:", (_a3 = instance == null ? void 0 : instance.constructor) == null ? void 0 : _a3.name);
    return instance;
  }
  setInstance() {
    setGlobalSymbol(this.symbol, this);
    this.logger.info("set global instance!", this.symbol.description);
  }
  clearInstance() {
    deleteGlobalSymbol(this.symbol);
    this.logger.info("cleared global instance!", this.symbol.description);
  }
};
function createRequestId() {
  return Math.random().toString(16).slice(2);
}
var BatchInterceptor = class extends Interceptor2 {
  constructor(options) {
    BatchInterceptor.symbol = Symbol(options.name);
    super(BatchInterceptor.symbol);
    this.interceptors = options.interceptors;
  }
  setup() {
    const logger = this.logger.extend("setup");
    logger.info("applying all %d interceptors...", this.interceptors.length);
    for (const interceptor of this.interceptors) {
      logger.info('applying "%s" interceptor...', interceptor.constructor.name);
      interceptor.apply();
      logger.info("adding interceptor dispose subscription");
      this.subscriptions.push(() => interceptor.dispose());
    }
  }
  on(event, listener) {
    for (const interceptor of this.interceptors) {
      interceptor.on(event, listener);
    }
    return this;
  }
  once(event, listener) {
    for (const interceptor of this.interceptors) {
      interceptor.once(event, listener);
    }
    return this;
  }
  off(event, listener) {
    for (const interceptor of this.interceptors) {
      interceptor.off(event, listener);
    }
    return this;
  }
  removeAllListeners(event) {
    for (const interceptors of this.interceptors) {
      interceptors.removeAllListeners(event);
    }
    return this;
  }
};
function createResponseListener(context) {
  return (_, message2) => {
    var _a3;
    const { payload: responseJson } = message2;
    const { requestId } = responseJson;
    const request = context.requests.get(requestId);
    context.requests.delete(requestId);
    if ((_a3 = responseJson.type) == null ? void 0 : _a3.includes("opaque")) {
      return;
    }
    const response = responseJson.status === 0 ? Response.error() : new FetchResponse(
      /**
       * Responses may be streams here, but when we create a response object
       * with null-body status codes, like 204, 205, 304 Response will
       * throw when passed a non-null body, so ensure it's null here
       * for those codes
       */
      FetchResponse.isResponseWithBody(responseJson.status) ? responseJson.body : null,
      {
        ...responseJson,
        /**
         * Set response URL if it's not set already.
         * @see https://github.com/mswjs/msw/issues/2030
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Response/url
         */
        url: request.url
      }
    );
    context.emitter.emit(
      responseJson.isMockedResponse ? "response:mocked" : "response:bypass",
      {
        response,
        request,
        requestId: responseJson.requestId
      }
    );
  };
}
function validateWorkerScope(registration, options) {
  if (!(options == null ? void 0 : options.quiet) && !location.href.startsWith(registration.scope)) {
    devUtils.warn(
      `Cannot intercept requests on this page because it's outside of the worker's scope ("${registration.scope}"). If you wish to mock API requests on this page, you must resolve this scope issue.

- (Recommended) Register the worker at the root level ("/") of your application.
- Set the "Service-Worker-Allowed" response header to allow out-of-scope workers.`
    );
  }
}
var createStartHandler = (context) => {
  return function start(options, customOptions) {
    const startWorkerInstance = async () => {
      context.events.removeAllListeners();
      context.workerChannel.on(
        "REQUEST",
        createRequestListener(context, options)
      );
      context.workerChannel.on("RESPONSE", createResponseListener(context));
      const instance = await getWorkerInstance(
        options.serviceWorker.url,
        options.serviceWorker.options,
        options.findWorker
      );
      const [worker2, registration] = instance;
      if (!worker2) {
        const missingWorkerMessage = (customOptions == null ? void 0 : customOptions.findWorker) ? devUtils.formatMessage(
          `Failed to locate the Service Worker registration using a custom "findWorker" predicate.

Please ensure that the custom predicate properly locates the Service Worker registration at "%s".
More details: https://mswjs.io/docs/api/setup-worker/start#findworker
`,
          options.serviceWorker.url
        ) : devUtils.formatMessage(
          `Failed to locate the Service Worker registration.

This most likely means that the worker script URL "%s" cannot resolve against the actual public hostname (%s). This may happen if your application runs behind a proxy, or has a dynamic hostname.

Please consider using a custom "serviceWorker.url" option to point to the actual worker script location, or a custom "findWorker" option to resolve the Service Worker registration manually. More details: https://mswjs.io/docs/api/setup-worker/start`,
          options.serviceWorker.url,
          location.host
        );
        throw new Error(missingWorkerMessage);
      }
      context.worker = worker2;
      context.registration = registration;
      context.events.addListener(window, "beforeunload", () => {
        if (worker2.state !== "redundant") {
          context.workerChannel.send("CLIENT_CLOSED");
        }
        window.clearInterval(context.keepAliveInterval);
        window.postMessage({ type: "msw/worker:stop" });
      });
      await checkWorkerIntegrity(context).catch((error2) => {
        devUtils.error(
          "Error while checking the worker script integrity. Please report this on GitHub (https://github.com/mswjs/msw/issues), including the original error below."
        );
        console.error(error2);
      });
      context.keepAliveInterval = window.setInterval(
        () => context.workerChannel.send("KEEPALIVE_REQUEST"),
        5e3
      );
      validateWorkerScope(registration, context.startOptions);
      return registration;
    };
    const workerRegistration = startWorkerInstance().then(
      async (registration) => {
        const pendingInstance = registration.installing || registration.waiting;
        if (pendingInstance) {
          await new Promise((resolve) => {
            pendingInstance.addEventListener("statechange", () => {
              if (pendingInstance.state === "activated") {
                return resolve();
              }
            });
          });
        }
        await enableMocking(context, options).catch((error2) => {
          throw new Error(`Failed to enable mocking: ${error2 == null ? void 0 : error2.message}`);
        });
        return registration;
      }
    );
    return workerRegistration;
  };
};
function printStopMessage(args = {}) {
  if (args.quiet) {
    return;
  }
  console.log(
    `%c${devUtils.formatMessage("Mocking disabled.")}`,
    "color:orangered;font-weight:bold;"
  );
}
var createStop = (context) => {
  return function stop() {
    var _a3;
    if (!context.isMockingEnabled) {
      devUtils.warn(
        'Found a redundant "worker.stop()" call. Note that stopping the worker while mocking already stopped has no effect. Consider removing this "worker.stop()" call.'
      );
      return;
    }
    context.workerChannel.send("MOCK_DEACTIVATE");
    context.isMockingEnabled = false;
    window.clearInterval(context.keepAliveInterval);
    window.postMessage({ type: "msw/worker:stop" });
    printStopMessage({ quiet: (_a3 = context.startOptions) == null ? void 0 : _a3.quiet });
  };
};
var DEFAULT_START_OPTIONS = {
  serviceWorker: {
    url: "/mockServiceWorker.js",
    options: null
  },
  quiet: false,
  waitUntilReady: true,
  onUnhandledRequest: "warn",
  findWorker(scriptURL, mockServiceWorkerUrl) {
    return scriptURL === mockServiceWorkerUrl;
  }
};
function createDeferredExecutor() {
  const executor = (resolve, reject) => {
    executor.state = "pending";
    executor.resolve = (data) => {
      if (executor.state !== "pending") {
        return;
      }
      executor.result = data;
      const onFulfilled = (value) => {
        executor.state = "fulfilled";
        return value;
      };
      return resolve(
        data instanceof Promise ? data : Promise.resolve(data).then(onFulfilled)
      );
    };
    executor.reject = (reason) => {
      if (executor.state !== "pending") {
        return;
      }
      queueMicrotask(() => {
        executor.state = "rejected";
      });
      return reject(executor.rejectionReason = reason);
    };
  };
  return executor;
}
var DeferredPromise = (_b2 = class extends Promise {
  constructor(executor = null) {
    const deferredExecutor = createDeferredExecutor();
    super((originalResolve, originalReject) => {
      deferredExecutor(originalResolve, originalReject);
      executor == null ? void 0 : executor(deferredExecutor.resolve, deferredExecutor.reject);
    });
    __privateAdd(this, _decorate2);
    __privateAdd(this, _executor2, void 0);
    __publicField(this, "resolve");
    __publicField(this, "reject");
    __privateSet(this, _executor2, deferredExecutor);
    this.resolve = __privateGet(this, _executor2).resolve;
    this.reject = __privateGet(this, _executor2).reject;
  }
  get state() {
    return __privateGet(this, _executor2).state;
  }
  get rejectionReason() {
    return __privateGet(this, _executor2).rejectionReason;
  }
  then(onFulfilled, onRejected) {
    return __privateMethod(this, _decorate2, decorate_fn2).call(this, super.then(onFulfilled, onRejected));
  }
  catch(onRejected) {
    return __privateMethod(this, _decorate2, decorate_fn2).call(this, super.catch(onRejected));
  }
  finally(onfinally) {
    return __privateMethod(this, _decorate2, decorate_fn2).call(this, super.finally(onfinally));
  }
}, _executor2 = new WeakMap(), _decorate2 = new WeakSet(), decorate_fn2 = function(promise) {
  return Object.defineProperties(promise, {
    resolve: { configurable: true, value: this.resolve },
    reject: { configurable: true, value: this.reject }
  });
}, _b2);
var InterceptorError = class extends Error {
  constructor(message2) {
    super(message2);
    this.name = "InterceptorError";
    Object.setPrototypeOf(this, InterceptorError.prototype);
  }
};
var kRequestHandled = Symbol("kRequestHandled");
var kResponsePromise = Symbol("kResponsePromise");
var RequestController = class {
  constructor(request) {
    this.request = request;
    this[kRequestHandled] = false;
    this[kResponsePromise] = new DeferredPromise();
  }
  /**
   * Respond to this request with the given `Response` instance.
   * @example
   * controller.respondWith(new Response())
   * controller.respondWith(Response.json({ id }))
   * controller.respondWith(Response.error())
   */
  respondWith(response) {
    invariant.as(
      InterceptorError,
      !this[kRequestHandled],
      'Failed to respond to the "%s %s" request: the "request" event has already been handled.',
      this.request.method,
      this.request.url
    );
    this[kRequestHandled] = true;
    this[kResponsePromise].resolve(response);
  }
  /**
   * Error this request with the given reason.
   *
   * @example
   * controller.errorWith()
   * controller.errorWith(new Error('Oops!'))
   * controller.errorWith({ message: 'Oops!'})
   */
  errorWith(reason) {
    invariant.as(
      InterceptorError,
      !this[kRequestHandled],
      'Failed to error the "%s %s" request: the "request" event has already been handled.',
      this.request.method,
      this.request.url
    );
    this[kRequestHandled] = true;
    this[kResponsePromise].resolve(reason);
  }
};
async function emitAsync(emitter, eventName, ...data) {
  const listners = emitter.listeners(eventName);
  if (listners.length === 0) {
    return;
  }
  for (const listener of listners) {
    await listener.apply(emitter, data);
  }
}
function isObject(value, loose = false) {
  return loose ? Object.prototype.toString.call(value).startsWith("[object ") : Object.prototype.toString.call(value) === "[object Object]";
}
function isPropertyAccessible(obj, key) {
  try {
    obj[key];
    return true;
  } catch (e) {
    return false;
  }
}
function createServerErrorResponse(body) {
  return new Response(
    JSON.stringify(
      body instanceof Error ? {
        name: body.name,
        message: body.message,
        stack: body.stack
      } : body
    ),
    {
      status: 500,
      statusText: "Unhandled Exception",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
function isResponseError(response) {
  return response != null && response instanceof Response && isPropertyAccessible(response, "type") && response.type === "error";
}
function isResponseLike(value) {
  return isObject(value, true) && isPropertyAccessible(value, "status") && isPropertyAccessible(value, "statusText") && isPropertyAccessible(value, "bodyUsed");
}
function isNodeLikeError(error2) {
  if (error2 == null) {
    return false;
  }
  if (!(error2 instanceof Error)) {
    return false;
  }
  return "code" in error2 && "errno" in error2;
}
async function handleRequest2(options) {
  const handleResponse = async (response) => {
    if (response instanceof Error) {
      options.onError(response);
      return true;
    }
    if (isResponseError(response)) {
      options.onRequestError(response);
      return true;
    }
    if (isResponseLike(response)) {
      await options.onResponse(response);
      return true;
    }
    if (isObject(response)) {
      options.onError(response);
      return true;
    }
    return false;
  };
  const handleResponseError = async (error2) => {
    if (error2 instanceof InterceptorError) {
      throw result.error;
    }
    if (isNodeLikeError(error2)) {
      options.onError(error2);
      return true;
    }
    if (error2 instanceof Response) {
      return await handleResponse(error2);
    }
    return false;
  };
  options.emitter.once("request", ({ requestId: pendingRequestId }) => {
    if (pendingRequestId !== options.requestId) {
      return;
    }
    if (options.controller[kResponsePromise].state === "pending") {
      options.controller[kResponsePromise].resolve(void 0);
    }
  });
  const requestAbortPromise = new DeferredPromise();
  if (options.request.signal) {
    if (options.request.signal.aborted) {
      requestAbortPromise.reject(options.request.signal.reason);
    } else {
      options.request.signal.addEventListener(
        "abort",
        () => {
          requestAbortPromise.reject(options.request.signal.reason);
        },
        { once: true }
      );
    }
  }
  const result = await until(async () => {
    const requestListenersPromise = emitAsync(options.emitter, "request", {
      requestId: options.requestId,
      request: options.request,
      controller: options.controller
    });
    await Promise.race([
      // Short-circuit the request handling promise if the request gets aborted.
      requestAbortPromise,
      requestListenersPromise,
      options.controller[kResponsePromise]
    ]);
    return await options.controller[kResponsePromise];
  });
  if (requestAbortPromise.state === "rejected") {
    options.onError(requestAbortPromise.rejectionReason);
    return true;
  }
  if (result.error) {
    if (await handleResponseError(result.error)) {
      return true;
    }
    if (options.emitter.listenerCount("unhandledException") > 0) {
      const unhandledExceptionController = new RequestController(
        options.request
      );
      await emitAsync(options.emitter, "unhandledException", {
        error: result.error,
        request: options.request,
        requestId: options.requestId,
        controller: unhandledExceptionController
      }).then(() => {
        if (unhandledExceptionController[kResponsePromise].state === "pending") {
          unhandledExceptionController[kResponsePromise].resolve(void 0);
        }
      });
      const nextResult = await until(
        () => unhandledExceptionController[kResponsePromise]
      );
      if (nextResult.error) {
        return handleResponseError(nextResult.error);
      }
      if (nextResult.data) {
        return handleResponse(nextResult.data);
      }
    }
    options.onResponse(createServerErrorResponse(result.error));
    return true;
  }
  if (result.data) {
    return handleResponse(result.data);
  }
  return false;
}
function hasConfigurableGlobal(propertyName) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, propertyName);
  if (typeof descriptor === "undefined") {
    return false;
  }
  if (typeof descriptor.get === "function" && typeof descriptor.get() === "undefined") {
    return false;
  }
  if (typeof descriptor.get === "undefined" && descriptor.value == null) {
    return false;
  }
  if (typeof descriptor.set === "undefined" && !descriptor.configurable) {
    console.error(
      `[MSW] Failed to apply interceptor: the global \`${propertyName}\` property is non-configurable. This is likely an issue with your environment. If you are using a framework, please open an issue about this in their repository.`
    );
    return false;
  }
  return true;
}
function createNetworkError(cause) {
  return Object.assign(new TypeError("Failed to fetch"), {
    cause
  });
}
var REQUEST_BODY_HEADERS = [
  "content-encoding",
  "content-language",
  "content-location",
  "content-type",
  "content-length"
];
var kRedirectCount = Symbol("kRedirectCount");
async function followFetchRedirect(request, response) {
  if (response.status !== 303 && request.body != null) {
    return Promise.reject(createNetworkError());
  }
  const requestUrl = new URL(request.url);
  let locationUrl;
  try {
    locationUrl = new URL(response.headers.get("location"), request.url);
  } catch (error2) {
    return Promise.reject(createNetworkError(error2));
  }
  if (!(locationUrl.protocol === "http:" || locationUrl.protocol === "https:")) {
    return Promise.reject(
      createNetworkError("URL scheme must be a HTTP(S) scheme")
    );
  }
  if (Reflect.get(request, kRedirectCount) > 20) {
    return Promise.reject(createNetworkError("redirect count exceeded"));
  }
  Object.defineProperty(request, kRedirectCount, {
    value: (Reflect.get(request, kRedirectCount) || 0) + 1
  });
  if (request.mode === "cors" && (locationUrl.username || locationUrl.password) && !sameOrigin(requestUrl, locationUrl)) {
    return Promise.reject(
      createNetworkError('cross origin not allowed for request mode "cors"')
    );
  }
  const requestInit = {};
  if ([301, 302].includes(response.status) && request.method === "POST" || response.status === 303 && !["HEAD", "GET"].includes(request.method)) {
    requestInit.method = "GET";
    requestInit.body = null;
    REQUEST_BODY_HEADERS.forEach((headerName) => {
      request.headers.delete(headerName);
    });
  }
  if (!sameOrigin(requestUrl, locationUrl)) {
    request.headers.delete("authorization");
    request.headers.delete("proxy-authorization");
    request.headers.delete("cookie");
    request.headers.delete("host");
  }
  requestInit.headers = request.headers;
  return fetch(new Request(locationUrl, requestInit));
}
function sameOrigin(left, right) {
  if (left.origin === right.origin && left.origin === "null") {
    return true;
  }
  if (left.protocol === right.protocol && left.hostname === right.hostname && left.port === right.port) {
    return true;
  }
  return false;
}
var BrotliDecompressionStream = class extends TransformStream {
  constructor() {
    console.warn(
      "[Interceptors]: Brotli decompression of response streams is not supported in the browser"
    );
    super({
      transform(chunk, controller) {
        controller.enqueue(chunk);
      }
    });
  }
};
var PipelineStream = class extends TransformStream {
  constructor(transformStreams, ...strategies) {
    super({}, ...strategies);
    const readable = [super.readable, ...transformStreams].reduce(
      (readable2, transform) => readable2.pipeThrough(transform)
    );
    Object.defineProperty(this, "readable", {
      get() {
        return readable;
      }
    });
  }
};
function parseContentEncoding(contentEncoding) {
  return contentEncoding.toLowerCase().split(",").map((coding) => coding.trim());
}
function createDecompressionStream(contentEncoding) {
  if (contentEncoding === "") {
    return null;
  }
  const codings = parseContentEncoding(contentEncoding);
  if (codings.length === 0) {
    return null;
  }
  const transformers = codings.reduceRight(
    (transformers2, coding) => {
      if (coding === "gzip" || coding === "x-gzip") {
        return transformers2.concat(new DecompressionStream("gzip"));
      } else if (coding === "deflate") {
        return transformers2.concat(new DecompressionStream("deflate"));
      } else if (coding === "br") {
        return transformers2.concat(new BrotliDecompressionStream());
      } else {
        transformers2.length = 0;
      }
      return transformers2;
    },
    []
  );
  return new PipelineStream(transformers);
}
function decompressResponse(response) {
  if (response.body === null) {
    return null;
  }
  const decompressionStream = createDecompressionStream(
    response.headers.get("content-encoding") || ""
  );
  if (!decompressionStream) {
    return null;
  }
  response.body.pipeTo(decompressionStream.writable);
  return decompressionStream.readable;
}
var _FetchInterceptor = class extends Interceptor2 {
  constructor() {
    super(_FetchInterceptor.symbol);
  }
  checkEnvironment() {
    return hasConfigurableGlobal("fetch");
  }
  async setup() {
    const pureFetch = globalThis.fetch;
    invariant(
      !pureFetch[IS_PATCHED_MODULE],
      'Failed to patch the "fetch" module: already patched.'
    );
    globalThis.fetch = async (input, init) => {
      const requestId = createRequestId();
      const resolvedInput = typeof input === "string" && typeof location !== "undefined" && !canParseUrl(input) ? new URL(input, location.href) : input;
      const request = new Request(resolvedInput, init);
      if (input instanceof Request) {
        setRawRequest(request, input);
      }
      const responsePromise = new DeferredPromise();
      const controller = new RequestController(request);
      this.logger.info("[%s] %s", request.method, request.url);
      this.logger.info("awaiting for the mocked response...");
      this.logger.info(
        'emitting the "request" event for %s listener(s)...',
        this.emitter.listenerCount("request")
      );
      const isRequestHandled = await handleRequest2({
        request,
        requestId,
        emitter: this.emitter,
        controller,
        onResponse: async (rawResponse) => {
          this.logger.info("received mocked response!", {
            rawResponse
          });
          const decompressedStream = decompressResponse(rawResponse);
          const response = decompressedStream === null ? rawResponse : new FetchResponse(decompressedStream, rawResponse);
          FetchResponse.setUrl(request.url, response);
          if (FetchResponse.isRedirectResponse(response.status)) {
            if (request.redirect === "error") {
              responsePromise.reject(createNetworkError("unexpected redirect"));
              return;
            }
            if (request.redirect === "follow") {
              followFetchRedirect(request, response).then(
                (response2) => {
                  responsePromise.resolve(response2);
                },
                (reason) => {
                  responsePromise.reject(reason);
                }
              );
              return;
            }
          }
          if (this.emitter.listenerCount("response") > 0) {
            this.logger.info('emitting the "response" event...');
            await emitAsync(this.emitter, "response", {
              // Clone the mocked response for the "response" event listener.
              // This way, the listener can read the response and not lock its body
              // for the actual fetch consumer.
              response: response.clone(),
              isMockedResponse: true,
              request,
              requestId
            });
          }
          responsePromise.resolve(response);
        },
        onRequestError: (response) => {
          this.logger.info("request has errored!", { response });
          responsePromise.reject(createNetworkError(response));
        },
        onError: (error2) => {
          this.logger.info("request has been aborted!", { error: error2 });
          responsePromise.reject(error2);
        }
      });
      if (isRequestHandled) {
        this.logger.info("request has been handled, returning mock promise...");
        return responsePromise;
      }
      this.logger.info(
        "no mocked response received, performing request as-is..."
      );
      const requestCloneForResponseEvent = request.clone();
      return pureFetch(request).then(async (response) => {
        this.logger.info("original fetch performed", response);
        if (this.emitter.listenerCount("response") > 0) {
          this.logger.info('emitting the "response" event...');
          const responseClone = response.clone();
          await emitAsync(this.emitter, "response", {
            response: responseClone,
            isMockedResponse: false,
            request: requestCloneForResponseEvent,
            requestId
          });
        }
        return response;
      });
    };
    Object.defineProperty(globalThis.fetch, IS_PATCHED_MODULE, {
      enumerable: true,
      configurable: true,
      value: true
    });
    this.subscriptions.push(() => {
      Object.defineProperty(globalThis.fetch, IS_PATCHED_MODULE, {
        value: void 0
      });
      globalThis.fetch = pureFetch;
      this.logger.info(
        'restored native "globalThis.fetch"!',
        globalThis.fetch.name
      );
    });
  }
};
var FetchInterceptor = _FetchInterceptor;
FetchInterceptor.symbol = Symbol("fetch");
function concatArrayBuffer(left, right) {
  const result = new Uint8Array(left.byteLength + right.byteLength);
  result.set(left, 0);
  result.set(right, left.byteLength);
  return result;
}
var EventPolyfill = class {
  constructor(type, options) {
    this.NONE = 0;
    this.CAPTURING_PHASE = 1;
    this.AT_TARGET = 2;
    this.BUBBLING_PHASE = 3;
    this.type = "";
    this.srcElement = null;
    this.currentTarget = null;
    this.eventPhase = 0;
    this.isTrusted = true;
    this.composed = false;
    this.cancelable = true;
    this.defaultPrevented = false;
    this.bubbles = true;
    this.lengthComputable = true;
    this.loaded = 0;
    this.total = 0;
    this.cancelBubble = false;
    this.returnValue = true;
    this.type = type;
    this.target = (options == null ? void 0 : options.target) || null;
    this.currentTarget = (options == null ? void 0 : options.currentTarget) || null;
    this.timeStamp = Date.now();
  }
  composedPath() {
    return [];
  }
  initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.bubbles = !!bubbles;
    this.cancelable = !!cancelable;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
  stopPropagation() {
  }
  stopImmediatePropagation() {
  }
};
var ProgressEventPolyfill = class extends EventPolyfill {
  constructor(type, init) {
    super(type);
    this.lengthComputable = (init == null ? void 0 : init.lengthComputable) || false;
    this.composed = (init == null ? void 0 : init.composed) || false;
    this.loaded = (init == null ? void 0 : init.loaded) || 0;
    this.total = (init == null ? void 0 : init.total) || 0;
  }
};
var SUPPORTS_PROGRESS_EVENT = typeof ProgressEvent !== "undefined";
function createEvent(target, type, init) {
  const progressEvents = [
    "error",
    "progress",
    "loadstart",
    "loadend",
    "load",
    "timeout",
    "abort"
  ];
  const ProgressEventClass = SUPPORTS_PROGRESS_EVENT ? ProgressEvent : ProgressEventPolyfill;
  const event = progressEvents.includes(type) ? new ProgressEventClass(type, {
    lengthComputable: true,
    loaded: (init == null ? void 0 : init.loaded) || 0,
    total: (init == null ? void 0 : init.total) || 0
  }) : new EventPolyfill(type, {
    target,
    currentTarget: target
  });
  return event;
}
function findPropertySource(target, propertyName) {
  if (!(propertyName in target)) {
    return null;
  }
  const hasProperty = Object.prototype.hasOwnProperty.call(target, propertyName);
  if (hasProperty) {
    return target;
  }
  const prototype = Reflect.getPrototypeOf(target);
  return prototype ? findPropertySource(prototype, propertyName) : null;
}
function createProxy(target, options) {
  const proxy = new Proxy(target, optionsToProxyHandler(options));
  return proxy;
}
function optionsToProxyHandler(options) {
  const { constructorCall, methodCall, getProperty, setProperty } = options;
  const handler = {};
  if (typeof constructorCall !== "undefined") {
    handler.construct = function(target, args, newTarget) {
      const next = Reflect.construct.bind(null, target, args, newTarget);
      return constructorCall.call(newTarget, args, next);
    };
  }
  handler.set = function(target, propertyName, nextValue) {
    const next = () => {
      const propertySource = findPropertySource(target, propertyName) || target;
      const ownDescriptors = Reflect.getOwnPropertyDescriptor(
        propertySource,
        propertyName
      );
      if (typeof (ownDescriptors == null ? void 0 : ownDescriptors.set) !== "undefined") {
        ownDescriptors.set.apply(target, [nextValue]);
        return true;
      }
      return Reflect.defineProperty(propertySource, propertyName, {
        writable: true,
        enumerable: true,
        configurable: true,
        value: nextValue
      });
    };
    if (typeof setProperty !== "undefined") {
      return setProperty.call(target, [propertyName, nextValue], next);
    }
    return next();
  };
  handler.get = function(target, propertyName, receiver) {
    const next = () => target[propertyName];
    const value = typeof getProperty !== "undefined" ? getProperty.call(target, [propertyName, receiver], next) : next();
    if (typeof value === "function") {
      return (...args) => {
        const next2 = value.bind(target, ...args);
        if (typeof methodCall !== "undefined") {
          return methodCall.call(target, [propertyName, args], next2);
        }
        return next2();
      };
    }
    return value;
  };
  return handler;
}
function isDomParserSupportedType(type) {
  const supportedTypes = [
    "application/xhtml+xml",
    "application/xml",
    "image/svg+xml",
    "text/html",
    "text/xml"
  ];
  return supportedTypes.some((supportedType) => {
    return type.startsWith(supportedType);
  });
}
function parseJson(data) {
  try {
    const json = JSON.parse(data);
    return json;
  } catch (_) {
    return null;
  }
}
function createResponse(request, body) {
  const responseBodyOrNull = FetchResponse.isResponseWithBody(request.status) ? body : null;
  return new FetchResponse(responseBodyOrNull, {
    url: request.responseURL,
    status: request.status,
    statusText: request.statusText,
    headers: createHeadersFromXMLHttpReqestHeaders(
      request.getAllResponseHeaders()
    )
  });
}
function createHeadersFromXMLHttpReqestHeaders(headersString) {
  const headers = new Headers();
  const lines = headersString.split(/[\r\n]+/);
  for (const line of lines) {
    if (line.trim() === "") {
      continue;
    }
    const [name, ...parts] = line.split(": ");
    const value = parts.join(": ");
    headers.append(name, value);
  }
  return headers;
}
async function getBodyByteLength(input) {
  const explicitContentLength = input.headers.get("content-length");
  if (explicitContentLength != null && explicitContentLength !== "") {
    return Number(explicitContentLength);
  }
  const buffer = await input.arrayBuffer();
  return buffer.byteLength;
}
var kIsRequestHandled = Symbol("kIsRequestHandled");
var IS_NODE2 = isNodeProcess();
var kFetchRequest = Symbol("kFetchRequest");
var XMLHttpRequestController = class {
  constructor(initialRequest, logger) {
    this.initialRequest = initialRequest;
    this.logger = logger;
    this.method = "GET";
    this.url = null;
    this[kIsRequestHandled] = false;
    this.events = /* @__PURE__ */ new Map();
    this.uploadEvents = /* @__PURE__ */ new Map();
    this.requestId = createRequestId();
    this.requestHeaders = new Headers();
    this.responseBuffer = new Uint8Array();
    this.request = createProxy(initialRequest, {
      setProperty: ([propertyName, nextValue], invoke) => {
        switch (propertyName) {
          case "ontimeout": {
            const eventName = propertyName.slice(
              2
            );
            this.request.addEventListener(eventName, nextValue);
            return invoke();
          }
          default: {
            return invoke();
          }
        }
      },
      methodCall: ([methodName, args], invoke) => {
        var _a3;
        switch (methodName) {
          case "open": {
            const [method, url] = args;
            if (typeof url === "undefined") {
              this.method = "GET";
              this.url = toAbsoluteUrl(method);
            } else {
              this.method = method;
              this.url = toAbsoluteUrl(url);
            }
            this.logger = this.logger.extend(`${this.method} ${this.url.href}`);
            this.logger.info("open", this.method, this.url.href);
            return invoke();
          }
          case "addEventListener": {
            const [eventName, listener] = args;
            this.registerEvent(eventName, listener);
            this.logger.info("addEventListener", eventName, listener);
            return invoke();
          }
          case "setRequestHeader": {
            const [name, value] = args;
            this.requestHeaders.set(name, value);
            this.logger.info("setRequestHeader", name, value);
            return invoke();
          }
          case "send": {
            const [body] = args;
            this.request.addEventListener("load", () => {
              if (typeof this.onResponse !== "undefined") {
                const fetchResponse = createResponse(
                  this.request,
                  /**
                   * The `response` property is the right way to read
                   * the ambiguous response body, as the request's "responseType" may differ.
                   * @see https://xhr.spec.whatwg.org/#the-response-attribute
                   */
                  this.request.response
                );
                this.onResponse.call(this, {
                  response: fetchResponse,
                  isMockedResponse: this[kIsRequestHandled],
                  request: fetchRequest,
                  requestId: this.requestId
                });
              }
            });
            const requestBody = typeof body === "string" ? encodeBuffer(body) : body;
            const fetchRequest = this.toFetchApiRequest(requestBody);
            this[kFetchRequest] = fetchRequest.clone();
            const onceRequestSettled = ((_a3 = this.onRequest) == null ? void 0 : _a3.call(this, {
              request: fetchRequest,
              requestId: this.requestId
            })) || Promise.resolve();
            onceRequestSettled.finally(() => {
              if (!this[kIsRequestHandled]) {
                this.logger.info(
                  "request callback settled but request has not been handled (readystate %d), performing as-is...",
                  this.request.readyState
                );
                if (IS_NODE2) {
                  this.request.setRequestHeader(
                    INTERNAL_REQUEST_ID_HEADER_NAME,
                    this.requestId
                  );
                }
                return invoke();
              }
            });
            break;
          }
          default: {
            return invoke();
          }
        }
      }
    });
    define(
      this.request,
      "upload",
      createProxy(this.request.upload, {
        setProperty: ([propertyName, nextValue], invoke) => {
          switch (propertyName) {
            case "onloadstart":
            case "onprogress":
            case "onaboart":
            case "onerror":
            case "onload":
            case "ontimeout":
            case "onloadend": {
              const eventName = propertyName.slice(
                2
              );
              this.registerUploadEvent(eventName, nextValue);
            }
          }
          return invoke();
        },
        methodCall: ([methodName, args], invoke) => {
          switch (methodName) {
            case "addEventListener": {
              const [eventName, listener] = args;
              this.registerUploadEvent(eventName, listener);
              this.logger.info("upload.addEventListener", eventName, listener);
              return invoke();
            }
          }
        }
      })
    );
  }
  registerEvent(eventName, listener) {
    const prevEvents = this.events.get(eventName) || [];
    const nextEvents = prevEvents.concat(listener);
    this.events.set(eventName, nextEvents);
    this.logger.info('registered event "%s"', eventName, listener);
  }
  registerUploadEvent(eventName, listener) {
    const prevEvents = this.uploadEvents.get(eventName) || [];
    const nextEvents = prevEvents.concat(listener);
    this.uploadEvents.set(eventName, nextEvents);
    this.logger.info('registered upload event "%s"', eventName, listener);
  }
  /**
   * Responds to the current request with the given
   * Fetch API `Response` instance.
   */
  async respondWith(response) {
    this[kIsRequestHandled] = true;
    if (this[kFetchRequest]) {
      const totalRequestBodyLength = await getBodyByteLength(
        this[kFetchRequest]
      );
      this.trigger("loadstart", this.request.upload, {
        loaded: 0,
        total: totalRequestBodyLength
      });
      this.trigger("progress", this.request.upload, {
        loaded: totalRequestBodyLength,
        total: totalRequestBodyLength
      });
      this.trigger("load", this.request.upload, {
        loaded: totalRequestBodyLength,
        total: totalRequestBodyLength
      });
      this.trigger("loadend", this.request.upload, {
        loaded: totalRequestBodyLength,
        total: totalRequestBodyLength
      });
    }
    this.logger.info(
      "responding with a mocked response: %d %s",
      response.status,
      response.statusText
    );
    define(this.request, "status", response.status);
    define(this.request, "statusText", response.statusText);
    define(this.request, "responseURL", this.url.href);
    this.request.getResponseHeader = new Proxy(this.request.getResponseHeader, {
      apply: (_, __, args) => {
        this.logger.info("getResponseHeader", args[0]);
        if (this.request.readyState < this.request.HEADERS_RECEIVED) {
          this.logger.info("headers not received yet, returning null");
          return null;
        }
        const headerValue = response.headers.get(args[0]);
        this.logger.info(
          'resolved response header "%s" to',
          args[0],
          headerValue
        );
        return headerValue;
      }
    });
    this.request.getAllResponseHeaders = new Proxy(
      this.request.getAllResponseHeaders,
      {
        apply: () => {
          this.logger.info("getAllResponseHeaders");
          if (this.request.readyState < this.request.HEADERS_RECEIVED) {
            this.logger.info("headers not received yet, returning empty string");
            return "";
          }
          const headersList = Array.from(response.headers.entries());
          const allHeaders = headersList.map(([headerName, headerValue]) => {
            return `${headerName}: ${headerValue}`;
          }).join("\r\n");
          this.logger.info("resolved all response headers to", allHeaders);
          return allHeaders;
        }
      }
    );
    Object.defineProperties(this.request, {
      response: {
        enumerable: true,
        configurable: false,
        get: () => this.response
      },
      responseText: {
        enumerable: true,
        configurable: false,
        get: () => this.responseText
      },
      responseXML: {
        enumerable: true,
        configurable: false,
        get: () => this.responseXML
      }
    });
    const totalResponseBodyLength = await getBodyByteLength(response.clone());
    this.logger.info("calculated response body length", totalResponseBodyLength);
    this.trigger("loadstart", this.request, {
      loaded: 0,
      total: totalResponseBodyLength
    });
    this.setReadyState(this.request.HEADERS_RECEIVED);
    this.setReadyState(this.request.LOADING);
    const finalizeResponse = () => {
      this.logger.info("finalizing the mocked response...");
      this.setReadyState(this.request.DONE);
      this.trigger("load", this.request, {
        loaded: this.responseBuffer.byteLength,
        total: totalResponseBodyLength
      });
      this.trigger("loadend", this.request, {
        loaded: this.responseBuffer.byteLength,
        total: totalResponseBodyLength
      });
    };
    if (response.body) {
      this.logger.info("mocked response has body, streaming...");
      const reader = response.body.getReader();
      const readNextResponseBodyChunk = async () => {
        const { value, done } = await reader.read();
        if (done) {
          this.logger.info("response body stream done!");
          finalizeResponse();
          return;
        }
        if (value) {
          this.logger.info("read response body chunk:", value);
          this.responseBuffer = concatArrayBuffer(this.responseBuffer, value);
          this.trigger("progress", this.request, {
            loaded: this.responseBuffer.byteLength,
            total: totalResponseBodyLength
          });
        }
        readNextResponseBodyChunk();
      };
      readNextResponseBodyChunk();
    } else {
      finalizeResponse();
    }
  }
  responseBufferToText() {
    return decodeBuffer(this.responseBuffer);
  }
  get response() {
    this.logger.info(
      "getResponse (responseType: %s)",
      this.request.responseType
    );
    if (this.request.readyState !== this.request.DONE) {
      return null;
    }
    switch (this.request.responseType) {
      case "json": {
        const responseJson = parseJson(this.responseBufferToText());
        this.logger.info("resolved response JSON", responseJson);
        return responseJson;
      }
      case "arraybuffer": {
        const arrayBuffer = toArrayBuffer(this.responseBuffer);
        this.logger.info("resolved response ArrayBuffer", arrayBuffer);
        return arrayBuffer;
      }
      case "blob": {
        const mimeType = this.request.getResponseHeader("Content-Type") || "text/plain";
        const responseBlob = new Blob([this.responseBufferToText()], {
          type: mimeType
        });
        this.logger.info(
          "resolved response Blob (mime type: %s)",
          responseBlob,
          mimeType
        );
        return responseBlob;
      }
      default: {
        const responseText = this.responseBufferToText();
        this.logger.info(
          'resolving "%s" response type as text',
          this.request.responseType,
          responseText
        );
        return responseText;
      }
    }
  }
  get responseText() {
    invariant(
      this.request.responseType === "" || this.request.responseType === "text",
      "InvalidStateError: The object is in invalid state."
    );
    if (this.request.readyState !== this.request.LOADING && this.request.readyState !== this.request.DONE) {
      return "";
    }
    const responseText = this.responseBufferToText();
    this.logger.info('getResponseText: "%s"', responseText);
    return responseText;
  }
  get responseXML() {
    invariant(
      this.request.responseType === "" || this.request.responseType === "document",
      "InvalidStateError: The object is in invalid state."
    );
    if (this.request.readyState !== this.request.DONE) {
      return null;
    }
    const contentType = this.request.getResponseHeader("Content-Type") || "";
    if (typeof DOMParser === "undefined") {
      console.warn(
        "Cannot retrieve XMLHttpRequest response body as XML: DOMParser is not defined. You are likely using an environment that is not browser or does not polyfill browser globals correctly."
      );
      return null;
    }
    if (isDomParserSupportedType(contentType)) {
      return new DOMParser().parseFromString(
        this.responseBufferToText(),
        contentType
      );
    }
    return null;
  }
  errorWith(error2) {
    this[kIsRequestHandled] = true;
    this.logger.info("responding with an error");
    this.setReadyState(this.request.DONE);
    this.trigger("error", this.request);
    this.trigger("loadend", this.request);
  }
  /**
   * Transitions this request's `readyState` to the given one.
   */
  setReadyState(nextReadyState) {
    this.logger.info(
      "setReadyState: %d -> %d",
      this.request.readyState,
      nextReadyState
    );
    if (this.request.readyState === nextReadyState) {
      this.logger.info("ready state identical, skipping transition...");
      return;
    }
    define(this.request, "readyState", nextReadyState);
    this.logger.info("set readyState to: %d", nextReadyState);
    if (nextReadyState !== this.request.UNSENT) {
      this.logger.info('triggerring "readystatechange" event...');
      this.trigger("readystatechange", this.request);
    }
  }
  /**
   * Triggers given event on the `XMLHttpRequest` instance.
   */
  trigger(eventName, target, options) {
    const callback = target[`on${eventName}`];
    const event = createEvent(target, eventName, options);
    this.logger.info('trigger "%s"', eventName, options || "");
    if (typeof callback === "function") {
      this.logger.info('found a direct "%s" callback, calling...', eventName);
      callback.call(target, event);
    }
    const events = target instanceof XMLHttpRequestUpload ? this.uploadEvents : this.events;
    for (const [registeredEventName, listeners] of events) {
      if (registeredEventName === eventName) {
        this.logger.info(
          'found %d listener(s) for "%s" event, calling...',
          listeners.length,
          eventName
        );
        listeners.forEach((listener) => listener.call(target, event));
      }
    }
  }
  /**
   * Converts this `XMLHttpRequest` instance into a Fetch API `Request` instance.
   */
  toFetchApiRequest(body) {
    this.logger.info("converting request to a Fetch API Request...");
    const resolvedBody = body instanceof Document ? body.documentElement.innerText : body;
    const fetchRequest = new Request(this.url.href, {
      method: this.method,
      headers: this.requestHeaders,
      /**
       * @see https://xhr.spec.whatwg.org/#cross-origin-credentials
       */
      credentials: this.request.withCredentials ? "include" : "same-origin",
      body: ["GET", "HEAD"].includes(this.method.toUpperCase()) ? null : resolvedBody
    });
    const proxyHeaders = createProxy(fetchRequest.headers, {
      methodCall: ([methodName, args], invoke) => {
        switch (methodName) {
          case "append":
          case "set": {
            const [headerName, headerValue] = args;
            this.request.setRequestHeader(headerName, headerValue);
            break;
          }
          case "delete": {
            const [headerName] = args;
            console.warn(
              `XMLHttpRequest: Cannot remove a "${headerName}" header from the Fetch API representation of the "${fetchRequest.method} ${fetchRequest.url}" request. XMLHttpRequest headers cannot be removed.`
            );
            break;
          }
        }
        return invoke();
      }
    });
    define(fetchRequest, "headers", proxyHeaders);
    setRawRequest(fetchRequest, this.request);
    this.logger.info("converted request to a Fetch API Request!", fetchRequest);
    return fetchRequest;
  }
};
function toAbsoluteUrl(url) {
  if (typeof location === "undefined") {
    return new URL(url);
  }
  return new URL(url.toString(), location.href);
}
function define(target, property, value) {
  Reflect.defineProperty(target, property, {
    // Ensure writable properties to allow redefining readonly properties.
    writable: true,
    enumerable: true,
    value
  });
}
function createXMLHttpRequestProxy({
  emitter,
  logger
}) {
  const XMLHttpRequestProxy = new Proxy(globalThis.XMLHttpRequest, {
    construct(target, args, newTarget) {
      logger.info("constructed new XMLHttpRequest");
      const originalRequest = Reflect.construct(
        target,
        args,
        newTarget
      );
      const prototypeDescriptors = Object.getOwnPropertyDescriptors(
        target.prototype
      );
      for (const propertyName in prototypeDescriptors) {
        Reflect.defineProperty(
          originalRequest,
          propertyName,
          prototypeDescriptors[propertyName]
        );
      }
      const xhrRequestController = new XMLHttpRequestController(
        originalRequest,
        logger
      );
      xhrRequestController.onRequest = async function({ request, requestId }) {
        const controller = new RequestController(request);
        this.logger.info("awaiting mocked response...");
        this.logger.info(
          'emitting the "request" event for %s listener(s)...',
          emitter.listenerCount("request")
        );
        const isRequestHandled = await handleRequest2({
          request,
          requestId,
          controller,
          emitter,
          onResponse: async (response) => {
            await this.respondWith(response);
          },
          onRequestError: () => {
            this.errorWith(new TypeError("Network error"));
          },
          onError: (error2) => {
            this.logger.info("request errored!", { error: error2 });
            if (error2 instanceof Error) {
              this.errorWith(error2);
            }
          }
        });
        if (!isRequestHandled) {
          this.logger.info(
            "no mocked response received, performing request as-is..."
          );
        }
      };
      xhrRequestController.onResponse = async function({
        response,
        isMockedResponse,
        request,
        requestId
      }) {
        this.logger.info(
          'emitting the "response" event for %s listener(s)...',
          emitter.listenerCount("response")
        );
        emitter.emit("response", {
          response,
          isMockedResponse,
          request,
          requestId
        });
      };
      return xhrRequestController.request;
    }
  });
  return XMLHttpRequestProxy;
}
var _XMLHttpRequestInterceptor = class extends Interceptor2 {
  constructor() {
    super(_XMLHttpRequestInterceptor.interceptorSymbol);
  }
  checkEnvironment() {
    return hasConfigurableGlobal("XMLHttpRequest");
  }
  setup() {
    const logger = this.logger.extend("setup");
    logger.info('patching "XMLHttpRequest" module...');
    const PureXMLHttpRequest = globalThis.XMLHttpRequest;
    invariant(
      !PureXMLHttpRequest[IS_PATCHED_MODULE],
      'Failed to patch the "XMLHttpRequest" module: already patched.'
    );
    globalThis.XMLHttpRequest = createXMLHttpRequestProxy({
      emitter: this.emitter,
      logger: this.logger
    });
    logger.info(
      'native "XMLHttpRequest" module patched!',
      globalThis.XMLHttpRequest.name
    );
    Object.defineProperty(globalThis.XMLHttpRequest, IS_PATCHED_MODULE, {
      enumerable: true,
      configurable: true,
      value: true
    });
    this.subscriptions.push(() => {
      Object.defineProperty(globalThis.XMLHttpRequest, IS_PATCHED_MODULE, {
        value: void 0
      });
      globalThis.XMLHttpRequest = PureXMLHttpRequest;
      logger.info(
        'native "XMLHttpRequest" module restored!',
        globalThis.XMLHttpRequest.name
      );
    });
  }
};
var XMLHttpRequestInterceptor = _XMLHttpRequestInterceptor;
XMLHttpRequestInterceptor.interceptorSymbol = Symbol("xhr");
function createFallbackRequestListener(context, options) {
  const interceptor = new BatchInterceptor({
    name: "fallback",
    interceptors: [new FetchInterceptor(), new XMLHttpRequestInterceptor()]
  });
  interceptor.on("request", async ({ request, requestId, controller }) => {
    const requestCloneForLogs = request.clone();
    const response = await handleRequest(
      request,
      requestId,
      context.getRequestHandlers().filter(isHandlerKind("RequestHandler")),
      options,
      context.emitter,
      {
        onMockedResponse(_, { handler, parsedResult }) {
          if (!options.quiet) {
            context.emitter.once("response:mocked", ({ response: response2 }) => {
              handler.log({
                request: requestCloneForLogs,
                response: response2,
                parsedResult
              });
            });
          }
        }
      }
    );
    if (response) {
      controller.respondWith(response);
    }
  });
  interceptor.on(
    "response",
    ({ response, isMockedResponse, request, requestId }) => {
      context.emitter.emit(
        isMockedResponse ? "response:mocked" : "response:bypass",
        {
          response,
          request,
          requestId
        }
      );
    }
  );
  interceptor.apply();
  return interceptor;
}
function createFallbackStart(context) {
  return async function start(options) {
    context.fallbackInterceptor = createFallbackRequestListener(
      context,
      options
    );
    printStartMessage({
      message: "Mocking enabled (fallback mode).",
      quiet: options.quiet
    });
    return void 0;
  };
}
function createFallbackStop(context) {
  return function stop() {
    var _a3, _b3;
    (_a3 = context.fallbackInterceptor) == null ? void 0 : _a3.dispose();
    printStopMessage({ quiet: (_b3 = context.startOptions) == null ? void 0 : _b3.quiet });
  };
}
function supportsReadableStreamTransfer() {
  try {
    const stream = new ReadableStream({
      start: (controller) => controller.close()
    });
    const message2 = new MessageChannel();
    message2.port1.postMessage(stream, [stream]);
    return true;
  } catch {
    return false;
  }
}
var SetupWorkerApi = class extends SetupApi {
  constructor(...handlers2) {
    super(...handlers2);
    __publicField(this, "context");
    __publicField(this, "startHandler", null);
    __publicField(this, "stopHandler", null);
    __publicField(this, "listeners");
    invariant(
      !isNodeProcess(),
      devUtils.formatMessage(
        "Failed to execute `setupWorker` in a non-browser environment. Consider using `setupServer` for Node.js environment instead."
      )
    );
    this.listeners = [];
    this.context = this.createWorkerContext();
  }
  createWorkerContext() {
    const context = {
      // Mocking is not considered enabled until the worker
      // signals back the successful activation event.
      isMockingEnabled: false,
      startOptions: null,
      worker: null,
      getRequestHandlers: () => {
        return this.handlersController.currentHandlers();
      },
      registration: null,
      requests: /* @__PURE__ */ new Map(),
      emitter: this.emitter,
      workerChannel: {
        on: (eventType, callback) => {
          this.context.events.addListener(navigator.serviceWorker, "message", (event) => {
            if (event.source !== this.context.worker) {
              return;
            }
            const message2 = event.data;
            if (!message2) {
              return;
            }
            if (message2.type === eventType) {
              callback(event, message2);
            }
          });
        },
        send: (type) => {
          var _a3;
          (_a3 = this.context.worker) == null ? void 0 : _a3.postMessage(type);
        }
      },
      events: {
        addListener: (target, eventType, callback) => {
          target.addEventListener(eventType, callback);
          this.listeners.push({
            eventType,
            target,
            callback
          });
          return () => {
            target.removeEventListener(eventType, callback);
          };
        },
        removeAllListeners: () => {
          for (const { target, eventType, callback } of this.listeners) {
            target.removeEventListener(eventType, callback);
          }
          this.listeners = [];
        },
        once: (eventType) => {
          const bindings = [];
          return new Promise((resolve, reject) => {
            const handleIncomingMessage = (event) => {
              try {
                const message2 = event.data;
                if (message2.type === eventType) {
                  resolve(message2);
                }
              } catch (error2) {
                reject(error2);
              }
            };
            bindings.push(
              this.context.events.addListener(
                navigator.serviceWorker,
                "message",
                handleIncomingMessage
              ),
              this.context.events.addListener(
                navigator.serviceWorker,
                "messageerror",
                reject
              )
            );
          }).finally(() => {
            bindings.forEach((unbind) => unbind());
          });
        }
      },
      supports: {
        serviceWorkerApi: !("serviceWorker" in navigator) || location.protocol === "file:",
        readableStreamTransfer: supportsReadableStreamTransfer()
      }
    };
    this.startHandler = context.supports.serviceWorkerApi ? createFallbackStart(context) : createStartHandler(context);
    this.stopHandler = context.supports.serviceWorkerApi ? createFallbackStop(context) : createStop(context);
    return context;
  }
  async start(options = {}) {
    if (options.waitUntilReady === true) {
      devUtils.warn(
        'The "waitUntilReady" option has been deprecated. Please remove it from this "worker.start()" call. Follow the recommended Browser integration (https://mswjs.io/docs/integrations/browser) to eliminate any race conditions between the Service Worker registration and any requests made by your application on initial render.'
      );
    }
    this.context.startOptions = mergeRight(
      DEFAULT_START_OPTIONS,
      options
    );
    handleWebSocketEvent({
      getUnhandledRequestStrategy: () => {
        return this.context.startOptions.onUnhandledRequest;
      },
      getHandlers: () => {
        return this.handlersController.currentHandlers();
      },
      onMockedConnection: (connection) => {
        if (!this.context.startOptions.quiet) {
          attachWebSocketLogger(connection);
        }
      },
      onPassthroughConnection() {
      }
    });
    webSocketInterceptor.apply();
    this.subscriptions.push(() => {
      webSocketInterceptor.dispose();
    });
    return await this.startHandler(this.context.startOptions, options);
  }
  stop() {
    super.dispose();
    this.context.events.removeAllListeners();
    this.context.emitter.removeAllListeners();
    this.stopHandler();
  }
};
function setupWorker(...handlers2) {
  return new SetupWorkerApi(...handlers2);
}
function checkGlobals() {
  invariant$1(
    typeof URL !== "undefined",
    devUtils.formatMessage(
      `Global "URL" class is not defined. This likely means that you're running MSW in an environment that doesn't support all Node.js standard API (e.g. React Native). If that's the case, please use an appropriate polyfill for the "URL" class, like "react-native-url-polyfill".`
    )
  );
}
function isStringEqual(actual, expected) {
  return actual.toLowerCase() === expected.toLowerCase();
}
function getStatusCodeColor(status) {
  if (status < 300) {
    return "#69AB32";
  }
  if (status < 400) {
    return "#F0BB4B";
  }
  return "#E95F5D";
}
async function serializeRequest(request) {
  const requestClone = request.clone();
  const requestText = await requestClone.text();
  return {
    url: new URL(request.url),
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: requestText
  };
}
const { message } = source_default$1;
async function serializeResponse(response) {
  const responseClone = response.clone();
  const responseText = await responseClone.text();
  const responseStatus = responseClone.status || 200;
  const responseStatusText = responseClone.statusText || message[responseStatus] || "OK";
  return {
    status: responseStatus,
    statusText: responseStatusText,
    headers: Object.fromEntries(responseClone.headers.entries()),
    body: responseText
  };
}
var __create = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp2(target, "default", { value: mod, enumerable: true }),
  mod
));
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports) {
    exports.parse = parse2;
    exports.serialize = serialize;
    var __toString = Object.prototype.toString;
    var __hasOwnProperty = Object.prototype.hasOwnProperty;
    var cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    var cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    function parse2(str, opt) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var len = str.length;
      if (len < 2)
        return obj;
      var dec = opt && opt.decode || decode;
      var index = 0;
      var eqIdx = 0;
      var endIdx = 0;
      do {
        eqIdx = str.indexOf("=", index);
        if (eqIdx === -1)
          break;
        endIdx = str.indexOf(";", index);
        if (endIdx === -1) {
          endIdx = len;
        } else if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        var keyStartIdx = startIndex(str, index, eqIdx);
        var keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        var key = str.slice(keyStartIdx, keyEndIdx);
        if (!__hasOwnProperty.call(obj, key)) {
          var valStartIdx = startIndex(str, eqIdx + 1, endIdx);
          var valEndIdx = endIndex(str, endIdx, valStartIdx);
          if (str.charCodeAt(valStartIdx) === 34 && str.charCodeAt(valEndIdx - 1) === 34) {
            valStartIdx++;
            valEndIdx--;
          }
          var val = str.slice(valStartIdx, valEndIdx);
          obj[key] = tryDecode(val, dec);
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function startIndex(str, index, max) {
      do {
        var code = str.charCodeAt(index);
        if (code !== 32 && code !== 9)
          return index;
      } while (++index < max);
      return max;
    }
    function endIndex(str, index, min) {
      while (index > min) {
        var code = str.charCodeAt(--index);
        if (code !== 32 && code !== 9)
          return index + 1;
      }
      return min;
    }
    function serialize(name, val, opt) {
      var enc = opt && opt.encode || encodeURIComponent;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (!opt)
        return str;
      if (null != opt.maxAge) {
        var maxAge = Math.floor(opt.maxAge);
        if (!isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + maxAge;
      }
      if (opt.domain) {
        if (!domainValueRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!pathValueRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        var expires = opt.expires;
        if (!isDate(expires) || isNaN(expires.valueOf())) {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.partitioned) {
        str += "; Partitioned";
      }
      if (opt.priority) {
        var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError("option priority is invalid");
        }
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function decode(str) {
      return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});
var import_cookie = __toESM(require_cookie());
var source_default = import_cookie.default;
/*! Bundled license information:

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
function parseCookies(input) {
  const parsedCookies = source_default.parse(input);
  const cookies = {};
  for (const cookieName in parsedCookies) {
    if (typeof parsedCookies[cookieName] !== "undefined") {
      cookies[cookieName] = parsedCookies[cookieName];
    }
  }
  return cookies;
}
function getAllDocumentCookies() {
  return parseCookies(document.cookie);
}
function getDocumentCookies(request) {
  if (typeof document === "undefined" || typeof location === "undefined") {
    return {};
  }
  switch (request.credentials) {
    case "same-origin": {
      const requestUrl = new URL(request.url);
      return location.origin === requestUrl.origin ? getAllDocumentCookies() : {};
    }
    case "include": {
      return getAllDocumentCookies();
    }
    default: {
      return {};
    }
  }
}
function getAllRequestCookies(request) {
  const requestCookieHeader = request.headers.get("cookie");
  const cookiesFromHeaders = requestCookieHeader ? parseCookies(requestCookieHeader) : {};
  const cookiesFromDocument = getDocumentCookies(request);
  for (const name in cookiesFromDocument) {
    request.headers.append(
      "cookie",
      source_default.serialize(name, cookiesFromDocument[name])
    );
  }
  const cookiesFromStore = cookieStore.getCookiesSync(request.url);
  const storedCookiesObject = Object.fromEntries(
    cookiesFromStore.map((cookie) => [cookie.key, cookie.value])
  );
  for (const cookie of cookiesFromStore) {
    request.headers.append("cookie", cookie.toString());
  }
  return {
    ...cookiesFromDocument,
    ...storedCookiesObject,
    ...cookiesFromHeaders
  };
}
var HttpMethods = /* @__PURE__ */ ((HttpMethods2) => {
  HttpMethods2["HEAD"] = "HEAD";
  HttpMethods2["GET"] = "GET";
  HttpMethods2["POST"] = "POST";
  HttpMethods2["PUT"] = "PUT";
  HttpMethods2["PATCH"] = "PATCH";
  HttpMethods2["OPTIONS"] = "OPTIONS";
  HttpMethods2["DELETE"] = "DELETE";
  return HttpMethods2;
})(HttpMethods || {});
class HttpHandler extends RequestHandler {
  constructor(method, path, resolver, options) {
    super({
      info: {
        header: `${method} ${path}`,
        path,
        method
      },
      resolver,
      options
    });
    this.checkRedundantQueryParameters();
  }
  checkRedundantQueryParameters() {
    const { method, path } = this.info;
    if (path instanceof RegExp) {
      return;
    }
    const url = cleanUrl(path);
    if (url === path) {
      return;
    }
    const searchParams = getSearchParams(path);
    searchParams.forEach((_, paramName) => {
    });
    devUtils.warn(
      `Found a redundant usage of query parameters in the request handler URL for "${method} ${path}". Please match against a path instead and access query parameters using "new URL(request.url).searchParams" instead. Learn more: https://mswjs.io/docs/recipes/query-parameters`
    );
  }
  async parse(args) {
    var _a3;
    const url = new URL(args.request.url);
    const match2 = matchRequestUrl(
      url,
      this.info.path,
      (_a3 = args.resolutionContext) == null ? void 0 : _a3.baseUrl
    );
    const cookies = getAllRequestCookies(args.request);
    return {
      match: match2,
      cookies
    };
  }
  predicate(args) {
    const hasMatchingMethod = this.matchMethod(args.request.method);
    const hasMatchingUrl = args.parsedResult.match.matches;
    return hasMatchingMethod && hasMatchingUrl;
  }
  matchMethod(actualMethod) {
    return this.info.method instanceof RegExp ? this.info.method.test(actualMethod) : isStringEqual(this.info.method, actualMethod);
  }
  extendResolverArgs(args) {
    var _a3;
    return {
      params: ((_a3 = args.parsedResult.match) == null ? void 0 : _a3.params) || {},
      cookies: args.parsedResult.cookies
    };
  }
  async log(args) {
    const publicUrl = toPublicUrl(args.request.url);
    const loggedRequest = await serializeRequest(args.request);
    const loggedResponse = await serializeResponse(args.response);
    const statusColor = getStatusCodeColor(loggedResponse.status);
    console.groupCollapsed(
      devUtils.formatMessage(
        `${getTimestamp()} ${args.request.method} ${publicUrl} (%c${loggedResponse.status} ${loggedResponse.statusText}%c)`
      ),
      `color:${statusColor}`,
      "color:inherit"
    );
    console.log("Request", loggedRequest);
    console.log("Handler:", this);
    console.log("Response", loggedResponse);
    console.groupEnd();
  }
}
function createHttpHandler(method) {
  return (path, resolver, options = {}) => {
    return new HttpHandler(method, path, resolver, options);
  };
}
const http = {
  all: createHttpHandler(/.+/),
  head: createHttpHandler(HttpMethods.HEAD),
  get: createHttpHandler(HttpMethods.GET),
  post: createHttpHandler(HttpMethods.POST),
  put: createHttpHandler(HttpMethods.PUT),
  delete: createHttpHandler(HttpMethods.DELETE),
  patch: createHttpHandler(HttpMethods.PATCH),
  options: createHttpHandler(HttpMethods.OPTIONS)
};
const bodyType = Symbol("bodyType");
const _HttpResponse = class _HttpResponse extends FetchResponse$1 {
  constructor(body, init) {
    const responseInit = normalizeResponseInit(init);
    super(body, responseInit);
    __publicField(this, _c2, null);
    decorateResponse(this, responseInit);
  }
  /**
   * Create a `Response` with a `Content-Type: "text/plain"` body.
   * @example
   * HttpResponse.text('hello world')
   * HttpResponse.text('Error', { status: 500 })
   */
  static text(body, init) {
    const responseInit = normalizeResponseInit(init);
    if (!responseInit.headers.has("Content-Type")) {
      responseInit.headers.set("Content-Type", "text/plain");
    }
    if (!responseInit.headers.has("Content-Length")) {
      responseInit.headers.set(
        "Content-Length",
        body ? new Blob([body]).size.toString() : "0"
      );
    }
    return new _HttpResponse(body, responseInit);
  }
  /**
   * Create a `Response` with a `Content-Type: "application/json"` body.
   * @example
   * HttpResponse.json({ firstName: 'John' })
   * HttpResponse.json({ error: 'Not Authorized' }, { status: 401 })
   */
  static json(body, init) {
    const responseInit = normalizeResponseInit(init);
    if (!responseInit.headers.has("Content-Type")) {
      responseInit.headers.set("Content-Type", "application/json");
    }
    const responseText = JSON.stringify(body);
    if (!responseInit.headers.has("Content-Length")) {
      responseInit.headers.set(
        "Content-Length",
        responseText ? new Blob([responseText]).size.toString() : "0"
      );
    }
    return new _HttpResponse(responseText, responseInit);
  }
  /**
   * Create a `Response` with a `Content-Type: "application/xml"` body.
   * @example
   * HttpResponse.xml(`<user name="John" />`)
   * HttpResponse.xml(`<article id="abc-123" />`, { status: 201 })
   */
  static xml(body, init) {
    const responseInit = normalizeResponseInit(init);
    if (!responseInit.headers.has("Content-Type")) {
      responseInit.headers.set("Content-Type", "text/xml");
    }
    return new _HttpResponse(body, responseInit);
  }
  /**
   * Create a `Response` with a `Content-Type: "text/html"` body.
   * @example
   * HttpResponse.html(`<p class="author">Jane Doe</p>`)
   * HttpResponse.html(`<main id="abc-123">Main text</main>`, { status: 201 })
   */
  static html(body, init) {
    const responseInit = normalizeResponseInit(init);
    if (!responseInit.headers.has("Content-Type")) {
      responseInit.headers.set("Content-Type", "text/html");
    }
    return new _HttpResponse(body, responseInit);
  }
  /**
   * Create a `Response` with an `ArrayBuffer` body.
   * @example
   * const buffer = new ArrayBuffer(3)
   * const view = new Uint8Array(buffer)
   * view.set([1, 2, 3])
   *
   * HttpResponse.arrayBuffer(buffer)
   */
  static arrayBuffer(body, init) {
    const responseInit = normalizeResponseInit(init);
    if (!responseInit.headers.has("Content-Type")) {
      responseInit.headers.set("Content-Type", "application/octet-stream");
    }
    if (body && !responseInit.headers.has("Content-Length")) {
      responseInit.headers.set("Content-Length", body.byteLength.toString());
    }
    return new _HttpResponse(body, responseInit);
  }
  /**
   * Create a `Response` with a `FormData` body.
   * @example
   * const data = new FormData()
   * data.set('name', 'Alice')
   *
   * HttpResponse.formData(data)
   */
  static formData(body, init) {
    return new _HttpResponse(body, normalizeResponseInit(init));
  }
};
_c2 = bodyType;
let HttpResponse = _HttpResponse;
checkGlobals();
const cartItemsMockData = [
  {
    id: 8014,
    quantity: 1,
    product: {
      id: 1,
      name: "에어포스1",
      price: 1e5,
      imageUrl: "https://kream-phinf.pstatic.net/MjAyNTA1MTNfMjI5/MDAxNzQ3MTA4MjUzOTg4.106G0-WfVU8g8ziNKgKJjc1_UXvF-2IatsA-Cz5mG1og.etXRFVPYqcs5J9HAfXpaHFPFHorGnZU4Nl7k4368rfog.PNG/a_090d2310040b4f9ca922f2498ae8ae3a.png?type=l",
      category: "패션잡화"
    }
  },
  {
    id: 8078,
    quantity: 2,
    product: {
      id: 2,
      name: "에어포스2",
      price: 1e4,
      imageUrl: "https://kream-phinf.pstatic.net/MjAyNTA1MTNfMjI5/MDAxNzQ3MTA4MjUzOTg4.106G0-WfVU8g8ziNKgKJjc1_UXvF-2IatsA-Cz5mG1og.etXRFVPYqcs5J9HAfXpaHFPFHorGnZU4Nl7k4368rfog.PNG/a_090d2310040b4f9ca922f2498ae8ae3a.png?type=l",
      category: "패션잡화"
    }
  },
  {
    id: 8079,
    quantity: 1,
    product: {
      id: 3,
      name: "에어포스3",
      price: 1e4,
      imageUrl: "https://kream-phinf.pstatic.net/MjAyNTA1MTNfMjI5/MDAxNzQ3MTA4MjUzOTg4.106G0-WfVU8g8ziNKgKJjc1_UXvF-2IatsA-Cz5mG1og.etXRFVPYqcs5J9HAfXpaHFPFHorGnZU4Nl7k4368rfog.PNG/a_090d2310040b4f9ca922f2498ae8ae3a.png?type=l",
      category: "패션잡화"
    }
  },
  {
    id: 8080,
    quantity: 1,
    product: {
      id: 4,
      name: "달 무드등",
      price: 28e3,
      imageUrl: "https://thumbnail6.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/794f/cecbea5bdc654a11ae02d28b4d1f4bd2a03a7389eb2b8cc4a45c1c9f7d9b.jpg",
      category: "패션잡화"
    }
  }
];
const baseURL = "http://techcourse-lv2-alb-974870821.ap-northeast-2.elb.amazonaws.com";
let inMemoryCartItems = [...cartItemsMockData];
const handlers = [
  http.get(`${baseURL}/cart-items`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "0", 10);
    const size = parseInt(url.searchParams.get("size") || "20", 10);
    const start = page * size;
    const end = start + size;
    const content = inMemoryCartItems.slice(start, end);
    const totalElements = inMemoryCartItems.length;
    const totalPages = Math.ceil(totalElements / size);
    return HttpResponse.json({
      content,
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        sort: {
          empty: false,
          sorted: true,
          unsorted: false
        },
        offset: 0,
        paged: true,
        unpaged: false
      },
      last: true,
      totalElements,
      totalPages,
      size,
      number: 0,
      sort: {
        empty: false,
        sorted: true,
        unsorted: false
      },
      first: true,
      numberOfElements: 20,
      empty: false
    });
  }),
  http.delete(`${baseURL}/cart-items/:id`, ({ params }) => {
    const { id } = params;
    inMemoryCartItems = inMemoryCartItems.filter(
      (item) => String(item.id) !== String(id)
    );
    return new HttpResponse(null, { status: 204 });
  }),
  http.patch(`${baseURL}/cart-items/:id`, async ({ params, request }) => {
    const { id } = params;
    const { quantity } = await request.json();
    inMemoryCartItems = inMemoryCartItems.map(
      (item) => String(item.id) === String(id) ? { ...item, quantity } : item
    );
    return HttpResponse.json(null, { status: 200 });
  })
];
const worker = setupWorker(...handlers);
export {
  worker
};
