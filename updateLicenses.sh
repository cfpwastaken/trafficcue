#!/bin/sh
bunx license-report --output=json > public/licenses.json
rm -r public/licenses/
bunx license-downloader --source public/licenses.json --licDir public/licenses/ --download