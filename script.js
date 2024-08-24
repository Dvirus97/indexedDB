const indexedDbFactory =
  window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

console.log(indexedDbFactory);

/** delete database */
indexedDbFactory.deleteDatabase("myDataBase");

const request = indexedDbFactory.open("myDataBase", 1);

request.onerror = (event) => {
  console.error("an error occurred with indexedDB: ", event);
};

/**
 * this function is called or (in the first time) or (when the db version is update)
 * objectStore  : table / document
 * keyPath      : primary key
 * index        : quick index for lookup
 */
request.onupgradeneeded = () => {
  const db = request.result;
  console.log(db);
  const store = db.createObjectStore("cars", { keyPath: "id" });
  store.createIndex("cars_color", ["color"], { unique: false });
  store.createIndex("cars_color_make", ["color", "make"], { unique: false });
  console.log(store);
};

/**
 * transaction is an atomic operation. if something not working, all will cancel.
 * - put    : insert into / create one
 * - get    : lookup on the key. get first one
 * - getAll : get all, not just one
 */
request.onsuccess = () => {
  const db = request.result;
  const transaction = db.transaction("cars", "readwrite");

  const store = transaction.objectStore("cars");
  const colorIndex = store.index("cars_color");
  const colorMakeIndex = store.index("cars_color_make");
  console.log(transaction);
  console.log(colorIndex);

  store.put({ id: 1, color: "red", make: "Toyota" });
  store.put({ id: 2, color: "red", make: "Kia" });
  store.put({ id: 3, color: "blue", make: "Honda" });
  store.put({ id: 4, color: "silver", make: "Subaru" });

  const idQuery = store.get(4);
  const colorQuery = colorIndex.getAll(["red"]);
  const colorMakeQuery = colorMakeIndex.get(["blue", "Honda"]);

  idQuery.onsuccess = () => {
    console.log("idQuery", idQuery.result);
  };
  colorQuery.onsuccess = () => {
    console.log("colorQuery", colorQuery.result);
  };
  colorMakeQuery.onsuccess = () => {
    console.log("colorMakeQuery", colorMakeQuery.result);
  };

  //   close the transaction
  transaction.oncomplete = () => {
    console.log("transaction.oncomplete()");
    db.close();
  };
};
