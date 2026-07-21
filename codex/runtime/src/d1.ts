/**
 * The small D1 surface ProofLab's Sites route handlers use.
 *
 * Keep route code dependent on this interface rather than a framework-specific
 * context. The final Sites-compatible framework adapter injects the `DB`
 * binding named in ../.openai/hosting.json.
 */
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
