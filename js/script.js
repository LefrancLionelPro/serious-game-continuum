document.getElementById("scene1").addEventListener("click", function (){
    var hiddenBtnList = document.querySelectorAll('.bouton_cacher');
    if(hiddenBtnList){
        for (var i = 0; i < hiddenBtnList.length; i++) {
            hiddenBtnList[i].style.visibility = "visible";
        }
    }
})