'use strict';
class SortContainer {
   /**
    * @param {Object} params 
    * @param {HTMLElement} container - контейнер, в котором будет производиться визуализация сортировки
    * @param {AnimationBubbleSort} animationSort - объект, реализующий визуализацию сортировки
    * @param {HTMLElement} statusContainer - контейнер, для вывода интерпретации статуса
    */
   constructor({ container, animationSort, statusContainer }) {
      this.container = container;
      this.animationSort = animationSort;
      this.statusContainer = statusContainer;
      this.status = 'empty';
   }

   /**
    * Добавление в контейнер элементов
    * @param {Number} number - количество элементов
    */
   mountElements(number) {
      let element;
      for (let index = 0; index < number; index++) {
         element = this.createElement();
         this.container.insertAdjacentElement('beforeend', element);
         //отступ между элементами в половину ширины
         element.style.left = `${index * (1.5 * element.offsetWidth)}px`;
      }

      if(number > 0) {
         this.setStatus('filled');
      } 
   }

   /**
    * Очистка контейнера
    */
   clearContainer() {
      this.container.innerHTML = "";
      this.setStatus('empty');
   }

   /**
    * Создание элемента
    * @param {Number} value - значение элемента
    */
   createElement(value) {
      const elem = document.createElement('div');
      elem.classList.add('sort__elem');

      const random = value ?? Math.trunc(Math.random() * 100);
      elem.textContent = random;

      return elem;
   }

   /**
    * Запуск визуализации алгоритма сортировки
    */
   async showSorting() {
      this.setStatus('sorting');
      this.showStatus();

      const sortableElements = Array.from(this.container.children).map((child) => {
         return new Comparable(child, 'textContent', 'number');
      }); 
      this.oldValues = sortableElements.map((el) => el.value);

      await this.animationSort.sort(sortableElements);

      this.setStatus('finished');
   }
   
   /**
    * Вывод интерпретации статуса в контейнер статуса
    */
   showStatus() {
      switch (this.status) {
         case 'filled':
            this.statusContainer.innerHTML = 
               `
                  <p class="status__par">Заданы ${this.container.childElementCount} случайных чисел</p>
                  <p class="status__par">Если хотите изменить числа, нажмите на кнопку "Заполнить данные"</p>
                  <p class="status__par">Для запуска визуализации сортировки нажмите на "Начать сортировку"</p>
               `;
            break;

         case 'sorting':
            this.statusContainer.innerHTML = 
               `
                  <p class="status__par">Идёт сортировка...</p>
               `;
            break;

         case 'finished':
            this.statusContainer.innerHTML = 
               `
                  <p class="status__par">Сортировка завершена</p>
                  <p class="status__par">Старый массив: [${this.oldValues}]</p>
                  <p class="status__par">Если хотите попробовать снова, нажмите сначала на кнопку "Заполнить данные"</p>
               `;
            break;

         case 'empty':
         default:
            this.statusContainer.innerHTML = '';
            break;
      }
   }

   /**
    * Установить статус и вывести его интерпретацию в контейнер статуса
    * @param {string} status 
    */
   setStatus(status) {
      this.status = status;
      this.showStatus();
   }
}