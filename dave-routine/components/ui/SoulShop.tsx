'use client';
import { Coins, Snowflake } from 'lucide-react';

interface SoulShopProps {
  soulCoins: number;
  freezes: number;
  onBuyFreeze: () => void;
}

export function SoulShop({ soulCoins, freezes, onBuyFreeze }: SoulShopProps) {
  const canAfford = soulCoins >= 50;

  return (
    <div className="bg-surface border border-border rounded-card p-5 space-y-4">
      <h2 className="text-text font-semibold text-[15px]">Soul Shop</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-2 border border-border rounded-control p-3 flex items-center gap-2.5">
          <Coins size={18} className="text-accent flex-shrink-0" />
          <div>
            <div className="tnum text-text font-semibold text-base leading-none">{soulCoins}</div>
            <div className="text-text-tertiary text-[10px] mt-0.5">Soul Coins</div>
          </div>
        </div>
        <div className="bg-surface-2 border border-border rounded-control p-3 flex items-center gap-2.5">
          <Snowflake size={18} className="text-text-secondary flex-shrink-0" />
          <div>
            <div className="tnum text-text font-semibold text-base leading-none">{freezes}</div>
            <div className="text-text-tertiary text-[10px] mt-0.5">Freezes</div>
          </div>
        </div>
      </div>

      <div className="bg-surface-2 border border-border rounded-control p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Snowflake size={14} className="text-text-secondary" />
              <span className="text-text font-medium text-sm">Streak Freeze</span>
            </div>
            <p className="text-text-tertiary text-xs leading-relaxed">
              Beschermt je streak als je een dag mist. Wordt automatisch gebruikt.
            </p>
          </div>

          {freezes >= 3 ? (
            <div className="tnum flex-shrink-0 text-text-tertiary font-semibold text-xs bg-white/[0.04] px-3 py-2 rounded-control text-center">
              3/3
            </div>
          ) : (
            <button
              onClick={onBuyFreeze}
              disabled={!canAfford}
              className={`tap flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-control font-semibold text-xs ${
                canAfford
                  ? 'bg-accent text-accent-ink'
                  : 'bg-white/[0.04] text-text-tertiary/50 cursor-not-allowed'
              }`}
            >
              <Coins size={12} />
              50
            </button>
          )}
        </div>
        {!canAfford && freezes < 3 && (
          <p className="text-text-tertiary text-[11px] mt-2">
            Nog {50 - soulCoins} coins nodig.
          </p>
        )}
      </div>

      <p className="text-text-tertiary text-[11px] text-center">
        Verdien 1 coin per voltooide categorie
      </p>
    </div>
  );
}
