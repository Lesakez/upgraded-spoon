import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../contexts/GameContext';

const GameMap = () => {
  const canvasRef = useRef(null);
  const { selectedCharacter, moveCharacter } = useGame();
  const [keysPressed, setKeysPressed] = useState({});
  const [otherPlayers, setOtherPlayers] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Game loop
    let animationFrameId;
    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#1A1F2C';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#2C3645';
      const gridSize = 32;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw player
      if (selectedCharacter) {
        const playerX = selectedCharacter.position?.x || canvas.width / 2;
        const playerY = selectedCharacter.position?.y || canvas.height / 2;
        
        // Player character
        ctx.fillStyle = '#4F46E5';
        ctx.beginPath();
        ctx.arc(playerX, playerY, 16, 0, Math.PI * 2);
        ctx.fill();
        
        // Player name
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px MedievalSharp';
        ctx.textAlign = 'center';
        ctx.fillText(selectedCharacter.name, playerX, playerY - 20);
      }

      // Draw other players
      otherPlayers.forEach(player => {
        ctx.fillStyle = '#6366F1';
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, 16, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFF';
        ctx.font = '12px MedievalSharp';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.position.x, player.position.y - 20);
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    // Handle keyboard input
    const handleKeyDown = (e) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedCharacter, otherPlayers]);

  // Handle movement
  useEffect(() => {
    if (!selectedCharacter) return;

    const moveInterval = setInterval(() => {
      let dx = 0;
      let dy = 0;
      const speed = 2;

      if (keysPressed['ArrowUp'] || keysPressed['w']) dy -= speed;
      if (keysPressed['ArrowDown'] || keysPressed['s']) dy += speed;
      if (keysPressed['ArrowLeft'] || keysPressed['a']) dx -= speed;
      if (keysPressed['ArrowRight'] || keysPressed['d']) dx += speed;

      if (dx !== 0 || dy !== 0) {
        const newX = (selectedCharacter.position?.x || 0) + dx;
        const newY = (selectedCharacter.position?.y || 0) + dy;
        const direction = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
        
        moveCharacter(newX, newY, direction);
      }
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(moveInterval);
  }, [keysPressed, selectedCharacter, moveCharacter]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: 'pointer' }}
      />
      
      {/* Game UI Overlay */}
      <div className="absolute top-4 left-4 game-panel p-2 text-sm">
        <p>Location: {selectedCharacter?.position?.map || 'Town'}</p>
        <p>X: {selectedCharacter?.position?.x || 0}</p>
        <p>Y: {selectedCharacter?.position?.y || 0}</p>
      </div>
      
      <div className="absolute bottom-4 left-4 game-panel p-2 text-xs text-gray-400">
        Use WASD or Arrow keys to move
      </div>
    </div>
  );
};

export default GameMap;