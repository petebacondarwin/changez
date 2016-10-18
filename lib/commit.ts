export class Commit {
  hash: string;
  isRevert: boolean = false;
  revertCommit: Commit;
  type: string;
  scope: string;
  title: string;
  body: string;
  bcMessage: string;
  closes: string[];

  toString() {
    return `${this.isRevert?'revert:':''}${this.type}(${this.scope}): ${this.title}`;
  }
}

