import fs from 'fs';
import path from 'path';
import MaxRectBinPack, { FindPosition } from './../src/index';
import Rect from './../src/rect';

const rects: Rect[] = [];
for (let i = 0; i < 10; i++) {
  const rect = new Rect();
  rect.height = (i + 1) * 10;
  rect.width = 20;
  rects.push(rect);
}

const width = 100;
const height = 300;

const packer = new MaxRectBinPack(width, height, true);
// const result: any[] = [];
// for (const rect of rects) {
//   result.push(packer.insert(rect.width, rect.height, FindPosition.AreaFit));
// }
debugger;
const result = packer.insertRects(rects, FindPosition.AreaFit);

fs.writeFileSync(
  path.join(__dirname, 'data.js'),
  `var data = ${JSON.stringify(result)}`,
  {
    flag: 'w+',
  },
);
