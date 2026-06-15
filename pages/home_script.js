let scenari = [];
let scenario_selezionato = "main";
let workout = false;
let timerInterval = null;
let uiInterval = null;
let popupApertoWorkout = false;


let esercizi = [];

let gruppoPerEsercizio = {};

const GRUPPI_MUSCOLARI = {
    tutti: { label: "Tutti", icon: "fa-solid fa-layer-group" },
    petto: { label: "Petto", icon: "fa-solid fa-shield-halved" },
    schiena: { label: "Schiena", icon: "fa-solid fa-grip-lines" },
    spalle: { label: "Spalle", icon: "fa-solid fa-angles-up" },
    braccia: { label: "Braccia", icon: "fa-solid fa-hand-fist" },
    gambe: { label: "Gambe", icon: "fa-solid fa-shoe-prints" },
    addominali: { label: "Addominali", icon: "fa-solid fa-water" },
    glutei: { label: "Glutei", icon: "fa-solid fa-person-walking" },
    cardio: { label: "Cardio", icon: "fa-solid fa-heart-pulse" },
    altro: { label: "Altro", icon: "fa-solid fa-ellipsis" }
};

const PAROLE_CHIAVE_GRUPPI = {
    petto: ["panca", "chest", "petto", "croci", "push up", "piegamenti", "dip", "parallele", "pec", "spinte"],
    schiena: ["trazioni", "rematore", "lat machine", "pulley", "schiena", "pull up", "pulldown", "iperestensioni", "lat"],
    spalle: ["shoulder", "spalle", "alzate", "military", "arnold", "deltoide", "lento avanti"],
    braccia: ["curl", "bicipiti", "tricipiti", "french press", "push down", "braccia", "avambraccio", "hammer"],
    gambe: ["squat", "leg", "gambe", "affondi", "pressa", "estensioni", "calf", "polpacci", "quadricipiti", "femorali", "stacco"],
    addominali: ["addominali", "crunch", "plank", "ab wheel", "sit up", "core", "obliqui"],
    glutei: ["glutei", "gluteo", "hip thrust", "ponte", "abductor", "abduttore"],
    cardio: ["corsa", "cyclette", "tapis", "ellittica", "cardio", "rowing", "vogatore", "burpee", "salto", "jump"]
};

function rilevaGruppoMuscolare(nome) {
    const nomeLower = nome.toLowerCase();
    for (const gruppo in PAROLE_CHIAVE_GRUPPI) {
        if (PAROLE_CHIAVE_GRUPPI[gruppo].some(parola => nomeLower.includes(parola))) {
            return gruppo;
        }
    }
    return "altro";
}

function generaContenutoPicker() {
    let filtriHtml = "";
    for (const key in GRUPPI_MUSCOLARI) {
        const g = GRUPPI_MUSCOLARI[key];
        filtriHtml += `<button class="filtro-muscolo ${key === 'tutti' ? 'active' : ''}" data-gruppo="${key}" title="${g.label}"><i class="${g.icon}"></i></button>`;
    }

    return `
        <input type="text" class="es-picker-search" placeholder="Cerca esercizio...">
        <div class="es-picker-filtri">${filtriHtml}</div>
        <ul class="es-picker-lista"></ul>
    `;
}

function renderListaPicker(container, selezionati) {
    const lista = container.querySelector(".es-picker-lista");
    const ricerca = container.querySelector(".es-picker-search").value.trim().toLowerCase();
    const gruppoAttivo = container.querySelector(".filtro-muscolo.active").dataset.gruppo;

    lista.innerHTML = "";

    esercizi.forEach(nome => {
        const gruppo = gruppoPerEsercizio[nome] || "altro";
        if (gruppoAttivo !== "tutti" && gruppo !== gruppoAttivo) return;
        if (ricerca && !nome.toLowerCase().includes(ricerca)) return;

        const li = document.createElement("li");
        li.className = "es-picker-item" + (selezionati.has(nome) ? " selezionato" : "");
        li.innerHTML = `<span>${nome}</span><i class="fa-solid fa-check es-picker-check"></i>`;
        li.onclick = () => {
            if (selezionati.has(nome)) {
                selezionati.delete(nome);
            } else {
                selezionati.add(nome);
            }
            li.classList.toggle("selezionato");
            if (container._onSelectionChange) container._onSelectionChange();
        };
        lista.appendChild(li);
    });

    if (lista.children.length === 0) {
        lista.innerHTML = `<li class="es-picker-vuoto">Nessun esercizio trovato</li>`;
    }
}

function inizializzaPicker(container, selezionati, onSelectionChange) {
    container.innerHTML = generaContenutoPicker();
    container._onSelectionChange = onSelectionChange;

    container.querySelector(".es-picker-search").addEventListener("input", () => {
        renderListaPicker(container, selezionati);
    });

    container.querySelectorAll(".filtro-muscolo").forEach(btn => {
        btn.addEventListener("click", () => {
            container.querySelectorAll(".filtro-muscolo").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderListaPicker(container, selezionati);
        });
    });

    renderListaPicker(container, selezionati);
}

function inizializzaScenari() {
    scenari = [
        document.getElementById("main-container"),
        document.getElementById("profile-container"),
        document.getElementById("startworkout-container"),
        document.getElementById("workout-container"),
        document.getElementById("progress-container")
    ];
}

async function inizializzaEsercizi() {
    try {
        const risposta = await fetch('../es_gym.csv');
        const datiCsv = await risposta.text();

        const righe = datiCsv.split(/\r?\n/);

        for (let i = 1; i < righe.length; i++) {
            const riga = righe[i].trim();
            if (riga === '') continue;

            const colonne = riga.split(',');
            let nomeEsercizio = colonne[1];

            if (nomeEsercizio) {
                nomeEsercizio = nomeEsercizio.replace(/_/g, ' ');
                esercizi.push(nomeEsercizio);
                gruppoPerEsercizio[nomeEsercizio] = rilevaGruppoMuscolare(nomeEsercizio);
            }
        }
    } catch (errore) {
        console.error("Errore nel caricamento del file:", errore);
    }
}

function changeTheme() {
    let body = document.body;
    body.classList.toggle("dark-mode");
    let themeIcon = document.getElementById("change-theme");
    if (body.classList.contains("dark-mode")) {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
    } else {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../index.html';
}

function controllaLoggato() {
    if (sessionStorage.getItem("loggato") !== "true") {
        window.location.href = '/index.html';
    } else {
        inizializzaScenari();
        renderProgrammi();
        loadProfile();
        showUsername();
        setInterval(showUsername, 500);
        setScenario("main-container");
        scenario_selezionato = "main";
    }
}

function setScenario(scenario) {
    for (let i = 0; i < scenari.length; i++) {
        if (scenari[i]) {
            if (scenari[i].id != scenario) {
                scenari[i].style.display = 'none';
            } else {
                scenari[i].style.display = 'block';
            }
        }
    }
    if (scenario === "main-container" || scenario === "startworkout-container" || scenario === "workout-container") {
        renderProgrammi();
    }
}

function showUsername() {
    let emailSalvata = sessionStorage.getItem("email") || "";
    let username = localStorage.getItem("username_" + emailSalvata) || sessionStorage.getItem("username");
    if (username) {
        document.getElementById("show-username").innerText = username;
    }
}

function loadProfile() {
    let emailSalvata = sessionStorage.getItem("email") || "";
    if (emailSalvata === "") return;

    document.getElementById("profile-email").value = emailSalvata;

    let workouts = document.getElementById("n-workout");
    let followers = document.getElementById("n-follower");
    let follows = document.getElementById("n-follow");

    if (workouts) {
        workouts.textContent = localStorage.getItem("workouts_" + emailSalvata) || "0";
    }
    if (followers) {
        followers.textContent = localStorage.getItem("followers_" + emailSalvata) || "0";
    }
    if (follows) {
        follows.textContent = localStorage.getItem("follows_" + emailSalvata) || "0";
    }

    let inputUsername = document.getElementById("profile-username");
    let inputInstagram = document.getElementById("profile-instagram");
    let inputFacebook = document.getElementById("profile-facebook");

    if (inputUsername) {
        inputUsername.value = localStorage.getItem("username_" + emailSalvata) || sessionStorage.getItem("username") || "";
        inputUsername.oninput = function () {
            if (inputUsername.value.trim() !== "") {
                sessionStorage.setItem("username", inputUsername.value);
                localStorage.setItem("username_" + emailSalvata, inputUsername.value);
            }
        };

        document.getElementById("show-username").textContent = inputUsername.value;
    }

    if (inputInstagram) {
        inputInstagram.value = localStorage.getItem("instagram_" + emailSalvata) || "";
        inputInstagram.oninput = function () {
            localStorage.setItem("instagram_" + emailSalvata, inputInstagram.value);
        };
    }

    if (inputFacebook) {
        inputFacebook.value = localStorage.getItem("facebook_" + emailSalvata) || "";
        inputFacebook.oninput = function () {
            localStorage.setItem("facebook_" + emailSalvata, inputFacebook.value);
        };
    }

    let immagineSalvata = localStorage.getItem("pic_" + emailSalvata);
    if (immagineSalvata) {
        document.querySelectorAll("#profile-pic").forEach(img => {
            img.src = immagineSalvata;
        });
    }
}

function openProfile() {
    setScenario("profile-container");
    scenario_selezionato = "profile";
    loadProfile();
}

function openHome() {
    setScenario("main-container");
    scenario_selezionato = "main";
}

function openWorkout() {
    resetInfo();
    setScenario("startworkout-container");
    renderProgrammi();

    scenario_selezionato = "start_workout";

    let emailSalvata = sessionStorage.getItem("email") || "";
    if (emailSalvata !== "") {
        let nW = parseInt(localStorage.getItem("workouts_" + emailSalvata)) || 0;
        let element = document.getElementById("n-workout");
        if (element) element.textContent = nW;
    }
}

let emailUtenteProgrammi = sessionStorage.getItem("email") || "default";

let programmi = JSON.parse(localStorage.getItem("programmi_" + emailUtenteProgrammi)) || [];

let programmaId = parseInt(localStorage.getItem("programmaId_max_" + emailUtenteProgrammi)) || 0;
let maxProgrammi = 7;

function addWorkout() {
    let overlay = document.getElementById("popup-nuovo-programma");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "popup-nuovo-programma";
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div id="popup-nuovo-programma-box">
            <h3>Dai un nome al tuo<br>programma</h3>
            <div id="popup-programma-input-wrap">
                <input type="text" id="input-nome-programma" value="Il Mio Programma #${programmaId}">
                <hr id="input-programma-linea">
            </div>
            <div id="popup-programma-btns">
                <button id="btn-annulla-programma" onclick="chiudiPopupProgramma()">Annulla</button>
                <button id="btn-crea-programma" onclick="creaProgramma()">Crea</button>
            </div>
        </div>
    `;

    overlay.style.display = "flex";
}

function chiudiPopupProgramma() {
    const overlay = document.getElementById("popup-nuovo-programma");
    if (overlay) overlay.style.display = "none";
}

function creaProgramma() {
    const input = document.getElementById("input-nome-programma");

    if (programmi.length >= maxProgrammi) {
        input.value = "Max. numero di programmi raggiunto!";
        return;
    }

    const nome = input.value.trim() !== "" ? input.value.trim() : `Il Mio Programma #${programmaId}`;

    const programma = {
        id: programmaId,
        nome,
        allenamenti: 0,
        descrizione: "",
        livello: "",
        obiettivo: "",
        giorni: "",
        durata: ""
    };

    programmi.push(programma);
    programmaId++;

    salvaProgrammiSuLocalStorage();
    chiudiPopupProgramma();
    renderProgrammi();
}

function rimuoviProgramma(id) {
    if (!confirm("Sei sicuro di voler eliminare questo programma?")) return;

    programmi = programmi.filter(p => p.id !== id);

    programmaId = programmi.length > 0
        ? Math.max(...programmi.map(p => p.id)) + 1
        : 0;

    salvaProgrammiSuLocalStorage();
    renderProgrammi();
}

function renderProgrammi() {
    const lista = document.getElementById("list-workouts");
    lista.innerHTML = "";

    programmi.forEach(p => {
        const li = document.createElement("li");
        li.className = "programma-item";
        li.onclick = () => apriDettaglioProgramma(p.id, false);
        li.innerHTML = `
            <i class="fa-solid fa-receipt programma-icon"></i>
            <div class="programma-info">
                <span class="programma-nome">${p.nome}</span>
                <span class="programma-allenamenti">${p.allenamenti} allenamenti</span>
            </div>
            <button class="programma-remove" onclick="event.stopPropagation(); rimuoviProgramma(${p.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        lista.appendChild(li);
    });
}

function salvaProgrammiSuLocalStorage() {
    let emailUtenteProgrammi = sessionStorage.getItem("email") || "default";
    localStorage.setItem("programmi_" + emailUtenteProgrammi, JSON.stringify(programmi));
    localStorage.setItem("programmaId_max_" + emailUtenteProgrammi, programmaId);
}

function apriDettaglioProgramma(id, inModalitaModifica = false) {
    const programma = programmi.find(p => p.id === id);
    if (!programma) return;

    const conteggioRoutine = caricaRoutine(id).length;
    if (programma.allenamenti !== conteggioRoutine) {
        programma.allenamenti = conteggioRoutine;
        salvaProgrammiSuLocalStorage();
    }

    let overlay = document.getElementById("popup-dettaglio-programma");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "popup-dettaglio-programma";
        document.body.appendChild(overlay);
    }

    const descrizioneValore = programma.descrizione || "";
    const livelloValore = programma.livello || "Non specificato";
    const obiettivoValore = programma.obiettivo || "Non specificato";
    const giorniValore = programma.giorni || "Non specificato";
    const durataValore = programma.durata ? `${programma.durata} mesi` : "Non specificato";

    overlay.innerHTML = `
        <div id="popup-dettaglio-box" class="${inModalitaModifica ? 'modo-modifica' : 'modo-visualizza'}">
            <div id="popup-dettaglio-header">
                ${inModalitaModifica ? `
                    <button class="btn-popup-icon" onclick="apriDettaglioProgramma(${programma.id}, false)">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <div></div>
                ` : `
                    <button class="btn-popup-icon" onclick="chiudiDettaglioProgramma()">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                    <div style="position: relative; display: flex; gap: 10px;">
                        <button class="btn-popup-icon">
                            <i class="fa-solid fa-share-nodes"></i>
                        </button>
                        <button class="btn-popup-icon" onclick="togglePopupSettings(event)">
                            <i class="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <div id="popup-settings-dropdown">
                            <div onclick="apriDettaglioProgramma(${programma.id}, true)">
                                <i class="fa-solid fa-pencil"></i>
                                <span>Modifica Programma</span>
                            </div>
                        </div>
                    </div>
                `}
            </div>
            
            ${inModalitaModifica ? `
                <div class="area-foto-programma" onclick="cambiaFotoProgramma(${programma.id})">
                    <i class="fa-solid fa-receipt dettaglio-icon-centrata"></i>
                    <span class="link-aggiungi-foto">Aggiungi Foto</span>
                </div>
                <hr class="divisore-dettaglio">
            ` : ''}
            
            <div class="corpo-scroll-dettaglio">
                <div class="area-testi-dettaglio">
                    ${inModalitaModifica ? `
                        <div class="input-container-dettaglio" style="margin-top: 50px;">
                            <label class="label-bordo-superiore">Titolo del programma</label>
                            <input type="text" id="input-dettaglio-nome" value="${programma.nome}" oninput="aggiornaNomeProgramma(${programma.id}, this.value)">
                        </div>
                        <div class="input-container-dettaglio" style="margin-top: 25px;">
                            <label class="label-bordo-superiore">Descrizione</label>
                            <input type="text" id="input-dettaglio-desc" placeholder="Descrizione (Opzionale)" value="${descrizioneValore}" oninput="aggiornaDescrizioneProgramma(${programma.id}, this.value)">
                        </div>

                        <div class="sezione-modifica-opzioni">
                            <label class="sezione-titolo-label">Livello</label>
                            <div class="griglia-livelli">
                                <div class="card-opzione ${programma.livello === 'Principiante' ? 'active' : ''}" onclick="selezionaLivello(this, ${programma.id}, 'Principiante')">
                                    <i class="fa-solid fa-battery-full"></i>
                                    <span>Principiante</span>
                                </div>
                                <div class="card-opzione ${programma.livello === 'Intermedio' ? 'active' : ''}" onclick="selezionaLivello(this, ${programma.id}, 'Intermedio')">
                                    <i class="fa-solid fa-battery-half"></i>
                                    <span>Intermedio</span>
                                </div>
                                <div class="card-opzione ${programma.livello === 'Avanzato' ? 'active' : ''}" onclick="selezionaLivello(this, ${programma.id}, 'Avanzato')">
                                    <i class="fa-solid fa-battery-quarter"></i>
                                    <span>Avanzato</span>
                                </div>
                            </div>
                        </div>

                        <div class="sezione-modifica-opzioni">
                            <label class="sezione-titolo-label">Giorni per settimana</label>
                            <ul class="lista-numeri-pulsanti" id="gruppo-giorni">
                                ${[1, 2, 3, 4, 5, 6, 7, '8+'].map(g => `
                                    <li>
                                        <button class="btn-piccolo-numero ${programma.giorni == g ? 'active' : ''}" onclick="selezionaGiorni(this, ${programma.id}, '${g}')">
                                            ${g}
                                        </button>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <div class="sezione-modifica-opzioni">
                            <label class="sezione-titolo-label">Durata (mesi)</label>
                            <ul class="lista-numeri-pulsanti" id="gruppo-durata">
                                ${[1, 2, 3, 4, 5, 6, 7, '8+'].map(m => `
                                    <li>
                                        <button class="btn-piccolo-numero ${programma.durata == m ? 'active' : ''}" onclick="selezionaDurata(this, ${programma.id}, '${m}')">
                                            ${m}
                                        </button>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <div class="sezione-modifica-opzioni" style="margin-bottom: 20px;">
                            <label class="sezione-titolo-label">Obiettivo</label>
                            <div class="griglia-obiettivi">
                                <div class="card-opzione ${programma.obiettivo === 'Costruire muscoli' ? 'active' : ''}" onclick="selezionaObiettivo(this, ${programma.id}, 'Costruire muscoli')">
                                    <i class="fa-solid fa-dumbbell"></i>
                                    <span>Costruire muscoli</span>
                                </div>
                                <div class="card-opzione ${programma.obiettivo === 'Diventa più forte' ? 'active' : ''}" onclick="selezionaObiettivo(this, ${programma.id}, 'Diventa più forte')">
                                    <i class="fa-solid fa-hand-fist"></i>
                                    <span>Diventa più forte</span>
                                </div>
                                <div class="card-opzione ${programma.obiettivo === 'Definizione' ? 'active' : ''}" onclick="selezionaObiettivo(this, ${programma.id}, 'Definizione')">
                                    <i class="fa-brands fa-apple"></i>
                                    <span>Definizione</span>
                                </div>
                                <div class="card-opzione ${programma.obiettivo === 'Fondamenti' ? 'active' : ''}" onclick="selezionaObiettivo(this, ${programma.id}, 'Fondamenti')">
                                    <i class="fa-solid fa-graduation-cap"></i>
                                    <span>Fondamenti</span>
                                </div>
                                <div class="card-opzione ${programma.obiettivo === 'Condizionamento' ? 'active' : ''}" onclick="selezionaObiettivo(this, ${programma.id}, 'Condizionamento')">
                                    <i class="fa-solid fa-person-running"></i>
                                    <span>Condizionamento</span>
                                </div>
                                <div class="card-opzione ${programma.obiettivo === 'Sport' ? 'active' : ''}" onclick="selezionaObiettivo(this, ${programma.id}, 'Sport')">
                                    <i class="fa-solid fa-futbol"></i>
                                    <span>Sport</span>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div class="visualizza-top-icona-box">
                            <i class="fa-solid fa-receipt visualizza-icona-top"></i>
                        </div>

                        <div class="trigger-vedi-piu" id="trigger-espandi" onclick="espandiDettagli()">
                            <span>VEDI DI PIÙ</span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>

                        <div id="div-dettagli-espandibili" style="display: none;">
                            <div class="griglia-info-2x2">
                                <div class="item-info-espanso">
                                    <div class="titolo-info-espanso"><i class="fa-solid fa-bolt"></i> Livello</div>
                                    <div class="valore-info-espanso">${livelloValore}</div>
                                </div>
                                <div class="item-info-espanso">
                                    <div class="titolo-info-espanso"><i class="fa-solid fa-bullseye"></i> Obiettivo Principale</div>
                                    <div class="valore-info-espanso">${obiettivoValore}</div>
                                </div>
                            </div>
                            <hr class="hr-espansione">
                            <div class="griglia-info-2x2">
                                <div class="item-info-espanso">
                                    <div class="titolo-info-espanso"><i class="fa-regular fa-calendar"></i> Giorni x settimana</div>
                                    <div class="valore-info-espanso">${giorniValore}</div>
                                </div>
                                <div class="item-info-espanso">
                                    <div class="titolo-info-espanso"><i class="fa-solid fa-hourglass-start"></i> Durata</div>
                                    <div class="valore-info-espanso">${durataValore}</div>
                                </div>
                            </div>
                            <hr class="hr-espansione">
                            <div class="blocco-descrizione-espanso">
                                <div class="titolo-info-espanso">Descrizione</div>
                                <div class="valore-info-espanso">${descrizioneValore !== "" ? descrizioneValore : "Non specificata"}</div>
                            </div>

                            <div class="trigger-vedi-meno" id="trigger-riduci" onclick="riduciDettagli()">
                                <span>VEDI MENO</span>
                                <i class="fa-solid fa-chevron-up"></i>
                            </div>
                        </div>

                        <div class="visualizza-header-blocco">
                            <div id="visualizza-dettaglio-nome">${programma.nome}</div>
                        </div>
                        <div id="visualizza-dettaglio-desc">${descrizioneValore !== "" ? descrizioneValore : ""}</div>

                        <button id="btn-aggiungi-routine" onclick="apriPopupRoutine(${programma.id})">
                            <i class="fa-solid fa-plus"></i>
                            <span>Aggiungi routine di allenamento<br>al programma</span>
                        </button>

                        <ul id="lista-routine"></ul>

                        <div class="spaziatore-fine-visualizza"></div>
                    `}
                </div>
            </div>

            ${inModalitaModifica ? `
                <div class="contenitore-salva-sticky">
                    <button id="btn-salva-dettaglio" onclick="renderProgrammi(); apriDettaglioProgramma(${programma.id}, false)">Salva</button>
                </div>
            ` : ''}
        </div>
    `;

    overlay.style.display = "flex";

    if (!inModalitaModifica) {
        renderRoutine(programma.id);
    }
}

function espandiDettagli() {
    document.getElementById("div-dettagli-espandibili").style.display = "block";
    document.getElementById("trigger-espandi").style.display = "none";
    document.getElementById("visualizza-dettaglio-nome").style.marginRight = '38%';
}

function riduciDettagli() {
    document.getElementById("div-dettagli-espandibili").style.display = "none";
    document.getElementById("trigger-espandi").style.display = "flex";
    document.getElementById("visualizza-dettaglio-nome").style.marginRight = '40%';

}


function selezionaLivello(elemento, id, valore) {
    const p = programmi.find(x => x.id === id);
    if (!p) return;
    p.livello = valore;

    const contenitore = elemento.closest('.griglia-livelli');
    contenitore.querySelectorAll('.card-opzione').forEach(el => el.classList.remove('active'));
    elemento.classList.add('active');

    salvaProgrammiSuLocalStorage();
}

function selezionaGiorni(elemento, id, valore) {
    const p = programmi.find(x => x.id === id);
    if (!p) return;
    p.giorni = valore;

    const contenitore = elemento.closest('#gruppo-giorni');
    contenitore.querySelectorAll('.btn-piccolo-numero').forEach(el => el.classList.remove('active'));
    elemento.classList.add('active');

    salvaProgrammiSuLocalStorage();
}

function selezionaDurata(elemento, id, valore) {
    const p = programmi.find(x => x.id === id);
    if (!p) return;
    p.durata = valore;

    const contenitore = elemento.closest('#gruppo-durata');
    contenitore.querySelectorAll('.btn-piccolo-numero').forEach(el => el.classList.remove('active'));
    elemento.classList.add('active');

    salvaProgrammiSuLocalStorage();
}

function selezionaObiettivo(elemento, id, valore) {
    const p = programmi.find(x => x.id === id);
    if (!p) return;
    p.obiettivo = valore;

    const contenitore = elemento.closest('.griglia-obiettivi');
    contenitore.querySelectorAll('.card-opzione').forEach(el => el.classList.remove('active'));
    elemento.classList.add('active');

    salvaProgrammiSuLocalStorage();
}

function toggleDettagliEspandibili() {
    const divInfo = document.getElementById("div-dettagli-espandibili");
    const testo = document.getElementById("testo-trigger-espandi");
    const icona = document.getElementById("icona-trigger-espandi");

    if (!divInfo) return;

    if (divInfo.style.display === "block") {
        divInfo.style.display = "none";
        testo.textContent = "VEDI DI PIÙ";
        icona.className = "fa-solid fa-chevron-down";
    } else {
        divInfo.style.display = "block";
        testo.textContent = "VEDI MENO";
        icona.className = "fa-solid fa-chevron-up";
    }
}

function chiudiDettaglioProgramma() {
    const overlay = document.getElementById("popup-dettaglio-programma");
    if (overlay) overlay.style.display = "none";
}

function togglePopupSettings(event) {
    event.stopPropagation();
    const menu = document.getElementById("popup-settings-dropdown");
    if (menu) {
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    }
}

function toggleRoutineMenu(event, btn) {
    event.stopPropagation();
    const dropdown = btn.nextElementSibling;
    const aperto = dropdown.style.display === "block";

    document.querySelectorAll(".routine-menu-dropdown").forEach(d => d.style.display = "none");

    dropdown.style.display = aperto ? "none" : "block";
}

document.addEventListener("click", () => {
    const menu = document.getElementById("popup-settings-dropdown");
    if (menu) menu.style.display = "none";

    document.querySelectorAll(".routine-menu-dropdown").forEach(d => d.style.display = "none");
});

function aggiornaNomeProgramma(id, nuovoNome) {
    const programma = programmi.find(p => p.id === id);
    if (programma) {
        programma.nome = nuovoNome.trim() !== "" ? nuovoNome : `Il Mio Programma #${id}`;
        renderProgrammi();
        salvaProgrammiSuLocalStorage();
    }
}

function aggiornaDescrizioneProgramma(id, nuovaDesc) {
    const programma = programmi.find(p => p.id === id);
    if (programma) {
        programma.descrizione = nuovaDesc;
        salvaProgrammiSuLocalStorage();
    }
}

function openProgress() {
    setScenario("progress-container");
    scenario_selezionato = "progress";
    openPanoramica();
}

function changePic() {
    let emailSalvata = sessionStorage.getItem("email") || "";
    if (emailSalvata === "") return;

    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg';
    input.onchange = function (e) {
        let file = e.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (event) {
                let base64Image = event.target.result;
                localStorage.setItem("pic_" + emailSalvata, base64Image);
                document.querySelectorAll("#profile-pic").forEach(img => {
                    img.src = base64Image;
                });
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function openInsta() {
    let username = document.getElementById("profile-instagram").value.trim();

    if (username !== "") {
        if (username.startsWith("@")) {
            username = username.substring(1);
        }
        let url = "https://www.instagram.com/" + username;
        window.open(url, '_blank');
    } else {
        alert("Inserisci prima un username di Instagram!");
    }
}

function openSpotify() {
    let url = "https://open.spotify.com/intl-it/";
    window.open(url, '_blank');
}

function resetInfo() {
    let timer = '0:00:00';
    let volume = 0;
    let set = 0;

    document.getElementById("duration-value").textContent = timer;
    document.getElementById("volume-value").innerText = volume + 'kg';
    document.getElementById("set-value").innerText = set;
}

function endWorkout() {
    const totaleSet = document.querySelectorAll(".es-set-row").length;

    if (totaleSet === 0) {
        popupApertoWorkout = true;
        mostraPopupNessunEsercizio();
        return;
    }

    const totaleCompletati = document.querySelectorAll(".es-set-row.es-set-done").length;

    if (totaleCompletati === 0) {
        popupApertoWorkout = true;
        mostraPopupNessunSetCompletato();
        return;
    }

    if (totaleCompletati < totaleSet) {
        popupApertoWorkout = true;
        mostraPopupTermina();
        return;
    }

    terminaComunque();
}

function mostraPopupNessunSetCompletato() {
    let overlay = document.getElementById("popup-nessun-set");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "popup-nessun-set";
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div id="popup-nessun-set-box">
            <h3>Si prega di contrassegnare almeno un set come completato per terminare l'allenamento.</h3>
            <div id="popup-nessun-set-btns">
                <button id="btn-capito-nessun-set" onclick="chiudiPopupNessunSet()">Capito</button>
            </div>
        </div>
    `;

    overlay.style.display = "flex";
}

function chiudiPopupNessunSet() {
    const overlay = document.getElementById("popup-nessun-set");
    if (overlay) overlay.style.display = "none";
    popupApertoWorkout = false;
    setScenario("workout-container");
    scenario_selezionato = "workout";
}

function mostraPopupNessunEsercizio() {
    let overlay = document.getElementById("popup-nessun-es");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "popup-nessun-es";
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div id="popup-nessun-es-box">
            <h3>Si prega di aggiungere alcuni esercizi prima di terminare l'allenamento.</h3>
            <div id="popup-nessun-es-btns">
                <button id="btn-elimina-allenamento" onclick="eliminaAllenamento()">Elimina Allenamento</button>
                <button id="btn-riprendi-nessun-es" onclick="chiudiPopupNessunEs()">Riprendi allenamento</button>
            </div>
        </div>
    `;

    overlay.style.display = "flex";
}

function chiudiPopupNessunEs() {
    const overlay = document.getElementById("popup-nessun-es");
    if (overlay) overlay.style.display = "none";
    popupApertoWorkout = false;
    setScenario("workout-container");
    scenario_selezionato = "workout";
}

function eliminaAllenamento() {
    chiudiPopupNessunEs();
    workout = false;

    if (timerInterval) clearInterval(timerInterval);
    if (uiInterval) clearInterval(uiInterval);

    resetInfo();
    document.getElementById("list-es-workout").innerHTML = "";

    const btnEnd = document.getElementById("btnEnd");
    if (btnEnd) {
        btnEnd.style.backgroundColor = "rgba(0, 94, 255, 0.603)";
        btnEnd.style.opacity = "1";
        btnEnd.style.color = "#fff";
    }

    const btnStart = document.getElementById("btnStart");
    if (btnStart) btnStart.style.display = "block";

    setScenario("startworkout-container");
    scenario_selezionato = "start_workout";
}

function mostraPopupTermina() {
    popupApertoWorkout = true;
    const esIncompleti = [];
    document.querySelectorAll(".es-item").forEach(item => {
        const nome = item.querySelector(".es-nome").textContent;
        const righe = item.querySelectorAll(".es-set-row");
        const completate = item.querySelectorAll(".es-set-row.es-set-done");
        if (completate.length < righe.length) {
            esIncompleti.push(`• ${nome} (${completate.length}/${righe.length} set)`);
        }
    });

    let overlay = document.getElementById("popup-termina");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "popup-termina";
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div id="popup-termina-box">
            <h3>Non hai completato tutti i set per:</h3>
            <ul id="popup-es-list">
                ${esIncompleti.map(e => `<li>${e}</li>`).join("")}
            </ul>
            <div id="popup-termina-btns">
                <button id="btn-termina-comunque" onclick="terminaComunque()">Termina comunque</button>
                <button id="btn-riprendi" onclick="chiudiPopupTermina()">Riprendi allenamento</button>
            </div>
        </div>
    `;

    overlay.style.display = "flex";
}

function chiudiPopupTermina() {
    const overlay = document.getElementById("popup-termina");
    if (overlay) overlay.style.display = "none";
    popupApertoWorkout = false;
    setScenario("workout-container");
    scenario_selezionato = "workout";
}

function durataInSecondi(str) {
    const parti = str.split(":");
    if (parti.length !== 3) return 0;
    const h = parseInt(parti[0]) || 0;
    const m = parseInt(parti[1]) || 0;
    const s = parseInt(parti[2]) || 0;
    return h * 3600 + m * 60 + s;
}

function terminaComunque() {
    popupApertoWorkout = false;
    chiudiPopupTermina();
    workout = false;

    const emailSalvata = sessionStorage.getItem("email") || "";
    const durataCorrente = document.getElementById("duration-value").textContent;
    const volumeCorrente = parseFloat(document.getElementById("volume-value").innerText) || 0;
    const setCorrenti = document.getElementById("set-value").innerText;

    if (sessionStorage.getItem("id_workout") == null) {
        sessionStorage.setItem("id_workout", 1);
    }
    const currentId = sessionStorage.getItem("id_workout");

    const esItems = document.querySelectorAll(".es-item");
    const esDettaglio = [];
    esItems.forEach(item => {
        const nome = item.querySelector(".es-nome").textContent;
        const sets = [];
        item.querySelectorAll(".es-set-row").forEach(riga => {
            const kg = parseFloat(riga.querySelector(".es-set-kg").value) || 0;
            const reps = parseFloat(riga.querySelector(".es-set-reps").value) || 0;
            const completato = riga.classList.contains("es-set-done");
            sets.push({ kg, reps, completato });
        });
        esDettaglio.push({ nome, sets });
    });

    const workoutCompleto = {
        id: currentId,
        data: new Date().toLocaleDateString("it-IT"),
        durata: durataCorrente,
        volume: volumeCorrente,
        set: setCorrenti,
        esercizi: esDettaglio
    };

    const storicoKey = "storico_workout_" + emailSalvata;
    const storico = JSON.parse(localStorage.getItem(storicoKey) || "[]");
    storico.push(workoutCompleto);
    localStorage.setItem(storicoKey, JSON.stringify(storico));

    const secondiCorrente = durataInSecondi(durataCorrente);
    if (secondiCorrente > 0) {
        let secondiTotali = parseInt(localStorage.getItem("durata_totale_" + emailSalvata)) || 0;
        secondiTotali += secondiCorrente;
        localStorage.setItem("durata_totale_" + emailSalvata, secondiTotali);
    }

    if (volumeCorrente > 0) {
        let volumeTotale = parseFloat(localStorage.getItem("volume_totale_" + emailSalvata)) || 0;
        volumeTotale += volumeCorrente;
        localStorage.setItem("volume_totale_" + emailSalvata, volumeTotale);
    }

    const datiWorkout = `set:${setCorrenti}_duration:${durataCorrente}_volume:${volumeCorrente}`;
    sessionStorage.setItem(emailSalvata + "_workout_" + currentId, datiWorkout);
    localStorage.setItem("workouts_" + emailSalvata, currentId);
    sessionStorage.setItem("id_workout", parseInt(currentId) + 1);

    if (timerInterval) clearInterval(timerInterval);
    if (uiInterval) clearInterval(uiInterval);

    resetInfo();
    document.getElementById("list-es-workout").innerHTML = "";

    const btnEnd = document.getElementById("btnEnd");
    if (btnEnd) {
        btnEnd.style.backgroundColor = "rgba(0, 94, 255, 0.603)";
        btnEnd.style.opacity = "1";
        btnEnd.style.color = "#fff";
    }

    const btnStart = document.getElementById("btnStart");
    if (btnStart) btnStart.style.display = "block";

    setScenario("startworkout-container");
    scenario_selezionato = "start_workout";
}

function startWorkout() {
    if (workout === false) {
        setScenario("workout-container");
        scenario_selezionato = "workout";
        workout = true;
        document.getElementById("btnStart").style.display = 'none';

        let sec = 0;
        let min = 0;
        let h = 0;
        document.getElementById("duration-value").textContent = '0:00:00';

        timerInterval = setInterval(() => {
            sec++;
            if (sec >= 60) {
                sec = 0;
                min++;
            }
            if (min >= 60) {
                min = 0;
                h++;
            }

            let formattedH = String(h).padStart(1, '0');
            let formattedM = String(min).padStart(2, '0');
            let formattedS = String(sec).padStart(2, '0');

            document.getElementById("duration-value").textContent = `${formattedH}:${formattedM}:${formattedS}`;
        }, 1000);

        let volume = 0;
        let set = 0;

        uiInterval = setInterval(() => {
            if (scenario_selezionato !== "workout" && !popupApertoWorkout) {
                popupApertoWorkout = true;
                const totaleSet = document.querySelectorAll(".es-set-row").length;
                const totaleCompletati = document.querySelectorAll(".es-set-row.es-set-done").length;

                if (totaleSet === 0) {
                    mostraPopupNessunEsercizio();
                } else if (totaleCompletati === 0) {
                    mostraPopupNessunSetCompletato();
                } else {
                    mostraPopupTermina();
                }
            }
        }, 200);

    } else {
        setScenario("startworkout-container");
        scenario_selezionato = "start_workout";
    }
}

let show_combo_es = false;

function calcolaMassimale(kg, reps) {
    if (reps === 1) return kg;
    return Math.round(kg * (1 + reps / 30));
}

function controllaMassimale(nomeEsercizio, kg, reps) {
    if (kg <= 0 || reps <= 0) return;

    const emailSalvata = sessionStorage.getItem("email") || "";
    const chiaveMassimali = "massimali_" + emailSalvata;
    const massimali = JSON.parse(localStorage.getItem(chiaveMassimali) || "{}");

    const nuovoMax = calcolaMassimale(kg, reps);
    const vecchioMax = massimali[nomeEsercizio] || 0;

    if (nuovoMax > vecchioMax) {
        massimali[nomeEsercizio] = nuovoMax;
        localStorage.setItem(chiaveMassimali, JSON.stringify(massimali));
        mostraNotificaMassimale(nomeEsercizio, nuovoMax, vecchioMax);
        aggiornaObiettivoRecord(nomeEsercizio);
    }
}

function mostraNotificaMassimale(nome, nuovo, vecchio) {
    let notifica = document.getElementById("notifica-massimale");
    if (!notifica) {
        notifica = document.createElement("div");
        notifica.id = "notifica-massimale";
        document.body.appendChild(notifica);
    }

    const testo = vecchio === 0
        ? `Primo massimale su ${nome}: ${nuovo}kg!`
        : `Nuovo massimale su ${nome}: ${nuovo}kg (prima: ${vecchio}kg)!`;

    notifica.innerHTML = `
        <i class="fa-solid fa-trophy"></i>
        <span>${testo}</span>
    `;

    notifica.classList.add("show");
    clearTimeout(notifica._timeout);
    notifica._timeout = setTimeout(() => {
        notifica.classList.remove("show");
    }, 4000);
}

function aggiornaObiettivoRecord(nomeEsercizio) {
    set_goals.forEach((g, i) => {
        if (g.nome === "Record su" && g.valore === nomeEsercizio) {
            set_goals[i].completato = true;
        }
    });
    renderGoals();
}

let selezionatiEs = new Set();

function addEs() {
    const container = document.getElementById("comboEs");
    const btn = document.getElementById("btnAddEs");

    if (!show_combo_es) {
        selezionatiEs = new Set();
        inizializzaPicker(container, selezionatiEs, () => {
            const n = selezionatiEs.size;
            btn.textContent = n > 0 ? `Aggiungi ${n} esercizi${n === 1 ? "o" : ""}` : "Aggiungi esercizio";
        });

        container.style.display = "block";
        btn.textContent = "Aggiungi esercizio";
        show_combo_es = true;

    } else {
        selezionatiEs.forEach(nome => aggiungiEsercizioAllaLista(nome));

        container.style.display = "none";
        container.innerHTML = "";
        selezionatiEs.clear();
        btn.textContent = "Aggiungi Esercizi";
        show_combo_es = false;
    }
}

function aggiungiEsercizioAllaLista(nome) {
    const lista = document.getElementById("list-es-workout");

    const esistente = Array.from(lista.querySelectorAll(".es-nome")).find(el => el.textContent === nome);
    if (esistente) return;

    const li = document.createElement("li");
    li.className = "es-item";
    li.dataset.expanded = "false";

    li.innerHTML = `
    <div class="es-header" onclick="toggleEs(this)">
        <span class="es-nome">${nome}</span>
        <div class="es-header-right">
            <button class="es-remove" onclick="event.stopPropagation(); this.closest('li').remove(); calcolaVolumeTotale(); aggiornaSetsCompletati()">×</button>
        </div>
    </div>
    <div class="es-summary"></div>
    <div class="es-body" style="display:none;">
        <input type="text" class="es-note" placeholder="Note...">
        <div class="es-table-header">
            <span>Set</span>
            <span><i class="fa-solid fa-dumbbell es-dumbbell-icon"></i> Kg</span>
            <span>Reps</span>
            <span></span>
        </div>
        <ul class="es-set-list">
            ${[1, 2, 3].map(n => creaRigaSet(n)).join("")}
        </ul>
        <button class="es-add-set" onclick="aggiungiSet(this)">+ Aggiungi Serie</button>
    </div>
`;
    lista.appendChild(li);
    aggiornaSummary(li);
    abilitaDragReorder(li, lista, null);

    li.querySelector(".es-note").addEventListener("input", () => {
        aggiornaSummary(li);
    });

    li.querySelectorAll(".es-set-kg, .es-set-reps").forEach(input => {
        input.addEventListener("input", () => {
            aggiornaSummary(li);
            calcolaVolumeTotale();
        });
    });
}

function creaRigaSet(n) {
    return `
        <li class="es-set-row">
            <span class="es-set-num">${n}</span>
            <input type="number" class="es-set-kg" placeholder="-" min="0">
            <input type="number" class="es-set-reps" placeholder="-" min="0">
            <button class="es-set-check" onclick="toggleCheck(this)"><i class="fa-solid fa-check"></i></button>
            <button class="es-set-remove" onclick="rimuoviSet(this)"><i class="fa-solid fa-trash"></i></button>
        </li>
    `;
}

function abilitaDragReorder(item, lista, onReorder) {
    const handle = item.querySelector(".drag-handle");
    if (!handle) return;

    handle.addEventListener("click", (e) => e.stopPropagation());
    handle.addEventListener("mousedown", () => { item.draggable = true; });
    handle.addEventListener("mouseup", () => { item.draggable = false; });

    item.addEventListener("dragstart", (e) => {
        item.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "");
    });

    item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        item.draggable = false;
        lista.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
        if (onReorder) onReorder();
    });

    item.addEventListener("dragover", (e) => {
        e.preventDefault();
        const dragging = lista.querySelector(".dragging");
        if (!dragging || dragging === item) return;

        const rect = item.getBoundingClientRect();
        const dopo = (e.clientY - rect.top) / rect.height > 0.5;

        item.classList.add("drag-over");
        dopo ? item.after(dragging) : item.before(dragging);
    });

    item.addEventListener("dragleave", () => item.classList.remove("drag-over"));
}

function rimuoviSet(btn) {
    const riga = btn.closest(".es-set-row");
    const lista = riga.closest(".es-set-list");
    const esItem = riga.closest(".es-item");

    riga.remove();

    rinumerizzaSet(lista);
    aggiornaSummary(esItem);
    calcolaVolumeTotale();
    aggiornaSetsCompletati();
}

function rinumerizzaSet(lista) {
    lista.querySelectorAll(".es-set-row").forEach((riga, i) => {
        riga.querySelector(".es-set-num").textContent = i + 1;
    });
}

function toggleEs(header) {
    const li = header.closest("li");
    const body = li.querySelector(".es-body");
    const summary = li.querySelector(".es-summary");
    const expanded = li.dataset.expanded === "true";

    li.dataset.expanded = !expanded;

    if (expanded) {
        body.style.display = "none";
        aggiornaSummary(li);
    } else {
        summary.style.display = "none";
        body.style.display = "block";
    }
}

function aggiungiSet(btn) {
    const lista = btn.previousElementSibling;
    const n = lista.querySelectorAll(".es-set-row").length + 1;
    const li = document.createElement("li");
    li.className = "es-set-row";
    li.innerHTML = `
        <span class="es-set-num">${n}</span>
        <input type="number" class="es-set-kg" placeholder="-" min="0">
        <input type="number" class="es-set-reps" placeholder="-" min="0">
        <button class="es-set-check" onclick="toggleCheck(this)">✓</button>
        <button class="es-set-remove" onclick="rimuoviSet(this)"><i class="fa-solid fa-trash"></i></button>
    `;

    lista.appendChild(li);

    const esItem = btn.closest(".es-item");
    li.querySelectorAll(".es-set-kg, .es-set-reps").forEach(input => {
        input.addEventListener("input", () => {
            aggiornaSummary(esItem);
            calcolaVolumeTotale();
        });
    });
    aggiornaSummary(esItem);
}

function aggiornaSummary(li) {
    const righe = li.querySelectorAll(".es-set-row");
    const summary = li.querySelector(".es-summary");

    if (li.dataset.expanded === "true") return;

    const nota = li.querySelector(".es-note").value.trim();

    let html = "";

    if (nota) {
        html += `<span class="es-summary-nota">${nota}</span>`;
    }

    righe.forEach((riga, i) => {
        const kg = riga.querySelector(".es-set-kg").value.trim();
        const reps = riga.querySelector(".es-set-reps").value.trim();
        const completato = riga.classList.contains("es-set-done");

        let contenuto = "";

        if (kg && reps) {
            contenuto = `
                <span class="es-summary-kg">${kg}kg</span>
                <span class="es-summary-x">×</span>
                <span class="es-summary-reps">${reps} rip</span>
            `;
        } else if (kg && !reps) {
            contenuto = `<span class="es-summary-kg">${kg}kg</span>`;
        } else if (!kg && reps) {
            contenuto = `<span class="es-summary-reps">${reps} rip</span>`;
        } else {
            contenuto = `<span class="es-summary-reps">- reps</span>`;
        }

        html += `
            <div class="es-summary-row">
                <span class="es-summary-num">${i + 1}</span>
                ${contenuto}
            </div>
        `;
    });

    summary.innerHTML = html;
    summary.style.display = "block";
}

function calcolaVolumeTotale() {
    let totale = 0;
    document.querySelectorAll(".es-set-row.es-set-done").forEach(riga => {
        const kg = parseFloat(riga.querySelector(".es-set-kg").value) || 0;
        const reps = parseFloat(riga.querySelector(".es-set-reps").value) || 0;
        totale += kg * reps;
    });

    const volumeEl = document.getElementById("volume-value");
    if (volumeEl) volumeEl.innerText = totale + "kg";
}

function aggiornaSetsCompletati() {
    const totale = document.querySelectorAll(".es-set-row.es-set-done").length;
    const totaleSet = document.querySelectorAll(".es-set-row").length;
    const setEl = document.getElementById("set-value");
    if (setEl) setEl.innerText = totale;

    const btnEnd = document.getElementById("btnEnd");
    if (!btnEnd) return;

    if (totaleSet === 0) {
        btnEnd.style.backgroundColor = "rgba(0, 94, 255, 0.603)";
        btnEnd.style.opacity = "1";
    } else if (totale === totaleSet) {
        btnEnd.style.backgroundColor = "#36eb09";
        btnEnd.style.color = "#fff";
        btnEnd.style.opacity = "1";
    } else if (totale > 0) {
        btnEnd.style.backgroundColor = "rgba(0, 94, 255, 0.603)";
        btnEnd.style.color = "#fff";
        btnEnd.style.opacity = "0.5";
    } else {
        btnEnd.style.backgroundColor = "rgba(0, 94, 255, 0.603)";
        btnEnd.style.color = "#fff";
        btnEnd.style.opacity = "1";
    }
}

function toggleCheck(btn) {
    const row = btn.closest(".es-set-row");
    row.classList.toggle("es-set-done");

    if (row.classList.contains("es-set-done")) {
        const kg = parseFloat(row.querySelector(".es-set-kg").value) || 0;
        const reps = parseFloat(row.querySelector(".es-set-reps").value) || 0;
        const nomeEsercizio = row.closest(".es-item").querySelector(".es-nome").textContent;
        controllaMassimale(nomeEsercizio, kg, reps);
    }

    calcolaVolumeTotale();
    aggiornaSetsCompletati();
}

let voci_progress = ["Panoramica", "Misure", "Foto"];
let voce_progress_selezionata = voci_progress[0];

function openPanoramica() {
    voce_progress_selezionata = voci_progress[0];
    muoviProgressSelezionato();
    aggiornaDatiPanoramica();
}

let voci_workout = ["Allenati ora", "Biblioteca"];
let voce_workout_selezionata = voci_workout[0];

function openWorkoutNow() {
    voce_workout_selezionata = voci_workout[0];
    muoviWorkoutSelezionato();
}

function openLibrary() {
    voce_workout_selezionata = voci_workout[1];
    muoviWorkoutSelezionato();
}

function muoviWorkoutSelezionato() {
    let lineaDinamica = document.getElementById("separa-info-workout-dinamico");
    let divLibrary = document.getElementById("workouts-library");
    let divAllentiOra = document.getElementById("workout-now");
    let btnStart = document.getElementById("btnStart");

    btnStart.style.transition = "none";
    btnStart.value = "";

    if (!lineaDinamica || !divLibrary || !divAllentiOra) return;

    if (voce_workout_selezionata === "Allenati ora") {
        btnStart.style.marginTop = "35%";
        btnStart.style.marginLeft = "85%";
        lineaDinamica.style.width = '5%';
        lineaDinamica.style.marginLeft = '13.7%';

        divAllentiOra.style.display = "block";
        divLibrary.style.display = "none";
    }
    else if (voce_workout_selezionata == "Biblioteca") {
        btnStart.style.marginTop = "35%";
        btnStart.style.marginLeft = "85%";
        lineaDinamica.style.width = '5%';
        lineaDinamica.style.marginLeft = '19.6%';

        divAllentiOra.style.display = "none";
        divLibrary.style.display = "block";
    }

    btnStart.style.display = "block";
    btnStart.focus();
}

function openMisure() {
    voce_progress_selezionata = voci_progress[1];
    muoviProgressSelezionato();
    loadMisure();
}

function openFoto() {
    voce_progress_selezionata = voci_progress[2];
    muoviProgressSelezionato();
    renderFoto();
}

function riempiComboGoals() {
    let num_goals = 4;
    let goals = [
        "Allenamenti a settimana",
        "Sollevamento settimanale di",
        "Record su",
        "Raggiungere peso di"
    ];

    let s = "";
    for (let i = 0; i < num_goals; i++) {
        s += '<option id="goal_' + i + '">' + goals[i] + '</option>';
    }
    document.getElementById("comboGoals").innerHTML = s;

    document.getElementById("comboGoals").addEventListener("change", aggiornaValoriGoal);

    aggiornaValoriGoal();
}

function aggiornaValoriGoal() {
    let goalSelezionato = document.getElementById("comboGoals").value;
    let comboValori = document.getElementById("comboValueGoals");
    let contenuto = "";

    if (goalSelezionato === "Allenamenti a settimana") {
        for (let j = 1; j <= 7; j++) {
            contenuto += '<option id="value_goal_' + j + '">' + j + '</option>';
        }

    } else if (goalSelezionato === "Sollevamento settimanale di") {
        for (let kg = 500; kg <= 10000; kg += 500) {
            contenuto += '<option id="value_goal_' + kg + '">' + kg + ' kg</option>';
        }

    } else if (goalSelezionato === "Record su") {
        for (let k = 0; k < esercizi.length; k++) {
            contenuto += '<option id="es_' + k + '">' + esercizi[k] + '</option>';
        }

    } else if (goalSelezionato === "Raggiungere peso di") {
        for (let peso = 50; peso <= 120; peso++) {
            contenuto += '<option id="value_goal_' + peso + '">' + peso + ' kg</option>';
        }
    }

    comboValori.innerHTML = contenuto;
}

let show_goals = false;
let set_goals = [];
const MAX_GOALS = 3;

function renderGoals() {
    const lista = document.getElementById("goal-list");
    const counter = document.getElementById("goal-count");
    const btnSet = document.getElementById("btnSetGoal");

    if (!lista) return;

    lista.innerHTML = "";

    const emailSalvata = sessionStorage.getItem("email") || "";

    set_goals.forEach((g, i) => {
        const { percentuale, corrente, target } = calcolaProgresso(g, emailSalvata);

        const li = document.createElement("li");
        li.innerHTML = `
            <div class="goal-item-content">
                <div class="goal-circle-wrap">
                    ${cerchioSVG(percentuale)}
                </div>
                <div class="goal-text">
                    <span class="goal-nome">${g.nome}: ${g.valore}</span>
                    <span class="goal-valore">${corrente} / ${target}</span>
                </div>
                <button class="goal-remove" onclick="removeGoal(${i})">×</button>
            </div>
        `;
        lista.appendChild(li);
    });

    if (counter) counter.textContent = set_goals.length + " / " + MAX_GOALS + " obiettivi impostati";
    if (btnSet) btnSet.disabled = set_goals.length >= MAX_GOALS;
}

function calcolaProgresso(g, email) {
    let corrente = 0;
    let target = 1;

    if (g.nome === "Raggiungere peso di") {
        const pesoSalvato = localStorage.getItem("peso_" + email) || "0kg";
        corrente = parseFloat(pesoSalvato) || 0;
        target = parseFloat(g.valore) || 1;

    } else if (g.nome === "Allenamenti a settimana") {
        const totale = parseInt(localStorage.getItem("workouts_" + email)) || 0;
        target = parseInt(g.valore) || 1;
        corrente = Math.min(totale % 7, target);

    } else if (g.nome === "Sollevamento settimanale di") {
        const ultimoId = parseInt(sessionStorage.getItem("id_workout")) - 1;
        if (ultimoId > 0) {
            const dati = sessionStorage.getItem(email + "_workout_" + ultimoId) || "";
            const match = dati.match(/volume:([\d.]+)/);
            corrente = match ? parseFloat(match[1]) : 0;
        }
        target = parseFloat(g.valore) || 1;

    } else if (g.nome === "Record su") {
        const emailSalvata = sessionStorage.getItem("email") || "";
        const massimali = JSON.parse(localStorage.getItem("massimali_" + emailSalvata) || "{}");
        corrente = massimali[g.valore] ? 1 : 0;
        target = 1;
    }

    const percentuale = Math.min(Math.round((corrente / target) * 100), 100);
    return { percentuale, corrente, target };
}

function cerchioSVG(pct) {
    const r = 22;
    const cx = 28;
    const cy = 28;
    const circonferenza = 2 * Math.PI * r;
    const offset = circonferenza - (pct / 100) * circonferenza;

    const colore = pct >= 100 ? "#43a047" : pct >= 50 ? "#4285f4" : "#e53935";

    return `
        <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e0e0e0" stroke-width="5"/>
            <circle
                cx="${cx}" cy="${cy}" r="${r}"
                fill="none"
                stroke="${colore}"
                stroke-width="5"
                stroke-dasharray="${circonferenza}"
                stroke-dashoffset="${offset}"
                stroke-linecap="round"
                transform="rotate(-90 ${cx} ${cy})"
                style="transition: stroke-dashoffset 0.8s ease;"
            />
            <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="11" font-weight="bold" fill="${colore}">${pct}%</text>
        </svg>
    `;
}

function removeGoal(index) {
    set_goals.splice(index, 1);
    renderGoals();
}

function setGoal() {
    if (show_goals) {
        if (set_goals.length >= MAX_GOALS) {
            alert("Hai già raggiunto il massimo di " + MAX_GOALS + " obiettivi!");
            return;
        }

        const nome = document.getElementById("comboGoals").value;
        const valore = document.getElementById("comboValueGoals").value;

        set_goals.push({ nome, valore });

        document.getElementById("insert-goal-container").style.display = "none";
        document.getElementById("btnSetGoal").textContent = "Imposta Obiettivo";
        show_goals = false;

        renderGoals();

    } else {
        if (set_goals.length >= MAX_GOALS) {
            alert("Massimo " + MAX_GOALS + " obiettivi raggiunto. Rimuovine uno prima.");
            return;
        }

        document.getElementById("insert-goal-container").style.display = "block";
        document.getElementById("btnSetGoal").textContent = "Conferma Obiettivo";
        show_goals = true;
    }
}

function muoviProgressSelezionato() {
    let lineaDinamica = document.getElementById("separa-info-progress-dinamico");
    let divPanoramica = document.getElementById("panoramica");
    let divMisure = document.getElementById("misure");
    let divFoto = document.getElementById("foto");

    if (!lineaDinamica || !divPanoramica || !divMisure || !divFoto) return;

    if (voce_progress_selezionata === "Panoramica") {
        lineaDinamica.style.width = '6%';
        lineaDinamica.style.marginLeft = '14.3%';

        divPanoramica.style.display = "block";
        divMisure.style.display = "none";
        divFoto.style.display = "none";
    }
    else if (voce_progress_selezionata == "Misure") {
        lineaDinamica.style.width = '4%';
        lineaDinamica.style.marginLeft = '21.6%';

        divPanoramica.style.display = "none";
        divMisure.style.display = "block";
        divFoto.style.display = "none";
    }
    else if (voce_progress_selezionata == "Foto") {
        lineaDinamica.style.width = '3%';
        lineaDinamica.style.marginLeft = '27.2%';

        divPanoramica.style.display = "none";
        divMisure.style.display = "none";
        divFoto.style.display = "block";
    }
}

function insertFoto() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const oggi = new Date();
                const gg = String(oggi.getDate()).padStart(2, '0');
                const mm = String(oggi.getMonth() + 1).padStart(2, '0');
                const yyyy = oggi.getFullYear();
                const dataFormattata = `${gg}/${mm}/${yyyy}`;
                const id = oggi.getTime() + index;
                salvaFotoLocalStorage(ev.target.result, dataFormattata, id);
                renderFoto();
            };
            reader.readAsDataURL(file);
        });
    };
    input.click();
}

function salvaFotoLocalStorage(src, data, id) {
    const emailSalvata = sessionStorage.getItem("email") || "";
    const chiave = "foto_" + emailSalvata;
    const esistenti = JSON.parse(localStorage.getItem(chiave) || "[]");
    const parti = data.split("/");
    const sortTs = new Date(`${parti[2]}-${parti[1]}-${parti[0]}`).getTime();
    esistenti.push({ id, src, data, sortTs });
    localStorage.setItem(chiave, JSON.stringify(esistenti));
}

function eliminaFotoLocalStorage(id) {
    const emailSalvata = sessionStorage.getItem("email") || "";
    const chiave = "foto_" + emailSalvata;
    let esistenti = JSON.parse(localStorage.getItem(chiave) || "[]");
    esistenti = esistenti.filter(f => String(f.id) !== String(id));
    localStorage.setItem(chiave, JSON.stringify(esistenti));
}

function aggiornDataFotoLocalStorage(id, nuovaData) {
    const emailSalvata = sessionStorage.getItem("email") || "";
    const chiave = "foto_" + emailSalvata;
    let esistenti = JSON.parse(localStorage.getItem(chiave) || "[]");
    const parti = nuovaData.split("/");
    const nuovoSortTs = new Date(`${parti[2]}-${parti[1]}-${parti[0]}`).getTime();
    esistenti = esistenti.map(f => {
        if (String(f.id) === String(id)) {
            return { id: f.id, src: f.src, data: nuovaData, sortTs: nuovoSortTs };
        }
        return f;
    });
    localStorage.setItem(chiave, JSON.stringify(esistenti));
}

function renderFoto() {
    const emailSalvata = sessionStorage.getItem("email") || "";
    const chiave = "foto_" + emailSalvata;
    const foto = JSON.parse(localStorage.getItem(chiave) || "[]");
    foto.sort((a, b) => b.sortTs - a.sortTs);

    const container = document.getElementById("foto");
    const vecchiaGrid = document.querySelector(".foto-grid");
    if (vecchiaGrid) vecchiaGrid.remove();

    const grid = document.createElement("div");
    grid.className = "foto-grid";

    foto.forEach(f => {
        const item = document.createElement("div");
        item.className = "foto-item";
        item.dataset.id = f.id;
        item.dataset.src = f.src;
        item.dataset.data = f.data;

        const img = document.createElement("img");
        img.src = f.src;

        const dataLabel = document.createElement("span");
        dataLabel.className = "foto-data";
        dataLabel.textContent = f.data;

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-foto";
        removeBtn.textContent = "×";
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            eliminaFotoLocalStorage(f.id);
            renderFoto();
        };

        item.onclick = () => openLightbox(item);
        item.appendChild(img);
        item.appendChild(dataLabel);
        item.appendChild(removeBtn);
        grid.appendChild(item);
    });

    container.appendChild(grid);
}

function openLightbox(item) {
    let overlay = document.getElementById("foto-lightbox");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "foto-lightbox";
        overlay.innerHTML = `
            <div id="lightbox-box">
                <img id="lightbox-img" src="">
                <div id="lightbox-actions">
                    <span id="lightbox-data-display"></span>
                    <div id="lightbox-btns">
                        <button id="btn-edit-data">✏️ Modifica data</button>
                        <button id="btn-delete-foto">🗑️ Elimina</button>
                        <button id="btn-close-lightbox">✕ Chiudi</button>
                    </div>
                    <div id="lightbox-edit-data" style="display:none;">
                        <input type="date" id="input-nuova-data">
                        <button id="btn-salva-data">Salva</button>
                        <button id="btn-annulla-data">Annulla</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeLightbox();
        });
    }

    overlay._currentId = item.dataset.id;
    document.getElementById("lightbox-img").src = item.dataset.src;
    document.getElementById("lightbox-data-display").textContent = "📅 " + item.dataset.data;
    document.getElementById("lightbox-edit-data").style.display = "none";

    document.getElementById("btn-close-lightbox").onclick = closeLightbox;

    document.getElementById("btn-delete-foto").onclick = () => {
        eliminaFotoLocalStorage(overlay._currentId);
        closeLightbox();
        renderFoto();
    };

    document.getElementById("btn-edit-data").onclick = () => {
        document.getElementById("lightbox-edit-data").style.display = "flex";
        const parti = item.dataset.data.split("/");
        if (parti.length === 3) {
            document.getElementById("input-nuova-data").value = `${parti[2]}-${parti[1]}-${parti[0]}`;
        }
    };

    document.getElementById("btn-salva-data").onclick = () => {
        const val = document.getElementById("input-nuova-data").value;
        if (!val) return;
        const d = new Date(val + "T12:00:00");
        const gg = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const nuovaData = `${gg}/${mm}/${yyyy}`;
        aggiornDataFotoLocalStorage(overlay._currentId, nuovaData);
        document.getElementById("lightbox-data-display").textContent = "📅 " + nuovaData;
        document.getElementById("lightbox-edit-data").style.display = "none";
        closeLightbox();
        renderFoto();
    };

    document.getElementById("btn-annulla-data").onclick = () => {
        document.getElementById("lightbox-edit-data").style.display = "none";
    };

    overlay.style.display = "flex";
}

function closeLightbox() {
    const overlay = document.getElementById("foto-lightbox");
    if (overlay) overlay.style.display = "none";
}

function riempiComboMisure() {
    let s = "";
    let voci_uni = ["Metrico (cm)", "Peso (kg)", "Percentuale (%)", "Calorie (kcal)", "Altro (personalizzato)"];
    let txtUnita = document.getElementById("txtUnitàMisPers");
    let combo = document.getElementById("comboUnità");

    if (txtUnita) txtUnita.style.display = 'none';

    for (let i = 0; i < voci_uni.length; i++) {
        s += '<option>' + voci_uni[i] + '</option>';
    }

    if (combo) {
        combo.innerHTML = s;
        combo.onchange = function () {
            if (combo.value == voci_uni[4]) {
                if (txtUnita) txtUnita.style.display = 'block';
            } else {
                if (txtUnita) txtUnita.style.display = 'none';
            }
            let btnSalva = document.getElementById("btnSalvaMisPers");
            if (btnSalva) btnSalva.style.marginTop = '1px';
        };
    }
}

function loadMisure() {
    let emailSalvata = sessionStorage.getItem("email") || "";
    if (emailSalvata === "") return;

    let peso = localStorage.getItem("peso_" + emailSalvata) || "0.0kg";
    let fat = localStorage.getItem("fat_" + emailSalvata) || "0%";
    let kcal = localStorage.getItem("kcal_" + emailSalvata) || "0000kcal";

    let wEl = document.getElementById("n-weight-misure");
    let fEl = document.getElementById("n-fat-misure");
    let kEl = document.getElementById("n-kcal-misure");

    if (wEl) wEl.textContent = peso;
    if (fEl) fEl.textContent = fat;
    if (kEl) kEl.textContent = kcal;
}

function modifyValue(valore) {
    let input = document.getElementById("txtNewValue");
    let emailSalvata = sessionStorage.getItem("email") || "";

    if (emailSalvata === "" || !input) return;

    input.style.transition = "none";
    input.value = "";

    if (valore === "peso") {
        input.placeholder = "kg";
        input.style.top = "16%";
        input.style.left = "37%";
    } else if (valore === "fat") {
        input.placeholder = "%";
        input.style.top = "46%";
        input.style.left = "36%";
    } else if (valore === "kcal") {
        input.placeholder = "kcal";
        input.style.top = "75%";
        input.style.left = "37%";
    }

    input.style.display = "block";
    input.focus();

    input.onkeydown = function (event) {
        if (event.key === "Enter") {
            event.preventDefault();

            let nuovoValore = input.value.trim();
            let regexPeso = /^\d+(\.\d+)?$/;
            let regexInteri = /^[0-9]+$/;

            if (nuovoValore !== "") {
                if (valore === "peso") {
                    if (regexPeso.test(nuovoValore)) {
                        if (parseFloat(nuovoValore) > 250) {
                            alert("MAX. 250kg");
                            return;
                        }
                        localStorage.setItem("peso_" + emailSalvata, nuovoValore + "kg");
                        loadMisure();
                        input.style.display = "none";
                    } else {
                        alert("Inserisci un numero valido per il peso (es. 70 o 72.5)!");
                    }
                }
                else if (valore === "fat" || valore === "kcal") {
                    if (regexInteri.test(nuovoValore)) {
                        let valoreNumerico = parseInt(nuovoValore);

                        if (valore === "fat") {
                            if (valoreNumerico > 100) {
                                alert("MAX. 100%");
                                return;
                            }
                            localStorage.setItem("fat_" + emailSalvata, nuovoValore + "%");
                        }
                        else if (valore === "kcal") {
                            if (valoreNumerico > 10000) {
                                alert("MAX. 10000 kcal");
                                return;
                            }
                            localStorage.setItem("kcal_" + emailSalvata, nuovoValore + "kcal");
                        }

                        loadMisure();
                        input.style.display = "none";
                    } else {
                        alert("Inserisci solo numeri interi!");
                    }
                }
            } else {
                input.style.display = "none";
            }
        }
    };
}

function aggiornaDatiPanoramica() {
    const emailSalvata = sessionStorage.getItem("email") || "";
    let nWorkoutPano = document.getElementById("n-workout-pano");
    let nVolumePano = document.getElementById("n-volume-pano");
    let nDurationPano = document.getElementById("n-duration-pano");

    if (nWorkoutPano) {
        let contatore = localStorage.getItem("workouts_" + emailSalvata) || "0";
        nWorkoutPano.textContent = contatore + " allenamenti";
    }

    const volumeTotale = parseFloat(localStorage.getItem("volume_totale_" + emailSalvata)) || 0;
    if (nVolumePano) nVolumePano.textContent = volumeTotale + "kg";

    const secondiTotali = parseInt(localStorage.getItem("durata_totale_" + emailSalvata)) || 0;
    const h = Math.floor(secondiTotali / 3600);
    const m = Math.floor((secondiTotali % 3600) / 60);
    if (nDurationPano) nDurationPano.textContent = `${h}h ${m}m`;

    renderGoals();
}


function getRoutineKey(programmaId) {
    const emailSalvata = sessionStorage.getItem("email") || "default";
    return `routine_${emailSalvata}_${programmaId}`;
}

function caricaRoutine(programmaId) {
    return JSON.parse(localStorage.getItem(getRoutineKey(programmaId)) || "[]");
}

function salvaRoutine(programmaId, routine) {
    localStorage.setItem(getRoutineKey(programmaId), JSON.stringify(routine));
}

function renderRoutine(programmaId) {
    const lista = document.getElementById("lista-routine");
    if (!lista) return;

    const routine = caricaRoutine(programmaId);
    lista.innerHTML = "";

    routine.forEach(r => {
        const li = document.createElement("li");
        li.className = "routine-item";

        const nomeVisualizzato = r.titolo && r.titolo.trim() !== "" ? r.titolo : "La mia routine";
        const nEsercizi = r.esercizi ? r.esercizi.length : 0;

        li.innerHTML = `
            <div class="routine-info">
                <span class="routine-nome">${nomeVisualizzato}</span>
                <span class="routine-n-esercizi">${nEsercizi} Eserciz${nEsercizi === 1 ? "io" : "i"}</span>
            </div>
            <div class="routine-actions">
                <button class="routine-play" onclick="avviaRoutine(${programmaId}, '${r.id}')">
                    <i class="fa-solid fa-circle-play"></i>
                </button>
                <div class="routine-menu-wrap">
                    <button class="routine-menu-btn" onclick="toggleRoutineMenu(event, this)">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <div class="routine-menu-dropdown">
                        <div onclick="modificaRoutine(${programmaId}, '${r.id}')">
                            <i class="fa-solid fa-pencil"></i>
                            <span>Modifica</span>
                        </div>
                        <div onclick="rimuoviRoutine(${programmaId}, '${r.id}')">
                            <i class="fa-solid fa-trash"></i>
                            <span>Elimina</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lista.appendChild(li);
    });
}

function rimuoviRoutine(programmaId, routineId) {
    if (!confirm("Sei sicuro di voler eliminare questa routine?")) return;

    let routine = caricaRoutine(programmaId);
    routine = routine.filter(r => r.id !== routineId);
    salvaRoutine(programmaId, routine);
    aggiornaContatoreAllenamenti(programmaId, routine.length);
    renderRoutine(programmaId);
}

function modificaRoutine(programmaId, routineId) {
    modificaRoutine_chiudiMenu();
    apriPopupRoutine(programmaId, routineId);
}

function modificaRoutine_chiudiMenu() {
    document.querySelectorAll(".routine-menu-dropdown").forEach(d => d.style.display = "none");
}

function avviaRoutine(programmaId, routineId) {
    const routine = caricaRoutine(programmaId);
    const r = routine.find(x => x.id === routineId);
    if (!r) return;

    chiudiDettaglioProgramma();
    startWorkout();

    setTimeout(() => {
        const lista = document.getElementById("list-es-workout");
        if (!lista) return;
        lista.innerHTML = "";

        r.esercizi.forEach(es => {
            aggiungiEsercizioAllaLista(es.nome);

            const li = Array.from(lista.querySelectorAll(".es-item")).find(
                item => item.querySelector(".es-nome").textContent === es.nome
            );
            if (!li) return;

            li.querySelector(".es-note").value = es.note || "";

            const righe = li.querySelectorAll(".es-set-row");
            es.sets.forEach((s, i) => {
                if (!righe[i]) {
                    const addBtn = li.querySelector(".es-add-set");
                    if (addBtn) aggiungiSet(addBtn);
                }
            });

            const righeAggiornate = li.querySelectorAll(".es-set-row");
            es.sets.forEach((s, i) => {
                if (righeAggiornate[i]) {
                    righeAggiornate[i].querySelector(".es-set-kg").value = s.kg || "";
                    righeAggiornate[i].querySelector(".es-set-reps").value = s.reps || "";
                }
            });

            aggiornaSummary(li);
        });

        calcolaVolumeTotale();
    }, 50);
}

let routineEsTemporanei = [];
let routineProgrammaIdCorrente = null;
let routineIdInModifica = null;

function apriPopupRoutine(programmaId, routineId = null) {
    routineProgrammaIdCorrente = programmaId;
    routineIdInModifica = routineId;
    routineEsTemporanei = [];

    let titoloIniziale = "";
    let noteIniziali = "";

    if (routineId) {
        const routine = caricaRoutine(programmaId);
        const r = routine.find(x => x.id === routineId);
        if (r) {
            titoloIniziale = r.titolo || "";
            noteIniziali = r.note || "";
            routineEsTemporanei = r.esercizi.map(es => ({
                nome: es.nome,
                note: es.note || "",
                sets: es.sets.map(s => ({ kg: s.kg, reps: s.reps }))
            }));
        }
    }

    let overlay = document.getElementById("popup-routine");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "popup-routine";
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div id="popup-routine-box">
            <div id="popup-routine-header">
                <button class="btn-popup-icon" onclick="chiudiPopupRoutine()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <h3>${routineId ? "Modifica Routine" : "Crea Routine"}</h3>
                <button id="btn-salva-routine" onclick="salvaNuovaRoutine()">Salva</button>
            </div>
            <div id="popup-routine-body">
                <input type="text" id="input-routine-titolo" placeholder="Titolo della routine..." value="${titoloIniziale}">
                <input type="text" id="input-routine-note" placeholder="Note..." value="${noteIniziali}">
                <ul id="routine-list-es"></ul>
                <button id="btn-aggiungi-es-routine" onclick="toggleComboEsRoutine()">Aggiungi esercizi</button>
                <div id="comboEsRoutine" style="display:none;"></div>
            </div>
        </div>
    `;

    overlay.style.display = "flex";

    renderRoutineListEs();
    aggiornaStatoBtnSalvaRoutine();
}

function chiudiPopupRoutine() {
    const overlay = document.getElementById("popup-routine");
    if (overlay) overlay.style.display = "none";
    routineEsTemporanei = [];
    routineProgrammaIdCorrente = null;
    routineIdInModifica = null;
}

let show_combo_es_routine = false;

let selezionatiEsRoutine = new Set();

function toggleComboEsRoutine() {
    const container = document.getElementById("comboEsRoutine");
    const btn = document.getElementById("btn-aggiungi-es-routine");

    if (!show_combo_es_routine) {
        selezionatiEsRoutine = new Set();
        inizializzaPicker(container, selezionatiEsRoutine, () => {
            const n = selezionatiEsRoutine.size;
            btn.textContent = n > 0 ? `Aggiungi ${n} esercizi${n === 1 ? "o" : ""}` : "Aggiungi esercizio";
        });

        container.style.display = "block";
        btn.textContent = "Aggiungi esercizio";
        show_combo_es_routine = true;

    } else {
        selezionatiEsRoutine.forEach(nome => aggiungiEsRoutineTemp(nome));

        container.style.display = "none";
        container.innerHTML = "";
        selezionatiEsRoutine.clear();
        btn.textContent = "Aggiungi esercizi";
        show_combo_es_routine = false;
    }
}

function aggiungiEsRoutineTemp(nome) {
    const esistente = routineEsTemporanei.find(e => e.nome === nome);
    if (esistente) return;

    routineEsTemporanei.push({
        nome,
        note: "",
        sets: [
            { kg: "", reps: "" },
            { kg: "", reps: "" },
            { kg: "", reps: "" }
        ]
    });

    renderRoutineListEs();
    aggiornaStatoBtnSalvaRoutine();
}

function rimuoviEsRoutineTemp(nome) {
    routineEsTemporanei = routineEsTemporanei.filter(e => e.nome !== nome);
    renderRoutineListEs();
    aggiornaStatoBtnSalvaRoutine();
}

function riordinaRoutineEsTemporanei() {
    const lista = document.getElementById("routine-list-es");
    const nuovoOrdine = [];
    lista.querySelectorAll(".es-item").forEach(li => {
        const nome = li.querySelector(".es-nome").textContent;
        const es = routineEsTemporanei.find(e => e.nome === nome);
        if (es) nuovoOrdine.push(es);
    });
    routineEsTemporanei = nuovoOrdine;
    renderRoutineListEs();
}

function renderRoutineListEs() {
    const lista = document.getElementById("routine-list-es");
    if (!lista) return;

    lista.innerHTML = "";

    routineEsTemporanei.forEach((es, indexEs) => {
        const li = document.createElement("li");
        li.className = "es-item";
        li.dataset.expanded = "false";

        li.innerHTML = `
            <div class="es-header" onclick="toggleEsRoutine(this)">
                <span class="es-nome">${es.nome}</span>
                <div class="es-header-right">
                    <button class="es-remove" onclick="event.stopPropagation(); rimuoviEsRoutineTemp('${es.nome}')">×</button>
                </div>
            </div>
            <div class="es-summary"></div>
            <div class="es-body" style="display:none;">
                <input type="text" class="es-note" placeholder="Note...">
                <div class="es-table-header">
                    <span>Set</span>
                    <span><i class="fa-solid fa-dumbbell es-dumbbell-icon"></i> Kg</span>
                    <span>Reps</span>
                    <span></span>
                </div>
                <ul class="es-set-list">
                    ${es.sets.map((s, n) => creaRigaSetRoutine(n, s)).join("")}
                </ul>
                <button class="es-add-set" onclick="aggiungiSetRoutine(this, ${indexEs})">+ Aggiungi Serie</button>
            </div>
        `;

        lista.appendChild(li);
        abilitaDragReorder(li, lista, riordinaRoutineEsTemporanei);

        li.querySelector(".es-note").value = es.note;
        li.querySelector(".es-note").addEventListener("input", (e) => {
            es.note = e.target.value;
            aggiornaSummaryRoutine(li);
        });

        li.querySelectorAll(".es-set-kg, .es-set-reps").forEach((input, i) => {
            const isKg = input.classList.contains("es-set-kg");
            const setIndex = Math.floor(i / 2);

            input.addEventListener("input", () => {
                if (isKg) {
                    es.sets[setIndex].kg = input.value;
                } else {
                    es.sets[setIndex].reps = input.value;
                }
                aggiornaSummaryRoutine(li);
            });
        });

        aggiornaSummaryRoutine(li);
    });
}

function aggiornaContatoreAllenamenti(programmaId, nuovoConteggio) {
    const programma = programmi.find(p => p.id === programmaId);
    if (programma) {
        programma.allenamenti = nuovoConteggio;
        salvaProgrammiSuLocalStorage();
        renderProgrammi();
    }
}

function creaRigaSetRoutine(n, set) {
    return `
        <li class="es-set-row">
            <span class="es-set-num">${n + 1}</span>
            <input type="number" class="es-set-kg" placeholder="-" min="0" value="${set.kg}">
            <input type="number" class="es-set-reps" placeholder="-" min="0" value="${set.reps}">
            <button class="es-set-remove" onclick="rimuoviSetRoutine(this)"><i class="fa-solid fa-trash"></i></button>
        </li>
    `;
}

function aggiungiSetRoutine(btn, indexEs) {
    const lista = btn.previousElementSibling;
    const n = lista.querySelectorAll(".es-set-row").length;
    const li = document.createElement("li");
    li.className = "es-set-row";
    li.innerHTML = `
        <span class="es-set-num">${n + 1}</span>
        <input type="number" class="es-set-kg" placeholder="-" min="0">
        <input type="number" class="es-set-reps" placeholder="-" min="0">
        <button class="es-set-remove" onclick="rimuoviSetRoutine(this)"><i class="fa-solid fa-trash"></i></button>
    `;
    lista.appendChild(li);

    routineEsTemporanei[indexEs].sets.push({ kg: "", reps: "" });

    const esItem = btn.closest(".es-item");

    li.querySelector(".es-set-kg").addEventListener("input", (e) => {
        const idx = Array.from(lista.children).indexOf(li);
        routineEsTemporanei[indexEs].sets[idx].kg = e.target.value;
        aggiornaSummaryRoutine(esItem);
    });
    li.querySelector(".es-set-reps").addEventListener("input", (e) => {
        const idx = Array.from(lista.children).indexOf(li);
        routineEsTemporanei[indexEs].sets[idx].reps = e.target.value;
        aggiornaSummaryRoutine(esItem);
    });

    aggiornaSummaryRoutine(esItem);
}

function rimuoviSetRoutine(btn) {
    const riga = btn.closest(".es-set-row");
    const lista = riga.closest(".es-set-list");
    const esItem = riga.closest(".es-item");

    const indexEs = routineEsTemporanei.findIndex(
        es => es.nome === esItem.querySelector(".es-nome").textContent
    );
    const indexSet = Array.from(lista.children).indexOf(riga);

    if (indexEs !== -1) {
        routineEsTemporanei[indexEs].sets.splice(indexSet, 1);
    }

    riga.remove();
    rinumerizzaSet(lista);
    aggiornaSummaryRoutine(esItem);
}

function toggleEsRoutine(header) {
    const li = header.closest("li");
    const body = li.querySelector(".es-body");
    const summary = li.querySelector(".es-summary");
    const expanded = li.dataset.expanded === "true";

    li.dataset.expanded = !expanded;

    if (expanded) {
        body.style.display = "none";
        aggiornaSummaryRoutine(li);
    } else {
        summary.style.display = "none";
        body.style.display = "block";
    }
}

function toggleCheckRoutine(btn) {
    const row = btn.closest(".es-set-row");
    row.classList.toggle("es-set-done");
    aggiornaSummaryRoutine(row.closest(".es-item"));
}

function aggiornaSummaryRoutine(li) {
    const righe = li.querySelectorAll(".es-set-row");
    const summary = li.querySelector(".es-summary");

    if (li.dataset.expanded === "true") return;

    const nota = li.querySelector(".es-note").value.trim();

    let html = "";

    if (nota) {
        html += `<span class="es-summary-nota">${nota}</span>`;
    }

    righe.forEach((riga, i) => {
        const kg = riga.querySelector(".es-set-kg").value.trim();
        const reps = riga.querySelector(".es-set-reps").value.trim();

        let contenuto = "";

        if (kg && reps) {
            contenuto = `
                <span class="es-summary-kg">${kg}kg</span>
                <span class="es-summary-x">×</span>
                <span class="es-summary-reps">${reps} rip</span>
            `;
        } else if (kg && !reps) {
            contenuto = `<span class="es-summary-kg">${kg}kg</span>`;
        } else if (!kg && reps) {
            contenuto = `<span class="es-summary-reps">${reps} rip</span>`;
        } else {
            contenuto = `<span class="es-summary-reps">- reps</span>`;
        }

        html += `
            <div class="es-summary-row">
                <span class="es-summary-num">${i + 1}</span>
                ${contenuto}
            </div>
        `;
    });

    summary.innerHTML = html;
    summary.style.display = "block";
}

function aggiornaStatoBtnSalvaRoutine() {
    const btn = document.getElementById("btn-salva-routine");
    if (!btn) return;

    if (routineEsTemporanei.length > 0) {
        btn.classList.add("attivo");
    } else {
        btn.classList.remove("attivo");
    }
}

function salvaNuovaRoutine() {
    if (routineEsTemporanei.length === 0) return;

    const titolo = document.getElementById("input-routine-titolo").value.trim();
    const noteRoutine = document.getElementById("input-routine-note").value.trim();

    const datiRoutine = {
        titolo,
        note: noteRoutine,
        esercizi: routineEsTemporanei.map(es => ({
            nome: es.nome,
            note: es.note,
            sets: es.sets.map(s => ({ kg: s.kg, reps: s.reps }))
        }))
    };

    const routine = caricaRoutine(routineProgrammaIdCorrente);

    if (routineIdInModifica) {
        const index = routine.findIndex(r => r.id === routineIdInModifica);
        if (index !== -1) {
            routine[index] = { id: routineIdInModifica, ...datiRoutine };
        }
    } else {
        routine.push({ id: Date.now().toString(), ...datiRoutine });
    }

    salvaRoutine(routineProgrammaIdCorrente, routine);
    aggiornaContatoreAllenamenti(routineProgrammaIdCorrente, routine.length);

    chiudiPopupRoutine();
    renderRoutine(routineProgrammaIdCorrente);
}

// DEBUG
function resetWork() {
    let emailSalvata = sessionStorage.getItem("email") || "";
    if (emailSalvata === "") return;

    let element = document.getElementById("n-workout");;

    if (element) {
        element.textContent = "0";

        localStorage.setItem("workouts_" + emailSalvata, "0");
    }
}

function resetTuttiIDati() {
    const emailSalvata = sessionStorage.getItem("email") || "";
    if (emailSalvata === "") return;

    localStorage.removeItem("workouts_" + emailSalvata);
    localStorage.removeItem("volume_totale_" + emailSalvata);
    localStorage.removeItem("durata_totale_" + emailSalvata);
    sessionStorage.removeItem("id_workout");

    aggiornaDatiPanoramica();
    loadProfile();

    console.log("Reset completato per: " + emailSalvata);
}

window.onload = function () {
    loadProfile();
    inizializzaScenari();
    inizializzaEsercizi();
    riempiComboMisure();
    riempiComboGoals();

    loadMisure();
    aggiornaDatiPanoramica();

    muoviProgressSelezionato();
    muoviWorkoutSelezionato();
    renderFoto();
};