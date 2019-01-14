#!/bin/bash
tmux \
  new-session -s backends "cd ~/src/undefined_be ; npm start ; read" \; \
  split-window "cd ~/src/undefined_be ; npm run start:production ; read" \; \
  split-window "cd /var/www/hams-near-me/server ; npm run start:production ; read" \; \
  select-layout even-vertical \; \
  detach