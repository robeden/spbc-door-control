interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'unlock' | 'lock' | 'next' | 'cancel';
  className?: string;
}

export function Button({
  label,
  onClick,
  disabled = false,
  variant = 'unlock',
  className = ''
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
