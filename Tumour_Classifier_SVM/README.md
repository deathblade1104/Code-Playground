# Tumor Classifier using SVM

A machine learning project that classifies tumors as malignant or benign using Support Vector Machines with the RBF kernel.

## 🎯 Problem Statement

Predict whether a tumor is malignant (cancerous) or benign (non-cancerous) based on cell characteristics. Early and accurate classification is crucial for cancer diagnosis and treatment planning.

## 📊 Dataset

**File:** `cancer.csv`

**Dataset:** Wisconsin Breast Cancer Dataset

**Features:** 30 numerical features including:
- Mean values: radius, texture, perimeter, area, smoothness, compactness, concavity, etc.
- Standard errors of each feature
- Worst (largest) values of each feature

**Target Variable:** diagnosis (M=Malignant, B=Benign)

**Dataset Size:** 569 samples (212 Malignant, 357 Benign)

## 🔧 Approach

### Algorithm
- **Support Vector Machine (SVM)** with RBF kernel
- Trained probability estimates enabled for ROC curve

### Key Techniques
1. **Categorical Encoding**: Convert M/B labels to 1/0
2. **Class Imbalance Handling**: SMOTE for oversampling minority class
3. **Feature Selection**: Sequential Feature Selection (backward elimination) - 19 optimal features
4. **Feature Scaling**: StandardScaler for normalization
5. **Train-Test Split**: 70-30 split

## 📈 Results

- **Train Accuracy:** 98.39%
- **Test Accuracy:** 96.49%
- **Precision:** 0.97 (Benign), 0.95 (Malignant)
- **Recall:** 0.97 (Benign), 0.95 (Malignant)
- **F1-Score:** 0.97 (Benign), 0.95 (Malignant)

## 🚀 Usage

```bash
python tumor_classifier.py
```

### Prerequisites
```bash
pip install numpy pandas matplotlib seaborn scikit-learn imbalanced-learn mlxtend scikit-plot
```

## 📁 Files

- `cancer.csv` - Wisconsin Breast Cancer Dataset
- `tumor_classifier.py` - Implementation with comprehensive comments
- `Tumor_classifier.ipynb` - Jupyter notebook version
- `README.md` - This file

## 🔍 Key Insights

1. Excellent model performance with 96.5% accuracy
2. SVM with RBF kernel captures non-linear relationships well
3. Feature selection (19/30 features) improved model generalization
4. SMOTE effectively balanced the imbalanced dataset
5. High precision and recall for both classes indicate reliable predictions

## 💡 Healthcare Applications

- Early detection of breast cancer
- Clinical decision support for radiologists
- Automated screening systems
- Patient risk assessment
- Treatment planning guidance

## 🛠️ Technologies Used

- **Python**
- **NumPy, Pandas** - Data manipulation
- **Matplotlib, Seaborn** - Visualization
- **Scikit-learn** - SVM classification
- **Imbalanced-learn** - SMOTE for class imbalance
- **MLxtend** - Sequential feature selection
- **Scikit-plot** - ROC-AUC curve visualization

## ⚠️ Important Note

This model is for educational purposes. For actual medical diagnosis, consult healthcare professionals and use clinically validated diagnostic tools.

