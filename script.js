// --- PANEL DE CONTROL: Edita los servidores aquí ---
const KAMI_CONFIG = {
    servidores: [
        { nombre: "ALPHA", url: "https://vidsrc.me/embed/anime?mal_id={id}&episode={ep}", color: "#e91e63" },
        { nombre: "BETA", url: "https://vidsrc.to/embed/anime/{id}/{ep}", color: "#673ab7" },
        { nombre: "GAMMA", url: "https://multiembed.mov/direct?video_id={name}&episode={ep}", color: "#009688" }
    ]
};

const app = {
    pagina: 1,
    busqueda: '',
    currentId: null,
    currentName: '',
    currentEp: 1,

    init() {
        this.fetchAnimes();
    },

    async fetchAnimes(append = false) {
        this.toggleLoading(true);
        const url = this.busqueda 
            ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(this.busqueda)}&page=${this.pagina}`
            : `https://api.jikan.moe/v4/top/anime?page=${this.pagina}`;
        
        try {
            const res = await fetch(url);
            const json = await res.json();
            this.renderGrid(json.data, append);
        } catch (e) { console.error("Error API"); }
        this.toggleLoading(false);
    },

    renderGrid(list, append) {
        const container = document.getElementById('grid-principal');
        const html = list.map(a => `
            <div class="card" onclick="app.verDetalles(${a.mal_id})">
                <img src="${a.images.jpg.large_image_url}" referrerpolicy="no-referrer">
                <div class="card-title">${a.title}</div>
            </div>
        `).join('');
        if(append) container.innerHTML += html; else container.innerHTML = html;
    },

    async verDetalles(id) {
        this.toggleLoading(true);
        try {
            const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
            const { data: a } = await res.json();
            
            this.currentId = id;
            this.currentName = a.title_english || a.title;

            // Traductor Automático
            let descEs = "Traduciendo sinopsis...";
            try {
                const tr = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(a.synopsis || '')}`);
                const trJ = await tr.json();
                descEs = trJ[0].map(x => x[0]).join('');
            } catch { descEs = a.synopsis || "Sin descripción."; }

            this.showSection('detalles');
            document.getElementById('sec-detalles').innerHTML = `
                <button onclick="app.irInicio()" class="sv-btn" style="background:#3d346b; width:auto; margin-bottom:20px;">← Volver</button>
                <div class="detail-header">
                    <img src="${a.images.jpg.large_image_url}" class="detail-img">
                    <div class="detail-txt">
                        <h1>${a.title}</h1>
                        <p style="color:#aaa; line-height:1.5;">${descEs}</p>
                    </div>
                </div>
                <h3>Episodios</h3>
                <div class="ep-grid">
                    ${Array.from({length: a.episodes || 12}, (_, i) => i + 1).map(num => 
                        `<button class="ep-btn" onclick="app.abrirPlayer(${num})">Episodio ${num}</button>`
                    ).join('')}
                </div>
            `;
        } catch(e) { console.error(e); }
        this.toggleLoading(false);
    },

    abrirPlayer(ep) {
        this.currentEp = ep;
        document.getElementById('player-modal').style.display = 'block';
        document.getElementById('p-title').innerText = `Viendo Episodio ${ep}`;
        this.generarBotonesServidor();
        this.cambiarServidor(0); 
    },

    generarBotonesServidor() {
        const container = document.getElementById('server-buttons');
        container.innerHTML = KAMI_CONFIG.servidores.map((sv, index) => `
            <button onclick="app.cambiarServidor(${index})" class="sv-btn" style="background:${sv.color}">
                ${sv.nombre}
            </button>
        `).join('');
    },

    cambiarServidor(index) {
        const sv = KAMI_CONFIG.servidores[index];
        const frame = document.getElementById('kami-iframe');
        const cleanName = encodeURIComponent(this.currentName.replace(/[^a-zA-Z0-9 ]/g, ""));
        
        frame.src = sv.url
            .replace("{id}", this.currentId)
            .replace("{ep}", this.currentEp)
            .replace("{name}", cleanName);
    },

    cerrarPlayer() {
        document.getElementById('player-modal').style.display = 'none';
        document.getElementById('kami-iframe').src = "";
    },

    buscar() {
        this.busqueda = document.getElementById('inputBusqueda').value;
        this.pagina = 1;
        this.showSection('inicio');
        this.fetchAnimes();
    },

    irInicio() {
        this.busqueda = ''; this.pagina = 1;
        this.showSection('inicio');
        this.fetchAnimes();
    },

    showSection(id) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(`sec-${id}`).classList.add('active');
        window.scrollTo(0,0);
    },

    siguientePagina() { this.pagina++; this.fetchAnimes(true); },

    toggleLoading(s) { document.getElementById('loader').style.display = s ? 'block' : 'none'; }
};

window.onload = () => app.init();
