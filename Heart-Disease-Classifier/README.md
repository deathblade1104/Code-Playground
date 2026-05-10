# Heart Disease Classification

A machine learning project that predicts the risk of coronary heart disease (CHD) using logistic regression with advanced feature engineering.

## 🎯 Problem Statement

Predict the 10-year risk of coronary heart disease (CHD) based on demographic, medical, and lifestyle factors. This is a binary classification problem critical for preventive healthcare.

## 📊 Dataset

**File:** `Chd.csv`

**Features:**
- Demographics: male, age, education
- Health: totChol (total cholesterol), sysBP (systolic BP), diaBP (diastolic BP), BMI
- Lifestyle: currentSmoker, cigsPerDay
- Medical: BPMeds, prevalentStroke, prevalentHyp, diabetes, heartRate, glucose

**Target Variable:** TenYearCHD (0=No CHD, 1=CHD within 10 years)

**Key Characteristics:**
- Total samples: 4,238 (3,241 no CHD, 644 with CHD)
- Class imbalance: ~15% positive class
- Missing values in: education, cigsPerDay, BPMeds, totChol, BMI, heartRate, glucose

## 🔧 Approach

### Algorithm
- **Logistic Regression** with L2 regularization (C=0.001)

### Key Techniques
1. **Missing Value Handling**: Drop education column, remove rows with missing values
2. **Class Imbalance**: SMOTE-Tomek (combination of oversampling and undersampling)
3. **Feature Selection**: Sequential Feature Selection (backward elimination) - 8 optimal features
4. **Feature Engineering**:
   - Polynomial features (degree=1)
   - StandardScaler for feature scaling
5. **Train-Test Split**: 75-25 split with stratification

## 📈 Results

- **Train Accuracy:** 67.77%
- **Test Accuracy:** 61.19%
- **Selected Features:** male, age, currentSmoker, cigsPerDay, BPMeds, prevalentStroke, prevalentHyp, diabetes

## 🚀 Usage

```bash
python heart_attack_classif.py
```

### Prerequisites
```bash
pip install numpy pandas matplotlib seaborn scikit-learn imbalanced-learn mlxtend
```

## 📁 Files

- `Chd.csv` - Dataset
- `heart_attack_classif.py` - Implementation with comprehensive comments
- `HeartAttack_classif.ipynb` - Jupyter notebook version
- `README.md` - This file

## 🔍 Key Insights

1. Age, cholesterol, blood pressure are strong predictors
2. Lifestyle factors (smoking) significantly impact CHD risk
3. Medical history (hypertension, diabetes) are important features
4. Class imbalance handled effectively with SMOTE-Tomek
5. Feature selection helped improve model performance

## 💡 Healthcare Applications

- Preventive screening for high-risk individuals
- Clinical decision support systems
- Population health management
- Personalized risk assessment
- Early intervention planning

## 🛠️ Technologies Used

- **Python**
- **NumPy, Pandas** - Data manipulation
- **Matplotlib, Seaborn** - Visualization
- **Scikit-learn** - Machine learning
- **Imbalanced-learn** - SMOTE-Tomek for class imbalance
- **MLxtend** - Sequential feature selection

## ⚠️ Note

This model is for educational purposes. For actual medical diagnosis, consult healthcare professionals.