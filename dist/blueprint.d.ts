import { Commit } from './commit';
import { Environment } from 'nunjucks';
/**
 * Implement this interface to teach Changez how to parse commits and rendering
 * the changelog.
 */
export interface IBlueprint {
    /**
     * The name of the blueprint
     */
    name: string;
    /**
     * The folder that contains the templates for the output
     */
    getTemplateFolder(): string;
    /**
     * The name of the template that is the starting point for output
     */
    getTemplateName(): string;
    /**
     * Returns a commit object given a raw git log message, which is in
     * a format given by `"%H%n%s%n%b"`
     */
    parseMessage(message: string): Commit;
    /**
     * Return true if the commit should be included in the changelog
     */
    filterCommit(commit: Commit): boolean;
    /**
     * Return true if the two commits match, in a way that is custom
     * to this blueprint. E.g. this could compare the commit SHAs
     * but more likely it will be a more relaxed comparison of the
     * commit message.
     *
     * This is used to filter out commits that were cherry picked from
     * another branch and have already been included in a changelog
     * release.
     */
    compareCommits(left: Commit, right: Commit): boolean;
    /**
     * Make changes to the rendering environment.
     * This can be used to register custom tags or filters, for example.
     */
    configureRenderer?(env: Environment): any;
}
