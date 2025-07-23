In order to automate the Git release process using **Semantic Release**, it is necessary to follow Git conventions for naming. To achieve this, specific rules have been established not only for commit messages but also for pull request (PR) titles and branch names.

## Pull Request name

PR title can be `feat|fix|refactor|chore|docs(<optional task-id>): <brief description>`

- fix = fixing bugs
- feat = adding, removing or modifying a feature
- refactor = refactoring and optimizing code
- docs = documentation

i.e. `feat(as-123): new ui home, fix: cd pipeline`

## Branch name

Branch name can be `master, main, develop, feat|fix|hotfix|refactor|release|docs/<functionality or task-id>`

- hotfix = quickly fixing critical issues in production
- fix = fixing bug associated to an issue
- feature = adding, removing or modifying a feature
- refactor = refactoring and optimizing code
- release = preparing a new release (tasks such as last touches and revisions)
- docs = writing and modifying documentation.

i.e. `feat/as-123, hotfix/new_home_ui, feat/as-12_new_home_ui`
