const log = str => {
  document.querySelector('#console').append(str + '\n')
}

const serviceUuid = '00008010-0000-1000-8000-00805f9b34fb'
const descriptors = []

const base = 40

const connect = () => {
  navigator.bluetooth.requestDevice({filters: [{services: [serviceUuid]}]})
  .then(device => {
    log('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
    log('Getting Service...');
    return server.getPrimaryService(serviceUuid);
  })
  .then(service => {
    log('Getting Characteristics...');
    // Get all characteristics.
    return service.getCharacteristics();
  })
  .then(characteristics => {
    log('> Characteristics:')
    characteristics.forEach(characteristic => {
      log('  ' + characteristic.uuid)
      characteristic.getDescriptors().then(descs => {
        descs.forEach(desc => {
          log('  > Descriptors:')
          log ('    ' + desc.uuid)
          descriptors.push(desc)
        })
      })
    })
    document.querySelector('#write').disabled = false
    document.querySelector('#slider').disabled = false
    initCanvas()
  })
  .catch(error => {
    log('Argh! ' + error);
  })
}

const initCanvas = () => {
  console.log('init canvas')
  var drawing = false
  var mousePos = { x:0, y:0 }
  var lastPos = mousePos
  let canvas = document.querySelector('#canvas')

  canvas.addEventListener("mousedown", e => {
    drawing = true
    lastPos = getMousePos(canvas, e)
  }, false)

  canvas.addEventListener("mousemove", e => {
    if (!drawing) return
    mousePos = getMousePos(canvas, e)
    const val = parseInt(base + ((lastPos.y - mousePos.y) / 14))
    console.log('val:', val)
    sendValue(val)
  }, false)

  canvas.addEventListener("mouseup", e => {
    drawing = false
    sendValue(base)
  }, false)
}



// Get the position of the mouse relative to the canvas
function getMousePos(canvasDom, mouseEvent) {
  var rect = canvasDom.getBoundingClientRect()
  return {
    x: mouseEvent.clientX - rect.left,
    y: mouseEvent.clientY - rect.top
  }
}

const writeOnDesc = () => {
  let encoder = new TextEncoder('utf-8')
  descriptors[0].writeValue(encoder.encode('coucou'))
  .then(_ => {
    log('success')
  }).catch(err => {
    console.error(err)
  })
}

const writeValue = () => {
  const val = parseInt(document.querySelector('#slider').value)
  sendValue(val)
}

let currentValue = base
let lastValue = base

const sendValue = val => {
  document.querySelector('#currentVal').innerHTML = val
  currentValue = val
}

setInterval(() => {
  if (currentValue === lastValue) return
  realSendValue(currentValue)
  lastValue = currentValue
}, 20)

const realSendValue = (val) => {
  const buffer = new ArrayBuffer(1)
  const arr = new Uint8Array(buffer)
  arr.set([val])
  descriptors[0].writeValue(buffer)
  .then(_ => {
    log('success: ' + val.toString(16))
  }).catch(err => {
    console.error(err)
    lastValue = -1
  })
}