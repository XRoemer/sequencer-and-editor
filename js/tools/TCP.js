const net = require('net');

var Tcp = class TCP {

  constructor() {
    this.server = net.createServer((c) => {
      // 'connection' listener
      var name = 'Address: ' + c.remoteAddress + " Port: " + c.localPort
      console.log('server connected, ' + name);

      c.on('end', () => {
        console.log('server disconnected');
      });
      c.on('data', function(dat) {
        data.dist_data(dat, 'server')
      });

    });
    this.server.on('error', (err) => {
      throw err;
    });
    this.server.listen(8150, () => {
      console.log('server bound');
    });

    this.client = new net.Socket();
    this.client.connect(8151, '127.0.0.1', function() {
    	console.log('client connected');
    });

    this.client.on('data', function(dat) {
      data.dist_data(dat, 'client')
    });

    this.client.on('close', function() {
    	console.log('client closed');
    });
  }

}


