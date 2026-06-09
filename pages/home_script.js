let scenari = [];
let workout = false;
let timerInterval = null;
let uiInterval = null;

function inizializzaScenari() {
    scenari = [
        document.getElementById("main-container"),
        document.getElementById("profile-container"),
        document.getElementById("startworkout-container"),
        document.getElementById("workout-container"),
        document.getElementById("progress-container")
    ];
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
    loadProfile();
}

function openHome() {
    setScenario("main-container");
}

function openWorkout() {
    resetInfo();
    setScenario("startworkout-container");
}

function openProgress() {
    setScenario("progress-container");
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
    workout = false;

    let emailSalvata = sessionStorage.getItem("email") || "";
    let setCorrenti = document.getElementById("set-value").innerText;

    if (parseInt(setCorrenti) > 0 && setCorrenti.trim() !== "") {
        if (sessionStorage.getItem("id_workout") == null) {
            sessionStorage.setItem("id_workout", 1);
        }
        let currentId = sessionStorage.getItem("id_workout");

        let durataCorrente = document.getElementById("duration-value").textContent;
        let volumeCorrente = document.getElementById("volume-value").innerText;

        let datiWorkout = `set:${setCorrenti}_duration:${durataCorrente}_volume:${volumeCorrente}`;

        sessionStorage.setItem(emailSalvata + "_workout_" + currentId, datiWorkout);
        localStorage.setItem("workouts_" + emailSalvata, currentId);
        sessionStorage.setItem("id_workout", parseInt(currentId) + 1);
    }

    if (timerInterval) clearInterval(timerInterval);
    if (uiInterval) clearInterval(uiInterval);

    resetInfo();

    let btnStart = document.getElementById("btnStart");
    if (btnStart) {
        btnStart.style.display = 'block';
    }

    setScenario("startworkout-container");
}

function startWorkout() {
    if (workout === false) {
        setScenario("workout-container");
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
            document.getElementById("volume-value").innerText = volume + 'kg';
            document.getElementById("set-value").innerText = set;
        }, 200);
    } else {
        setScenario("startworkout-container");
    }
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
    let emailSalvata = sessionStorage.getItem("email") || "";
    let nWorkoutPano = document.getElementById("n-workout-pano");
    let nVolumePano = document.getElementById("n-volume-pano");
    let nDurationPano = document.getElementById("n-duration-pano");

    if (nWorkoutPano) {
        let contatore = localStorage.getItem("workouts_" + emailSalvata) || "0";
        nWorkoutPano.textContent = contatore + " allenamenti";
    }

    let ultimoId = parseInt(sessionStorage.getItem("id_workout")) - 1;

    if (ultimoId > 0) {
        let stringaDati = sessionStorage.getItem(emailSalvata + "_workout_" + ultimoId);

        if (stringaDati) {
            let parti = stringaDati.split("_");
            let durataEstratta = "0:00:00";
            let volumeEstratto = "0kg";

            parti.forEach(parte => {
                if (parte.startsWith("duration:")) {
                    durataEstratta = parte.replace("duration:", "");
                }
                if (parte.startsWith("volume:")) {
                    volumeEstratto = parte.replace("volume:", "");
                }
            });

            if (nDurationPano) nDurationPano.textContent = "Ultima durata: " + durataEstratta;
            if (nVolumePano) nVolumePano.textContent = "Ultimo volume: " + volumeEstratto;
        }
    } else {
        if (nDurationPano) nDurationPano.textContent = "0h 0m";
        if (nVolumePano) nVolumePano.textContent = "0kg";
    }
}

// DEBUG
function resetWork() {
    let emailSalvata = sessionStorage.getItem("email") || "";
    if (emailSalvata === "") return;

    let element = document.getElementById("n-workout");
    if (element) {
        element.textContent = "0";
        localStorage.setItem("workouts_" + emailSalvata, "0");
    }
}

window.onload = function () {
    loadProfile();
    inizializzaScenari();
    riempiComboMisure();

    loadMisure();
    aggiornaDatiPanoramica();

    muoviSelezionato();
};