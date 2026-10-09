import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // If already installed, don't show the install button
  if (isInstalled) {
    return null;
  }

  // Handle Chrome / Android direct prompt flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#39B54A]/12 text-[#238032] hover:bg-[#39B54A]/20 border border-[#39B54A]/30 transition-all cursor-pointer shadow-xs ${className}`}
        title="Instalar Cocina Lista en tu dispositivo"
      >
        <Download className="w-3.5 h-3.5 text-[#39B54A]" />
        <span>{compact ? 'Instalar' : 'Instalar app'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#39B54A]/12 text-[#238032] hover:bg-[#39B54A]/20 border border-[#39B54A]/30 transition-all cursor-pointer shadow-xs ${className}`}
          title="Instalar en iPhone o iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#39B54A]" />
          <span>{compact ? 'Instalar' : 'Instalar app'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#263238]/10 text-[#263238] max-h-[88vh] overflow-y-auto my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#263238]/8">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/pwa-192x192.png"
                    alt="Cocina Lista"
                    className="w-10 h-10 rounded-xl shadow-xs"
                  />
                  <div>
                    <h3 className="text-base font-bold text-[#263238]">
                      Instalar Cocina Lista
                    </h3>
                    <p className="text-[11px] text-[#263238]/60">
                      En tu iPhone o iPad
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-xl text-[#263238]/40 hover:text-[#263238] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-[#263238]/85">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FFFDF7] border border-[#263238]/10">
                  <span className="w-6 h-6 rounded-full bg-[#4D96FF]/20 text-[#4D96FF] font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-[#263238]">
                      Tocá el botón Compartir
                    </p>
                    <p className="text-[11px] text-[#263238]/60 mt-0.5 flex items-center gap-1">
                      El ícono <Share2 className="w-3.5 h-3.5 inline text-[#4D96FF]" /> en la barra inferior de Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FFFDF7] border border-[#263238]/10">
                  <span className="w-6 h-6 rounded-full bg-[#39B54A]/20 text-[#39B54A] font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-[#263238]">
                      Seleccioná &ldquo;Agregar a pantalla de inicio&rdquo;
                    </p>
                    <p className="text-[11px] text-[#263238]/60 mt-0.5">
                      Deslizá hacia abajo en el menú y elegí esa opción.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FFFDF7] border border-[#263238]/10">
                  <span className="w-6 h-6 rounded-full bg-[#FFD447]/40 text-[#b58c0c] font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-[#263238]">
                      ¡Listo!
                    </p>
                    <p className="text-[11px] text-[#263238]/60 mt-0.5">
                      Cocina Lista aparecerá como app nativa en tu pantalla con su ícono propio.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-[#39B54A] hover:bg-[#329e41] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback on desktop / other browsers when ambient badge or menu option applies
  return (
    <>
      <button
        onClick={() => setShowAndroidGuide(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#39B54A]/10 text-[#238032] hover:bg-[#39B54A]/18 border border-[#39B54A]/25 transition-all cursor-pointer shadow-xs ${className}`}
        title="Instalar Cocina Lista en tu inicio"
      >
        <Download className="w-3.5 h-3.5 text-[#39B54A]" />
        <span>{compact ? 'Instalar' : 'Instalar app'}</span>
      </button>

      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#263238]/10 text-[#263238] max-h-[88vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#263238]/8">
              <div className="flex items-center gap-2.5">
                <img
                  src="/pwa-192x192.png"
                  alt="Cocina Lista"
                  className="w-10 h-10 rounded-xl shadow-xs"
                />
                <div>
                  <h3 className="text-base font-bold text-[#263238]">
                    Instalar Cocina Lista
                  </h3>
                  <p className="text-[11px] text-[#263238]/60">
                    En Android / Chrome
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="p-1 rounded-xl text-[#263238]/40 hover:text-[#263238] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-[#263238]/85">
              <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#263238]/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#263238]">
                  <CheckCircle2 className="w-4 h-4 text-[#39B54A]" />
                  <span>Desde Google Chrome:</span>
                </div>
                <p className="text-[11px] text-[#263238]/70 leading-relaxed">
                  1. Tocá el menú de los <strong>tres puntos ⋮</strong> arriba a la derecha.
                  <br />
                  2. Seleccioná <strong>&ldquo;Agregar a la pantalla de inicio&rdquo;</strong> o <strong>&ldquo;Instalar aplicación&rdquo;</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#39B54A]/8 border border-[#39B54A]/25 text-[11px] text-[#1c6628]">
                <span>✨</span>
                <span>Se abrirá a pantalla completa sin barra de navegación, con acceso rápido y soporte sin conexión.</span>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#39B54A] hover:bg-[#329e41] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </>
  );
};
