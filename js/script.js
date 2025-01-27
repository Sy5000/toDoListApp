"use strict";
/**
 * ===================================================================
 *
 *  toDoListApp v1.0 Main JS
 *
 *  ------------------------------------------------------------------
 *  TOC:
 *  01. HTML Element selectors
 *  02. Model - M.V.C ->data model
 *  03. Views - M.V.C ->render HTML functions
 *  04. Controllers - M.V.C ->program logic (update Model > render new views)
 *  05. Helper functions
 *  06. progress / notes
 *
 * ===================================================================
 */

/**
 * ===================================================================
 *  01. HTML Element selectors
 *
 *  ------------------------------------------------------------------
 */

const createTask = document.querySelector("#submitTask");
const createCategory = document.querySelector("#submitCategory");
const categoriesSelect = document.querySelector("#categories-select");
const filtersSelect = document.querySelector("#filters-select");
// const filtersRemove = document.querySelector("#filters-remove");
const analytics = document.querySelector("#analytics");
const masterList = document.querySelector("#masterList");
const catInput = document.querySelector(".catInput");

/**
 * ===================================================================
 *  02. Data Model - global vars
 *
 *  ------------------------------------------------------------------
 */

// default 'category' values
let categories = ["general", "personal", "work"];
// default 'list' data
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
//  used to save filter selection (by category) &&
//  toggle filter button css (active || '') &&
//  render a filtered VIEW of list based on user choice
let curState;

/**
 * ===================================================================
 *  00.
 *
 *  ------------------------------------------------------------------
 */

//////////////////////////////////////////////////////////////////////
// init app

curState = false;
// localListObjectCheck(); // check client storage
// localCatObjectCheck(); // check client storage
calcAnalytics(list);
renderCategorySelect(categories);
renderfilterBy(categories, curState);
renderList(list);

//////////////////////////////////////////////////////////////////////

/**
 * ===================================================================
 *  00. VIEWS - render HTML functions
 *
 *  ------------------------------------------------------------------
 */

//////////////////////////////////////////////////////////////////////
//  categories-select-list
//    categories = Array

function renderCategorySelect(categories) {
  // new html
  categoriesSelect.innerHTML =
    "<option value=''>- please select a category -</option>";
  // model
  categories.forEach((el) => {
    // new html
    categoriesSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${el}">${el}</option>`
    );
  });
}

//////////////////////////////////////////////////////////////////////
//  filters-list
//    categories = Array, curState = String

function renderfilterBy(categories, curState) {
  // remove html
  filtersSelect.innerHTML = "";
  // model
  categories.forEach((el) => {
    // is category 'active'
    let state = el === curState ? "active" : "";
    // new html
    filtersSelect.insertAdjacentHTML(
      "beforeend",
      `<div type='button' class='filter__button ${state}' data-cat='${el}'>
                   ${el}
                   <span class='remove'></span>
                 </div>`
    );
  });
}

//////////////////////////////////////////////////////////////////////
//  master list
//    list = Object

function renderList(list) {
  // ???
  // existing html (check for empty list)
  // masterList.innerHTML = list.length === 0 ? "<p>No tasks to show</p>" : "";
  // ???

  // remove html
  masterList.innerHTML = "";
  // model
  list.forEach((el) => {
    // check task status
    let taskStatus = el.complete === true ? "checked" : "";

    // new html
    masterList.insertAdjacentHTML(
      "beforeend",
      `<li class="li" data-cat="${el.category}">
            <input id="${el.task}" type="checkbox" name="taskStatus" ${taskStatus}/>
            <label for="${el.task}">${el.task}</label>
            <span class="close"></span>
          </li>
      `
    );
  });
}

//////////////////////////////////////////////////////////////////////
// toggle input el visibility
function toggleAddCategory() {
  catInput.style.display =
    catInput.style.display === "block" ? "none" : "block";
}

/**
 * ===================================================================
 *  00. Controllers - Application Logic
 *
 *  ------------------------------------------------------------------
 */

//////////////////////////////////////////////////////////////////////
// add task to list, update VIEWs
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
  // persist data
  storeListDataLocally(list);
  // VIEW
  renderList(list);
  calcAnalytics(list);
  // removes active class
  renderfilterBy(categories);
  // clear inputs
  task.value = categorySelect.value = "";
});

//////////////////////////////////////////////////////////////////////
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
    storeCatDataLocally(categories);
    // VIEW
    category.value = "";
    renderCategorySelect(categories);
    renderfilterBy(categories, curState);
  }
});

//////////////////////////////////////////////////////////////////////
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

//////////////////////////////////////////////////////////////////////
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
//
//////////////////////////////////////////////////////////////////////
// task list, remove task, update VIEWs
masterList.addEventListener("click", function (e) {
  // vars
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
  }
  // Remove task item
  if (clickedArea === "SPAN") {
    const taskString = target.parentElement.textContent.trim();
    console.log(taskString, "remove logic");
    list = list.filter((el) => el.task != taskString);
    renderList(list);
  }
  // guard
  if (clickedArea === "LI" || "INPUT") {
    return;
  }
});

// /////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////

// event listener on li will dissapear on re render
// grab rendered task list
// let elArray = document.querySelectorAll(".li");
// // add event listener to ea li
// elArray.forEach(function (el) {
//   el.addEventListener("click", function (e) {
//     let target = e.target;
//     let clickedArea = target.tagName;
//     // Toggle MODEL: list.complete.{BOOLEAN}
//     if (clickedArea === "LABEL") {
//       // Task Text
//       let string = target.textContent;

//       // MODEL;
//       list.forEach((el) => {
//         if (el.task.match(string)) {
//           // toggle boolean value
//           let curBool = el.complete;
//           el.complete = !curBool;
//         }
//       });
//       // VIEW
//       calcAnalytics(list);
//       // toggle HTML checked attribute
//       // ...
//     }
//     // REMOVE BUTT
//     if (clickedArea === "SPAN") {
//       console.log("click");
//       const taskString = this.textContent.trim();
//       list = list.filter((el) => el.task != taskString);
//       console.log(list);
//       renderList(list);
//       // event listener again???
//       elArray = document.querySelectorAll(".li");

//       // remove from model
//       // console.log("remove from model and update view", this);
//       // console.log("clicked", list);
//       // const taskText = this.textContent.trim();
//       // list = list.filter((el) => el.task != taskText);
//       // // VIEW
//       // renderList(list);
//     }
//     // guard
//     if (clickedArea === "LI" || "INPUT") {
//       return;
//     }
//   });
// });
// /////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////

// console.log(elArray, "point?");

// remove filters, update VIEWs
// filtersRemove.addEventListener("click", function (e) {
//   // MODEL
//   curState = false;
//   // VIEW
//   renderfilterBy(categories, curState);
//   renderList(list);
// });

// toggle task status, remove tasks, spdate VIEWs
// masterList.addEventListener("click", function (e) {
//   let target = e.target;
//   let string = target.textContent;
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

/**
 * ===================================================================
 *  00. Helper functions
 *
 *  ------------------------------------------------------------------
 */

// check client for local saved data && retreive
// function localListObjectCheck() {
//   // model - list
//   if (localStorage.getItem("list")) {
//     const localListString = localStorage.getItem("list");
//     list = JSON.parse(localListString);
//     return list;
//   }
// }
// function localCatObjectCheck() {
//   // model - categories
//   if (localStorage.getItem("categories")) {
//     const localCatString = localStorage.getItem("categories");
//     categories = JSON.parse(localCatString);
//     return categories;
//   }
// }
// // store new data locally
// function storeListDataLocally(modelData) {
//   // convert to string
//   const toStore = JSON.stringify(modelData);

//   localStorage.removeItem(modelData); // remove old list data
//   localStorage.setItem("list", toStore); // update model
// }

// function storeCatDataLocally(modelData) {
//   // convert to string
//   const toStore = JSON.stringify(modelData);
//   localStorage.removeItem(modelData);
//   localStorage.setItem("categories", toStore);
// }

// count completed tasks
function calcAnalytics(list) {
  let complete = list.filter((el) => el.complete === true);
  analytics.innerHTML = complete.length + " / " + list.length;
}
// add css to clicked filer butts
function applyFilter(list, curState) {
  return list.filter((el) => el.category === curState);
}
// ???
function auditList(list, cat) {
  let count = 0;
  list.forEach((el) => {
    if (el.category === cat) {
      count++;
    }
  });
  return count;
}

function updateDOM() {}

/**\
 * ===================================================================
 *  00. progress/notes
 *
 *  ------------------------------------------------------------------
 *
 * REQUIREMENTS
 *
 *   edit / save localy username
 *   ✅ task input
 *   ✅ display tasks
 *   custom category input
 *   ✅ show custom cat in categories dropdown (hot reload)
 *   ✅ show custom category as filters
 *   ✅ filter list by custom categories (problem: event delagation for newly created buttons)
 *   ✅ toggle a task (complete/incomplete)
 *   ✅ remove a task
 *   ✅ remove a category (auto or remove button?)
 *   ✅ task analytics
 *   ✅ persist 'tasks' input data
 *   ✅ persist ' custom cats' input data
 *   persist checked / unchecked tasks ???
 *   logic to prompt when list is empty
 *   media queries for basic min screeen sizes
 *   - desk,
 *   - tab,
 *   - mob
 *   img / illustrations
 *   micro-animations
 *   loading page/animation
 *   hosting demo on pages
 *
 * BUGS / extra functionality
 *
 *   ✅ filter remove button calls renderList(list) without maintaining list state
 *   ✅ listClearAll() > cannot remove remaining filters
 *   ✅ create new cat before alllowing new <li>
 *   sanitise task & category inputs. Dont allow user to execute code
 *   ✅ add x to filters
 *   ✅ kill filter when x is clicked
 *   only display x when filter is empty
 *   do not allow duplicate list items?
 *   checkbox && label click area (click area may be too small, sometimes updates VIEW but not MODEL leaving analytics, list and view mismatched)
 *
 *
 * ===================================================================
 **/
