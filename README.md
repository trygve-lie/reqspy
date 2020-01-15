# ReqSpy

A non intrusive request spy - log outgoing http(s) requests from an application.

## Installation

```bash
$ npm install reqspy
```

## Example

```js
const request = require('request');
const Spy = require('reqspy');

const spy = new Spy();

spy.on('host', (info) => {
    console.log('new host requested', info);
});

spy.enable();

// Do http requests with any http lib. The breaker will guard it.
request('http://api.somewhere.com', (error, response, body) => {
    console.log(body);
});
```

## Description

ReqSpy is for logging outgoing http(s) requests from an application in a non intrusive way.

ReqSpy is non intrusive in the way that one do not need to implement it every single place
one do a http(s) call in an application. One only need to init ReqSpy one place in an application
and it will intercept all http(s) calls. When that is said; one can init ReqSpy multiple times if
wanted.

Under the hood ReqSpy use [async hooks](https://nodejs.org/api/async_hooks.html) to intercept
http(s) calls on the net socket level so there is no altering of the global http(s) object in node
or any global singletons.

By using this approach there is a clear separation between the code doing http(s) calls and the
code doing the logging.

Since interaction happen on the net socket, ReqSpy should work out of the box with any node.js
http request library.

## Constructor

Create a new ReqSpy instance.

```js
const Spy = require('reqspy');
const spy = new Spy(options);
```

### options (optional)

An Object containing misc configuration. The following values can be provided:

 * **hostname** - `String` - The hostname of the application we are logging. Will appear in the output log.


## API

The ReqSpy instance have the following API:

### .enable()

Enable the spy to intercept http(s) calls. Under the hood this enables the async hook
which does the interception.

### .disable()

Disables the spy from intercept http(s) calls. Under the hood this disables the async
hook which does the interception.

### .values()

Returns a list of all hosts which has been requested.

### .clear()

Clears the internally kept log of hosts the spy have logged.

## Events

For each request the ReqSpy instance will emit one of the following events:

### host

Emitted when the ReqSpy encounters a request to a new host.

```js
const spy = new Spy(options);
spy.on('host', (info) => {
    console.log('new host requested', info);
});
```

## node.js compabillity

This module use [async hooks](https://nodejs.org/api/async_hooks.html) which was first
introdused in node.js 8.1. Despite that, this module will only work fully with node.js
version 10.x or newer.


## License

The MIT License (MIT)

Copyright (c) 2020 - Trygve Lie - post@trygve-lie.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
