import { useEffect, useRef, useState } from "react";
import Button from "./components/Button";
interface Transcript {
  text: string,
  timestamp: string
}
function App() {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const webrtcIdRef = useRef<string>("");
  const [audioTranscript, setAudioTranscript] = useState<Transcript[]>([]);

  useEffect(() => {
    // Initialize RTCPeerConnection
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ]
    });

    // Cleanup function
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  const setupWebRTC = async () => {
    const streams: MediaStream[] = []

    if (!peerConnectionRef.current){
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
        ]
      });
    }

    try {
      if (!peerConnectionRef.current) return;

      // Get user media
      const audioStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
      });
  
      streams.push(audioStream)

      audioStream.getAudioTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, audioStream)

        track.onended = () => {
          console.log("Audio track ended");
          
        }
      })

      // Handle incoming tracks
      peerConnectionRef.current.ontrack = (event) => {
        if (audioRef.current && event.track.kind === 'audio') {
          if (audioRef.current.srcObject !== event.streams[0]) {
            audioRef.current.srcObject = event.streams[0];
          }
        }
      };

      // Create data channel
      const channelId = Math.floor(Math.random() * 65535);
      dataChannelRef.current = peerConnectionRef.current.createDataChannel(
        "text", 
        { ordered: true, id: channelId }
      );

      // Data channel handlers
      // dataChannelRef.current.onopen = () => {
      //   console.log("Data channel opened");
      // };

      // dataChannelRef.current.onmessage = (event) => {
      //   console.log("Received message:", event.data);
      // };

      // dataChannelRef.current.onclose = () => {
      //   console.log("Data channel closed");
      // };

      // Generate unique ID for this session
      webrtcIdRef.current = Math.random().toString(36).substring(2, 9);

      // Create and send offer
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      await peerConnectionRef.current.setLocalDescription(offer);

      // ICE candidate handler
      peerConnectionRef.current.onicecandidate = ({ candidate }) => {
        if (candidate) {
          fetch('http://127.0.0.1:8000/webrtc/offer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidate: candidate.toJSON(),
              webrtc_id: webrtcIdRef.current,
              type: "ice-candidate",
            })
          }).catch(err => console.error("Error sending ICE candidate:", err));
        }
      };

      // Send offer to server
      const response = await fetch('http://127.0.0.1:8000/webrtc/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sdp: offer.sdp,
          type: offer.type,
          webrtc_id: webrtcIdRef.current
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const serverResponse = await response.json();
      console.log("Server response - ",serverResponse);
      
      await peerConnectionRef.current.setRemoteDescription(serverResponse);

      const eventSource = new EventSource('http://127.0.0.1:8000/transcript?webrtc_id=' + webrtcIdRef.current)
      eventSource.addEventListener("output",(event) => {
        const now = new Date();
        const timestamp = now.toLocaleTimeString();
        setAudioTranscript((prevTranscript) => 
          [...prevTranscript,
            {text: event.data, timestamp}
          ]);
        });

        console.log(audioTranscript);     
      

    } catch (error) {
      console.error("Error setting up WebRTC:", error);
    }
  };

  return (
    <main className="h-screen w-full">
      <section className="border py-4 px-2">
        <h1 className="text-4xl font-bold">Screen Transcriber</h1>
      </section>

      <section className="h-1/3 w-full">
        <audio ref={audioRef} playsInline autoPlay></audio>
      </section>

      <section>
        {audioTranscript.map((entry,index) => (
          <li key={index} className="border-b pb-2">
            <span>[{entry.timestamp}]</span>
            <span>{entry.text}</span>
          </li>
        ))}
      </section>

      <section>
        <div className="flex gap-4">
          <Button handleClick={setupWebRTC}>Start</Button>
        </div>
      </section>
    </main>
  );
}

export default App;