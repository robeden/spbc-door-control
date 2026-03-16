interface ChurchLogoProps {
  className?: string;
}

export function ChurchLogo({ className = '' }: ChurchLogoProps) {
  return (
    <div className={`church-logo ${className}`}>
      <img src="/logo.png" alt="Church Logo" />
    </div>
  );
}
