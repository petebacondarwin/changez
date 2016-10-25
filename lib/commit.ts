export interface Issue {
  org?: string;
  repo?: string;
  id: string;
}

export class Commit {
  hash: string;
  isRevert: boolean = false;
  revertCommit: Commit;
  type: string;
  scope: string;
  title: string;
  body: string;
  bcMessage: string;
  closes: Issue[];

  constructor(public raw: string = '') {}

  toString() {
    const revertMarker = this.isRevert ? 'revert:' : '';
    return `${revertMarker}${this.type}(${this.scope}): ${this.title}`;
  }
}

