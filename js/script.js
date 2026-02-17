document.getElementById("scene1").addEventListener("click", function (){
    const hiddenBtnList = document.querySelectorAll('.bouton_cacher');
    const scene1 = document.querySelector('.scene1');
    if(hiddenBtnList){
        for (let i = 0; i < hiddenBtnList.length; i++) {
            hiddenBtnList[i].style.visibility = "visible";
        }
    }

    scene1.style.pointerEvents = "none";
})