#!/bin/sh

set -eu

if [ "$#" -ne 0 ]; then
  echo "usage: $0" >&2
  exit 2
fi

branch="$(git branch --show-current)"

case "$branch" in
  "" | *[!0-9]*)
    echo "current branch must be a GitHub Issue number: $branch" >&2
    exit 2
    ;;
esac

exec git push --set-upstream origin "$branch"
