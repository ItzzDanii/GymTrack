let scenari = [];
let workout = false;
let timerInterval = null;
let uiInterval = null;

function inizializzaScenari() {
    scenari = [
        document.getElementById("main-container"),
        document.getElementById("profile-container"),
        document.getElementById("startworkout-container"),
        document.getElementById("workout-container")
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
    window.location.href = '/index.html';
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
        if (scenari[i].id != scenario) {
            document.getElementById(scenari[i].id).style.display = 'none';
        } else {
            document.getElementById(scenari[i].id).style.display = 'block';
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
        let timer = '0:00:00';
        document.getElementById("duration-value").textContent = timer;

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

            let timer = `${formattedH}:${formattedM}:${formattedS}`;
            document.getElementById("duration-value").textContent = timer;
        }, 1000);

        let volume = 0;
        let set = 0;

        uiInterval = setInterval(() => {
            document.getElementById("volume-value").innerText = volume + 'kg';
            document.getElementById("set-value").innerText = set;
        }, 200);
    } else setScenario("startworkout-container");
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

function resetFlr() {
    let emailSalvata = sessionStorage.getItem("email") || "";
    if (emailSalvata === "") return;

    let element = document.getElementById("n-follower");
    if (element) {
        element.textContent = "0";
        localStorage.setItem("followers_" + emailSalvata, "0");
    }
}

function resetFlw() {
    let emailSalvata = sessionStorage.getItem("email") || "";
    if (emailSalvata === "") return;

    let element = document.getElementById("n-follow");
    if (element) {
        element.textContent = "0";
        localStorage.setItem("follows_" + emailSalvata, "0");
    }
}

function resetAllCounters() {
    resetWork();
    resetFlr();
    resetFlw();
}