const Alexa = require('ask-sdk-core');

// Base de données des titres et leurs URLs
const MUSIC_DATABASE = {
    "relaxation": {
        title: "Musique de Relaxation",
        url: "https://votre-domaine.com/audio/relaxation.mp3",
        duration: 300000 // en millisecondes
    },
    "meditation": {
        title: "Méditation Guidée",
        url: "https://votre-domaine.com/audio/meditation.mp3",
        duration: 600000
    },
    "nature": {
        title: "Sons de la Nature",
        url: "https://votre-domaine.com/audio/nature.mp3",
        duration: 1200000
    }
    // Ajoutez vos autres titres ici
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
