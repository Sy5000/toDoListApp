"use strict";

// pointers
const createTask = document.querySelector("#submitTask");
const createCategory = document.querySelector("#submitCategory");
const categoriesSelect = document.querySelector("#categories-select");
const filtersSelect = document.querySelector("#filters-select");
// const filtersRemove = document.querySelector("#filters-remove");
const analytics = document.querySelector("#analytics");
const masterList = document.querySelector("#masterList");

const catInput = document.querySelector(".catInput");

// MODEL
// globals
let categories = ["general", "personal", "work"];
let list = [
  {
    task: "create a list",
    category: "general",
    complete: true,
  },
  {
    task: "display the list",
    category: "general",
    complete: false,
  },
  {
    task: "buy apples",
    category: "general",
    complete: false,
  },
  {
    task: "buy pens",
    category: "work",
    complete: false,
  },
  {
    task: "buy laptop",
    category: "work",
    complete: false,
  },
  {
    task: "buy ties",
    category: "work",
    complete: false,
  },
  {
    task: "buy moleskine",
    category: "work",
    complete: true,
  },
];
// list state
//  user defined > category / filter selection;
let curState;

////////////////////
////////////////////
// init app
curState = false;
calcAnalytics(list);
renderCategorySelect(categories);
renderfilterBy(categories, curState);
renderList(list);
////////////////////
////////////////////

////////////////////
// VIEWs
//  to-do-list

//  categories-select-list
function renderCategorySelect(categories) {
  categoriesSelect.innerHTML =
    "<option value=''>- please select a category -</option>";
  categories.forEach((el) => {
    categoriesSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${el}">${el}</option>`
    );
  });
}

//  filters-list
function renderfilterBy(categories, curState) {
  console.log("current state var", curState);
  // existing html
  filtersSelect.innerHTML = "";
  // add active class
  categories.forEach((el) => {
    let state = el === curState ? "active" : "";

    filtersSelect.insertAdjacentHTML(
      "beforeend",
      `<div type='button' class='filter__button ${state}' data-cat='${el}'>
                   ${el}
                   <span class='remove'></span>
                 </div>`
    );
  });
}
//  master list
function renderList(list) {
  // existing html (check for empty list)
  // masterList.innerHTML = list.length === 0 ? "<p>No tasks to show</p>" : "";
  masterList.innerHTML = "";
  // model object
  list.forEach((el) => {
    // check task status
    let style = el.complete === true ? "checked" : "";
    // new html
    masterList.insertAdjacentHTML(
      "beforeend",
      // `<li class='${style}' data-cat='${el.category}'>${el.task}<span class='close'></span></li>`
      `<li class="li" data-cat="${el.category}">
            <input id="${el.task}" type="checkbox" name="" value="" />
            <label for="${el.task}">${el.task}</label>
            <span class="close"></span>
          </li>
      `
    );
  });
}

function toggleAddCategory() {
  catInput.style.display =
    catInput.style.display === "block" ? "none" : "block";
}

////////////////////
// CONTROLLERs
//  add task to list, update VIEWs
createTask.addEventListener("click", () => {
  const task = document.querySelector("#newUserTask");
  const categorySelect = document.querySelector("#categories-select");

  // GUARDS
  if (categories.length === 0) {
    alert(
      "No categories available, please create a new category to save a task"
    );
    return;
  }
  if (categorySelect.value === "") {
    alert("Please assign your task to a category");
    return;
  }
  // MODEL
  const newTask = {
    task: task.value,
    category: categorySelect.value,
    complete: false,
  };
  list.unshift(newTask);
  // VIEW
  renderList(list);
  calcAnalytics(list);
  // removes active class
  renderfilterBy(categories);
  // clear inputs
  task.value = categorySelect.value = "";
});

//  add a custom cat, update VIEWs
createCategory.addEventListener("click", () => {
  const category = document.querySelector("#newUserCat");
  const newCategory = category.value;

  if (newCategory === "") {
    alert("please enter a valid value!");
  }
  if (newCategory !== "") {
    // MODEL
    categories.push(newCategory);
    // VIEW
    category.value = "";
    renderCategorySelect(categories);
    renderfilterBy(categories, curState);
  }
});

// remove filter selection
function filtersRemove() {
  // MODEL
  curState = false;
  // VIEW
  renderfilterBy(categories, curState);
  renderList(list);
}
// clear all / reset list
function listClearAll() {
  // MODEL
  list = [];
  // VIEW
  renderList(list);
  calcAnalytics(list);
}
//
//------------------//
// refactored to here
//------------------//
// filterBy list, remove filters, update VIEWs
filtersSelect.addEventListener("click", function (e) {
  let target = e.target;
  // guard
  if (!target) {
    return;
  }
  // user chooses to delete filter
  if (target.classList.contains("remove")) {
    curState = target.closest(".filter__button");
    // pointers
    const toRemove = target.closest(".filter__button");
    const cat = toRemove.dataset.cat;
    // check category use
    const filterCount = auditList(list, cat);

    if (filterCount > 0) {
      alert(`please remove all tasks from '${cat}' category before deleting!`);
    }
    // remove if redundant
    if (filterCount === 0) {
      categories = categories.filter((el) => el !== cat);
      renderfilterBy(categories);
      renderCategorySelect(categories);
    }
  }
  // user chooses to filter list
  if (target.classList.contains("filter__button")) {
    // GLOBAL state
    curState = target.dataset.cat;
    // VIEW
    renderfilterBy(categories, curState); // adds active class
    const filteredList = applyFilter(list, curState);
    renderList(filteredList);
  }
});

// grab rendered task list
let elArray = document.querySelectorAll(".li");
// add event listener to ea li
elArray.forEach(function (el) {
  el.addEventListener("click", function (e) {
    let target = e.target;
    let clickedArea = target.tagName;
    // Toggle MODEL: list.complete.{BOOLEAN}
    if (clickedArea === "LABEL") {
      // Task Text
      let string = target.textContent;

      // MODEL;
      list.forEach((el) => {
        if (el.task.match(string)) {
          // toggle boolean value
          let curBool = el.complete;
          el.complete = !curBool;
        }
      });
      // VIEW
      calcAnalytics(list);
    }
    // REMOVE BUTT
    if (clickedArea === "SPAN") {
      // remove from model
      console.log("remove");
    }
    // guard
    if (clickedArea === "LI" || "INPUT") {
      return;
    }
  });
});
// console.log(elArray, "point?");

// remove filters, update VIEWs
// filtersRemove.addEventListener("click", function (e) {
//   // MODEL
//   curState = false;
//   // VIEW
//   renderfilterBy(categories, curState);
//   renderList(list);
// });

// toggle task status, remove tasks, update VIEWs

// masterList.addEventListener("click", function (e) {
//   e.preventDefault;
//   let target = e.target;
//   let string = target.textContent;
//   console.log(target, string);
//   // when close/child is clicked
//   let li = target.closest("li");
//   let liCategory = li.dataset.cat;

//   // target list items
//   if (target.tagName === "LI") {
//     // VIEW
//     target.classList.toggle("checked");
//     // MODEL
//     list.forEach((el) => {
//       if (el.task.match(string)) {
//         // toggle boolean value
//         let curBool = el.complete;
//         el.complete = !curBool;
//       }
//     });
//   }
//   // target close buttons
//   if (target.classList.contains("close")) {
//     // MODEL - remove the task
//     list = list.filter((el) => el.task != li.textContent);
//     // check category/filter redundancy
//     // let categoryCount = list.filter((el) => el.category === liCategory);

//     // // VIEWs
//     // if (categoryCount.length === 0) {
//     //   //render filterBy with remove category method
//     //   let emptyCat = liCategory;
//     //   console.log(emptyCat, " < pass to renderFilterBy");
//     //   renderfilterBy(categories, curState, emptyCat);
//     // }
//     if (!curState) {
//       renderList(list);
//     }
//     if (curState) {
//       // HELPER
//       const filteredList = applyFilter(list, curState);
//       renderList(filteredList);
//     }
//   }
//   // VIEW
//   calcAnalytics(list);
// });

// HELPERS
function applyFilter(list, curState) {
  return list.filter((el) => el.category === curState);
}

function auditList(list, cat) {
  let count = 0;
  list.forEach((el) => {
    if (el.category === cat) {
      count++;
    }
  });
  return count;
}

function calcAnalytics(list) {
  let complete = list.filter((el) => el.complete === true);
  analytics.innerHTML = complete.length + " / " + list.length;
}

function updateDOM() {}

//
// REQUIREMENTS
//
// ✅ task input
// ✅ display tasks
//
//  custom category input
// ✅ show custom cat in categories dropdown (hot reload data?)
// ✅ show custom category as filters
// ✅ filter list by custom categories (problem: event delagation for newly created buttons)
//
//  toggle a task (complete/incomplete)
// remove a task
// ✅ remove a category (auto or remove button?)
//
// persist tasks / custom cats / input data
// logic to prompt when list is empty
//
// ✅ task analytics
// style + colour
// media queries for basic min screeen sizes
// - desk,
// ✅ - lap
// - tab
// - phone
// img / illustrations
// micro-animations
// loading page/animation

// BUGS / extra functionality
// ✅ add a task > update analytics in DOM
// ✅ filter remove button calls renderList(list) without maintaining list state
// ✅ listClearAll() > cannot remove remaining filters
// ✅ create new cat before alllowing new <li>
// sanitise task & category inputs. Dont allow user to execute code
//
// do not allow duplicate list items?

// ✅ add x to filters
// ✅ kill filter when x is clicked
// display x when filter is empty
// ✅ new function, read list, return empty cats, read filters, add x
