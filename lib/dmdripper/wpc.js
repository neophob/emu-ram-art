const WpcEmuDB = require('wpc-emu').GamelistDB;

function getDbEntry(baseName) {
  const wpcGameEntryName = WpcEmuDB.getAllNames().filter((entry) => {
    const game = WpcEmuDB.getByName(entry);
    if (baseName.toLowerCase() === game.rom.u06.toLowerCase()) {
      return true;
    }

    if (!game.pinmame) {
      return false;
    }

    const alternativeNamesArray = game.pinmame.knownNames.filter((pinmameName) => {
      const pinmameNameLower = pinmameName.toLowerCase();
      return baseName.startsWith(pinmameNameLower);
    });
    return alternativeNamesArray.length > 0;
  })[0];

  if (!wpcGameEntryName) {
    console.error('UNKNOWN ROM File', baseName);
    process.exit(1);
  }
  console.log('load game entry', wpcGameEntryName);
  return WpcEmuDB.getByName(wpcGameEntryName);
}

module.exports = {
  getDbEntry,
};