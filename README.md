# pull-ipc [![Build Status](https://travis-ci.org/jamen/pull-ipc.svg?branch=master)](https://travis-ci.org/jamen/pull-ipc)

> Pull stream for Electron IPC.

```js
var browserWindow = new BrowserWindow({ ... })

pull(
  // Source from IPC event:
  ipc.listen('some-message'),
  // Transform:
  transformData(),
  // Send messages:
  ipc.send('another-message', browserWindow)
)
```

I made this on accident.  I didn't know someone had made [`pull-ipc`](https://npmjs.com/pull-ipc) already.  It does have two additions over it:

 - Automatically figures out `ipcMain` and `ipcRenderer`.
 - Has `ipc.request` method.

## Installation

```sh
$ npm install --save jamen/pull-ipc
```

## API

### `ipc.listen(channel, [options])`

A [pull stream source](https://github.com/pull-stream/pull-stream/blob/master/docs/glossary.md#source) that listens on an IPC channel, and stops

#### Options

 - `close` (`String`): Name of event that closes the listener.

#### Example

```js
pull(
  ipc.listen('foo', { close: 'baz' }),
  // Stream from 'foo' IPC channel
)
```

(Like `ipcMain.on`/`ipcRenderer.on`, but for pull streams)

### `ipc.send(channel, [browserWindow])`

A [pull stream sink](https://github.com/pull-stream/pull-stream/blob/master/docs/glossary.md#sink) that sends the read data on an IPC channel.

If you are on the main process, pass `browserWindow` for the window you want to talk to.

#### Example

```js
// On render process:
pull(
  // Source data somehow:
  fs.read('files/foo.txt'),
  // Stream to 'bar' IPC channel
  ipc.send('bar')
)

// On main process:
var browserWindow = new BrowserWindow({ ...options })
pull(
  // source data
  stdin(),
  // send to window
  ipc.send('stdin', browserWindow)
)
```

### `ipc.request(channel, response)`

A [pull stream through](https://github.com/pull-stream/pull-stream/blob/master/docs/glossary.md#through) that sends contents to channel and listens for a response.

#### Example

```js
pull(
  // Source data somehow:
  fs.read('files/**/*.js'),
  // Stream through request:
  ipc.request('foo', 'bar'),
  // Read response from 'bar' IPC channel:
  fs.write('out')
)
```

## License

MIT © [Jamen Marz](https://github.com/jamen)
