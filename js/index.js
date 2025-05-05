// ==== Xử lý đăng nhập ====
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

// ==== Load công thức mẫu nếu chưa có ====
if (!localStorage.getItem("recipes")) {
  const sampleRecipes = [
    {
      id: Date.now(),
      userEmail: "community@nutrium.com",
      author: "Community",
      name: "Avocado Egg Toast",
      description: "Simple and healthy breakfast with avocado and soft-boiled egg.",
      coverSrc: "/assets/images/img-avata-food/default-avata.png",
      ingredients: [
        { food: { name: "Avocado", macronutrients: { energy: 160, fat: 15, carbohydrate: 9, protein: 2 } } },
        { food: { name: "Egg", macronutrients: { energy: 78, fat: 5, carbohydrate: 1, protein: 6 } } }
      ],
      category: [{ id: 1, name: "Breakfast and snacks" }, { id: 2, name: "Lean & Green" }],
      cookingMethods: [{ id: 1, content: "Toast bread, mash avocado, top with boiled egg slices." }],
      likes: 12,
      likedBy: [],
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 1,
      userEmail: "community@nutrium.com",
      author: "Community",
      name: "Grilled Chicken Salad",
      description: "A protein-packed light salad for lunch.",
      coverSrc: "/assets/images/img-avata-food/default-avata.png",
      ingredients: [
        { food: { name: "Chicken Breast", macronutrients: { energy: 165, fat: 3.6, carbohydrate: 0, protein: 31 } } },
        { food: { name: "Lettuce", macronutrients: { energy: 15, fat: 0.2, carbohydrate: 2.9, protein: 1.4 } } }
      ],
      category: [{ id: 2, name: "Lean & Green" }],
      cookingMethods: [{ id: 1, content: "Grill chicken, toss with fresh greens." }],
      likes: 20,
      likedBy: [],
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 2,
      userEmail: "community@nutrium.com",
      author: "Community",
      name: "Salmon Teriyaki Rice Bowl",
      description: "Japanese style grilled salmon with teriyaki sauce.",
      coverSrc: "/assets/images/img-avata-food/default-avata.png",
      ingredients: [
        { food: { name: "Salmon", macronutrients: { energy: 208, fat: 13, carbohydrate: 0, protein: 20 } } },
        { food: { name: "Rice", macronutrients: { energy: 130, fat: 0.3, carbohydrate: 28, protein: 2.7 } } }
      ],
      category: [{ id: 3, name: "Fish dishes" }],
      cookingMethods: [{ id: 1, content: "Grill salmon, serve with rice and teriyaki sauce." }],
      likes: 18,
      likedBy: [],
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 3,
      userEmail: "community@nutrium.com",
      author: "Community",
      name: "Vegan Buddha Bowl",
      description: "A colorful bowl with quinoa and mixed veggies.",
      coverSrc: "/assets/images/img-avata-food/default-avata.png",
      ingredients: [
        { food: { name: "Quinoa", macronutrients: { energy: 120, fat: 1.9, carbohydrate: 21.3, protein: 4.4 } } },
        { food: { name: "Broccoli", macronutrients: { energy: 55, fat: 0.6, carbohydrate: 11, protein: 3.7 } } }
      ],
      category: [{ id: 4, name: "Vegetarian dishes" }],
      cookingMethods: [{ id: 1, content: "Cook quinoa, steam veggies, assemble with dressing." }],
      likes: 22,
      likedBy: [],
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 4,
      userEmail: "community@nutrium.com",
      author: "Community",
      name: "Beef Stir-Fry with Vegetables",
      description: "Quick and tasty beef stir-fry for dinner.",
      coverSrc: "/assets/images/img-avata-food/default-avata.png",
      ingredients: [
        { food: { name: "Beef", macronutrients: { energy: 250, fat: 17, carbohydrate: 0, protein: 26 } } },
        { food: { name: "Bell Pepper", macronutrients: { energy: 40, fat: 0.2, carbohydrate: 9, protein: 1.2 } } }
      ],
      category: [{ id: 5, name: "Meat dishes" }],
      cookingMethods: [{ id: 1, content: "Stir-fry beef and veggies in a hot pan." }],
      likes: 15,
      likedBy: [],
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 5,
      userEmail: "community@nutrium.com",
      author: "Community",
      name: "Berry Yogurt Parfait",
      description: "A refreshing snack or dessert layered with yogurt and berries.",
      coverSrc: "/assets/images/img-avata-food/default-avata.png",
      ingredients: [
        { food: { name: "Greek Yogurt", macronutrients: { energy: 130, fat: 0.4, carbohydrate: 9, protein: 23 } } },
        { food: { name: "Berries", macronutrients: { energy: 57, fat: 0.3, carbohydrate: 14, protein: 0.7 } } }
      ],
      category: [{ id: 6, name: "Snacks and desserts" }],
      cookingMethods: [{ id: 1, content: "Layer yogurt and berries in a cup." }],
      likes: 17,
      likedBy: [],
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 6,
      userEmail: "community@nutrium.com",
      author: "Community",
      name: "Peanut Butter Energy Balls",
      description: "Healthy snack balls made with oats and peanut butter.",
      coverSrc: "/assets/images/img-avata-food/default-avata.png",
      ingredients: [
        { food: { name: "Oats", macronutrients: { energy: 389, fat: 7, carbohydrate: 66, protein: 17 } } },
        { food: { name: "Peanut Butter", macronutrients: { energy: 588, fat: 50, carbohydrate: 20, protein: 25 } } }
      ],
      category: [{ id: 7, name: "Healthy snacks" }],
      cookingMethods: [{ id: 1, content: "Mix all ingredients, roll into balls, chill." }],
      likes: 19,
      likedBy: [],
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem("recipes", JSON.stringify(sampleRecipes));
}

let recipes = JSON.parse(localStorage.getItem("recipes"));

// ==== DOM Element ====
const recipeList = document.querySelector(".recipe-list");
const paginationContainer = document.getElementById("pagination");

let currentPage = 1;
const itemsPerPage = 4;
let currentSortKey = "";
let isSortAsc = false;

// ==== Hàm tính tổng dinh dưỡng ====
function getRecipeTotal(recipe, nutrient) {
  if (!recipe.ingredients) return "?";
  let total = 0;
  recipe.ingredients.forEach(ingredient => {
    if (ingredient.food?.macronutrients?.[nutrient] != null) {
      total += parseFloat(ingredient.food.macronutrients[nutrient]) || 0;
    }
  });
  return Math.round(total);
}

// ==== Hàm render recipe card ====
function renderAllRecipes(recipeArr) {
  recipeList.innerHTML = recipeArr.length ? recipeArr.map(recipe => `
    <div class="recipe-card" data-id="${recipe.id}">
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
  `).join("") : "<p>No recipes found.</p>";
}

// ==== Hàm lọc và tìm kiếm ====
const searchInput = document.querySelector('.search-bar input[type="text"]');
const sortSelect = document.getElementById('sortSelect');
const categorySelect = document.getElementById('categorySelect');
const sortIcon = document.querySelector(".sort-group i");

function filterRecipes(recipeArr) {
  const keyword = searchInput.value.toLowerCase().trim();
  const selectedCategory = categorySelect.value;

  return recipeArr.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(keyword);
    const ingredientsMatch = recipe.ingredients?.some(ing => ing.food?.name.toLowerCase().includes(keyword));
    const matchKeyword = nameMatch || ingredientsMatch;
    const matchCategory = !selectedCategory || recipe.category?.some(c => c.name === selectedCategory);
    return matchKeyword && matchCategory;
  }).sort((a, b) => {
    if (!currentSortKey) return 0;
    const aVal = getRecipeTotal(a, currentSortKey.toLowerCase());
    const bVal = getRecipeTotal(b, currentSortKey.toLowerCase());
    return isSortAsc ? aVal - bVal : bVal - aVal;
  });
}

// ==== Render phân trang ====
function renderPagination(filteredRecipes) {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);

  if (totalPages <= 1) return;

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
  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.appendChild(createBtn(i, i, currentPage === i));
  }
  paginationContainer.appendChild(createBtn("»", currentPage + 1, false, currentPage === totalPages));
}

// ==== Render công thức hiện tại ====
function renderPaginatedRecipes() {
  const filtered = filterRecipes(recipes);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  renderAllRecipes(filtered.slice(start, end));
  renderPagination(filtered);
}

// ==== Xử lý search, sort, category change ====
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderPaginatedRecipes();
});

sortSelect.addEventListener("change", () => {
  currentSortKey = sortSelect.value;
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

// ==== Xử lý thả tim ====
document.addEventListener("click", (e) => {
  const likesBlock = e.target.closest(".likes");
  if (likesBlock) {
    e.stopPropagation();
    const card = likesBlock.closest(".recipe-card");
    if (!card) return;

    const recipeId = Number(card.dataset.id);
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    // Xử lý thả tim
    if (!recipe.likedBy) recipe.likedBy = [];
    const isLiked = recipe.likedBy.includes(currentUser.email);

    if (isLiked) {
      recipe.likedBy = recipe.likedBy.filter(email => email !== currentUser.email);
      recipe.likes = Math.max(0, (recipe.likes || 0) - 1);
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
      recipe.likes = (recipe.likes || 0) + 1;
      Toastify({
        text: "💖 Bạn đã thả tim!",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
          background: "#f8bbd0",
          color: "#880e4f",
          borderRadius: "8px",
          fontWeight: "bold",
        },
      }).showToast();
    }

    localStorage.setItem("recipes", JSON.stringify(recipes));
    renderPaginatedRecipes();
    return; // Dừng luôn, không cho chạy code mở chi tiết
  }

  // Nếu không click vào likes, kiểm tra click vào recipe card
  const card = e.target.closest(".recipe-card");
  if (card) {
    const recipeId = Number(card.dataset.id);
    openRecipeDetail(recipeId);
  }
});

// Hàm để mở info
function openRecipeDetail(id) {
  const recipe = recipes.find(r => r.id === id);

  if (recipe.userEmail === currentUser.email) {
    localStorage.setItem("tempRecipe", JSON.stringify(recipe))
    window.location.href = "/page/recipe-edit-detail.html"
  } else {
    localStorage.setItem("tempRecipe", JSON.stringify(recipe))
    window.location.href = "/page/recipe-detail.html"
  }
}

// ==== Initial render ====
renderPaginatedRecipes();
