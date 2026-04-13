'use client';
import { motion } from 'framer-motion';
import { Coins, Snowflake, ShoppingBag } from 'lucide-react';

interface SoulShopProps {
  soulCoins: number;
  freezes: number;
  onBuyFreeze: () => void;
}

export function SoulShop({ soulCoins, freezes, onBuyFreeze }: SoulShopProps) {
  const canAfford = soulCoins >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <ShoppingBag size={16} className="text-violet-400" />
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Soul Shop</h2>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3 flex items-center gap-3">
          <Coins size={20} className="text-yellow-400 flex-shrink-0" />
          <div>
            <div className="text-yellow-300 font-bold text-lg leading-none">{soulCoins}</div>
            <div className="text-yellow-400/60 text-[10px] uppercase tracking-widest mt-0.5">Soul Coins</div>
          </div>
        </div>
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-3 flex items-center gap-3">
          <Snowflake size={20} className="text-sky-400 flex-shrink-0" />
          <div>
            <div className="text-sky-300 font-bold text-lg leading-none">{freezes}</div>
            <div className="text-sky-400/60 text-[10px] uppercase tracking-widest mt-0.5">Freezes</div>
          </div>
        </div>
      </div>

      {/* Buy Freeze */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Snowflake size={16} className="text-sky-400" />
              <span className="text-white font-semibold text-sm">Streak Freeze</span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              Beschermt je streak als je een dag mist. Wordt automatisch gebruikt.
            </p>
          </div>
          <button
            onClick={onBuyFreeze}
            disabled={!canAfford}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
              canAfford
                ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30 active:scale-95'
                : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'
            }`}
          >
            <Coins size={12} />
            50
          </button>
        </div>
        {!canAfford && (
          <p className="text-white/20 text-[10px] mt-2">
            Je hebt nog {50 - soulCoins} coins nodig.
          </p>
        )}
      </div>

      <p className="text-white/20 text-[10px] text-center">
        Verdien 1 coin per voltooide taak
      </p>
    </motion.div>
  );
}
