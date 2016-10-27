/**
 * Represents information about an issue or pull request
 * that was referenced in a commit.
 */
export interface Issue {
  /**
   * The name of the github organization where this issue appears
   */
  org?: string;
  /**
   * The name of the github repository where this issue appears
   */
  repo?: string;
  /**
   * The id/number of the issue
   */
  id: string;
}

/**
 * Represents a parsed commit
 */
export class Commit {
  /**
   * The unique SHA that identifies this commit
   */
  hash: string;
  /**
   * Does this commit revert another commit?
   */
  isRevert: boolean = false;
  /**
   * If this commit reverts another commit then this field holds
   * information about the original commit.
   */
  revertCommit: Commit;
  /**
   * The type of change that this commit represents, e.g. a fix or a feature, etc.
   */
  type: string;
  /**
   * The software entity that is affected by this commit.
   */
  scope: string;
  /**
   * The title (or subject) of this commit; usually a brief description.
   */
  title: string;
  /**
   * The main description of the change.
   */
  body: string;
  /**
   * Any breaking change information, if this commit constitutes a breaking change.
   */
  bcMessage: string;
  /**
   * A collection of issues that were extracted from the commit message.
   */
  closes: Issue[];

  /**
   * Create a new commit providing the original raw commit message.
   * The blueprint will be responsible for populating the other properties as part of
   * its parsing.
   */
  constructor(public raw: string = '') {}

  /**
   * Generate a human readable representation of this commit
   */
  toString() {
    const revertMarker = this.isRevert ? 'revert:' : '';
    return `${revertMarker}${this.type}(${this.scope}): ${this.title}`;
  }
}

