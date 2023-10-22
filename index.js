const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("nav-menu_visible");

  if (navMenu.classList.contains("nav-menu_visible")) {
    navToggle.setAttribute("aria-label", "Cerrar menú");
  } else {
    navToggle.setAttribute("aria-label", "Abrir menú");
  }
});



const spectrogram = document.querySelector('.spectrogram');

for (let i = 0; i < 10; i++) {
  const bar = document.createElement('div');
  bar.classList.add('bar');
  const randomDuration = Math.random() * 0.5 + 0.2; // Genera una duración aleatoria entre 0.5 y 1 segundos
  bar.style.animationDuration = `${randomDuration}s`;
  spectrogram.appendChild(bar);
}


