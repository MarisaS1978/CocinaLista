import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { loadSecuritySettings, sha256, recordAuditLog } from '../services/securityService';

interface SecurityLockScreenProps {
  onUnlock: () => void;
}

export const SecurityLockScreen: React.FC<SecurityLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    setError('');

    const settings = loadSecuritySettings();
    if (!settings.pinHash) {
      // No pin set, unlock immediately
      onUnlock();
      return;
    }

    setIsVerifying(true);
    try {
      const hashedAttempt = await sha256(pin);
      if (hashedAttempt === settings.pinHash) {
        recordAuditLog('DESBLOQUEO_EXITOSO', 'AUTENTICACIÓN', 'Aplicación desbloqueada correctamente mediante PIN');
        onUnlock();
      } else {
        recordAuditLog('INTENTO_FALLIDO_PIN', 'AUTENTICACIÓN', 'Intento de desbloqueo con PIN incorrecto', 'warning');
        setError('PIN incorrecto. Por favor, reintentá.');
        setPin('');
      }
    } catch {
      setError('Error al verificar las credenciales.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-[#263238] animate-in fade-in">
      <div className="max-w-xs w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#39B54A]/15 text-[#1e6328] flex items-center justify-center mx-auto border border-[#39B54A]/30 shadow-md">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-300">
            <span>SOC 2 · ISO 27001 Bloqueo</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#263238]">
            Cocina Lista Protegida
          </h2>
          <p className="text-xs text-[#263238]/70">
            Ingresá tu PIN de seguridad para acceder a tus listas y despensa.
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3 py-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                pin.length > i
                  ? 'bg-[#39B54A] scale-110 shadow-xs'
                  : 'bg-[#263238]/15 border border-[#263238]/20'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-200 animate-in shake">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-13 rounded-2xl bg-white border border-[#263238]/12 text-lg font-bold text-[#263238] hover:bg-[#39B54A]/10 hover:border-[#39B54A]/40 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDelete}
            className="h-13 rounded-2xl bg-white border border-[#263238]/12 text-xs font-bold text-[#263238]/70 hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center"
          >
            Borrar
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-13 rounded-2xl bg-white border border-[#263238]/12 text-lg font-bold text-[#263238] hover:bg-[#39B54A]/10 hover:border-[#39B54A]/40 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            disabled={pin.length < 4 || isVerifying}
            onClick={handleSubmit}
            className="h-13 rounded-2xl bg-[#39B54A] hover:bg-[#329e41] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center"
          >
            {isVerifying ? '...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
