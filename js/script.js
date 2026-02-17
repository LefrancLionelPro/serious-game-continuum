document.getElementById("scene1").addEventListener("click", function (){
    const hiddenBtnList = document.querySelectorAll('.bouton_cacher');
    if(hiddenBtnList){
        for (let i = 0; i < hiddenBtnList.length; i++) {
            hiddenBtnList[i].style.visibility = "visible";
        }
    }

    this.style.pointerEvents = "none";
})