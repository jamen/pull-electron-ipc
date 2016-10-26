var isRenderer = require('is-electron-renderer')

// Get IPC module depending on process
let ipcNative
if (isRenderer) ipcNative = require('electron').ipcRenderer
else ipcNative = require('electron').ipcMain

// Exports
exports.listen = listen
exports.send = send
exports.request = request

/**
 * Listen on an event
 * ```js
 * pull(
 *  ipc.listen('foo'),
 *  // ...
 * )
 */
function listen (channel, options) {
  // Default options
  options = Object.assign({
    close: null
  }, options || {})

  let _handler = null

  return function (end, cb) {
    if (end) return cb(end)

    if (!_handler) {
      _handler = function (event, data) {
        cb(null, data)
      }

      // Stream IPC event data.
      ipcNative.on(channel, _handler)
    }

    // Handle closing event
    if (options.close) {
      ipcNative.on(options.close, () => {
        ipcNative.removeListener(channel, _handler)
        cb(true)
      })
    }
  }
}

/**
 * Send an event with data as a sink
 * ```js
 */
function send (channel, window) {
  return function (read) {
    read(null, function next (end, data) {
      if (end === true) return
      if (end) throw end

      if (!isRenderer) {
        window.webContents.send(channel, data)
      } else {
        ipcNative.send(channel, data)
      }

      read(null, next)
    })
  }
}

/**
 * Send request to an event, and await response from another event
 * ```js
 * pull(
 *   source(),
 *   // Send data to 'foo' channel
 *   ipc.request('foo', 'bar'),
     // Sink data from 'bar' channel
     // ...
 * )
 */
function request (channel, response) {
  return function (read) {
    return function (end, cb) {
      read(end, function (end, data) {
        if (end) return cb(end)

        // Send data to channel
        ipcNative.send(channel, data)

        // Listen for response
        ipcNative.once(response, function (event, data) {
          cb(null, data)
        })
      })
    }
  }
}
