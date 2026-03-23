const profilePanel=document.getElementById('profilePanel');
document.getElementById('openProfile').addEventListener('click',()=>{profilePanel.classList.add('active');});
document.getElementById('closeProfile').addEventListener('click',()=>{profilePanel.classList.remove('active');});
document.getElementById('saveProfile').addEventListener('click',()=>{
    const username=document.getElementById('username').value;
    const phone=document.getElementById('phone').value;
    localStorage.setItem('username',username);
    localStorage.setItem('phone',phone);
    alert('Профиль сохранен!');
});
document.getElementById('username').value=localStorage.getItem('username')||'';
document.getElementById('phone').value=localStorage.getItem('phone')||'';
