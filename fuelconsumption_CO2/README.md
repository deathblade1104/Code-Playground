# Fuel Consumption & CO2 Emission Prediction

A regression machine learning project that predicts CO2 emissions from vehicles based on their fuel consumption characteristics.

## 🎯 Problem Statement

Predict the CO2 emissions of vehicles based on various fuel consumption metrics and vehicle characteristics. This is valuable for environmental impact assessment and fuel efficiency analysis.

## 📊 Dataset

**Dataset:** `FuelConsumptionCo2.csv`
- **Features:** Engine size, Cylinders, Fuel consumption (City/HWY/Combined), Fuel type
- **Target Variable:** CO2 Emissions
- **Samples:** 1,067 vehicles

## 🔧 Approach

### 1. Data Preprocessing
- Removed irrelevant columns (Vehicle class, Transmission, Model Year, Make, Model)
- One-hot encoding for categorical variables (Fuel type)
- Avoided dummy variable trap

### 2. Feature Engineering
- Used backward elimination for feature selection
- All retained features showed statistical significance (p-value < 0.05)

### 3. Model Building
- **Algorithm:** Linear Regression
- **Train-Test Split:** 80-20
- **Random State:** 0 (for reproducibility)

## 📈 Results

The model achieves good performance in predicting CO2 emissions:

- **R² Score:** Available in the output
- **Mean Absolute Error (MAE)**
- **Mean Squared Error (MSE)**
- **Root Mean Squared Error (RMSE)**

## 🚀 Usage

```bash
python FuelConsumptionproject.py
```

### Prerequisites
```bash
pip install numpy pandas matplotlib scikit-learn statsmodels
```

## 📁 Files

- `FuelConsumptionCo2.csv` - Dataset
- `FuelConsumptionproject.py` - Implementation with comprehensive comments
- `README.md` - This file

## 🔍 Key Insights

1. Fuel consumption variables (city, highway, combined) are strong predictors
2. Engine size and number of cylinders significantly impact CO2 emissions
3. Linear regression provides interpretable results for this continuous prediction task
4. Proper feature selection through backward elimination improves model reliability

## 🛠️ Technologies Used

- **Python**
- **NumPy** - Numerical operations
- **Pandas** - Data manipulation
- **Scikit-learn** - Machine learning algorithms
- **Statsmodels** - Statistical modeling and testing
- **Matplotlib** - Visualization

## 💡 Learning Outcomes

- Understanding regression problems in environmental context
- Feature selection using backward elimination
- Handling categorical variables with dummy encoding
- Model evaluation using multiple metrics (MAE, MSE, RMSE)
- Statistical significance testing using p-values

## 📝 Notes

This project demonstrates the application of linear regression for environmental prediction tasks, making it suitable for understanding the relationship between vehicle specifications and their environmental impact.

