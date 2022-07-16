source .env ; env -S "`cat .env`"
tmux new-session \; \
  send-keys "$BROWSER" ' http://localhost:8888 &' C-m \; \
  split-window -v -p 10 \; \
  send-keys 'python3 -m http.server --bind 0.0.0.0 8888' C-m \; \
  select-pane -U \; \
  send-keys '/bin/vim `pwd`' C-m \; \
