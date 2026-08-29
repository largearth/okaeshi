#!/bin/sh

set -eu

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <title> <body-file>" >&2
  exit 2
fi

case "$2" in
  .plans/*.md) ;;
  *)
    echo "body-file must be a Markdown file under .plans/" >&2
    exit 2
    ;;
esac

if [ ! -f "$2" ]; then
  echo "body-file does not exist: $2" >&2
  exit 2
fi

exec gh issue create \
  --repo largearth/okaeshi \
  --title "$1" \
  --body-file "$2"
