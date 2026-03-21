const tg = window.Telegram.WebApp;

let map;
let route;
let multiplier = 1;
let fromCoords = null;

// INIT MAP
ymaps.ready(() => {
  map = new ymaps.Map("map", {
    center: [41.2995, 69.2401],
    zoom: 12,
    controls: []
  });

  // USER GEO
  ymaps.geolocation.get().then(res => {
    const coords = res.geoObjects.get(0).geometry.getCoordinates();
    map.setCenter(coords, 14);
    fromCoords = coords;

    document.getElementById("from").value = "📍 Sizning joylashuvingiz";
  });
});

// TARIF
document.querySelectorAll(".tariff").forEach(el => {
  el.onclick = () => {
    document.querySelectorAll(".tariff").forEach(t => t.classList.remove("active"));
    el.classList.add("active");
    multiplier = el.dataset.price;
    calculateRoute();
  };
});

// ROUTE + PRICE
function calculateRoute() {
  const from = fromCoords || document.getElementById("from").value;
  const to = document.getElementById("to").value;

  if (!to) return;

  ymaps.route([from, to]).then(res => {
    if (route) map.geoObjects.remove(route);

    route = res;
    map.geoObjects.add(route);

    const distance = route.getLength() / 1000;
    const price = (distance * 3000 * multiplier).toFixed(0);

    const priceEl = document.getElementById("price");
    priceEl.style.opacity = 0;

    setTimeout(() => {
      priceEl.innerText = `Narx: ${price} so'm`;
      priceEl.style.opacity = 1;
    }, 200);
  });
}

// EVENTS
document.getElementById("to").addEventListener("change", calculateRoute);

// SEND ORDER
document.getElementById("orderBtn").onclick = () => {
  const order = {
    from: document.getElementById("from").value,
    to: document.getElementById("to").value,
    tariff: document.querySelector(".tariff.active").innerText,
    price: document.getElementById("price").innerText
  };

  tg.sendData(JSON.stringify(order));
  tg.close();
};
