const CACHE_NAME = 'my-site-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v2';

const FILES_TO_CACHE = [
  '/',
  '/indexDB.js',
  '/manifest.json',
  '/js/index.js',
  '/css/style.css',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png'
];

// Install the service worker
self.addEventListener('install', function(evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log('Your files were pre-cached successfully!');
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });

  // Intercept fetch requests
self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api/')) {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then(cache => {
            return fetch(evt.request)
              .then(response => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
  
                return response;
              })
              .catch(err => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
          })
          .catch(err => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      fetch(evt.request).catch(function() {
        return caches.match(evt.request).then(function(response) {
          if (response) {
            return response;
          } else if (evt.request.headers.get('accept').includes('text/html')) {
            // return the cached home page for all requests for html pages
            return caches.match('/');
          }
        });
      })
    );
  });
  