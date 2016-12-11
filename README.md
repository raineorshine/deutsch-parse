# deutsch-parse
[![npm version](https://img.shields.io/npm/v/deutsch-parse.svg)](https://npmjs.org/package/deutsch-parse)

## Install

```sh
npm install --save -g deutsch-parse
```

## CLI Usage

```sh
$ echo "apple  der Apfel" | deutsch-parse acc

She sees the apple.  Sie sieht den Apfel.
I see an apple. Ich sehe einen Apfel.
You see an apple. Du siehst einen Apfel.
They see an apple.  Sie sehen einen Apfel.
We see an apple. Wir sehen einen Apfel.
```

## API Usage

```js
const deutschParse = require('deutsch-parse')

deutschParse.parse(...)
deutschParse.accusative(...)
```

## License

ISC © [Raine Revere](http://raine.tech)
