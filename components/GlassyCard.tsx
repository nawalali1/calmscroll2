interface GlassyCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassyCard({
  children,
  className = '',
  onClick,
}: GlassyCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card-glass cursor-pointer hover:shadow-md transition-all ${className}`}
    >
      {children}
    </div>
  );
}