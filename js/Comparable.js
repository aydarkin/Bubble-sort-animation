'use strict';
//Для сравнения элементов по определенному полю с приведением к нужному типу
class Comparable {
   /**
    * 
    * @param {*} element - сравниваемый элемент
    * @param {string} comparableProp - поле, по которому будет происходить сравнение
    * @param {string} type - тип, к которому надо привести значение поля
    */
   constructor(element, comparableProp, type = 'String') {
      this._element = element;
      this._comparableProp = comparableProp;

      switch (type) {
         case 'number':
         case 'string':
         case 'boolean':
         case 'symbol':
            type = type[0].toUpperCase() + type.substring(1);
            break;
         case 'bigint':
            type = 'BigInt';
            break;
      }
      this._type = type;
   }

   get value() {
      if (this._type == 'String') {
         return this.element[this._comparableProp].toString();
      } else {
         return eval(`${this._type}(this.element['${this._comparableProp}'])`);
      }
   }

   get element() {
      return this._element;
   }
}