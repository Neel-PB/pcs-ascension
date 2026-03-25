/** Maps API tool names to short nouns for "Running …" / "Ran …" copy. */
export function toolTargetLabel(apiName: string): string {
  switch (apiName) {
    case 'resolve_scope':
      return 'Scope';
    case 'get_positions':
      return 'Positions';
    case 'list_scope':
      return 'Scope list';
    case 'get_staffing_kpi_definitions':
      return 'Staffing KPI definitions';
    case 'get_staffing_view_snapshot':
      return 'Staffing snapshot';
    default:
      return apiName.replace(/_/g, ' ');
  }
}

/** Verb + target for one tool line (e.g. Ran / Scope). */
export function toolActivityParts(
  apiName: string,
  phase: 'running' | 'done',
  displayTarget?: string,
): { verb: string; target: string } {
  return {
    verb: phase === 'running' ? 'Running' : 'Ran',
    target: displayTarget ?? toolTargetLabel(apiName),
  };
}

export function toolActivityPhrase(
  apiName: string,
  phase: 'running' | 'done',
  displayTarget?: string,
): string {
  const { verb, target } = toolActivityParts(apiName, phase, displayTarget);
  return `${verb} ${target}`;
}
