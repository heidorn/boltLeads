const MAX_BUILD_OUTPUT_CHARS = 4000;

export function formatBuildFailureOutput(output?: string) {
  const trimmed = output?.trim();

  if (!trimmed) {
    return 'Não foi possível concluir o build e nenhuma saída foi capturada.';
  }

  if (trimmed.length <= MAX_BUILD_OUTPUT_CHARS) {
    return trimmed;
  }

  return `Saída do build (truncada):\n${trimmed.slice(-MAX_BUILD_OUTPUT_CHARS)}`;
}
