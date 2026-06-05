let inizia_animazione = true;
let login_visibile = false;

function animaScritta() {
    if (!inizia_animazione)
        return;

    document.body.style.backgroundImage = "url('img/bg_index1.png')";
    setTimeout(function () {
        document.body.style.backgroundImage = "url('img/bg_index2.png')";
    }, 150);
    setTimeout(function () {
        document.body.style.backgroundImage = "url('img/bg_index3.png')";
    }, 300);
    setTimeout(function () {
        document.body.style.backgroundImage = "url('img/bg_index4.png')";
    }, 450);

    inizia_animazione = false;
    login_visibile = true;

    setTimeout(function () {
        fadeInLogin();
        mostraLogin();
    }, 1000);
}

function mostraLogin() {
    if (!login_visibile)
        return;

    document.getElementById("login").style.display = "block";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

function fadeInLogin() {
    if (!login_visibile)
        return;
    document.getElementById("login").style.opacity = 0;
    let opacity = 0;
    let interval = setInterval(function () {
        if (opacity >= 1) {
            clearInterval(interval);
        }
        opacity += 2;
        document.getElementById("login").style.opacity = opacity;
    }, 50);
}

function accedi() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username == "") {
        document.getElementById("username").placeholder = "Inserisci username.."
        return;
    } else if (username != "" && username.length < 3) {
        document.getElementById("username").value = "";
        document.getElementById("username").placeholder = "Username non valido! (Almeno 3 caratteri)"
        return;
    } else if (username.length > 16) {
        document.getElementById("username").value = "";
        document.getElementById("username").placeholder = "Username non valido! (Max.16 caratteri)"
        return
    }
    else if (password == "") {
        document.getElementById("password").value = "";
        document.getElementById("password").placeholder = "Inserisci password.."
        return;
    } else if (password.length > 8) {
        document.getElementById("password").value = "";
        document.getElementById("password").placeholder = "Password non valida! (Max. 8 caratteri)"
        return;
    }
    else{
        
    }
}
