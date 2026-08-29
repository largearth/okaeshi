#!/bin/sh

set -eu

if [ "$#" -ne 3 ]; then
  echo "usage: $0 <issue-number> <title> <body-file>" >&2
  exit 2
fi

case "$1" in
  "" | *[!0-9]*)
    echo "issue-number must contain only digits: $1" >&2
    exit 2
    ;;
esac

case "$3" in
  .plans/*.md) ;;
  *)
    echo "body-file must be a Markdown file under .plans/" >&2
    exit 2
    ;;
esac

if [ ! -f "$3" ]; then
  echo "body-file does not exist: $3" >&2
  exit 2
fi

exec gh pr create \
  --repo largearth/okaeshi \
  --base develop \
  --head "$1" \
  --title "$2" \
  --body-file "$3"
