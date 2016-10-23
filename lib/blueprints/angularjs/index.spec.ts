import {AngularBlueprint} from '.';
import { expect } from 'chai';

describe('AngularBlueprint', () => {
  let blueprint: AngularBlueprint;

  beforeEach(() => {
    blueprint = new AngularBlueprint();
  });

  describe('parseMessage()', () => {
    it('should return a Commit with `isRevert` true if the msg starts with "revert:"', () => {
      const commit = blueprint.parseMessage('ABC123\nrevert:fix(abc): some title\nSome body\nSome more body');
      expect(commit.isRevert).to.equal(true);
    });

    it('should return a Commit with `isRevert` true if the msg starts with "Revert "', () => {
      const commit = blueprint.parseMessage('ABC123\nRevert "fix(abc): some title"\nSome body\nSome more body');
      expect(commit.isRevert).to.equal(true);
    });

    it('should strip any double quotes from around the revert header', () => {
      const commit = blueprint.parseMessage('ABC123\nRevert "fix(abc): some title"\nSome body\nSome more body');
      expect(commit.type).to.equal('fix');
      expect(commit.type).to.equal('fix');
      expect(commit.scope).to.equal('abc');
      expect(commit.title).to.equal('some title');
      expect(commit.body).to.equal('Some body\nSome more body');
    });

    it('should extract a Commit from the msg', () => {
      const commit = blueprint.parseMessage('ABC123\nfix(abc): some title\nSome body\nSome more body');
      expect(commit.hash).to.equal('ABC123');
      expect(commit.isRevert).to.equal(false);
      expect(commit.type).to.equal('fix');
      expect(commit.scope).to.equal('abc');
      expect(commit.title).to.equal('some title');
      expect(commit.body).to.equal('Some body\nSome more body');
    });

    it('should extract the Breaking Change block', () => {
      const commit = blueprint.parseMessage('ABC123\nfix(abc): some title\nSome body\nBREAKING CHANGE:\nSome breaking change');
      expect(commit.bcMessage).to.equal('Some breaking change');
    });

    it('should extract the closes markers', () => {
      const commit = blueprint.parseMessage('ABC123\nfix(abc): some title\nSome closes #44 body\nBREAKING CHANGE:\nSome breaking closes abc/def#23 change');
      expect(commit.body).to.equal('Some body');
      expect(commit.bcMessage).to.equal('Some breaking change');
      expect(commit.closes).to.eql(['#44', 'abc/def#23']);
    });
  });
});
