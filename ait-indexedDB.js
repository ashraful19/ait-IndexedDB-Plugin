/**
 * (Ashraful Islam Tushar) AIT-IndexedDB Plugin
 * Full featured indexedDB CRUD model with extra functionalities
 *
 * Copyright 2017, Ashraful Islam Tushar
 * Licensed under MIT
 *
 * Released on: TBA
 */
(function () {
    'use strict';
    /*===========================
     AIT-IndexedDB
     ===========================*/
    var aitApp;
    window.aitIndexedDB = function (params) {
        aitApp = this;
        // Default Parameters
        aitApp.params = {
            dbname: 'aitdb',
            dbversion: 1,
        };
        aitApp.processing = 0;
        // Extend defaults with parameters
        for (var param in params) {
            aitApp.params[param] = params[param];
        }
        aitIndexedDB.init(aitApp);
    };
    aitIndexedDB.init = function (aitApp) {
        //prefixes of implementation that we want to test
        aitApp.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        //prefixes of window.IDB objects
        aitApp.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        aitApp.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
        if (!aitApp.indexedDB) {
            alert('Your Device doesn\'t support a stable version of IndexedDB.');
        } else {
            aitApp.db;
            aitApp.processing = 1;
            var request = aitApp.indexedDB.open(aitApp.params.dbname, aitApp.params.dbversion);
            request.onerror = function (event) {
                //alert('Initialization Failed: ' + JSON.stringify(event));
                alert('Initialization Failed!');
            };
            request.onsuccess = function (event) {
                aitApp.db = request.result;
                aitApp.processing = 0;
                console.log('DB Initialized: ' + aitApp.db);
            };
            request.onupgradeneeded = function (event) {
                aitApp.db = event.target.result;
                if (aitApp.params.initialstores) {
                    var objectStore
                    for (var i in aitApp.params.initialstores) {
                        objectStore = aitApp.db.createObjectStore(aitApp.params.initialstores[i].name, {
                            keyPath: aitApp.params.initialstores[i].key,
                            autoIncrement: aitApp.params.initialstores[i].autoincreament
                        });
                        if (aitApp.params.initialstores[i].index) {
                            var indexToCreate = aitApp.params.initialstores[i].index;
                            for (var j = 0; j < indexToCreate.length; j++) {
                                objectStore.createIndex(indexToCreate[j].name, indexToCreate[j].value, {unique: false});
                            }
                        }
                    }
                    objectStore.transaction.oncomplete = function (event) {
                        aitApp.processing = 0;
                        if (aitApp.params.configtable && aitApp.params.configdata) {
                            aitIndexedDB.insertMultiple({
                                storename: aitApp.params.configtable,
                                data: aitApp.params.configdata
                            });
                        }
                    }
                } else {
                    aitApp.processing = 0;
                }
                console.log('On Upgrade Called');
            }
        }
    }
    aitIndexedDB.prototype = {
        readAll: function (options) {
            if (aitApp.db == undefined || aitApp.processing == 1) {
                setTimeout(function () {
                    aitIndexedDB.readAll(options);
                }, 100);
            } else {
                aitApp.processing = 1;
                if (options.preCallback) {
                    options.preCallback(true);
                }
                var objectStore = aitApp.db.transaction(options.storename).objectStore(options.storename);
                var storeIndex = objectStore;
                if (options.index) {
                    storeIndex = objectStore.index(options.index);
                }

                var keyBound = null;
                if (options.only && options.only.value) {
                    keyBound = aitApp.IDBKeyRange.only(options.only.value);
                } else if (options.lowerbound && options.lowerbound.value && options.upperbound && options.upperbound.value) {
                    if (options.lowerbound.notequal != true) {
                        options.lowerbound.notequal = false;
                    }
                    if (options.upperbound.notequal != true) {
                        options.upperbound.notequal = false;
                    }
                    keyBound = aitApp.IDBKeyRange.bound(options.lowerbound.value, options.upperbound.value, options.lowerbound.notequal, options.upperbound.notequal);
                } else if (options.lowerbound && options.lowerbound.value) {
                    if (options.lowerbound.notequal != true) {
                        options.lowerbound.notequal = false;
                    }
                    keyBound = aitApp.IDBKeyRange.lowerBound(options.lowerbound.value, options.lowerbound.notequal);
                } else if (options.upperbound && options.upperbound.value) {
                    if (options.upperbound.notequal != true) {
                        options.upperbound.notequal = false;
                    }
                    keyBound = aitApp.IDBKeyRange.upperBound(options.upperbound.value, options.upperbound.notequal);
                }

                if (options.direction == undefined) {
                    options.direction = 'next';
                }

                // is search params are defined
                var searchCondition = '';
                if (options.search && options.search.length > 0) {
                    var logic = '';
                    for (var i = 0; i < options.search.length; i++) {
                        searchCondition += logic + 'cursor.value.' + options.search[i].column + '.toUpperCase().indexOf("' + options.search[i].value.toUpperCase() + '") !== -1';
                        if (options.search[i].logic == 'OR') {
                            logic = ' || ';
                        } else {
                            logic = ' && ';
                        }
                    }
                } 

                var returnData = [];
                var index = 0;
                storeIndex.openCursor(keyBound, options.direction).onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor && ((options.limit != undefined && index < options.limit) || options.limit == undefined)) {
                        if (searchCondition.trim().length > 0) {
                            eval('if(' + searchCondition.trim() + '){ returnData.push(cursor.value); }');
                        } else {
                            returnData.push(cursor.value);
                        }
                        index += 1;
                        cursor.continue();
                    } else {
                        aitApp.processing = 0;
                        //call the extended function after the cursor is over
                        if (options.postCallback) {
                            options.postCallback(returnData);
                        }
                    }
                };
            }
        },
        read: function (options) {
            if (aitApp.db == undefined || aitApp.processing == 1) {
                setTimeout(function () {
                    aitIndexedDB.read(options);
                }, 100);
            } else {
                aitApp.processing = 1;
                var objectStore = aitApp.db.transaction(options.storename).objectStore(options.storename);
                var request = objectStore.get(aitApp.IDBKeyRange.only(options.keyValue));
                request.onsuccess = function (event) {
                    aitApp.processing = 0;
                    if (options.postCallback) {
                        options.postCallback(event.target.result);
                    }
                }
                request.onerror = function (event) {
                    aitApp.processing = 0;
                    if (options.postCallback) {
                        options.postCallback(false);
                    }
                }
            }
        },
        insert: function (options) {
            if (aitApp.db == undefined || aitApp.processing == 1) {
                setTimeout(function () {
                    aitIndexedDB.insert(options);
                }, 100);
            } else {
                aitApp.processing = 1;
                var request = aitApp.db.transaction([options.storename], "readwrite").objectStore(options.storename).add(options.data);
                request.onsuccess = function (event) {
                    aitApp.processing = 0;
                    if (options.postCallback) {
                        options.postCallback(event.target.result);
                    }
                };
                request.onerror = function (event) {
                    aitApp.processing = 0;
                    if (options.postCallback) {
                        options.postCallback(false);
                    }
                }
            }

        },
        insertMultiple: function (options) {
            if (aitApp.db == undefined || aitApp.processing == 1) {
                setTimeout(function () {
                    aitIndexedDB.insertMultiple(options);
                }, 100);
            } else {
                aitApp.processing = 1;
                var transaction = aitApp.db.transaction([options.storename], "readwrite");
                transaction.onerror = function (event) {
                    aitApp.processing = 0;
                    // Don't forget to handle errors!
                    if (options.postCallback) {
                        options.postCallback(false);
                    }
                    return;
                };
                var objectStore = transaction.objectStore(options.storename);
                var request;
                var total_data = options.data.length;
                for (var i in options.data) {
                    request = objectStore.add(options.data[i]);
                    request.onsuccess = function (event) {
                        if (i == (total_data - 1)) {
                            aitApp.processing = 0;
                        }
                    };
                    request.onerror = function (event) {
                        if (i == (total_data - 1)) {
                            aitApp.processing = 0;
                        }
                    };
                }
            }

        },
        update: function (options) {
            if (aitApp.db == undefined || aitApp.processing == 1) {
                setTimeout(function () {
                    aitIndexedDB.update(options);
                }, 100);
            } else {
                aitApp.processing = 1;
                var objectStore = aitApp.db.transaction([options.storename], "readwrite").objectStore(options.storename);
                var request = objectStore.put(options.data); //,aitApp.IDBKeyRange.only(options.keyValue)
                request.onsuccess = function (event) {
                    aitApp.processing = 0;
                    if (options.postCallback) {
                        options.postCallback(event.target.result);
                    }
                };
                request.onerror = function (event) {
                    aitApp.processing = 0;
                    if (options.postCallback) {
                        options.postCallback(0);
                    }
                }
            }

        },
        delete: function (options) {
            if (aitApp.db == undefined || aitApp.processing == 1) {
                setTimeout(function () {
                    aitIndexedDB.delete(options);
                }, 100);
            } else {
                aitApp.processing = 1;
                var request = aitApp.db.transaction([options.storename], "readwrite").objectStore(options.storename).delete(options.keyValue);
                request.onsuccess = function (event) {
                    aitApp.processing = 0;
                    if (options.postCallback) {
                        options.postCallback(true);
                    }
                    console.log("Deleted Successfully");
                };
                request.onerror = function (event) {
                    aitApp.processing = 0;
                    if (options.postCallback) {
                        options.postCallback(false);
                    }
                    console.log("Delete Failed");
                };
            }

        },
        countAll: function (options) {
            if (aitApp.db == undefined || aitApp.processing == 1) {
                setTimeout(function () {
                    aitIndexedDB.countAll(options);
                }, 100);
            } else {
                aitApp.processing = 1;
                var request = aitApp.db.transaction([options.storename], 'readonly').objectStore(options.storename).count();
                request.onsuccess = function (event) {
                    aitApp.processing = 0;
                    if (options.postCallback) {
                        options.postCallback(event.target.result);
                    }
                }
                request.onerror = function (event) {
                    aitApp.processing = 0;
                    if (options.postCallback) {
                        options.postCallback(false);
                    }
                }
            }

        },
        deleteStore: function (options) {
            aitApp.db.deleteObjectStore(options.storename);
            aitApp.db.onsuccess = function (event) {
                console.log('Successfully Deleted Store ' + options.storename);
            };
            aitApp.db.onerror = function (event) {
                console.log('Error Deleting Store ' + options.storename);
            };
            aitApp.db.onabort = function (event) {
                console.log('Abort Deleting Store ' + options.storename);
            };
        },
        deleteDatabase: function () {
            if (aitApp.db == undefined || aitApp.processing == 1) {
                setTimeout(function () {
                    aitIndexedDB.deleteDatabase();
                }, 100);
            } else {
                aitApp.processing = 1;
                aitApp.db.close();
                var request = aitApp.indexedDB.deleteDatabase(aitApp.params.dbname);
                request.onerror = function (event) {
                    aitApp.processing = 0;
                    console.log("Error deleting database.");
                };
                request.onsuccess = function (event) {
                    aitApp.processing = 0;
                    console.log("Database deleted successfully");
                };
                request.onblocked = function () {
                    aitApp.processing = 0;
                    console.log("Couldn't delete database due to the operation being blocked");
                };
            }
        },
    };
})();