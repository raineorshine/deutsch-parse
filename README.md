# satz
[![npm version](https://img.shields.io/npm/v/satz.svg)](https://npmjs.org/package/satz)

## Install

```sh
npm install --save -g satz
```

## CLI Usage

```sh
$ satz acc --pretty < vocab.csv

┌─────────────────────┬─────────────────────────┐
│ She sees no face.   │ Sie sieht kein Gesicht. │
│ They see a floor.   │ Sie sehen eine Etage.   │
│ He sees no peak.    │ Er sieht keinen Gipfel. │
│ She sees no camera. │ Sie sieht keine Kamera. │
│ I see a blouse.     │ Ich sehe eine Bluse.    │
│ You see the peak.   │ Du siehst den Gipfel.   │
│ I see a photo.      │ Ich sehe ein Foto.      │
│ You see a ball.     │ Du siehst einen Ball.   │
│ He sees a cloud.    │ Er sieht eine Wolke.    │
│ I see a yard.       │ Ich sehe einen Hof.     │
└─────────────────────┴─────────────────────────┘
```

## API Usage

```js
const satz = require('satz')

satz.parse(...)
satz.intransitive(...)
satz.accusative(...)
satz.subordinate(...)
```

## Todo

- plural objects
- conjugate irregular verbs
- past tense
- remove accVerbs

## License

ISC © [Raine Revere](http://raine.tech)
