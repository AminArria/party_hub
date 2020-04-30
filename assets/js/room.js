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

function subscribeTo() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/party/subscribe", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        room_name: room_name,
        user: identity,
        subscriptions: subscriptions
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
        console.log(`Disconnected from Room: ${room.name}`);
        partyEnd();
        room.disconnect();
        room.localParticipant.tracks.forEach((publishTrack) => {
            publishTrack.track.stop();
        });
    });
}


function insertParticipant(participant) {
    console.log(participant.identity + ' joined the Room');
    const party_members = document.getElementById('party-members');

    var new_member_name = participant.identity.slice(0,-11);

    new_member = document.createElement("p");
    new_member.id = participant.identity;
    new_member.classList.add("panel-block");

    new_member.innerHTML =
        `<span class="panel-icon">
            <i class="fas fa-user" aria-hidden="true"></i>
        </span>
        <span>${new_member_name}</span>
        <button class="watch button is-info is-small has-text-weight-bold hidden">Watch</button>
        <button class="unwatch button is-warning is-small has-text-weight-bold hidden">Unwatch</button>`

    publishedTrack = false;
    watch_button = new_member.getElementsByClassName("watch")[0]
    unwatch_button = new_member.getElementsByClassName("unwatch")[0]

    participant.on('trackPublished', () => {
        if(!publishedTrack) {
            publishTrack = true;
            watch_button.classList.remove("hidden");

            watch_button.addEventListener("click", () => {
                subscriptions.push({"type": "include", "publisher": participant.identity});
                subscribeTo();
                watch_button.classList.add("hidden");
                unwatch_button.classList.remove("hidden");
            });

            unwatch_button.addEventListener("click", () => {
                publishedTrack = false;
                subscriptions = subscriptions.filter((sub) => sub.publisher !== participant.identity);
                subscribeTo();
                watch_button.classList.remove("hidden");
                unwatch_button.classList.add("hidden");
            });
        }
    });

    participant.on('trackUnpublished', () => {
        publishedTrack = false;
        watch_button.classList.add("hidden");
        unwatch_button.classList.add("hidden");
        subscriptions = subscriptions.filter((sub) => sub.publisher !== participant.identity);
    });

    party_members.appendChild(new_member);
}

function selfStartTrack(room) {

    start_share.addEventListener('click', () => {
        Twilio.Video.createLocalTracks({
            audio: true,
            video: true,
        }).then(function(localTracks) {
            room.localParticipant.publishTracks(localTracks).then(() => {
                console.log('Started sending video and audio tracks');
                start_share.classList.add('hidden');
                stop_share.classList.remove('hidden');
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
        start_share.classList.remove('hidden');
        stop_share.classList.add('hidden');
    });
}

function roomHandlers(room) {
    selfDisconnect(room);

    if (!room.localParticipant.isDj) {
        selfStartTrack(room);
        selfStopTrack(room);
    }
};

function partyInit() {
    party_banner.classList.remove("is-fullheight");
    party_welcome.textContent = `Welcome to the party ${name}!`;

    party_stuff.classList.remove("hidden");
    leave_party.classList.remove("hidden");
    start_share.classList.remove("hidden");
    party.classList.remove("hidden");

    stop_share.classList.add("hidden");
    start_party.classList.add('hidden');
}

function partyEnd() {
    party_banner.classList.add("is-fullheight");
    party_welcome.textContent = "";

    party_stuff.classList.add("hidden");
    party.classList.add("hidden");
    start_party.classList.remove('hidden');
}

function connectToRoom() {
    Twilio.Video.connect(access_token, {
        audio: false,
        video: false,
        name: room_name,
        automaticSubscription: false
    }).then(room => {
        console.log(`Connected to Room: ${room.name}`);

        room.localParticipant.isDj = false;
        partyInit();
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
    party_banner = document.getElementById("party-banner");
    party_welcome = document.getElementById("party-welcome");
    party_stuff = document.getElementById("party-stuff");
    leave_party = document.getElementById("leave-party");
    start_share = document.getElementById("start-share");
    stop_share = document.getElementById("stop-share");
    party = document.getElementById("party");

    subscriptions = [];

    if (start_party) {
        start_party.addEventListener("submit", connectToParty);
    }
});
