console.log("LE SCRIPT EST BIEN CHARGÉ ET LANCÉ !");
alert("Script actif");

async function envoyerVersServeur(action, payload) {
    try {
        const response = await fetch('save.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({action: action, data: payload}),
        });
        return await response.json();
    }
    catch (error) {
        console.error("Erreur serveur :", error);
        return {error: true};
    }
}

// On crée toutes les variables dont on aura besoin
let dataChoice;
let trueID;

// On crée des variables pour pouvoir envoyer la scène présente et le choix du joueur dans cette scène
let currentScene;
let choosedOption;
let ChoosedAt;

// On crée une variable qui va générer un ID aléatoire pour pouvoir stocker plusieurs runs d'un même joueur
const run = Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);

window.onerror = function(message, source, lineno, colno, error) {
    alert("ERREUR JS : " + message + " à la ligne " + lineno);
};

// On crée nos différentes scènes

/*
Exemple de scène :
    "nom de la scène" : {
    le_source_de_vidéo_présent_dans_la_scène : "assets/video/video.mp4",
        la_scène_qui_sera_jouée_si_le_joueur_ne_fait_rien : "scene_suivante",
        les_boutons_de_la_scène: [
        { le_texte_sur_le_bouton: "Option A", la_scène_qui_sera_jouée_si_on_clique_sur_ce_bouton: "scene_suivante"},
        { le_texte_sur_le_bouton: "Option B", la_scène_qui_sera_jouée_si_on_clique_sur_ce_bouton: "scene_suivante" },
        { etc... },
    ]
}
*/

const scenario = {
    "intro" : {
        videoSrc : "assets/video/Collab.mp4",
        actionStart : 4.5,
        actionEnd : 6.5,
        afk : "scene_suivante_A",
        choix: [
            { texte: "Option A", cible: "intro"},
            { texte: "Option B", cible: "scene_suivante_A" },
        ]
    },
    "scene_suivante_A": {
        videoSrc: "assets/video/popularité.mp4",
        afk : "intro",
        choix: [
            { texte: "Option A", cible: "scene_suivante_A"},
            { texte: "Option B", cible: "intro" },
        ]
    }
};

// On va prendre le conteneur qui possède l'ID "conteneur-video" dans le HTML
const containerVid = document.getElementById("conteneur-video");

// On fait une fonction pour ajouter une vidéo dans une scène
function addVideo(url, afk, scenePresent){

    // On crée un nouvel élément vidéo
    let newVideo = document.createElement('video');

    /*
    On lui attribue sa source, on le met en autoplay et
    en muet pour que la vidéo commence automatiquement.
    Enfin, on lui donne la classe "video".
     */
    newVideo.src = url;
    newVideo.autoplay = true;
    newVideo.muted = true;
    newVideo.setAttribute('playsinline', 'true');
    newVideo.setAttribute('webkit-playsinline', 'true');
    newVideo.setAttribute('preload', 'auto');
    newVideo.playsInline = true;
    newVideo.classList.add('video');

    const debutAction = scenario[scenePresent].actionStart;
    const finAction = scenario[scenePresent].actionEnd;

    let playPromise = newVideo.play();
    if (!playPromise !== undefined) {
        playPromise.catch(function(error) {
            console.log("L'autoplay a été bloqué, l'utilisateur doit cliquer.");
        });
    }

    /*
    On fait un eventListener :
    si la vidéo se termine sans que le joueur ait fait pause,
    on dit à la base de données ce qu'il a fait dans cette scène,
    et on envoie le joueur vers la scène prévue pour les personnes qui n'ont pas choisi.
     */
    newVideo.addEventListener('ended', function(){
        if (afk){
            getChoiceData(scenePresent, "N'a rien fait");
            chargerScene(afk);
        }
    })

    /*
    On fait un eventListener :
    lorsque le joueur clique sur la vidéo, la vidéo se met en pause.
     */
    newVideo.addEventListener("click", function (){
        const tempsActuel = this.currentTime;

        if (debutAction !== undefined && finAction !== undefined){

            if (tempsActuel >= debutAction && tempsActuel <= finAction){
                this.pause();

                // On va récupérer tous les boutons de la scène et on les met dans une liste
                const hiddenBtnList = document.querySelectorAll('.bouton_cacher');

                // Si des boutons existent, on parcourt la liste des boutons pour les rendre visibles
                if(hiddenBtnList){
                    for (let i = 0; i < hiddenBtnList.length; i++) {
                        hiddenBtnList[i].style.visibility = "visible";
                        hiddenBtnList[i].classList.add('fade-in');
                    }
                }
            }
        }
    });

    // On met cette vidéo dans le conteneur vidéo
    containerVid.appendChild(newVideo);
}

// On va prendre le conteneur qui possède l'ID "conteneur-boutons" dans le HTML
const containerBtn = document.getElementById("conteneur-boutons");

// On fait une fonction pour créer les boutons des scènes
function addBouton(texte, cible, scenePresent){

    // On crée un nouvel élément bouton
    let newBtn = document.createElement('button');

    /*
    On rajoute à ce bouton le texte du scénario,
    la classe 'bouton_cacher' pour cacher les boutons avec la fonction au-dessus,
    et on cache les boutons.
     */
    newBtn.innerText = texte;
    newBtn.classList.add('bouton_cacher');
    newBtn.style.visibility = 'hidden';
    /*
    On fait un eventListener :
    lorsque le joueur clique sur un des boutons,
    on transmet ses données à la base de données
    (la scène dans laquelle on est et le choix effectué dans cette scène).
    Enfin, on change de scène.
     */
    newBtn.addEventListener('click',function(){
        getChoiceData(scenePresent, texte);
        chargerScene(cible);
    });

    // On met ce bouton dans le conteneur bouton
    containerBtn.appendChild(newBtn);
}

// On crée une fonction pour pouvoir changer de scène
function chargerScene(idScene) {
    /*
    Pour que ce soit plus simple, j'ai fait des exceptions.
    Le jeu considère que l'identification et la connexion sont des scènes.
     */
    if (idScene === "identification") {
        afficherFormulaireID();
        return;
    }

    else if (idScene === "login") {
        login();
        return;
    }

    else {

        // On met les données de la scène dans une variable
        const data = scenario[idScene];

        // S'il n'y a pas de donnée, on quitte la fonction
        if (!data) return;

        // On efface les anciens contenus des conteneurs
        containerVid.innerHTML = "";
        containerBtn.innerHTML = "";

        // On utilise la fonction addVideo pour rajouter la vidéo
        addVideo(data.videoSrc, data.afk, idScene);

        /*
            On prend unChoix parmi les choix présents dans la scène actuelle.
            On transmet le texte de ce choix, la cible et l'identifiant de la scène présente.
            L'équivalent serait :
            for (let unChoix of data.choix) {
                addBouton(unChoix.texte, unChoix.cible, idScene);
            }
         */
        data.choix.forEach(function(unChoix) {
            addBouton(unChoix.texte, unChoix.cible, idScene);
        });
    }
}

// On crée une fonction pour afficher le formulaire
function afficherFormulaireID() {
    containerBtn.innerHTML = "";

    // On crée un nouvel élément form
    let form = document.createElement("form");

    // On crée un nouvel élément en-tête 3 qui aura comme texte "Identification"
    let formIntro = document.createElement("h3");
    formIntro.innerText = "Identification";
    formIntro.id = "formIntro";


    let description = document.createElement("p");
    description.innerHTML = "Pour vous identifier, entrez : <br>" +
        "- Les 2 dernièrs chiffres de votre année de naissances<br>" +
        "- Les 2 premières lettres du nom de votre mère<br>" +
        "- les 2 derniers chiffres de votre numéro de téléphone portable";

    let exemple = document.createElement("p");
    exemple.innerText = "Exemple : Ma mère s'appelle Elodie, je suis né en 1980, mon numéro de téléphone est le : 06******67"
    exemple.id = "exemple";

    let input = document.createElement("input");
    input.type = "text";
    input.className = "userInput";
    input.placeholder = "ex : 80EL67";
    input.maxLength = 6;
    input.autocomplete = "on";

    let feedback = document.createElement("p");
    feedback.id = "feedback";

    let fAnnee = document.createElement("span");
    let fAlias = document.createElement("span");
    let fNum = document.createElement("span");

    fAnnee.innerText = "✘ 2 chiffres | ";
    fAlias.innerText = "✘ 2 lettres | ";
    fNum.innerText = "✘ 2 chiffres";

    feedback.append(fAnnee, fAlias, fNum);

    input.addEventListener("input", function(){
        let tempId = input.value.toUpperCase().replace(/[^0-9A-Z]/g, '');

        let birthYear = tempId.slice(0, 2).replace(/[^0-9]/g, '');
        let alias = tempId.slice(2, 4).replace(/[^A-Z]/g, '');
        let phoneNum = tempId.slice(4, 6).replace(/[^0-9]/g, '');

        fAnnee.innerText = (birthYear.length === 2 ) ? "✔ Année | " : "✘ 2 chiffres | ";
        fAnnee.style.color = (birthYear.length === 2 ) ? "green" : "red";

        fAlias.innerText = (alias.length === 2 ) ? "✔ Initiales | " : "✘ 2 lettres  | ";
        fAlias.style.color = (alias.length === 2 ) ? "green" : "red";

        fNum.innerText = (phoneNum.length === 2 ) ? "✔ Téléphone" : "✘ 2 chiffres";
        fNum.style.color = (phoneNum.length === 2 ) ? "green" : "red";

        this.value = birthYear + alias + phoneNum;
    });

    let dataChoiceCheck = document.createElement("input");
    dataChoiceCheck.id = "dataChoiceCheck";
    dataChoiceCheck.type = "checkbox";

    let dataChoiceLabel = document.createElement("label");
    dataChoiceLabel.id = "dataChoiceLabel";
    dataChoiceLabel.setAttribute("for", "dataChoiceCheck");

    let dataChoiceText = document.createTextNode("Je consens à transmettre mes données à des fins de recherches et j'ai compris qu'elles seront anonymisées et traitées de manière strictement confidentielle");

    let btnContainer = document.createElement("div");
    btnContainer.id = "btnContainer";

    let loginButton = document.createElement("button");
    loginButton.id = "loginButton";
    loginButton.innerHTML = "J'ai déjà un identifiant et je me connecte";

    /*
    On fait un eventListener :
    lorsque le joueur clique sur le bouton,
    on charge le formulaire de login.
     */
    loginButton.addEventListener("click", function(event) {
        event.preventDefault();

        chargerScene("login");
    })

    let btnValider = document.createElement('button');
    btnValider.innerHTML = "Créer mon identifiant et/ou commencer";

    form.appendChild(formIntro);
    form.appendChild(description);
    form.appendChild(exemple);

    form.appendChild(input);
    form.appendChild(feedback);

    dataChoiceLabel.appendChild(dataChoiceCheck);
    dataChoiceLabel.appendChild(dataChoiceText);
    form.appendChild(dataChoiceLabel);

    btnContainer.appendChild(loginButton);
    btnContainer.appendChild(btnValider);
    form.appendChild(btnContainer);

    // On met le formulaire qui possède désormais tous les éléments dans le conteneur de boutons
    containerBtn.appendChild(form);

    /*
    On fait un eventListener :
    lorsque le joueur clique sur le bouton, on transmet les données du joueur à la base de données.
     */
    btnValider.addEventListener("click", async function (event){
        event.preventDefault();

        dataChoice = dataChoiceCheck.checked;

        // On transmet les données du joueur dans la base de données uniquement s'il coche la case de consentement
        if (dataChoice) {

            if (input.value === "" || input.value.length !== 6) {
                window.alert("Merci d'écrire votre identifiant");
                return;
            }

            trueID = input.value;

            const result = await envoyerVersServeur('creer_utilisateur', {player_id: trueID});

            if (result.error) {
                alert("Erreur lors de l'inscription : " + result.error);
                return;
            }

            document.querySelector("html").style.overflow = "hidden";

            containerBtn.innerHTML = "";
            let text1 = document.createElement("h3");
            text1.innerText = "Veuillez noter votre identifiant pour vos prochaines sessions";
            let text2 = document.createElement("p");
            text2.innerText = trueID;

            let acceptBtn = document.createElement("button");
            acceptBtn.innerHTML = "J'ai noté mon identifiant et je suis prêt(e) à jouer";

            containerBtn.appendChild(text1);
            containerBtn.appendChild(text2);
            containerBtn.appendChild(acceptBtn);

            /*
            On fait un eventListener qui lance la scène d'intro lorsque le joueur appuie sur le bouton de confirmation.
             */
            acceptBtn.addEventListener("click", function (event) {
                event.preventDefault();

                chargerScene("intro");
            });
        }

        else {
            window.alert("Merci de vous inscrire/connecter afin de pouvoir jouer au jeu");
        }
    });
}

async function login() {

    document.querySelector("html").style.overflow = "hidden";
    containerBtn.innerHTML = "";

    let introText = document.createElement("h3");
    introText.innerText = "Connexion"

    let loginText = document.createElement("p");
    loginText.innerText = "Identifiant : ";

    let login_input = document.createElement("input");
    login_input.type = "text";
    login_input.placeholder = "ex : 80EL67";
    login_input.maxLength = 6;

    let login_feedback = document.createElement("p");
    login_feedback.id = "feedback";

    let login_fAnnee = document.createElement("span");
    let login_fAlias = document.createElement("span");
    let login_fNum = document.createElement("span");

    login_fAnnee.innerText = "✘ 2 chiffres | ";
    login_fAlias.innerText = "✘ 2 lettres | ";
    login_fNum.innerText = "✘ 2 chiffres";

    login_feedback.append(login_fAnnee, login_fAlias, login_fNum);

    login_input.addEventListener("input", function(){
        let login_tempId = login_input.value.toUpperCase().replace(/[^0-9A-Z]/g, '');

        let login_birthYear = login_tempId.slice(0, 2).replace(/[^0-9]/g, '');
        let login_alias = login_tempId.slice(2, 4).replace(/[^A-Z]/g, '');
        let login_phoneNum = login_tempId.slice(4, 8).replace(/[^0-9]/g, '');

        login_fAnnee.innerText = (login_birthYear.length === 2 ) ? "✔ Année | " : "✘ 2 chiffres | ";
        login_fAnnee.style.color = (login_birthYear.length === 2 ) ? "green" : "red";

        login_fAlias.innerText = (login_alias.length === 2 ) ? "✔ Initiales | " : "✘ 2 lettres  | ";
        login_fAlias.style.color = (login_alias.length === 2 ) ? "green" : "red";

        login_fNum.innerText = (login_phoneNum.length === 2 ) ? "✔ Téléphone" : "✘ 2 chiffres";
        login_fNum.style.color = (login_phoneNum.length === 2 ) ? "green" : "red";

        this.value = login_birthYear + login_alias + login_phoneNum;
    });

    let validateBtn = document.createElement("button");
    validateBtn.innerText = "Se connecter";

    /*
    On fait un eventListener qui vérifie si l'identifiant et le mot de passe correspondent en base.
     */
    validateBtn.addEventListener("click", async function (event) {
        event.preventDefault();


        // On vérifie que les champs ne sont pas vides lors de la validation.
        if (login_input.value === "") {
            window.alert("Veuillez rentrez votre identifiant");
            return;
        }

        const result = await envoyerVersServeur('login', {player_id: login_input.value});

        if (result.error) {
            window.alert("Erreur de serveur : " + result.error);
            return;
        }
        else if (!result.exists) {
            window.alert("Identifiant non trouvé");
            return;
        }

        else {
            containerBtn.innerHTML = "";
            trueID = data[0].player_id;




            containerBtn.innerHTML = "";
            let successText = document.createElement("p");
            successText.innerText = "Connexion réussie";

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
    })

    let form_login = document.createElement("form");

    form_login.appendChild(loginText);
    form_login.appendChild(login_input);
    form_login.appendChild(login_feedback);

    form_login.appendChild(validateBtn);

    containerBtn.appendChild(form_login);
}

// On reçoit les informations de chargerScene() et de addVideo() puis on les transmet à la table "responses".
async function getChoiceData(scene, choix){
    currentScene = scene;
    choosedOption = choix;

    const payload = {
        player_id: trueID,
        scene: currentScene,
        choix: choosedOption,
        run_id: run
    };

    const result = await envoyerVersServeur('sauvegarder_choix', payload);

    if (result.error) {
        console.error("Échec de la sauvegarde du choix : " + result.error);
    }
}

async function exportData() {

    const result = await envoyerVersServeur('export', {});

    if (result.error || !result.success) {
        window.alert("Erreur lors de la récupération des données sur le serveur.");
        return;
    }

    const data = result.data;

    const lignesTransformer = {};

    data.forEach(function(ligne) {
        if (!lignesTransformer[ligne.run_id]) {
            lignesTransformer[ligne.run_id] = {
                id_Partie: ligne.run_id,
                Joueurs: ligne.player_id,
                Horodateur: ligne.created_at
            };
        }

        lignesTransformer[ligne.run_id][ligne.scene] = ligne.choix;
    });

    let finalData = Object.values(lignesTransformer);

    let csvRaw = Papa.unparse(finalData, {
        delimiter: ";"
    });

    // On force le séparateur pour Excel
    let textCSV = "sep=;\n" + csvRaw;

    // 5. Téléchargement automatique
    let blob = new Blob([textCSV], { type: "text/csv;charset=utf-8" });
    let exportUrl = URL.createObjectURL(blob);
    let baliseLien = document.createElement("a");
    baliseLien.href = exportUrl;
    baliseLien.setAttribute("download", "resultats_jeu_sciencespo.csv");
    document.body.appendChild(baliseLien);
    baliseLien.click();
    document.body.removeChild(baliseLien);
    URL.revokeObjectURL(exportUrl);
}

let exportBtn = document.getElementById("buttonExport");

if (exportBtn) {
    exportBtn.addEventListener("click",  exportData);
}

function isFullScreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function fullScreen(){
    const elem = document.documentElement;

    if (!isFullScreen()) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        }
        else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen();
        }
        else if (elem.msRequestFullScreen) {
            elem.msRequestFullScreen();
        }
        else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        }
        else {
            window.alert("Votre appareille n'est pas compatible avec la fonction pleine écran, vous pouvez rajouter le site à votre page d'accueil pour un expérience plus immersif");
        }
    }

    else {
        // Sortie du plein écran
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        else if (document.mozCancelFullScreen){
            document.mozCancelFullScreen();
        }
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(()=> console.log("Service worker à été enregistré."))
        .catch(err => console.log("Erreur SW : " + err));
}

let fullScreenBtn = document.getElementById("fullScreen");
if (fullScreenBtn) {
    fullScreenBtn.addEventListener("click", fullScreen);
}