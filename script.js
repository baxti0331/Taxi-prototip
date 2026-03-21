const tg = window.Telegram.WebApp;

let map;
let route;
let multiplier = 1;

// Инициализация карты
ymaps.ready(() => {
  map = new ymaps.Map("map", {
    center: [41.2995, 69.2401],
    zoom: 12,
    controls: []
  });
});

// тариф
document.querySelectorAll(".tariff").forEach(el => {
  el.onclick = () => {
    document.querySelectorAll(".tariff").forEach(t => t.classList.remove("active"));
    el.classList.add("active");
    multiplier = el.dataset.price;
    calculateRoute();
  };
});

// расчет маршрута
function calculateRoute() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  if (!from || !to) return;

  ymaps.route([from, to]).then(res => {
    if (route) map.geoObjects.remove(route);

    route = res;
    map.geoObjects.add(route);

    const distance = route.getLength() / 1000; // км
    const price = (distance * 3000 * multiplier).toFixed(0);

    document.getElementById("price").innerText = `Narx: ${price} so'm`;
  });
}

// события
document.getElementById("from").onchange = calculateRoute;
document.getElementById("to").onchange = calculateRoute;

// отправка в Telegram
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