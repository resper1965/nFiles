"use client";

const dot = <span className="text-ness-dot">.</span>;

/**
 * Marca "ness." — Montserrat Medium; "ness" na cor do texto (preto/branco conforme fundo); "." em #00ade8.
 */
export function NessBrand({
  className = "",
  textClassName = "text-foreground",
}: {
  className?: string;
  /** Classe para a parte "ness" (ex.: text-foreground ou text-sidebar-foreground). */
  textClassName?: string;
}) {
  return (
    <span className={`font-montserrat font-medium ${className}`}>
      <span className={textClassName}>ness</span>
      {dot}
    </span>
  );
}

/**
 * Marca "n.files" — mesma lógica: Montserrat Medium; "n" e "files" na cor do texto; "." em #00ade8.
 */
export function NFilesBrand({
  className = "",
  textClassName = "text-foreground",
}: {
  className?: string;
  /** Classe para as partes de texto (ex.: text-foreground ou text-sidebar-foreground). */
  textClassName?: string;
}) {
  return (
    <span className={`font-montserrat font-medium ${className}`}>
      <span className={textClassName}>n</span>
      {dot}
      <span className={textClassName}>files</span>
    </span>
  );
}
