const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
  
  menuToggle.addEventListener('click', () => {
    menu.classList.toggle('show');
  });
  document.addEventListener("DOMContentLoaded", function() {
    var menuToggle = document.querySelector(".menu-toggle");
    var sideMenu = document.querySelector(".side-menu");
  
    if (menuToggle) {
      menuToggle.addEventListener("click", function() {
        sideMenu.classList.toggle("show");
      });
    }
  
    // Check screen size on initial load and hide the menu if the screen is big
    checkScreenSize();
    
    // Check screen size when the window is resized
    window.addEventListener('resize', checkScreenSize);
  
    function checkScreenSize() {
      if (window.innerWidth > 768) {
        sideMenu.classList.remove("show");
      }
    }
  });

const togglePassword = document.querySelectorAll('#togglePassword, #toggleCpassword');
const password = document.querySelectorAll('#password, #confirmPassword');

togglePassword.forEach(function (button, index) {
  button.addEventListener('click', function () {
    // toggle the type attribute
    const type = password[index].getAttribute('type') === 'password' ? 'text' : 'password';
    password[index].setAttribute('type', type);
    
    // toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
  });
});


const passwordField = document.querySelector('#password');
const confirmPasswordField = document.querySelector('#confirmPassword');
const confirmPasswordMessage = document.querySelector('#confirmPasswordMessage');

confirmPasswordField.addEventListener('input', function (e) {
  const password = passwordField.value;
  const confirmPassword = this.value;

  if (password === confirmPassword) {
    confirmPasswordMessage.textContent = 'Passwords match!';
    confirmPasswordMessage.style.color = 'green';
  } else {
    confirmPasswordMessage.textContent = 'Passwords do not match';
    confirmPasswordMessage.style.color = 'red';
  }
});