let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "/login.html";
}
document.querySelector(".user-name").textContent = `Xin chào, ${currentUser.username}`;

// tempRecipe
let tempRecipe = JSON.parse(localStorage.getItem("tempRecipe"));
if (!tempRecipe) {
    window.location.href = "/page/my-recipes.html";
}

// foods
let allFoods = JSON.parse(localStorage.getItem("foods")) || [];

// Các biến dữ liệu
let selectedIngredients = tempRecipe.ingredients || [];
let cookingSteps = tempRecipe.cookingMethods || [];
let currentPage = 1;
let itemsPerPage = 4;
let currentSortKey = "";
let isSortAsc = false;


let uploadImage = document.getElementById('uploadImage');
let ingredientList = document.getElementById("ingredientList");
let paginationContainer = document.querySelector(".pagination");
let selectedIngredientsDiv = document.getElementById("selectedIngredients");
let cookingMethodsList = document.getElementById("cookingMethodsList");
let ingredientSearch = document.getElementById("ingredientSearch");
let sortSelect = document.getElementById("sortSelect");
let micronutrientList = document.getElementById("micronutrientList");

// Nạp dữ liệu vào form
document.getElementById("recipeNameInput").value = tempRecipe.name || "";
document.getElementById("recipeDescriptionInput").value = tempRecipe.description || "";
document.getElementById("finalWeightInput").value = tempRecipe.finalWeight || "";
document.getElementById("portionsInput").value = tempRecipe.portions || "";
document.getElementById("uploadImage").src = tempRecipe.coverSrc || "/assets/images/img-avata-food/default-avata.png";

if (tempRecipe.totalTime) {
    const [h, m] = tempRecipe.totalTime.split(":");
    document.getElementById("totalHour").value = parseInt(h);
    document.getElementById("totalMinute").value = parseInt(m);
}
if (tempRecipe.preparationTime) {
    const [h, m] = tempRecipe.preparationTime.split(":");
    document.getElementById("prepHour").value = parseInt(h);
    document.getElementById("prepMinute").value = parseInt(m);
}

// Nạp categories đã chọn
if (tempRecipe.category) {
    const selectedNames = tempRecipe.category.map(c => c.name);
    document.querySelectorAll(".category-checkbox").forEach(cb => {
        if (selectedNames.includes(cb.value)) {
            cb.checked = true;
        }
    });
}

// ==== Upload ảnh mới nếu đổi ====
let uploadBox = document.getElementById('uploadBox');
let uploadInput = document.getElementById('uploadInput');

uploadBox.addEventListener('click', () => {
    uploadInput.click();
});

uploadInput.addEventListener('change', (event) => {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            uploadImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// ==== Render Ingredients được chọn ====
function renderSelectedIngredients() {
    selectedIngredientsDiv.innerHTML = selectedIngredients.map(ingredient => `
        <div class="ingredient-block">
            <p>1 portion of ${ingredient.food.name}</p>
            <button class="btn-trash" onclick="deleteIngredients(${ingredient.food.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join("");
}

// Xóa nguyên liệu
function deleteIngredients(foodId) {
    selectedIngredients = selectedIngredients.filter(item => item.food.id !== foodId);
    renderSelectedIngredients();
    updateGlobalAnalysis();
    renderMicronutrients();
}

// ==== Render Ingredients để chọn thêm ====
function getFilteredFoods() {
    let keyword = ingredientSearch.value.toLowerCase().trim();
    let filtered = allFoods.filter(food => food.name.toLowerCase().includes(keyword));
    if (currentSortKey) {
        filtered.sort((a, b) => {
            const aVal = a.macronutrients?.[currentSortKey.toLowerCase()] ?? 0;
            const bVal = b.macronutrients?.[currentSortKey.toLowerCase()] ?? 0;
            return isSortAsc ? aVal - bVal : bVal - aVal;
        });
    }
    return filtered;
}

function renderIngredientList(arr) {
    ingredientList.innerHTML = arr.map(food => `
        <tr>
            <td>
                <p>${food.name}</p>
                <small>Community Recipes</small>
                <div class="portion-input"><input type="number" value="1"> portion (87 grams)</div>
            </td>
            <td>${food.macronutrients?.energy ?? "-"} kcal</td>
            <td>${food.macronutrients?.fat ?? "-"} g</td>
            <td>${food.macronutrients?.carbohydrate ?? "-"} g</td>
            <td>${food.macronutrients?.protein ?? "-"} g</td>
            <td><button class="btn-add" onclick="addIngredients(${food.id})"><i class="fas fa-plus"></i></button></td>
        </tr>
    `).join("");
}

function renderPagination(filtered) {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("page-btn");
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
    renderIngredientList(filtered.slice(start, end));
    renderPagination(filtered);
}

ingredientSearch.addEventListener("input", () => {
    currentPage = 1;
    renderPaginatedFoods();
});

sortSelect.addEventListener("change", () => {
    currentSortKey = sortSelect.value;
    renderPaginatedFoods();
});

// ==== Add Ingredient mới ====
function addIngredients(foodId) {
    const food = allFoods.find(f => f.id === foodId);
    if (food) {
        selectedIngredients.push({ food: food, equivalents: [] });
        renderSelectedIngredients();
        updateGlobalAnalysis();
        renderMicronutrients();
    }
}

// ==== Cooking Steps ====
function renderCookingMethods() {
    cookingMethodsList.innerHTML = cookingSteps.map((step, idx) => `
        <div class="cooking-step">
            <input type="text" value="${step.content}" onchange="updateCookingStep(${idx}, this.value)">
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

document.getElementById("addCookingStepBtn").addEventListener("click", () => {
    cookingSteps.push({ id: Date.now(), content: "" });
    renderCookingMethods();
});

// ==== Cập nhật Global Analysis và Pie Chart ====
function updateGlobalAnalysis() {
    let totalFat = 0, totalCarbs = 0, totalProtein = 0, totalFiber = 0;
    selectedIngredients.forEach(item => {
        const mainMa = item.food.macronutrients || {};
        const mainMi = item.food.micronutrients || {};
        totalFat += Number(mainMa.fat || 0);
        totalCarbs += Number(mainMa.carbohydrate || 0);
        totalProtein += Number(mainMa.protein || 0);
        totalFiber += Number(mainMi.fiber || 0);
    });

    document.getElementById("fatValue").textContent = `${totalFat.toFixed(1)}g`;
    document.getElementById("carbValue").textContent = `${totalCarbs.toFixed(1)}g`;
    document.getElementById("proteinValue").textContent = `${totalProtein.toFixed(1)}g`;
    document.getElementById("fiberValue").textContent = `${totalFiber.toFixed(1)}g`;

    drawMacroPieChart(totalFat, totalCarbs, totalProtein);
}

let pieChartInstance = null;
function drawMacroPieChart(fat, carbs, protein) {
    const ctx = document.getElementById('macroPieChart').getContext('2d');
    if (pieChartInstance) pieChartInstance.destroy();
    pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Fat', 'Carbohydrate', 'Protein'],
            datasets: [{
                data: [fat, carbs, protein],
                backgroundColor: ['#e57373', '#ffb74d', '#4db6ac'],
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

// Micronutrient Table
function renderMicronutrients() {
    let textMicronutrientList = "";
    let totalSodium = 0, totalVitaminA = 0, totalVitaminB6 = 0, totalVitaminB12 = 0, totalVitaminC = 0, totalVitaminD_D2_D3 = 0,
        totalVitaminE = 0, totalVitaminK = 0, totalSugars = 0, totalCalcium = 0, totalIron = 0, totalMagnesium = 0, totalPhosphorus = 0,
        totalPotassium = 0, totalZinc = 0, totalCopper = 0, totalFluoride = 0, totalManganese = 0, totalSelenium = 0, totalThiamin = 0,
        totalRiboflavin = 0, totalNiacin = 0, totalPantothenicAcid = 0, totalFolateTotal = 0;

    tempRecipe.ingredients.forEach(item => {
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

// ==== Publish Recipe (Update lại localStorage) ====
document.getElementById("publishRecipeBtn").addEventListener("click", () => {
    const recipes = JSON.parse(localStorage.getItem("recipes")) || [];

    const updatedRecipe = {
        ...tempRecipe,
        coverSrc: uploadImage.src,
        name: document.getElementById("recipeNameInput").value.trim(),
        description: document.getElementById("recipeDescriptionInput").value.trim(),
        totalTime: `${String(document.getElementById("totalHour").value).padStart(2, '0')}:${String(document.getElementById("totalMinute").value).padStart(2, '0')}`,
        preparationTime: `${String(document.getElementById("prepHour").value).padStart(2, '0')}:${String(document.getElementById("prepMinute").value).padStart(2, '0')}`,
        finalWeight: document.getElementById("finalWeightInput").value.trim(),
        portions: document.getElementById("portionsInput").value.trim(),
        ingredients: selectedIngredients,
        cookingMethods: cookingSteps,
        category: [...document.querySelectorAll(".category-checkbox:checked")].map(c => ({ id: Date.now() + Math.random(), name: c.value })),
    };

    const index = recipes.findIndex(r => r.id === tempRecipe.id);
    if (index !== -1) {
        recipes[index] = updatedRecipe;
        localStorage.setItem("recipes", JSON.stringify(recipes));
        Toastify({
            text: "✔️ Công thức đã được cập nhật!",
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "#4caf50",
        }).showToast();
        setTimeout(() => {
            window.location.href = "/page/my-recipes.html";
        }, 1500);
    }
});

renderSelectedIngredients();
renderCookingMethods();
updateGlobalAnalysis();
renderMicronutrients();
renderPaginatedFoods();
