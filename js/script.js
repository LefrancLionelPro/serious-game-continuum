document.getElementById("scene1").addEventListener("click", function (){
    var hiddenBtnList = document.querySelectorAll('.bouton_cacher');
    var scene1 = document.querySelector('.scene1');
    if(hiddenBtnList){
        for (var i = 0; i < hiddenBtnList.length; i++) {
            hiddenBtnList[i].style.visibility = "visible";
        }
    }

    scene1.style.pointerEvents = "none";
})