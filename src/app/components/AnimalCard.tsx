import { motion } from 'motion/react';

interface AnimalCardProps {
  imageUrl: string;
  type: 'cat' | 'dog';
  isActive: boolean;
}

export function AnimalCard({ imageUrl, type, isActive }: AnimalCardProps) {
  return (
    <motion.div
      className={`relative aspect-square rounded-lg overflow-hidden border-4 transition-all ${
        isActive
          ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)] scale-110'
          : 'border-gray-300'
      }`}
      animate={{
        scale: isActive ? 1.1 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={imageUrl}
        alt={type}
        className="w-full h-full object-cover"
      />
      <div
        className={`absolute inset-0 transition-all ${
          isActive 
            ? 'bg-yellow-400/30 backdrop-blur-[1px]' 
            : 'bg-black/0'
        }`}
      />
    </motion.div>
  );
}