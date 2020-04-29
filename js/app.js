class AnimationBubbleSort {
    /**
     * Создание квадратичной кривой Безье
     * @param {Object} params
     * @param {Number} x1 - X начала дуги
     * @param {Number} y1 - Y начала дуги
     * @param {Number} x2 - X конца дуги 
     * @param {Number} y2 - Y конца дуги 
     * @param {Number} xPivot - X опорной точки дуги 
     * @param {Number} yPivot - Y опорной точки дуги 
     * @param {string} color - цвет дуги 
     * @returns {SVGPathElement} path
     */
    createArcPath({ x1, y1, x2, y2, xPivot, yPivot, color }) {
        const xmlns = 'http://www.w3.org/2000/svg';
        const path = document.createElementNS(xmlns, 'path');

        path.setAttribute('d', `M${x1} ${y1} Q ${xPivot} ${yPivot}, ${x2} ${y2}`);
        path.setAttribute('stroke', color);
        path.setAttribute('fill', 'transparent');
        return path;
    }


    /**
     * Запуск и возврат анимации движения по дуге
     * @param {Object} params
     * @param {Element} target - перемещаемый элемент
     * @param {SVGPathElement} path - SVG путь, по которому будет происходить движение
     * @param {Number} duration - продолжительность движения в мс
     * @param {boolean} isRotate - должен ли поворачиваться элемент при движении
     * @returns {Object} animation
     */
    motionAnimation({ target, path, duration = 1000, isRotate = false }) {
        const animePath = anime.path(path);
        return anime({
            targets: target,
            left: animePath('x'),
            top: animePath('y'),
            rotate: isRotate ? animePath('angle') : 0,
            easing: 'easeInOutQuad',
            duration: duration,
            loop: false,
        });
    }
    /**
     * Запуск анимации обмена местами по часовой стрелке
     * @param {Element} firstElem 
     * @param {Element} secondElem 
     */
    swapAnimation(firstElem, secondElem) {
        //данное пространство имен требуется для работы с SVG
        const xmlns = 'http://www.w3.org/2000/svg';

        const x1 = firstElem.offsetLeft;
        const y1 = firstElem.offsetTop;
        const x2 = secondElem.offsetLeft;
        const y2 = secondElem.offsetTop;

        const xMiddle = (x1 + x2) / 2;
        const yUp = y1 - Math.abs(x1 - x2);
        const yDown = y1 + Math.abs(x1 - x2);

        const pathToRight = this.createArcPath({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            xPivot: xMiddle,
            yPivot: yUp,
            color: 'transparent',
        });

        const pathToLeft = this.createArcPath({
            x1: x2,
            y1: y2,
            x2: x1,
            y2: y1,
            xPivot: xMiddle,
            yPivot: yDown,
            color: 'transparent',
        });

        //для работы анимации требуется отрисованный SVG элемент
        const svg = document.createElementNS(xmlns, 'svg');
        svg.appendChild(pathToRight);
        svg.appendChild(pathToLeft);
        svg.setAttribute('xmlns', xmlns);

        //заносим в DOM так, чтобы отсчет координат абсолютен
        svg.style.position = 'absolute';
        document.body.insertAdjacentElement('afterbegin', svg);

        const animationFirstToSecond = this.motionAnimation({
            target: firstElem,
            path: pathToRight,
            duration: 1000,
        });

        const animationSecondToFirst = this.motionAnimation({
            target: secondElem,
            path: pathToLeft,
            duration: 1000,
        });

        //дожидаемся анимаций и убираем из DOM временный svg
        Promise.all([animationFirstToSecond.finished, animationSecondToFirst.finished])
            .then(() => { svg.remove(svg) })
    }
}

const first = document.querySelector('.first');
const second = document.querySelector('.second');

const animation = new AnimationBubbleSort();

const elems = document.querySelectorAll('.elem');
elems.forEach((elem) => {
    elem.addEventListener('click', animation.swapAnimation.bind(animation, first, second));
});