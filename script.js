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
    document.getElementById("register").style.display = "none"; 
    
    document.getElementById("email").value = "";
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
        opacity += 0.1;
        document.getElementById("login").style.opacity = opacity;
    }, 50);
}

