document.addEventListener('DOMContentLoaded', function () {
    const foodList = document.getElementById('food-list');
    const categoryFilter = document.getElementById('category-filter');
    const preferenceFilter = document.getElementById('preference-filter');
    const searchInput = document.getElementById('search');
    const likeCount = document.getElementById('like-count');
    const neutralCount = document.getElementById('neutral-count');
    const dislikeCount = document.getElementById('dislike-count');
    const resetBtn = document.getElementById('reset-btn');

    let foods = [];
    let categories = new Set();

    // Carica i dati dal file JSON
    fetch('alimenti.json')
        .then(response => response.json())
        .then(data => {
            foods = data;
            // Carica le preferenze salvate nel localStorage
            loadPreferences();
            // Estrai le categorie uniche
            extractCategories();
            // Popola il filtro delle categorie
            populateCategoryFilter();
            // Mostra tutti gli alimenti inizialmente
            displayFoods(foods);
            // Aggiorna i contatori
            updateCounters();
        })
        .catch(error => console.error('Errore nel caricamento dei dati:', error));

    // Estrai le categorie uniche dagli alimenti
    function extractCategories() {
        foods.forEach(food => {
            categories.add(food.categoria);
        });
    }

    // Popola il dropdown delle categorie
    function populateCategoryFilter() {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // Carica le preferenze dal localStorage
    function loadPreferences() {
        const savedPreferences = localStorage.getItem('foodPreferences');
        if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            foods.forEach(food => {
                if (preferences[food.id] !== undefined) {
                    food.mangio = preferences[food.id];
                }
            });
        }
    }

    // Salva le preferenze nel localStorage
    function savePreferences() {
        const preferences = {};
        foods.forEach(food => {
            if (food.mangio !== null) {
                preferences[food.id] = food.mangio;
            }
        });
        localStorage.setItem('foodPreferences', JSON.stringify(preferences));
        updateCounters();
    }

    // Aggiorna i contatori delle preferenze
    function updateCounters() {
        let like = 0, neutral = 0, dislike = 0, unset = 0;

        foods.forEach(food => {
            if (food.mangio === 'like') like++;
            else if (food.mangio === 'neutral') neutral++;
            else if (food.mangio === 'dislike') dislike++;
            else unset++;
        });

        likeCount.textContent = like;
        neutralCount.textContent = neutral;
        dislikeCount.textContent = dislike;
        if (document.getElementById('unset-count')) {
            document.getElementById('unset-count').textContent = unset;
        }
    }

    // Mostra gli alimenti in base ai filtri
    function displayFoods(foodsToDisplay) {
        foodList.innerHTML = '';

        if (foodsToDisplay.length === 0) {
            foodList.innerHTML = '<p class="no-results">Nessun alimento trovato con i filtri selezionati.</p>';
            return;
        }

        foodsToDisplay.forEach((food, index) => {
            const foodItem = document.createElement('div');
            foodItem.className = 'food-item';

            const foodName = document.createElement('div');
            foodName.className = 'food-name';
            foodName.textContent = food.nome;

            const foodCategory = document.createElement('div');
            foodCategory.className = 'food-category';
            foodCategory.textContent = food.categoria;

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'preference-buttons';

            const likeBtn = document.createElement('button');
            likeBtn.className = `preference-btn like-btn ${food.mangio === 'like' ? 'selected-like' : ''}`;
            likeBtn.innerHTML = '<i class="fas fa-heart"></i> Mi piace';
            likeBtn.addEventListener('click', (e) => setPreference(food, 'like', e));

            const neutralBtn = document.createElement('button');
            neutralBtn.className = `preference-btn neutral-btn ${food.mangio === 'neutral' ? 'selected-neutral' : ''}`;
            neutralBtn.innerHTML = '<i class="fas fa-meh"></i> Mangio';
            neutralBtn.addEventListener('click', (e) => setPreference(food, 'neutral', e));

            const dislikeBtn = document.createElement('button');
            dislikeBtn.className = `preference-btn dislike-btn ${food.mangio === 'dislike' ? 'selected-dislike' : ''}`;
            dislikeBtn.innerHTML = '<i class="fas fa-times-circle"></i> Non mangio';
            dislikeBtn.addEventListener('click', (e) => setPreference(food, 'dislike', e));

            buttonsDiv.appendChild(likeBtn);
            buttonsDiv.appendChild(neutralBtn);
            buttonsDiv.appendChild(dislikeBtn);

            foodItem.appendChild(foodName);
            foodItem.appendChild(foodCategory);
            foodItem.appendChild(buttonsDiv);

            foodList.appendChild(foodItem);
        });
    }

    // Imposta la preferenza per un alimento
    function setPreference(food, preference, event) {
        event.preventDefault(); // Aggiungi questa linea
        food.mangio = food.mangio === preference ? null : preference;
        savePreferences();
        applyFilters();
    }

    // Applica i filtri
    function applyFilters() {
        const selectedCategory = categoryFilter.value;
        const selectedPreference = preferenceFilter.value;
        const searchTerm = searchInput.value.toLowerCase();

        let filteredFoods = foods;

        // Filtra per categoria
        if (selectedCategory !== 'all') {
            filteredFoods = filteredFoods.filter(food => food.categoria === selectedCategory);
        }

        // Filtra per preferenza
        if (selectedPreference !== 'all') {
            if (selectedPreference === 'unset') {
                filteredFoods = filteredFoods.filter(food => food.mangio === null || food.mangio === undefined);
            } else {
                filteredFoods = filteredFoods.filter(food => food.mangio === selectedPreference);
            }
        }

        // Filtra per ricerca
        if (searchTerm) {
            filteredFoods = filteredFoods.filter(food =>
                food.nome.toLowerCase().includes(searchTerm)
            );
        }

        displayFoods(filteredFoods);
    }

    // Resetta tutte le preferenze
    function resetPreferences() {
        if (confirm('Sei sicuro di voler resettare tutte le tue preferenze?')) {
            foods.forEach(food => {
                food.mangio = null;
            });
            savePreferences();
            applyFilters();
        }
    }

    // Aggiungi event listeners per i filtri
    categoryFilter.addEventListener('change', applyFilters);
    preferenceFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    resetBtn.addEventListener('click', resetPreferences);
});