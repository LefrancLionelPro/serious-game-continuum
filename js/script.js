const supabaseClient = supabase.createClient('https://qbosijwcfspfexrcxcpa.supabase.co', 'sb_publishable_T1dqF1VvIR-L3ZTSc4LgBQ_uAcJ_jKE')
console.log(supabaseClient);

let trueID;
let prenom;
let annee;
let sexe;
let mdp;
let dpt;
let dataChoice;

let currentScenatio;
let choosedOption;



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
function addBouton(texte, cible, scenePresent){
    let newBtn = document.createElement('button');
    newBtn.innerText = texte;
    newBtn.classList.add('bouton_cacher');
    newBtn.style.visibility = 'hidden';

    newBtn.addEventListener('click',function(){
        getChoiceData(scenePresent, texte);
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
        login();
        return;
    }

    else {
        const data = scenario[idScene];
        if (!data) return;
        containerVid.innerHTML = "";
        containerBtn.innerHTML = "";

        addVideo(data.videoSrc);

        data.choix.forEach(unChoix => {
            addBouton(unChoix.texte, unChoix.cible, idScene);
        });
    }
}

function afficherFormulaireID() {
    containerBtn.innerHTML = "";

    let form = document.createElement("form");

    let formIntro = document.createElement("h3");
    formIntro.innerText = "Veuillez rentrer vos informations si vous le souhaitez";

    let prenomText = document.createElement("p");
    prenomText.innerText = "Votre prénom";

    let inputPrenom = document.createElement('input');
    inputPrenom.id = "inputPrenom";
    inputPrenom.type = "text";
    inputPrenom.placeholder = "Entrez votre Prénom";

    let mdpText = document.createElement("p");
    mdpText.innerText = "Votre mot de passe";

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

    let sexeText = document.createElement("p");
    sexeText.innerText = "Votre sexe";

    let sexelist = document.createElement("select");
    sexelist.id = "sexelist";

    let optionBase = document.createElement("option");
    optionBase.value = "Default";
    optionBase.innerText = "Veuillez sélectionner votre sexe";
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

    let birthYearText = document.createElement("p");
    birthYearText.innerText = "Votre année de naissance";

    let birthYear = document.createElement("input");
    birthYear.type = "text";
    birthYear.pattern = "[0-9]+";
    birthYear.placeholder = "Entrez votre année de naissance";
    birthYear.maxLength = 4;

    let dptText = document.createElement("p");
    dptText.innerText = "Le numéro de votre département";

    let department = document.createElement("input");
    department.type = "text";
    department.placeholder = "Entrez le numéro de votre département";
    department.maxLength = 3;

    const dptRegex = /^([0-9]{2}|2A|2B|[0-9]{3})$/;

    let dataChoiceCheck = document.createElement("input");
    dataChoiceCheck.id = "dataChoice";
    dataChoiceCheck.type = "checkbox";

    let dataChoiceText = document.createElement("p");
    dataChoiceText.innerText = "Je consent à transmettre mes données à des fins de recherches"

    let loginButton = document.createElement("button");
    loginButton.id = "bouton_login";
    loginButton.innerHTML = "J'ai déja un identifiant et je me connecte"
    loginButton.addEventListener("click", function(event) {
        event.preventDefault();

        chargerScene("login");
    })

    let btnValider = document.createElement('button');
    btnValider.innerHTML = "Créer mon ID et/ou commencer";

    form.appendChild(formIntro);

    form.appendChild(prenomText);
    form.appendChild(inputPrenom);

    form.appendChild(sexeText);
    form.appendChild(sexelist);

    sexelist.appendChild(optionBase);
    sexelist.appendChild(option1);
    sexelist.appendChild(option2);
    sexelist.appendChild(option3);

    form.appendChild(birthYearText);
    form.appendChild(birthYear);

    form.appendChild(dptText);
    form.appendChild(department);

    form.appendChild(mdpText);
    form.appendChild(motDePasse);
    form.appendChild(revealPwdCheck);

    form.appendChild(dataChoiceText);
    form.appendChild(dataChoiceCheck);
    dataChoiceText.appendChild(dataChoiceCheck);

    form.appendChild(loginButton);
    form.appendChild(btnValider);

    containerBtn.appendChild(form);

    btnValider.addEventListener("click", async function (event){
        event.preventDefault();

            let nameValue = inputPrenom.value.trim().toLowerCase();
            let lettre = nameValue.charAt(0).toUpperCase();

            let dptValue = department.value.toUpperCase();

            prenom = lettre + nameValue.slice(1);
            mdp = motDePasse.value;
            sexe = sexelist.value;
            annee = birthYear.value;
            dpt = dptValue;
            dataChoice = dataChoiceCheck.checked;
            trueID = lettre + annee +dpt;

            console.log(trueID);
            console.log(mdp);
            console.log(sexe);
            console.log(annee);
            console.log(dpt);
            console.log(dataChoice);

            if (dataChoice) {

                if (inputPrenom.value === "" || birthYear.value === "" || department.value === "" || sexelist.value === "" || motDePasse.value === "" || !dptRegex.test(department.value) || sexelist.value === "Veuillez sélectionner votre sexe") {
                    window.alert("veuillez remplir les questions");
                    return;
                }

                const { error } = await supabaseClient.from('utilisateurs')
                    .insert([
                        {
                            player_id: trueID,
                            name: prenom,
                            password: mdp,
                            gender: sexe,
                            birth_year: annee
                        }
                    ]);

                if (error) {
                    alert("Erreur lord de l'inscription : " + error.message);
                }

                containerBtn.innerHTML = "";
                let text1 = document.createElement("h3");
                text1.innerText = "Veuillez noter votre identifiant pour vos prochaines sessions";
                let text2 = document.createElement("p");
                text2.innerText = trueID;

                let acceptBtn = document.createElement("button");
                acceptBtn.innerHTML = "J'ai noté(é) mon identifiant et je suis prêt(e) à jouer";

                containerBtn.appendChild(text1);
                containerBtn.appendChild(text2);
                containerBtn.appendChild(acceptBtn);

                acceptBtn.addEventListener("click", function (event) {
                    event.preventDefault();

                    chargerScene("intro");
                });
            }

            else {
                chargerScene("intro");
            }
    });
}

async function login() {

    containerBtn.innerHTML = "";

    let introText = document.createElement("h3");
    introText.innerText = "Veuillez rentrer votre identifiant et votre mot de passe"

    let loginText = document.createElement("p");
    loginText.innerText = "Identifiant : ";

    let login_input = document.createElement("input");
    login_input.type = "text";
    login_input.placeholder = "Veuillez rentrer votre identifiant";

    let pwdText = document.createElement("p");
    pwdText.innerText = "Mot de passe : ";

    let pwd_input = document.createElement("input");
    pwd_input.type = "password";
    pwd_input.id = "pwd_input";
    pwd_input.placeholder = "Veuillez rentrer un mot de passe";

    let revealPwdCheckLogin = document.createElement("button");
    revealPwdCheckLogin.innerText = "voir mot de passe"
    revealPwdCheckLogin.addEventListener("click", function(event){
        event.preventDefault();

        var checked = document.getElementById("pwd_input");

        if (checked.type === "password") {
            checked.type = "text";
        }

        else {
            checked.type = "password";
        }
    })

    let validateBtn = document.createElement("button");
    validateBtn.innerText = "Se connecter";
    validateBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        if ((login_input.value === "") || (pwd_input.value === "")) {
            window.alert("Veuillez remplir les tout les champs");
            return;
        }

        const { data, error } = await supabaseClient.
            from('utilisateurs').
            select('*').
            eq('player_id', login_input.value);

        console.log("Data reçue : " + data);

        if (error) {
            window.alert("Cet utilisateur existe déja");
            return;
        }

        if (!data || data.length === 0) {
            window.alert("Id non trouvé");
            return;
        }

        else if (data[0].password === pwd_input.value) {
            containerBtn.innerHTML = "";
            trueID = data[0].player_id;
            prenom = data[0].name;
            annee = data[0].birth_year;
            sexe = data[0].gender;


            containerBtn.innerHTML = "";
            let successText = document.createElement("p");
            successText.innerText = "Connexion réussi";

            let continueBtn = document.createElement("button");
            continueBtn.innerHTML = "Jouer";
            continueBtn.addEventListener("click", function (event) {
                event.preventDefault();

                chargerScene("intro");
            })

            let continueForm = document.createElement("form");

            continueForm.appendChild(successText);
            continueForm.appendChild(continueBtn);

            containerBtn.appendChild(continueForm);
        }

        else {
            window.alert("Votre mot de passe est erroné");
        }
    })

    let form_login = document.createElement("form");

    form_login.appendChild(loginText);
    form_login.appendChild(login_input);
    form_login.appendChild(pwdText);

    form_login.appendChild(pwd_input);
    form_login.appendChild(revealPwdCheckLogin);

    form_login.appendChild(validateBtn);

    containerBtn.appendChild(form_login);
}

async function getChoiceData(scene, choix){
    currentScenatio = scene;
    choosedOption = choix;

    const { error } = await supabaseClient.from('reponses')
        .insert([
            {
                player_id: trueID,
                scene: currentScenatio,
                choix: choosedOption,
            }
        ]);

    if (error) {
        alert("Erreur : " + error.message);
    }

}

chargerScene("identification");