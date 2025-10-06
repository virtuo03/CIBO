document.addEventListener('DOMContentLoaded', function () {
    const foodList = document.getElementById('food-list');
    const categoryFilter = document.getElementById('category-filter');
    const preferenceFilter = document.getElementById('preference-filter');
    const searchInput = document.getElementById('search');
    const likeCount = document.getElementById('like-count');
    const neutralCount = document.getElementById('neutral-count');
    const dislikeCount = document.getElementById('dislike-count');
    const unsetCount = document.getElementById('unset-count');
    const resetBtn = document.getElementById('reset-btn');
    const shareBtn = document.getElementById('share-btn'); // Nuovo
    const backToTopBtn = document.getElementById('back-to-top-btn'); // Nuovo

    let foods = [];
    let categories = new Set();
    let preferenceCounts = { like: 0, neutral: 0, dislike: 0, unset: 0 }; // Nuovo per il conteggio

    // Carica i dati dal file JSON (sostituisci con il tuo percorso JSON reale)
    fetch('alimenti.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            foods = data;
            // Aggiunge un ID e la preferenza di default (null) se non esiste
            foods = foods.map((food, index) => ({
                id: food.id || index, // Assicurati che ogni alimento abbia un ID
                nome: food.nome,
                categoria: food.categoria,
                mangio: null // Inizializza la preferenza
            }));

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
        // Ordina le categorie alfabeticamente prima di popolarle
        const sortedCategories = Array.from(categories).sort();
        sortedCategories.forEach(category => {
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
                const foodPreference = preferences[food.id];
                if (foodPreference !== undefined) {
                    food.mangio = foodPreference;
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

        preferenceCounts = { like, neutral, dislike, unset }; // Salva per la funzione di condivisione

        likeCount.textContent = like;
        neutralCount.textContent = neutral;
        dislikeCount.textContent = dislike;
        unsetCount.textContent = unset;
    }

    // Mostra gli alimenti in base ai filtri
    function displayFoods(foodsToDisplay) {
        foodList.innerHTML = '';

        if (foodsToDisplay.length === 0) {
            foodList.innerHTML = '<p class="no-results">Nessun alimento trovato con i filtri selezionati.</p>';
            return;
        }

        foodsToDisplay.forEach((food) => {
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
            likeBtn.addEventListener('click', (e) => setPreference(food, 'like', e, likeBtn, neutralBtn, dislikeBtn));

            const neutralBtn = document.createElement('button');
            neutralBtn.className = `preference-btn neutral-btn ${food.mangio === 'neutral' ? 'selected-neutral' : ''}`;
            neutralBtn.innerHTML = '<i class="fas fa-meh"></i> Mangio';
            neutralBtn.addEventListener('click', (e) => setPreference(food, 'neutral', e, likeBtn, neutralBtn, dislikeBtn));

            const dislikeBtn = document.createElement('button');
            dislikeBtn.className = `preference-btn dislike-btn ${food.mangio === 'dislike' ? 'selected-dislike' : ''}`;
            dislikeBtn.innerHTML = '<i class="fas fa-times-circle"></i> Non mangio';
            dislikeBtn.addEventListener('click', (e) => setPreference(food, 'dislike', e, likeBtn, neutralBtn, dislikeBtn));

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
    function setPreference(food, preference, event, likeBtn, neutralBtn, dislikeBtn) {
        event.preventDefault();

        // Determina la nuova preferenza
        const newPreference = food.mangio === preference ? null : preference;
        food.mangio = newPreference;

        // Rimuove la selezione da tutti i pulsanti
        likeBtn.classList.remove('selected-like');
        neutralBtn.classList.remove('selected-neutral');
        dislikeBtn.classList.remove('selected-dislike');

        // Aggiunge la selezione al pulsante corretto se la preferenza è stata impostata
        if (newPreference === 'like') {
            likeBtn.classList.add('selected-like');
        } else if (newPreference === 'neutral') {
            neutralBtn.classList.add('selected-neutral');
        } else if (newPreference === 'dislike') {
            dislikeBtn.classList.add('selected-dislike');
        }

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
        if (confirm('Sei sicuro di voler resettare tutte le tue preferenze? Questa azione è irreversibile.')) {
            foods.forEach(food => {
                food.mangio = null;
            });
            savePreferences();
            applyFilters();
            alert('Preferenze resettate con successo!');
        }
    }

    // Funzione di condivisione del riepilogo
    function shareSummary() {
        const totalFoods = foods.length;
        const classifiedFoods = totalFoods - preferenceCounts.unset;
        const summaryText = `Ecco le mie preferenze alimentari! 🍽️\n\n` +
                            `Totale alimenti classificati: ${classifiedFoods} su ${totalFoods}\n` +
                            `❤️ Mi piacciono: ${preferenceCounts.like}\n` +
                            `😐 Mangio: ${preferenceCounts.neutral}\n` +
                            `❌ Non mangio: ${preferenceCounts.dislike}\n` +
                            `❓ Da classificare: ${preferenceCounts.unset}\n\n` +
                            `Crea le tue su cosamangi.netlify.app`; // Sostituisci con il link reale

        // Usa l'API di Condivisione Web se disponibile
        if (navigator.share) {
            navigator.share({
                title: 'Le mie Preferenze Alimentari',
                text: summaryText,
            }).catch(error => console.error('Errore nella condivisione:', error));
        } else {
            // Fallback per browser che non supportano l'API di Condivisione Web: copia negli appunti
            navigator.clipboard.writeText(summaryText).then(() => {
                alert('Riepilogo copiato negli appunti! Ora puoi incollarlo per condividerlo con i tuoi amici. 🎉');
            }).catch(err => {
                console.error('Errore nella copia negli appunti:', err);
                alert('Impossibile copiare il riepilogo. Controlla la console per i dettagli.');
            });
        }
    }

    // Logica per il pulsante "Torna su"
    window.onscroll = function() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    };

    function topFunction() {
        document.body.scrollTop = 0; // Per Safari
        document.documentElement.scrollTop = 0; // Per Chrome, Firefox, IE e Opera
    }

    // Aggiungi event listeners
    categoryFilter.addEventListener('change', applyFilters);
    preferenceFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    resetBtn.addEventListener('click', resetPreferences);
    shareBtn.addEventListener('click', shareSummary); // Listener per il pulsante Condividi
    backToTopBtn.addEventListener('click', topFunction); // Listener per il pulsante Torna su
});