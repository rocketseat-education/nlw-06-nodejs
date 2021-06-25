'use strict'

var path = require('path')

var parentRequire = require('parent-require')
var figlet = require('figlet')
var chalk = require('chalk')

module.exports = new Yargonaut()

function Yargonaut () {
  var self = this
  var yargs = hack()
  var fonts = {}
  var styles = {}
  var fontWorkaround = {}
  var styleWorkaround = {}
  var ocdf = null
  var defaultFont = 'Standard'

  var yargsKeys = {
    // supporting fonts and styles
    'Commands:': { transform: wholeString, error: false },
    'Options:': { transform: wholeString, error: false },
    'Examples:': { transform: wholeString, error: false },
    'Positionals:': { transform: wholeString, error: false },
    'Not enough non-option arguments: got %s, need at least %s': { transform: upToFirstColon, error: true },
    'Too many non-option arguments: got %s, maximum of %s': { transform: upToFirstColon, error: true },
    'Missing argument value: %s': { transform: upToFirstColon, error: true, plural: 'Missing argument values: %s' },
    'Missing required argument: %s': { transform: upToFirstColon, error: true, plural: 'Missing required arguments: %s' },
    'Unknown argument: %s': { transform: upToFirstColon, error: true, plural: 'Unknown arguments: %s' },
    'Invalid values:': { transform: wholeString, error: true },
    'Argument check failed: %s': { transform: upToFirstColon, error: true },
    'Implications failed:': { transform: wholeString, error: true },
    'Not enough arguments following: %s': { transform: upToFirstColon, error: true },
    'Invalid JSON config file: %s': { transform: upToFirstColon, error: true },
    'Did you mean %s?': { transform: wholeString, error: true },
    'Arguments %s and %s are mutually exclusive': { transform: wholeString, error: true },
    // supporting styles only (by default)
    'boolean': { transform: null, error: null },
    'count': { transform: null, error: null },
    'string': { transform: null, error: null },
    'array': { transform: null, error: null },
    'required': { transform: null, error: null },
    'default:': { transform: null, error: null },
    'choices:': { transform: null, error: null },
    'aliases:': { transform: null, error: null },
    'generated-value': { transform: null, error: null },
    'Argument: %s, Given: %s, Choices: %s': { transform: null, error: true }
  }

  // chainable config API methods
  self.help = function (font) {
    applyFont(font, self.getHelpKeys())
    return self
  }

  self.errors = function (font) {
    applyFont(font, self.getErrorKeys())
    return self
  }

  self.font = function (font, key) {
    var keys = key ? [].concat(key) : self.getAllKeys()
    applyFont(font, keys, key !== undefined)
    return self
  }

  self.helpStyle = function (style) {
    applyStyle(style, self.getHelpKeys())
    return self
  }

  self.errorsStyle = function (style) {
    applyStyle(style, self.getErrorKeys())
    return self
  }

  self.style = function (style, key) {
    var keys = key ? [].concat(key) : self.getAllKeys()
    applyStyle(style, keys)
    return self
  }

  self.transformWholeString = function (key) {
    var keys = key ? [].concat(key) : self.getAllKeys()
    applyTransform(wholeString, keys)
    return self
  }

  self.transformUpToFirstColon = function (key) {
    var keys = key ? [].concat(key) : self.getAllKeys()
    applyTransform(upToFirstColon, keys)
    return self
  }

  self.ocd = function (f) {
    if (typeof f === 'function') ocdf = f
    return self
  }

  // getter API methods
  self.getAllKeys = function () {
    return Object.keys(yargsKeys)
  }

  self.getHelpKeys = function () {
    return self.getAllKeys().filter(function (key) {
      return yargsKeys[key].error === false
    })
  }

  self.getErrorKeys = function () {
    return self.getAllKeys().filter(function (key) {
      return yargsKeys[key].error === true
    })
  }

  // methods for playing with fonts
  self.asFont = function (text, font, throwErr) {
    try {
      return figlet.textSync(text, { font: font || defaultFont })
    } catch (err) {
      if (throwErr) throw err
      return text
    }
  }

  self.listFonts = function () {
    return figlet.fontsSync()
  }

  self.printFont = function (font, text, throwErr) {
    font = font || defaultFont
    console.log('Font: ' + font + '\n' + self.asFont(text || font, font, throwErr))
  }

  self.printFonts = function (text, throwErr) {
    self.listFonts().forEach(function (f) {
      self.printFont(f, text, throwErr)
    })
  }

  self.figlet = function () {
    return figlet
  }

  self.chalk = function () {
    return chalk
  }

  // private transforms
  function wholeString (str) {
    return { render: str, nonRender: '' }
  }

  function upToFirstColon (str) {
    var firstColon = str.indexOf(':') + 1
    return { render: str.substring(0, firstColon), nonRender: '\n  ' + str.substring(firstColon) }
  }

  // private config methods
  function applyStyle (style, keys) {
    if (typeof style !== 'string') return
    keys.forEach(function (k) {
      styles[k] = style
    })
    if (yargs && yargs.updateLocale) applyStyleWorkaround(keys)
  }

  function applyFont (font, keys, force) {
    if (typeof font !== 'string') font = defaultFont
    keys.forEach(function (k) {
      fonts[k] = font
      if (!yargsKeys[k]) yargsKeys[k] = { transform: wholeString, error: null }
      else if (force && yargsKeys[k].transform === null) yargsKeys[k].transform = wholeString
    })
    if (yargs && yargs.updateLocale) applyFontWorkaround(keys)
  }

  function applyStyleWorkaround (keys) {
    var u = {}
    keys.forEach(function (k) {
      // cache non-font styled text in styleWorkaround
      if (yargsKeys[k] && yargsKeys[k].plural) {
        styleWorkaround[k] = {
          one: doStyle(k, k, styles[k]),
          other: doStyle(yargsKeys[k].plural, yargsKeys[k].plural, styles[k])
        }
      } else {
        styleWorkaround[k] = doStyle(k, k, styles[k])
      }
      u[k] = styleWorkaround[k]

      // style font-rendered text if defined
      if (fontWorkaround[k]) {
        if (typeof fontWorkaround[k] === 'string') u[k] = doStyle(k, fontWorkaround[k], styles[k])
        else {
          u[k] = {
            one: doStyle(k, fontWorkaround[k].one, styles[k]),
            other: doStyle(yargsKeys[k].plural, fontWorkaround[k].other, styles[k])
          }
        }
      }
    })
    yargs.updateLocale(u)
  }

  function applyFontWorkaround (keys) {
    var u = {}
    keys.forEach(function (k) {
      // cache non-styled font text in fontWorkaround
      if (yargsKeys[k] && yargsKeys[k].plural) {
        fontWorkaround[k] = {
          one: doRender(k, k, fonts[k]),
          other: doRender(yargsKeys[k].plural, yargsKeys[k].plural, fonts[k])
        }
      } else {
        fontWorkaround[k] = doRender(k, k, fonts[k])
      }
      u[k] = fontWorkaround[k]

      // render styled text if defined
      if (styleWorkaround[k]) {
        if (typeof styleWorkaround[k] === 'string') u[k] = doRender(k, styleWorkaround[k], fonts[k])
        else {
          u[k] = {
            one: doRender(k, styleWorkaround[k].one, fonts[k]),
            other: doRender(yargsKeys[k].plural, styleWorkaround[k].other, fonts[k])
          }
        }
      }
    })
    yargs.updateLocale(u)
  }

  function applyTransform (transform, keys) {
    keys.forEach(function (k) {
      if (!yargsKeys[k]) yargsKeys[k] = { transform: transform, error: null }
      else yargsKeys[k].transform = transform
    })
  }

  // private logic to intercept y18n methods
  function doStyle (key, orig, style) {
    var chain = chalk
    style.split('.').forEach(function (s) {
      if (chain[s]) chain = chain[s]
    })
    return typeof chain === 'function' ? chain(orig) : orig
  }

  function doRender (key, orig, font) {
    var fn = yargsKeys[key] ? yargsKeys[key].transform : upToFirstColon
    if (fn === null) return orig
    var split = fn(orig)
    return self.asFont(split.render, font) + split.nonRender
  }

  function hack () {
    var lookingFor = []
    lookingFor.push(path.join('yargs', 'node_modules', 'y18n', 'index.js')) // npm 2 = nested
    lookingFor.push(path.join('y18n', 'index.js')) // npm 3 = flat

    var found = findInModuleCache(lookingFor)

    if (found) {
      // console.log('yargonaut: You loaded yargs before yargonaut, only default locale supported')
      return parentRequireSafe('yargs')
    }

    var Y18n = parentRequireFirstOf(lookingFor)
    found = findInModuleCache(lookingFor)

    if (!found) {
      // console.log('yargonaut: You\'re using a version of yargs that does not support string customization')
      return parentRequireSafe('yargs')
    }

    require.cache[found].exports = function (opts) {
      var z18n = new Y18n(opts)
      var singular = z18n.__
      var plural = z18n.__n

      z18n.__ = function () {
        var orig = singular.apply(z18n, arguments)
        var key = arguments[0]
        if (fonts[key] && yargsKeys[key]) {
          return tweak(
            key,
            orig,
            doRender(key, orig, fonts[key]),
            figlet,
            fonts[key]
          )
        }
        return tweak(key, orig, orig, figlet, fonts[key])
      }

      z18n.__n = function () {
        var orig = plural.apply(z18n, arguments)
        var key = arguments[0]
        if (fonts[key] && yargsKeys[key]) {
          return tweak(
            key,
            orig,
            doRender(key, orig, fonts[key]),
            figlet,
            fonts[key]
          )
        }
        return tweak(key, orig, orig, figlet, fonts[key])
      }

      function tweak (key, origString, newString, figlet, font) {
        if (styles[key]) newString = doStyle(key, newString, styles[key])
        return ocdf ? ocdf(key, origString, newString, figlet, font) : newString
      }

      for (var key in z18n) {
        if (typeof z18n[key] === 'function') {
          z18n[key] = z18n[key].bind(z18n)
        }
      }

      return z18n
    }

    return null
  }

  function findInModuleCache (lookingFor) {
    var found = null
    for (var i = 0, files = Object.keys(require.cache); i < files.length; i++) {
      for (var j = 0; j < lookingFor.length; j++) {
        if (~files[i].lastIndexOf(lookingFor[j])) {
          found = files[i]
          break
        }
      }
      if (found) break
    }
    return found
  }

  function parentRequireFirstOf (array) {
    var success = null
    for (var x = 0; x < array.length; x++) {
      success = parentRequireSafe(array[x])
      if (success) break
    }
    return success
  }

  function parentRequireSafe (m) {
    try {
      return parentRequire(m)
    } catch (err) {
      return null
    }
  }
}
