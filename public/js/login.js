// public/js/login.js
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('form[action="/login"]');

  if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const email = loginForm.querySelector('input[name="email"]').value;
      const password = loginForm.querySelector('input[name="password"]').value;

      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.redirect) {
          localStorage.setItem('jwtToken', data.token);
          alert('로그인 성공!');
          window.location.href = data.redirect; // 로그인 후 리다이렉트
        } else {
          alert('로그인 실패: ' + data.msg);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('로그인 실패: ' + error);
      });
    });
  }
});
