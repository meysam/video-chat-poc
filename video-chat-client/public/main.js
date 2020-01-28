import socket from "./socket"
import Peer from 'simple-peer'

const video = document.querySelector('video')

//get stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        var offer = null;
        var peer = null;
        socket.connect();
        video.srcObject = stream
        video.play()

        //used to initialize a peer (called for the first peer)
        function InitPeer() {
            peer = new Peer({ initiator: true, stream: stream, trickle: false });
            peer.on('signal', data => {
                offer = data;
                console.log('signal called', data);
            });
            
            peer.on('stream', stream => {                
                CreateVideo(stream);
            });
        }

        // create the second peer (not initiator)
        function CreateSecondPeer() {
            peer = new Peer({ initiator: false, stream: stream, trickle: false });
            peer.on('signal', data => {
                console.log("signal called for second peer", data);
                socket.emit('Answer', data);
            });

            peer.on('stream', stream => {            
                CreateVideo(stream);
            });
        }

        // called for the first peer to notify the joining of the second peer
        function RemotePeerAdded() {
            socket.emit('Offer', offer);
        }

        // called for the second peer
        function OfferArrived(offer) {
            console.log("offer arrived", offer);
            peer.signal(offer);
        }

        // called for the first peer
        function AnswerArrived(answer) {
            console.log('answer arrived');
            peer.signal(answer);
        }

        function CreateVideo(stream) {
            CreateDiv()

            let video = document.createElement('video')
            video.id = 'peerVideo'
            video.srcObject = stream
            video.setAttribute('class', 'embed-responsive-item')
            document.querySelector('#peerDiv').appendChild(video)
            video.play()

            video.addEventListener('click', () => {
                if (video.volume != 0)
                    video.volume = 0
                else
                    video.volume = 1
            })

        }

        socket.on('OfferArrived', OfferArrived)
        socket.on('AnswerArrived', AnswerArrived)
        socket.on('InitPeer', InitPeer)
        socket.on('CreateSecondPeer', CreateSecondPeer)
        socket.on('PeerAdded', RemotePeerAdded);

    })
    .catch(err => document.write(err))

function CreateDiv() {
    let div = document.createElement('div')
    div.setAttribute('class', "centered")
    div.id = "muteText"
    div.innerHTML = "Click to Mute/Unmute"
    document.querySelector('#peerDiv').appendChild(div)
}
