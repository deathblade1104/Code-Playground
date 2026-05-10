# Customer Churn Prediction

A machine learning project that predicts whether a customer will churn from a telecom company using multiple classification algorithms.

## 🎯 Problem Statement

Customer churn is a critical business problem in the telecom industry. Predicting which customers are likely to churn helps companies take proactive measures to retain them, reducing customer acquisition costs.

## 📊 Dataset

**File:** `Churn.csv`

**Features:**
- Demographics: gender, SeniorCitizen
- Services: PhoneService, MultipleLines, InternetService, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies
- Account info: Contract, PaperlessBilling, PaymentMethod
- Charges: MonthlyCharges, TotalCharges, tenure

**Target Variable:** Churn (Yes/No)

## 🔧 Approach

### Algorithms Implemented
1. **K-Nearest Neighbors (KNN)** - n_neighbors=21
2. **Support Vector Machine (SVM)** - RBF kernel
3. **Decision Tree** - max_depth=4
4. **Random Forest** - 25 estimators, max_depth=6
5. **CatBoost** - Optimized for categorical features

### Key Techniques
- Feature selection using ROC-based importance
- StandardScaler for feature scaling
- Stratified train-test split (80-20)
- PCA for dimensionality reduction and visualization
- Handling class imbalance (5163 No vs 1869 Yes)

## 📈 Results

| Model | Train Accuracy | Test Accuracy |
|-------|---------------|---------------|
| KNN | 80.50% | 78.75% |
| SVM | 79.40% | 78.39% |
| Decision Tree | 79.54% | 78.61% |
| Random Forest | 80.43% | 80.03% |
| CatBoost | 82.00% | 81.00% |

**Best Model:** CatBoost (82% train, 81% test accuracy)

## 🚀 Usage

```bash
python churn_final_soln.py
```

### Prerequisites
```bash
pip install numpy pandas matplotlib seaborn scikit-learn catboost
```

## 📁 Files

- `Churn.csv` - Dataset
- `churn_final_soln.py` - Implementation with comprehensive comments
- `Churn_final_soln.ipynb` - Jupyter notebook version
- `README.md` - This file

## 🔍 Key Insights

1. High class imbalance exists in the dataset
2. Customers with Phone Service show higher churn rates
3. Month-to-Month contracts are associated with higher churn
4. Electronic Check payment method shows higher churn
5. Younger citizens are more likely to churn than seniors
6. Customers with Fibre Optics internet have higher churn
7. Lower tenure customers are more likely to churn
8. Monthly charges between 60-100 show higher churn rates

## 💡 Business Applications

- Identify at-risk customers for proactive retention campaigns
- Optimize pricing strategies based on churn patterns
- Develop targeted customer retention programs
- Reduce customer acquisition costs by improving retention

## 🛠️ Technologies Used

- **Python**
- **NumPy, Pandas** - Data manipulation
- **Matplotlib, Seaborn** - Visualization
- **Scikit-learn** - Machine learning algorithms
- **CatBoost** - Gradient boosting for categorical data
- **PCA** - Dimensionality reduction
