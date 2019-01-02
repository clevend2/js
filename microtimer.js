
let
    requestCount = 0,
    counterWorker = null,
    ready = false,
    dbConn,
    dbRequest = window.indexedDB.open("microtimer", 1);

Object.assign(dbRequest, {
    onerror (event) {
        console.log("indexeddb.onerror:", event);
    },

    onsuccess () {
        dbConn = dbRequest.result;

        console.log("indexeddb.onsuccess", dbConn);

        makeCounterWorker();
    },

    onupgradeneeded (event) {
        dbConn = event.target.result;

        const 
            counterStore = dbConn.createObjectStore("counters"),
            flagStore = dbConn.createObjectStore("flags"),
            
            dbReady = Promise.all([
                new Promise((resolve) => {
                    counterStore.put(new Float64Array(1), "time").onsuccess = resolve;
                }),
                new Promise((resolve) => {
                    flagStore.put(new Uint32Array(1), "requested").onsuccess = resolve;
                })
            ]);

        dbReady.then(() => {
            makeCounterWorker();
        });
    }
});

async function getId () {
    let requestTransaction = dbConn.transaction(["flags", "counters"], "readwrite");

    return new Promise((resolve) => {
        requestTransaction.objectStore("flags").put(++requestCount, "requested");

        requestTransaction.objectStore("counters").get("time").onsuccess = ({ target }) => {
            console.log(target.result);
            resolve([Float64Array.from([Date.now()]), target.result]);
        };
    });
}

function makeCounterWorker () {
    if (counterWorker) {
        ready = false;

        counterWorker.terminate();
    }

    counterWorker = new Worker(URL.createObjectURL(new Blob(['('+(function (self) {
        // WARNING: WORKER SCOPE AHEAD
        // Global is the worker's scope, not the window scope
        const 
            clock = new Float64Array(1),
            requestCount = new Uint32Array(1);
        
        clock[0] = 1;

        var c = 0; 
            
        let dbConn = null,
            dbRequest = indexedDB.open("timekeeper", 1),
            channel = new MessageChannel(),
            isRequested = false,
            checking = false

        Object.assign(dbRequest, {

            onerror (event) {
                console.log("counter:indexeddb.onerror:", event);
            },

            onsuccess () {
                dbConn = dbRequest.result;

                console.log("counter:indexeddb.onsuccess", dbConn);
                
                tick(true);
            }
        });  

        channel.port1.onmessage = tick;

        function tick ({ data }) {
            data = 
            clock[0]++;

            if (isRequested || mode == 'initial') {
                isRequested = false;

                update();
            }

            if (!checking) {
                checking = true;

                check().then((request) => { 
                    isRequested = request;
                    
                    checking = false;

                    channel.port2.postMessage('skip');
                })
            } else if (mode == 'skip') {
                channel.port2.postMessage(0);
            }
        }

        function check () {                       
            return new Promise((resolve) => {
                const 
                    transaction = dbConn.transaction(["flags"], "readonly"),
                    request = false

                transaction.objectStore("flags").get("requested").onsuccess = ({ data }) => {
                    if (Math.abs(data - requestCount[0])) {
                        request = true; 
                    }
                    
                    requestCount[0] = data; 
                }
                
                transaction.oncomplete = () => {
                    resolve(request);
                }
            });
        }

        function update () {
            dbConn.transaction(["counters"], "readwrite").objectStore("counters").put(clock[0], "time");
        }

    })+')(self)'])));

    ready = true
}
