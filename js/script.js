// On crée une variable pour notre client supabase (pour rajouter la base de données dans le code)
// Pour info, le client s'écrit comme ça : const nomDeLaVariable = supabase.createClient('l'url du projet', 'la clé publiable')
const supabaseClient = supabase.createClient('https://qbosijwcfspfexrcxcpa.supabase.co', 'sb_publishable_T1dqF1VvIR-L3ZTSc4LgBQ_uAcJ_jKE')

// On crée toutes les variables dont on aura besoin
let trueID;
let dataChoice;
let mail;
let recontactChoice;

// On crée des variables pour pouvoir envoyer la scène présente et le choix du joueur dans cette scène
let currentScene;
let choosedOption;

// On crée une variable qui va générer un ID aléatoire pour pouvoir stocker plusieurs runs d'un même joueur
const run = crypto.randomUUID();


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
    newVideo.classList.add('video');

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
        data.choix.forEach(unChoix => {
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
        "- La première et la dernière lettre de votre nom de famille<br>" +
        "- les 4 dernièr chiffres de votre numéro de téléphone portable";

    let exemple = document.createElement("p");
    exemple.innerText = "Exemple : Je m'appelle Jean Dupont, je suis né en 1980, mon numéro de téléphone est le : 06****7767"
    exemple.id = "exemple";

    let input = document.createElement("input");
    input.type = "text";
    input.placeholder = "ex : 80DT7767";
    input.maxLength = 8;

    let feedback = document.createElement("p");
    feedback.id = "feedback";

    let fAnnee = document.createElement("span");
    let fAlias = document.createElement("span");
    let fNum = document.createElement("span");

    fAnnee.innerText = "✘ 2 chiffres | ";
    fAlias.innerText = "✘ 2 lettres | ";
    fNum.innerText = "✘ 4 chiffres";

    feedback.append(fAnnee, fAlias, fNum);

    input.addEventListener("input", function(){
        let tempId = input.value.toUpperCase().replace(/[^0-9A-Z]/g, '');

        let birthYear = tempId.slice(0, 2).replace(/[^0-9]/g, '');
        let alias = tempId.slice(2, 4).replace(/[^A-Z]/g, '');
        let phoneNum = tempId.slice(4, 8).replace(/[^0-9]/g, '');

        fAnnee.innerText = (birthYear.length === 2 ) ? "✔ Année | " : "✘ 2 chiffres | ";
        fAnnee.style.color = (birthYear.length === 2 ) ? "green" : "red";

        fAlias.innerText = (alias.length === 2 ) ? "✔ Initiales | " : "✘ 2 lettre  | ";
        fAlias.style.color = (alias.length === 2 ) ? "green" : "red";

        fNum.innerText = (phoneNum.length === 4 ) ? "✔ Téléphone" : "✘ 4 chiffres";
        fNum.style.color = (phoneNum.length === 4 ) ? "green" : "red";

        this.value = birthYear + alias + phoneNum;
    });

    let recontactInfo = document.createElement("p");
    recontactInfo.id = "recontactInfo";
    recontactInfo.innerText = "Une nouvelle phase expérimentale se déroulera d'ici quelques semaines (15 minutes, en ligne) ; afin de vous contacter, nous avons besoin de votre adresse mail personnelle.";

    let email = document.createElement("input");
    email.id = "email";
    email.type = "email";
    email.placeholder = "Veuillez rentrer votre adresse mail ";

    let emailText = document.createElement("p");
    emailText.id = "emailText";
    emailText.innerText = "Mon adresse mail : ";

    let recontact = document.createElement("input");
    recontact.id = "recontact";
    recontact.type = "checkbox";

    let recontactLabel = document.createElement("label");
    recontactLabel.id = "recontactLabel";
    recontactLabel.setAttribute("for", "recontact");
    recontactLabel.innerText = "Je consens à être recontacté·e dans les prochaines semaines pour participer à une nouvelle phase de l'expérimentation";

    let dataChoiceCheck = document.createElement("input");
    dataChoiceCheck.id = "dataChoiceCheck";
    dataChoiceCheck.id = "dataChoice";
    dataChoiceCheck.type = "checkbox";

    let dataChoiceLabel = document.createElement("label");
    dataChoiceLabel.id = "dataChoiceLabel";
    dataChoiceLabel.setAttribute("for", "dataChoiceCheck");
    dataChoiceLabel.innerText = "Je consens à transmettre mes données à des fins de recherches et j'ai compris qu'elles seront anonymisées et traitées de manière strictement confidentielle";

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

    form.appendChild(recontactInfo);

    form.appendChild(emailText);
    form.appendChild(email);
    emailText.appendChild(email);

    form.appendChild(recontact);
    form.appendChild(recontactLabel);

    form.appendChild(dataChoiceCheck);
    form.appendChild(dataChoiceLabel);

    form.appendChild(loginButton);
    form.appendChild(btnValider);

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
            trueID = input.value;
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
                        address_mail: mail,
                        recontacter : recontactChoice
                    }
                ]);

            // S'il y a bien une erreur, on l'affiche via un pop-up
            if (error) {
                alert("Erreur lors de l'inscription : " + error.message);
                return;
            }

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

        /*
        Même sans cocher la case de consentement, le joueur peut accéder au jeu,
        ses données ne seront simplement pas récoltées.
         */
        else {
            chargerScene("intro");
        }
    });
}

async function login() {

    containerBtn.innerHTML = "";

    let introText = document.createElement("h3");
    introText.innerText = "Connexion"

    let loginText = document.createElement("p");
    loginText.innerText = "Identifiant : ";

    let login_input = document.createElement("input");
    login_input.type = "text";
    login_input.placeholder = "ex : 80DT7767";
    login_input.maxLength = 8;

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

        login_fAlias.innerText = (login_alias.length === 2 ) ? "✔ Initiales | " : "✘ 2 lettre  | ";
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
            'run_id, player_id, scene, choix, utilisateurs(recontacter, address_mail), created_at');

    if (error) {
        window.alert("Erreur : " + error.message);
        return;
    }

    //On crée un objet pour modifier le positionnement des éléments sur exel
    const lignesTransformer = {};

    /* On parcourt chaque ligne de données reçue de la base (data).
    On utilise 'run_id' comme clé pour regrouper toutes les actions d'une même partie.
    */

    data.forEach(ligne => {
        // Si la partie (run_id) n'est pas encore enregistrée dans notre objet, on l'initialise
        if (!lignesTransformer[ligne.run_id]) {
            lignesTransformer[ligne.run_id] = {
                id_Partie: ligne.run_id,
                Joueurs: ligne.player_id,
                Recontacter: ligne.utilisateurs?.recontacter || "N/A",
                Email: ligne.utilisateurs?.address_mail || "N/A",

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

// On démarre le jeu avec la scène d'identification
chargerScene("identification");