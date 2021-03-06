/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    //return `http://localhost:${port}/data/restaurants.json`;
    return `http://localhost:${port}/`;
  }



  /**
   * Fetch all restaurants from server.
   */
  static fetchRestaurantsFromServer(callback) {
    fetch( DBHelper.DATABASE_URL + `restaurants/`, {headers: {}} )
      .then(response => response.json())
      .then(restaurants => callback(null, restaurants) )
      .catch(error => {
        console.error("Fetch return error");
        callback(error, null);
      });
  }

  /**
   * Fetch all reviews from server.
   */
  static fetchReviewsFromServer(callback) {
    console.log(DBHelper.DATABASE_URL + `reviews/`);
    fetch( DBHelper.DATABASE_URL + `reviews/`, {headers: {}} )
      .then(response => response.json())
      .then(reviews => callback(null, reviews) )
      .catch(error => {
        console.error("Fetch return error");
        callback(error, null);
      });
  }


  static fetchRestaurants(callback) {
    var dbPromise = idb.open('restaurantsAppDB');

    return dbPromise.then(function(db) {
      var tx = db.transaction('restaurants', 'readonly');
      var store = tx.objectStore('restaurants');

      return store.getAll();
    }).then(restaurants => callback(null, restaurants));
  }

  /*static fetchRestaurants(callback) {
    var dbPromise = idb.open('restaurantsAppDB');

    dbPromise.then(db => {
      return db.transaction('restaurants')
        .objectStore('restaurants').getAll();
    })
    .then(restaurants => { return callback(null, restaurants) });

  }*/



  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {

      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }


  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}_sm.webp`);
  }


  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }


  static fetchReviews(callback) {
    var dbPromise = idb.open('restaurantsAppDB');

    dbPromise.then(function(db) {
      var tx = db.transaction('reviews', 'readonly');
      var reviews = tx.objectStore('reviews');
      
      return reviews;//.getAll();
    }).then(reviews => callback(null, reviews));
  }


  static fetchAllReviews(callback) {
    DBHelper.fetchReviews((error, reviews) => {

      if (error) {
        callback(error, null);
      } else {
        
        const list = reviews.getAll();
        if (list) {
          callback(null, list);
        } else { 
          callback('Reviews not found', null);
        }
      }
    });
  }

  /** Add Review **/

  static submitReview(data, callback) {

    return fetch( DBHelper.DATABASE_URL + `reviews/`, {
      body: JSON.stringify(data),
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => { writeReviewsData('reviews',  data); return data;  }) //
    .catch(error => {
      data['updatedAt'] = new Date().getTime();
      data['createdAt'] = new Date().getTime();
      
      //add offline
      writeReviewsDataOffline('reviewsOffline',data);
      console.log('Offline...Offline...');
      console.log('Offline Mode: Review stored in IDB review2');

      callback(error, null);
      
    });

  } 


  /**
   * Fetch reviews by restaurant ID.
   */
  static fetchReviewsByRestaurantId(id, callback) {
    // fetch all reviews with proper error handling.
    DBHelper.fetchReviews((error, reviews) => {

      if (error) {
        callback(error, null);
      } else {
        
        const list = reviews.index('restaurant_id').getAll(id);    
        if (list) {
          callback(null, list);
        } else { 
          callback('Reviews not found for that restaurant_id does not exist', null);
        }
      }
    });
  }



}
