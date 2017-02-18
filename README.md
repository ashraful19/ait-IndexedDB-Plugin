# ait-IndexedDB-Plugin

an easy to use simple CRUD Plugin for Indexed DB with some extra features.

### Prerequisites

This plugin does not have any dependency. So as long as your browser supports indexedDB, you are good to go.

## Getting Started

Load the js file before initialization.

```html
<script type="text/javascript" src="ait-indexedDB.js"></script>
```
### API Initialization

After including the js file, we need to initialize the indexeddb.

to initialize, Creates a new `aitIndexedDB` instance.

```js
var aitIndexedDB = new aitIndexedDB();
```
#### Arguments

- `options` - Optional - A plain JavaScript object that contains the
configuration options.

#### Options

- `dbname` - Optional - A string that specifies the database name. if not provided, a db named `aitdb` will be created
- `dbversion` - Optional - A number that specifies the database version. Default is 1.
- `initialstores` - Required - A javascript array of objects, where each object contains the information about each object store to be created. if not provided, no stores will be created and stores cannot be created later.
    - `name` - Required - A String that specifies the name of the store.
    - `key` - Optional - A string that specified the primary key/keypath of that store
    - `autoincrement` - Optional - A Boolean value that specifies whether the primary of the store will be auto increment or not.
    - `index` - Optional - A javascript array of Objects which contains the information for each index to be created for each store.
        - `name` - Required - A String that specifies the name of the index.
        - `value` - Required - An array that contains the column names. can be a single column or can be multiple column name separated by comma.
- `configtable` - Optional - A string that specifies the store name which will be used for site/app configuration informations. the provided name must be included in the `initialstores` parameters.
- `configdata` - Optional - A javascript array of objects that is to be inserted in the mentioned `configtable` when the application runs for the first time (when the database is created).
- `initCallback` - Callback - A callback function that triggers when the db is initialized. receives a response variable. which value will be 0 (if initialization fails), 1 (if initialization successful), 2 (if the db created for the the first time)

#### Example

```js
var aitIndexedDB = new aitIndexedDB({
    dbname: 'myIndexedDB',
    dbversion: 1,
    initialstores: [ 
        {
            name: 'app_config',
            key: 'name', 
            autoincrement: false
        },
        {
            name: 'product',
            key: 'id',
            autoincrement: true,
            index: [ 
                {name: 'id', value: ['id']},
                {name: 'name', value: ['name']},
                {name: 'price', value: ['price']},
                {name: 'name_price', value: ['name', 'price']},
            ]
        }
    ],
    configtable: 'app_config',
    configdata: [
        {name: 'datasync', value: '0'},
        {name: 'appname', value: 'myIndexedDB_App'}
    ],
    initCallback: function (response) { 
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

## Available resources and methods

### `readAll()` - to Read multiple rows by keypath or any index with many conditions

#### Arguments

- `options` - Required - A plain JavaScript object that contains the
configuration options.
    
#### Options

- `storename` - Required - A string that specifies the store name from where we are going to read data
- `index` - Optional - A string that specifies the index name if we are going to fetch data based on an index other than the keypath/primary key
- `only` - Optional - A javascript Object
    - `value` - Required - an array of the values of condition 'only'
- `lowerbound` - Optional - A javascript Object. (won't work if `only` parameter is also passed)
    - `value` - Required - an array of the values of condition 'lowerbound'
    - `notequal` - Optional - Boolean, if `true` condition will be like > and if false then condition will be like >=
- `upperbound` - Optional - A javascript Object.  (won't work if `only` parameter is also passed)
    - `value` - Required - an array of the values of condition 'upperbound'
    - `notequal` - Optional - Boolean, if `true` condition will be like < and if false then condition will be like <=
- `direction` - Optional - Values can be `next` or `prev` . Default is `next` . this represents the direction of reading. its more like mysql ASC and DESC order
- `limit` - Optional - An Integer number that represents the number is rows we should read.
- `search` - Optional - An array of objects, each object contains the following,
    - `column` - Required - the name of the column whose value we are using for search
    - `value` - Required - the value which we are going to match with the mentioned colmns value
    - `logic` - Optional - Logic which will be place between multiple search conditions. its like mysql `OR WHERE` and `AND WHERE`. Default is `AND`.
    - `condition` - Optional - condition for each search operation, like the passed `value` is going to fully matched or partially. By default it will match the passed value exactly with the mentioned column value. to match partially we need to pass `LIKE` here.
- `postCallback` - Callback function that will receive the result array after the read operation is done.

#### Example
```js
aitIndexedDB.readAll({
    storename: 'product',
    index: 'price',
    only: {value: ['50']}, // if you use `only`, `lowerbound` and `upperbound` won't be counted (if you use them too)
    lowerbound: {value: [25], notequal: false},
    upperbound: {value: [100], notequal: false},
    limit: 20,
    search: [
        {column: 'name', value: 'Test', condition: 'LIKE', logic: 'OR'},
        {column: 'name', value: 'last_updated', logic: 'OR'}
    ],
    postCallback: function (data) {
        //Do something with the result
    }
});
```

### `read()` - to read single row by keypath/primary key value

#### Arguments

- `options` - Required - A plain JavaScript object that contains the
configuration options.
    
#### Options

- `storename` - Required - A string that specifies the store name from where we are going to read data
- `keyValue` - Required - The value of the keypath (Primary key)
- `postCallback` - Callback function that will receive the result array after the read operation is done.

#### Example
```js
aitIndexedDB.read({
    storename: 'product',
    keyValue: 2,
    postCallback: function (data) {
        //Do something with the result
    }
});
```

### `insert()` - to insert single row in an object store

#### Arguments

- `options` - Required - A plain JavaScript object that contains the
configuration options.
    
#### Options

- `storename` - Required - A string that specifies the store name from where we are going to read data
- `data` - Required - The object we are going to store
- `postCallback` - Callback function that will receive the insert id.

#### Example
```js
aitIndexedDB.insert({
    storename: 'product',
    data: {id: 3, name: 'test product 3', price: 59},
    postCallback: function (data) {
        //Do something with the result
    }
});
```

### `insertMultiple()` - to Inser multiple rows at the same time in an object store

#### Arguments

- `options` - Required - A plain JavaScript object that contains the
configuration options.
    
#### Options

- `storename` - Required - A string that specifies the store name from where we are going to read data
- `data` - Required - The Array of objects. each object is considered as each row to store.
- `postCallback` - Callback function that will receive the insert id.

#### Example
```js
aitIndexedDB.insertMultiple({
    storename: 'product',
    data: [
        {id: 3, name: 'test product 3', price: 59},
        {id: 4, name: 'test product 4', price: 75}
    ],
    postCallback: function (data) {
        //Do something with the result
    }
});
```

### `update()` - to Update data in an object store

#### Arguments

- `options` - Required - A plain JavaScript object that contains the
configuration options.
    
#### Options

- `storename` - Required - A string that specifies the store name from where we are going to read data
- `data` - Required - The Array of objects. each object is considered as each row to store. if your stores keypath is autoincrement = true, then you must pass all the data of that row including the keypath
- `keyValue` - Optional - Only pass this value if your store keypath is not autoincrement = true. otherwise it will through error.
- `postCallback` - Callback function that will receive the insert id.

#### Example
```js
aitIndexedDB.insertMultiple({
    storename: 'product',
    data: {id: 3, name: 'test product 3 name updated', price: 59},
    postCallback: function (data) {
        //Do something with the result
    }
});

// or if keypath is not autoincrement

aitIndexedDB.insertMultiple({
    storename: 'product',
    data: {name: 'test product 3 name updated', price: 59},
    keyValue: 3,
    postCallback: function (data) {
        //Do something with the result
    }
});
```

### `delete()` - to Delete any data row from an object store by the primary key

#### Arguments

- `options` - Required - A plain JavaScript object that contains the
configuration options.
    
#### Options

- `storename` - Required - A string that specifies the store name from where we are going to read data
- `keyValue` - Required - the value of the keypath which you want to delete.
- `postCallback` - Callback function that will receive the insert id.

#### Example
```js
aitIndexedDB.delete({
    storename: 'product',
    keyValue: 3,
    postCallback: function (data) {
        //Do something with the result
    }
});
```

### `countAll()` - to get the Total number of rows in an object store

#### Arguments

- `options` - Required - A plain JavaScript object that contains the
configuration options.
    
#### Options

- `storename` - Required - A string that specifies the store name from where we are going to read data
- `postCallback` - Callback function that will receive the insert id.

#### Example
```js
aitIndexedDB.delete({
    storename: 'product',
    keyValue: 3,
    postCallback: function (data) {
        //Do something with the result
    }
});
```

### `deleteDatabase()` - to Delete the database

#### Arguments

- `options` - Required - A plain JavaScript object that contains the
configuration options.
    
#### Options

- `postCallback` - Callback function that will receive the insert id.

#### Example
```js
aitIndexedDB.deleteDatabase({
    postCallback: function (data) {
        // a response object will be received like `{status: 1, msg: 'Database deleted successfully'}`
    }
});
```

## Author Info

* **Ashraful Islam Tushar**  - [LinkedIn](https://www.linkedin.com/in/ashraful-islam-tushar/)
