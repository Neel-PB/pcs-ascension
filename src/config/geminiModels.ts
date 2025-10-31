export function getAbbreviatedModelName(fullName: string): string {
  const modelMap: Record<string, string> = {
    'google/gemini-2.5-flash': 'Flash',
    'google/gemini-2.5-pro': 'Pro',
    'google/gemini-2.5-flash-lite': 'Lite',
    'openai/gpt-5': 'GPT-5',
    'openai/gpt-5-mini': 'GPT-5 Mini',
    'openai/gpt-5-nano': 'GPT-5 Nano',
  };

  return modelMap[fullName] || fullName;
}
