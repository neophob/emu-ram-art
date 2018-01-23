# emu-ram-art

Run `npm install` to install needed deps.

# NES

## Step 1: Dump ROM

Example - dump a new ROM:

```
node ./lib/dump-nes/index.js Mario\ Bros.\ \(JU\)\ \[!\].nes 18000
```

## Step 2: Visualise Dump

```
node lib/visualise/index.js ./dump-Mario\ Bros.\ \(JU\)\ \[!\].nes-17999.json
```

## TODO

- support more emulators
- more flexible visualizer (layout, add rom name, framelength)
- using the js canvas lib is not the fastest when rendering
