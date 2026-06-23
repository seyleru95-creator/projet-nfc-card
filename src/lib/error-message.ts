export function toUserMessage(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    return "Erreur lors de l'opération. Veuillez réessayer.";
  }
  if (err instanceof Error) {
    return "Une erreur est survenue. Veuillez réessayer.";
  }
  return "Une erreur est survenue.";
}
