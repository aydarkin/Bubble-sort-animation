'use strict';
class AnimationBubbleSort {
   constructor() {
      this.isSorting = false;
   }
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
   motionAnimation({ target, path, duration = 600, isRotate = false }) {
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
    * Выполнение анимации выбора элемента
    * @param {Array} targets - элементы
    */
   async selectElements(targets = []) {
      await this.colorElements({
         targets: targets,
         color: '#FBF38C',
         textColor: '#1d1c1c',
      })
   }

   /**
    * Выполнение анимации отмены выбора элемента
    * @param {Array} targets 
    */
   async deselectElements(targets = []) {
      await this.colorElements({
         targets: targets,
         color: this.backgroundColorDefault || 'white',
         textColor: this.textColorDefault || 'black',
      })
   }

   /**
    * Выполнение анимации завершения работы с элементом
    * @param {Array} targets 
    */
   async finishElements(targets = []) {
      await this.colorElements({
         targets: targets,
         color: '#A4FF4F',
         textColor: '#1d1c1c',
         endDelay: 1000,
      })
   }

   /**
    * Выполнение анимации смены цвета элемента
    * @param {Object} params
    * @param {Array} targets - массив элементов
    * @param {string} color - цвет фона
    * @param {string} textColor - цвет текста
    * @param {Number} duration - продолжительность в мс
    * @param {Number} endDelay - длительность паузы после анимации в мс
    */
   async colorElements({ targets = [], color, textColor, duration = 600,  endDelay = 400}) {
      if (targets.length > 0) {
         const animations = [];

         targets.forEach(target => {
            animations.push(this.colorAnimation({
               target: target,
               color: color,
               textColor: textColor,
               duration: duration,
               endDelay: endDelay,
            }));
         });
         await Promise.all(animations.map((a) => a.finished));
      }
   }

   /**
    * Запуск и возврат анимации смены цвета элемента
    * @param {Object} params
    * @param {HTMLElement|string} target - элемент
    * @param {string} color - цвет фона
    * @param {string} textColor - цвет текста
    * @param {Number} duration - продолжительность в мс
    * @param {Number} endDelay - длительность паузы после анимации в мс
    */
   colorAnimation({target, color, textColor, duration, endDelay}) {
      return anime({
         targets: target,
         color: textColor,
         backgroundColor: color,
         duration: duration,
         endDelay: endDelay,
         easing: 'easeInOutQuad'
      });
   }

   /**
    * Выполнение анимации обмена местами по часовой стрелке
    * @param {Element} firstElem 
    * @param {Element} secondElem 
    */
   async swapAnimation(firstElem, secondElem) {
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

      //заносим в DOM так, чтобы отсчет координат был абсолютен
      svg.style.position = 'absolute';
      document.body.insertAdjacentElement('afterbegin', svg);

      const animationFirstToSecond = this.motionAnimation({
         target: firstElem,
         path: pathToRight,
         duration: 700,
      });

      const animationSecondToFirst = this.motionAnimation({
         target: secondElem,
         path: pathToLeft,
         duration: 700,
      });

      //дожидаемся анимаций и убираем из DOM временный svg
      await Promise.all([animationFirstToSecond.finished, animationSecondToFirst.finished])
         .then(() => { svg.remove(svg) })
   }

   /**
    * Запуск визуализации сортировки
    * @param {Array} array 
    */
   async sort(array = []) {
      if (!this.isSorting && array.length > 0) {
         this.isSorting = true;
         this.backgroundColorDefault = window.getComputedStyle(array[0].element).backgroundColor;
         this.textColorDefault = window.getComputedStyle(array[0].element).color;

         const lenght = array.length;
         for (let iter = 0; iter < lenght; iter++) {
            for (let i = 0; i < lenght - iter - 1; i++) {
               await this.selectElements([
                  array[i].element,
                  array[i + 1].element,
               ]);
               if (array[i].value > array[i + 1].value) {
                  //меняем местами на экране
                  await this.swapAnimation(array[i].element, array[i + 1].element);

                  //меняем местами в коллекции
                  const temp = array[i];
                  array[i] = array[i + 1];
                  array[i + 1] = temp;
  
                  //убираем выделение
                  await this.deselectElements([
                     array[i].element,
                     array[i + 1].element
                  ]);
               }
               if (i + 1 == lenght - iter - 1) {
                  
                  await Promise.all([
                     this.deselectElements([array[i].element]),
                     this.finishElements([array[i + 1].element])
                  ]);
               } else {
                  //убираем выделение
                  await this.deselectElements([
                     array[i].element,
                     array[i + 1].element
                  ]);
               }
            }
         }
         await this.finishElements([array[0].element]);
         this.isSorting = false;
      }
   }
}