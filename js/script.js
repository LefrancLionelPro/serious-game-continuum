document.getElementById("scene1").addEventListener("click", function (){
    const hiddenBtnList = document.querySelectorAll('.bouton_cacher');

    this.pause();
    if(hiddenBtnList){
        for (let i = 0; i < hiddenBtnList.length; i++) {
            hiddenBtnList[i].style.visibility = "visible";
        }
    }

    this.style.pointerEvents = "none";
    this.pause();
})