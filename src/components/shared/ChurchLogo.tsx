import logoUrl from '/logo.png';

interface ChurchLogoProps {
  className?: string;
}

export function ChurchLogo({ className = '' }: ChurchLogoProps) {
  return (
    <div className={`church-logo ${className}`}>
      <img src={logoUrl} alt="Church Logo" />
    </div>
  );
}
