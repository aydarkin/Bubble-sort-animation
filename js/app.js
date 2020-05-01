'use strict';
window.onload = () => {   
   const container = document.querySelector('.sort');
   const statusContainer = document.querySelector('.status');
   
   const sortContainer = new SortContainer({
      container: container, 
      animationSort: new AnimationBubbleSort(), 
      statusContainer: statusContainer});
   sortContainer.mountElements(5);

   const prepareBtn = document.querySelector('.button_prepare');
   const runBtn = document.querySelector('.button_run');

   prepareBtn.addEventListener('click', () => {
      sortContainer.clearContainer();
      sortContainer.mountElements(5);
      runBtn.disabled = false;
   })

   runBtn.addEventListener('click', async () => {
      prepareBtn.disabled = true;
      runBtn.disabled = true;

      await sortContainer.showSorting.call(sortContainer);
      
      prepareBtn.disabled = false;
   });
}