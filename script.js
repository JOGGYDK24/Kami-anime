const KAMI_CONFIG = {
    servidores: [
        { nombre: "SERVER 1", url: "https://vidsrc.pro/embed/anime/{id}/{ep}", color: "#e91e63" },
        { nombre: "SERVER 2", url: "https://vidsrc.cc/v2/embed/anime/{id}/{ep}", color: "#673ab7" }
    ]
};

const app = {
    pagina: 1,
    busqueda: '',
    currentId: null,
    currentName: '',

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

            this.showSection('detalles');
            document.getElementById('sec-detalles').innerHTML = `
                <button onclick="app.irInicio()" class="ep-btn" style="margin-bottom:20px;">← Volver</button>
                <div style="display:flex; gap:20px; flex-wrap:wrap;">
                    <img src="${a.images.jpg.large_image_url}" style="width:150px; border-radius:10px;">
                    <div style="flex:1; min-width:250px;">
                        <h1>${a.title}</h1>
                        <p style="color:#aaa;">${a.synopsis || "Sin descripción."}</p>
                    </div>
                </div>
                <h3>Episodios</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap:10px;">
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
        document.body.style.overflow = 'hidden'; // Bloquea scroll fondo
        this.generarBotonesServidor();
        this.cambiarServidor(0); 
    },

    generarBotonesServidor() {
        const container = document.getElementById('server-buttons');
        container.innerHTML = KAMI_CONFIG.servidores.map((sv, index) => `
            <button onclick="app.cambiarServidor(${index})" class="ep-btn" style="flex:1; background:${sv.color}; margin:5px;">
                ${sv.nombre}
            </button>
        `).join('');
    },

    cambiarServidor(index) {
        const sv = KAMI_CONFIG.servidores[index];
        const frame = document.getElementById('kami-iframe');
        const url = sv.url.replace("{id}", this.currentId).replace("{ep}", this.currentEp);
        document.getElementById('link-emergencia').href = url;
        frame.src = url;
    },

    cerrarPlayer() {
        document.getElementById('player-modal').style.display = 'none';
        document.body.style.overflow = 'auto'; 
        document.getElementById('kami-iframe').src = "";
    },

    buscar() {
        this.busqueda = document.getElementById('inputBusqueda').value;
        this.pagina = 1; this.showSection('inicio'); this.fetchAnimes();
    },

    irInicio() {
        this.busqueda = ''; this.pagina = 1; this.showSection('inicio'); this.fetchAnimes();
    },

    showSection(id) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(`sec-${id}`).classList.add('active');
        window.scrollTo(0,0);
    },

    toggleLoading(s) { document.getElementById('loader').style.display = s ? 'block' : 'none'; }
};

window.onload = () => app.init();
