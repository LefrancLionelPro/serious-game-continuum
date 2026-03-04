// On crée une variable pour notre client supabase (pour rajouter la base de données dans le code)
// Pour info, le client s'écrit comme ça : const nomDeLaVariable = supabase.createClient('l'url du projet', 'la clé publiable')
const supabaseClient = supabase.createClient('https://qbosijwcfspfexrcxcpa.supabase.co', 'sb_publishable_T1dqF1VvIR-L3ZTSc4LgBQ_uAcJ_jKE')

// On crée toutes les variables dont on aura besoin
let trueID;
let prenom;
let annee;
let sexe;
let mdp;
let dpt;
let dataChoice;

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

    // On crée un nouvel élément paragraphe qui aura comme texte "Votre prénom"
    let prenomText = document.createElement("p");
    prenomText.innerText = "Votre prénom";

    /*
    On crée un nouvel élément de saisie qui aura comme ID "inputPrenom",
    le type "text" et le contenu de la saisie sera "Entrez votre prénom."
     */
    let inputPrenom = document.createElement('input');
    inputPrenom.id = "inputPrenom";
    inputPrenom.type = "text";
    inputPrenom.placeholder = "Entrez votre prénom";

    let mdpText = document.createElement("p");
    mdpText.innerText = "Votre mot de passe";

    let motDePasse = document.createElement("input");
    motDePasse.type = "password";
    motDePasse.id = "motDePasse";
    motDePasse.placeholder = "Veuillez rentrer un mot de passe";

    let revealPwdCheck = document.createElement("button");
    revealPwdCheck.innerText = "voir mot de passe"

    /*
    On fait un eventListener pour que, lorsque le joueur clique sur le bouton "voir mot de passe",
    le mot de passe soit visible.
     */
    revealPwdCheck.addEventListener("click", function(event){
        event.preventDefault(); // Permet de ne pas recharger la page (ce qui réinitialiserait tout le code)

        // On va prendre la saisie qui possède l'ID "motDePasse" qu'on vient de créer
        var checked = document.getElementById("motDePasse");

        /*
        Si le type de la saisie est "password", alors on le transforme en texte,
        ce qui permet de révéler le texte.
        */
        if (checked.type === "password") {
            checked.type = "text";
        }

        // Sinon on fait l'inverse
        else {
            checked.type = "password";
        }
    })


    let sexeText = document.createElement("p");
    sexeText.innerText = "Votre sexe";

    /*
    On crée un nouvel élément de sélection qui aura comme ID "sexelist".
    Il va nous permettre de faire un menu déroulant pour que le joueur choisisse son sexe.
     */
    let sexelist = document.createElement("select");
    sexelist.id = "sexelist";

    /*
    On crée un nouvel élément option qui aura comme valeur "Default",
    le contenu de l'option sera "Veuillez sélectionner votre sexe."
    et il sera sélectionné par défaut.
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

    let birthYearText = document.createElement("p");
    birthYearText.innerText = "Votre année de naissance";

    /*
    On crée un nouvel élément de saisie qui aura comme type "tel" (pour éviter de taper des lettres).
    Pour une raison que j'ignore, le type "number" outrepassait mes restrictions.
    Il possédera comme pattern "[0-9]{4}",
    [0-9] vérifie qu'il ne tape que des chiffres et
    {4} vérifie qu'il tape exactement 4 chiffres.
     */
    let birthYear = document.createElement("input");
    birthYear.type = "tel";
    birthYear.pattern = "[0-9]{4}";
    birthYear.placeholder = "Entrez votre année de naissance";
    birthYear.maxLength = 4;

    /*
    On crée un nouvel élément de saisie qui aura comme type "tel" (pour éviter de taper des lettres).
    Pour une raison que j'ignore, le type "number" outrepassait mes restrictions.
    Il possédera comme pattern "[0-9]{4}",
    - [0-9] : vérifie qu'il ne tape que des chiffres et
    - {4} : vérifie qu'il tape au moins 4 chiffres.
     */
    let dptText = document.createElement("p");
    dptText.innerText = "Le numéro de votre département";

    let department = document.createElement("input");
    department.type = "text";
    department.placeholder = "Entrez le numéro de votre département";
    department.maxLength = 3;

    /*
    On crée un regex un peu complexe (l'équivalent du pattern en HTML).
    "[0-9]{2}" : pour la France métropolitaine
    "/" : délimiteurs
    "^" : sert à informer que le regex commence ici.
    "$" : sert à informer que le regex finit ici.
    "|" : porte logique OU (équivalent de || en JS).
    "2A|2B" : pour la Corse, accepte les lettres uniquement dans ce cas précis.
    "[0-9]{3}" : pour les Départements et Régions d'Outre-Mer (DROM)
     */
    const dptRegex = /^([0-9]{2}|2A|2B|[0-9]{3})$/;

    let dataChoiceCheck = document.createElement("input");
    dataChoiceCheck.id = "dataChoice";
    dataChoiceCheck.type = "checkbox";

    let dataChoiceText = document.createElement("p");
    dataChoiceText.innerText = "Je consens à transmettre mes données à des fins de recherches"

    let loginButton = document.createElement("button");
    loginButton.id = "bouton_login";
    loginButton.innerHTML = "J'ai déjà un identifiant et je me connecte"

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

    // On met tous les éléments créés ci-dessus dans notre formulaire
    form.appendChild(formIntro);

    form.appendChild(prenomText);
    form.appendChild(inputPrenom);

    form.appendChild(sexeText);
    form.appendChild(sexelist);

    // On met les options dans la liste "sexelist".
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

    // On met le formulaire qui possède désormais tous les éléments dans le conteneur de boutons
    containerBtn.appendChild(form);

    /*
    On fait un eventListener :
    lorsque le joueur clique sur le bouton, on transmet les données du joueur à la base de données.
     */
    btnValider.addEventListener("click", async function (event){
        event.preventDefault();

        /*
        On prend la valeur de "inputPrenom" et on crée une variable
        qui contiendra le prénom tout en minuscules.
         */
        let nameValue = inputPrenom.value.trim().toLowerCase();

        /*
        On prend la valeur de "inputPrenom" et on crée une variable
        qui contiendra la première lettre du prénom en majuscule.
         */
        let lettre = nameValue.charAt(0).toUpperCase();

        /*
        On prend la valeur de "department" et on crée une variable
        qui contiendra le numéro du département tout en majuscules (pour le cas de la Corse).
         */
        let dptValue = department.value.toUpperCase();

        // On concatène la première lettre du prénom en majuscule avec le reste en minuscules
        prenom = lettre + nameValue.slice(1); // On retire la première lettre de "nameValue"
        mdp = motDePasse.value;
        sexe = sexelist.value;
        annee = birthYear.value;
        dpt = dptValue;
        dataChoice = dataChoiceCheck.checked;

        /*
        On génère un identifiant pour le joueur.
        L'identifiant est la première lettre du prénom + l'année de naissance + le numéro du département de naissance.
        On crée ensuite une variable qui génère une chaîne de caractères aléatoire.
        On prend uniquement les 4 derniers caractères :
            - pour replace(/-/g, '') :
                - "/-/" : c'est du regex, on sélectionne le caractère "-" présent dans varID.
                - "g" : g pour global, la sélection se fait sur tout le contenu.
                - "," : délimiteur.
                - "''" : on remplace par rien, ce qui équivaut à supprimer.
            - slice(-4) : prend les 4 derniers caractères.
        Exemple :
        Dans le cas de Toto né en 1980 en Haute-Corse, son identifiant serait : T19802Bd5f4
         */
        const varID = crypto.randomUUID().replace(/-/g, '').slice(-4);

        trueID = lettre + annee + dpt + varID;

        // On transmet les données du joueur dans la base de données uniquement s'il coche la case de consentement
        if (dataChoice) {

            /*
            On vérifie chaque possibilité pour empêcher les joueurs de rentrer des saisies invalides :
                - On vérifie que le champ du prénom n'est pas vide.
                - On vérifie que le numéro du département de naissance n'est pas vide.
                - On vérifie que le regex du département n'est pas faux.
                - On vérifie que le champ de la date de naissance n'est pas vide.
                - On vérifie que le champ de la date de naissance possède bien 4 chiffres.
                - On vérifie que le champ de la date de naissance ne possède pas de lettres.
                - On vérifie que sexelist n'a pas été laissée sur "Veuillez sélectionner votre sexe".
             Si l'utilisateur n'a pas respecté ces conditions, un pop-up s'affiche.
             */
            if (inputPrenom.value === "" || department.value === "" || !dptRegex.test(department.value) || birthYear.value === "" || birthYear.value.length !== 4 || isNaN(birthYear.value) || sexelist.value === "Veuillez sélectionner votre sexe") {
                window.alert("veuillez remplir le formulaire correctement");
                return;
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
                        name: prenom,
                        password: mdp,
                        gender: sexe,
                        birth_year: annee
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

    /*
    On fait un eventListener qui vérifie si l'identifiant et le mot de passe correspondent en base.
     */
    validateBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        // On vérifie que les champs ne sont pas vides lors de la validation.
        if ((login_input.value === "") || (pwd_input.value === "")) {
            window.alert("Veuillez remplir tous les champs");
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
        if (!data || data.length === 0) {
            window.alert("Id non trouvé");
            return;
        }

        /*
        Sinon, si le mot de passe est correct, on transfère les données de l'utilisateur dans nos variables.
        Le "[0]" permet d'indiquer qu'on veut la première ligne (Supabase renvoie une liste).
         */
        else if (data[0].password === pwd_input.value) {
            containerBtn.innerHTML = "";
            trueID = data[0].player_id;
            prenom = data[0].name;
            annee = data[0].birth_year;
            sexe = data[0].gender;

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
        .select('run_id, player_id, scene, choix, created_at');

    if (error) {
        window.alert("Erreur : " + error.message);
        return;
    }

    /* On parcourt chaque ligne de données reçue de la base (data).
    On utilise 'run_id' comme clé pour regrouper toutes les actions d'une même partie.
    */
    data.forEach(ligne => {
        // Si la partie (run_id) n'est pas encore enregistrée dans notre objet, on l'initialise
        if (!lignesTransformer[ligne.run_id]) {
            lignesTransformer[ligne.run_id] = {
                id_Partie: ligne.run_id,
                Joueurs: ligne.player_id,
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