# satz
[![npm version](https://img.shields.io/npm/v/satz.svg)](https://npmjs.org/package/satz)

## Install

```sh
npm install --save -g satz
```

## CLI Usage

```sh
$ echo "apple,der Apfel" | satz acc

She sees the apple.,Sie sieht den Apfel.
I see an apple.,Ich sehe einen Apfel.
You see an apple.,Du siehst einen Apfel.
They see an apple.,Sie sehen einen Apfel.
We see an apple.,Wir sehen einen Apfel.
```

## API Usage

```js
const satz = require('satz')

satz.parse(...)
satz.accusative(...)
satz.subordinate(...)
```

## License

ISC © [Raine Revere](http://raine.tech)
