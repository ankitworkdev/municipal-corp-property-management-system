type Props = {
  name?: string;
  imageUrl?: string | null;
  size?: number;
  square?: boolean;
};

export function ListAvatar({ name, imageUrl, size = 32, square = false }: Props) {
  const initial = (name || "?").trim()[0]?.toUpperCase() || "?";
  const radius = square ? 8 : "50%";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="list-avatar-img"
        width={size}
        height={size}
        loading="lazy"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: "cover",
          flexShrink: 0,
          background: "#f5f3f1",
        }}
      />
    );
  }

  return (
    <span
      className="list-avatar-fallback"
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.38),
        fontWeight: 600,
        color: "#fff",
        background: "linear-gradient(135deg, #e05d36, #f0a060)",
      }}
    >
      {initial}
    </span>
  );
}

export function NameWithAvatar({
  name,
  imageUrl,
  subtitle,
  square,
}: {
  name: string;
  imageUrl?: string | null;
  subtitle?: string;
  square?: boolean;
}) {
  return (
    <div className="name-with-avatar" style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <ListAvatar name={name} imageUrl={imageUrl} square={square} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        {subtitle && (
          <div style={{ fontSize: 11, color: "#7c7570", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
