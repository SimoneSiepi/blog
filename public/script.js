function verificaForm() {
    var admin=document.getElementById('admin_name');
    var adminPassword=document.getElementById('admin_password');
    var errorName = admin.value !== 'admin1';
    var correctName = admin.value === 'admin1';
    var errorPassword = adminPassword.value !== '123456789';
    var correctPassword = adminPassword.value === '123456789';
    
    admin.classList.toggle('error', errorName);
    admin.classList.toggle('correct', correctName);
    adminPassword.classList.toggle('error', errorPassword);
    adminPassword.classList.toggle('correct', correctPassword);

    return !(errorName || errorPassword);
}