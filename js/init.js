

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
    var dbPromise = idb.open('restaurantsAppDB', 2, function(upgradeDb) {
        console.log('making a new object store');
        if (!upgradeDb.objectStoreNames.contains('restaurants')) {
            upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        }
        if (!upgradeDb.objectStoreNames.contains('reviews')) {
            var reviewsTbl = upgradeDb.createObjectStore('reviews', {keyPath: 'id'});
            reviewsTbl.createIndex('restaurant_id', 'restaurant_id');
        }
        if (!upgradeDb.objectStoreNames.contains('reviewsOff')) {
          upgradeDb.createObjectStore('reviewsOffline', { keyPath: 'updatedAt' });
        }
    });



    //import all restaurants to db
    dbPromise.then(db => {
        DBHelper.fetchRestaurantsFromServer((error, restaurants) => {
            
            //console.log("fetch restaurants", restaurants);

            restaurants.forEach(function(rest){
                var tx = db.transaction('restaurants', 'readwrite');
                var keyValStore = tx.objectStore('restaurants');
                keyValStore.put(rest);
            })
        })
    });

    //import all reviews to db
    dbPromise.then(db => {
        DBHelper.fetchReviewsFromServer((error, reviews) => {

            //console.log("fetch reviews", reviews);

            reviews.forEach(function(rest){
                var tx = db.transaction('reviews', 'readwrite');
                var keyValStore = tx.objectStore('reviews');
                keyValStore.put(rest);
            })
        })
    });


    function writeReviewsData(st,data){
      return dbPromise
        .then(function (dbObject) {
            var tx = dbObject.transaction(st , 'readwrite');
            var store = tx.objectStore(st);
            store.put(data);
            return tx.complete;
        });
    }

