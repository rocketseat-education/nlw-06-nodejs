# yargonaut

> Decorate yargs content with chalk styles and figlet fonts

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![npm version](https://img.shields.io/npm/v/yargonaut.svg)](https://npmjs.org/package/yargonaut)
![yargs + chalk + figlet = yes please](https://img.shields.io/badge/yargs%20%2B%20chalk%20%2B%20figlet-yes%2C%20please!-ff69b4.svg)

yargonaut is *the* content decorator for [yargs](https://www.npmjs.com/package/yargs),
allowing you to customize your yargs-based CLI output using
[chalk](https://www.npmjs.com/package/chalk) [styles](https://www.npmjs.com/package/chalk#styles)
and/or [figlet](https://www.npmjs.com/package/figlet) fonts ... easily!

![yargonaut-demo](https://cloud.githubusercontent.com/assets/1929625/9726791/ae6830ac-55c5-11e5-9af4-968844a9f5fa.gif)

*Why?* Because CLI apps with color and ASCII Art are more fun!

*Could you customize yargs text, possibly using chalk or figlet, without yargonaut?* Absolutely. But yargonaut makes it so easy! And yargonaut supports all locales that yargs and figlet support - out of the box.

*Could terminal coloring or ASCII Art fonts be annoying in CLI apps?* Well, sure. But used tastefully, it can add a degree of creative flair to make your CLI stand out. Use wisely!

# Install

```
npm install --save yargonaut yargs
```

```js
var yargonaut = require('yargonaut') // yargonaut first!
var yargs = require('yargs') // then yargs
```

yargonaut assumes you have yargs installed independently.

To automatically support all locales that yargs supports, make sure to `require('yargonaut')` in code *before* you `require('yargs')`. **This is important!** If you choose to ignore this, yargonaut will attempt workarounds as best it can, but any issues caused by incorrect ordering of `require()` statements will **not** be given priority. The ordering should be natural, since you'll need to configure yargonaut before yargs parses CLI args anyway.

Note that yargonaut **does not** wrap yargs and **is not** a replacement for yargs. It's built to work with yargs side-by-side, and it doesn't lock you in to a particular version of yargs, though internal string customization is only supported in yargs v3.16.1 and up.

If anything goes wrong, yargonaut attempts to fail gracefully and silently, so your CLI still works, just without the cool colors/fonts.

# Examples

## Use a single style and font for all top-level yargs strings:

```js
require('yargonaut')
  .style('blue')
  .font('Small Slant') // that's it!

var argv = require('yargs')
  .command('add', 'Add item to cart')
  .command('rm', 'Remove item from cart')
  .option('p', {
    alias: 'product',
    describe: 'Product id(s)',
    demand: true
  })
  .option('s', {
    alias: 'size',
    describe: 'Desired product size',
    choices: ['s', 'm', 'l'],
    default: 'm'
  })
  .option('c', {
    alias: 'color',
    describe: 'Desired product color'
  })
  .example('$0 add -p 123 -s l -c green', 'Add large, green product with id 123')
  .wrap(null)
  .argv
```

```
$ node order.js
  _____                              __    _
 / ___/__  __ _  __ _  ___ ____  ___/ /__ (_)
/ /__/ _ \/  ' \/  ' \/ _ `/ _ \/ _  (_-<_
\___/\___/_/_/_/_/_/_/\_,_/_//_/\_,_/___(_)

  add  Add item to cart
  rm   Remove item from cart

  ____       __  _               _
 / __ \___  / /_(_)__  ___  ___ (_)
/ /_/ / _ \/ __/ / _ \/ _ \(_-<_
\____/ .__/\__/_/\___/_//_/___(_)
    /_/
  -p, --product  Product id(s)  [required]
  -s, --size     Desired product size  [choices: "s", "m", "l"] [default: "m"]
  -c, --color    Desired product color

   ____                     __        _
  / __/_ _____ ___ _  ___  / /__ ___ (_)
 / _/ \ \ / _ `/  ' \/ _ \/ / -_|_-<_
/___//_\_\\_,_/_/_/_/ .__/_/\__/___(_)
                   /_/
  order.js add -p 123 -s l -c green  Add large, green product with id 123

   __  ____         _                               _            __                                    __  _
  /  |/  (_)__ ___ (_)__  ___ _  _______ ___ ___ __(_)______ ___/ / ___ ________ ___ ____ _  ___ ___  / /_(_)
 / /|_/ / (_-<(_-</ / _ \/ _ `/ / __/ -_) _ `/ // / / __/ -_) _  / / _ `/ __/ _ `/ // /  ' \/ -_) _ \/ __/
/_/  /_/_/___/___/_/_//_/\_, / /_/  \__/\_, /\_,_/_/_/  \__/\_,_/  \_,_/_/  \_, /\_,_/_/_/_/\__/_//_/\__(_)  
                        /___/            /_/                               /___/
   p
```

## Use one style and font for help content and another for error messages:

```js
require('yargonaut')
  .help('3D-ASCII')
  .helpStyle('green')
  .errors('Calvin S')
  .errorsStyle('red')

var argv = require('yargs')
  .command('add', 'Add item to cart')
  .command('rm', 'Remove item from cart')
  .option('p', {
    alias: 'product',
    describe: 'Product id(s)',
    demand: true
  })
  .option('s', {
    alias: 'size',
    describe: 'Desired product size',
    choices: ['s', 'm', 'l'],
    default: 'm'
  })
  .option('c', {
    alias: 'color',
    describe: 'Desired product color'
  })
  .example('$0 add -p 123 -s l -c green', 'Add large, green product with id 123')
  .wrap(null)
  .argv
```

```
$ node order.js
 ________  ________  _____ ______   _____ ______   ________  ________   ________  ________
|\   ____\|\   __  \|\   _ \  _   \|\   _ \  _   \|\   __  \|\   ___  \|\   ___ \|\   ____\  ___
\ \  \___|\ \  \|\  \ \  \\\__\ \  \ \  \\\__\ \  \ \  \|\  \ \  \\ \  \ \  \_|\ \ \  \___|_|\__\
 \ \  \    \ \  \\\  \ \  \\|__| \  \ \  \\|__| \  \ \   __  \ \  \\ \  \ \  \ \\ \ \_____  \|__|
  \ \  \____\ \  \\\  \ \  \    \ \  \ \  \    \ \  \ \  \ \  \ \  \\ \  \ \  \_\\ \|____|\  \  ___
   \ \_______\ \_______\ \__\    \ \__\ \__\    \ \__\ \__\ \__\ \__\\ \__\ \_______\____\_\  \|\__\
    \|_______|\|_______|\|__|     \|__|\|__|     \|__|\|__|\|__|\|__| \|__|\|_______|\_________\|__|
                                                                                    \|_________|


  add  Add item to cart
  rm   Remove item from cart

 ________  ________  _________  ___  ________  ________   ________
|\   __  \|\   __  \|\___   ___\\  \|\   __  \|\   ___  \|\   ____\  ___
\ \  \|\  \ \  \|\  \|___ \  \_\ \  \ \  \|\  \ \  \\ \  \ \  \___|_|\__\
 \ \  \\\  \ \   ____\   \ \  \ \ \  \ \  \\\  \ \  \\ \  \ \_____  \|__|
  \ \  \\\  \ \  \___|    \ \  \ \ \  \ \  \\\  \ \  \\ \  \|____|\  \  ___
   \ \_______\ \__\        \ \__\ \ \__\ \_______\ \__\\ \__\____\_\  \|\__\
    \|_______|\|__|         \|__|  \|__|\|_______|\|__| \|__|\_________\|__|
                                                            \|_________|


  -p, --product  Product id(s)  [required]
  -s, --size     Desired product size  [choices: "s", "m", "l"] [default: "m"]
  -c, --color    Desired product color

 _______      ___    ___ ________  _____ ______   ________  ___       _______   ________
|\  ___ \    |\  \  /  /|\   __  \|\   _ \  _   \|\   __  \|\  \     |\  ___ \ |\   ____\  ___
\ \   __/|   \ \  \/  / | \  \|\  \ \  \\\__\ \  \ \  \|\  \ \  \    \ \   __/|\ \  \___|_|\__\
 \ \  \_|/__  \ \    / / \ \   __  \ \  \\|__| \  \ \   ____\ \  \    \ \  \_|/_\ \_____  \|__|
  \ \  \_|\ \  /     \/   \ \  \ \  \ \  \    \ \  \ \  \___|\ \  \____\ \  \_|\ \|____|\  \  ___
   \ \_______\/  /\   \    \ \__\ \__\ \__\    \ \__\ \__\    \ \_______\ \_______\____\_\  \|\__\
    \|_______/__/ /\ __\    \|__|\|__|\|__|     \|__|\|__|     \|_______|\|_______|\_________\|__|
             |__|/ \|__|                                                          \|_________|


  order.js add -p 123 -s l -c green  Add large, green product with id 123

╔╦╗┬┌─┐┌─┐┬┌┐┌┌─┐  ┬─┐┌─┐┌─┐ ┬ ┬┬┬─┐┌─┐┌┬┐  ┌─┐┬─┐┌─┐┬ ┬┌┬┐┌─┐┌┐┌┌┬┐
║║║│└─┐└─┐│││││ ┬  ├┬┘├┤ │─┼┐│ ││├┬┘├┤  ││  ├─┤├┬┘│ ┬│ ││││├┤ │││ │
╩ ╩┴└─┘└─┘┴┘└┘└─┘  ┴└─└─┘└─┘└└─┘┴┴└─└─┘─┴┘  ┴ ┴┴└─└─┘└─┘┴ ┴└─┘┘└┘ ┴
   p
```

## Customize only specific yargs strings:

```js
require('yargonaut')
  .font('DOS Rebel', 'Invalid values:')
  .style('yellow', 'Invalid values:')

var argv = require('yargs')
  .option('s', {
    alias: 'size',
    describe: 'Desired product size',
    choices: ['s', 'm', 'l'],
    demand: true
  })
  .showHelpOnFail(false)
  .argv
```

```
$ node order.js -s xl
 █████                                  ████   ███      █████                          ████
░░███                                  ░░███  ░░░      ░░███                          ░░███
 ░███  ████████   █████ █████  ██████   ░███  ████   ███████     █████ █████  ██████   ░███  █████ ████  ██████   █████  ██
 ░███ ░░███░░███ ░░███ ░░███  ░░░░░███  ░███ ░░███  ███░░███    ░░███ ░░███  ░░░░░███  ░███ ░░███ ░███  ███░░███ ███░░  ░░
 ░███  ░███ ░███  ░███  ░███   ███████  ░███  ░███ ░███ ░███     ░███  ░███   ███████  ░███  ░███ ░███ ░███████ ░░█████
 ░███  ░███ ░███  ░░███ ███   ███░░███  ░███  ░███ ░███ ░███     ░░███ ███   ███░░███  ░███  ░███ ░███ ░███░░░   ░░░░███
 █████ ████ █████  ░░█████   ░░████████ █████ █████░░████████     ░░█████   ░░████████ █████ ░░████████░░██████  ██████  ██
░░░░░ ░░░░ ░░░░░    ░░░░░     ░░░░░░░░ ░░░░░ ░░░░░  ░░░░░░░░       ░░░░░     ░░░░░░░░ ░░░░░   ░░░░░░░░  ░░░░░░  ░░░░░░  ░░



  Argument: s, Given: "xl", Choices: "s", "m", "l"
```

## Change default rendering strategy for a specific string:

```js
require('yargonaut')
  .errors('ANSI Shadow')
  .transformWholeString('Unknown argument: %s')

var argv = require('yargs')
  .showHelpOnFail(false)
  .strict()
  .argv
```

```
$ node order.js -a -b
██╗   ██╗███╗   ██╗██╗  ██╗███╗   ██╗ ██████╗ ██╗    ██╗███╗   ██╗     █████╗ ██████╗  ██████╗ ██╗   ██╗███╗   ███╗███████╗███╗   ██╗████████╗███████╗        █████╗        ██████╗
██║   ██║████╗  ██║██║ ██╔╝████╗  ██║██╔═══██╗██║    ██║████╗  ██║    ██╔══██╗██╔══██╗██╔════╝ ██║   ██║████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔════╝██╗    ██╔══██╗       ██╔══██╗
██║   ██║██╔██╗ ██║█████╔╝ ██╔██╗ ██║██║   ██║██║ █╗ ██║██╔██╗ ██║    ███████║██████╔╝██║  ███╗██║   ██║██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ███████╗╚═╝    ███████║       ██████╔╝
██║   ██║██║╚██╗██║██╔═██╗ ██║╚██╗██║██║   ██║██║███╗██║██║╚██╗██║    ██╔══██║██╔══██╗██║   ██║██║   ██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║██╗    ██╔══██║       ██╔══██╗
╚██████╔╝██║ ╚████║██║  ██╗██║ ╚████║╚██████╔╝╚███╔███╔╝██║ ╚████║    ██║  ██║██║  ██║╚██████╔╝╚██████╔╝██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ███████║╚═╝    ██║  ██║▄█╗    ██████╔╝
 ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═══╝    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝       ╚═╝  ╚═╝╚═╝    ╚═════╝

```

# API

## Chainable config methods

### errors(font)

Render error messages using the specified figlet font.

- Returns: `yargonaut` singleton
- `font`: string, name of figlet font

### errorsStyle(style)

Apply the given [chalk style](https://www.npmjs.com/package/chalk#styles) to error messages, e.g. `errorsStyle('red.bold')`.

- Returns: `yargonaut` singleton
- `style`: string, the dot-delimited chalk style (color/modifier) to use

### font(font, [key])

Render yargs strings using the specified figlet font. Optionally specify which
yargs string(s) the font should apply to.

- Returns: `yargonaut` singleton
- `font`: string, name of figlet font
- `key`: string or array of strings, optional key(s) the font should apply to

### help(font)

Render help content strings using the specified figlet font.

- Returns: `yargonaut` singleton
- `font`: string, name of figlet font

### helpStyle(style)

Apply the given [chalk style](https://www.npmjs.com/package/chalk#styles) to help content, e.g. `helpStyle('green.underline')`.

- Returns: `yargonaut` singleton
- `style`: string, the dot-delimited chalk style (color/modifier) to use

### ocd(fn)

For obsessive control over string transformations, provide a function that
yargonaut will call for every yargs string (every y18n lookup).

- Returns: `yargonaut` singleton
- `fn`: function that returns a string and accepts the following:
  - `key`: string, the yargs key being rendered
  - `origString`: string, the original string resolved by y18n
  - `newString`: string, the new string as rendered by yargonaut/figlet
  - `figlet`: figlet, the figlet instance
  - `font`: string, the configured figlet font for the key

### style(style, [key])

Apply the given [chalk style](https://www.npmjs.com/package/chalk#styles) to all yargs strings, e.g. `style('blue')`. Optionally specify which yargs string(s) the style should apply to.

- Returns: `yargonaut` singleton
- `style`: string, the dot-delimited chalk style (color/modifier) to use
- `key`: string or array of strings, optional key(s) the style should apply to

### transformUpToFirstColon(key)

Change the default splitting/rendering strategy for specific yargs strings.

- Returns: `yargonaut` singleton
- `key`: string or array of strings, optional key(s) the render strategy should apply to

### transformWholeString(key)

Change the default splitting/rendering strategy for specific yargs strings.

- Returns: `yargonaut` singleton
- `key`: string or array of strings, optional key(s) the render strategy should apply to

## Getter methods

### getAllKeys()

Get a list of all known yargs strings (help content + error messages) subject
to y18n lookup and yargonaut rendering.

- Returns: array of strings, representing all configured yargs strings

### getErrorKeys()

Get a list of known error messages subject to y18n lookup and yargonaut rendering.

- Returns: array of strings, representing configured error msg yargs strings

### getHelpKeys()

Get a list of known help content strings subject to y18n lookup and yargonaut rendering.

- Returns: array of strings, representing configured help content yargs strings

## Convenience methods for playing with stuff

### asFont(text, font, [throwErr])

Render any text as the given figlet font and return as string.

- Returns: string, the text rendered as font
- `text`: string, the text to render
- `font`: string, the figlet font to use for rendering
- `throwErr`: boolean, optional flag to throw any error that might occur, defaults to `false`

### chalk()

Get access to the `chalk` instance used by yargonaut. In case you want to color your own strings without having to `require('chalk')` yourself.

- Returns: `chalk`, the chalk instance

### figlet()

Get access to the `figlet` instance used by yargonaut. I mean, why not?

- Returns: `figlet`, the figlet instance

### listFonts()

Get a list of all supported figlet fonts. Maybe you want to mix it up with a
random font?

- Returns: array of strings, representing supported font names

### printFont(font, [text], [throwErr])

Test print one figlet font to stdout using `console.log()`.

- Returns: undefined
- `font`: string, the figlet font to test print
- `text`: string, optional text to print as font, defaults to font name
- `throwErr`: boolean, optional flag to throw any error that might occur, defaults to `false`

### printFonts([text], [throwErr])

Test print every supported figlet font to stdout using `console.log()`.

- Returns: undefined
- `text`: string, optional text to print as font, defaults to font name
- `throwErr`: boolean, optional flag to throw any error that might occur, defaults to `false`

# License

[Apache-2.0](http://www.apache.org/licenses/LICENSE-2.0) © Andrew Goode
