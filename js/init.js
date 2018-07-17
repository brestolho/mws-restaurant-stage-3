

    /**
     * Service Worker
     */
    function registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js',  {scope: '/'}).then(function(reg) {
            return;
          }).catch(function(err) {
            console.log('ServiceWorker registration failed!');
          });
        });
      } else {
        return;
      }
    }
    registerServiceWorker();


    //check for support
    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
    }

    //create or update db
    var dbPromise = idb.open('restaurantsAppDB', 1, function(upgradeDb) {
        console.log('making a new object store');
        if (!upgradeDb.objectStoreNames.contains('restaurants')) {
            upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        }
    });

    //import all restaurants to db
    dbPromise.then(db => {
        DBHelper.fetchRestaurantsFromServer((error, restaurants) => {
            restaurants.forEach(function(rest){
                var tx = db.transaction('restaurants', 'readwrite');
                var keyValStore = tx.objectStore('restaurants');
                keyValStore.put(rest);
            })
        })
    });

