const NESPAL = [
  '#000000',
  '#000000',
];

const LAYOUT = {
  v1: {
    backgroundColor: 'black',
    colorDmdBackground: 'rgba(31,20,17,1)',
    colorDmdForeground: ['rgba(254,233,138,1)'],
    margin: 18,
    dmdFrameWidth: 128,
    dmdFrameHeight: 32,
    dmdFrameMargin: 2,
    dmdFramesHorizontal: 6,
    dmdFramesVertical: 33
  },
  v2: {
    backgroundColor: 'black',
    colorDmdBackground: 'rgba(31,20,17,1)',
    colorDmdForeground: ['rgba(254,233,138,1)'],
    margin: 18 * 2,
    dmdFrameWidth: 128,
    dmdFrameHeight: 32,
    dmdFrameMargin: 2,
    dmdFramesHorizontal: 8,
    dmdFramesVertical: 48
  },
  v3: {
    backgroundColor: 'white',
    colorDmdBackground: 'white',
    colorDmdForeground: NESPAL,
    margin: 64,
    dmdFrameWidth: 128,
    dmdFrameHeight: 32,
    dmdFrameMargin: 8,
    dmdFramesHorizontal: 8*2,
    dmdFramesVertical: 48*2
  },
  v4: {
    backgroundColor: 'white',
    colorDmdBackground: 'white',
    colorDmdForeground: NESPAL,
    margin: 64*3,
    dmdFrameWidth: 128,
    dmdFrameHeight: 32,
    dmdFrameMargin: 8*2,
    dmdFramesHorizontal: 16,
    dmdFramesVertical: 96,
  },
  v5: {
    backgroundColor: 'black',
    colorDmdBackground: 'black',
    colorDmdForeground: NESPAL,
    margin: 64*3,
    dmdFrameWidth: 128,
    dmdFrameHeight: 32,
    dmdFrameMargin: 8*2,
    dmdFramesHorizontal: 20,
    dmdFramesVertical: 96,
    //X = 2880, Y = 4608
    //BIG Poster, 60cm wide, one image is 2.6cm wide and 0.6cm high
  },
};

module.exports = {
  LAYOUT,
};
