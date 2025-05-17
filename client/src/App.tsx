import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useAudio } from "./lib/stores/useAudio";
import AppleGame from "./AppleGame";
import '@fontsource/inter';

function App() {
  const [loaded, setLoaded] = useState(false);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Load audio assets
  useEffect(() => {
    const loadAudioAssets = async () => {
      try {
        // Create audio elements
        const bgMusic = new Audio("/sounds/background.mp3");
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        
        const hitSfx = new Audio("/sounds/hit.mp3");
        const successSfx = new Audio("/sounds/success.mp3");
        successSfx.volume = 0.5;
        
        // Register audio elements with the store
        setBackgroundMusic(bgMusic);
        setHitSound(hitSfx);
        setSuccessSound(successSfx);
        
        // Mark as loaded
        setLoaded(true);
      } catch (error) {
        console.error("Failed to load audio assets:", error);
        // Continue without audio
        setLoaded(true);
      }
    };

    loadAudioAssets();
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  if (!loaded) {
    return (
      <div className="loading-screen">
        <h1>Загрузка...</h1>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AppleGame />
    </div>
  );
}

export default App;
