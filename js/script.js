let trueID;
let annee;
let sexe;
let mdp;

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
    newVideo.classList.add('video');

    newVideo.addEventListener("click", function (){
        this.pause();

        const hiddenBtnList = document.querySelectorAll('.bouton_cacher');
        if(hiddenBtnList){
            for (let i = 0; i < hiddenBtnList.length; i++) {
                hiddenBtnList[i].style.visibility = "visible";
            }
        }

        this.style.pointerEvents = "none";
    });

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
    if (idScene === "identification") {
        afficherFormulaireID();
        return;
    }

    else if (idScene === "login") {
        return;
    }

    else {
        const data = scenario[idScene];
        if (!data) return;
        containerVid.innerHTML = "";
        containerBtn.innerHTML = "";

        addVideo(data.videoSrc);

        data.choix.forEach(unChoix => {
            addBouton(unChoix.texte, unChoix.cible);
        });
    }
}

function afficherFormulaireID() {
    containerBtn.innerHTML = "";

    let inputPrenom = document.createElement('input');
    inputPrenom.placeholder = "Entrez votre Prénom";
    inputPrenom.id = "inputPrenom";

    let sexes = document.createElement("input");
    sexes.list = "list";

    let datasexes = document.createElement("datalist");
    datasexes.id = "list";

    let option1 = document.createElement("option");
    option1.value = "Homme";

    let option2 = document.createElement("option");
    option2.value = "Femme";

    let option3 = document.createElement("option");
    option3.value = "Ne souhaite pas préciser";


    let birthYear = document.createElement("input");
    birthYear.placeholder = "Entrez votre année de naissance";
    birthYear.type = "text";
    birthYear.size = 4;
    birthYear.maxLength = 4;
    birthYear.type = "number";

    let department = document.createElement("input");
    department.placeholder = "Entrez le numéro de votre département";
    department.type = "text";
    department.size = 2;
    department.maxLength = 2;
    department.type = "number";

    let motDePasse = document.createElement("input");
    motDePasse.type = "password";
    motDePasse.id = "motDePasse";
    motDePasse.placeholder = "Veuillez rentrer un mot de passe";

    let btnValider = document.createElement('button');
    btnValider.innerHTML = "Créer mon ID et commencer";

    containerBtn.appendChild(inputPrenom);
    containerBtn.appendChild(sexes);
    containerBtn.appendChild(datasexes);

    datasexes.appendChild(option1);
    datasexes.appendChild(option2);
    datasexes.appendChild(option3);

    containerBtn.appendChild(birthYear);
    containerBtn.appendChild(department);
    containerBtn.appendChild(motDePasse);
    containerBtn.appendChild(btnValider);

    btnValider.addEventListener("click", function (){
        if (inputPrenom.value === "" || birthYear.value === "" || department.value === "" || sexes.value === "" || motDePasse.value === "") {
            window.alert("veuillez remplir les questions");
        }

        else {
            let nameValue = inputPrenom.value;
            let lettre = nameValue.charAt(0).toUpperCase();

            annee = birthYear.value;

            let dpt = department.value;

            sexe = sexes.value;

            trueID = lettre + annee +dpt;

            mdp = motDePasse.value;

            console.log(trueID);
            chargerScene("intro")
        }
    });
}

chargerScene("identification");