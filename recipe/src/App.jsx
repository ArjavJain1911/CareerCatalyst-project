import React, { useState } from 'react';

const ingredientsData = [
  { "id": 1, "ingredient": "Chicken Breast", "icon": "🍗" },
  { "id": 2, "ingredient": "Tomato", "icon": "🍅" },
  { "id": 3, "ingredient": "Spinach", "icon": "🍃" },
  { "id": 4, "ingredient": "Pasta", "icon": "🍝" },
  { "id": 5, "ingredient": "Salmon", "icon": "🐟" },
  { "id": 6, "ingredient": "Garlic", "icon": "🧄" },
  { "id": 7, "ingredient": "Mushrooms", "icon": "🍄" },
  { "id": 8, "ingredient": "Cheese", "icon": "🧀" },
  { "id": 9, "ingredient": "Onion", "icon": "🧅" },
  { "id": 10, "ingredient": "Potato", "icon": "🥔" },
  { "id": 11, "ingredient": "Egg", "icon": "🥚" },
  { "id": 12, "ingredient": "Broccoli", "icon": "🥦" },
  { "id": 13, "ingredient": "Avocado", "icon": "🥑" },
  { "id": 14, "ingredient": "Beef", "icon": "🥩" },
  { "id": 15, "ingredient": "Shrimp", "icon": "🍤" },
  { "id": 16, "ingredient": "Rice", "icon": "🍚" },
  { "id": 17, "ingredient": "Carrot", "icon": "🥕" },
  { "id": 18, "ingredient": "Bell Pepper", "icon": "🫑" },
  { "id": 19, "ingredient": "Tofu", "icon": "🧊" },
  { "id": 20, "ingredient": "Lemon", "icon": "🍋" }
];

const App = () => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [view, setView] = useState('dashboard'); // 'dashboard', 'input', 'result', 'fridge', 'cookbook'
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fridgeItems, setFridgeItems] = useState([]);
  const [newFridgeItemName, setNewFridgeItemName] = useState('');
  const [newFridgeItemExpiry, setNewFridgeItemExpiry] = useState('');
  const [cookbookRecipes, setCookbookRecipes] = useState([]);

  const fetchFridgeItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/fridge');
      const data = await response.json();
      setFridgeItems(data);
    } catch (err) {
      console.error('Failed to fetch fridge items', err);
    }
  };

  const fetchCookbookRecipes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recipes');
      const data = await response.json();
      setCookbookRecipes(data);
    } catch (err) {
      console.error('Failed to fetch recipes', err);
    }
  };

  React.useEffect(() => {
    fetchFridgeItems();
    fetchCookbookRecipes();
  }, []);

  const addFridgeItem = async (e) => {
    e.preventDefault();
    if (!newFridgeItemName || !newFridgeItemExpiry) return;
    try {
      const response = await fetch('http://localhost:5000/api/fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFridgeItemName, expiryDate: newFridgeItemExpiry })
      });
      if (response.ok) {
        setNewFridgeItemName('');
        setNewFridgeItemExpiry('');
        fetchFridgeItems();
      }
    } catch (err) {
      console.error('Failed to add fridge item', err);
    }
  };

  const deleteFridgeItem = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/fridge/${id}`, { method: 'DELETE' });
      fetchFridgeItems();
    } catch (err) {
      console.error('Failed to delete fridge item', err);
    }
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expiryDate);
    expDate.setHours(0, 0, 0, 0);
    
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Expired', color: '#ff4d4f' }; // Red
    if (diffDays <= 2) return { label: 'Expiring Soon', color: '#faad14' }; // Yellow/Orange
    return { label: 'Fresh', color: '#52c41a' }; // Green
  };

  const getExpiringSoonItems = () => {
    return fridgeItems.filter(item => {
      const status = getExpiryStatus(item.expiryDate);
      return status.label === 'Expiring Soon' || status.label === 'Expired';
    });
  };

  // Toggle ingredient selection
  const handleToggle = (name) => {
    setSelectedIngredients(prev =>
      prev.includes(name)
        ? prev.filter(i => i !== name)
        : [...prev, name]
    );
  };

  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) {
      alert("Please select at least one ingredient!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ingredients: selectedIngredients })
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const data = await response.json();
      setGeneratedRecipe(data);
      setView('result');
    } catch (err) {
      console.error(err);
      alert('Error generating recipe from backend. Make sure the backend server is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecipe = async () => {
    if (!generatedRecipe) return;
    try {
      const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(generatedRecipe)
      });
      if (response.ok) {
        alert('Recipe saved to database!');
        fetchCookbookRecipes();
      } else {
        alert('Failed to save recipe');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save recipe');
    }
  };

  return (
    <>
      <nav className="glass-nav">
        <div className="nav-content">
          <div className="nav-logo">
            <span className="logo-text">RecipeBox<span>AI</span></span>
          </div>
          <ul className="nav-links">
            <li><button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'nav-btn active' : 'nav-btn'}>Dashboard</button></li>
            <li><button onClick={() => setView('input')} className={view === 'input' ? 'nav-btn active' : 'nav-btn'}>Kitchen</button></li>
            <li><button onClick={() => setView('cookbook')} className={view === 'cookbook' ? 'nav-btn active' : 'nav-btn'}>Cookbook</button></li>
            <li><button onClick={() => setView('fridge')} className={view === 'fridge' ? 'nav-btn active' : 'nav-btn'}>My Fridge</button></li>
          </ul>
        </div>
      </nav>

      <div className="blob-bg"></div>

      <main className="glass-container">
        {view === 'dashboard' ? (
          <section id="page-dashboard">
            <header>
              <span className="badge">Overview</span>
              <h1>Welcome to <span>RecipeBox</span></h1>
              <p style={{opacity: 0.8, marginTop: '10px'}}>Your kitchen overview.</p>
            </header>
            
            <div className="dashboard-grid" style={{display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr', marginBottom: '30px'}}>
              <div className="stat-card" style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', textAlign: 'center'}}>
                <h3 style={{fontSize: '2.5rem', margin: '0 0 10px 0', textShadow: '0 2px 10px rgba(0,0,0,0.2)'}}>{fridgeItems.length}</h3>
                <p style={{margin: 0, opacity: 0.9, fontWeight: '500'}}>Items in Fridge</p>
              </div>
              <div className="stat-card" style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', textAlign: 'center'}}>
                <h3 style={{fontSize: '2.5rem', margin: '0 0 10px 0', textShadow: '0 2px 10px rgba(0,0,0,0.2)'}}>{cookbookRecipes.length}</h3>
                <p style={{margin: 0, opacity: 0.9, fontWeight: '500'}}>Saved Recipes</p>
              </div>
            </div>

            <div style={{display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr'}}>
              <div className="dashboard-section" style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px'}}>
                <h3 style={{marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px'}}>⚠️ Expiring Soon</h3>
                {getExpiringSoonItems().length > 0 ? (
                  <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                    {getExpiringSoonItems().slice(0, 3).map(item => {
                      const status = getExpiryStatus(item.expiryDate);
                      return (
                        <li key={item._id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px'}}>
                          <span>{item.name}</span>
                          <span style={{color: status.color, fontWeight: 'bold'}}>{status.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p style={{opacity: 0.7, fontSize: '0.9rem'}}>Everything is fresh!</p>
                )}
                <button onClick={() => setView('fridge')} style={{marginTop: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', width: '100%', transition: 'background 0.3s'}}>Manage Fridge</button>
              </div>

              <div className="dashboard-section" style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px'}}>
                <h3 style={{marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px'}}>📖 Recent Recipe</h3>
                {cookbookRecipes.length > 0 ? (
                  <div style={{background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px'}}>
                    <h4 style={{margin: '0 0 5px 0', fontSize: '1.1rem'}}>{cookbookRecipes[0].title}</h4>
                    <p style={{fontSize: '0.8rem', opacity: 0.8, margin: 0}}>⏱ {cookbookRecipes[0].prepTime}</p>
                  </div>
                ) : (
                  <p style={{opacity: 0.7, fontSize: '0.9rem'}}>No recipes yet.</p>
                )}
                <button onClick={() => setView('cookbook')} style={{marginTop: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', width: '100%', transition: 'background 0.3s'}}>View Cookbook</button>
              </div>
            </div>

            <div style={{marginTop: '40px', textAlign: 'center'}}>
              <button className="generate-btn" onClick={() => setView('input')} style={{padding: '15px 40px', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(255,107,107,0.4)'}}>
                Start Cooking ✨
              </button>
            </div>
          </section>
        ) : view === 'cookbook' ? (
          <section id="page-cookbook">
            <header>
              <span className="badge">Saved Recipes</span>
              <h1>My <span>Cookbook</span></h1>
              <p style={{opacity: 0.8, marginTop: '10px'}}>View your saved recipes.</p>
            </header>
            <div className="recipe-grid" style={{display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr'}}>
              {cookbookRecipes.map(recipe => (
                <div key={recipe._id} className="recipe-card" style={{margin: 0}}>
                  <div className="recipe-header">
                    <h2 style={{fontSize: '1.2rem'}}>{recipe.title}</h2>
                    <div className="meta" style={{fontSize: '0.8rem'}}>
                      <span>⏱ {recipe.prepTime}</span>
                    </div>
                  </div>
                  <hr />
                  <div className="recipe-body">
                    <h3 style={{fontSize: '1rem', marginBottom: '5px'}}>Instructions</h3>
                    <p style={{fontSize: '0.9rem', whiteSpace: 'pre-line'}}>{recipe.instructions}</p>
                  </div>
                </div>
              ))}
              {cookbookRecipes.length === 0 && <p>Your cookbook is empty. Generate and save some recipes!</p>}
            </div>
          </section>
        ) : view === 'fridge' ? (
          <section id="page-fridge">
            <header>
              <span className="badge">Inventory Manager</span>
              <h1>My <span>Fridge</span></h1>
              <p style={{opacity: 0.8, marginTop: '10px'}}>Manage your ingredients.</p>
            </header>
            
            <form onSubmit={addFridgeItem} style={{display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end'}}>
              <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <label style={{marginBottom: '5px', fontSize: '0.9rem', opacity: 0.8}}>Items</label>
                <input 
                  type="text" 
                  placeholder="Item Name (e.g. Milk)" 
                  value={newFridgeItemName} 
                  onChange={e => setNewFridgeItemName(e.target.value)} 
                  style={{padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.9)', color: '#333'}}
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <label style={{marginBottom: '5px', fontSize: '0.9rem', opacity: 0.8}}>Date of Items Kept</label>
                <input 
                  type="date" 
                  value={newFridgeItemExpiry} 
                  onChange={e => setNewFridgeItemExpiry(e.target.value)}
                  style={{padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.9)', color: '#333'}}
                />
              </div>
              <button type="submit" className="generate-btn" style={{margin: 0, padding: '10px 20px', width: 'auto'}}>Add</button>
            </form>

            <div className="fridge-list" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {fridgeItems.map(item => {
                const status = getExpiryStatus(item.expiryDate);
                return (
                  <div key={item._id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px'}}>
                    <div>
                      <h3 style={{margin: '0 0 5px 0', fontSize: '1.2rem'}}>{item.name}</h3>
                      <span style={{fontSize: '0.9rem', color: status.color, fontWeight: 'bold'}}>
                        {status.label} (Expires: {new Date(item.expiryDate).toLocaleDateString()})
                      </span>
                    </div>
                    <button onClick={() => deleteFridgeItem(item._id)} style={{background: 'transparent', border: `1px solid ${status.color}`, color: status.color, padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s'}}>
                      Use / Delete
                    </button>
                  </div>
                );
              })}
              {fridgeItems.length === 0 && <p style={{textAlign: 'center', opacity: 0.7}}>Your fridge is empty! Start adding items.</p>}
            </div>
          </section>
        ) : view === 'input' ? (
          <section id="page-input">
            <header>
              <span className="badge">AI Recipe Engine</span>
              <h1>What's in your <span>kitchen?</span></h1>
              <p style={{opacity: 0.8, marginTop: '10px'}}>Select ingredients to generate a recipe.</p>
              <p style={{opacity: 0.8}}>Selected: {selectedIngredients.length} ingredients</p>
            </header>

            <div className="ingredient-grid">
              {ingredientsData.map(item => (
                <label key={item.id} className="chip">
                  <input
                    type="checkbox"
                    checked={selectedIngredients.includes(item.ingredient)}
                    onChange={() => handleToggle(item.ingredient)}
                  />
                  <span>{item.icon} {item.ingredient}</span>
                </label>
              ))}
            </div>

            <button className="generate-btn" onClick={generateRecipe} disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Magic ✨"}
            </button>
          </section>
        ) : (
          <section id="page-result">
            <button className="back-btn" onClick={() => setView('input')}>← Back to Pantry</button>
            {generatedRecipe && (
              <div className="recipe-card">
                <div className="recipe-header">
                  <h2>{generatedRecipe.title}</h2>
                  <div className="meta">
                    <span>⏱ {generatedRecipe.prepTime}</span>
                    <span>🔥 Healthy Choice</span>
                  </div>
                </div>
                <hr />
                <div className="recipe-body">
                  <h3>Instructions</h3>
                  <p style={{whiteSpace: 'pre-line', lineHeight: '1.6'}}>{generatedRecipe.instructions}</p>
                </div>
                <button className="generate-btn" onClick={saveRecipe} style={{ marginTop: '20px' }}>
                  Save to Database 💾
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
};

export default App;