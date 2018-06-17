import fs from 'fs';
import path from 'path';
import genetic from './../src/genetic';
import MaxRectBinPack, { FindPosition } from './../src/max-rect-bin-pack';
import Rect from './../src/rect';

const rects: Rect[] = [];
for (let i = 0; i < 10; i++) {
  const rect = new Rect();
  rect.height = (i + 1) * 10;
  rect.width = 20;
  rects.push(rect);
}
const bestNode = genetic(rects, {
  findPosition: FindPosition.ShortSideFit,
  lifeTimes: 10,
  liveRate: 0.5,
  size: 20,
});
console.log(JSON.stringify(bestNode));
const width = bestNode.x; //Math.sqrt(size);
const height = bestNode.y; //size / width;

const packer = new MaxRectBinPack(width, height, true);
// const result: any[] = [];
// for (const rect of rects) {
//   result.push(packer.insert(rect.width, rect.height, FindPosition.AreaFit));
// }
let rectslength = rects.length;
const result = packer.insertRects(rects, FindPosition.ShortSideFit);
console.log(result.length === rectslength);
fs.writeFileSync(
  path.join(__dirname, 'data.js'),
  `var data = ${JSON.stringify(result)}`,
  {
    flag: 'w+',
  },
);
