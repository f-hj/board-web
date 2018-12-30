const log = console.log

const serviceUuid = '000000ff-0000-1000-8000-00805f9b34fb'
const descriptors = []

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
  })
  .catch(error => {
    log('Argh! ' + error);
  })
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