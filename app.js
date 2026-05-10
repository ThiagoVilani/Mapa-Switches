// ==========================
// CREAR MAPA
// ==========================

const map = L.map('map').setView([-34.706, -58.391], 10);

// ==========================
// CAPA OPENSTREETMAP
// ==========================

//OpenStreetMap capa estandar
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; OpenStreetMap'
// }).addTo(map);

//Vista satelite
L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles © Esri'
    }
).addTo(map);


loadBoth();
async function loadBoth(){
    await drawSwitches();
    const switches = await loadSwitches();
    await loadLinks(switches);
}


// ==========================
// CARGAR JSON
// ==========================
async function drawSwitches(){
    fetch('switches.json')
        .then(response => response.json())
        .then(data => {
    
            data.forEach(sw => {
    
                // ==========================
                // COLOR SEGUN ESTADO
                // ==========================
    
                let color = 'gray';
    
                if (sw.estado === 'ONLINE') {
                    color = 'green';
                }
    
                if (sw.estado === 'OFFLINE') {
                    color = 'red';
                }
    
                if (sw.estado === 'WARNING') {
                    color = 'orange';
                }
    
                // ==========================
                // ICONO PERSONALIZADO
                // ==========================
    
                const icono = L.divIcon({
                    className: '',
                    html: `
                        <div class="marker"
                             style="background:${color}">
                        </div>
                    `,
                    iconSize: [18, 18]
                });
    
                // ==========================
                // MARCADOR
                // ==========================
    
                const marker = L.marker(
                    [sw.lat, sw.lon],
                    { icon: icono }
                ).addTo(map);
    
                // ==========================
                // POPUP
                // ==========================
    
                marker.bindPopup(`
                    <div class="popup">
    
                        <h3>${sw.nombre}</h3>
    
                        <p><b>Estación:</b> ${sw.estacion}</p>
    
                        <p><b>Sector:</b> ${sw.sector}</p>
    
                        <p><b>IP:</b> ${sw.ip}</p>
    
                        <p><b>Modelo:</b> ${sw.modelo}</p>
    
                        <p>
                            <b>Estado:</b>
    
                            <span class="
                                estado
                                ${sw.estado.toLowerCase()}
                            ">
                                ${sw.estado}
                            </span>
                        </p>
    
                        <p>
                            <b>Última revisión:</b>
                            ${sw.ultimaRevision}
                        </p>
    
                    </div>
                `);
    
            });
        })
        .catch(error => {
            console.error('Error cargando JSON:', error);
        });
}

async function loadSwitches(){
    const data = await fetch("switches.json");
    const switches = await data.json();
    return switches;
}


// ==========================
// CARGAR LINKS
// ==========================
async function loadLinks(switches){
    fetch('links.json')
        .then(response => response.json())
        .then(links => {
            links.forEach(link => {
    
                // Buscar switches
    
                const origen = switches.find(
                    sw => sw.id === link.origen
                );
    
                const destino = switches.find(
                    sw => sw.id === link.destino
                );
    
                if (!origen || !destino) return;
    
                // Color segun estado
    
                let color = 'gray';
    
                if (link.estado === 'ONLINE') {
                    color = 'lime';
                }
    
                if (link.estado === 'OFFLINE') {
                    color = 'red';
                }
    
                // Dibujar linea
    
                const linea = L.polyline(
                    [
                        [origen.lat, origen.lon],
                        [destino.lat, destino.lon]
                    ],
                    {
                        color: color,
                        weight: 4,
                        opacity: 0.8
                    }
                ).addTo(map);
    
                // Popup del enlace
    
                linea.bindPopup(`
                    <b>Enlace:</b><br>
                    ${origen.nombre}
                    ↔
                    ${destino.nombre}
                    <br><br>
    
                    <b>Tipo:</b> ${link.tipo}<br>
                    <b>Estado:</b> ${link.estado}
                `);
    
            });
    
        });
}