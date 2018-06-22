(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("process/browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "process");
  (function() {
    // shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };
  })();
});

require.register("termly.js/dist/termly-prompt.min.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "termly.js");
  (function() {
    !function(t){function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};return e.m=t,e.c=n,e.i=function(t){return t},e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=17)}([function(t,e){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(n=window)}t.exports=n},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=e.name,o=e.fn,i=e.type,a=void 0===i?"usr":i,s=e.shell,u=void 0===s?void 0:s,c=e.man,l=void 0===c?"":c;if(r(this,t),"string"!=typeof n)throw Error("Command name must be a string");if("function"!=typeof o)throw Error("Command function must be... a function");this.fn=o.bind(this),this.name=n,this.type=a,this.man=l,u&&(this.shell=u)}return i(t,[{key:"exec",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if("object"!==("undefined"==typeof t?"undefined":o(t))||Array.isArray(t))throw Error("Command exec ARGV Must be an [Object]");return Object.keys(t).length?this.fn(t):this.fn()}}]),t}();t.exports=a},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var o=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),i=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=e.name,o=void 0===n?"":n,i=e.type,a=void 0===i?"file":i,s=e.content,u=void 0===s?"":s;r(this,t),this.uid=this.genUid(),this.name=o,this.type=a,this.content=u,this.user="root",this.group="root","file"===this.type?this.permission="rwxr--r--":this.permission="drwxr-xr-x"}return o(t,[{key:"genUid",value:function(){function t(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()}}]),t}();t.exports=i},function(t,e,n){"use strict";(function(e){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var a=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=n(5),c=n(4),l=n(8),f=function(t){function u(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.filesystem,i=void 0===e?void 0:e,s=t.commands,f=void 0===s?void 0:s,h=t.env,d=void 0===h?{}:h;r(this,u);var p=o(this,(u.__proto__||Object.getPrototypeOf(u)).call(this));return p.polyfills(),p.Classes={Command:n(1),File:n(2)},p.fs=new c(i,p),p.env=a({},l,d),p.ShellCommands=p.registerCommands(p),p.ShellCommands=a({},p.ShellCommands,p.registerCommands(p,f)),p}return i(u,t),s(u,[{key:"polyfills",value:function(){return e.Promise||(e.Promise=n(10).Promise),e.fetch||(e.fetch=n(14)),!0}},{key:"run",value:function(t){return this.exec(t)}}]),u}(u);t.exports=f}).call(e,n(0))},function(t,e,n){"use strict";function r(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=n(7),u=n(2),c=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:s,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(o(this,t),this.shell=n,"object"!==("undefined"==typeof e?"undefined":i(e))||Array.isArray(e))throw new Error("Virtual Filesystem provided not valid, initialization failed.");e=JSON.parse(JSON.stringify(e)),this.FileSystem=this.initFs(e),this.cwd=["/"]}return a(t,[{key:"initFs",value:function(t){this.buildVirtualFs(t);var e=new u({name:"/",content:t,type:"dir"});return e}},{key:"buildVirtualFs",value:function(t){for(var e in t)t.hasOwnProperty(e)&&("object"!==i(t[e])||Array.isArray(t[e])?t[e]=new u({name:e,content:t[e]}):(t[e]=new u({name:e,content:t[e],type:"dir"}),this.buildVirtualFs(t[e].content)))}},{key:"pathStringToArray",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";if(!t.length)throw new Error("Path cannot be empty");if(t.match(/\/{2,}/g))throw new Error("-invalid path: "+t);var e=t.split("/");return""===e[0]&&(e[0]="/"),"."===e[0]&&e.shift(),""===e[e.length-1]&&e.pop(),"/"!==e[0]&&(e=this.cwd.concat(e)),e}},{key:"pathArrayToString",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(!Array.isArray(t))throw new Error("-fatal filesystem: path must be an array");if(!t.length)throw new Error("-invalid filesystem: path not provided");var e=t.join("/");return e.replace(/\/{2,}/g,"/")}},{key:"fileWalker",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:["/"],e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.FileSystem;if(!Array.isArray(t))throw new Error("Path must be an array of nodes, use Filesystem.pathStringToArray({string})");if(t=t.slice(0),!t.length)return"dir"===e.type?e.content:e;var n=t.shift();if("/"!==n){var r=e.content[n];if(!r)throw new Error("File doesn't exist");e=r}return this.fileWalker(t,e)}},{key:"getNode",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";if(arguments[1],"string"!=typeof t)throw new Error("Invalid input.");var e=void 0,n=void 0;try{e=this.pathStringToArray(t),n=this.fileWalker(e)}catch(t){throw t}return{path:t,pathArray:e,node:n}}},{key:"changeDir",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=void 0;if(".."===t){var n=this.cwd.splice(0,this.cwd.length-1);if(!n.length)return"You are in the root directory";t=this.pathArrayToString(n)}try{e=this.getNode(t,"dir")}catch(t){throw t}if("file"===e.node.type)throw new Error(e.pathArray[e.pathArray.length-1]+" is a file not a directory");return this.cwd=e.pathArray,"changed directory: "+this.getCurrentDirectory()}},{key:"listDir",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=void 0;try{e=this.getNode(t,"dir")}catch(t){throw t}return"file"===e.node.type&&(e.node=r({},e.node.name,e.node)),e.node}},{key:"readFile",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=void 0;try{e=this.getNode(t,"file")}catch(t){throw t}if(!e.node.type)throw new Error(e.pathArray[e.pathArray.length-1]+" is a directory not a file");return e.node}},{key:"getCurrentDirectory",value:function(){var t=void 0;try{t=this.pathArrayToString(this.cwd)}catch(t){return"-invalid filesystem: An error occured while parsing current working directory to string."}return t}}]),t}();t.exports=c},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=n(1),s=n(12),u=function(){function t(){r(this,t)}return i(t,[{key:"parse",value:function(t){return new s(t)}},{key:"exec",value:function(t){var e=void 0;try{e=this.parse(t)}catch(t){return"-fatal command: "+(t.message||"Some Error Occured while parsing the command string.")}var n=this.ShellCommands[e.command];if(!n)return"-invalid shell: Command <"+e.command+"> doesn't exist.\n";var r=void 0;try{r=n.exec(e)}catch(t){return"-fatal "+e.command+": "+t.message}return this.format(r)}},{key:"format",value:function(t){return"function"==typeof t?"-invalid command: Command returned invalid data type.":void 0===t||"undefined"==typeof t?"-invalid command: Command returned no data.":t}},{key:"registerCommands",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0,r=n(6);if(e){if("object"!==("undefined"==typeof e?"undefined":o(e))||Array.isArray(e))throw new Error("Custom command provided are not in a valid format.");r=e}var i={};return Object.keys(r).map(function(e){var n=r[e];"string"==typeof n.name&&"function"==typeof n.fn&&(n.shell=t,i[e]=new a(n))}),i}}]),t}();t.exports=u},function(t,e,n){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},o=n(15),i=o.name,a=o.version,s=o.description,u=o.repository,c=o.author,l=o.license;t.exports={help:{name:"help",type:"builtin",man:"List of available commands\nType man <command> to have further info.",fn:function(){return"Commands available: "+Object.keys(this.shell.ShellCommands).join(", ")+'\nType "man <command>" to have further info.'}},whoami:{name:"whoami",type:"builtin",man:"Current user",fn:function(){return this.shell.user}},about:{name:"about",type:"builtin",man:"About this project",fn:function(){var t="";return t+="name: "+i+"\n",t+="version: "+a+"\n",t+="description: "+s+"\n",t+="repository: "+u+"\n",t+="author: "+c+"\n",t+="license: "+l+"\n"}},pwd:{name:"pwd",type:"builtin",man:"Print current working directory",fn:function(){return this.shell.fs.getCurrentDirectory()}},arguments:{name:"arguments",type:"builtin",man:"Return argument passed, used for testing purpose",fn:function(t){return JSON.stringify(t,null,2)}},printenv:{name:"printenv",type:"builtin",man:"Return environment variables",fn:function(){var t=this.shell.env,e="";return Object.keys(t).map(function(n){var o="object"!==r(t[n])||Array.isArray(t[n])?t[n]:JSON.stringify(t[n]);e+=n+"="+o+"\n"}),e}},export:{name:"export",type:"builtin",man:"Export a variable into the current environment",fn:function(t){if(!t||!t._.length)throw new Error("-fatal "+this.name+': Invalid syntax,\n correct syntax: export VAR=value or VAR="much value, such environment"');var e=t._,n=void 0,r=void 0;if(1===e.length){var o=e[0].split("=");n=o[0],r=o[1]}return e.length>1&&(n=e[0].replace(/=$/,""),r=e[1].replace(/(\'|\")/g,"")),this.shell.env[n]=r,n+"="+r}},cd:{name:"cd",type:"builtin",man:"Change directory, pass absolute or relative path: eg. cd /etc, cd / cd/my/nested/dir",fn:function(t){if(!t._.length)throw new Error("-invalid No path provided.");var e=t._.join();try{return this.shell.fs.changeDir(e)}catch(t){throw t}}},ls:{name:"ls",type:"builtin",man:"list directory files, pass absolute/relative path, if empty list current directory",fn:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{_:["./"]};t._.length||t._.push(".");var e=t._.join(),n=void 0,r="";try{n=this.shell.fs.listDir(e)}catch(t){throw t}for(var o in n)n.hasOwnProperty(o)&&(r+=n[o].permission+"\t"+n[o].user+" "+n[o].group+"\t"+n[o].name+"\n");return r}},cat:{name:"cat",type:"builtin",man:"Return file content, take one argument: file path (relative/absolute)",fn:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{_:["./"]},e=t._.join(),n=void 0;try{n=this.shell.fs.readFile(e)}catch(t){throw t}return n.content}},man:{name:"man",type:"builtin",man:"Command manual, takes one argument, command name",fn:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(!t._[0])throw new Error("man: no command provided.");var e=t._[0];if(!this.shell.ShellCommands[e])throw new Error("command doesn't exist.");if(!this.shell.ShellCommands[e].man)throw new Error("no manual entry for this command.");return this.shell.ShellCommands[e].man}},http:{name:"http",type:"builtin",man:"Send HTTP requests.\n syntax: http [OPTIONS FLAGS] URL.\neg: http -m GET http://jsonplaceholder.typicode.com/\n    options:\n    \t-m --method POST,GET,PUT,DELETE\n     \t--body must be an object, and MUST use single quoets inside eg: --body=\"{ 'data': '1' }\"\n     ",fn:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(!t._.length)throw new Error("http: no URL provided, provide URL and/or method \n help: "+this.shell.ShellCommands.http.man);var e=t.method||t.m||"GET",n=t._[0],r=void 0;if(t.body)try{r=JSON.stringify(JSON.parse(t.body.replace(/\'/g,'"')))}catch(t){throw console.log(t),new Error("Body provided is not a valid JSON")}var o={method:e,headers:{"Content-Type":"application/json"}};return"GET"!==e&&(o.body=r),fetch(n,o).then(function(t){if(t.ok)return t.json();throw new Error("Request Failed ("+(t.status||500)+"): "+(t.statusText||"Some Error Occured."))}).catch(function(t){throw new Error("-fetch error response returned but it was not a valid JSON. Cannot Parse.")})}}}},function(t,e,n){"use strict";t.exports={"file.h":"#include <nope.h>",etc:{apache2:{"apache2.conf":"Not What you were looking for :)"}},home:{guest:{docs:{"mydoc.md":"TestFile","mydoc2.md":"TestFile2","mydoc3.md":"TestFile3"}}},root:{".zshrc":"not even close :)",".oh-my-zsh":{themes:{}}}}},function(t,e,n){"use strict";(function(e){var n=e||window,r=n.location;t.exports={USER:"root",HOSTNAME:r&&r.hostname.length?r.hostname:"my.host.me"}}).call(e,n(0))},function(t,e){function n(){throw new Error("setTimeout has not been defined")}function r(){throw new Error("clearTimeout has not been defined")}function o(t){if(l===setTimeout)return setTimeout(t,0);if((l===n||!l)&&setTimeout)return l=setTimeout,setTimeout(t,0);try{return l(t,0)}catch(e){try{return l.call(null,t,0)}catch(e){return l.call(this,t,0)}}}function i(t){if(f===clearTimeout)return clearTimeout(t);if((f===r||!f)&&clearTimeout)return f=clearTimeout,clearTimeout(t);try{return f(t)}catch(e){try{return f.call(null,t)}catch(e){return f.call(this,t)}}}function a(){y&&d&&(y=!1,d.length?p=d.concat(p):m=-1,p.length&&s())}function s(){if(!y){var t=o(a);y=!0;for(var e=p.length;e;){for(d=p,p=[];++m<e;)d&&d[m].run();m=-1,e=p.length}d=null,y=!1,i(t)}}function u(t,e){this.fun=t,this.array=e}function c(){}var l,f,h=t.exports={};!function(){try{l="function"==typeof setTimeout?setTimeout:n}catch(t){l=n}try{f="function"==typeof clearTimeout?clearTimeout:r}catch(t){f=r}}();var d,p=[],y=!1,m=-1;h.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];p.push(new u(t,e)),1!==p.length||y||o(s)},u.prototype.run=function(){this.fun.apply(null,this.array)},h.title="browser",h.browser=!0,h.env={},h.argv=[],h.version="",h.versions={},h.on=c,h.addListener=c,h.once=c,h.off=c,h.removeListener=c,h.removeAllListeners=c,h.emit=c,h.binding=function(t){throw new Error("process.binding is not supported")},h.cwd=function(){return"/"},h.chdir=function(t){throw new Error("process.chdir is not supported")},h.umask=function(){return 0}},function(t,e,n){(function(e){!function(n){function r(){}function o(t,e){return function(){t.apply(e,arguments)}}function i(t){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],f(t,this)}function a(t,e){for(;3===t._state;)t=t._value;return 0===t._state?void t._deferreds.push(e):(t._handled=!0,void i._immediateFn(function(){var n=1===t._state?e.onFulfilled:e.onRejected;if(null===n)return void(1===t._state?s:u)(e.promise,t._value);var r;try{r=n(t._value)}catch(t){return void u(e.promise,t)}s(e.promise,r)}))}function s(t,e){try{if(e===t)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if(e instanceof i)return t._state=3,t._value=e,void c(t);if("function"==typeof n)return void f(o(n,e),t)}t._state=1,t._value=e,c(t)}catch(e){u(t,e)}}function u(t,e){t._state=2,t._value=e,c(t)}function c(t){2===t._state&&0===t._deferreds.length&&i._immediateFn(function(){t._handled||i._unhandledRejectionFn(t._value)});for(var e=0,n=t._deferreds.length;e<n;e++)a(t,t._deferreds[e]);t._deferreds=null}function l(t,e,n){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=n}function f(t,e){var n=!1;try{t(function(t){n||(n=!0,s(e,t))},function(t){n||(n=!0,u(e,t))})}catch(t){if(n)return;n=!0,u(e,t)}}var h=setTimeout;i.prototype.catch=function(t){return this.then(null,t)},i.prototype.then=function(t,e){var n=new this.constructor(r);return a(this,new l(t,e,n)),n},i.all=function(t){var e=Array.prototype.slice.call(t);return new i(function(t,n){function r(i,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var s=a.then;if("function"==typeof s)return void s.call(a,function(t){r(i,t)},n)}e[i]=a,0===--o&&t(e)}catch(t){n(t)}}if(0===e.length)return t([]);for(var o=e.length,i=0;i<e.length;i++)r(i,e[i])})},i.resolve=function(t){return t&&"object"==typeof t&&t.constructor===i?t:new i(function(e){e(t)})},i.reject=function(t){return new i(function(e,n){n(t)})},i.race=function(t){return new i(function(e,n){for(var r=0,o=t.length;r<o;r++)t[r].then(e,n)})},i._immediateFn="function"==typeof e&&function(t){e(t)}||function(t){h(t,0)},i._unhandledRejectionFn=function(t){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",t)},i._setImmediateFn=function(t){i._immediateFn=t},i._setUnhandledRejectionFn=function(t){i._unhandledRejectionFn=t},"undefined"!=typeof t&&t.exports?t.exports=i:n.Promise||(n.Promise=i)}(this)}).call(e,n(13).setImmediate)},function(t,e,n){(function(t,e){!function(t,n){"use strict";function r(t){"function"!=typeof t&&(t=new Function(""+t));for(var e=new Array(arguments.length-1),n=0;n<e.length;n++)e[n]=arguments[n+1];var r={callback:t,args:e};return y[p]=r,d(p),p++}function o(t){delete y[t]}function i(t){var e=t.callback,r=t.args;switch(r.length){case 0:e();break;case 1:e(r[0]);break;case 2:e(r[0],r[1]);break;case 3:e(r[0],r[1],r[2]);break;default:e.apply(n,r)}}function a(t){if(m)setTimeout(a,0,t);else{var e=y[t];if(e){m=!0;try{i(e)}finally{o(t),m=!1}}}}function s(){d=function(t){e.nextTick(function(){a(t)})}}function u(){if(t.postMessage&&!t.importScripts){var e=!0,n=t.onmessage;return t.onmessage=function(){e=!1},t.postMessage("","*"),t.onmessage=n,e}}function c(){var e="setImmediate$"+Math.random()+"$",n=function(n){n.source===t&&"string"==typeof n.data&&0===n.data.indexOf(e)&&a(+n.data.slice(e.length))};t.addEventListener?t.addEventListener("message",n,!1):t.attachEvent("onmessage",n),d=function(n){t.postMessage(e+n,"*")}}function l(){var t=new MessageChannel;t.port1.onmessage=function(t){var e=t.data;a(e)},d=function(e){t.port2.postMessage(e)}}function f(){var t=v.documentElement;d=function(e){var n=v.createElement("script");n.onreadystatechange=function(){a(e),n.onreadystatechange=null,t.removeChild(n),n=null},t.appendChild(n)}}function h(){d=function(t){setTimeout(a,0,t)}}if(!t.setImmediate){var d,p=1,y={},m=!1,v=t.document,b=Object.getPrototypeOf&&Object.getPrototypeOf(t);b=b&&b.setTimeout?b:t,"[object process]"==={}.toString.call(t.process)?s():u()?c():t.MessageChannel?l():v&&"onreadystatechange"in v.createElement("script")?f():h(),b.setImmediate=r,b.clearImmediate=o}}("undefined"==typeof self?"undefined"==typeof t?this:t:self)}).call(e,n(0),n(9))},function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var o=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),i=function(){function t(e){if(r(this,t),!e||!e.length)throw new Error("Parser: command provided is empty.");if("string"!=typeof e)throw new Error("Parser: command must be a string!");this.raw=e;var n=this.stringToArray(e.replace(/\s{2,}/g,"").replace(/\t|\n/g," "));if(this.command=n[0],this._=[],n.length){var o=this.parse(n.slice(1));if(!Object.assign){for(var i in o)o.hasOwnProperty(i)&&(this[i]=o[i]);return!0}return Object.assign(this,o)}}return o(t,[{key:"stringToArray",value:function(t){return t.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g)}},{key:"parse",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!t.length)return e;if(t[0].match(/^\-[^\-].*/)){var n=t[0].replace("-","");return t[1]&&t[1].match(/^\-.*/)?(e[n]=!0,this.parse(t.splice(1),e)):t[1]?(e[n]=t[1],this.parse(t.splice(2),e)):(e[n]=!0,this.parse(t.splice(1),e))}if(t[0].match(/^\-{2}.*\=$/)){var r=t[0].match(/--(.*)=/)[1];return e[r]=t[1].replace(/"/g,""),this.parse(t.splice(2),e)}if(t[0].match(/^\-{2}.*\={1}.*$/)){var o=t[0].match(/\-{2}(.*)=/)[1];return e[o]=t[0].match(/\={1}(.*)/)[1],this.parse(t.splice(1),e)}if(t[0].match(/^\-{2}.*$/)){var i=t[0].replace("--","");if(!t[1]||t[1]&&t[1].match(/^\-{1,}/))return e[i]=!0,this.parse(t.slice(1),e);if(t[1]&&!t[1].match(/^\-{1,}/))return e[i]=t[1],this.parse(t.slice(2),e)}return this._.push(t.shift()),this.parse(t,e)}}]),t}();try{t.exports=i}catch(t){}},function(t,e,n){function r(t,e){this._id=t,this._clearFn=e}var o=Function.prototype.apply;e.setTimeout=function(){return new r(o.call(setTimeout,window,arguments),clearTimeout)},e.setInterval=function(){return new r(o.call(setInterval,window,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t&&t.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(window,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},n(11),e.setImmediate=setImmediate,e.clearImmediate=clearImmediate},function(t,e){!function(t){"use strict";function e(t){if("string"!=typeof t&&(t=String(t)),/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(t))throw new TypeError("Invalid character in header field name");return t.toLowerCase()}function n(t){return"string"!=typeof t&&(t=String(t)),t}function r(t){var e={next:function(){var e=t.shift();return{done:void 0===e,value:e}}};return v.iterable&&(e[Symbol.iterator]=function(){return e}),e}function o(t){this.map={},t instanceof o?t.forEach(function(t,e){this.append(e,t)},this):t&&Object.getOwnPropertyNames(t).forEach(function(e){this.append(e,t[e])},this)}function i(t){return t.bodyUsed?Promise.reject(new TypeError("Already read")):void(t.bodyUsed=!0)}function a(t){return new Promise(function(e,n){t.onload=function(){e(t.result)},t.onerror=function(){n(t.error)}})}function s(t){var e=new FileReader,n=a(e);return e.readAsArrayBuffer(t),n}function u(t){var e=new FileReader,n=a(e);return e.readAsText(t),n}function c(t){for(var e=new Uint8Array(t),n=new Array(e.length),r=0;r<e.length;r++)n[r]=String.fromCharCode(e[r]);return n.join("")}function l(t){if(t.slice)return t.slice(0);var e=new Uint8Array(t.byteLength);return e.set(new Uint8Array(t)),e.buffer}function f(){return this.bodyUsed=!1,this._initBody=function(t){if(this._bodyInit=t,t)if("string"==typeof t)this._bodyText=t;else if(v.blob&&Blob.prototype.isPrototypeOf(t))this._bodyBlob=t;else if(v.formData&&FormData.prototype.isPrototypeOf(t))this._bodyFormData=t;else if(v.searchParams&&URLSearchParams.prototype.isPrototypeOf(t))this._bodyText=t.toString();else if(v.arrayBuffer&&v.blob&&w(t))this._bodyArrayBuffer=l(t.buffer),this._bodyInit=new Blob([this._bodyArrayBuffer]);else{if(!v.arrayBuffer||!ArrayBuffer.prototype.isPrototypeOf(t)&&!g(t))throw new Error("unsupported BodyInit type");this._bodyArrayBuffer=l(t)}else this._bodyText="";this.headers.get("content-type")||("string"==typeof t?this.headers.set("content-type","text/plain;charset=UTF-8"):this._bodyBlob&&this._bodyBlob.type?this.headers.set("content-type",this._bodyBlob.type):v.searchParams&&URLSearchParams.prototype.isPrototypeOf(t)&&this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8"))},v.blob&&(this.blob=function(){var t=i(this);if(t)return t;if(this._bodyBlob)return Promise.resolve(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(new Blob([this._bodyArrayBuffer]));if(this._bodyFormData)throw new Error("could not read FormData body as blob");return Promise.resolve(new Blob([this._bodyText]))},this.arrayBuffer=function(){return this._bodyArrayBuffer?i(this)||Promise.resolve(this._bodyArrayBuffer):this.blob().then(s)}),this.text=function(){var t=i(this);if(t)return t;if(this._bodyBlob)return u(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(c(this._bodyArrayBuffer));if(this._bodyFormData)throw new Error("could not read FormData body as text");return Promise.resolve(this._bodyText)},v.formData&&(this.formData=function(){return this.text().then(p)}),this.json=function(){return this.text().then(JSON.parse)},this}function h(t){var e=t.toUpperCase();return T.indexOf(e)>-1?e:t}function d(t,e){e=e||{};var n=e.body;if(t instanceof d){if(t.bodyUsed)throw new TypeError("Already read");this.url=t.url,this.credentials=t.credentials,e.headers||(this.headers=new o(t.headers)),this.method=t.method,this.mode=t.mode,n||null==t._bodyInit||(n=t._bodyInit,t.bodyUsed=!0)}else this.url=String(t);if(this.credentials=e.credentials||this.credentials||"omit",!e.headers&&this.headers||(this.headers=new o(e.headers)),this.method=h(e.method||this.method||"GET"),this.mode=e.mode||this.mode||null,this.referrer=null,("GET"===this.method||"HEAD"===this.method)&&n)throw new TypeError("Body not allowed for GET or HEAD requests");this._initBody(n)}function p(t){var e=new FormData;return t.trim().split("&").forEach(function(t){if(t){var n=t.split("="),r=n.shift().replace(/\+/g," "),o=n.join("=").replace(/\+/g," ");e.append(decodeURIComponent(r),decodeURIComponent(o))}}),e}function y(t){var e=new o;return t.split(/\r?\n/).forEach(function(t){var n=t.split(":"),r=n.shift().trim();if(r){var o=n.join(":").trim();e.append(r,o)}}),e}function m(t,e){e||(e={}),this.type="default",this.status="status"in e?e.status:200,this.ok=this.status>=200&&this.status<300,this.statusText="statusText"in e?e.statusText:"OK",this.headers=new o(e.headers),this.url=e.url||"",this._initBody(t)}if(!t.fetch){var v={searchParams:"URLSearchParams"in t,iterable:"Symbol"in t&&"iterator"in Symbol,blob:"FileReader"in t&&"Blob"in t&&function(){try{return new Blob,!0}catch(t){return!1}}(),formData:"FormData"in t,arrayBuffer:"ArrayBuffer"in t};if(v.arrayBuffer)var b=["[object Int8Array]","[object Uint8Array]","[object Uint8ClampedArray]","[object Int16Array]","[object Uint16Array]","[object Int32Array]","[object Uint32Array]","[object Float32Array]","[object Float64Array]"],w=function(t){return t&&DataView.prototype.isPrototypeOf(t)},g=ArrayBuffer.isView||function(t){return t&&b.indexOf(Object.prototype.toString.call(t))>-1};o.prototype.append=function(t,r){t=e(t),r=n(r);var o=this.map[t];this.map[t]=o?o+","+r:r},o.prototype.delete=function(t){delete this.map[e(t)]},o.prototype.get=function(t){return t=e(t),this.has(t)?this.map[t]:null},o.prototype.has=function(t){return this.map.hasOwnProperty(e(t))},o.prototype.set=function(t,r){this.map[e(t)]=n(r)},o.prototype.forEach=function(t,e){for(var n in this.map)this.map.hasOwnProperty(n)&&t.call(e,this.map[n],n,this)},o.prototype.keys=function(){var t=[];return this.forEach(function(e,n){t.push(n)}),r(t)},o.prototype.values=function(){var t=[];return this.forEach(function(e){t.push(e)}),r(t)},o.prototype.entries=function(){var t=[];return this.forEach(function(e,n){t.push([n,e])}),r(t)},v.iterable&&(o.prototype[Symbol.iterator]=o.prototype.entries);var T=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];d.prototype.clone=function(){return new d(this,{body:this._bodyInit})},f.call(d.prototype),f.call(m.prototype),m.prototype.clone=function(){return new m(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new o(this.headers),url:this.url})},m.error=function(){var t=new m(null,{status:0,statusText:""});return t.type="error",t};var _=[301,302,303,307,308];m.redirect=function(t,e){if(_.indexOf(e)===-1)throw new RangeError("Invalid status code");return new m(null,{status:e,headers:{location:t}})},t.Headers=o,t.Request=d,t.Response=m,t.fetch=function(t,e){return new Promise(function(n,r){var o=new d(t,e),i=new XMLHttpRequest;i.onload=function(){var t={status:i.status,statusText:i.statusText,headers:y(i.getAllResponseHeaders()||"")};t.url="responseURL"in i?i.responseURL:t.headers.get("X-Request-URL");var e="response"in i?i.response:i.responseText;n(new m(e,t))},i.onerror=function(){r(new TypeError("Network request failed"))},i.ontimeout=function(){r(new TypeError("Network request failed"))},i.open(o.method,o.url,!0),"include"===o.credentials&&(i.withCredentials=!0),"responseType"in i&&v.blob&&(i.responseType="blob"),o.headers.forEach(function(t,e){i.setRequestHeader(e,t)}),i.send("undefined"==typeof o._bodyInit?null:o._bodyInit)})},t.fetch.polyfill=!0}}("undefined"!=typeof self?self:this)},function(t,e){t.exports={name:"termly.js",version:"2.5.5",description:"Simple, Extensible, Hackable and Lightweight Javascript Browser Terminal Simulator!",main:"bin/classes/Shell.js",scripts:{test:"mocha --compilers babel-core/register tests/",build:"NODE_ENV=production webpack -p","build:dev":"webpack -w"},keywords:["terminal","javascript","simulator","browser","presentation","mockup","demo","cli","prompt","commands","no depency","lightweight","hackable","js","vanilla"],repository:"https://github.com/Kirkhammetz/termly.js",author:"Simone Corsi",license:"GNU GPLv3",devDependencies:{babel:"^6.5.2","babel-core":"^6.21.0","babel-loader":"^6.2.10","babel-plugin-transform-object-rest-spread":"^6.22.0","babel-polyfill":"^6.22.0","babel-preset-es2015":"^6.18.0","babel-preset-stage-3":"^6.22.0",chai:"^3.5.0",gulp:"^3.9.1","gulp-sass":"^3.1.0",mocha:"^3.2.0","promise-polyfill":"^6.0.2","string-to-argv.js":"^1.1.2",webpack:"beta","whatwg-fetch":"^2.0.2"}}},function(t,e,n){
"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=n(3),c=function(t){function e(){var t,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:void 0,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};r(this,e);var a=o(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i));if(!n)throw new Error("No wrapper element selector provided");try{if(a.container=document.querySelector(n),!a.container)throw new Error("new Terminal(): DOM element not found")}catch(t){throw new Error("new Terminal(): Not valid DOM selector.")}return t=a.init(),o(a,t)}return i(e,t),s(e,[{key:"init",value:function(){var t=this;this.generateRow(),this.container.addEventListener("click",function(e){e.stopPropagation();var n=t.container.querySelector(".current .terminal-input");n&&n.focus()})}},{key:"generateRow",value:function(){var t=this,e=document.querySelector(".current.terminal-row");e&&(e.classList.remove("current"),e.querySelector("input").disabled=!0);var n=document.querySelector(".terminal-input");n&&(n.removeEventListener("input",this.resizeHandler),n.blur());var r=document.createElement("div");r.classList.add("current","terminal-row"),r.innerHTML="",r.innerHTML+='<span class="terminal-info">'+this.env.USER+"@"+this.env.HOSTNAME+" - "+this.fs.getCurrentDirectory()+" ➜ </span>",r.innerHTML+='<input type="text" class="terminal-input" size="2" style="cursor:none;">',this.container.appendChild(r);var o=this.container.querySelector(".current .terminal-input"),i=this.container.querySelector(".current.terminal-row"),a=i.querySelector(".terminal-info"),s=i.offsetWidth-a.offsetWidth-20;return o.style.width=s+"px",o.addEventListener("keyup",function(e){return t.submitHandler(e)}),o.select(),this.container.scrollTop=this.container.scrollHeight+1,o}},{key:"generateOutput",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];Array.isArray(t)&&(t=t.join("\n"));var n=document.createElement("pre");if(n.textContent=t,n.className="terminal-output",this.container.appendChild(n),e)return this.generateRow()}},{key:"clear",value:function(){return this.container.innerHTML="",this.generateRow()}},{key:"submitHandler",value:function(t){var e=this;if(13==t.which||13==t.keyCode){t.preventDefault();var n=t.target.value.trim();if("clear"===n)return this.clear();var r=this.run(n);return r.then?(this.generateOutput("Pending request...",!1),r.then(function(t){if("object"===("undefined"==typeof t?"undefined":a(t)))try{t=JSON.stringify(t,null,2)}catch(t){return e.generateOutput("-fatal http: Response received but had a problem parsing it.")}return e.generateOutput(t)}).catch(function(t){return e.generateOutput(t.message)})):(("object"===("undefined"==typeof r?"undefined":a(r))||Array.isArray(r))&&(r=JSON.stringify(r,null,2)),this.generateOutput(r))}}}]),e}(u);t.exports=c},function(t,e,n){"use strict";(function(t){t.TermlyPrompt=n(16)}).call(e,n(0))}]);
  })();
});
require.register("commands.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listSingleEvent = listSingleEvent;
exports.listEvents = listEvents;
exports.nextEvent = nextEvent;
exports.previousEvent = previousEvent;

var _events = require('./events.js');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var now = new Date();
var month = ('0' + (now.getMonth() + 1)).slice(-2);
var day = ('0' + now.getDate()).slice(-2);
var today = now.getFullYear() + '-' + month + '-' + day;

function listSingleEvent(date) {
  if (!/20[0-9]{2}-(10|11|12|0[0-9])-(0[1-9]|[12]\d|3[01])/.test(date)) {
    return date + ' is not a valid date (YYYY-MM-DD). Try again?';
  } else if (!_events2.default[date]) {
    return 'No event found for ' + date + '. Try again?';
  } else {
    var event = _events2.default[date];
    var output = [];
    output.push('KL Code Club v' + event.version + ' | ' + date);

    if (today > date) {
      output[0] += ' (past)';
      output.push('View details:\n' + event.url);
    } else {
      if (today === date) {
        output[0] += ' (today)';
      }
      output.push('Register to attend:\n' + event.url);
    }

    // Divider
    output[0] += "\n-" + Array(output[0].length).join('-');

    return output.join("\n\n");
  }
}

function listEvents() {
  var dates = Object.keys(_events2.default).sort(function (a, b) {
    return b < a ? -1 : 1;
  });

  return dates.map(listSingleEvent).join("\n\n");
}

function nextEvent() {
  var dates = Object.keys(_events2.default).filter(function (date) {
    return date >= today;
  }).sort(function (a, b) {
    return b > a ? -1 : 1;
  });

  if (dates.length) {
    return listSingleEvent(dates[0]);
  } else {
    return 'Next event has yet to be scheduled. Stay tuned!';
  }
}

function previousEvent() {
  var dates = Object.keys(_events2.default).filter(function (date) {
    return date < today;
  }).sort(function (a, b) {
    return b < a ? -1 : 1;
  });

  if (dates.length) {
    return listSingleEvent(dates[0]);
  }
}
});

;require.register("events.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  "2018-06-23": {
    "version": "0.0.2",
    "url": "https://klcodeclub002.peatix.com/"
  },
  "2018-05-05": {
    "version": "0.0.1",
    "url": "https://klcodeclub1.peatix.com/"
  }
};
});

;require.register("package.js", function(exports, require, module) {
'use strict';

require('termly.js/dist/termly-prompt.min');

var _commands = require('./commands');

// Importing the /bin/ version doesn't work, possibly due to `require`
// collision with brunch?
new TermlyPrompt('#terminal', {
  commands: {
    klcodeclub: {
      name: 'klcodeclub',
      man: 'The first rule of Code Club is: You must commit code.',
      fn: function klcodeclub(ARGV) {
        if (ARGV.l || ARGV.list) {
          var arg = ARGV.l || ARGV.list;
          if (arg !== true) {
            return (0, _commands.listSingleEvent)(arg);
          }
          return (0, _commands.listEvents)();
        } else if (ARGV.n || ARGV.next) {
          return (0, _commands.nextEvent)();
        } else if (ARGV.p || ARGV.previous) {
          return (0, _commands.previousEvent)();
        } else {
          return helpInfo();
        }
      }
    }
  },
  env: {
    USER: 'visitor',
    HOSTNAME: 'klcc'
  }
});

function helpInfo() {
  return 'The first rule of Code Club is: You must commit code.\nThe second rule of Code Club is: You must commit code!\n\nUsage: klcodeclub [options]\n\n-h, --help                Make helpful text appear.\n\n-l, --list[=YYYY-MM-DD]   List all events. Pass a date to get info about a\n                          specific event.\n\n-n, --next                Get info about the next event.\n\n-n, --previous            Get info about the previous event.\n';
}
});

;require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

require('package.js');
//# sourceMappingURL=package.js.map