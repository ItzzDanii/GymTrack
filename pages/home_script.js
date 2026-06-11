let scenari = [];
let scenario_selezionato = "main";
let workout = false;
let timerInterval = null;
let uiInterval = null;
let popupApertoWorkout = false;


let esercizi = [];

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
            }
        }

        console.log("Esercizi caricati nel browser:", esercizi);
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
        loadProfile();
        showUsername();
        setInterval(showUsername, 500);
        setScenario("main-container");
        scenario_selezionato("main");
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
    scenario_selezionato = "start_workout";
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

    const totale = document.querySelectorAll(".es-set-row.es-set-done").length;
    if (totale < totaleSet) {
        popupApertoWorkout = true;
        mostraPopupTermina();
        return;
    }

    terminaComunque();
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
                if (totaleSet === 0) {
                    mostraPopupNessunEsercizio();
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

function addEs() {
    const combo = document.getElementById("comboEs");
    const btn = document.getElementById("btnAddEs");

    if (!show_combo_es) {
        if (combo.innerHTML.trim() === "") {
            let s = "";
            esercizi.forEach((es, i) => {
                s += `<option value="${i}">${es}</option>`;
            });
            combo.innerHTML = s;
        }

        combo.style.display = "block";
        btn.textContent = "Aggiungi esercizio";
        show_combo_es = true;

        combo.onchange = function () {
            const selezionati = Array.from(combo.selectedOptions).length;
            if (selezionati > 0) {
                btn.textContent = `Aggiungi ${selezionati} esercizi${selezionati === 1 ? "o" : ""}`;
            }
        };

    } else {
        const selezionati = Array.from(combo.selectedOptions);
        selezionati.forEach(opt => {
            aggiungiEsercizioAllaLista(opt.text);
        });

        combo.style.display = "none";
        combo.selectedIndex = -1;
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
        </li>
    `;
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
                ${completato ? `<span class="es-summary-check"><i class="fa-solid fa-check"></i></span>` : ""}
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
let voce_selezionata = voci_progress[1];

function openPanoramica() {
    voce_selezionata = voci_progress[0];
    muoviSelezionato();
    aggiornaDatiPanoramica();
}

function openMisure() {
    voce_selezionata = voci_progress[1];
    muoviSelezionato();
    loadMisure();
}

function openFoto() {
    voce_selezionata = voci_progress[2];
    muoviSelezionato();
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

function muoviSelezionato() {
    let lineaDinamica = document.getElementById("separa-info-progress-dinamico");
    let divPanoramica = document.getElementById("panoramica");
    let divMisure = document.getElementById("misure");
    let divFoto = document.getElementById("foto");

    if (!lineaDinamica || !divPanoramica || !divMisure || !divFoto) return;

    if (voce_selezionata === "Panoramica") {
        lineaDinamica.style.width = '6%';
        lineaDinamica.style.marginLeft = '14.3%';

        divPanoramica.style.display = "block";
        divMisure.style.display = "none";
        divFoto.style.display = "none";
    }
    else if (voce_selezionata == "Misure") {
        lineaDinamica.style.width = '4%';
        lineaDinamica.style.marginLeft = '21.6%';

        divPanoramica.style.display = "none";
        divMisure.style.display = "block";
        divFoto.style.display = "none";
    }
    else if (voce_selezionata == "Foto") {
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

    muoviSelezionato();
    renderFoto();
};