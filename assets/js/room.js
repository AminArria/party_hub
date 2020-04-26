const query_params = new URLSearchParams(window.location.search);
const room_name = query_params.get("room_id");
const identity = query_params.get("identity");
const access_token = query_params.get("token");

function subscribeToDj() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/party/subscribe_dj", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        room_name: room_name,
        user: identity
    }));
}

function selfDisconnect(room) {
    // Listen to the "beforeunload" event on window to leave the Room
    // when the tab/browser is being closed.
    window.addEventListener('beforeunload', () => room.disconnect());
    // iOS Safari does not emit the "beforeunload" event on window.
    // Use "pagehide" instead.
    window.addEventListener('pagehide', () => room.disconnect());

    leave_party = document.getElementById('leave-party');
    leave_party.addEventListener("click", () => room.disconnect());
}

function roomHandlers(room) {
    selfDisconnect(room);
};

function connectToParty() {
    Twilio.Video.connect(access_token, {
        audio: false,
        video: false,
        name: room_name,
        automaticSubscription: true
    }).then(room => {
        console.log("Connected to Room: ${room.name}");
        roomHandlers(room);

        room.on('trackSubscribed', function(track) {
            console.log('Subscribed to RemoteTrack:', track.sid);
            document.getElementById('remote-media-div').appendChild(track.attach());
        });

        room.on('trackUnsubscribed', function(track) {
            const attachedElements = track.detach();
            attachedElements.forEach(element => element.remove());
        });

        // If there's no one I'm the DJ now
        if (room.participants.size === 0) {
            Twilio.Video.createLocalTracks({
                audio: {name: "dj_audio"},
                video: { name: "dj_video" }
            }).then(function(localTracks) {
                room.localParticipant.publishTracks(localTracks).then(() => {
                    console.log("Published my track for DJ'ing");
                });
            });
        } else {
            subscribeToDj();
        }

        // TODO: do we need this?
        // handle disconnections
        room.on('disconnected', room => {
            // Detach the local media elements
            room.localParticipant.tracks.forEach(publication => {
              const attachedElements = publication.track.detach();
              attachedElements.forEach(element => element.remove());
            });
        });
        room.on('participantDisconnected', function(participant) {
            console.log(participant.identity + ' left the Room');
        });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    start_party = document.getElementById('start-party');
    if (start_party) {
        start_party.addEventListener("click", connectToParty);
    }
});
