let _fnCounter = 0;
let _rowCounter = 0;
let _linkCounter = 0;

export function createFunctionId(): string {
  return `fn-${++_fnCounter}`;
}

export function createRowId(step: 1 | 2): string {
  return `s${step}-${++_rowCounter}`;
}

export function createLinkId(): string {
  return `l${++_linkCounter}`;
}
