let searchForm = document.querySelector('.search-form');
let navbar = document.querySelector('.navbar');

document.querySelector('#search-btn').onclick = () =>{
    searchForm.classList.toggle('active');
    shoppingCart.classList.remove('active');
    loginForm.classList.remove('active');
    navbar.classList.remove('active');
}

document.querySelector('#menu-btn').onclick = () =>{
    navbar.classList.toggle('active');
    searchForm.classList.remove('active');
    shoppingCart.classList.remove('active');
    loginForm.classList.remove('active');
}

window.onscroll = () =>{
    searchForm.classList.remove('active');
    shoppingCart.classList.remove('active');
    loginForm.classList.remove('active');
    navbar.classList.remove('active');
}

var swiperProducts = new Swiper(".product-slider", {
    loop: false, // Disable loop
    slidesPerView: 3, // Show 3 slides per view
    spaceBetween: 20, // Add space between slides
    autoplay: false, // Disable autoplay
    centeredSlides: false, // Disable centered slides
});



