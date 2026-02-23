const supabase = supabase.createClient('https://qbosijwcfspfexrcxcpa.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFib3NpandjZnNwZmV4cmN4Y3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTczMzYsImV4cCI6MjA4Njg5MzMzNn0.75q8vDiaaUY96i91yIrtHnsWyTJLXqcghHG-mlYE8xY')
console.log(supabase);

let trueID;
let annee;
let sexe;
let mdp;
let dpt;
let dataChoice;



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

    let form = document.createElement("form");

    let inputPrenom = document.createElement('input');
    inputPrenom.placeholder = "Entrez votre Prénom";
    inputPrenom.id = "inputPrenom";
    inputPrenom.type = "text";

    let motDePasse = document.createElement("input");
    motDePasse.type = "password";
    motDePasse.id = "motDePasse";
    motDePasse.placeholder = "Veuillez rentrer un mot de passe";

    let revealPwdCheck = document.createElement("button");
    revealPwdCheck.innerText = "voir mot de passe"
    revealPwdCheck.addEventListener("click", function(event){
        event.preventDefault();

        var checked = document.getElementById("motDePasse");

        if (checked.type === "password") {
            checked.type = "text";
        }

        else {
            checked.type = "password";
        }
    })

    let sexelist = document.createElement("select");
    sexelist.id = "sexelist";

    let optionBase = document.createElement("option");
    optionBase.value = "Default";
    optionBase.innerText = "Veuillez choisir votre sexe.";
    optionBase.selected = true;

    let option1 = document.createElement("option");
    option1.value = "Homme";
    option1.innerText = "Homme";

    let option2 = document.createElement("option");
    option2.value = "Femme";
    option2.innerText = "Femme";

    let option3 = document.createElement("option");
    option3.value = "Ne souhaite pas préciser";
    option3.innerText = "Ne souhaite pas préciser";

    let birthYear = document.createElement("input");
    birthYear.type = "text";
    birthYear.pattern = "[0-9]+";
    birthYear.placeholder = "Entrez votre année de naissance";
    birthYear.size = 4;
    birthYear.maxLength = 4;

    let department = document.createElement("input");
    department.type = "text";
    department.pattern = "[0-9]+"
    department.placeholder = "Entrez le numéro de votre département";
    department.size = 2;
    department.maxLength = 2;

    let dataChoiceCheck = document.createElement("input");
    dataChoiceCheck.id = "dataChoice";
    dataChoiceCheck.type = "checkbox";

    let dataChoiceText = document.createElement("p");
    dataChoiceText.innerText = "Je consent à transmettre mes données à des fins de recherches"

    let btnValider = document.createElement('button');
    btnValider.innerHTML = "Créer mon ID et commencer";

    form.appendChild(inputPrenom);
    form.appendChild(sexelist);

    sexelist.appendChild(optionBase);
    sexelist.appendChild(option1);
    sexelist.appendChild(option2);
    sexelist.appendChild(option3);

    form.appendChild(birthYear);
    form.appendChild(department);

    form.appendChild(motDePasse);
    form.appendChild(revealPwdCheck);

    form.appendChild(dataChoiceText);
    form.appendChild(dataChoiceCheck);
    dataChoiceText.appendChild(dataChoiceCheck);

    form.appendChild(btnValider);

    containerBtn.appendChild(form);

    btnValider.addEventListener("click", function (event){
        event.preventDefault();

        if (inputPrenom.value === "" || birthYear.value === "" || department.value === "" || sexelist.value === "" || motDePasse.value === "") {
            window.alert("veuillez remplir les questions");
        }

        else {
            let nameValue = inputPrenom.value;
            let lettre = nameValue.charAt(0).toUpperCase();

            mdp = motDePasse.value;
            sexe = sexelist.value;
            annee = birthYear.value;
            dpt = department.value;
            dataChoice = dataChoiceCheck.value;
            trueID = lettre + annee +dpt;

            console.log(trueID);
            console.log(mdp);
            console.log(sexe);
            console.log(annee);
            console.log(dpt);
            console.log(dataChoice);

            chargerScene("intro")
        }
    });
}

chargerScene("identification");