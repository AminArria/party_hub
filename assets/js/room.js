// const query_params = new URLSearchParams(window.location.search);
// const room_name = query_params.get("room_name");
// const identity = query_params.get("identity");
// const access_token = query_params.get("token");

function subscribeToDj() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/party/subscribe_dj", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        room_name: room_name,
        user: identity
    }));
}

function subscribeTo(publisher) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/party/subscribe", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        room_name: room_name,
        user: identity,
        publisher: publisher
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
    leave_party.addEventListener("click", () => {
        console.log("Disconnected from Room: ${room.name}");
        room.disconnect();
        room.localParticipant.tracks.forEach((publishTrack) => {
            publishTrack.track.stop();
        });
    });
}

function insertParticipant(participant) {
    console.log(participant.identity + ' joined the Room');
    const party_members = document.getElementById('party-members');

    new_member_li = document.createElement("li");
    new_member_li.id = participant.identity;

    text = document.createTextNode(participant.identity);
    new_member_li.appendChild(text);

    join_button = document.createElement("button")

    participant.on('trackPublished', () => {
        if(join_button.childNodes.length == 0) {
            join_button.addEventListener("click", () => {
                subscribeTo(participant.identity);
            });
            join_button_text = document.createTextNode("Watch");
            join_button.appendChild(join_button_text);
            new_member_li.appendChild(join_button);
        }
    });

    participant.on('trackUnpublished', () => {
        join_button.remove();
    });

    party_members.appendChild(new_member_li);
}

function selfStartTrack(room) {
    const share_party = document.getElementById('start-share');

    share_party.addEventListener('click', () => {
        Twilio.Video.createLocalTracks({
            audio: true,
            video: true,
        }).then(function(localTracks) {
            room.localParticipant.publishTracks(localTracks).then(() => {
                console.log('Started sending video and audio tracks');
                // share_party.style.display = "none";
                // selfStopTrack(room);
            });
        });
    });
}

function selfStopTrack(room) {
    const stop_share_party = document.getElementById('stop-share');

    stop_share_party.addEventListener('click', () => {
        room.localParticipant.tracks.forEach((publishTrack) => {
            room.localParticipant.unpublishTrack(publishTrack.track);
            publishTrack.track.stop();
        });
    });
}

function roomHandlers(room) {
    selfDisconnect(room);

    if (!room.localParticipant.isDj) {
        selfStartTrack(room);
        selfStopTrack(room);
    }
};

function connectToRoom() {
    Twilio.Video.connect(access_token, {
        audio: false,
        video: false,
        name: room_name,
        automaticSubscription: false
    }).then(room => {
        console.log("Connected to Room: ${room.name}");
        room.localParticipant.isDj = false;
        roomHandlers(room);

        room.on('trackSubscribed', function(track) {
            console.log('Subscribed to RemoteTrack:', track.sid);
            document.getElementById('remote-media-div').appendChild(track.attach());
        });

        room.on('trackUnsubscribed', function(track) {
            const attachedElements = track.detach();
            attachedElements.forEach(element => element.remove());
        });

        room.on('participantConnected', insertParticipant);

        // If there's no one I'm the DJ now
        if (room.participants.size === 0) {
            room.localParticipant.isDj = true;

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
            room.participants.forEach(insertParticipant);
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

            document.getElementById(participant.identity).remove();
        });
    });
}

function connectToParty(e) {
    e.preventDefault();

    data = new FormData(start_party)
    name = data.get('party[name]');

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/party/join", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json'
    xhr.onreadystatechange = () => {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status >= 200 && xhr.status < 300) {
            access_token = xhr.response.token;
            room_name = xhr.response.room_name;
            identity = xhr.response.identity;
            connectToRoom();
        } else if (xhr.status >= 400) {
            console.log("There was an error joining the room");
        }
    };

    xhr.send(JSON.stringify({
        name: data.get('party[name]'),
        id: data.get('party[id]')
    }));
}

document.addEventListener("DOMContentLoaded", function() {
    start_party = document.getElementById('start-party');
    if (start_party) {
        start_party.addEventListener("submit", connectToParty);
    }
});
