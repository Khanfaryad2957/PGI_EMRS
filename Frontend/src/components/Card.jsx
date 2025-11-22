const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`relative backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-2xl transition-all duration-300 hover:bg-white/80 hover:shadow-3xl ${className}`}
      style={{ zIndex: 'auto' }}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-white/30 backdrop-blur-sm bg-white/30 flex justify-between items-start">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="px-6 py-4 overflow-visible" style={{ zIndex: 'auto' }}>{children}</div>
    </div>
  );
};

export default Card;

