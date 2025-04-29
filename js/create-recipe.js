const currentUser = JSON.parse(localStorage.getItem("currentUser"));
document.querySelector(".user-name").textContent = `Xin chào, ${currentUser.username}`;

let uploadBox = document.getElementById('uploadBox');
let uploadInput = document.getElementById('uploadInput');
let uploadImage = document.getElementById('uploadImage');

uploadBox.addEventListener('click', () => {
    uploadInput.click();
});

uploadInput.addEventListener('change', (event) => {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            uploadImage.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

let allFoods = JSON.parse(localStorage.getItem("foods")) || [];

//Món người chọn
let selectedIngredients = [];
let cookingSteps = [];
let currentAddingEquivalent = null;



let currentPage = 1;
const itemsPerPage = 4;
// ==== Ingredients ====
let ingredientList = document.getElementById("ingredientList");
function renderIngredientList(arr) {
    let textIngredientList = "";

    arr.forEach(food => {
        textIngredientList += `
            <tr>
                <td>
                    <p>${food.name}</p>
                    <small>Community Recipes</small>
                    <div class="portion-input">
                        <input type="number" value="1"> portion (87 grams)
                    </div>
                </td>
                <td>${food.macronutrients?.energy ?? "-"} kcal</td>
                <td>${food.macronutrients?.fat ?? "-"} g</td>
                <td>${food.macronutrients?.carbohydrate ?? "-"} g</td>
                <td>${food.macronutrients?.protein ?? "-"} g</td>
                <td><button class="btn-add" onclick="addIngredients(${food.id})"><i class="fas fa-plus"></i></button></td>
            </tr>
        `;
    });

    ingredientList.innerHTML = textIngredientList;
}

// ===== Lọc, tìm kiếm, sắp xếp =====
let currentSortKey = "";
let isSortAsc = false;

let categorySelect = document.getElementById("sortSelect");
let ingredientSearch = document.getElementById("ingredientSearch");

function getFilteredFoods() {
    let keyword = ingredientSearch.value.toLowerCase().trim();
    let selectedSort = sortSelect.value;

    let filtered = allFoods.filter(food => {
        const matchKeyword = food.name.toLowerCase().includes(keyword);
        return matchKeyword;
    });

    if (currentSortKey) {
        filtered.sort((a, b) => {
            const aVal = a.macronutrients?.[currentSortKey.toLowerCase()] ?? 0;
            const bVal = b.macronutrients?.[currentSortKey.toLowerCase()] ?? 0;
            return isSortAsc ? aVal - bVal : bVal - aVal;
        });
    }

    return filtered;
}

const paginationContainer = document.querySelector(".pagination");
// ==== Render phân trang ====
function renderPagination(filtered) {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    let createBtn = (label, page, isActive = false, isDisabled = false) => {
        let btn = document.createElement("button");
        btn.textContent = label;
        btn.classList.add("page-btn");
        if (isActive) btn.classList.add("active");
        if (isDisabled) btn.disabled = true;

        btn.addEventListener("click", () => {
            if (!isDisabled && page !== null) {
                currentPage = page;
                renderPaginatedFoods();
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
        paginationContainer.appendChild("...", null, false, true);
    }

    if (totalPages > 1) {
        paginationContainer.appendChild(createBtn(totalPages, totalPages, currentPage === totalPages));
    }

    paginationContainer.appendChild(createBtn("»", totalPages + 1, false, currentPage === totalPages));
}

function renderPaginatedFoods() {
    const filtered = getFilteredFoods();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    renderIngredientList(filtered.slice(start, end));
    renderPagination(filtered);
}

// ==== Xử lý search, sort, category change ====
ingredientSearch.addEventListener("input", () => {
    currentPage = 1;
    renderPaginatedFoods();
});

sortSelect.addEventListener("change", () => {
    currentSortKey = sortSelect.value;
    renderPaginatedFoods();
});

// categorySelect.addEventListener("change", () => {
//     currentPage = 1;
//     renderPaginatedRecipes();
// });

// thêm 1 nguyên liệu
function addIngredients(foodId) {
    const food = allFoods.find(f => f.id === foodId);
    if (food) {
        selectedIngredients.push({ food: food, equivalents: [] });
        renderSelectedIngredients();
        updateGlobalAnalysis();
        renderMicronutrients();
    }
}

// ingredientSearch.addEventListener("input", renderIngredientList);

// hiển thị cái sẽ đc người dùng chọn
let selectedIngredientsDiv = document.getElementById("selectedIngredients");
function renderSelectedIngredients() {
    selectedIngredientsDiv.innerHTML = selectedIngredients.map((ingredient, idx) => `
          <div class="ingredient-block">
            <p>1 portion of ${ingredient.food.name}</p>
            <button class="btn-trash" onclick="deleteIngredients(${ingredient.food.id})"><i class="fas fa-trash"></i></button>
          </div>
          <div class="add-equivalent">
                <i class="fas fa-plus"></i>
            <span>Add new food equivalent</span>
            </div>
        `).join("");
}

// Thêm sự kiện click để xóa nguyên liệu
function deleteIngredients(foodId) {
    const idx = selectedIngredients.findIndex(item => item.food.id === foodId);
    if (idx !== -1) {
        selectedIngredients.splice(idx, 1);
        renderSelectedIngredients();
        updateGlobalAnalysis();
        renderMicronutrients();
    }
}

// ==== Cooking Methods ====
const cookingMethodsList = document.getElementById("cookingMethodsList");
const addCookingStepBtn = document.getElementById("addCookingStepBtn");

addCookingStepBtn.addEventListener("click", () => {
    cookingSteps.push({ id: Date.now(), content: "" });
    renderCookingMethods();
});


function renderCookingMethods() {
    cookingMethodsList.innerHTML = cookingSteps.map((step, idx) => `
      <div class="cooking-step">
        <input type="text" data-idx="${idx}" value="${step.content}" placeholder="Step description" onchange="updateCookingStep(${idx}, this.value)">
        <button class="btn-remove-step" onclick="removeCookingStep(${idx})">Remove</button>
      </div>
    `).join("");
}

function updateCookingStep(idx, newValue) {
    cookingSteps[idx].content = newValue;
}

function removeCookingStep(idx) {
    cookingSteps.splice(idx, 1);
    renderCookingMethods();
}

// ==== Publish Recipe ====
let publishRecipeBtn = document.getElementById("publishRecipeBtn");
publishRecipeBtn.addEventListener("click", () => {
    const name = document.getElementById("recipeNameInput").value.trim();
    const description = document.getElementById("recipeDescriptionInput").value.trim();
    const totalHour = document.getElementById("totalHour").value.trim();
    const totalMinute = document.getElementById("totalMinute").value.trim();
    const prepHour = document.getElementById("prepHour").value.trim();
    const prepMinute = document.getElementById("prepMinute").value.trim();
    const finalWeight = document.getElementById("finalWeightInput").value.trim();
    const portions = document.getElementById("portionsInput").value.trim();

    const selectedCategories = [...document.querySelectorAll(".category-checkbox:checked")].map(c => ({
        id: Date.now() + Math.random(), // fake id cho category
        name: c.value
    }));

    if (!name || !description || selectedIngredients.length === 0 || cookingSteps.length === 0) {
        Toastify({
            text: "❗ Vui lòng điền đủ thông tin và thêm ít nhất 1 nguyên liệu và 1 bước nấu!",
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "#ff9800",
        }).showToast();
        return;
    }

    const recipes = JSON.parse(localStorage.getItem("recipes")) || [];

    const newRecipe = {
        id: Date.now(),
        coverSrc: uploadImage.src.includes("default") ? "/assets/images/img-avata-food/default-avata.png" : uploadImage.src,
        userEmail: currentUser.email,
        author: currentUser.username,
        name,
        description,
        totalTime: `${totalHour.padStart(2, '0')}:${totalMinute.padStart(2, '0')}`,
        preparationTime: `${prepHour.padStart(2, '0')}:${prepMinute.padStart(2, '0')}`,
        finalWeight,
        portions,
        ingredients: selectedIngredients,
        cookingMethods: cookingSteps,
        category: selectedCategories,
        createdAt: new Date().toISOString()
    };

    recipes.push(newRecipe);
    localStorage.setItem("recipes", JSON.stringify(recipes));

    Toastify({
        text: "🎉 Công thức đã được tạo thành công!",
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#4caf50",
    }).showToast();

    setTimeout(() => {
        window.location.href = "/page/my-recipes.html";
    }, 1500);
});


// Các phần cần ẩn/hiện
const ingredientSearchBar = document.querySelector(".ingredient-search-bar");
const foodTable = document.querySelector(".food-table");
const pagination = document.querySelector(".pagination");
const collapseBtn = document.querySelector(".btn-collapse");
const collapseIcon = collapseBtn.querySelector("i");

let isIngredientPanelVisible = false;

collapseBtn.addEventListener("click", () => {
    if (isIngredientPanelVisible) {
        ingredientSearchBar.classList.add("hidden");
        foodTable.classList.add("hidden");
        pagination.classList.add("hidden");

        collapseIcon.classList.remove("fa-chevron-up");
        collapseIcon.classList.add("fa-chevron-down");
    } else {
        ingredientSearchBar.classList.remove("hidden");
        foodTable.classList.remove("hidden");
        pagination.classList.remove("hidden");

        collapseIcon.classList.remove("fa-chevron-down");
        collapseIcon.classList.add("fa-chevron-up");
    }
    isIngredientPanelVisible = !isIngredientPanelVisible;
});


// Khi renderSelectedIngredients hoặc Publish Recipe, cập nhật:
function updateGlobalAnalysis() {
    let totalFat = 0, totalCarbs = 0, totalProtein = 0, totalFiber = 0;

    selectedIngredients.forEach(item => {
        const mainMa = item.food.macronutrients || {};
        const mainMi = item.food.micronutrients || {};
        totalFat += Number(mainMa.fat || 0);
        totalCarbs += Number(mainMa.carbohydrate || 0);
        totalProtein += Number(mainMa.protein || 0);
        totalFiber += Number(mainMi.fiber || 0);

        // item.equivalents.forEach(eq => {
        //     const equivalent = eq.macronutrients || {};
        //     totalFat += Number(equivalent.fat || 0);
        //     totalCarbs += Number(equivalent.carbohydrate || 0);
        //     totalProtein += Number(equivalent.protein || 0);
        //     totalFiber += Number(equivalent.fiber || 0);
        // });
    });

    document.getElementById("fatValue").textContent = `${totalFat.toFixed(1)}g`;
    document.getElementById("carbValue").textContent = `${totalCarbs.toFixed(1)}g`;
    document.getElementById("proteinValue").textContent = `${totalProtein.toFixed(1)}g`;
    document.getElementById("fiberValue").textContent = `${totalFiber.toFixed(1)}g`;

    drawMacroPieChart(totalFat, totalCarbs, totalProtein);
}

// Pie chart
let pieChartInstance = null;
function drawMacroPieChart(fat, carbs, protein) {
    const ctx = document.getElementById('macroPieChart').getContext('2d');
    if (pieChartInstance) {
        pieChartInstance.destroy();
    }
    pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Fat', 'Carbohydrate', 'Protein'],
            datasets: [{
                data: [fat, carbs, protein],
                backgroundColor: ['#e57373', '#ffb74d', '#4db6ac'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Hieen thi Micronutrient
let micronutrientList = document.getElementById("micronutrientList");

function renderMicronutrients() {
    let textMicronutrientList = "";
    let totalSodium = 0, totalVitaminA = 0, totalVitaminB6 = 0, totalVitaminB12 = 0, totalVitaminC = 0, totalVitaminD_D2_D3 = 0,
        totalVitaminE = 0, totalVitaminK = 0, totalSugars = 0, totalCalcium = 0, totalIron = 0, totalMagnesium = 0, totalPhosphorus = 0,
        totalPotassium = 0, totalZinc = 0, totalCopper = 0, totalFluoride = 0, totalManganese = 0, totalSelenium = 0, totalThiamin = 0,
        totalRiboflavin = 0, totalNiacin = 0, totalPantothenicAcid = 0, totalFolateTotal = 0;

    selectedIngredients.forEach(item => {
        const main = item.food.micronutrients || {};
        totalSodium += Number(main.sodium || 0);
        totalVitaminA += Number(main.vitamin_a || 0);
        totalVitaminB6 += Number(main.vitamin_b_6 || 0);
        totalVitaminB12 += Number(main.vitamin_b_12 || 0);
        totalVitaminC += Number(main.vitamin_c || 0);
        totalVitaminD_D2_D3 += Number(main.vitamin_d_d2__d3 || 0);
        totalVitaminE += Number(main.vitamin_e || 0);
        totalVitaminK += Number(main.vitamin_k || 0);
        totalSugars += Number(main.sugars || 0);
        totalCalcium += Number(main.calcium || 0);
        totalIron += Number(main.iron || 0);
        totalMagnesium += Number(main.magnesium || 0);
        totalPhosphorus += Number(main.phosphorus || 0);
        totalPotassium += Number(main.potassium || 0);
        totalZinc += Number(main.zinc || 0);
        totalCopper += Number(main.copper || 0);
        totalFluoride += Number(main.fluoride || 0);
        totalManganese += Number(main.manganese || 0);
        totalSelenium += Number(main.selenium || 0);
        totalThiamin += Number(main.thiamin || 0);
        totalRiboflavin += Number(main.riboflavin || 0);
        totalNiacin += Number(main.niacin || 0);
        totalPantothenicAcid += Number(main.pantothenic_acid || 0);
        totalFolateTotal += Number(main.folate_total || 0);
    });

    textMicronutrientList = `
        <tr><td>Sodium</td><td>${totalSodium} mg</td></tr>
        <tr><td>Vitamin A</td><td>${totalVitaminA} µg</td></tr>
        <tr><td>Vitamin B6</td><td>${totalVitaminB6} mg</td></tr>
        <tr><td>Vitamin B12</td><td>${totalVitaminB12} µg</td></tr>
        <tr><td>Vitamin C</td><td>${totalVitaminC} mg</td></tr>
        <tr><td>Vitamin D (D2+D3)</td><td>${totalVitaminD_D2_D3} µg</td></tr>
        <tr><td>Vitamin E</td><td>${totalVitaminE} mg</td></tr>
        <tr><td>Vitamin K</td><td>${totalVitaminK} µg</td></tr>
        <tr><td>Sugars</td><td>${totalSugars} g</td></tr>
        <tr><td>Calcium</td><td>${totalCalcium} mg</td></tr>
        <tr><td>Iron</td><td>${totalIron} mg</td></tr>
        <tr><td>Magnesium</td><td>${totalMagnesium} mg</td></tr>
        <tr><td>Phosphorus</td><td>${totalPhosphorus} mg</td></tr>
        <tr><td>Potassium</td><td>${totalPotassium} mg</td></tr>
        <tr><td>Zinc</td><td>${totalZinc} mg</td></tr>
        <tr><td>Copper</td><td>${totalCopper} mg</td></tr>
        <tr><td>Fluoride</td><td>${totalFluoride} mg</td></tr>
        <tr><td>Manganese</td><td>${totalManganese} mg</td></tr>
        <tr><td>Selenium</td><td>${totalSelenium} µg</td></tr>
        <tr><td>Thiamin</td><td>${totalThiamin} mg</td></tr>
        <tr><td>Riboflavin</td><td>${totalRiboflavin} mg</td></tr>
        <tr><td>Niacin</td><td>${totalNiacin} mg</td></tr>
        <tr><td>Pantothenic Acid</td><td>${totalPantothenicAcid} mg</td></tr>
        <tr><td>Folate Total</td><td>${totalFolateTotal} µg</td></tr>
    `;

    micronutrientList.innerHTML = textMicronutrientList;
}

renderMicronutrients();
renderPaginatedFoods();

