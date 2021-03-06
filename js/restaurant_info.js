let restaurant;
let map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });


  /** Submit Reviews Code **/

  let form = document.querySelector('#new-review');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let rating = form.querySelector('#rating');

    let review = {
        restaurant_id: parseInt(getParameterByName('id')),
        name: form.querySelector('#name').value,
        rating: rating.options[rating.selectedIndex].value,
        comments: form.querySelector('#comments').value
    };

    DBHelper.submitReview(review, (error) => {
      if (error) {
        console.log('Error: '+ error);
      }
    }).then((data) => {
      
      review.createdAt = new Date();
      review.updatedAt = new Date();

      const ul = document.getElementById('reviews-list');
      ul.appendChild(createReviewHTML(review));

      form.reset();

    }).catch(error => {
      console.log(error);
    });
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = parseInt(getParameterByName('id'));
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = `${restaurant.name} restaurant, ${restaurant.cuisine_type} cuisine in ${restaurant.neighborhood}`;
  image.src = `img/${restaurant.id}_sm.webp`;//DBHelper.imageUrlForRestaurant{restaurant};
  image.srcset = `img/${restaurant.id}_sm.webp 400w, img/${restaurant.id}_md.webp 600w, img/${restaurant.id}.webp 800w`;
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  console.log("fill restaurant");
  // fill reviews
  fetchReviewsFromURL();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}




/**
 * Fetch Reviews on first load
 * **/

fetchReviewsFromURL = () => {
    const id = parseInt(getParameterByName('id'));

    if (!id) {
        console.log('No Id in URL to fetch Reviews');
        return;
    }
    
    DBHelper.fetchReviewsByRestaurantId(id, (err, reviews) => {
      self.reviews = reviews;
      if (err || !reviews) {
          console.log('REVIEWS: fetching error ', err);
          return;
      }
      fillReviewsHTML();
    });
}


/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {

  reviews.then(reviews => { 
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);
    //console.log(reviews);

    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById('reviews-list');

    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
  });
  
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('h3');
  name.innerHTML = review.name;
  name.tabIndex = "0";
  li.appendChild(name);

  const date = document.createElement('span');

  let dateFormat = new Date(review.createdAt);
  if(dateFormat){
    let iso = dateFormat.toISOString().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);  
    date.innerHTML = `${iso[3]}/${iso[2]}/${iso[1]} ${iso[4]}:${iso[5]}:${iso[6]}`;
  }else{
    date.innerHTML = `-`;
  }
  
  name.appendChild(date);

  const rating = document.createElement('em');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
