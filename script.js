const KAMI_CONFIG = {
    servidores: [
        { nombre: "SERVIDOR ALPHA", url: "https://vidsrc.pro/embed/anime/{id}/{ep}", color: "#e91e63" },
        { nombre: "SERVIDOR BETA", url: "https://vidsrc.cc/v2/embed/anime/{id}/{ep}", color: "#673ab7" }
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
        if(!container) return;
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

            // Traducción Simple
            let descEs = a.synopsis || "Sin descripción.";

            this.showSection('detalles');
            document.getElementById('sec-detalles').innerHTML = `
                <button onclick="app.irInicio()" class="ep-btn" style="margin-bottom:20px; background:#444;">← Volver</button>
                <div class="detail-header">
                    <img src="${a.images.jpg.large_image_url}" class="detail-img">
                    <div class="detail-txt">
                        <h1>${a.title}</h1>
                        <p>${descEs}</p>
                    </div>
                </div>
                <h3>Episodios</h3>
                <div class="ep-grid">
                    ${Array.from({length: a.episodes || 12}, (_, i) => i + 1).map(num => 
                        `<button class="ep-btn" onclick="app.abrirPlayer(${num})">Cap ${num}</button>`
                    ).join('')}
                </div>
            `;
        } catch(e) { console.error(e); }
        this.toggleLoading(false);
    },

    abrirPlayer(ep) {
        this.currentEp = ep;
        document.getElementById('player-modal').style.display = 'block';
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
        const url = sv.url.replace("{id}", this.currentId).replace("{ep}", this.currentEp);
        
        // Actualizar el enlace de emergencia
        const linkEmergencia = document.getElementById('link-emergencia');
        if(linkEmergencia) {
            linkEmergencia.href = url;
        }

        frame.src = url;
    },

    cerrarPlayer() {
        document.getElementById('player-modal').style.display = 'none';
        document.getElementById('kami-iframe').src = "";
    },

    showSection(id) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(`sec-${id}`).classList.add('active');
        window.scrollTo(0,0);
    },

    irInicio() {
        this.busqueda = ''; this.pagina = 1;
        this.showSection('inicio');
        this.fetchAnimes();
    },

    toggleLoading(s) { document.getElementById('loader').style.display = s ? 'block' : 'none'; }
};

window.onload = () => app.init();
