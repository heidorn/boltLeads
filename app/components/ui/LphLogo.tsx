import { classNames } from '~/utils/classNames';

/*
 * Lockup oficial Leads Per Hour: símbolo (os dois "L" que formam o raio, dentro
 * do quadrado arredondado coral) + wordmark "Leads" / "PER / HOUR".
 *
 * O wordmark é texto — herda a cor do contexto e adapta sozinho entre os temas.
 * Não substitua por imagem: o SVG do símbolo é o arquivo de marca.
 */

interface LphSymbolProps {
  className?: string;
}

export function LphSymbol({ className }: LphSymbolProps) {
  return (
    <svg
      viewBox="483 486 116 116"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Leads Per Hour"
      className={classNames('flex-none', className)}
    >
      <defs>
        <linearGradient
          id="lphMarkGradient"
          x1="489.38"
          y1="492.91"
          x2="592.76"
          y2="596.3"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".04" stopColor="#e06c3b" />
          <stop offset=".42" stopColor="#e05e3b" />
          <stop offset="1" stopColor="#e04131" />
        </linearGradient>
      </defs>
      <path
        fill="url(#lphMarkGradient)"
        d="M498.29,488.78l7.28-.58c22.97-1.85,46.06-1.85,69.03,0l7.27.58c6.92.56,12.42,6.04,12.99,12.96l.53,6.37c1.94,23.57,1.94,47.27,0,70.84l-.54,6.53c-.56,6.85-5.96,12.3-12.8,12.95l-1.71.16c-26.77,2.51-53.72,2.51-80.5,0l-1.72-.16c-6.84-.64-12.24-6.1-12.8-12.95l-.55-6.65c-1.93-23.49-1.93-47.1,0-70.6l.53-6.49c.57-6.92,6.07-12.41,12.99-12.97Z"
      />
      <path
        fill="#fff"
        d="M538.38,512.14h17.7c1.01,0,1.65,1.1,1.15,1.98h0s-10.08,18.33-10.08,18.33c-.15.28-.4.49-.69.6l-12.02,4.55,10.11-.24,17.7.03c1.02,0,1.65,1.1,1.14,1.98l-20.27,35.11c-.24.41-.67.66-1.15.66h-18.05c-1.02,0-1.66-1.11-1.14-1.99l9.97-17.08c.14-.24.35-.43.61-.54l11.99-5.26h-10.01s-17.43-.04-17.43-.04c-1.02,0-1.65-1.1-1.14-1.98l20.46-35.44c.24-.41.67-.66,1.15-.66Z"
      />
    </svg>
  );
}

interface LphLogoProps {
  /** Esconde o wordmark e deixa só o símbolo — para barras estreitas. */
  symbolOnly?: boolean;
  className?: string;
  symbolClassName?: string;
}

export function LphLogo({ symbolOnly = false, className, symbolClassName }: LphLogoProps) {
  return (
    <span className={classNames('flex items-center gap-[9px]', className)}>
      <LphSymbol className={classNames('w-7 h-7', symbolClassName)} />
      {!symbolOnly && (
        <span className="flex flex-col leading-none">
          <b className="font-display font-bold text-[14.5px] tracking-[-0.01em] text-bolt-elements-textPrimary">
            Leads
          </b>
          <small className="text-[8px] font-semibold tracking-[0.6px] mt-[2px] text-bolt-elements-textTertiary">
            PER / HOUR
          </small>
        </span>
      )}
    </span>
  );
}
