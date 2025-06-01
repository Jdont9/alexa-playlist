const Alexa = require('ask-sdk-core');

// Base de données des titres et leurs URLs
// Remplacez YOUR_USERNAME et YOUR_REPO par vos vraies valeurs GitHub
const BASE_URL = "https://jdont9.github.io/alexa-playlist/audio/";

const MUSIC_DATABASE = {
    "Table de 1": {
        title: "Table de 1",
        url: BASE_URL + "Apprendre-la-table-de-1.mp3",
        duration: 193000 // en millisecondes
    },
    "Table de 2": {
        title: "Table de 2",
        url: BASE_URL + "Apprendre-la-table-de-2.mp3",
        duration: 193000 // en millisecondes
    },
    "Table de 3": {
        title: "Table de 3",
        url: BASE_URL + "Apprendre-la-table-de-3.mp3",
        duration: 193000 // en millisecondes
    },
    "Table de 4": {
        title: "Table de 4",
        url: BASE_URL + "Apprendre-la-table-de-4.mp3",
        duration: 193000 // en millisecondes
    },
    "Table de 5: {
        title: "Table de 5",
        url: BASE_URL + "Apprendre-la-table-de-5.mp3",
        duration: 193000 // en millisecondes
    },
    "Table de 6": {
        title: "Table de 6",
        url: BASE_URL + "Apprendre-la-table-de-6.mp3",
        duration: 193000 // en millisecondes
    },
    "Table de 7": {
        title: "Table de 7",
        url: BASE_URL + "Apprendre-la-table-de-7.mp3",
        duration: 193000 // en millisecondes
    },
    "Table de 8": {
        title: "Table de 8",
        url: BASE_URL + "Apprendre-la-table-de-8.mp3",
        duration: 193000 // en millisecondes
    },
    "Table de 9": {
        title: "Table de 9",
        url: BASE_URL + "Apprendre-la-table-de-9.mp3",
        duration: 193000 // en millisecondes
    },
    "Table de 10": {
        title: "Table de 10",
        url: BASE_URL + "Apprendre-la-table-de-10.mp3",
        duration: 193000 // en millisecondes
    }

    // Ajoutez facilement vos autres titres ici
};

// Handler pour lancer la skill
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Bienvenue dans votre playlist personnalisée ! Dites-moi quel titre vous voulez écouter.';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Quel titre souhaitez-vous écouter ?')
            .getResponse();
    }
};

// Handler pour jouer un titre spécifique
const PlayMusicIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayMusicIntent';
    },
    handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const titleSlot = slots.titleName.value;
        
        // Recherche du titre dans la base de données
        const songKey = findSongByTitle(titleSlot);
        
        if (songKey && MUSIC_DATABASE[songKey]) {
            const song = MUSIC_DATABASE[songKey];
            
            return handlerInput.responseBuilder
                .speak(`Lecture de ${song.title}`)
                .addAudioPlayerPlayDirective(
                    'REPLACE_ALL',
                    song.url,
                    songKey,
                    0,
                    null
                )
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak('Désolé, je n\'ai pas trouvé ce titre. Pouvez-vous répéter ?')
                .reprompt('Quel titre souhaitez-vous écouter ?')
                .getResponse();
        }
    }
};

// Handler pour lister tous les titres disponibles
const ListMusicIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListMusicIntent';
    },
    handle(handlerInput) {
        const titles = Object.values(MUSIC_DATABASE).map(song => song.title);
        const titlesList = titles.join(', ');
        
        const speakOutput = `Voici les titres disponibles : ${titlesList}. Lequel souhaitez-vous écouter ?`;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Quel titre souhaitez-vous écouter ?')
            .getResponse();
    }
};

// Handlers pour contrôler la lecture
const PauseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .getResponse();
    }
};

const ResumeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent';
    },
    handle(handlerInput) {
        // Récupérer l'état de lecture précédent depuis la session
        const token = handlerInput.requestEnvelope.context.AudioPlayer.token;
        const offsetInMilliseconds = handlerInput.requestEnvelope.context.AudioPlayer.offsetInMilliseconds;
        
        if (token && MUSIC_DATABASE[token]) {
            return handlerInput.responseBuilder
                .addAudioPlayerPlayDirective(
                    'REPLACE_ALL',
                    MUSIC_DATABASE[token].url,
                    token,
                    offsetInMilliseconds,
                    null
                )
                .getResponse();
        }
        
        return handlerInput.responseBuilder
            .speak('Aucune musique en cours. Dites-moi quel titre vous voulez écouter.')
            .getResponse();
    }
};

// Handler pour les événements AudioPlayer
const AudioPlayerEventHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
    },
    handle(handlerInput) {
        const audioPlayerEventName = handlerInput.requestEnvelope.request.type.substring(12);
        
        switch (audioPlayerEventName) {
            case 'PlaybackStarted':
                console.log('Lecture commencée');
                break;
            case 'PlaybackFinished':
                console.log('Lecture terminée');
                break;
            case 'PlaybackStopped':
                console.log('Lecture arrêtée');
                break;
            case 'PlaybackFailed':
                console.log('Erreur de lecture');
                break;
        }
        
        return handlerInput.responseBuilder.getResponse();
    }
};

// Fonction utilitaire pour rechercher un titre
function findSongByTitle(searchTitle) {
    if (!searchTitle) return null;
    
    const normalizedSearch = searchTitle.toLowerCase();
    
    for (const [key, song] of Object.entries(MUSIC_DATABASE)) {
        if (song.title.toLowerCase().includes(normalizedSearch) || 
            key.toLowerCase().includes(normalizedSearch)) {
            return key;
        }
    }
    
    return null;
}

// Handler d'aide
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Vous pouvez me demander de jouer un titre en disant "joue relaxation" ou "liste les titres" pour voir tous les titres disponibles.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// Handler de sortie
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Au revoir !';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addAudioPlayerStopDirective()
            .getResponse();
    }
};

// Handler d'erreur
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Désolé, j\'ai eu un problème. Pouvez-vous répéter ?';
        console.log(`Error: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// Export du handler principal
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayMusicIntentHandler,
        ListMusicIntentHandler,
        PauseIntentHandler,
        ResumeIntentHandler,
        AudioPlayerEventHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
