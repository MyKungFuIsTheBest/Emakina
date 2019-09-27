function toggleMenu() {
    document.getElementById("hamburger").classList.toggle("expanded");
    document.getElementById("mainNav").classList.toggle("expanded");
    document.getElementsByClassName("overlay-mobile")[0].classList.toggle("active");
}

var submenus = document.querySelectorAll(".main-nav__menu-link--submenu");

for (var i = 0; i < submenus.length; i++) {
    submenus[i].addEventListener("click", function (e) {
        e.preventDefault();
        var submenu = this.nextSibling.parentElement;
        submenu.classList.toggle('active')
    });
}