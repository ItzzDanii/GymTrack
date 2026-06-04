function animaScritta(){
    document.body.style.backgroundImage = "url('img/bg_index1.png')";
    setTimeout(function() {
        document.body.style.backgroundImage = "url('img/bg_index2.png')";
    }, 1000);
    setTimeout(function() {
        document.body.style.backgroundImage = "url('img/bg_index3.png')";
    }, 2000);
    setTimeout(function() {
        document.body.style.backgroundImage = "url('img/bg_index4.png')";
    }, 3000);
}