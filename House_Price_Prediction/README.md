# House Price Prediction

A machine learning project that predicts house prices using Ridge Regression with extensive feature engineering and polynomial features.

## 🎯 Problem Statement

Predict the median house value in California districts based on various factors such as location, demographics, and housing characteristics. This is a regression problem with extensive feature engineering to improve model performance.

## 📊 Dataset

**File:** `housing.csv`

**Features:**

- Geographic: longitude, latitude
- Demographics: population, households, median_income
- Housing: housing_median_age, total_rooms, total_bedrooms
- Location: ocean_proximity (categorical)

**Target Variable:** median_house_value

## 🔧 Approach

### Algorithm

- **Ridge Regression** with polynomial features (degree=6)
- L2 regularization with alpha=0.001

### Key Feature Engineering Techniques

1. **Missing Data Handling**
   - Total bedrooms: imputed with mean value
   - Diagnostic plots for comparing imputation methods

2. **Categorical Data Processing**
   - One-hot encoding for ocean_proximity
   - Avoided dummy variable trap

3. **Numerical Variable Transformation**
   - Tested multiple transformations (log, reciprocal, square root, exponential, Box-Cox, Yeo-Johnson)
   - Applied Yeo-Johnson transformation to all numerical variables
   - Target variable also transformed for better distribution

4. **Variable Discretization**
   - Latitude and longitude discretized using Decision Tree Regression
   - Optimized tree depth using cross-validation (max_depth=4)
   - Created latitude_tree and longitude_tree features

5. **Outlier Detection and Handling**
   - Used 5th and 95th percentiles as boundaries
   - Capped outliers for: total_rooms, total_bedrooms, population, households, median_income, latitude_tree, longitude_tree

6. **Polynomial Features**
   - Created polynomial features (degree=6) to capture non-linear relationships
   - Combined with StandardScaler for normalization

## 📈 Results

**Performance Metrics:**

- **Train Set R² Score:** 80.25%
- **Test Set R² Score:** 78.04%
- **Mean Absolute Error:** 0.92
- **Mean Squared Error:** 1.60
- **Root Mean Squared Error:** 1.26

## 📊 Visualizations

The project includes several visualization files:

- `Heatmap_old.png` - Correlation before feature engineering
- `Heatmap_new.png` - Correlation after feature engineering
- `scores_old.png` - Model scores before feature engineering
- `scores_new.png` - Model scores after feature engineering
- `Distribution curve.png` - Distribution curves
- `variable distribution.png` - Variable distributions

## 🚀 Usage

```bash
python housing_project.py
```

### Prerequisites

```bash
pip install numpy pandas matplotlib seaborn scikit-learn scipy statsmodels
```

## 📁 Files

- `housing.csv` - Dataset (California housing data)
- `housing_project.py` - Implementation with comprehensive comments
- `README.md` - This file
- `Heatmap_old.png` - Correlation heatmap before feature engineering
- `Heatmap_new.png` - Correlation heatmap after feature engineering
- `scores_old.png` - Model evaluation metrics before feature engineering
- `scores_new.png` - Model evaluation metrics after feature engineering
- `Distribution curve.png` - Distribution analysis
- `variable distribution.png` - Variable distribution visualization

## 🔍 Key Insights

1. **Feature Engineering Impact:** The extensive feature engineering significantly improved model performance from baseline to ~78% R² score
2. **Transformation Importance:** Yeo-Johnson transformation helped normalize skewed distributions
3. **Discretization:** Discretizing geographical coordinates improved model interpretability
4. **Outlier Handling:** Capping outliers at 5th and 95th percentiles improved model stability
5. **Polynomial Features:** 6th-degree polynomial features captured complex non-linear relationships
6. **Geographic Impact:** Location features (latitude, longitude) are crucial for house price prediction
7. **Income Effect:** Median income is strongly correlated with house values
8. **Room Ratios:** Total rooms, bedrooms, and their ratios affect pricing

## 💡 Real Estate Applications

- Property valuation and appraisal
- Real estate investment decisions
- Market analysis and forecasting
- Location-based pricing strategies
- Urban planning and development
- Mortgage and loan assessment

## 🛠️ Technologies Used

- **Python**
- **NumPy, Pandas** - Data manipulation
- **Matplotlib, Seaborn** - Visualization
- **Scikit-learn** - Ridge regression, feature transformations, scaling
- **SciPy** - Statistical transformations (Yeo-Johnson, Box-Cox)
- **Statsmodels** - Statistical modeling and OLS regression
- **Decision Tree** - For discretization approach

## 📈 Impact of Feature Engineering

The project demonstrates the significant impact of feature engineering:

- **Before:** Basic linear features with limited predictive power
- **After:** 78% R² score with transformed and engineered features
- Visual comparisons show improved correlation patterns
- Model scores demonstrate substantial improvement
