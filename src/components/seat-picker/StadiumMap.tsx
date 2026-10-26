import { formatCount } from "@/domain/money";
import { LOW_AVAILABILITY_RATIO } from "@/domain/rules";
import { CATEGORIES, SHOWS_CATEGORY_ON_MAP } from "@/domain/stadium/categories";
import { OUTER_LABELS, SECTIONS } from "@/domain/stadium/sections";
import type { SectionDefinition } from "@/domain/stadium/types";
import type { AvailabilityDTO } from "@/lib/dto";
import styles from "./StadiumMap.module.css";

interface Props {
  availability: AvailabilityDTO;
  selectedId?: string | null;
  onSelect?: (sectionId: string) => void;
  /** Small, non-interactive version used as a "back to map" thumbnail. */
  mini?: boolean;
}

function fillFor(section: SectionDefinition, available: number, selected: boolean) {
  if (section.category === "WP") return "var(--sec-low)";
  if (!section.onSale) return "var(--away)";
  if (selected) return "var(--gold)";
  return available < section.capacity * LOW_AVAILABILITY_RATIO ? "var(--sec-low)" : "var(--sec)";
}

function center(section: SectionDefinition) {
  const s = section.shape;
  return s.kind === "rect" ? { x: s.x + s.w / 2, y: s.y + s.h / 2 } : { x: s.labelX, y: s.labelY };
}

function subLabel(section: SectionDefinition, available: number): string | null {
  if (section.compact || !section.onSale) return null;
  if (SHOWS_CATEGORY_ON_MAP.has(section.category)) return CATEGORIES[section.category].shortName;
  const s = section.shape;
  if (s.kind === "rect" && s.w >= 60 && s.h >= 40) return `${formatCount(available)} פנויים`;
  return null;
}

export function StadiumMap({ availability, selectedId, onSelect, mini = false }: Props) {
  const clipId = mini ? "bowl-mini" : "bowl";
  return (
    <svg
      viewBox="0 0 480 400"
      className={styles.map}
      role={mini ? undefined : "group"}
      aria-label={mini ? undefined : "מפת אצטדיון טדי לפי גושים"}
      aria-hidden={mini || undefined}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="48" y="48" width="384" height="294" rx="52" />
        </clipPath>
      </defs>
      <rect x="48" y="48" width="384" height="294" rx="52" fill="var(--surface)" />
      <rect x="152" y="120" width="176" height="126" fill="var(--pitch)" />
      <g stroke="#fff" strokeOpacity=".55" fill="none" strokeWidth="1.5">
        <rect x="158" y="126" width="164" height="114" />
        <line x1="240" y1="126" x2="240" y2="240" />
        <circle cx="240" cy="183" r="15" />
        <rect x="158" y="160" width="18" height="46" />
        <rect x="304" y="160" width="18" height="46" />
      </g>

      <g clipPath={`url(#${clipId})`}>
        {SECTIONS.map((section) => {
          const info = availability[section.id];
          const available = info?.available ?? 0;
          const selected = section.id === selectedId;
          const fill = fillFor(section, available, selected);
          const shape =
            section.shape.kind === "rect" ? (
              <rect
                x={section.shape.x}
                y={section.shape.y}
                width={section.shape.w}
                height={section.shape.h}
                fill={fill}
              />
            ) : (
              <polygon points={section.shape.points} fill={fill} />
            );

          if (mini)
            return (
              <g key={section.id} className={styles.miniShape}>
                {shape}
              </g>
            );

          const { x, y } = center(section);
          const sub = subLabel(section, available);
          const clickable = section.onSale && available > 0;
          const title = section.onSale
            ? `${section.name} · ${formatCount(available)} פנויים`
            : `${section.name} · סגור למכירה`;
          const select = () => clickable && onSelect?.(section.id);

          return (
            <g
              key={section.id}
              className={styles.section}
              data-disabled={!clickable || undefined}
              role="button"
              tabIndex={clickable ? 0 : -1}
              aria-label={title}
              aria-pressed={selected}
              aria-disabled={!clickable}
              onClick={select}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  select();
                }
              }}
            >
              <title>{title}</title>
              {shape}
              <text
                x={x}
                y={y + (sub ? -2 : section.labelSize ? 2.5 : 4)}
                textAnchor="middle"
                fill={selected ? "#1d1d1f" : "var(--fg)"}
                style={section.labelSize ? { fontSize: section.labelSize } : undefined}
              >
                {section.label}
              </text>
              {sub && (
                <text
                  x={x}
                  y={y + 11}
                  textAnchor="middle"
                  fill={selected ? "#1d1d1f" : "var(--fg)"}
                  className={styles.sub}
                >
                  {sub}
                </text>
              )}
            </g>
          );
        })}
      </g>

      <rect
        x="36"
        y="36"
        width="408"
        height="318"
        rx="64"
        fill="none"
        stroke="var(--fg)"
        strokeWidth="13"
        strokeDasharray="1.3 5.5"
        strokeOpacity=".55"
      />
      <rect
        x="29"
        y="29"
        width="422"
        height="332"
        rx="71"
        fill="none"
        stroke="var(--fg)"
        strokeWidth="1.5"
      />
      <rect
        x="44"
        y="44"
        width="392"
        height="302"
        rx="56"
        fill="none"
        stroke="var(--fg)"
        strokeWidth="7"
      />

      {!mini && (
        <g className={styles.outer} textAnchor="middle" fill="var(--fg)">
          {OUTER_LABELS.map((l) => (
            <text key={l.text} x={l.x} y={l.y + 5}>
              {l.text}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}
