import React from 'react';
import { SiteConfig } from '../types';

interface FloatingSocialsProps {
  config: SiteConfig;
}

const FloatingSocials: React.FC<FloatingSocialsProps> = ({ config }) => {
  return (
    <div className="fixed bottom-8 right-8 z-[90] flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-1000">
      
      {/* Instagram Button */}
      <a 
        href={config.instagramUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group relative w-14 h-14 rounded-full overflow-hidden shadow-2xl transition-all hover:scale-110 active:scale-95 bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center p-3.5 hover:border-blue-500/50"
        title="Instagram"
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" 
          alt="Instagram" 
          className="w-full h-full object-contain filter brightness-110"
        />
      </a>

      {/* WhatsApp Button */}
      <a 
        href={`https://wa.me/${config.contactPhone}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group relative w-14 h-14 rounded-full overflow-hidden shadow-2xl transition-all hover:scale-110 active:scale-95 bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center p-3.5 hover:border-emerald-500/50"
        title="WhatsApp"
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
          alt="WhatsApp" 
          className="w-full h-full object-contain filter brightness-110"
        />
      </a>
    </div>
  );
};

export default FloatingSocials;