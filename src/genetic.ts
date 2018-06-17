import MaxRectBinPack, { FindPosition } from './max-rect-bin-pack';
import Rect from './rect';

export interface IGeneticOptions {
  lifeTimes: number;
  size: number;
  findPosition: FindPosition;
  liveRate: number;
}

interface IPoint {
  x: number;
  y: number;
}

interface ICalResult {
  dot: IPoint;
  fitAll: boolean;
  occupancy: number;
}

export class Genetic {
  private rects: Rect[] = [];
  private lifeTimes: number;
  private size: number;
  private findPosition: FindPosition;
  private liveRate: number;

  private totalSquares: number = 0;
  private maxHeight: number = -1;
  private maxWidth: number = -1;

  private randomDots: IPoint[] = [];
  private bestDot: IPoint;
  get minHeight() {
    return this.totalSquares / this.maxWidth;
  }
  get minWidth() {
    return this.totalSquares / this.maxHeight;
  }
  constructor(rects: Rect[], options?: IGeneticOptions) {
    if (!options) {
      options = {} as IGeneticOptions;
    }
    this.rects = rects;
    this.size = options.size < 20 ? 20 : options.size;
    this.lifeTimes = options.lifeTimes || 8;
    this.liveRate = options.liveRate || 0.5;
    if (this.liveRate < 0 || this.liveRate > 1) {
      this.liveRate = 0.5;
    }
    this.findPosition = options.findPosition;
  }
  public calc(): IPoint {
    this.open();
    this.work();
    return this.close();
  }
  private open() {
    // 二维空间内寻找边界
    for (const rect of this.rects) {
      this.totalSquares = rect.height * rect.width + this.totalSquares;
      this.maxHeight = rect.height + this.maxHeight;
      this.maxWidth = rect.width + this.maxWidth;
    }
    // 二维空间内生成随机点 虽然无法保证分布是随机分布，但是对遗传算法来说无所谓了。
    for (let i = 0; i < this.size; i++) {
      const randomHeight = this.maxHeight * Math.random() + this.minHeight;
      const randomWidth = this.maxWidth * Math.random() + this.minWidth;
      this.randomDots.push({
        x: randomWidth,
        y: randomHeight,
      });
    }
  }
  private work() {
    while (this.lifeTimes--) {
      const generation: ICalResult[] = [];
      for (const dot of this.randomDots) {
        // 生活
        const binPack = new MaxRectBinPack(dot.x, dot.y, true);
        const clonedRects = this.getRects();
        const result = binPack.insertRects(clonedRects, this.findPosition);
        generation.push({
          dot,
          fitAll: result.length === this.rects.length,
          occupancy: binPack.occupancy(),
        });
      }
      // 淘汰
      generation.sort((geneticA, geneticB) => {
        if (geneticB.fitAll && geneticA.fitAll) {
          return geneticB.occupancy - geneticA.occupancy;
        } else if (geneticB.fitAll) {
          return 1;
        } else if (geneticA.fitAll) {
          return -1;
        } else {
          return geneticB.occupancy - geneticA.occupancy;
        }
      });
      this.bestDot = generation[0].dot;
      // 后置位淘汰有利于数据优化
      if (generation.length > this.size) {
        generation.splice(this.size, generation.length - this.size);
      }
      const killerStart = Math.ceil(this.liveRate * generation.length);
      generation.splice(killerStart, generation.length - killerStart);
      for (let i = generation.length - 1; i > 0; i--) {
        if (!generation[i].fitAll) {
          generation.splice(i, 1);
        }
      }
      this.randomDots = [];
      // 新生
      if (generation.length === 0 || generation.length === 1) {
        // 如果团灭了 或者 无法继续交配
        for (let i = 0; i < this.size; i++) {
          const randomHeight = this.maxHeight * Math.random() + this.minHeight;
          const randomWidth = this.maxWidth * Math.random() + this.minWidth;
          this.randomDots.push({
            x: randomWidth,
            y: randomHeight,
          });
        }
      } else {
        // 非随机交配
        let childNumber = Math.ceil(
          (this.size * 2) / (generation.length * (generation.length - 1)),
        );
        childNumber = childNumber === 0 ? 1 : childNumber;
        for (let i = 0; i < generation.length; i++) {
          this.randomDots.push(generation[i].dot);
          for (let j = i + 1; j < generation.length; j++) {
            const startPoint = generation[i].dot;
            const endPoint = generation[j].dot;
            const detX = (endPoint.x - startPoint.x) / (childNumber + 1);
            const detY = (endPoint.y - startPoint.y) / (childNumber + 1);
            for (
              let x = startPoint.x, y = startPoint.y;
              x < endPoint.x;
              x += detX, y += detY
            ) {
              this.randomDots.push({
                x,
                y,
              });
            }
          }
        }
        // 基因突变
        for (let i = 0; i < 20; i++) {
          const randomHeight = this.maxHeight * Math.random() + this.minHeight;
          const randomWidth = this.maxWidth * Math.random() + this.minWidth;
          this.randomDots.push({
            x: randomWidth,
            y: randomHeight,
          });
        }
      }
    }
  }
  private close() {
    return this.bestDot;
  }
  private getRects(): Rect[] {
    return this.rects.map(i => i.clone()); // tslint:disable-line arrow-parens
  }
}

export default function(rect: Rect[], options: IGeneticOptions) {
  const g = new Genetic(rect, options);
  return g.calc();
}
