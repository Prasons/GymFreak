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
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

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
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
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

  const searchFood = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // In a real app, use your backend to make this API call to keep API keys secure
      const response = await axios.get(
        `https://api.edamam.com/api/nutrition-data?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY&ingr=${encodeURIComponent(
          searchQuery
        )}`
      );

      if (response.data && response.data.calories) {
        const foodData = {
          ...response.data,
          query: searchQuery,
          timestamp: new Date().toISOString(),
        };

        setSelectedFood(foodData);
        setResults((prev) => [foodData, ...prev]);

        // Update recent searches
        const newRecentSearches = [
          { query: searchQuery, timestamp: new Date().toISOString() },
          ...recentSearches
            .filter(
              (item) => item.query.toLowerCase() !== searchQuery.toLowerCase()
            )
            .slice(0, 4),
        ];
        setRecentSearches(newRecentSearches);
        localStorage.setItem(
          "recentNutritionSearches",
          JSON.stringify(newRecentSearches)
        );
      }
    } catch (error) {
      console.error("Error searching for food:", error);
      toast.error("Failed to fetch nutrition data. Please try again.");
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

  const handleRemoveSavedFood = (foodId) => {
    const updatedSavedFoods = savedFoods.filter((food) => food.id !== foodId);
    setSavedFoods(updatedSavedFoods);
    localStorage.setItem("savedFoods", JSON.stringify(updatedSavedFoods));
    toast.info("Food removed from your collection");
  };

  const isFoodSaved = (food) => {
    if (!food || !food.query) return false;
    return savedFoods.some(
      (item) => item.query?.toLowerCase() === food.query?.toLowerCase()
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchFood(query);
  };

  const handleRecentSearch = (searchQuery) => {
    setQuery(searchQuery);
    searchFood(searchQuery);
  };

  const formatNutrient = (value, unit = "g") => {
    return value ? `${Math.round(value * 10) / 10}${unit}` : "N/A";
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
              <button
                key={index}
                onClick={() => handleRecentSearch(item.query)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm transition-colors"
              >
                {item.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Render food details
  const renderFoodDetails = () => {
    if (!selectedFood) return null;

    const isSaved = isFoodSaved(selectedFood);

    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-8">
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
              {Math.round(selectedFood.calories)}{" "}
              <span className="text-sm font-normal text-gray-400">
                calories
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FaFire className="text-red-400 mr-2" />
              <h3 className="font-semibold">Macronutrients</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Protein</span>
                <span>
                  {formatNutrient(
                    selectedFood.totalNutrients?.PROCNT?.quantity
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Carbs</span>
                <span>
                  {formatNutrient(
                    selectedFood.totalNutrients?.CHOCDF?.quantity
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fats</span>
                <span>
                  {formatNutrient(selectedFood.totalNutrients?.FAT?.quantity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fiber</span>
                <span>
                  {formatNutrient(selectedFood.totalNutrients?.FIBTG?.quantity)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FaCarrot className="text-green-400 mr-2" />
              <h3 className="font-semibold">Vitamins</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Vitamin A</span>
                <span>
                  {formatNutrient(
                    selectedFood.totalNutrients?.VITA_RAE?.quantity,
                    "mcg"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Vitamin C</span>
                <span>
                  {formatNutrient(
                    selectedFood.totalNutrients?.VITC?.quantity,
                    "mg"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Vitamin D</span>
                <span>
                  {formatNutrient(
                    selectedFood.totalNutrients?.VITD?.quantity,
                    "mcg"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Vitamin E</span>
                <span>
                  {formatNutrient(
                    selectedFood.totalNutrients?.TOCPHA?.quantity,
                    "mg"
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FaWeight className="text-purple-400 mr-2" />
              <h3 className="font-semibold">Minerals</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Calcium</span>
                <span>
                  {formatNutrient(
                    selectedFood.totalNutrients?.CA?.quantity,
                    "mg"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Iron</span>
                <span>
                  {formatNutrient(
                    selectedFood.totalNutrients?.FE?.quantity,
                    "mg"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Potassium</span>
                <span>
                  {formatNutrient(
                    selectedFood.totalNutrients?.K?.quantity,
                    "mg"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sodium</span>
                <span>
                  {formatNutrient(
                    selectedFood.totalNutrients?.NA?.quantity,
                    "mg"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/30 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Serving Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400">Serving Size</div>
              <div className="font-medium">100g</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Calories from Fat</div>
              <div className="font-medium">
                {Math.round(
                  (selectedFood.totalNutrients?.FAT?.quantity || 0) * 9
                )}{" "}
                cal
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Sugars</div>
              <div className="font-medium">
                {formatNutrient(selectedFood.totalNutrients?.SUGAR?.quantity)}
              </div>
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
            {renderSearchInterface()}
            {selectedFood && renderFoodDetails()}

            {/* No Results */}
            {!loading && query && results.length === 0 && (
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
