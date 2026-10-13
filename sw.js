const CACHE_NAME = 'juego-escolar-v2';
const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'imagenes/caja-cerrada.png',
  'imagenes/caja-abierta.png',
  'imagenes/juguete_oso.png',
  'imagenes/juguete_carro.png',
  'imagenes/fruta_manzana.png',
  'imagenes/fruta_platano.png',
  'imagenes/util_lapiz.png',
  'imagenes/util_cuaderno.png',
  'sonidos/exito.mp3',
  'sonidos/error.mp3',
  'sonidos/musica_fondo.mp3'
];

// Instalar y guardar los archivos en el almacenamiento local del navegador
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activar el Service Worker y tomar el control de la app inmediatamente
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Servir los archivos directamente desde la caché local sin requerir internet
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
