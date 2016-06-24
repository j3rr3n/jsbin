/*jshint esversion: 6*/
/*global caches, binCache, staticCacheName */

const totalBinsToKeep = 25;

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      const keep = [binCache, staticCacheName];
      const trash = names.filter(
        name => !keep.includes(name)
      ).map(
        name => caches.delete(name)
      );

      trash.push(new Promise(resolve => {
        resolve(caches.open(binCache).then(cache => {
          return cache.keys().then(keys => {
            // keep 25
            const remove = keys.slice(0, keys.length - totalBinsToKeep);
            return Promise.all(remove.map(request => cache.delete(request)) || Promise.resolve());
          });
        }));
      }));

      return Promise.all(trash).then(() => {
        return self.skipWaiting()
      }).catch(e => {
        console.log('failed to clean up');
        console.log(e);
      });
    })
  );
});
