const cluster = require('cluster');
if (cluster.isMaster) {
    const numWorkers = require('os').cpus().length;
    console.error('Master process is going to set up ' + numWorkers + ' workers...');
    cluster.setupMaster({exec: 'lexonomy.js', args:[process.argv[2]]})
    cluster.on('online', function(worker) {
        console.error('Worker ' + worker.process.pid + ' is online');
    });
    cluster.on('exit', function(worker, code, signal) {
        console.error('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.error('Starting a new worker');
        cluster.fork();
    });
    for (var i = 0; i < numWorkers; i++)
        cluster.fork();
}
