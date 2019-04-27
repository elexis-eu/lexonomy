const cluster = require('cluster');
if (cluster.isMaster) {
    const numWorkers = require('os').cpus().length;
    console.log('Master process is going to set up ' + numWorkers + ' workers...');
    cluster.setupMaster({exec: 'lexonomy.js'})
    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });
    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
    for (var i = 0; i < numWorkers; i++)
        cluster.fork();
}
