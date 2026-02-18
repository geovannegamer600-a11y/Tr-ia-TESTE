
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { 
  X, 
  Crop, 
  ZoomIn, 
  Check, 
  RotateCcw, 
  Square, 
  RectangleHorizontal, 
  Unlock, 
  RotateCw,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';

interface ImageResizerModalProps {
  image: string;
  aspect: number;
  onConfirm: (croppedImage: string) => void;
  onCancel: () => void;
  title?: string;
}

const ImageResizerModal: React.FC<ImageResizerModalProps> = ({ 
  image, 
  aspect: initialAspect, 
  onConfirm, 
  onCancel,
  title = "Redimensionar Imagem"
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(initialAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [mediaSize, setMediaSize] = useState({ width: 0, height: 0 });

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onMediaLoaded = (mediaSize: { width: number, height: number }) => {
    setMediaSize(mediaSize);
    setAspect(mediaSize.width / mediaSize.height);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async () => {
    try {
      const imgElement = await createImage(image);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx || !croppedAreaPixels) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        imgElement,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      onConfirm(canvas.toDataURL('image/jpeg', 0.95));
    } catch (e) {
      console.error(e);
    }
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const fitImage = () => {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    if (mediaSize.width > 0) {
      setAspect(mediaSize.width / mediaSize.height);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-zinc-950 w-full max-w-5xl sm:rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col h-full sm:h-[85vh] max-h-screen sm:max-h-[800px]">
        
        {/* Header Compacto */}
        <div className="px-6 sm:px-8 py-3 sm:py-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
              <Crop className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase italic tracking-tighter">{title}</h3>
              <p className="text-[8px] sm:text-[9px] font-bold text-zinc-500 uppercase tracking-widest hidden xs:block">Ajuste e salve sem cortes</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 bg-zinc-900 text-zinc-500 hover:text-white rounded-xl transition-all border border-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Área de Edição Central */}
        <div className="relative flex-1 bg-zinc-900/10 overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onMediaLoaded={onMediaLoaded}
            restrictPosition={false}
            minZoom={0.1}
            classes={{
              containerClassName: "bg-transparent",
              mediaClassName: "max-h-full",
            }}
          />
        </div>

        {/* Controles de Precisão Otimizados */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 bg-zinc-950 border-t border-white/10 space-y-4 sm:space-y-6">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
            
            {/* Seletor de Moldura Compacto */}
            <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-white/5 w-full lg:w-auto overflow-x-auto no-scrollbar">
              <button 
                onClick={fitImage}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${aspect === mediaSize.width/mediaSize.height ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> ORIGINAL
              </button>
              <button 
                onClick={() => setAspect(undefined)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${aspect === undefined ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                <Unlock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> LIVRE
              </button>
              <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
              <button onClick={() => setAspect(1)} className={`p-2 rounded-lg transition-all shrink-0 ${aspect === 1 ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-white'}`}><Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
              <button onClick={() => setAspect(16/9)} className={`p-2 rounded-lg transition-all shrink-0 ${aspect === 16/9 ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-white'}`}><RectangleHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
            </div>

            {/* Zoom e Rotação */}
            <div className="flex items-center gap-4 sm:gap-6 flex-1 w-full max-w-sm">
              <div className="flex-1 flex items-center gap-3 sm:gap-4">
                <ZoomIn className="w-4 h-4 text-zinc-600" />
                <input
                  type="range"
                  value={zoom}
                  min={0.1}
                  max={3}
                  step={0.01}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={rotate} 
                  className="p-2 sm:p-3 bg-zinc-900 text-zinc-400 hover:text-blue-500 rounded-xl border border-white/5 transition-all"
                >
                  <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={fitImage} 
                  className="p-2 sm:p-3 bg-zinc-900 text-zinc-400 hover:text-emerald-500 rounded-xl border border-white/5 transition-all"
                >
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Ações Finais - Botão Salvar Visível */}
            <div className="flex gap-2 sm:gap-3 shrink-0 w-full lg:w-auto">
              <button
                onClick={onCancel}
                className="flex-1 lg:flex-none px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-zinc-900 text-zinc-500 font-black uppercase tracking-widest text-[8px] sm:text-[9px] border border-white/5"
              >
                DESCARTAR
              </button>
              <button
                onClick={getCroppedImg}
                className="flex-1 lg:flex-none px-6 sm:px-10 py-3 sm:py-4 rounded-xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[8px] sm:text-[9px] shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 sm:gap-3"
              >
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> SALVAR IMAGEM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageResizerModal;
