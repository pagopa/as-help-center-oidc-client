#!/bin/bash

# set echo color
RED='\033[0;31m'
NOCOLOR='\033[0m'

# Check all required parameters
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <PR_TITLE>"
  exit 1
fi

PR_TITLE=$1

# Define PR title pattern
TITLE_PATTERN="^(feat|refactor|fix|docs)(\([^)]*\))?: .+$"
# PR title can be feat|fix|refactor|chore|docs(<optional task-id>): <brief description>
# fix = fixing bugs
# feat = adding, removing or modifying a feature
# refactor = refactoring and optimizing code
# docs = documentation

# Check
if [[ ! "$PR_TITLE" =~ $TITLE_PATTERN ]]; then
  echo "${RED}Error: Pull Request title doesn't match convention.${NOCOLOR}"
  echo "You should use: <type>(<optional id-task>): <description>"
  echo "Type is one of feat|refactor|fix|chore|docs"
  echo "i.e. feat(as-123): new ui home, fix: cd pipeline"
  exit 1
else
  echo "Pull Request title is valid."
fi