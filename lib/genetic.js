"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var max_rect_bin_pack_1 = __importDefault(require("./max-rect-bin-pack"));
var Genetic = /** @class */ (function () {
    function Genetic(rects, options) {
        this.rects = [];
        this.totalSquares = 0;
        this.maxHeight = -1;
        this.maxWidth = -1;
        this.randomDots = [];
        if (!options) {
            options = {};
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
    Object.defineProperty(Genetic.prototype, "minHeight", {
        get: function () {
            return this.totalSquares / this.maxWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Genetic.prototype, "minWidth", {
        get: function () {
            return this.totalSquares / this.maxHeight;
        },
        enumerable: true,
        configurable: true
    });
    Genetic.prototype.calc = function () {
        this.open();
        this.work();
        return this.close();
    };
    Genetic.prototype.open = function () {
        // 二维空间内寻找边界
        for (var _i = 0, _a = this.rects; _i < _a.length; _i++) {
            var rect = _a[_i];
            this.totalSquares = rect.height * rect.width + this.totalSquares;
            this.maxHeight = rect.height + this.maxHeight;
            this.maxWidth = rect.width + this.maxWidth;
        }
        // 二维空间内生成随机点 虽然无法保证分布是随机分布，但是对遗传算法来说无所谓了。
        for (var i = 0; i < this.size; i++) {
            var randomHeight = this.maxHeight * Math.random() + this.minHeight;
            var randomWidth = this.maxWidth * Math.random() + this.minWidth;
            this.randomDots.push({
                x: randomWidth,
                y: randomHeight,
            });
        }
    };
    Genetic.prototype.work = function () {
        while (this.lifeTimes--) {
            console.log('life');
            var generation = [];
            for (var _i = 0, _a = this.randomDots; _i < _a.length; _i++) {
                var dot = _a[_i];
                // 生活
                var binPack = new max_rect_bin_pack_1.default(dot.x, dot.y, true);
                var clonedRects = this.getRects();
                var result = binPack.insertRects(clonedRects, this.findPosition);
                generation.push({
                    dot: dot,
                    fitAll: result.length === this.rects.length,
                    occupancy: binPack.occupancy(),
                });
            }
            // 淘汰
            generation.sort(function (geneticA, geneticB) {
                if (geneticB.fitAll && geneticA.fitAll) {
                    return (geneticB.occupancy - geneticA.occupancy);
                }
                else if (geneticB.fitAll) {
                    return 1;
                }
                else if (geneticA.fitAll) {
                    return -1;
                }
                else {
                    return geneticB.occupancy - geneticA.occupancy;
                }
            });
            this.bestDot = generation[0].dot;
            // 后置位淘汰有利于数据优化
            if (generation.length > this.size) {
                generation.splice(this.size, generation.length - this.size);
            }
            var killerStart = Math.ceil(this.liveRate * generation.length);
            generation.splice(killerStart, generation.length - killerStart);
            for (var i = generation.length - 1; i > 0; i--) {
                if (!generation[i].fitAll) {
                    generation.splice(i, 1);
                }
            }
            this.randomDots = [];
            // 新生
            if (generation.length === 0 || generation.length === 1) {
                // 如果团灭了 或者 无法继续交配
                for (var i = 0; i < this.size; i++) {
                    var randomHeight = this.maxHeight * Math.random() + this.minHeight;
                    var randomWidth = this.maxWidth * Math.random() + this.minWidth;
                    this.randomDots.push({
                        x: randomWidth,
                        y: randomHeight,
                    });
                }
            }
            else {
                // 非随机交配
                var childNumber = Math.ceil((this.size * 2) / (generation.length * (generation.length - 1)));
                childNumber = childNumber === 0 ? 1 : childNumber;
                for (var i = 0; i < generation.length; i++) {
                    this.randomDots.push(generation[i].dot);
                    for (var j = i + 1; j < generation.length; j++) {
                        var startPoint = generation[i].dot;
                        var endPoint = generation[j].dot;
                        var detX = (endPoint.x - startPoint.x) / (childNumber + 1);
                        var detY = (endPoint.y - startPoint.y) / (childNumber + 1);
                        this.randomDots.push({
                            x: startPoint.x + detX,
                            y: startPoint.y + detY,
                        });
                    }
                }
            }
        }
    };
    Genetic.prototype.close = function () {
        return this.bestDot;
    };
    Genetic.prototype.getRects = function () {
        return this.rects.map(function (i) { return i.clone(); }); // tslint:disable-line arrow-parens
    };
    return Genetic;
}());
exports.Genetic = Genetic;
function default_1(rect, options) {
    var g = new Genetic(rect, options);
    return g.calc();
}
exports.default = default_1;
//# sourceMappingURL=genetic.js.map