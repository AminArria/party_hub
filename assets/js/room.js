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


document.addEventListener("DOMContentLoaded", function() {
    if (access_token) {
        Twilio.Video.connect(access_token, {
            audio: false,
            video: false,
            name: room_name,
            automaticSubscription: true
        }).then(room => {
            console.log("Connected to Room: ${room.name}");

            room.on('trackSubscribed', function(track) {
                console.log('Subscribed to RemoteTrack:', track.sid);
                document.getElementById('remote-media-div').appendChild(track.attach());
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
        });
    }
});
