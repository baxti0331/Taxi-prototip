function saveOrder(order){
    let orders=JSON.parse(localStorage.getItem('orders')||'[]');
    orders.push(order);
    localStorage.setItem('orders',JSON.stringify(orders));
    updateOrderHistory();
}
function updateOrderHistory(){
    const list=document.getElementById('orderHistory'); list.innerHTML='';
    const orders=JSON.parse(localStorage.getItem('orders')||'[]');
    orders.reverse().forEach(o=>{const li=document.createElement('li'); li.innerText=`От: ${o.from}, До: ${o.to}, Тариф: ${o.tariff}, ${o.price}`; list.appendChild(li);});
}
updateOrderHistory();
