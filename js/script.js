const scenario = {
    "intro" : {
        videoSrc : "assets/video/Collab.mp4",
        choix: [
            { texte: "Option A", cible: "scene_suivante_A"},
            { texte: "Option B", cible: "scene_suivante_B" },
        ]
    },
    "scene_suivante_A": {
        videoSrc: "assets/video/popularité.mp4",
        choix: [
            { texte: "Option A", cible: "scene_suivante_A"},
            { texte: "Option B", cible: "intro" },
        ]
    }
};

const containerVid = document.getElementById("conteneur-video");
function addVideo(url){
    let newVideo = document.createElement('video');
    newVideo.src = url;
    newVideo.autoplay = true;
    newVideo.muted = true;
    containerVid.appendChild(newVideo);
}

const containerBtn = document.getElementById("conteneur-boutons");
function addBouton(texte, cible){
    let newBtn = document.createElement('button');
    newBtn.innerText = texte;
    newBtn.classList.add('bouton_cacher');
    newBtn.style.visibility = 'hidden';

    newBtn.addEventListener('click',function(){
        chargerScene(cible);
    });
    containerBtn.appendChild(newBtn);
}

function chargerScene(idScene) {
    const data = scenario[idScene];
    if (!data) return;
    containerVid.innerHTML = "";
    containerBtn.innerHTML = "";

    addVideo(data.videoSrc);

    data.choix.forEach(unChoix => {
        addBouton(unChoix.texte, unChoix.cible);
    });
}

chargerScene("intro");

document.getElementById("conteneur-video").addEventListener("click", function (){
    const hiddenBtnList = document.querySelectorAll('.bouton_cacher');

    this.pause();
    if(hiddenBtnList){
        for (let i = 0; i < hiddenBtnList.length; i++) {
            hiddenBtnList[i].style.visibility = "visible";
        }
    }

    this.style.pointerEvents = "none";
});