# emu-ram-art :sparkles:

Create nice looking diagrams from emulator rom and visualise its content.

Example image of the Prince of Persia ROM at frame 1000.

![image](/examples/example.png)


Run `npm install` to install needed deps. Use Node 8 (v8.11.2).

## NES

Some facts:
- has 2kb onboard ram
- has 2kb video ram - this is however pretty boring to visualise

Good example ROM's for RAM images:
- Contra (U) [!].nes

Good example ROM's for VRAM images:
- ZZZ_UNK_Bo Jackson Baseball (Bad CHR 02ef4f34).nes

## GameBoy

Some facts:
- has 8kb onboard ram
- has 8kb video ram - this is however pretty boring to visualise

# HOWTO

## Step 1: Dump ROM

Dump a new ROM:

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

### Batch process

Process a bunch of rom files (serial) with
`for f in ./ROMDIRECTORY/*; do node lib/dump-nes/index.js "$f"; done`

.. or parallel:
`find ./ROMDIRECTORY -name '*.nes' | parallel -j 8 node lib/dump-nes/index.js {}`

Then run `./_build.sh`

## TODO

- support more emulators (Sinclair, C64)
- NES: load optional cartridge memory
- more flexible visualizer (layout, framelength)
- the current selection of interesting diagrams is rather primitive (`filterSlots` function), lots of other improvements possible
- bells'n whistles build process (moar tests, CI integration)

## FAQ

- Where can I find ROM files: Official answer "dump the cartridges you own"
