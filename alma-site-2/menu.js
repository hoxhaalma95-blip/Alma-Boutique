// Hamburger menu: shows/hides the links on small screens
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.right-menu');

toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

// If the window is made wide again, reset the menu
window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    }
});
