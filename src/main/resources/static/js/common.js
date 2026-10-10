// Password toggle (login page)
function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.getElementById('eyeIcon');
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('bi-eye-slash', 'bi-eye');
    }
}

// Sidebar toggle (panel pages)
function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('backdrop')?.classList.toggle('open');
}

function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('backdrop')?.classList.remove('open');
}