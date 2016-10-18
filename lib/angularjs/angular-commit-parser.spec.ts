import { AngularCommitParser } from './angular-commit-parser';
import { expect } from 'chai';

describe('AngularCommitParser', () => {
  let commitParser: AngularCommitParser;

  beforeEach(() => {
    commitParser = new AngularCommitParser();
  });

  describe('parseMessage()', () => {
    it('should return a Commit with `isRevert` true if the msg starts with "revert:"', () => {
      const commit = commitParser.parseMessage('ABC123\nrevert:fix(abc): some title\nSome body\nSome more body');
      expect(commit.isRevert).to.equal(true);
    });

    it('should extract a Commit from the msg', () => {
      const commit = commitParser.parseMessage('ABC123\nfix(abc): some title\nSome body\nSome more body');
      expect(commit.hash).to.equal('ABC123');
      expect(commit.isRevert).to.equal(false);
      expect(commit.type).to.equal('fix');
      expect(commit.scope).to.equal('abc');
      expect(commit.title).to.equal('some title');
      expect(commit.body).to.equal('Some body\nSome more body');
    });

    it('should extract the Breaking Change block', () => {
      const commit = commitParser.parseMessage('ABC123\nfix(abc): some title\nSome body\nBREAKING CHANGE:\nSome breaking change');
      expect(commit.bcMessage).to.equal('Some breaking change');
    });

    it('should extract the closes markers', () => {
      const commit = commitParser.parseMessage('ABC123\nfix(abc): some title\nSome closes #44 body\nBREAKING CHANGE:\nSome breaking closes abc/def#23 change');
      expect(commit.body).to.equal('Some body');
      expect(commit.bcMessage).to.equal('Some breaking change');
      expect(commit.closes).to.eql(['#44', 'abc/def#23']);
    });
  });
});
