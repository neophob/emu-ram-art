# emu-ram-art :floppy_disk:

Create nice looking diagrams from emulator rom and visualise its content.

![image](/images/dump-Prince of Persia (U).nes-18000.json_1000.png)


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

Note: you can run the script in debug mode by using

```
DEBUG="*" node lib/visualise/index.js ./dump-Mario\ Bros.\ \(JU\)\ \[!\].nes-17999.json
```

## TODO

- support more emulators
- more flexible visualizer (layout, framelength)
- improve rendering speed: using the js canvas lib is not the fastest when rendering
- the current detection of interesting diagrams is rather primitive (filterSlots function), lots of other improvements possible
- add optional header text
- bells'n whistles build process (moar tests, CI integration)

## FAQ

- Where can I find ROM files: Official answer "dump the cartridges you own"
