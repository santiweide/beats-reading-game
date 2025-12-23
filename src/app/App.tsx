import { useState, useEffect, useMemo } from 'react';
import { AnimalCard } from './components/AnimalCard';
import { useMusicEngine } from './components/SimpleMusicEngine';
import { Button } from './components/ui/button';
import { Slider } from './components/ui/slider';
import { Play, Pause, RotateCcw, Music2 } from 'lucide-react';

// Animal images pool
const CAT_IMAGES = [
  'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0fGVufDF8fHx8MTc2NjQ0NTE2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraXR0ZW58ZW58MXx8fHwxNzY2NTAyOTExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1647806422508-0322f33e270b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjY0MjMyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1593483316242-efb5420596ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBjYXR8ZW58MXx8fHwxNzY2NDgwOTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
];

const DOG_IMAGES = [
  'https://images.unsplash.com/photo-1582456891925-a53965520520?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZG9nfGVufDF8fHx8MTc2NjQ2NzY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXBweXxlbnwxfHx8fDE3NjY1MDI5MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1558788353-f76d92427f16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjY0MTUzNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXJ8ZW58MXx8fHwxNzY2NDM4OTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
];

interface AnimalCardData {
  type: 'cat' | 'dog';
  imageUrl: string;
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [volume, setVolume] = useState(0.3);
  const [bpm, setBpm] = useState(120); // Default 120 BPM = 0.5 seconds per beat
  const [backgroundMusicInterval, setBackgroundMusicInterval] = useState<number | null>(null);

  const musicEngine = useMusicEngine();

  // Generate random animal cards (16 cards for 2x8 grid)
  const animalCards = useMemo(() => {
    const cards: AnimalCardData[] = [];
    for (let i = 0; i < 16; i++) {
      const isCat = Math.random() > 0.5;
      const imagePool = isCat ? CAT_IMAGES : DOG_IMAGES;
      const randomImage = imagePool[Math.floor(Math.random() * imagePool.length)];
      cards.push({
        type: isCat ? 'cat' : 'dog',
        imageUrl: randomImage,
      });
    }
    return cards;
  }, []); // Only generate once on mount

  // Beat interval - Calculate from BPM
  useEffect(() => {
    if (!isPlaying) {
      setCurrentIndex(-1);
      if (backgroundMusicInterval !== null) {
        clearInterval(backgroundMusicInterval);
        setBackgroundMusicInterval(null);
      }
      return;
    }

    // Start background music with current BPM
    if (musicEngine) {
      const interval = musicEngine.startBackgroundMusic(bpm);
      setBackgroundMusicInterval(interval);
    }

    setCurrentIndex(0);
    
    const beatInterval = (60 / bpm) * 1000; // Convert BPM to milliseconds

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= animalCards.length) {
          // Loop back to start
          return 0;
        }
        return next;
      });

      // Play beat sound
      if (musicEngine) {
        musicEngine.playBeat();
      }
    }, beatInterval);

    return () => {
      clearInterval(interval);
      if (backgroundMusicInterval !== null) {
        clearInterval(backgroundMusicInterval);
      }
    };
  }, [isPlaying, bpm, animalCards.length, musicEngine]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (musicEngine) {
      musicEngine.setVolume(newVolume);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Music2 className="w-12 h-12 text-white" />
            <h1 className="text-white text-5xl">猫狗节奏游戏</h1>
            <Music2 className="w-12 h-12 text-white" />
          </div>
          <p className="text-white text-xl">每个节拍按顺序点亮一张随机的猫咪或狗狗图片</p>
        </div>

        {/* Controls */}
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-lg"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6 mr-2" />
                    暂停
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    播放
                  </>
                )}
              </Button>

              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="bg-white/50 hover:bg-white/70 px-8 py-6 text-lg"
              >
                <RotateCcw className="w-6 h-6 mr-2" />
                重置
              </Button>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="flex-1">
                <label className="text-white mb-2 block">
                  BPM: {bpm} ({((60 / bpm) * 1000).toFixed(0)}ms/beat)
                </label>
                <Slider
                  value={[bpm]}
                  onValueChange={(value) => setBpm(value[0])}
                  min={60}
                  max={240}
                  step={10}
                  className="w-full"
                  disabled={isPlaying}
                />
              </div>

              <div className="flex-1">
                <label className="text-white mb-2 block">
                  音量: {Math.round(volume * 100)}%
                </label>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 text-white text-center">
            {isPlaying && (
              <p className="text-lg">
                正在播放: {currentIndex + 1} / {animalCards.length}
              </p>
            )}
          </div>
        </div>

        {/* Animal Cards Grid - 2 rows x 8 columns */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <div className="grid grid-cols-8 grid-rows-2 gap-4">
            {animalCards.map((card, index) => (
              <AnimalCard
                key={index}
                imageUrl={card.imageUrl}
                type={card.type}
                isActive={currentIndex === index}
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-white">
          <h3 className="text-xl mb-3">使用说明：</h3>
          <ul className="space-y-2 text-lg">
            <li>• 调整 <strong>BPM</strong> 滑动条来改变节奏速度（60-240，默认120 BPM = 0.5秒/次）</li>
            <li>• 点击 <strong>播放</strong> 按钮开始游戏</li>
            <li>• 每个节拍会 <strong>按顺序</strong> 点亮下一张卡片（从左到右，从上到下）</li>
            <li>• 每张卡片随机显示 <strong>猫咪 🐱</strong> 或 <strong>狗狗 🐶</strong> 的图片</li>
            <li>• 播放完16张卡片后会自动循环</li>
            <li>• 可随时调整音量或点击 <strong>重置</strong> 重新开始</li>
            <li>• <strong>注意：</strong> BPM 只能在停止状态下调整</li>
          </ul>
        </div>
      </div>
    </div>
  );
}