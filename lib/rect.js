"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rect = /** @class */ (function () {
    function Rect() {
        /**
         * 起点 x 坐标
         */
        this.x = 0;
        /**
         * 起点 y 坐标
         */
        this.y = 0;
        /**
         * 宽度
         */
        this.width = 0;
        /**
         * 高度
         */
        this.height = 0;
    }
    /**
     * 克隆
     */
    Rect.prototype.clone = function () {
        var cloned = new Rect();
        cloned.x = this.x;
        cloned.y = this.y;
        cloned.height = this.height;
        cloned.width = this.width;
        return cloned;
    };
    Rect.prototype.isIn = function (otherRect) {
        return (this.x >= otherRect.x &&
            this.y >= otherRect.y &&
            this.x + this.width <= otherRect.x + otherRect.width &&
            this.y + this.height <= otherRect.y + otherRect.height);
    };
    return Rect;
}());
exports.default = Rect;
//# sourceMappingURL=rect.js.map