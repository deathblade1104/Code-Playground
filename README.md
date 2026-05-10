# Machine Learning Projects Collection

A comprehensive collection of machine learning projects covering various domains including classification, regression, clustering, and prediction tasks. Each project demonstrates different ML techniques and algorithms with real-world datasets.

## 📁 Projects Overview

### 1. [Customer Churn Prediction](./Customer-Churn-Prediction/)
Predicts whether a telecom customer will churn using multiple classification algorithms.

**Algorithms Used:** KNN, SVM, Decision Tree, Random Forest, CatBoost
- **Dataset:** Telecom customer data with 20 features
- **Techniques:** Feature selection, class imbalance handling, PCA visualization
- **Best Model:** Random Forest (80% accuracy)

### 2. [Customer Segmentation](./Customer-Segmentation/)
Segments customers based on spending habits using unsupervised learning.

**Algorithms Used:** Hierarchical Clustering, K-Means Clustering
- **Dataset:** Customer demographics and spending data
- **Optimal Clusters:** 5 customer segments identified
- **Techniques:** Elbow method, dendrogram analysis, PCA for visualization

### 3. [Heart Disease Classification](./Heart-Disease-Classifier/)
Predicts the risk of coronary heart disease using logistic regression.

**Algorithms Used:** Logistic Regression with advanced feature engineering
- **Dataset:** Heart disease data with medical features
- **Techniques:** SMOTE-Tomek for class imbalance, sequential feature selection
- **Goal:** Predict 10-year CHD risk with medical and demographic factors

### 4. [House Price Prediction](./House_Price_Prediction/)
Predicts house prices using polynomial features and extensive feature engineering.

**Algorithms Used:** Ridge Regression with Polynomial Features
- **Dataset:** California housing data
- **Techniques:** Missing data handling, variable transformation, discretization, outlier detection
- **Performance:** 78% R² score on test set

### 5. [Fuel Consumption & CO2 Prediction](./fuelconsumption_CO2/)
Predicts CO2 emissions based on vehicle fuel consumption.

**Algorithms Used:** Linear Regression with feature selection
- **Dataset:** Fuel consumption and CO2 emission data
- **Techniques:** Categorical encoding, backward elimination
- **Goal:** Predict environmental impact based on fuel efficiency

### 6. [Tumor Classifier (SVM)](./Tumour_Classifier_SVM/)
Classifies tumors as malignant or benign using Support Vector Machines.

**Algorithms Used:** SVM with RBF kernel
- **Dataset:** Wisconsin Breast Cancer dataset
- **Techniques:** SMOTE for class imbalance, sequential feature selection
- **Performance:** 96.5% accuracy with ROC-AUC visualization

## 🛠️ Technologies & Libraries

- **Python 3.x**
- **Scikit-learn** - Machine learning algorithms
- **Pandas & NumPy** - Data manipulation and analysis
- **Matplotlib & Seaborn** - Data visualization
- **Imbalanced-learn** - Handling class imbalance (SMOTE, SMOTE-Tomek)
- **MLxtend** - Feature selection
- **CatBoost** - Gradient boosting for categorical features
- **Scikit-plot** - Model evaluation plots
- **Statsmodels** - Statistical modeling and testing

## 📊 Common Techniques Demonstrated

### Data Preprocessing
- Handling missing values (imputation, removal)
- Encoding categorical variables (one-hot encoding, dummy variables)
- Feature scaling and standardization

### Feature Engineering
- Variable transformation (log, square root, Yeo-Johnson, Box-Cox)
- Polynomial features for non-linear relationships
- Discretization of continuous variables
- Outlier detection and capping

### Feature Selection
- Backward elimination
- Sequential feature selection
- ROC-based feature importance
- Correlation analysis

### Handling Class Imbalance
- SMOTE (Synthetic Minority Oversampling Technique)
- SMOTE-Tomek (combination of oversampling and undersampling)
- Stratified sampling

### Model Evaluation
- Accuracy, Precision, Recall, F1-score
- Confusion matrices
- ROC-AUC curves
- R² score, MAE, MSE, RMSE

## 🚀 Getting Started

### Prerequisites
```bash
pip install numpy pandas matplotlib seaborn scikit-learn
pip install imbalanced-learn mlxtend catboost scikit-plot
```

### Running a Project
1. Navigate to the project folder
2. Ensure the dataset CSV file is in the same directory
3. Run the Python script:
   ```bash
   python <project_name>.py
   ```

### Project Structure
```
machine-learning/
├── Customer-Churn-Prediction/
│   ├── Churn.csv
│   ├── churn_final_soln.py
│   ├── Churn_final_soln.ipynb
│   └── README.md
├── Customer-Segmentation/
│   ├── Market.csv
│   ├── customer_segmentation.py
│   ├── Customer_Segmentation.ipynb
│   └── README.md
├── Heart-Disease-Classifier/
│   ├── Chd.csv
│   ├── heart_attack_classif.py
│   ├── HeartAttack_classif.ipynb
│   └── README.md
├── House_Price_Prediction/
│   ├── housing.csv
│   ├── housing_project.py
│   ├── Housing_Project.ipynb
│   └── README.md
├── fuelconsumption_CO2/
│   ├── FuelConsumptionCo2.csv
│   ├── FuelConsumptionproject.py
│   └── readme
├── Tumour_Classifier_SVM/
│   ├── cancer.csv
│   ├── tumor_classifier.py
│   ├── Tumor_classifier.ipynb
│   └── README.md
└── README.md
```

## 📈 Key Insights

1. **Classification Problems**: Demonstrate various classification algorithms and their applications in healthcare and business domains.
2. **Regression Problems**: Show advanced feature engineering techniques for continuous target prediction.
3. **Unsupervised Learning**: Illustrate clustering techniques for customer segmentation.
4. **Class Imbalance**: Multiple approaches to handle imbalanced datasets using SMOTE and its variants.
5. **Feature Engineering**: Extensive preprocessing and transformation techniques for better model performance.

## 🎯 Learning Outcomes

After exploring these projects, you will understand:
- How to preprocess and clean real-world datasets
- Feature engineering and selection techniques
- Multiple classification algorithms (KNN, SVM, Decision Tree, Random Forest, CatBoost)
- Clustering algorithms (Hierarchical, K-Means)
- Regression techniques (Linear, Ridge with Polynomial Features)
- Handling imbalanced datasets
- Model evaluation and interpretation
- Visualization techniques for model interpretation

## 📝 Notes

- Each project contains both Jupyter notebook (.ipynb) and Python script (.py) versions
- All datasets are included in their respective folders
- Projects include comprehensive documentation and explanations
- Code is well-commented for educational purposes

## 🤝 Contributing

Feel free to fork this repository and add your own improvements or projects!

## 📄 License

This project is open source and available for educational purposes.

---

**Happy Learning! 🎓**

