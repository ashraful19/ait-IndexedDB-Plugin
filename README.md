# ait-IndexedDB-Plugin

an easy to use simple CRUD Plugin for Indexed DB with some extra features.

## Author Info

* **Ashraful Islam Tushar**  - [LinkedIn](https://www.linkedin.com/in/ashraful-islam-tushar/)

## Getting Started

Load the js file before initialization.

```
<script type="text/javascript" src="ait-indexedDB.js"></script>
```

### Prerequisites

This plugin does not have any dependency. So as long as your browser supports indexedDB, you are good to go.

### Initialization

After including the js file, we need to initialize the indexeddb.

to initialize,

```
var aitIndexedDB = new aitIndexedDB({
    dbname: 'myIndexedDB', // the name of your database 
    dbversion: 1, // version of your database #optional
    initialstores: [ // these are the stores/tables will be created when the database initialized for the first time. you will have to mention all the tables/stores (you are going to use) name and other informations here
        {
            name: 'app_config',
            key: 'name', //the primary key
            autoincrement: false // autoincrement key or not
        },
        {
            name: 'product',
            key: 'id',
            autoincrement: true,
            index: [ //these are the indexes which you are going to use for fetching data
                {name: 'id', value: ['id']},
                {name: 'name', value: ['name']}, //for example you can now find a product by its name
                {name: 'price', value: ['price']}, //or by its price
                {name: 'name_price', value: ['name', 'price']}, // or by both of them together, note that if you want to search any row by multiple columns value, you must create a compound index by mentioning all the columns in the value array like this
            ]
        }
    ],
    configtable: 'app_config', // if you want to have a config table from the tables mentioned, you may want to pass the store/table name here
    configdata: [ //so you can also set some initial values to that config store/table 
        {name: 'datasync', value: '0'},
        {name: 'appname', value: 'myIndexedDB_App'}
    ],
    initCallback: function (response) { //the init callback, will be triggered when the app initialized the database, a parameter is passed according to the status
        if (response == 0) {
            alert('Your Browser does not support InexedDB');
        } else if (response == 1) {
            alert('DB Initialization Successful');
        } else if (response == 2) {
            alert('On Upgrade Called');
        }
    }
});
```
