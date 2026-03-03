//on variable pour notre client supabase (pour rajouter la base de donnée dans le code)
//pour info le client s'écrit comme ça "const nomDeLaVariable = supabase.createClient('l'url du projet'), ('la clé publiable')
const supabaseClient = supabase.createClient('https://qbosijwcfspfexrcxcpa.supabase.co', 'sb_publishable_T1dqF1VvIR-L3ZTSc4LgBQ_uAcJ_jKE')

//on crée tous les variables qu'on aura besoin
let trueID;
let prenom;
let annee;
let sexe;
let mdp;
let dpt;
let dataChoice;

//on crée des variables pour pouvoir envoyer le scéne présent et le choix du joueur dans cette scène
let currentScene;
let choosedOption;

//on crée une variable qui va créer un id aléatoire pour pouvoir stockers plusieurs runs d'un même joueur
const run = crypto.randomUUID();


//on crée nos différentes scènes

/*
Exemple de scène :
    "nom de la scène" : {
    le_source_de_vidéo_présent_dans_la_scène : "assets/video/video.mp4",
        la_scène_qui_sera_jouer_si_le_joueur_ne_fait_rien : "scene_suivante",
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

//on va prendre le conteneur qui possède l'id "conteneur-video" dans le html
const containerVid = document.getElementById("conteneur-video");

//on fait une fonction pour ajouter une vidéo dans une scène
function addVideo(url, afk, scenePresent){

    //on crée un nouvel élément vidéo
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
    On fait un eventListener,
    si la vidéo se termine sans que le joueur à fait pause,
    on dit à la base de données qu'il n'a fait dans cette scène,
    et on envoie le joueur dans un la scène pour les personnes qui n'ont pas choisi.
     */
    newVideo.addEventListener('ended', function(){
        if (afk){
            getChoiceData(scenePresent, "N'a rien fait");
            chargerScene(afk);
        }
    })

    /*
    On fait un eventListener,
    lorsque le joueur clique sur la vidéo, la vidéo se met en pause
     */
    newVideo.addEventListener("click", function (){
        this.pause();

        //on va récupérer tous les boutons de la scène et on les met dans une liste
        const hiddenBtnList = document.querySelectorAll('.bouton_cacher');

        //si des boutons existent, on parcourt la liste des boutons pour les rendre visibles
        if(hiddenBtnList){
            for (let i = 0; i < hiddenBtnList.length; i++) {
                hiddenBtnList[i].style.visibility = "visible";
            }
        }
    });

    //on met cette vidéo dans le conteur vidéo
    containerVid.appendChild(newVideo);
}

//on va prendre le conteneur qui possède l'id "conteneur-boutons" dans le html
const containerBtn = document.getElementById("conteneur-boutons");

//on fait une fonction pour créer les boutons des scènes
function addBouton(texte, cible, scenePresent){

    //on crée un nouvel élément bouton
    let newBtn = document.createElement('button');

    /*
    On rajoute à ce bouton le texte du scénario,
    la classe 'bouton-cacher' pour cacher les boutons avec la fonction aux dessus,
    et on cache les boutons.
     */
    newBtn.innerText = texte;
    newBtn.classList.add('bouton_cacher');
    newBtn.style.visibility = 'hidden';

    /*
    On fait un eventListener,
    lorsque le joueur clique sur un des boutons,
    on transmet ses données à la base de données
    (la scène dans laquelle on est et le choix effectué dans cette scène).
    Enfin, on change de scène.
     */
    newBtn.addEventListener('click',function(){
        getChoiceData(scenePresent, texte);
        chargerScene(cible);
    });

    //on met ce bouton dans le conteneur bouton
    containerBtn.appendChild(newBtn);
}

//on crée une fonction pour pouvoir changer de scène
function chargerScene(idScene) {
    /*
    Pour que ça soit plus simple, j'ai fait des exceptions.
    Le jeu considère que l'identification et la connexion sont des scènes
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

        //on met les données de la scène dans une variable
        const data = scenario[idScene];

        //s'il n'y a pas de donnée, on quitte la fonction
        if (!data) return;

        //on efface les anciens contenu des conteneurs
        containerVid.innerHTML = "";
        containerBtn.innerHTML = "";

        //on utilise la fonction addVideo pour rajouter la vidéo
        addVideo(data.videoSrc, data.afk, idScene);

        /*
            On prend unChoix des choix present dans le scéne présent.
            On transmet le texte de ce choix, la cible et l'identifiant du scéne présent
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

//on crée une fonction pour afficher le formulaire
function afficherFormulaireID() {
    containerBtn.innerHTML = "";

    //on crée un nouvel élément form
    let form = document.createElement("form");

    //on crée un nouvel élément en-tête 3 qui aura comme texte "Identification"
    let formIntro = document.createElement("h3");
    formIntro.innerText = "Identification";

    //on crée un nouvel élément paragraphe qui aura comme texte "Identification"
    let prenomText = document.createElement("p");
    prenomText.innerText = "Votre prénom";

    /*
    on crée un nouvel élément saisi qui aura comme id, "inputPrenom",
    le type "texte" et le contenu du saisi sera "Entrez votre prénom."
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
    On fait un eventListener,
    pour que lorsque le joueur clique sur le bouton "voir mot de passe",
    le mot de passe soit visible.
     */
    revealPwdCheck.addEventListener("click", function(event){
        event.preventDefault(); //permet de ne pas recharger la page (ce qui réinitialiserait tout le code)

        //on va prendre le saisi qui possède l'id "motDePasse" qu'on vient de créer
        var checked = document.getElementById("motDePasse");

        /*
        Si le type du saisi est "mot de passe", alors on le transforme en texte,
        ce qui permet de révéler le texte.
        */
        if (checked.type === "password") {
            checked.type = "text";
        }

        //sinon on fait l'inverse
        else {
            checked.type = "password";
        }
    })


    let sexeText = document.createElement("p");
    sexeText.innerText = "Votre sexe";

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

    let birthYearText = document.createElement("p");
    birthYearText.innerText = "Votre année de naissance";

    /*
    On crée un nouvel élément saisi qui aura comme type "téléphone" (pour éviter de taper des lettres, pour)
    pour une raison que j'ignore, le type "numéro" outrepassait mes restrictions.
    Il possèdera comme pattern "[0-9]{4}",
    [0-9] vérifie qu'il tape que des chiffres et
    {4} vérifie qu'il tape au moins 4 chiffres.
    Le contenu du saisi sera "Entrez votre année de naissance.
    Enfin, la taille maximale du saisi sera 4.
     */
    let birthYear = document.createElement("input");
    birthYear.type = "tel";
    birthYear.pattern = "[0-9]{4}";
    birthYear.placeholder = "Entrez votre année de naissance";
    birthYear.maxLength = 4;

    /*
    On crée un nouvel élément saisi qui aura comme type "téléphone" (pour éviter de taper des lettres, pour)
    pour une raison que j'ignore, le type "numéro" outrepassait mes restrictions.
    Il possèdera comme pattern "[0-9]{4}",
    - [0-9] : vérifie qu'il tape que des chiffres et
    - {4} : vérifie qu'il tape au moins 4 chiffres.
    Le contenu du saisi sera "Entrez votre année de naissance.
    Enfin, la taille maximale du saisi sera 4.
     */
    let dptText = document.createElement("p");
    dptText.innerText = "Le numéro de votre département";

    let department = document.createElement("input");
    department.type = "text";
    department.placeholder = "Entrez le numéro de votre département";
    department.maxLength = 3;

    /*
    On crée un regex un peu complexe (l'équivalent du pattern en html).
    "[0-9]{2}" : pour la France métropolitaine
    "/" : délimiteurs
    "^" : sert à informer que le regex commence ici.
    "$" : sert à informer que le regex fini ici.
    "|" : porte logique OU (équivalent de || en js).
    "2A|2B" : pour la Corse, accepte les lettres uniquement dans ce cas précis.
    "[0-9]{3}" : pour Les Départements et Régions d'Outre-Mer (DROM)
     */
    const dptRegex = /^([0-9]{2}|2A|2B|[0-9]{3})$/;

    let dataChoiceCheck = document.createElement("input");
    dataChoiceCheck.id = "dataChoice";
    dataChoiceCheck.type = "checkbox";

    let dataChoiceText = document.createElement("p");
    dataChoiceText.innerText = "Je consens à transmettre mes données à des fins de recherches"

    let loginButton = document.createElement("button");
    loginButton.id = "bouton_login";
    loginButton.innerHTML = "J'ai déja un identifiant et je me connecte"

    /*
    On fait un eventListener,
    lorsque le joueur clique sur le bouton,
    on charge le formulaire du login
     */
    loginButton.addEventListener("click", function(event) {
        event.preventDefault();

        chargerScene("login");
    })


    let btnValider = document.createElement('button');
    btnValider.innerHTML = "Créer mon identifiant et/ou commencer";

    //on met tous les éléments crée ci-dessus dans notre formulaire
    form.appendChild(formIntro);

    form.appendChild(prenomText);
    form.appendChild(inputPrenom);

    form.appendChild(sexeText);
    form.appendChild(sexelist);

    //on met les options "Veuillez sélectionner votre sexe", "Homme", "Femme" et "Ne souhaite pas préciser" dans la liste "sexelist".
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

    //on met le formulaire qui possède désormais tous les éléments dans le conteneur de bouton
    containerBtn.appendChild(form);

    /*
    On fait un eventListener,
    lorsque le joueur clique sur le bouton, on transmet les données du joueur à la base de données
     */
    btnValider.addEventListener("click", async function (event){
        event.preventDefault();

            /*
            on prend la valeur de "inputPrenom" et créer une variable
            qui contiendra le prénom tout en minuscule
             */
            let nameValue = inputPrenom.value.trim().toLowerCase();

            /*
            on prend la valeur de "inputPrenom" et créer une variable
            qui contiendra la première lettre du prénom en majuscule
             */
            let lettre = nameValue.charAt(0).toUpperCase();

            /*
            on prend la valeur de "department" et créer une variable
            qui contiendra le numéro du département tout en majuscule (pour le cas de la Corse).
             */
            let dptValue = department.value.toUpperCase();

            //on concatène la première lettre du prénom en majuscule avec le reste en miniscule
            prenom = lettre + nameValue.slice(1); //on retire la première lettre de "nameValue"
            mdp = motDePasse.value;
            sexe = sexelist.value;
            annee = birthYear.value;
            dpt = dptValue;
            dataChoice = dataChoiceCheck.checked;

            /*
            On génère un identifiant pour le joueur,
            l'identifiant est la première lettre du prénom + l'année de naissance + le numéro du département de naissance.
            On crée ensuite une variable qui génère une chaîne de caractère aléatoire (mélange de lettre majuscule, minuscule et de chiffre).
            On prend uniquement les 4 dernièr caractères :
                - pour replace(/-/g, '') :
                    - "/-/" : c'est encore du regex, on sélectionne le caractère "-" présent dans varID.
                    - "g" : g pour global, la sélection se fait sur tout le contenu de varID.
                    - "," : délimiteur, à gauche, on a la valeur qu'on veut sélectionner et à droite par celle qu'on veut la remplacer.
                    - "''" : on remplace par rien, ce qui équivaut à supprimer.
                - slice(-4) : prend les 4 dernière caractères
            Exemple :
            Dans le cas de Toto nès en 1980 en Haute-Corse, son identifiant serait : T19802Bd5f4
             */
            const varID = crypto.randomUUID().replace(/-/g, '').slice(-4);

            trueID = lettre + annee + dpt + varID;

            //on transmet les données du joueur dans la base de donnée uniquement s'il appuie sur le checkbox de consentement
            if (dataChoice) {

                /*
                On vérifie chaque possibilité pour empêcher les joueurs de rentrer des saisies invalides :
                    - On vérifie que le champ du prénom n'est pas vide.
                    - On vérifie que du numéro du département de naissance n'est pas vide.
                    - On vérifie que le regex du département n'est pas fausse.
                    - On vérifie que le champ de la date de naissance n'est pas vide.
                    - On vérifie que le champ de la date de naissance possède bien 4 chiffres.
                    - On vérifie que le champ de la date de naissance ne possède pas de lettres.
                    - On vérifie que sexelist n'a pas été laissée sur "Veuillez sélectionner votre sexe".
                 Si l'utilisateur n'a pas respecté ces conditions, un pop s'affiche pour lui qu'il n'a bien rempli le formulaire.
                 */
                if (inputPrenom.value === "" || department.value === "" || !dptRegex.test(department.value) || birthYear.value === "" || birthYear.value.length !== 4 || isNaN(birthYear.value) || sexelist.value === "Default  ") {
                    window.alert("veuillez remplir le formulaire correctement");
                    return;
                }

                /*
                 On crée une variable qui permet de transférer nos données à la base de données supabase
                 Exemple d'insertion :
                 const { error } = await supabaseClient.from('nomDeLaTable') // on sélectionne la table de la base de données.
                    .insert([
                        {
                            colonneDeLaBase: variableSouhaité,
                            etc...
                        }
                    ]);

                  avec {error} on récupère les erreurs qu'il y a pu avoir durant le transfert
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

                //s'il y a bien une erreur, on l'affiche via un pop-up
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
                acceptBtn.innerHTML = "J'ai noté(é) mon identifiant et je suis prêt(e) à jouer";

                containerBtn.appendChild(text1);
                containerBtn.appendChild(text2);
                containerBtn.appendChild(acceptBtn);

                /*
                on fait un EventListener qui joue la scène d'intro lorsque que le joueur appuie sur
                "J'ai noté(é) mon identifiant et je suis prêt(e) à jouer"
                 */
                acceptBtn.addEventListener("click", function (event) {
                    event.preventDefault();

                    chargerScene("intro");
                });
            }

            /*
            Même si sans cocher la checkbox "Je consens à transmettre mes données à des fins de recherches",
            Il peut tout de même joueur au jeu, ces données ne seront juste pas récolter.
             */
            else {
                chargerScene("intro");
            }
    });
}

async function login() {

    containerBtn.innerHTML = "";

    let introText = document.createElement("h3");
    introText.innerText = "Connection"

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
    On fait un eventListener qui prend l'identifiant et le mot de passe rentré par le joueur et
    regarde celles-ci existent dans la table.
     */
    validateBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        //On vérifie que les champs de l'identifiant ou du mot de passe ne soit pas vide lorsqu'il valide ses saisies.
        if ((login_input.value === "") || (pwd_input.value === "")) {
            window.alert("Veuillez remplir les tout les champs");
            return;
        }

        const { data, error } = await supabaseClient.
            from('utilisateurs').
            select('*'). //on sélectionne tous les utilisateurs de la table

            /*puis, on compare les identifiants de la table avec l'identifiant que le joueur a rentré
            pour essayer de trouver une correspondance*/
            eq('player_id', login_input.value);

        if (error) {
            window.alert("Erreur lors de la connexion : " + error.message);
            return;
        }

        //Si les données n'existent pas ou que la table est vide, on informe l'utilisateur que l'identifiant n'existe pas.
        if (!data || data.length === 0) {
            window.alert("Id non trouvé");
            return;
        }

        /*
        Sinon, si le mot de passe est correct, on transfère tous les données de l'utilisateur dans nos variables.
        Le "[0]" permet d'indiquer qu'on veut la première ligne avec les données de l'utilisateur
        (malgré qu'il n'y qu'une seule ligne qui correspond aux données de l'utilisateur,
        Supabase donne une liste même s'il n'y a qu'une seule ligne donc il faut préciser).
         */
        else if (data[0].password === pwd_input.value) {
            containerBtn.innerHTML = "";
            trueID = data[0].player_id;
            prenom = data[0].name;
            annee = data[0].birth_year;
            sexe = data[0].gender;

            /*
            Ici, on rajoute une nouvelle ligne dans la table "responses" uniquement
            pour indiquer à la table qu'il s'agit d'une nouvelle partie d'un même utilisateur à la table.
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

//on reçoit les informations de chargerScene() et de addVideo() puis on les transmet dans la table "responses".
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

    //On sélectionne les colonnes "run_id, player_id, scene, choix, created_at" de toute la table.
    const {data, error} = await supabaseClient.from("responses")
        .select('run_id, player_id, scene, choix, created_at');

    if (error) {
        window.alert("Erreur : " + error.message);
        return;
    }

    /* On parcourt chaque ligne de données reçue de la base (data).
    On utilise 'run_id' comme clé pour regrouper toutes les actions d'une même partie.
    Si c'est la première fois qu'on croise cet ID, on crée l'entrée de la partie dans notre objet.
    */
    data.forEach(ligne => {
        // Si la partie (run_id) n'est pas encore enregistrée dans notre objet, on l'initialise
        if (!lignesTransformer[ligne.run_id]) {
            lignesTransformer[ligne.run_id] = {
                id_Partie: ligne.run_id,
                Joueurs: ligne.player_id,
                /*
                Nettoyage de l'horodateur (ex: 2024-05-22T14:30:00.123456+00) :
                1. replace('T', ' ') : remplace le T par un espace : 2024-05-22 14:30:00.123456+00
                2. split('.') : coupe la chaîne au point.
                    - Première partie : 2024-05-22 14:30:00
                    - Deuxième partie : 123456+00
                3. [0] : permet de garder que la première partie.
                */
                Horodateur: ligne.created_at.replace('T', ' ').split('.')[0],
            };
        }

        /*
        On crée une nouvelle colonne avec le nom de la scène et on y stocke le choix du joueur.
        Cela permet de voir tout le parcours du joueur sur une seule ligne Excel.
        */
        lignesTransformer[ligne.run_id][ligne.scene] = ligne.choix;
    });

    //On transforme l'objet 'lignesTransformer' en une liste de lignes pour pouvoir exporter
    let finalData = Object.values(lignesTransformer);

    /*
    On utilise la bibliothèque PapaParse pour convertir nos données en format CSV.
    On précise le séparateur ';' pour qu'Excel l'ouvre correctement par défaut
    (par défaut, c'est mis sur "," ce qui est le séparateur anglais).
     */
    let csvRaw = Papa.unparse(finalData, {
        delimiter: ";"
    });

    //On ajoute une instruction spécifique à Excel pour forcer la reconnaissance du séparateur.
    let textCSV = "sep=;\n" + csvRaw;

    /*
    On crée un "Blob" (un fichier virtuel en mémoire) avec nos données CSV.
    On définit que la conversion se fait de text vers csv et que le codage utilisé est l'UTF-8.
     */
    let blob = new Blob([textCSV], { type: "text/csv;charset=utf-8" });

    //on crée un lien pour exporter notre blob
    let exportUrl = URL.createObjectURL(blob);

    /*
    On crée une balise "<a>" invisible qu'on "clique" automatiquement
    pour déclencher le téléchargement du fichier "resultats_jeu.csv".
     */
    let baliseLien = document.createElement("a");
    baliseLien.href = exportUrl;

    baliseLien.setAttribute("download", "resultats_jeu.csv");

    document.body.appendChild(baliseLien); //on intègre le lien au corp du texte
    baliseLien.click(); //on simule un click ici
    document.body.removeChild(baliseLien); //on supprime le lien juste après le clic

    //On supprime l'URL pour libérer de la mémoire.
    URL.revokeObjectURL(exportUrl);
}

let exportBtn = document.getElementById("buttonExport");

if (exportBtn) {
    exportBtn.addEventListener("click",  exportData);
}

//On démarre le jeu avec la toute première scène l'identification
chargerScene("identification");