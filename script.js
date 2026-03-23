let myMap; 
let currentRoute; 
let carPlacemark; 
let startPlacemark, endPlacemark;

ymaps.ready(()=>{myMap=new ymaps.Map("map",{center:[41.311081,69.240562],zoom:12,controls:[]});myMap.behaviors.disable('scrollZoom');new ymaps.SuggestView('from');new ymaps.SuggestView('to');});

const fromInput=document.getElementById('from'),
      toInput=document.getElementById('to'),
      priceEl=document.getElementById('price'),
      tariffs=document.querySelectorAll('.tariff'),
      orderBtn=document.getElementById('orderBtn'),
      loader=document.querySelector('.loader'),
      bottomSheet=document.querySelector('.bottom-sheet'),
      dragHandle=document.querySelector('.drag');

let selectedTariff=1;

// Tooltips для тарифов
tariffs.forEach(t=>{const tooltip=document.createElement('div');tooltip.className='tariff-tooltip';tooltip.innerText=`${t.dataset.price}x тариф`;t.appendChild(tooltip);t.addEventListener('mouseenter',()=>{tooltip.style.display='block'});t.addEventListener('mouseleave',()=>{tooltip.style.display='none'});t.addEventListener('click',()=>{tariffs.forEach(x=>x.classList.remove('active'));t.classList.add('active');selectedTariff=parseFloat(t.dataset.price);calculatePrice();});});

function calculatePrice(){
    if(!fromInput.value||!toInput.value)return;
    loader.style.display='block';priceEl.innerText='';
    ymaps.route([fromInput.value,toInput.value]).then(route=>{
        loader.style.display='none';
        const distance=route.getLength();
        const price=(distance/1000*selectedTariff*2500).toFixed(0);
        priceEl.innerText=`Narx: ${price} so'm`;
        if(currentRoute) myMap.geoObjects.remove(currentRoute);
        currentRoute=route; route.getPaths().options.set({strokeColor:'#007bff',strokeWidth:6}); myMap.geoObjects.add(route);
        // Маркеры
        if(startPlacemark) myMap.geoObjects.remove(startPlacemark);
        if(endPlacemark) myMap.geoObjects.remove(endPlacemark);
        startPlacemark = new ymaps.Placemark(route.getWayPoints().get(0).geometry.getCoordinates(), {}, {preset:'islands#greenDotIcon'});
        endPlacemark = new ymaps.Placemark(route.getWayPoints().get(1).geometry.getCoordinates(), {}, {preset:'islands#redDotIcon'});
        myMap.geoObjects.add(startPlacemark); myMap.geoObjects.add(endPlacemark);
        myMap.setBounds(route.getBounds(), {checkZoomRange:true, zoomMargin:50});
        animateCar(route);
    }).catch(()=>{loader.style.display='none';priceEl.innerText='Narx: --';});
}

fromInput.addEventListener('change',calculatePrice);
toInput.addEventListener('change',calculatePrice);

// Анимация машины
function animateCar(route){
    const path = route.getPaths().get(0).getSegments().flatMap(seg => seg.getCoordinates());
    if(!path.length) return;
    if(!carPlacemark){
        carPlacemark = new ymaps.Placemark(path[0], {}, {
            iconLayout:'default#image',
            iconImageHref:'https://cdn-icons-png.flaticon.com/512/61/61168.png',
            iconImageSize:[40,40],
            iconImageOffset:[-20,-20]
        });
        myMap.geoObjects.add(carPlacemark);
    }
    let index=0; const speed=50;
    const moveCar=()=>{if(index>=path.length)return; carPlacemark.geometry.setCoordinates(path[index]); index++; setTimeout(moveCar,speed);}
    moveCar();
}

// Push уведомления
function notifyUser(title,message){
    if(!("Notification" in window)) return;
    if(Notification.permission==="granted"){new Notification(title,{body:message});}
    else if(Notification.permission!=="denied"){Notification.requestPermission().then(p=>{if(p==="granted") new Notification(title,{body:message});});}
}

// Заказ
orderBtn.addEventListener('click',()=>{
    const from=fromInput.value,to=toInput.value,price=priceEl.innerText;
    if(!from||!to)return alert('Заполните все поля');
    const username=localStorage.getItem('username')||'Неизвестно';
    const phone=localStorage.getItem('phone')||'Неизвестно';
    const message=`📌 Новый заказ:\nПользователь: ${username}\nТелефон: ${phone}\nОт: ${from}\nДо: ${to}\nТариф: ${selectedTariff}\n${price}`;
    fetch(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:'@<YOUR_CHANNEL_ID>',text:message})})
    .then(res=>res.json()).then(data=>{if(data.ok){alert('Заказ отправлен!');saveOrder({from,to,tariff:selectedTariff,price,username,phone}); notifyUser("Заказ создан", `${from} → ${to}, ${price}`);}else alert('Ошибка при отправке');});
});

// Draggable bottom-sheet
let dragging=false,startY,startBottom;
dragHandle.addEventListener('mousedown',e=>{dragging=true;startY=e.clientY;startBottom=parseInt(window.getComputedStyle(bottomSheet).bottom);document.body.style.userSelect='none';});
document.addEventListener('mousemove',e=>{if(!dragging)return;let dy=startY-e.clientY;let newBottom=startBottom+dy;newBottom=Math.min(Math.max(newBottom,0),window.innerHeight-120);bottomSheet.style.bottom=`${newBottom}px`;myMap.container.getElement().style.filter=`brightness(${1-newBottom/window.innerHeight*0.35})`;});
document.addEventListener('mouseup',()=>{dragging=false;document.body.style.userSelect='auto';});