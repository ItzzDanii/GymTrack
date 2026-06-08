let scenari = [];

function inizializzaScenari() {
    scenari = [document.getElementById("main-container"), document.getElementById("profile-container")];
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
    sessionStorage.removeItem("loggato");
    window.location.href = '/index.html';
}

function controllaLoggato() {
    if (sessionStorage.getItem("loggato") !== "true") {
        window.location.href = '/index.html';
    } else {
        inizializzaScenari();
        showUsername();
        setInterval(showUsername, 1);
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
    let username = sessionStorage.getItem("username");
    if (username) {
        document.getElementById("show-username").innerText = username;
    }
}

function loadProfile() {
    document.getElementById("profile-email").value = sessionStorage.getItem("email") || "";
    let inputUsername = document.getElementById("profile-username");
    if (inputUsername && inputUsername.value.trim() !== "") {
        sessionStorage.setItem("username", inputUsername.value);
    }
}

function openProfile() {
    setScenario("profile-container");
    loadProfile();
}

function openHome() {
    setScenario("main-container");
}

function changePic() {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';
    input.onchange = function (e) {
        let file = e.target.files[0];
        if (file) {
            let url = URL.createObjectURL(file);
            document.querySelectorAll("#profile-pic").forEach(img => {
                img.src = url;
            });
        }
    };
    input.click();
}