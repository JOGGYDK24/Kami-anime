// Usamos "one-piece" como ejemplo, pero puedes cambiarlo
const animeNom = "one-piece"; 

function cambiarEp(num) {
    const player = document.getElementById('video-player');
    // Construye la URL dinámicamente
    const nuevaUrl = `https://vidsrc.to/embed/anime/${animeNom}/ep-${num}`;
    player.src = nuevaUrl;
    console.log("Cargando episodio: " + num);
}
