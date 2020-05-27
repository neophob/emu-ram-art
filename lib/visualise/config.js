'use strict';

const a3dpi300 = {
  //thats the A3 format, 300dpi, should make a nice poster
  imageWidth: 3508,
  imageHeight: 4960,

  name: 'a3dpi300',

  //yeah this is extreme ugly!
  initialXOffset: (3508 - 5 * (500 + 96) + 96) / 2,
  diagramHeight: 80,
  diagramValueMaxHeight: 64,
  borderSize: 96,

  //widthScaleFactor length of a data point, need to be in sync with diagramWidth
  widthScaleFactor: 1,

  // diagramWidth defines time of a sequence
  diagramWidth: 500,

  //used to reduce height of the diagram
  shr: 2,

  maximalFlatLineFactor: 0.5,

  //diagram style
  borderStyle: 'rgba(0,0,0, 1)',
  backgroundFillStyle: 'rgba(0,0,0, 1)',
  fontFillStyle: '#eceeec',
  fontSize: 30,
  lineWidth: 3,
  strokeStyle: '#eceeec',
  lineJoin: 'round',

  neededDataSets: 270,
};

const a3dpi300_short = {
  //thats the A3 format, 300dpi, should make a nice poster
  imageWidth: 3508,
  imageHeight: 4960,

  name: 'a3dpi300_short',

  //yeah this is extreme ugly!
  initialXOffset: (3508 - 8 * (300 + 96) + 96) / 2,
  diagramHeight: 80,
  diagramValueMaxHeight: 64,
  borderSize: 96,

  //widthScaleFactor length of a data point, need to be in sync with diagramWidth
  widthScaleFactor: 1,

  // diagramWidth defines time of a sequence
  diagramWidth: 300,

  //used to reduce height of the diagram
  shr: 2,

  maximalFlatLineFactor: 0.5,

  //diagram style
  borderStyle: 'rgba(0,0,0, 1)',
  backgroundFillStyle: 'rgba(0,0,0, 1)',
  fontFillStyle: '#eceeec',
  fontSize: 30,
  lineWidth: 3,
  strokeStyle: '#eceeec',
  lineJoin: 'round',

  neededDataSets: 450,
};

const a3dpi1200 = {
  imageWidth: 14032,
  imageHeight: 19842,

  name: 'a3dpi1200',

  initialXOffset: (14032 - 5 * (1000*2 + 96*4) + 96*4) / 2,
  diagramHeight: 80*4,
  diagramValueMaxHeight: 64*4,
  borderSize: 96*4,

  widthScaleFactor: 4,

  diagramWidth: 500 * 1,
  shr: 0,

  maximalFlatLineFactor: 0.5,

  borderStyle: 'rgba(0,0,0, 1)',
  backgroundFillStyle: 'rgba(0,0,0, 1)',
  fontFillStyle: '#eceeec',
  fontSize: 120,
  lineWidth: 5,
  strokeStyle: '#eceeec',
  lineJoin: 'round',

  neededDataSets: 270,
};

const a3dpi1200_10s = {
  imageWidth: 14032,
  imageHeight: 19842,

  name: 'a3dpi1200_10s',

  initialXOffset: (14032 - 5 * (1000*2 + 96*4) + 96*4) / 2,
  diagramHeight: 80*4,
  diagramValueMaxHeight: 64*4,
  borderSize: 96*4,

  widthScaleFactor: 2,

  diagramWidth: 500 * 2,
  shr: 0,

  maximalFlatLineFactor: 0.5,

  borderStyle: 'rgba(0,0,0, 1)',
  backgroundFillStyle: 'rgba(0,0,0, 1)',
  fontFillStyle: '#eceeec',
  fontSize: 120,
  lineWidth: 5,
  strokeStyle: '#eceeec',
  lineJoin: 'round',

  neededDataSets: 270,
};

const a3dpi1200_short = {
  imageWidth: 14032,
  imageHeight: 19842,

  name: 'a3dpi1200_short',

  //yeah this is extreme ugly!
  initialXOffset: (14032 - 8 * (300*4 + 96*4) + 96*4) / 2,
  diagramHeight: 80*4,
  diagramValueMaxHeight: 64*4,
  borderSize: 96*4,

  //widthScaleFactor length of a data point, need to be in sync with diagramWidth
  widthScaleFactor: 4,

  // diagramWidth defines time of a sequence
  diagramWidth: 300,

  //used to reduce height of the diagram
  shr: 0,

  maximalFlatLineFactor: 0.5,

  borderStyle: 'rgba(0,0,0, 1)',
  backgroundFillStyle: 'rgba(0,0,0, 1)',
  fontFillStyle: '#eceeec',
  fontSize: 120,
  lineWidth: 5,
  strokeStyle: '#eceeec',
  lineJoin: 'round',

  neededDataSets: 450,
};

module.exports = {
  a3dpi300,
  a3dpi300_short,
  a3dpi1200,
  a3dpi1200_10s,
  a3dpi1200_short,
};
