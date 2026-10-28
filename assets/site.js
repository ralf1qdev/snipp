// Shared navigation: mobile menu toggle.
document.addEventListener('DOMContentLoaded', function () {
  var nav = document.querySelector('nav.top');
  var btn = nav && nav.querySelector('.menu-btn');
  if (btn) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});
