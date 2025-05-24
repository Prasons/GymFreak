// src/Pages/NutritionSearch.jsx
import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaUtensils,
  FaFire,
  FaWeight,
  FaCarrot,
  FaBookmark,
  FaRegBookmark,
  FaTrash,
  FaTimes
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

// Edamam API credentials
const APP_ID = 'b9116576'; // Replace with your actual app ID
const APP_KEY = '36766bd231afa29a5262aa7695a4bc96'; // Replace with your actual app key

// Helper function to format date
const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const NutritionSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedFoods, setSavedFoods] = useState([]);
  const [activeTab, setActiveTab] = useState("search");

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentNutritionSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    const savedFoodsData = localStorage.getItem("savedFoods");
    if (savedFoodsData) {
      setSavedFoods(JSON.parse(savedFoodsData));
    }
  }, []);

  // Helper function to normalize nutrient data
  const normalizeNutrient = (nutrient, defaultUnit = '') => {
    // Handle null/undefined
    if (nutrient === null || nutrient === undefined) {
      return { quantity: 0, unit: defaultUnit };
    }
    
    // If it's already in the correct format with quantity
    if (typeof nutrient === 'object' && 'quantity' in nutrient) {
      return {
        quantity: Number(nutrient.quantity) || 0,
        unit: nutrient.unit || defaultUnit
      };
    }
    
    // If it's an object with a value property (common in some API formats)
    if (typeof nutrient === 'object' && 'value' in nutrient) {
      return {
        quantity: Number(nutrient.value) || 0,
        unit: nutrient.unit || defaultUnit
      };
    }
    
    // If it's an object with an amount property (common in some API formats)
    if (typeof nutrient === 'object' && 'amount' in nutrient) {
      return {
        quantity: Number(nutrient.amount) || 0,
        unit: nutrient.unit || defaultUnit
      };
    }
    
    // If it's a number or string that can be converted to a number
    const numericValue = Number(nutrient);
    if (!isNaN(numericValue)) {
      return { 
        quantity: numericValue, 
        unit: defaultUnit 
      };
    }
    
    // If it's a string with a number and unit (e.g., "10g")
    const match = String(nutrient).match(/([\d.]+)\s*(\w*)/);
    if (match) {
      return {
        quantity: parseFloat(match[1]) || 0,
        unit: match[2] || defaultUnit
      };
    }
    
    // Default fallback
    console.warn('Could not normalize nutrient:', nutrient);
    return { quantity: 0, unit: defaultUnit };
  };

  const searchFood = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Using Edamam Nutrition API with a more specific query format
      const apiUrl = `https://api.edamam.com/api/nutrition-data?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodeURIComponent(
        `100g ${searchQuery}`
      )}`;
      
      console.log('Making API request to:', apiUrl);
      
      const response = await axios.get(apiUrl);
      console.log('API Response:', response.data);

      if (response.data) {
        // Extract nutrients from the response
        let nutrients = response.data.totalNutrients || {};
        
        // If we have ingredients with parsed data (v2 format)
        if (response.data.ingredients?.[0]?.parsed?.[0]?.food?.nutrients) {
          Object.assign(nutrients, response.data.ingredients[0].parsed[0].food.nutrients);
        }
        
        // If we're getting a 200 but no nutrients, try the analysis data
        if (Object.keys(nutrients).length === 0 && response.data.ingredients?.[0]?.parsed?.[0]?.nutrients) {
          nutrients = response.data.ingredients[0].parsed[0].nutrients;
        }
        
        // Debug log the raw nutrients
        console.log('Raw nutrients:', nutrients);
        
        // Create a normalized nutrients object with fallbacks
        const normalizedNutrients = {
          // Macronutrients
          PROCNT: normalizeNutrient(nutrients.PROCNT || nutrients.protein, 'g'),
          CHOCDF: normalizeNutrient(nutrients.CHOCDF || nutrients.carbs || nutrients.carbohydrates, 'g'),
          FAT: normalizeNutrient(nutrients.FAT || nutrients.fat, 'g'),
          FIBTG: normalizeNutrient(nutrients.FIBTG || nutrients.fiber, 'g'),
          SUGAR: normalizeNutrient(nutrients.SUGAR || nutrients.sugar, 'g'),
          
          // Vitamins
          VITA_RAE: normalizeNutrient(nutrients.VITA_RAE || nutrients.VIT_RAE || nutrients.vitaminA, 'mcg'),
          VITC: normalizeNutrient(nutrients.VITC || nutrients.vitaminC, 'mg'),
          VITD: normalizeNutrient(nutrients.VITD || nutrients.vitaminD, 'mcg'),
          TOCPHA: normalizeNutrient(nutrients.TOCPHA || nutrients.vitaminE, 'mg'),
          
          // Minerals
          CA: normalizeNutrient(nutrients.CA || nutrients.calcium, 'mg'),
          FE: normalizeNutrient(nutrients.FE || nutrients.iron, 'mg'),
          K: normalizeNutrient(nutrients.K || nutrients.potassium, 'mg'),
          NA: normalizeNutrient(nutrients.NA || nutrients.sodium, 'mg'),
          
          // Include all other nutrients as-is
          ...nutrients
        };
        
        // Calculate calories if not provided
        const calculatedCalories = response.data.calories || 
          (normalizedNutrients.PROCNT.quantity * 4 + 
           normalizedNutrients.CHOCDF.quantity * 4 + 
           normalizedNutrients.FAT.quantity * 9);
        
        const foodData = {
          ...response.data,
          calories: calculatedCalories,
          totalWeight: response.data.totalWeight || 100, // Default to 100g if not specified
          dietLabels: response.data.dietLabels || [],
          healthLabels: response.data.healthLabels || [],
          totalNutrients: nutrients,
          totalDaily: response.data.totalDaily || {},
          query: searchQuery,
          timestamp: new Date().toISOString(),
          nutrients: normalizedNutrients
        };
        
        console.log('Processed food data:', foodData);
        
        // If we still don't have any nutrient data, show an error
        if (Object.keys(nutrients).length === 0) {
          throw new Error('No nutritional data available for this food item. Please try a different search term.');
        }
        
        setSelectedFood(foodData);
        addToRecentSearches(searchQuery);
      } else {
        setError('No data received from the API. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching nutrition data:', err);
      let errorMessage = 'Failed to fetch nutrition data. Please try again.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        console.error('Error response data:', err.response.data);
        console.error('Error status:', err.response.status);
        errorMessage = `Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        errorMessage = "No response from the server. Please check your connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setSelectedFood(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFood = (food) => {
    if (!food) return;

    const foodToSave = {
      ...food,
      savedAt: new Date().toISOString(),
      id: Date.now().toString(),
    };

    const updatedSavedFoods = [foodToSave, ...savedFoods];
    setSavedFoods(updatedSavedFoods);
    localStorage.setItem("savedFoods", JSON.stringify(updatedSavedFoods));
    toast.success("Food saved to your collection!");
  };

  const isFoodSaved = (food) => {
    if (!food) return false;
    // First check by ID if available
    if (food.id) {
      return savedFoods.some(item => item.id === food.id);
    }
    // Fall back to checking by query if no ID
    if (food.query) {
      return savedFoods.some(
        item => item.query?.toLowerCase() === food.query?.toLowerCase()
      );
    }
    return false;
  };

  const handleRemoveSavedFood = (foodId) => {
    const updatedSavedFoods = savedFoods.filter((food) => food.id !== foodId);
    setSavedFoods(updatedSavedFoods);
    localStorage.setItem("savedFoods", JSON.stringify(updatedSavedFoods));
    toast.info("Food removed from your collection");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null); // Clear any previous errors
    await searchFood(query);
  };

  const addToRecentSearches = (searchQuery) => {
    setRecentSearches(prevSearches => {
      // Remove duplicate searches and keep only the 5 most recent
      const newSearches = [
        { query: searchQuery, timestamp: new Date().toISOString() },
        ...prevSearches.filter(item => 
          item.query.toLowerCase() !== searchQuery.toLowerCase()
        )
      ].slice(0, 5);
      
      // Save to localStorage
      localStorage.setItem('recentNutritionSearches', JSON.stringify(newSearches));
      return newSearches;
    });
  };

  const handleRemoveRecentSearch = (index, e) => {
    e.stopPropagation(); // Prevent triggering the search when clicking remove
    const newSearches = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(newSearches);
    localStorage.setItem('recentNutritionSearches', JSON.stringify(newSearches));
    toast.info('Search removed from history');
  };

  const handleRecentSearch = (searchQuery) => {
    setQuery(searchQuery);
    searchFood(searchQuery);
  };

  const formatNutrient = (value, unit = "g") => {
    if (value === null || value === undefined || value === '') return "N/A";
    
    // If it's already a string, return as is (might be already formatted)
    if (typeof value === 'string') return value;
    
    // Handle both direct values and nutrient objects with quantity/unit
    const quantity = typeof value === 'object' && value !== null ? 
      (value.quantity || value.amount || 0) : 
      (typeof value === 'number' ? value : 0);
      
    const finalUnit = typeof value === 'object' && value !== null ? 
      (value.unit || unit) : 
      unit;
    
    // Round to 1 decimal place if needed
    const roundedValue = Math.round(quantity * 10) / 10;
    
    // Remove decimal if it's .0
    const displayValue = roundedValue % 1 === 0 ? 
      Math.round(roundedValue) : 
      roundedValue;
    
    return `${displayValue}${finalUnit}`;
  };

  // Tabs component
  const renderTabs = () => (
    <div className="flex border-b border-gray-700 mb-6">
      <button
        onClick={() => setActiveTab("search")}
        className={`px-6 py-3 font-medium ${
          activeTab === "search"
            ? "text-blue-400 border-b-2 border-blue-400"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Search Food
      </button>
      <button
        onClick={() => setActiveTab("saved")}
        className={`px-6 py-3 font-medium flex items-center gap-2 ${
          activeTab === "saved"
            ? "text-blue-400 border-b-2 border-blue-400"
            : "text-gray-400 hover:text-white"
        }`}
      >
        <FaBookmark className="text-yellow-400" />
        Saved Foods ({savedFoods.length})
      </button>
    </div>
  );

  // Render saved foods list
  const renderSavedFoods = () => (
    <div className="space-y-4">
      {savedFoods.length === 0 ? (
        <div className="text-center py-12">
          <FaBookmark className="mx-auto text-5xl text-gray-600 mb-4" />
          <h3 className="text-xl font-medium mb-2">No saved foods yet</h3>
          <p className="text-gray-400">
            Search for foods and save them to see them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedFoods.map((food) => (
            <div
              key={food.id}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700/80 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold capitalize">
                  {food.query}
                </h3>
                <button
                  onClick={() => handleRemoveSavedFood(food.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  title="Remove from saved"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Saved {formatDate(food.savedAt)}</span>
                <span>{Math.round(food.calories)} cal</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="text-green-400">
                  P: {formatNutrient(food.totalNutrients?.PROCNT?.quantity)}
                </div>
                <div className="text-yellow-400">
                  C: {formatNutrient(food.totalNutrients?.CHOCDF?.quantity)}
                </div>
                <div className="text-red-400">
                  F: {formatNutrient(food.totalNutrients?.FAT?.quantity)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render search interface
  const renderSearchInterface = () => (
    <>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-3">
          Nutrition Search
        </h1>
        <p className="text-gray-400">
          Search for any food to view its detailed nutritional information
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search for a food (e.g., 'apple', 'chicken breast', 'rice')"
            autoFocus
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Recent Searches */}
      {recentSearches.length > 0 && activeTab === "search" && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-300">
            Recent Searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item, index) => (
              <div key={index} className="relative group">
                <button
                  onClick={() => handleRecentSearch(item.query)}
                  className="pl-3 pr-8 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm transition-colors flex items-center"
                >
                  {item.query}
                </button>
                <button
                  onClick={(e) => handleRemoveRecentSearch(index, e)}
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from history"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Format a number to a fixed number of decimal places if needed
  const formatNumber = (num, decimals = 1) => {
    if (num === undefined || num === null) return '0';
    const numValue = typeof num === 'object' ? num.quantity || 0 : Number(num) || 0;
    return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(decimals);
  };
  
  // Get color intensity based on nutrient value
  const getNutrientColor = (value, highThreshold = 10, inverse = false) => {
    if (value === 0) return 'text-gray-500';
    if (inverse) {
      return value > highThreshold ? 'text-red-400 font-medium' : 'text-green-400';
    }
    return value > highThreshold ? 'text-green-400 font-medium' : 'text-gray-300';
  };

  // Render food details
  const renderFoodDetails = () => {
    if (!selectedFood) return null;

    const isSaved = isFoodSaved(selectedFood);
    const nutrients = selectedFood.nutrients || {};
    
    // Helper to get nutrient value with fallback
    const getNutrient = (key, fallback = { quantity: 0 }) => {
      const nutrient = nutrients[key] || fallback;
      return {
        quantity: Number(nutrient.quantity || 0),
        unit: nutrient.unit || fallback.unit || ''
      };
    };
    
    // Get all nutrients with proper fallbacks
    const protein = getNutrient('PROCNT', { quantity: 0, unit: 'g' });
    const carbs = getNutrient('CHOCDF', { quantity: 0, unit: 'g' });
    const fat = getNutrient('FAT', { quantity: 0, unit: 'g' });
    const fiber = getNutrient('FIBTG', { quantity: 0, unit: 'g' });
    const sugar = getNutrient('SUGAR', { quantity: 0, unit: 'g' });
    
    const vitaminA = getNutrient('VITA_RAE', getNutrient('VIT_RAE', { quantity: 0, unit: 'mcg' }));
    const vitaminC = getNutrient('VITC', { quantity: 0, unit: 'mg' });
    const vitaminD = getNutrient('VITD', { quantity: 0, unit: 'mcg' });
    const vitaminE = getNutrient('TOCPHA', { quantity: 0, unit: 'mg' });
    
    const calcium = getNutrient('CA', { quantity: 0, unit: 'mg' });
    const iron = getNutrient('FE', { quantity: 0, unit: 'mg' });
    const potassium = getNutrient('K', { quantity: 0, unit: 'mg' });
    const sodium = getNutrient('NA', { quantity: 0, unit: 'mg' });
    
    // Calculate calories from macros if not provided
    const calories = selectedFood.calories || 
      (protein.quantity * 4 + carbs.quantity * 4 + fat.quantity * 9);

    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-8">
        {/* Food Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-700">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold capitalize">
                {selectedFood.query}
              </h2>
              <button
                onClick={() =>
                  isSaved
                    ? handleRemoveSavedFood(selectedFood.id)
                    : handleSaveFood(selectedFood)
                }
                className={`p-2 rounded-full ${
                  isSaved
                    ? "text-yellow-400 hover:bg-yellow-400/20"
                    : "text-gray-400 hover:bg-gray-700"
                }`}
                title={isSaved ? "Remove from saved" : "Save to collection"}
              >
                {isSaved ? <FaBookmark /> : <FaRegBookmark />}
              </button>
            </div>
            <div className="flex items-center text-yellow-400 mt-1">
              <FaUtensils className="mr-2" />
              <span>Food Details</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 bg-blue-900/30 px-4 py-2 rounded-lg">
            <div className="text-3xl font-bold text-blue-400">
              {Math.round(selectedFood.calories || 0)}{" "}
              <span className="text-sm font-normal text-gray-400">
                calories
              </span>
            </div>
          </div>
        </div>

        {/* Nutrition Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Macronutrients */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <FaFire className="text-red-400 mr-2" />
              <h3 className="text-lg font-semibold">Macronutrients (per 100g)</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                <span className="text-gray-400">Protein</span>
                <span className={`${getNutrientColor(protein.quantity, 10)}`}>
                  {formatNumber(protein.quantity)} {protein.unit}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                <span className="text-gray-400">Carbohydrates</span>
                <span className={getNutrientColor(carbs.quantity, 10)}>
                  {formatNumber(carbs.quantity)} {carbs.unit}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                <span className="text-gray-400">Fats</span>
                <span className={getNutrientColor(fat.quantity, 5)}>
                  {formatNumber(fat.quantity)} {fat.unit}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                <span className="text-gray-400">Fiber</span>
                <span className={getNutrientColor(fiber.quantity, 3)}>
                  {formatNumber(fiber.quantity)} {fiber.unit}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                <span className="text-gray-400">Sugars</span>
                <span className={getNutrientColor(sugar.quantity, 5)}>
                  {formatNumber(sugar.quantity)} {sugar.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Vitamins */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <FaCarrot className="text-green-400 mr-2" />
              <h3 className="text-lg font-semibold">Vitamins</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Vitamin A</span>
                <span className={getNutrientColor(vitaminA.quantity, 5)}>
                  {formatNumber(vitaminA.quantity)} {vitaminA.unit}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Vitamin C</span>
                <span className={getNutrientColor(vitaminC.quantity, 5)}>
                  {formatNumber(vitaminC.quantity)} {vitaminC.unit}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Vitamin D</span>
                <span className={getNutrientColor(vitaminD.quantity, 5)}>
                  {formatNumber(vitaminD.quantity)} {vitaminD.unit}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Vitamin E</span>
                <span className={getNutrientColor(vitaminE.quantity, 5)}>
                  {formatNumber(vitaminE.quantity)} {vitaminE.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Minerals */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <FaWeight className="text-purple-400 mr-2" />
              <h3 className="text-lg font-semibold">Minerals</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Calcium</span>
                <span className={getNutrientColor(calcium.quantity, 50)}>
                  {formatNumber(calcium.quantity)} {calcium.unit}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Iron</span>
                <span className={getNutrientColor(iron.quantity, 2)}>
                  {formatNumber(iron.quantity)} {iron.unit}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Potassium</span>
                <span className={getNutrientColor(potassium.quantity, 200)}>
                  {formatNumber(potassium.quantity)} {potassium.unit}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Sodium</span>
                <span className={getNutrientColor(sodium.quantity, 200, true)}>
                  {formatNumber(sodium.quantity)} {sodium.unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Serving Information */}
        <div className="bg-gray-700/30 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Serving Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400">Serving Size</div>
              <div className="font-medium">100g</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Calories</div>
              <div className="font-medium">{Math.round(calories)} cal</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Calories from Fat</div>
              <div className="font-medium">{Math.round(fat.quantity * 9)} cal</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {renderTabs()}

        {activeTab === "saved" ? (
          renderSavedFoods()
        ) : (
          <>
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-100 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {renderSearchInterface()}
            {selectedFood && renderFoodDetails()}

            {/* No Results */}
            {!loading && query && results.length === 0 && !selectedFood && (
              <div className="text-center py-12">
                <FaUtensils className="mx-auto text-5xl text-gray-600 mb-4" />
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-gray-400">
                  Try searching for a different food item
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NutritionSearch;
