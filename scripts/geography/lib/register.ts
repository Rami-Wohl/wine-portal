import { ImportError } from "./import-error";
import type { MappingEntry } from "./mapping-schemas";

// The INAO product register (CSV): the identity authority for id_app/id_denom, labels and sign
// while the shapefile edition carries blank key fields.

export function parseCsv(text: string, delimiter = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export interface RegisterRow {
  id_appellation: number;
  appellation: string;
  id_denomination_geo: number;
  denomination: string;
  signe_fr: string;
  secteur: string;
  categorie: string;
  produit: string;
}

export interface RegisterIndex {
  byIdPair: Map<string, RegisterRow[]>;
  /** Viticultural denominations by label, to detect a label that names two different areas. */
  idPairsByDenomination: Map<string, Set<string>>;
}

export function indexRegister(csvText: string, delimiter = ","): RegisterIndex {
  const [header, ...lines] = parseCsv(csvText, delimiter);
  const column = (name: string): number => {
    const index = header.indexOf(name);
    if (index < 0) throw new ImportError(`The product register has no column '${name}'`);
    return index;
  };
  const columns = {
    id_appellation: column("id_appellation"),
    appellation: column("appellation"),
    id_denomination_geo: column("id_denomination_geo"),
    denomination: column("denomination"),
    signe_fr: column("signe_fr"),
    secteur: column("secteur"),
    categorie: column("categorie"),
    produit: column("produit"),
  };
  const byIdPair = new Map<string, RegisterRow[]>();
  const idPairsByDenomination = new Map<string, Set<string>>();
  for (const line of lines) {
    if (line.length < header.length) continue;
    const row: RegisterRow = {
      id_appellation: Number(line[columns.id_appellation]),
      appellation: line[columns.appellation].trim(),
      id_denomination_geo: Number(line[columns.id_denomination_geo]),
      denomination: line[columns.denomination].trim(),
      signe_fr: line[columns.signe_fr].trim(),
      secteur: line[columns.secteur].trim(),
      categorie: line[columns.categorie].trim(),
      produit: line[columns.produit].trim(),
    };
    const pair = `${row.id_appellation}/${row.id_denomination_geo}`;
    byIdPair.set(pair, [...(byIdPair.get(pair) ?? []), row]);
    if (row.secteur === "VITICOLE") {
      const pairs = idPairsByDenomination.get(row.denomination) ?? new Set<string>();
      pairs.add(pair);
      idPairsByDenomination.set(row.denomination, pairs);
    }
  }
  return { byIdPair, idPairsByDenomination };
}

/** Confirm the mapping's id pair, labels and sign against the register; returns problems. */
export function verifyAgainstRegister(entry: MappingEntry, register: RegisterIndex): string[] {
  const key = entry.feature_key;
  const expectedAppellation = entry.register_labels?.appellation ?? key.app;
  const expectedDenomination = entry.register_labels?.denomination ?? key.denom;
  const pair = `${key.id_app}/${key.id_denom}`;
  const rows = register.byIdPair.get(pair);
  const issues: string[] = [];
  if (!rows || rows.length === 0) {
    return [
      `${entry.entity}: the product register has no row for id_appellation ${key.id_app} / id_denomination_geo ${key.id_denom}`,
    ];
  }
  for (const row of rows) {
    if (row.appellation !== expectedAppellation) {
      issues.push(
        `${entry.entity}: register appellation '${row.appellation}' differs from expected '${expectedAppellation}' for ${pair}`,
      );
    }
    if (row.denomination !== expectedDenomination) {
      issues.push(
        `${entry.entity}: register denomination '${row.denomination}' differs from expected '${expectedDenomination}' for ${pair}`,
      );
    }
    if (row.signe_fr !== key.signe) {
      issues.push(
        `${entry.entity}: register sign '${row.signe_fr}' differs from expected '${key.signe}' for ${pair}`,
      );
    }
    if (row.secteur !== "VITICOLE") {
      issues.push(`${entry.entity}: register sector '${row.secteur}' is not VITICOLE for ${pair}`);
    }
  }
  const sameLabel = register.idPairsByDenomination.get(expectedDenomination);
  if (sameLabel && (sameLabel.size > 1 || !sameLabel.has(pair))) {
    issues.push(
      `${entry.entity}: the denomination label '${expectedDenomination}' belongs to ${Array.from(sameLabel).join(", ")} in the register; the label alone is ambiguous`,
    );
  }
  return Array.from(new Set(issues));
}
