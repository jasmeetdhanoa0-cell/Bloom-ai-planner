import React, { useState } from 'react';
import { PetType, PetState } from '../../types';

interface CutePetProps {
  type: PetType;
  state?: PetState;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onPetClick?: () => void;
  showHearts?: boolean;
}

export const CutePet: React.FC<CutePetProps> = ({
  type = 'Bunny',
  state = 'idle',
  className = '',
  size = 'md',
  interactive = true,
  onPetClick,
  showHearts = true,
}) => {
  const [clickedEffect, setClickedEffect] = useState(false);

  const handleClick = () => {
    if (!interactive) return;
    setClickedEffect(true);
    setTimeout(() => setClickedEffect(false), 900);
    if (onPetClick) onPetClick();
  };

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-52 h-52',
  }[size];

  // Palette per pet type
  const petColors: Record<PetType, { base: string; secondary: string; cheeks: string; innerEar: string; dark: string }> = {
    Bunny: { base: '#FFF9F6', secondary: '#FDECE6', cheeks: '#FFB3BA', innerEar: '#FFC6CE', dark: '#5C4033' },
    Cat: { base: '#FFE8D6', secondary: '#FCD5B5', cheeks: '#FFAAA6', innerEar: '#FFCAD4', dark: '#4A3B32' },
    Dog: { base: '#F3DFC1', secondary: '#E3C8A0', cheeks: '#FFB7B2', innerEar: '#A77B57', dark: '#43281C' },
    Bear: { base: '#DEBA9D', secondary: '#C79A79', cheeks: '#FFB3BA', innerEar: '#9E6D48', dark: '#38220F' },
    Fox: { base: '#FFAA64', secondary: '#FFF0E5', cheeks: '#FF9999', innerEar: '#FF8040', dark: '#3A2010' },
    Hamster: { base: '#FFE5B4', secondary: '#FFF4E0', cheeks: '#FFB3BA', innerEar: '#FFCCD5', dark: '#4E3629' },
    Panda: { base: '#FFFFFF', secondary: '#EAEAEA', cheeks: '#FFB6C1', innerEar: '#2C2C2C', dark: '#1F1F1F' },
    Frog: { base: '#B5EAD7', secondary: '#9FE1C7', cheeks: '#FFB7B2', innerEar: '#76C893', dark: '#2D503D' },
  };

  const c = petColors[type] || petColors.Bunny;

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
      } ${className}`}
      title={`${type} (${state})`}
    >
      {/* Click Hearts Burst */}
      {clickedEffect && showHearts && (
        <div className="absolute -top-4 inset-x-0 flex justify-center pointer-events-none z-20 animate-gentle-float">
          <span className="text-xl animate-bounce">💖</span>
          <span className="text-xs text-pink-400 font-bold ml-1 self-center">patted!</span>
        </div>
      )}

      {/* SVG Pet Container */}
      <svg
        viewBox="0 0 120 120"
        className={`${sizeClasses} drop-shadow-sm transition-all duration-300 ${
          state === 'studying' ? 'animate-study' : state === 'celebrating' ? 'animate-celebrate' : 'animate-breathe'
        }`}
      >
        <defs>
          <radialGradient id={`glow-${type}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient shadow */}
        <ellipse cx="60" cy="108" rx="36" ry="7" fill="rgba(0,0,0,0.06)" />

        {/* ================= PET SPECIFIC ANATOMY ================= */}
        {type === 'Bunny' && (
          <g className="animate-ear-wiggle" style={{ transformOrigin: '60px 50px' }}>
            {/* Left Ear */}
            <path d="M 40,55 C 32,15 42,5 48,15 C 54,25 50,45 46,55 Z" fill={c.base} stroke="#E8D5CE" strokeWidth="1.5" />
            <path d="M 42,48 C 36,20 44,12 47,20 C 50,28 47,42 44,48 Z" fill={c.innerEar} opacity="0.85" />
            {/* Right Ear */}
            <path d="M 80,55 C 88,15 78,5 72,15 C 66,25 70,45 74,55 Z" fill={c.base} stroke="#E8D5CE" strokeWidth="1.5" />
            <path d="M 78,48 C 84,20 76,12 73,20 C 70,28 73,42 76,48 Z" fill={c.innerEar} opacity="0.85" />
          </g>
        )}

        {type === 'Cat' && (
          <g>
            <polygon points="32,55 38,28 54,48" fill={c.base} stroke="#E5C7B5" strokeWidth="1.5" />
            <polygon points="36,50 40,34 50,46" fill={c.innerEar} />
            <polygon points="88,55 82,28 66,48" fill={c.base} stroke="#E5C7B5" strokeWidth="1.5" />
            <polygon points="84,50 80,34 70,46" fill={c.innerEar} />
          </g>
        )}

        {type === 'Dog' && (
          <g>
            {/* Floppy Left Ear */}
            <path d="M 36,50 C 20,48 18,72 32,76 C 38,76 40,65 38,52 Z" fill={c.innerEar} stroke="#C49A70" strokeWidth="1.2" />
            {/* Floppy Right Ear */}
            <path d="M 84,50 C 100,48 102,72 88,76 C 82,76 80,65 82,52 Z" fill={c.innerEar} stroke="#C49A70" strokeWidth="1.2" />
          </g>
        )}

        {type === 'Bear' && (
          <g>
            <circle cx="36" cy="38" r="14" fill={c.base} stroke="#B68969" strokeWidth="1.5" />
            <circle cx="36" cy="38" r="8" fill={c.innerEar} />
            <circle cx="84" cy="38" r="14" fill={c.base} stroke="#B68969" strokeWidth="1.5" />
            <circle cx="84" cy="38" r="8" fill={c.innerEar} />
          </g>
        )}

        {type === 'Fox' && (
          <g>
            <polygon points="30,55 35,22 55,46" fill={c.base} stroke="#E88238" strokeWidth="1.5" />
            <polygon points="34,50 38,30 50,44" fill={c.innerEar} />
            <polygon points="90,55 85,22 65,46" fill={c.base} stroke="#E88238" strokeWidth="1.5" />
            <polygon points="86,50 82,30 70,44" fill={c.innerEar} />
          </g>
        )}

        {type === 'Hamster' && (
          <g>
            <circle cx="36" cy="42" r="11" fill={c.base} stroke="#E2C192" strokeWidth="1.2" />
            <circle cx="36" cy="42" r="6" fill={c.innerEar} />
            <circle cx="84" cy="42" r="11" fill={c.base} stroke="#E2C192" strokeWidth="1.2" />
            <circle cx="84" cy="42" r="6" fill={c.innerEar} />
          </g>
        )}

        {type === 'Panda' && (
          <g>
            <circle cx="34" cy="38" r="14" fill="#242424" />
            <circle cx="86" cy="38" r="14" fill="#242424" />
          </g>
        )}

        {type === 'Frog' && (
          <g>
            <circle cx="40" cy="38" r="14" fill={c.base} stroke="#8EC7AA" strokeWidth="1.5" />
            <circle cx="80" cy="38" r="14" fill={c.base} stroke="#8EC7AA" strokeWidth="1.5" />
            <circle cx="40" cy="37" r="7" fill="#FFFFFF" />
            <circle cx="41" cy="37" r="4" fill="#203E2F" />
            <circle cx="80" cy="37" r="7" fill="#FFFFFF" />
            <circle cx="79" cy="37" r="4" fill="#203E2F" />
          </g>
        )}

        {/* Head / Body Base */}
        <circle cx="60" cy="68" r="38" fill={c.base} stroke="#E8D5CE" strokeWidth="1.5" />

        {/* Belly / Accent patch for Panda, Fox, Bear */}
        {type === 'Panda' && (
          <>
            <ellipse cx="46" cy="64" rx="8" ry="11" fill="#242424" transform="rotate(-15 46 64)" />
            <ellipse cx="74" cy="64" rx="8" ry="11" fill="#242424" transform="rotate(15 74 64)" />
          </>
        )}
        {type === 'Fox' && (
          <path d="M 40,78 Q 60,65 80,78 Q 60,105 40,78 Z" fill={c.secondary} opacity="0.9" />
        )}

        {/* Cheeks */}
        <ellipse cx="38" cy="74" rx="6" ry="4" fill={c.cheeks} opacity="0.75" />
        <ellipse cx="82" cy="74" rx="6" ry="4" fill={c.cheeks} opacity="0.75" />

        {/* Tiny paws */}
        <ellipse cx="46" cy="98" rx="8" ry="6" fill={type === 'Panda' ? '#242424' : c.secondary} />
        <ellipse cx="74" cy="98" rx="8" ry="6" fill={type === 'Panda' ? '#242424' : c.secondary} />

        {/* ================= EXPRESSIONS BASED ON STATE ================= */}
        {state === 'sleepy' ? (
          // Sleepy closed happy arcs
          <g stroke={c.dark} strokeWidth="2.2" strokeLinecap="round" fill="none">
            <path d="M 44,67 Q 50,62 56,67" />
            <path d="M 64,67 Q 70,62 76,67" />
            <text x="88" y="44" fontSize="14" fill="#A78BFA" fontWeight="bold">z</text>
            <text x="96" y="34" fontSize="11" fill="#C084FC" fontWeight="bold">z</text>
          </g>
        ) : state === 'happy' || state === 'celebrating' ? (
          // Happy crescent curved eyes
          <g stroke={c.dark} strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M 43,67 Q 50,60 57,67" />
            <path d="M 63,67 Q 70,60 77,67" />
          </g>
        ) : state === 'comforting' ? (
          // Gentle warm caring eyes
          <g>
            <circle cx="49" cy="65" r="3.5" fill={c.dark} />
            <circle cx="71" cy="65" r="3.5" fill={c.dark} />
            <circle cx="47.5" cy="63.5" r="1.2" fill="#FFFFFF" />
            <circle cx="69.5" cy="63.5" r="1.2" fill="#FFFFFF" />
            <path d="M 57,75 Q 60,78 63,75" stroke={c.dark} strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          // Idle / studying sparkling eyes
          <g>
            <circle cx="49" cy="65" r="4" fill={c.dark} />
            <circle cx="71" cy="65" r="4" fill={c.dark} />
            <circle cx="47" cy="63" r="1.5" fill="#FFFFFF" />
            <circle cx="69" cy="63" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Nose & Mouth */}
        {type === 'Frog' ? (
          <path d="M 54,75 Q 60,80 66,75" stroke={c.dark} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        ) : (
          <g>
            <ellipse cx="60" cy="71" rx="2.5" ry="2" fill={c.dark} />
            <path d="M 60,73 L 60,76" stroke={c.dark} strokeWidth="1.5" strokeLinecap="round" />
            <path
              d={state === 'happy' || state === 'celebrating' ? "M 55,76 Q 60,82 65,76" : "M 56,76 Q 60,79 64,76"}
              stroke={c.dark}
              strokeWidth="1.6"
              strokeLinecap="round"
              fill={state === 'happy' || state === 'celebrating' ? "#FF8DA1" : "none"}
            />
          </g>
        )}

        {/* ================= STATE ACCESSORIES ================= */}
        {state === 'studying' && (
          // Tiny gold study glasses & notebook
          <g>
            {/* Left rim */}
            <circle cx="49" cy="65" r="8" fill="none" stroke="#D97706" strokeWidth="1.5" />
            {/* Right rim */}
            <circle cx="71" cy="65" r="8" fill="none" stroke="#D97706" strokeWidth="1.5" />
            {/* Bridge */}
            <line x1="57" y1="65" x2="63" y2="65" stroke="#D97706" strokeWidth="1.5" />
            {/* Open study book on lap */}
            <g transform="translate(42, 92)">
              <polygon points="0,6 18,2 18,14 0,16" fill="#FDF2F8" stroke="#F472B6" strokeWidth="1" />
              <polygon points="18,2 36,6 36,16 18,14" fill="#FAF5FF" stroke="#C084FC" strokeWidth="1" />
              <line x1="4" y1="7" x2="14" y2="5" stroke="#F472B6" strokeWidth="0.8" opacity="0.6" />
              <line x1="4" y1="10" x2="14" y2="8" stroke="#F472B6" strokeWidth="0.8" opacity="0.6" />
              <line x1="22" y1="5" x2="32" y2="7" stroke="#C084FC" strokeWidth="0.8" opacity="0.6" />
              <line x1="22" y1="8" x2="32" y2="10" stroke="#C084FC" strokeWidth="0.8" opacity="0.6" />
            </g>
          </g>
        )}

        {state === 'celebrating' && (
          // Party hat & sparkles
          <g>
            <polygon points="60,18 52,38 68,38" fill="#F472B6" stroke="#FB7185" strokeWidth="1" />
            <circle cx="60" cy="17" r="3" fill="#FBBF24" />
            <circle cx="58" cy="27" r="1.5" fill="#FFFFFF" />
            <circle cx="63" cy="33" r="1.5" fill="#6EE7B7" />
            {/* Sparkles around */}
            <text x="24" y="32" fontSize="12" fill="#FBBF24">✨</text>
            <text x="86" y="30" fontSize="12" fill="#F472B6">🎉</text>
          </g>
        )}

        {state === 'comforting' && (
          // Cozy warm pastel knit scarf
          <g>
            <path
              d="M 38,82 Q 60,94 82,82 Q 80,92 60,100 Q 40,92 38,82 Z"
              fill="#F472B6"
              stroke="#FB7185"
              strokeWidth="1.2"
            />
            {/* Scarf tail */}
            <path d="M 68,90 L 72,106 L 62,104 Z" fill="#F472B6" stroke="#FB7185" strokeWidth="1" />
            <text x="18" y="70" fontSize="11" fill="#FB7185">💖</text>
          </g>
        )}
      </svg>
    </div>
  );
};
