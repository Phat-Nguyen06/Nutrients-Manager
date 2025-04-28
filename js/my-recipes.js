const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  window.location.href = "/login.html";
}
document.querySelector(".user-name").textContent = `Xin chào, ${currentUser.username}`;

let recipes = JSON.parse(localStorage.getItem("recipes")) || [];

const recipeList = document.querySelector(".recipe-list");
const paginationContainer = document.getElementById("pagination");
let currentPage = 1;
const itemsPerPage = 4;

const searchInput = document.querySelector('.search-bar input[type="text"]');
const sortSelect = document.getElementById('sortSelect');
const categorySelect = document.getElementById('categorySelect');
const sortIcon = document.querySelector(".sort-group i");

let currentSortKey = "";
let isSortAsc = false;

// ==== Tính tổng dinh dưỡng từ ingredients ==== 
function getRecipeTotal(recipe, nutrient) {
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return "?";

  let total = 0;
  recipe.ingredients.forEach(ingredient => {
    if (ingredient.food && ingredient.food.macronutrients && ingredient.food.macronutrients[nutrient] != null) {
      total += parseFloat(ingredient.food.macronutrients[nutrient]) || 0;
    }
  });
  return Math.round(total);
}

// ==== Render công thức ==== 
function renderAllRecipes(recipeArr) {
  recipeList.innerHTML = recipeArr.length > 0
    ? recipeArr.map(recipe => `
      <div class="recipe-card">
        <div class="card-left">
          <div class="card-badge">
            <i class="fas fa-users"></i>
            <span>Community Recipes</span>
          </div>
          <img class="card-img" src="${recipe.coverSrc || "/assets/images/img-avata-food/default-avata.png"}" alt="recipe image">
        </div>

        <div class="card-right">
          <div class="card-header">
            <div>
              <h2 class="recipe-title">${recipe.name}</h2>
              <p class="author">${recipe.author}</p>
              <p class="ingredients">${recipe.category?.map(c => c.name).join(", ") || "No category"}</p>
            </div>
            <div class="likes" data-id="${recipe.id}">
              <i class="${recipe.likedBy?.includes(currentUser.email) ? 'fas' : 'far'} fa-heart"></i>
              <span>${recipe.likes || 0}</span>
            </div>
          </div>

          <div class="nutrition-table">
            <div class="nutrient">by<br><strong>100g</strong></div>
            <div class="nutrient">Energy<br><strong>${getRecipeTotal(recipe, 'energy')} kcal</strong></div>
            <div class="nutrient">Fat<br><strong>${getRecipeTotal(recipe, 'fat')} g</strong></div>
            <div class="nutrient">Carbohydrate<br><strong>${getRecipeTotal(recipe, 'carbohydrate')} g</strong></div>
            <div class="nutrient">Protein<br><strong>${getRecipeTotal(recipe, 'protein')} g</strong></div>
          </div>
        </div>
      </div>
    `).join("")
    : "<p>No recipes found.</p>";
}

let viewingMode = "all"; // "all", "favorites", "myrecipes"

// Khi click nút "Favorites"
document.querySelector(".favorites-toggle").addEventListener("click", () => {
  viewingMode = "favorites";
  currentPage = 1;
  renderPaginatedRecipes();
});

// Khi click nút "My Recipes"
document.querySelector(".my-recipes-btn").addEventListener("click", () => {
  viewingMode = "myrecipes";
  currentPage = 1;
  renderPaginatedRecipes();
});

// All
document.querySelector(".all-recipes-btn").addEventListener("click", () => {
  viewingMode = "all";
  currentPage = 1;
  renderPaginatedRecipes();
});

// ==== Lọc và phân trang ==== 
function filterRecipes(recipesList) {
  const keyword = searchInput.value.toLowerCase().trim();
  const selectedCategory = categorySelect.value;

  let filtered = recipesList.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(keyword);
    const ingredientsMatch = recipe.ingredients?.some(ing => ing.food?.name.toLowerCase().includes(keyword));
    const matchKeyword = nameMatch || ingredientsMatch;

    const matchCategory = !selectedCategory || recipe.category?.some(c => c.name === selectedCategory);

    // Áp dụng lọc theo chế độ viewingMode
    if (viewingMode === "favorites" && (!recipe.likedBy || !recipe.likedBy.includes(currentUser.email))) {
      return false;
    }
    if (viewingMode === "myrecipes" && recipe.userEmail !== currentUser.email) {
      return false;
    }

    return matchKeyword && matchCategory;
  });

  if (currentSortKey) {
    filtered.sort((a, b) => {
      const aVal = getRecipeTotal(a, currentSortKey.toLowerCase());
      const bVal = getRecipeTotal(b, currentSortKey.toLowerCase());
      return isSortAsc ? aVal - bVal : bVal - aVal;
    });
  }

  return filtered;
}

// ==== Phân trang ==== 
function renderPagination(filteredRecipes) {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);

  const createBtn = (label, page, isActive = false, isDisabled = false) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.classList.add("page-btn");
    if (isActive) btn.classList.add("active");
    if (isDisabled) btn.disabled = true;

    btn.addEventListener("click", () => {
      if (!isDisabled && page !== null) {
        currentPage = page;
        renderPaginatedRecipes();
      }
    });

    return btn;
  };

  paginationContainer.appendChild(createBtn("«", currentPage - 1, false, currentPage === 1));
  paginationContainer.appendChild(createBtn("1", 1, currentPage === 1));

  if (currentPage > 4) {
    paginationContainer.appendChild(createBtn("...", null, false, true));
  }

  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    paginationContainer.appendChild(createBtn(i, i, currentPage === i));
  }

  if (currentPage < totalPages - 3) {
    paginationContainer.appendChild(createBtn("...", null, false, true));
  }

  if (totalPages > 1) {
    paginationContainer.appendChild(createBtn(totalPages, totalPages, currentPage === totalPages));
  }

  paginationContainer.appendChild(createBtn("»", currentPage + 1, false, currentPage === totalPages));
}

function getUserRecipes() {
  return recipes.filter(recipe =>
    recipe.userEmail === currentUser.email ||
    (recipe.likedBy && recipe.likedBy.includes(currentUser.email))
  );
}


// ==== Render Trang hiện tại ==== 
function renderPaginatedRecipes() {
  const userRecipes = getUserRecipes();
  const filtered = filterRecipes(userRecipes);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  renderAllRecipes(filtered.slice(start, end));
  renderPagination(filtered);
  updateFavoriteCount();
}

// ==== Các sự kiện lọc, tìm kiếm, sort ==== 
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderPaginatedRecipes();
});

sortSelect.addEventListener("change", () => {
  currentSortKey = sortSelect.value;
  currentPage = 1;
  renderPaginatedRecipes();
});

categorySelect.addEventListener("change", () => {
  currentPage = 1;
  renderPaginatedRecipes();
});

sortIcon.addEventListener("click", () => {
  if (!currentSortKey) return;
  isSortAsc = !isSortAsc;
  renderPaginatedRecipes();
});

// ==== Like công thức ==== 
document.addEventListener("click", function (e) {
  const heartIcon = e.target.closest(".likes i");
  if (!heartIcon) return;

  const card = heartIcon.closest(".recipe-card");
  const recipeTitle = card.querySelector(".recipe-title").textContent.trim();

  const recipe = recipes.find(r => r.name === recipeTitle);
  if (!recipe) return;

  if (!recipe.likedBy) recipe.likedBy = [];

  const isLiked = recipe.likedBy.includes(currentUser.email);

  if (isLiked) {
    recipe.likedBy = recipe.likedBy.filter(email => email !== currentUser.email);
    if (recipe.likes > 0) recipe.likes--;
    updateFavoriteCount();
    Toastify({
      text: "💔 Bạn đã hủy thả tim!",
      duration: 3000,
      gravity: "top",
      position: "center",
      style: {
        background: "#ffe0e0",
        color: "#c62828",
        borderRadius: "8px",
        fontWeight: "bold",
      },
    }).showToast();

  } else {
    recipe.likedBy.push(currentUser.email);
    recipe.likes++;
    updateFavoriteCount();
    Toastify({
      text: "💔 Bạn đã hủy thả tim!",
      duration: 3000,
      gravity: "top",
      position: "center",
      style: {
        background: "#ffe0e0",
        color: "#c62828",
        borderRadius: "8px",
        fontWeight: "bold",
      },
    }).showToast();
  }

  localStorage.setItem("recipes", JSON.stringify(recipes));
  renderPaginatedRecipes();
});

function updateFavoriteCount() {
  const favoriteCount = document.getElementById("favoriteCount");
  const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const liked = recipes.filter(recipe => Array.isArray(recipe.likedBy) && recipe.likedBy.includes(currentUser.email));
  favoriteCount.textContent = liked.length;
}

// ==== Khởi động lần đầu ==== 
renderPaginatedRecipes();
