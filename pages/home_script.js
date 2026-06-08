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
    if (sessionStorage.getItem("loggato") !== "true")
        window.location.href = '/index.html';
}

function loadProfile(){
    document.getElementById("profile-email").value = sessionStorage.getItem("email");
}

function openProfile() {
    document.getElementById("main-container").style.display = 'none';
    document.getElementById("profile-container").style.display = 'block';
    loadProfile();
}

function openHome() {
    document.getElementById("main-container").style.display = 'block';
    document.getElementById("profile-container").style.display = 'none';
}

function changePic() {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';
    
    input.onchange = function(e) {
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