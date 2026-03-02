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
    Le jeu considère que l'identification et la connextion sont des scènes
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
            On prend unChoix des choix present dans le scénario présent.
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

function afficherFormulaireID() {
    containerBtn.innerHTML = "";

    let form = document.createElement("form");

    let formIntro = document.createElement("h3");
    formIntro.innerText = "Identification";

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
    btnValider.innerHTML = "Créer mon identifiant et/ou commencer";

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

    const {data, error} = await supabaseClient.from("responses")
        .select('run_id, player_id, scene, choix, created_at');

    if (error) {
        window.alert("Erreur : " + error.message);
        return;
    }

    var lignesTransformer = {};

    data.forEach(ligne => {
        if (!lignesTransformer[ligne.run_id]) {
            lignesTransformer[ligne.run_id] = {
                id_Partie: ligne.run_id,
                Joueurs: ligne.player_id,
                Horodateur: ligne.created_at.replace('T', ' ').split('.')[0],
            };
        }

        lignesTransformer[ligne.run_id][ligne.scene] = ligne.choix;
    });

    let finalData = Object.values(lignesTransformer);
    let csvRaw = Papa.unparse(finalData, {
        delimiter: ";"
    });

    let textCSV = "sep=;\n" + csvRaw;

    let blob = new Blob([textCSV], { type: "text/csv;charset=utf-8" });
    let exportUrl = URL.createObjectURL(blob);

    let baliseLien = document.createElement("a");
    baliseLien.href = exportUrl;

    baliseLien.setAttribute("download", "resultats_jeu.csv");

    document.body.appendChild(baliseLien);
    baliseLien.click();
    document.body.removeChild(baliseLien);

    URL.revokeObjectURL(exportUrl);
}

let exportBtn = document.getElementById("buttonExport");

if (exportBtn) {
    exportBtn.addEventListener("click",  exportData);
}

chargerScene("identification");