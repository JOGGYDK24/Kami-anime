let currentTitle = "";
let currentEp = 1;
let currentSrv = 1;

// Traductor Pro
async function translate(text) {
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`);
        const d = await res.json();
        return d[0].map(x => x[0]).join('');
    } catch (e) { return text; }
}

async function loadAnimes(search = null) {
    const query = `query ($s: String) { Page(perPage: 40) { media(search: $s, type: ANIME, sort: TRENDING_DESC) {
        title { romaji, english } description bannerImage coverImage { extraLarge } episodes } } }`;
    try {
        const res = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { s: search } })
        });
        const d = await res.json();
        const grid = document.getElementById('anime-grid');
        grid.innerHTML = "";
        d.data.Page.media.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'anime-card';
            card.innerHTML = `<img src="${anime.coverImage.extraLarge}"><h3>${anime.title.romaji}</h3>`;
            card.onclick = () => openDetails(anime);
            grid.appendChild(card);
        });
    } catch (e) { console.error("API error"); }
}

async function openDetails(anime) {
    // Usamos título en inglés para mayor compatibilidad con servidores
    currentTitle = anime.title.english || anime.title.romaji;
    document.getElementById('modal-title').innerText = currentTitle;
    document.getElementById('anime-banner').src = anime.bannerImage || anime.coverImage.extraLarge;
    document.getElementById('video-area').style.display = 'none';
    document.getElementById('player-modal').style.display = 'block';
    
    document.getElementById('modal-desc').innerText = "Traduciendo sinopsis...";
    const desc = await translate(anime.description.replace(/<[^>]*>?/gm, ''));
    document.getElementById('modal-desc').innerText = desc;

    const list = document.getElementById('episode-list');
    list.innerHTML = "";
    const total = anime.episodes || 12;
    for(let i = 1; i <= total; i++) {
        const b = document.createElement('button');
        b.innerText = i;
        b.onclick = () => playVideo(i);
        list.appendChild(b);
    }
}

function playVideo(ep) {
    currentEp = ep;
    document.getElementById('video-area').style.display = 'block';
    const container = document.getElementById('video-container');
    const slug = encodeURIComponent(currentTitle);

    // SERVIDORES OPTIMIZADOS PARA WEB Y APK
    const servers = [
        `https://www.2embed.cc/embed/anime?title=${slug}&episode=${ep}`,
        `https://autoembed.to/anime/search?q=${slug}&ep=${ep}`,
        `https://vidsrc.me/embed/anime?title=${slug}&episode=${ep}`
    ];

    container.innerHTML = `<iframe src="${servers[currentSrv-1]}" allowfullscreen></iframe>`;
    document.getElementById('video-area').scrollIntoView({ behavior: 'smooth' });
}

function changeServer(n) {
    currentSrv = n;
    for(let i=1; i<=3; i++) document.getElementById('srv'+i).className = (i===n)?'tab active':'tab';
    playVideo(currentEp);
}

function closePlayer() {
    document.getElementById('player-modal').style.display = 'none';
    document.getElementById('video-container').innerHTML = '';
}

function searchAnime() { loadAnimes(document.getElementById('searchInput').value); }
window.onload = () => loadAnimes();