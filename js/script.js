/* 
script.js
By: Ryhan Mortuza (ryhan_mortuza@student.uml.edu)
HW4 - This project is supposed to validate and notify user of any issues regarding their inputs
to a multiplication table that dynamically changes outputs

*/
/**
* @param {number} multiplierMinVal   - integer start of multiplier range.
* @param {number} multiplierMaxVal   - integer end of multiplier range.
* @param {number} multiplicandMinVal - integer start of multiplicand range.
* @param {number} multiplicandMaxVal - integer end of multiplicand range.
*
* @return {HTMLTableElement} - HTML multiplication table.
*/
function createMultTable(multiplierMinVal, multiplierMaxVal,
   multiplicandMinVal, multiplicandMaxVal) {

   var table = document.createElement('table');
   table.id = 'table';
   var firstRow = true;
   var firstCol = true;

   for (var row = multiplicandMinVal - 1; row <= multiplicandMaxVal; row++) {
      var tableRow = document.createElement('tr'); // Create the rows.

      for (var col = multiplierMinVal - 1; col <= multiplierMaxVal; col++) {
         var cell;
         var cellText;
         if (firstRow) {
            cell = document.createElement('th');
            if (!firstCol) {

               // If it's the first row and isn't the first column,
               // put multiplier in a <th>.
               cellText = document.createTextNode(col);
               cell.appendChild(cellText);
            }
         } else {
            if (firstCol) {

               // If it's not the first row and is the first column,
               // put the multiplicand in a <th>.
               cell = document.createElement('th');
               cellText = document.createTextNode(row);
               cell.appendChild(cellText);

            } else {

               // If it's not the first row and isn't the first column,
               // put multiplier * multiplicand in a <td>.
               cell = document.createElement('td');
               cellText = document.createTextNode(row * col);
               cell.appendChild(cellText);
            }
         } //adds cells and rows
         tableRow.appendChild(cell);
         firstCol = false;
      }
      table.appendChild(tableRow);
      firstRow = false;
      firstCol = true;
   }
   return table;
}


/**
* @param {HTMLElement} newHtmlElement - Element to append into parentNode.
* @param {Node} parentNode - Node to append newHtmlElement into.
*
*/
function appendReplaceHtmlElement(newHtmlElement, parentNode) {
   var oldHtmlElement;
   if ((oldHtmlElement = document.getElementById(newHtmlElement.id)) &&
      oldHtmlElement.parentNode === parentNode) {


      parentNode.replaceChild(newHtmlElement, oldHtmlElement);
   } else {
      parentNode.appendChild(newHtmlElement);
   }
}


if (typeof FormHandler == 'undefined') { // Make sure namespace isn't used.

   /**
   * @namespace {object} FormHandler
   */

   var FormHandler = (function () {

      // Private
      var tabs = $('#tableTabs').tabs();
      var tabHandles = tabs.find('ul');
      var tabCount = 0;


      /**
      *
      * @constructor
      * @memberof FormHandler
      */
      var init = function () {

         jQuery.validator.addMethod(
            'compareTo', function (value, element, params) {

               var num1 = parseInt(value);
               var num2 = parseInt($('input[name="' + params[0] + '"]').val());

               // If num1 or num2 are NaN, they weren't parsable numbers.
               if (isNaN(num1) || isNaN(num2)) return true;

               if (params[2]) {
                  return num1 <= num2;
               } else {
                  return num1 >= num2;
               }
            }, 'Maximum {1} value must be greater than or equal to minimum {1} value.'); //Error 


         // Defines validation rules (PART 1!!!)
         $('form').validate({

            // Define restrictions on form inputs.
            rules: {
               multiplierMin: {
                  required: true, // Can't be empty.
                  number: true, // Must be a number.
                  step: 1,     // Can't be a decimal.
                  compareTo:      // Must be <= multiplierMax.
                     ['multiplierMax', 'multiplier', true]
               },
               multiplierMax: {
                  required: true,
                  number: true,
                  step: 1,
                  compareTo:      // Must be >= multiplierMin.
                     ['multiplierMin', 'multiplier', false]
               },
               multiplicandMin: {
                  required: true,
                  number: true,
                  step: 1,
                  compareTo:      // Must be <= multiplicandMax.
                     ['multiplicandMax', 'multiplicand', true]
               },
               multiplicandMax: {
                  required: true,
                  number: true,
                  step: 1,
                  compareTo:      // Must be >= multiplicandMin.
                     ['multiplicandMin', 'multiplicand', false]
               }
            },

            // Change where errors are shown on the page.
            showErrors: function (error, errorMap) {
               // Let plugin do its default loading of errors.
               this.defaultShowErrors();

               var isMaxError = false;

               // Iterate over the messages to show.
               errorMap.forEach(function (error) {

                  if (error.method === 'compareTo') {

                     isMaxError = true;
                     $('#' + error.element.name + '-error').empty();
                     var type = error.element.name.slice(0, -3);
                     $('#' + type + 'Error').html(error.message);
                     $('#' + type + 'Error').removeClass('hidden');
                  }
               });

               if (errorMap.length === 0 || !isMaxError) {

                  this.currentElements.each(function (index, element) {
                     var type = element.name.slice(0, -3);
                     $('#' + type + 'Error').empty();
                     $('#' + type + 'Error').addClass('hidden');
                  });
               }
            },

            // Error messages for all non-custom form restrictions.
            messages: {
               multiplierMin: {
                  required: 'Value cannot be empty.',
                  number: 'Value must be an integer.',
                  step: 'Decimals not allowed. Value must be an integer.'
               },
               multiplierMax: {
                  required: 'Value cannot be empty.',
                  number: 'Value must be an integer.',
                  step: 'Decimals not allowed. Value must be an integer.'
               },
               multiplicandMin: {
                  required: 'Value cannot be empty.',
                  number: 'Value must be an integer.',
                  step: 'Decimals not allowed. Value must be an integer.'
               },
               multiplicandMax: {
                  required: 'Value cannot be empty.',
                  number: 'Value must be an integer.',
                  step: 'Decimals not allowed. Value must be an integer.'
               }
            },

            // If validation passes, create the multiplication table.
            submitHandler: function (form, event) {
               event.preventDefault();  // Don't submit the form.
               createTab(form);
            }

         });

         $('.slider').slider({
            value: -100,
            min: -100,
            max: 100,
            slide: function (event, ui) {
               $(this).siblings('input').val(ui.value);
               $(this).siblings('input').valid();
            },
            change: function (event, ui) {
               var form = $(this).closest("form")[0];
               var dynamic = form.elements['dynamicTab'].checked;
               if (dynamic && $(form).valid()) {
                  updateActiveTab(form);
               }
            }
         });

         $('input[type="number"]').on('input', function (event) {
            $(this).siblings('.slider').slider('value', $(this).val());
            var form = $(this).closest("form")[0];
            var dynamic = form.elements['dynamicTab'].checked;
            if (dynamic && $(form).valid()) {
               updateActiveTab(form);
            }
         });

      };

      tabs.on('click', '.tabClose', function () {

         //remove
         var li = $(this).closest('li');
         var index = li.index();
         var activeIndex = tabs.tabs('option', 'active');
         $(li.find('a').attr('href')).remove();
         li.remove();
         tabs.tabs('refresh');
         var remaining = tabHandles.find('li').length;
         if (remaining === 0) {
            toggleTabVisibility(false);
         } else if (activeIndex === index) {

            if (remaining <= index) {
               index = remaining - 1;
            }
            tabs.tabs('option', 'active', index);
         }
      });

      $('#removeAllTabs').on('click', function () {
         tabHandles.empty();
         tabs.find(":not(:first-child)").remove();
         tabs.tabs('refresh');
         toggleTabVisibility(false);
      });



      var toggleTabVisibility = function (show) {
         if (show) {
            tabs.removeClass('hidden');
            $('#tabButtons').removeClass('hidden');
         } else {
            tabs.addClass('hidden');
            $('#tabButtons').addClass('hidden');
         }
      }

      var addTableDataToTab = function (form, tabTitleHolder, tabContentHolder) {
         var multiplierMin = form.elements['multiplierMin'].value;
         var multiplierMax = form.elements['multiplierMax'].value;
         var multiplicandMin = form.elements['multiplicandMin'].value;
         var multiplicandMax = form.elements['multiplicandMax'].value;

         //Build the tab title
         var tabTitleText =
            '(' + multiplierMin +
            ') to (' + multiplierMax +
            ') by (' + multiplicandMin +
            ') to (' + multiplicandMax + ')';

         tabTitleHolder.innerHTML = tabTitleText;

         //Add the contents to the content holder
         var table = createMultTable(multiplierMin, multiplierMax,
            multiplicandMin, multiplicandMax);
         $(tabContentHolder).empty();
         appendReplaceHtmlElement(table, tabContentHolder);
      }

      var updateActiveTab = function (form) {
         var activeTab = tabs.tabs('option', 'active');
         if (activeTab === false) {
            createTab(form);
         } else {
            var tabHandle = tabHandles.find('li').eq(activeTab);
            var tabTitleHolder = tabHandle.find('a');
            var tabContentHolder = $(tabTitleHolder.attr('href'));
            addTableDataToTab(form, tabTitleHolder[0], tabContentHolder[0]);
            tabs.tabs('refresh');
         }

      }

      var createTab = function (form) {
         if (!tabs.is(':visible')) {
            toggleTabVisibility(true);
         }

         
         var tabID = "tab-" + tabCount;
         tabCount++;

         
         var li = document.createElement('li');
         li.id = "handle-" + tabID;
         var a = document.createElement('a');
         a.href = "#" + tabID;
         li.appendChild(a);

         
         var div = document.createElement('div');
         div.className = "tabClose";
         div.appendChild(document.createTextNode('x'));
         li.appendChild(div);
         tabHandles.append(li);


         var div = document.createElement('div');
         div.id = tabID;
         tabs.append(div);

         addTableDataToTab(form, a, div);

         tabs.tabs('refresh');

         var index = tabHandles.find('li').length - 1;
         tabs.tabs("option", "active", index);
      };

      return {
         init: init
      };
   })();

   document.addEventListener('DOMContentLoaded', FormHandler.init);
};