const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  window.location.href = "/login.html";
}
document.querySelector(".user-name").textContent = `Xin chào, ${currentUser.username}`;

let btnSignOut = document.querySelector(".signout-btn");
btnSignOut.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "/login.html";
});

let foods = JSON.parse(localStorage.getItem("foods")) || [
  {
    id: 1,
    name: "Boiled Egg",
    source: "Minh Cuong Tran",
    category: "Protein Foods",
    quantity: "1 egg (50g)",
    energy: 78,
    fat: 5,
    carbs: 0.6,
    protein: 6,
  },
  {
    id: 2,
    name: "Brown Rice, cooked",
    source: "Minh Cuong Tran",
    category: "Grains",
    quantity: "1 cup (195g)",
    energy: 216,
    fat: 1.8,
    carbs: 45,
    protein: 5,
  },
  {
    id: 3,
    name: "Grilled Chicken Breast",
    source: "Minh Cuong Tran",
    category: "Protein Foods",
    quantity: "100g",
    energy: 165,
    fat: 3.6,
    carbs: 0,
    protein: 31,
  },
  {
    id: 4,
    name: "Apple",
    source: "Minh Cuong Tran",
    category: "Fruits",
    quantity: "1 medium (182g)",
    energy: 95,
    fat: 0.3,
    carbs: 25,
    protein: 0.5,
  },
  {
    id: 5,
    name: "Broccoli, steamed",
    source: "Minh Cuong Tran",
    category: "Vegetables and Vegetable Products",
    quantity: "1 cup (156g)",
    energy: 55,
    fat: 0.6,
    carbs: 11,
    protein: 3.7,
  },
  {
    id: 6,
    name: "Salmon, grilled",
    source: "Minh Cuong Tran",
    category: "Fish and Seafood",
    quantity: "100g",
    energy: 208,
    fat: 13,
    carbs: 0,
    protein: 20,
  },
  {
    id: 7,
    name: "Whole Wheat Bread",
    source: "Minh Cuong Tran",
    category: "Grains",
    quantity: "1 slice (28g)",
    energy: 69,
    fat: 1.1,
    carbs: 12,
    protein: 3.6,
  },
  {
    id: 8,
    name: "Banana",
    source: "Minh Cuong Tran",
    category: "Fruits",
    quantity: "1 medium (118g)",
    energy: 105,
    fat: 0.3,
    carbs: 27,
    protein: 1.3,
  },
  {
    id: 9,
    name: "Avocado",
    source: "Minh Cuong Tran",
    category: "Fruits",
    quantity: "1 fruit (201g)",
    energy: 322,
    fat: 29,
    carbs: 17,
    protein: 4,
  },
  {
    id: 10,
    name: "Greek Yogurt, plain",
    source: "Minh Cuong Tran",
    category: "Dairy and Eggs",
    quantity: "1 cup (245g)",
    energy: 130,
    fat: 0.4,
    carbs: 9,
    protein: 23,
  }
];

// ===== DOM Element =====
const foodList = document.querySelector(".food-table");
const paginationContainer = document.querySelector(".pagination-foods");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortNutrientSelect");
const categorySelect = document.getElementById("foodCategorySelect");

let currentPage = 1;
const itemsPerPage = 6;

// ===== Render Cards =====
function renderFoods(arr) {
  let html = "";
  arr.forEach(food => {
    html += `
      <div class="food-row">
          <div class="food-info">
              <p class="food-name">${food.name}</p>
              <p class="food-source">${food.source}</p>
          </div>
          <div class="nutrients">${food.energy ?? "-"} kcal<br><span>Energy</span></div>
          <div class="nutrients">${food.fat ?? "-"} g<br><span>Fat</span></div>
          <div class="nutrients">${food.fat ?? "-"} g<br><span>Carbohydrate</span></div>
          <div class="nutrients">${food.protein ?? "-"} g<br><span>Protein</span></div>
      </div>
    `;
  });

  foodList.innerHTML = arr.length ? html : "<p>No foods found.</p>";
}

// ===== Lọc, tìm kiếm, sắp xếp =====
function getFilteredFoods() {
  let keyword = searchInput.value.toLowerCase().trim();
  let selectedCategory = categorySelect.value;
  let selectedSort = sortSelect.value;

  let filtered = foods.filter(food => {
    const matchKeyword = food.name.toLowerCase().includes(keyword);
    const matchCategory = !selectedCategory || food.category === selectedCategory;
    return matchKeyword && matchCategory;
  });

  if (selectedSort) {
    filtered.sort((a, b) => (b[selectedSort] ?? 0) - (a[selectedSort] ?? 0));
  }

  return filtered;
}

// ===== Phân trang =====
function renderPagination(filtered) {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "page-btn";
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderPaginatedFoods();
    });
    paginationContainer.appendChild(btn);
  }
}

function renderPaginatedFoods() {
  const filtered = getFilteredFoods();
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  renderFoods(filtered.slice(start, end));
  renderPagination(filtered);
}

// ===== Thêm món mới =====
let modal = document.getElementById("createFoodModal");
let openModalBtn = document.querySelector(".create-food-btn");
openModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

let closeModalBtn = document.getElementById("closeCreateModal");
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

let foodForm = document.querySelector("#createFoodModal .food-form");
foodForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = foodForm.querySelector(".field-block:nth-child(1) input").value.trim();
  const source = foodForm.querySelector(".field-block:nth-child(2) input").value.trim();
  const category = foodForm.querySelector(".field-block:nth-child(3) input").value.trim();
  const quantity = foodForm.querySelector(".field-block:nth-child(4) input").value.trim();

  if (!name || !source || !category || !quantity) {
    alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
    return;
  }

  // Lấy dữ liệu các chất chính
  const macroInputs = foodForm.querySelectorAll(".macro-grid .nutrient-row");
  const energy = parseFloat(macroInputs[0].querySelector("input").value) || null;
  const fat = parseFloat(macroInputs[1].querySelector("input").value) || null;
  const carbs = parseFloat(macroInputs[2].querySelector("input").value) || null;
  const protein = parseFloat(macroInputs[3].querySelector("input").value) || null;

  // Lấy dữ liệu vi chất (micronutrients)
  const microInputs = foodForm.querySelectorAll(".micro-grid .nutrient-row");
  let micronutrients = {};
  microInputs.forEach(row => {
    const label = row.querySelector(".nutrient-label").textContent.trim()
      .toLowerCase()
      .replace(/[()]/g, "")
      .replace(/\s+/g, "_")
      .replace(/-/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const value = row.querySelector("input").value.trim();
    micronutrients[label] = value ? parseFloat(value) : null;
  });

  const newFood = {
    id: Date.now(),
    name,
    source,
    category,
    quantity,
    energy,
    fat,
    carbs,
    protein,
    micronutrients,
    createdAt: new Date().toISOString()
  };

  foods.push(newFood);
  localStorage.setItem("foods", JSON.stringify(foods));

  foodForm.reset();
  modal.style.display = "none";
  currentPage = 1;
  renderPaginatedFoods();
});

// ===== Sự kiện tìm kiếm, lọc, sắp xếp =====
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderPaginatedFoods();
});
categorySelect.addEventListener("change", () => {
  currentPage = 1;
  renderPaginatedFoods();
});
sortSelect.addEventListener("change", () => {
  currentPage = 1;
  renderPaginatedFoods();
});

// ===== Khởi động =====
renderPaginatedFoods();
