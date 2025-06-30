import React, { useState, useEffect, useRef } from 'react';
import { Eye, Terminal, DoorOpen, RotateCcw, Volume2, Trophy, Target } from 'lucide-react';

type GameState = 'playing' | 'detected' | 'hacking' | 'complete';
type Position = { x: number; y: number };
type MovementPattern = 'horizontal' | 'vertical' | 'diagonal' | 'circular' | 'random' | 'speed-horizontal' | 'speed-vertical' | 'speed-diagonal';

const ROOM_SIZE = 600;
const PLAYER_SIZE = 20;
const ENEMY_SIZE = 25;
const CONSOLE_SIZE = 40;
const DOOR_SIZE = 50;

function App() {
  const [gameState, setGameState] = useState<GameState>('playing');
  const [playerPos, setPlayerPos] = useState<Position>({ x: 100, y: 100 });
  const [enemyPos, setEnemyPos] = useState<Position>({ x: 300, y: 200 });
  const [enemyDirection, setEnemyDirection] = useState(1);
  const [enemyAngle, setEnemyAngle] = useState(0);
  const [doorUnlocked, setDoorUnlocked] = useState(false);
  const [hackingSequence, setHackingSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isSequencePlayback, setIsSequencePlayback] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [movementPattern, setMovementPattern] = useState<MovementPattern>('horizontal');
  const [enemySpeed, setEnemySpeed] = useState(2);
  const [detectionRadius, setDetectionRadius] = useState(80);

  const gameRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const enemyPathRef = useRef({ centerX: 350, centerY: 300, radius: 100 });

  const consolePos = { x: 400, y: 300 };
  const doorPos = { x: 550, y: 250 };

  // Get movement pattern based on level with alternating difficulty after level 5
  const getMovementPattern = (currentLevel: number): MovementPattern => {
    if (currentLevel <= 5) {
      const patterns: MovementPattern[] = ['horizontal', 'vertical', 'diagonal', 'circular', 'random'];
      return patterns[Math.min(currentLevel - 1, patterns.length - 1)];
    } else {
      // After level 5, alternate between complex multi-directional and high-speed linear
      const cyclePosition = (currentLevel - 6) % 6;
      const patterns: MovementPattern[] = [
        'random',           // Level 6: Complex multi-directional
        'speed-horizontal', // Level 7: High-speed linear
        'random',           // Level 8: Complex multi-directional
        'speed-vertical',   // Level 9: High-speed linear
        'random',           // Level 10: Complex multi-directional
        'speed-diagonal'    // Level 11: High-speed linear
      ];
      return patterns[cyclePosition];
    }
  };

  // Get difficulty settings based on level
  const getDifficultySettings = (currentLevel: number) => {
    const baseSpeed = currentLevel <= 5 ? 
      Math.min(2 + (currentLevel - 1) * 0.5, 4) : 
      2 + Math.floor((currentLevel - 1) / 2) * 0.8; // Gradual increase after level 5

    // High-speed patterns get significant speed boost
    const isSpeedPattern = movementPattern.startsWith('speed-');
    const finalSpeed = isSpeedPattern ? baseSpeed * 2.5 : baseSpeed;

    return {
      speed: Math.min(finalSpeed, 12), // Cap at 12x speed
      detectionRadius: Math.max(80 - Math.floor((currentLevel - 1) / 2) * 5, 50),
      sequenceLength: Math.min(3 + Math.floor(currentLevel / 2), 10),
      patrolArea: Math.min(150 + (currentLevel - 1) * 15, 280)
    };
  };

  // Update difficulty when level changes
  useEffect(() => {
    const pattern = getMovementPattern(level);
    const settings = getDifficultySettings(level);
    
    setMovementPattern(pattern);
    setEnemySpeed(settings.speed);
    setDetectionRadius(settings.detectionRadius);
    
    // Reset enemy position based on pattern
    if (pattern === 'circular') {
      enemyPathRef.current = { 
        centerX: 350, 
        centerY: 300, 
        radius: settings.patrolArea / 2 
      };
    }
  }, [level, movementPattern]);

  // Enhanced enemy patrol logic with speed variants
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState !== 'playing') return;

      setEnemyPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let newDirection = enemyDirection;
        let newAngle = enemyAngle;

        switch (movementPattern) {
          case 'horizontal':
          case 'speed-horizontal':
            newX = prev.x + (enemyDirection * enemySpeed);
            if (newX <= 200 || newX >= 500) {
              newDirection = -enemyDirection;
              newX = prev.x + (newDirection * enemySpeed);
              setEnemyDirection(newDirection);
            }
            break;

          case 'vertical':
          case 'speed-vertical':
            newY = prev.y + (enemyDirection * enemySpeed);
            if (newY <= 150 || newY >= 450) {
              newDirection = -enemyDirection;
              newY = prev.y + (newDirection * enemySpeed);
              setEnemyDirection(newDirection);
            }
            break;

          case 'diagonal':
          case 'speed-diagonal':
            newX = prev.x + (enemyDirection * enemySpeed * 0.7);
            newY = prev.y + (enemyDirection * enemySpeed * 0.7);
            if (newX <= 200 || newX >= 500 || newY <= 150 || newY >= 450) {
              newDirection = -enemyDirection;
              newX = prev.x + (newDirection * enemySpeed * 0.7);
              newY = prev.y + (newDirection * enemySpeed * 0.7);
              setEnemyDirection(newDirection);
            }
            break;

          case 'circular':
            newAngle = enemyAngle + (enemySpeed * 0.02);
            newX = enemyPathRef.current.centerX + Math.cos(newAngle) * enemyPathRef.current.radius;
            newY = enemyPathRef.current.centerY + Math.sin(newAngle) * enemyPathRef.current.radius;
            setEnemyAngle(newAngle);
            break;

          case 'random':
            // Enhanced random movement for higher levels
            if (Math.random() < 0.08) { // 8% chance to change direction (more erratic)
              setEnemyDirection(Math.random() < 0.5 ? 1 : -1);
              setEnemyAngle(Math.random() * Math.PI * 2);
            }
            const randomX = Math.cos(enemyAngle) * enemySpeed;
            const randomY = Math.sin(enemyAngle) * enemySpeed;
            newX = Math.max(200, Math.min(500, prev.x + randomX));
            newY = Math.max(150, Math.min(450, prev.y + randomY));
            break;
        }

        return { x: newX, y: newY };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [enemyDirection, enemyAngle, gameState, movementPattern, enemySpeed]);

  // Player detection logic with dynamic detection radius
  useEffect(() => {
    if (gameState !== 'playing') return;

    const distance = Math.sqrt(
      Math.pow(playerPos.x - enemyPos.x, 2) + Math.pow(playerPos.y - enemyPos.y, 2)
    );

    if (distance < detectionRadius) {
      setGameState('detected');
    }
  }, [playerPos, enemyPos, gameState, detectionRadius]);

  // Player movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      keysRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
      
      // Escape key to restart
      if (e.key === 'Escape') {
        restartGame();
      }
      
      // E key to interact with console
      if (e.key.toLowerCase() === 'e') {
        const distanceToConsole = Math.sqrt(
          Math.pow(playerPos.x - consolePos.x, 2) + Math.pow(playerPos.y - consolePos.y, 2)
        );
        
        if (distanceToConsole < 60) {
          startHackingMinigame();
        }
      }
    };

    const movePlayer = () => {
      if (gameState !== 'playing') return;

      setPlayerPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
        const speed = 3;

        if (keysRef.current.has('w')) newY = Math.max(20, newY - speed);
        if (keysRef.current.has('s')) newY = Math.min(ROOM_SIZE - 20, newY + speed);
        if (keysRef.current.has('a')) newX = Math.max(20, newX - speed);
        if (keysRef.current.has('d')) newX = Math.min(ROOM_SIZE - 20, newX + speed);

        return { x: newX, y: newY };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const moveInterval = setInterval(movePlayer, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveInterval);
    };
  }, [gameState, playerPos]);

  // Check if player reached door
  useEffect(() => {
    if (!doorUnlocked || gameState !== 'playing') return;

    const distanceToDoor = Math.sqrt(
      Math.pow(playerPos.x - doorPos.x, 2) + Math.pow(playerPos.y - doorPos.y, 2)
    );

    if (distanceToDoor < 50) {
      setGameState('complete');
    }
  }, [playerPos, doorUnlocked, gameState]);

  const restartGame = () => {
    setGameState('playing');
    setPlayerPos({ x: 100, y: 100 });
    setEnemyPos({ x: 300, y: 200 });
    setEnemyDirection(1);
    setEnemyAngle(0);
    setDoorUnlocked(false);
    setHackingSequence([]);
    setPlayerSequence([]);
    setCurrentStep(0);
    setLevel(1);
    setTotalScore(0);
  };

  const nextLevel = () => {
    const levelScore = Math.max(1000 - (level * 50), 300) + (level > 5 ? 200 : 0); // Bonus for advanced levels
    setTotalScore(prev => prev + levelScore);
    setLevel(prev => prev + 1);
    setGameState('playing');
    setPlayerPos({ x: 100, y: 100 });
    setEnemyPos({ x: 300, y: 200 });
    setEnemyDirection(1);
    setEnemyAngle(0);
    setDoorUnlocked(false);
    setHackingSequence([]);
    setPlayerSequence([]);
    setCurrentStep(0);
  };

  const startHackingMinigame = () => {
    setGameState('hacking');
    const settings = getDifficultySettings(level);
    const sequence = Array.from({ length: settings.sequenceLength }, () => Math.floor(Math.random() * 3));
    setHackingSequence(sequence);
    setPlayerSequence([]);
    setCurrentStep(0);
    playSequence(sequence);
  };

  const playSequence = (sequence: number[]) => {
    setIsSequencePlayback(true);
    sequence.forEach((button, index) => {
      setTimeout(() => {
        setActiveButton(button);
        setTimeout(() => {
          setActiveButton(null);
          if (index === sequence.length - 1) {
            setIsSequencePlayback(false);
          }
        }, 400);
      }, index * 600);
    });
  };

  const handleButtonClick = (buttonIndex: number) => {
    if (isSequencePlayback || gameState !== 'hacking') return;

    const newSequence = [...playerSequence, buttonIndex];
    setPlayerSequence(newSequence);

    if (newSequence[currentStep] !== hackingSequence[currentStep]) {
      // Wrong sequence - trigger detection
      setGameState('detected');
      return;
    }

    if (newSequence.length === hackingSequence.length) {
      // Sequence complete - unlock door
      setDoorUnlocked(true);
      setGameState('playing');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const getButtonColor = (index: number) => {
    const colors = ['from-red-500 to-red-600', 'from-blue-500 to-blue-600', 'from-green-500 to-green-600'];
    const activeColor = 'from-white to-gray-200';
    return activeButton === index ? activeColor : colors[index];
  };

  const getPatternDescription = (pattern: MovementPattern) => {
    switch (pattern) {
      case 'horizontal': return 'Linear Patrol';
      case 'vertical': return 'Vertical Sweep';
      case 'diagonal': return 'Diagonal Path';
      case 'circular': return 'Orbital Pattern';
      case 'random': return 'Chaos Mode';
      case 'speed-horizontal': return 'SPEED BLITZ - Horizontal';
      case 'speed-vertical': return 'SPEED BLITZ - Vertical';
      case 'speed-diagonal': return 'SPEED BLITZ - Diagonal';
      default: return 'Unknown';
    }
  };

  const getVisionConeRotation = () => {
    switch (movementPattern) {
      case 'horizontal':
      case 'speed-horizontal':
        return enemyDirection > 0 ? 0 : 180;
      case 'vertical':
      case 'speed-vertical':
        return enemyDirection > 0 ? 90 : 270;
      case 'diagonal':
      case 'speed-diagonal':
        return enemyDirection > 0 ? 45 : 225;
      case 'circular':
        return (enemyAngle * 180 / Math.PI) + 90;
      case 'random':
        return (enemyAngle * 180 / Math.PI);
      default:
        return 0;
    }
  };

  const isSpeedMode = movementPattern.startsWith('speed-');
  const difficultyPhase = level <= 5 ? 'Learning Phase' : 'Advanced Phase';

  return (
    <div className="min-h-screen bg-black text-cyan-400 overflow-hidden relative">
      {/* Cyberpunk Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 opacity-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]"></div>
      
      {/* Speed Mode Visual Effect */}
      {isSpeedMode && (
        <div className="absolute inset-0 bg-red-500 opacity-5 animate-pulse pointer-events-none"></div>
      )}

      {/* Bolt Badge */}
      <div className="fixed top-4 right-4 z-50">
        <a
          href="https://bolt.new/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block"
        >
          <img
            src="/bolt.jpg"
            alt="Bolt"
            className="w-16 h-16 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-400/30 transition-all duration-300 hover:scale-110 hover:shadow-cyan-400/50 hover:border-cyan-300"
          />
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black bg-opacity-90 text-cyan-400 text-sm rounded-lg border border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Powered by Bolt
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-cyan-500"></div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-pulse"></div>
        </a>
      </div>
      
      {/* Game Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        
        {/* Game Title and Stats */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            CYBER HEIST: CODEBREAKER
          </h1>
          <div className="flex items-center justify-center space-x-6 text-sm mb-2">
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400">Level {level}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Score: {totalScore}</span>
            </div>
            <div className={`${isSpeedMode ? 'text-red-400 animate-pulse font-bold' : 'text-purple-400'}`}>
              {getPatternDescription(movementPattern)}
            </div>
          </div>
          <div className="text-xs text-gray-400 mb-2">
            {difficultyPhase} {level > 5 && `• Cycle ${Math.floor((level - 6) / 6) + 1}`}
          </div>
          <p className="text-cyan-300 text-sm">
            WASD to move • E to interact • ESC to restart
          </p>
        </div>

        {/* Enhanced Difficulty Indicator */}
        <div className={`mb-4 bg-gray-900 bg-opacity-80 border rounded-lg px-4 py-2 ${isSpeedMode ? 'border-red-500 shadow-red-500/20' : 'border-cyan-500'}`}>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <span className={`${isSpeedMode ? 'text-red-400 font-bold animate-pulse' : 'text-red-400'}`}>
              Bot Speed: {enemySpeed.toFixed(1)}x {isSpeedMode && '⚡'}
            </span>
            <span className="text-yellow-400">Detection: {detectionRadius}px</span>
            <span className="text-blue-400">Sequence: {getDifficultySettings(level).sequenceLength}</span>
            {level > 5 && (
              <span className="text-purple-400">
                Phase: {(level - 6) % 2 === 0 ? 'Multi-Dir' : 'Speed'}
              </span>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div 
          ref={gameRef}
          className={`relative bg-gray-900 bg-opacity-80 border-2 shadow-2xl ${isSpeedMode ? 'border-red-500 shadow-red-500/20' : 'border-cyan-500 shadow-cyan-500/20'}`}
          style={{ width: ROOM_SIZE, height: ROOM_SIZE }}
        >
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(${isSpeedMode ? 'rgba(255,0,0,0.3)' : 'rgba(0,255,255,0.2)'} 1px, transparent 1px),
                linear-gradient(90deg, ${isSpeedMode ? 'rgba(255,0,0,0.3)' : 'rgba(0,255,255,0.2)'} 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px'
            }}></div>
          </div>

          {/* Player */}
          <div
            className="absolute w-5 h-5 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg shadow-cyan-400/50 border border-cyan-300 transition-all duration-75"
            style={{
              left: playerPos.x - PLAYER_SIZE / 2,
              top: playerPos.y - PLAYER_SIZE / 2,
              transform: 'translate3d(0, 0, 0)'
            }}
          >
            <div className="absolute inset-0 bg-cyan-400 rounded-full animate-pulse opacity-30"></div>
          </div>

          {/* Enhanced Enemy Bot with Speed Mode Effects */}
          <div
            className={`absolute bg-gradient-to-br rounded-lg shadow-lg border transition-all duration-75 flex items-center justify-center ${
              isSpeedMode 
                ? 'from-red-600 to-red-800 shadow-red-600/70 border-red-300' 
                : 'from-red-500 to-red-700 shadow-red-500/50 border-red-400'
            }`}
            style={{
              left: enemyPos.x - ENEMY_SIZE / 2,
              top: enemyPos.y - ENEMY_SIZE / 2,
              width: ENEMY_SIZE,
              height: ENEMY_SIZE,
              transform: `translate3d(0, 0, 0) ${isSpeedMode ? 'scale(1.2)' : 'scale(1)'}`
            }}
          >
            <Eye className={`w-4 h-4 ${isSpeedMode ? 'text-red-100' : 'text-red-200'}`} />
            <div className={`absolute inset-0 rounded-lg animate-pulse opacity-20 ${isSpeedMode ? 'bg-red-600' : 'bg-red-500'}`}></div>
            {isSpeedMode && (
              <div className="absolute inset-0 bg-red-400 rounded-lg animate-ping opacity-40"></div>
            )}
          </div>

          {/* Enhanced Enemy Vision Cone */}
          <div
            className="absolute pointer-events-none transition-all duration-200"
            style={{
              left: enemyPos.x,
              top: enemyPos.y - detectionRadius/2,
              width: detectionRadius,
              height: detectionRadius,
              background: `radial-gradient(ellipse ${detectionRadius}px ${detectionRadius/2}px at 50% 100%, ${
                isSpeedMode ? 'rgba(255,100,100,0.35)' : 'rgba(255,0,0,0.25)'
              }, transparent)`,
              transform: `rotate(${getVisionConeRotation()}deg)`,
              transformOrigin: '50% 100%'
            }}
          ></div>

          {/* Hacking Console */}
          <div
            className={`absolute bg-gradient-to-br ${doorUnlocked ? 'from-green-500 to-green-700' : 'from-blue-500 to-blue-700'} rounded-lg shadow-lg border flex items-center justify-center transition-all duration-300`}
            style={{
              left: consolePos.x - CONSOLE_SIZE / 2,
              top: consolePos.y - CONSOLE_SIZE / 2,
              width: CONSOLE_SIZE,
              height: CONSOLE_SIZE,
              boxShadow: `0 0 20px ${doorUnlocked ? 'rgba(34,197,94,0.5)' : 'rgba(59,130,246,0.5)'}`,
              borderColor: doorUnlocked ? '#22c55e' : '#3b82f6'
            }}
          >
            <Terminal className={`w-6 h-6 ${doorUnlocked ? 'text-green-200' : 'text-blue-200'}`} />
            <div className={`absolute inset-0 ${doorUnlocked ? 'bg-green-500' : 'bg-blue-500'} rounded-lg animate-pulse opacity-20`}></div>
          </div>

          {/* Console Interaction Hint */}
          {Math.sqrt(Math.pow(playerPos.x - consolePos.x, 2) + Math.pow(playerPos.y - consolePos.y, 2)) < 60 && (
            <div
              className="absolute bg-black bg-opacity-80 text-cyan-400 px-2 py-1 rounded text-xs border border-cyan-500"
              style={{
                left: consolePos.x - 25,
                top: consolePos.y - 60
              }}
            >
              Press E to hack
            </div>
          )}

          {/* Exit Door */}
          <div
            className={`absolute bg-gradient-to-br ${doorUnlocked ? 'from-green-600 to-green-800' : 'from-gray-600 to-gray-800'} rounded-lg shadow-lg border flex items-center justify-center transition-all duration-500`}
            style={{
              left: doorPos.x - DOOR_SIZE / 2,
              top: doorPos.y - DOOR_SIZE / 2,
              width: DOOR_SIZE,
              height: DOOR_SIZE,
              boxShadow: doorUnlocked ? '0 0 30px rgba(34,197,94,0.6)' : '0 0 10px rgba(75,85,99,0.3)',
              borderColor: doorUnlocked ? '#22c55e' : '#6b7280',
              transform: doorUnlocked ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <DoorOpen className={`w-8 h-8 ${doorUnlocked ? 'text-green-200' : 'text-gray-400'}`} />
            {doorUnlocked && (
              <div className="absolute inset-0 bg-green-500 rounded-lg animate-pulse opacity-30"></div>
            )}
          </div>
        </div>

        {/* Game Status */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <span>Player</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${isSpeedMode ? 'bg-red-600 animate-pulse' : 'bg-red-500'}`}></div>
              <span>Security Bot {isSpeedMode && '⚡'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-3 h-3 ${doorUnlocked ? 'bg-green-500' : 'bg-blue-500'} rounded-full`}></div>
              <span>Console</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-3 h-3 ${doorUnlocked ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></div>
              <span>Exit</span>
            </div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={restartGame}
          className="mt-4 flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Mission</span>
        </button>
      </div>

      {/* Game State Overlays */}
      {gameState === 'detected' && (
        <div className="fixed inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl font-bold text-red-400 mb-4 animate-pulse">DETECTED!</div>
            <p className="text-red-300 mb-2 text-xl">The security bot spotted you!</p>
            <p className="text-red-400 mb-6 text-sm">
              Level {level} • {getPatternDescription(movementPattern)}
              {isSpeedMode && ' • SPEED MODE ACTIVE'}
            </p>
            <button
              onClick={restartGame}
              className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {gameState === 'hacking' && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl shadow-cyan-500/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-2">HACKING CONSOLE</h2>
              <div className="text-cyan-300 text-sm mb-2">
                Level {level} • Sequence Length: {hackingSequence.length}
                {isSpeedMode && ' • SPEED MODE'}
              </div>
              <p className="text-cyan-300 text-sm">
                {isSequencePlayback ? 'Memorize the sequence...' : 'Repeat the sequence!'}
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 mb-6">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => handleButtonClick(index)}
                  disabled={isSequencePlayback}
                  className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getButtonColor(index)} 
                    ${isSequencePlayback ? 'cursor-not-allowed' : 'hover:scale-110 cursor-pointer'} 
                    transition-all duration-200 shadow-lg border-2 border-white border-opacity-20
                    ${activeButton === index ? 'scale-110 shadow-white/50' : ''}`}
                >
                  <div className="w-full h-full rounded-md bg-white bg-opacity-20"></div>
                </button>
              ))}
            </div>

            <div className="text-center text-cyan-300 text-sm">
              Progress: {playerSequence.length}/{hackingSequence.length}
            </div>
          </div>
        </div>
      )}

      {gameState === 'complete' && (
        <div className="fixed inset-0 bg-green-900 bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl font-bold text-green-400 mb-4 animate-pulse">LEVEL COMPLETE!</div>
            <p className="text-green-300 mb-2 text-xl">Successfully infiltrated Level {level}!</p>
            <div className="text-green-400 mb-2 text-sm">
              {getPatternDescription(movementPattern)}
              {isSpeedMode && ' • SPEED MODE CONQUERED!'}
            </div>
            <div className="text-green-400 mb-6 text-lg">
              <div>Score: +{Math.max(1000 - (level * 50), 300) + (level > 5 ? 200 : 0)} points</div>
              <div>Total Score: {totalScore + Math.max(1000 - (level * 50), 300) + (level > 5 ? 200 : 0)}</div>
            </div>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={nextLevel}
                className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105"
              >
                Next Level
              </button>
              <button
                onClick={restartGame}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105"
              >
                Restart Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Indicator */}
      <div className="fixed bottom-4 right-4 text-cyan-400 opacity-50">
        <Volume2 className="w-6 h-6" />
      </div>
    </div>
  );
}

export default App;