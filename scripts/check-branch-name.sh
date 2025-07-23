#!/bin/bash

# get current branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

# define branch name pattern
BRANCH_PATTERN="^(master|main|develop){1}$|^(feat|fix|hotfix|refactor|release|docs)\/.+$"
# branch name can be master, main, develop, feat|fix|hotfix|refactor|release|docs/<functionality> (where functionality probably is task id)
# hotfix = quickly fixing critical issues in production
# fix = fixing bug associated to an issue
# feature = adding, removing or modifying a feature
# refactor = refactoring and optimizing code
# release = preparing a new release (tasks such as last touches and revisions)
# docs = writing and modifying documentation.


# check
if [[ ! $BRANCH_NAME =~ $BRANCH_PATTERN ]]; then
  echo "Error: branch name '$BRANCH_NAME' doesn't match the convention."
  echo "You should use: <type>/<functionality> (where functionality probably is task id)."
  echo "type is one of feat|fix|hotfix|refactor|release|docs."
  echo "i.e. feat/as-123, hotfix/new_home_ui, feat/as-12_new_home_ui"
  exit 1
fi

exit 0