let login = sessionStorage.getItem("utenteLoggato") === "true";

controllaLogin();

function controllaLogin(){
    if(!login)
        window.location.href='../index.html';
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

function logout(){
    sessionStorage.removeItem("utenteLoggato");
    login = false;
    window.location.href='../index.html';
}