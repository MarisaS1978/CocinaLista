import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { encodeWeeklyMenuToUrl, generateMenuShareText } from '../services/shareMenuService';
import { X, Share2, Copy, Check, MessageCircle, Smartphone } from 'lucide-react';

export const ShareMenuModal: React.FC = () => {
  const {
    isShareMenuModalOpen,
    setIsShareMenuModalOpen,
    weeklyMenu,
    recipes,
    showToast,
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isShareMenuModalOpen) return null;

  const shareUrl = encodeWeeklyMenuToUrl(weeklyMenu, recipes);
  const shareText = generateMenuShareText(weeklyMenu, recipes, shareUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      showToast('🔗 Enlace copiado al portapapeles', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('Error al copiar enlace', 'warning');
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      showToast('📋 Resumen del menú copiado al portapapeles', 'success');
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      showToast('Error al copiar texto', 'warning');
    }
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Menú Semanal - Cocina Lista',
          text: 'Mirá el menú semanal de comidas planificado en Cocina Lista:',
          url: shareUrl,
        });
        showToast('Menú compartido', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const dayNames: { id: keyof typeof weeklyMenu; label: string }[] = [
    { id: 'lunes', label: 'Lunes' },
    { id: 'martes', label: 'Martes' },
    { id: 'miercoles', label: 'Miércoles' },
    { id: 'jueves', label: 'Jueves' },
    { id: 'viernes', label: 'Viernes' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' },
  ];

  const recipeMap = new Map<string, (typeof recipes)[0]>();
  recipes.forEach(r => recipeMap.set(r.id, r));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#263238]/10 text-[#263238]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#263238]/8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4D96FF]/15 text-[#4D96FF] flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#263238]">
                Compartir menú semanal
              </h2>
              <p className="text-xs text-[#263238]/70 mt-0.5">
                Cualquier persona con este enlace podrá ver o importar tu menú.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsShareMenuModalOpen(false)}
            className="p-1.5 rounded-xl text-[#263238]/50 hover:text-[#263238] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Enlace directo */}
          <div>
            <label className="text-xs font-bold text-[#263238] block mb-1.5">
              Enlace único del menú semanal:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={e => e.target.select()}
                className="flex-1 px-3.5 py-2.5 text-xs bg-[#FFFDF7] border border-[#263238]/20 rounded-xl font-mono text-[#263238]/80 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  copiedLink
                    ? 'bg-[#39B54A] text-white'
                    : 'bg-[#263238] hover:bg-[#34444c] text-white'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Quick share actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Enviar por WhatsApp</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator ? (
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-3 rounded-2xl bg-[#4D96FF]/10 hover:bg-[#4D96FF]/20 border border-[#4D96FF]/30 text-[#2563EB] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[#4D96FF]" />
                <span>Compartir con el celular</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCopyText}
                className="p-3 rounded-2xl bg-[#FFFDF7] hover:bg-slate-100 border border-[#263238]/15 text-[#263238] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedText ? <Check className="w-4 h-4 text-[#39B54A]" /> : <Copy className="w-4 h-4 text-[#4D96FF]" />}
                <span>{copiedText ? '¡Texto copiado!' : 'Copiar texto para chat'}</span>
              </button>
            )}
          </div>

          {/* Preview of week */}
          <div className="border-t border-[#263238]/8 pt-4">
            <span className="text-xs font-bold text-[#263238] block mb-2">
              Resumen de comidas incluidas en el enlace:
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {dayNames.map(d => {
                const dayData = weeklyMenu[d.id];
                const lunchRec = dayData?.almuerzo?.recipeId ? recipeMap.get(dayData.almuerzo.recipeId) : null;
                const lunchName = lunchRec?.name || dayData?.almuerzo?.customName;
                const lunchEmoji = lunchRec?.emoji || dayData?.almuerzo?.customEmoji || '🍽️';

                const dinnerRec = dayData?.cena?.recipeId ? recipeMap.get(dayData.cena.recipeId) : null;
                const dinnerName = dinnerRec?.name || dayData?.cena?.customName;
                const dinnerEmoji = dinnerRec?.emoji || dayData?.cena?.customEmoji || '🍽️';

                return (
                  <div
                    key={d.id}
                    className="p-2.5 rounded-xl bg-[#FFFDF7] border border-[#263238]/10 text-xs flex items-center justify-between gap-2"
                  >
                    <span className="font-bold text-[#263238] w-20 shrink-0">
                      {d.label}
                    </span>
                    <div className="flex-1 grid grid-cols-2 gap-2 text-[11px] truncate">
                      <span className="truncate text-[#263238]/80">
                        {lunchName ? `${lunchEmoji} ${lunchName}` : <em className="text-slate-400">Sin almuerzo</em>}
                      </span>
                      <span className="truncate text-[#263238]/80">
                        {dinnerName ? `${dinnerEmoji} ${dinnerName}` : <em className="text-slate-400">Sin cena</em>}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-[#263238]/8 flex justify-end">
          <button
            type="button"
            onClick={() => setIsShareMenuModalOpen(false)}
            className="px-5 py-2 text-xs font-bold text-white bg-[#263238] hover:bg-[#34444c] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
