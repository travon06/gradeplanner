const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const loginForm = document.getElementById('loginForm');

usernameInput.addEventListener('keydown', event => {
    if(event.keyCode === 13) {
        event.preventDefault();
        passwordInput.focus();
    }
});

passwordInput.addEventListener('keydown', event => {
    if(event.keyCode === 13) {
        event.preventDefault();
        submitLoginForm();
    }
});

loginForm.addEventListener('submit', event => {
    event.preventDefault();
    submitLoginForm();
});

function submitLoginForm() {
    const formData = {
        username: usernameInput.value,
        password: passwordInput.value
    }
    fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(res => {
        if(!res.ok) {
            return res.json().then(err => {
                throw new Error(err.err);
            });
        }
        return res.json();
    })
    .then(data => {
        if(data.redirect) window.location.href = data.redirectTo;                
    })
    .catch(err => {
        console.error(err);
        document.getElementById('errHandeler').textContent = err.toString().split(':')[1];
        document.getElementById('errHandeler').style.display = 'block';
    });
}