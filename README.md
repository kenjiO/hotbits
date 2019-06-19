[![NPM Version](https://img.shields.io/npm/v/hotbits.svg)](https://npmjs.org/package/hotbits) [![NPM Version](https://img.shields.io/travis/kenjio/hotbits/master.svg)](https://travis-ci.org/kenjiO/hotbits)

A Node.js utility to fetch genuine random bytes from the [HotBits](https://www.fourmilab.ch/hotbits/) API service.

```js
import hotbits from 'hotbits';

const API_KEY = // Your hotbits api key

hotbits(API_KEY).then(result => {
     // result will be an array of random bytes as an integers 0-255
     // such as [23, 72, 190, 37, 11, 227, 130, 150, 56, 110]
  })
```

### Background ###
In some situations psuedorandom random numbers may not be adequate. [HotBits](https://www.fourmilab.ch/hotbits/) generates genuine random numbers by timing successive pairs of radioactive decays detected by a Geiger-Müller tube interfaced to a computer.

### Installation ###

```bash
npm install hotbits
```

### Usage ###

#### API Key ####
Pass your api key into the hotbits function as the first parameter.
```js
hotbits('HB10usUsPFyJzKs84zYML85sbBY')
```
To get genuine random bytes you will need to obtain an api key from hotbits [here](https://www.fourmilab.ch/hotbits/apikey.html).

For development and testing you can use `Pseudorandom` for the api key to receive pseudorandom bytes from the service.
```js
hotbits('Pseudorandom')
```

To keep your api key out of your source code use an environment variable like this
```js
hotbits(process.env.HOTBITS_KEY)
```

#### Options ####
```js
hotbits(API_KEY, { number: 100})
````
Pass an object as the optional second parameter with a property for each option you want to specify.  Currently the only option is `number` which specifies how many random bytes you want in the result.  The maximum allowed is `2048`.  If the number option is not specified `10` results are returned.

#### Return Value ####
Calling `hotbits` returns a promise and initiates a call to the api at ***https://www.fourmilab.ch/cgi-bin/Hotbits.api***. Upon a successful reply the promise resolves to an array with the random bytes requested. The bytes are integers ranging from 0 to 255. On error the promise rejects with the error.

#### Errors ####
Reasons that the returned promise will reject with an error include:
* Unable to connect to the api server
* An error returned from the server
* An unexpected response from the server
* Invalid parameters

