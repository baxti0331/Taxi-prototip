let myMap;
let currentRoute;

ymaps.ready(init);

function init() {
    myMap = new ymaps.Map("map", {
        center: [41.311081, 69.240562],
        zoom: 12,
        controls: []
    });

    myMap.behaviors.disable('scrollZoom');

    new ymaps.SuggestView('from');
    new ymaps.SuggestView('to');
}

const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const priceEl = document.getElementById('price');
const tariffs = document.querySelectorAll('.tariff');
const orderBtn = document.getElementById('orderBtn');
const loader = document.querySelector('.loader');
const bottomSheet = document.querySelector('.bottom-sheet');
const dragHandle = document.querySelector('.drag');

let selectedTariff = 1;

// Выбор тарифа
tariffs.forEach(t => {
    t.addEventListener('click', () => {
        tariffs.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        selectedTariff = parseFloat(t.dataset.price);
        calculatePrice();
    });
});

// Построение маршрута и расчет цены
function calculatePrice() {
    if (!fromInput.value || !toInput.value) return;

    loader.style.display = 'block';
    priceEl.innerText = '';

    ymaps.route([fromInput.value, toInput.value]).then(route => {
        loader.style.display = 'none';
        const distance = route.getLength();
        const price = (distance / 1000 * selectedTariff * 2500).toFixed(0);
        priceEl.innerText = `Narx: ${price} so'm`;

        if (currentRoute) myMap.geoObjects.remove(currentRoute);
        currentRoute = route;
        route.getPaths().options.set({ strokeColor: '#007bff', strokeWidth: 5 });
        myMap.geoObjects.add(route);
        myMap.setBounds(route.getBounds(), { checkZoomRange: true });
    }).catch(() => {
        loader.style.display = 'none';
        priceEl.innerText = `Narx: --`;
    });
}

fromInput.addEventListener('change', calculatePrice);
toInput.addEventListener('change', calculatePrice);

// Отправка заказа в Telegram
orderBtn.addEventListener('click', () => {
    const from = fromInput.value;
    const to = toInput.value;
    const price = priceEl.innerText;

    if (!from || !to) return alert('Заполните все поля');

    const message = `📌 Новый заказ:\nОт: ${from}\nДо: ${to}\nТариф: ${selectedTariff}\n${price}`;

    fetch(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: '@<YOUR_CHANNEL_ID>', text: message })
    })
    .then(res => res.json())
    .then(data => {
        if(data.ok) alert('Заказ отправлен!');
        else alert('Ошибка при отправке');
    });
});

// Draggable bottom-sheet
let dragging = false;
let startY, startBottom;

dragHandle.addEventListener('mousedown', e => {
    dragging = true;
    startY = e.clientY;
    startBottom = parseInt(window.getComputedStyle(bottomSheet).bottom);
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', e => {
    if (!dragging) return;
    let dy = startY - e.clientY;
    let newBottom = startBottom + dy;
    newBottom = Math.min(Math.max(newBottom, 0), window.innerHeight - 100);
    bottomSheet.style.bottom = `${newBottom}px`;
    myMap.container.getElement().style.filter = `brightness(${1 - newBottom/window.innerHeight * 0.3})`;
});

document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = 'auto';
});