// On crée une variable pour notre client supabase (pour rajouter la base de données dans le code)
// Pour info, le client s'écrit comme ça : const nomDeLaVariable = supabase.createClient('l'url du projet', 'la clé publiable')

let supabaseClient = null;

window.onload = function () {
    //a
    if (typeof supabase === "undefined") {
        window.alert("Supabase n'est pas chargé ! Vérifie ta connexion internet ou le lien du script.");
    }
    else {
        supabaseClient = supabase.createClient('https://qbosijwcfspfexrcxcpa.supabase.co', 'sb_publishable_T1dqF1VvIR-L3ZTSc4LgBQ_uAcJ_jKE');

        // On démarre le jeu avec la scène d'identification
        chargerScene("identification");
    }
}

// On crée toutes les variables dont on aura besoin
let dataChoice;
let trueID;
let gender;
let trueAge;
let mail;
let recontactChoice;

// On crée des variables pour pouvoir envoyer la scène présente et le choix du joueur dans cette scène
let currentScene;
let choosedOption;

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
        this.pause();

        // On va récupérer tous les boutons de la scène et on les met dans une liste
        const hiddenBtnList = document.querySelectorAll('.bouton_cacher');

        // Si des boutons existent, on parcourt la liste des boutons pour les rendre visibles
        if(hiddenBtnList){
            for (let i = 0; i < hiddenBtnList.length; i++) {
                hiddenBtnList[i].style.visibility = "visible";
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
    input.autocomplete = "off";

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

    let sexeText = document.createElement("p");
    sexeText.innerText = "Votre sexe : ";

    /*
    On crée un nouvel élément de sélection qui aura comme id, "sexelist".
    Elle va nous permettre de faire un menu déroulant pour que le joueur choisi son sexe."
     */
    let sexelist = document.createElement("select");
    sexelist.id = "sexelist";

    /*
    on crée un nouvel élément option qui aura comme valeur "Default",
    le contenu de l'option qui sera "Veuillez sélectionner votre sexe."
    et il sera sélectionner par défaut.
     */
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

    let ageText = document.createElement("p");
    ageText.innerText = "Votre âge : ";

    let age = document.createElement("input");
    age.id = "age";
    age.type = "tel";
    age.pattern = "[0-9]{2}";
    age.placeholder = "Veuillez rentrer votre âge";
    age.maxLength = 2;

    let recontactInfo = document.createElement("p");
    recontactInfo.id = "recontactInfo";
    recontactInfo.innerText = "Une nouvelle phase expérimentale se déroulera d'ici quelques semaines (15 minutes, en ligne) ; afin de vous contacter, nous avons besoin de votre adresse mail personnelle.";

    let email = document.createElement("input");
    email.id = "email";
    email.type = "email";
    email.placeholder = "Veuillez rentrer votre adresse mail ";
    email.autocomplete = "email";

    let emailText = document.createElement("p");
    emailText.id = "emailText";
    emailText.innerText = "Votre adresse mail : ";

    let recontact = document.createElement("input");
    recontact.id = "recontact";
    recontact.type = "checkbox";

    let recontactLabel = document.createElement("label");
    recontactLabel.id = "recontactLabel";
    recontactLabel.setAttribute("for", "recontact");

    let recontactText = document.createTextNode("Je consens à être recontacté·e dans les prochaines semaines pour participer à une nouvelle phase de l'expérimentation");

    let btnContainer = document.createElement("div");
    btnContainer.id = "btnContainer";

    let dataChoiceCheck = document.createElement("input");
    dataChoiceCheck.id = "dataChoiceCheck";
    dataChoiceCheck.type = "checkbox";

    let dataChoiceLabel = document.createElement("label");
    dataChoiceLabel.id = "dataChoiceLabel";
    dataChoiceLabel.setAttribute("for", "dataChoiceCheck");

    let dataChoiceText = document.createTextNode("Je consens à transmettre mes données à des fins de recherches et j'ai compris qu'elles seront anonymisées et traitées de manière strictement confidentielle");

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

    form.appendChild(sexeText);
    form.appendChild(sexelist);
    sexeText.appendChild(sexelist);

    form.appendChild(ageText);
    form.appendChild(age);
    ageText.appendChild(age);

    //on met les options "Veuillez sélectionner votre sexe", "Homme", "Femme" et "Ne souhaite pas préciser" dans la liste "sexelist".
    sexelist.appendChild(optionBase);
    sexelist.appendChild(option1);
    sexelist.appendChild(option2);
    sexelist.appendChild(option3);

    form.appendChild(recontactInfo);

    form.appendChild(emailText);
    form.appendChild(email);
    emailText.appendChild(email);

    recontactLabel.appendChild(recontact);
    recontactLabel.appendChild(recontactText);
    form.appendChild(recontactLabel);

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

            if (input.value === "" || input.value.length !== 6 || sexelist.value === "Default" || age.value === "" || age.value.length !== 4 || isNaN(age.value)) {
                window.alert("Merci de remplir tout les champs");
                return;
            }

            trueID = input.value;
            gender = sexelist.value;
            trueAge = age.value;
            mail =  email.value;
            recontactChoice = (recontact.checked) ? "oui" : "non";

            if (!recontact.checked) {
                mail = "";
            }

            /*
             On crée une variable qui permet de transférer nos données à la base de données Supabase.
             Exemple d'insertion :
             const { error } = await supabaseClient.from('nomDeLaTable')
                .insert([
                    {
                        colonneDeLaBase: variableSouhaitée,
                        etc...
                    }
                ]);
             */
            const { error } = await supabaseClient.from('utilisateurs')
                .insert([
                    {
                        player_id: trueID,
                        sexe: gender,
                        age: trueAge,
                        address_mail: mail,
                        recontacter : recontactChoice
                    }
                ]);

            // S'il y a bien une erreur, on l'affiche via un pop-up
            if (error) {
                alert("Erreur lors de l'inscription : " + error.message);
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
    login_fNum.innerText = "✘ 4 chiffres";

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

        login_fNum.innerText = (login_phoneNum.length === 4 ) ? "✔ Téléphone" : "✘ 4 chiffres";
        login_fNum.style.color = (login_phoneNum.length === 4 ) ? "green" : "red";

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

        const { data, error } = await supabaseClient.
        from('utilisateurs').
        select('*'). // On sélectionne toutes les colonnes de la table

            /* Puis, on compare l'identifiant en table avec celui rentré par le joueur. */
            eq('player_id', login_input.value);

        if (error) {
            window.alert("Erreur lors de la connexion : " + error.message);
            return;
        }

        // Si aucune donnée n'est trouvée, l'identifiant n'existe pas.
        else if (!data || data.length === 0) {
            window.alert("Id non trouvé");
            return;
        }

        else {
            containerBtn.innerHTML = "";
            trueID = data[0].player_id;

            /*
            Ici, on ajoute une nouvelle ligne dans la table "responses" pour marquer le début de la partie.
             */
            await supabaseClient.from('responses').insert([
                {
                    player_id: trueID,
                    scene: "connexion",
                    choix: "Connexion réussie",
                    run_id : run
                }
            ])


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

    const { error } = await supabaseClient.from('responses')
        .insert([
            {
                player_id: trueID,
                scene: currentScene,
                choix: choosedOption,
                run_id : run
            }
        ]);

    if (error) {
        alert("Erreur : " + error.message);
    }
}

async function exportData(){

    // On sélectionne les colonnes nécessaires de toute la table.
    const {data, error} = await supabaseClient.from("responses")
        .select(
            'run_id, player_id, scene, choix, utilisateurs(age, sexe, recontacter, address_mail), created_at');

    if (error) {
        window.alert("Erreur : " + error.message);
        return;
    }

    //On crée un objet pour modifier le positionnement des éléments sur exel
    const lignesTransformer = {};

    /* On parcourt chaque ligne de données reçue de la base (data).
    On utilise 'run_id' comme clé pour regrouper toutes les actions d'une même partie.
    */

    data.forEach(function(ligne) {
        // Si la partie (run_id) n'est pas encore enregistrée dans notre objet, on l'initialise
        if (!lignesTransformer[ligne.run_id]) {
            lignesTransformer[ligne.run_id] = {
                id_Partie: ligne.run_id,
                Joueurs: ligne.player_id,
                Sexe: (ligne.utilisateurs && ligne.utilisateurs.sexe) ? ligne.utilisateurs.sexe : "N/A",
                Age: (ligne.utilisateurs && ligne.utilisateurs.age) ? ligne.utilisateurs.age : "N/A",
                Recontacter: (ligne.utilisateurs && ligne.utilisateurs.recontacter) ? ligne.utilisateurs.recontacter : "N/A",
                Email: (ligne.utilisateurs && ligne.utilisateurs.address_mail) ? ligne.utilisateurs.address_mail : "N/A",

                /*
                Nettoyage de l'horodateur :
                1. On remplace le 'T' par un espace.
                2. On coupe la chaîne au point.
                3. On garde la première partie [0].
                */
                Horodateur: ligne.created_at.replace('T', ' ').split('.')[0],
            };
        }

        /*
        On crée une nouvelle colonne avec le nom de la scène et on y stocke le choix du joueur.
        */
        lignesTransformer[ligne.run_id][ligne.scene] = ligne.choix;
    });

    // On transforme l'objet 'lignesTransformer' en liste pour pouvoir exporter
    let finalData = Object.values(lignesTransformer);

    /*
    On utilise la bibliothèque PapaParse pour convertir nos données en format CSV avec le séparateur ";".
     */
    let csvRaw = Papa.unparse(finalData, {
        delimiter: ";"
    });

    // On ajoute une instruction spécifique à Excel pour forcer la reconnaissance du séparateur.
    let textCSV = "sep=;\n" + csvRaw;

    /*
    On crée un "Blob" (un fichier virtuel en mémoire) avec nos données CSV.
     */
    let blob = new Blob([textCSV], { type: "text/csv;charset=utf-8" });

    // On crée un lien pour exporter notre blob
    let exportUrl = URL.createObjectURL(blob);

    /*
    On crée une balise "<a>" invisible qu'on clique automatiquement pour lancer le téléchargement.
     */
    let baliseLien = document.createElement("a");
    baliseLien.href = exportUrl;

    baliseLien.setAttribute("download", "resultats_jeu.csv");

    document.body.appendChild(baliseLien);
    baliseLien.click();
    document.body.removeChild(baliseLien);

    // On supprime l'URL pour libérer de la mémoire.
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