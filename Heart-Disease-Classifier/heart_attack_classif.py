"""
Heart Disease Classification
============================
A machine learning project that predicts the risk of coronary heart disease (CHD)
using logistic regression with advanced feature engineering and imbalanced class handling.

Dataset: Chd.csv - Heart disease data with medical and demographic features
Techniques Used:
- SMOTE-Tomek for handling class imbalance
- Sequential Feature Selection for optimal feature selection
- Standard Scaling and Polynomial Features
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from imblearn.combine import SMOTETomek
from mlxtend.feature_selection import SequentialFeatureSelector as SFS

# =============================================================================
# DATA LOADING AND EXPLORATION
# =============================================================================

print("Loading dataset...")
# Import dataset
dataset = pd.read_csv('Chd.csv')

print("\nDataset Statistics:")
print(dataset.describe())

print("\nData Types:")
print(dataset.dtypes)

print("\nMissing Values Ratio:")
print(dataset.isnull().mean())

# =============================================================================
# DATA PREPROCESSING
# =============================================================================

print("\n\n========== DATA PREPROCESSING ==========")

# Drop education column (high missing values)
print("\nDropping 'education' column due to high missing values...")
dataset = dataset.drop(['education'], axis=1, inplace=False)

# Remove rows with missing values
dataset = dataset.dropna(axis=0, inplace=False)

# Create correlation heatmap
print("\nGenerating correlation heatmap...")
corr = dataset.corr()
ax = sns.heatmap(corr, vmin=-1, vmax=1, cmap="coolwarm",
                 xticklabels=dataset.columns, yticklabels=dataset.columns)
plt.title('Correlation Heatmap')
plt.show()

# Check target variable distribution
print("\nTarget Variable Distribution:")
print(dataset.TenYearCHD.value_counts())

# =============================================================================
# TRAIN-TEST SPLIT
# =============================================================================

print("\n\n========== SPLITTING DATA ==========")
print("Splitting data into train and test sets (75-25 split)...")

x_train, x_test, y_train, y_test = train_test_split(
    dataset.iloc[:, :-1],
    dataset.iloc[:, -1:],
    test_size=0.25,
    random_state=5
)

print(f"Training set size: {x_train.shape[0]}")
print(f"Test set size: {x_test.shape[0]}")

# =============================================================================
# HANDLING CLASS IMBALANCE WITH SMOTE-TOMEK
# =============================================================================

print("\n\n========== HANDLING CLASS IMBALANCE ==========")
print("Applying SMOTE-Tomek to balance the dataset...")

# Resample the minority class using SMOTE-Tomek
# SMOTE-Tomek is a combination of oversampling (SMOTE) and undersampling (Tomek)
sm = SMOTETomek(ratio="auto", random_state=5)

# Fit and transform the training data
ovx_tr, ovy_tr = sm.fit_sample(x_train, y_train)

print(f"Original training set size: {x_train.shape[0]}")
print(f"After SMOTE-Tomek size: {ovx_tr.shape[0]}")
print(f"Original minority class ratio: {y_train.iloc[:, 0].sum() / len(y_train):.4f}")
print(f"After SMOTE-Tomek minority class ratio: {np.sum(ovy_tr) / len(ovy_tr):.4f}")

# =============================================================================
# FEATURE SELECTION
# =============================================================================

print("\n\n========== FEATURE SELECTION ==========")
print("Using Sequential Feature Selection to find optimal features...")

# Use Logistic Regression for feature selection
reg = LogisticRegression(n_jobs=8, max_iter=1000)

# Backward elimination to select 8 most important features
sfs1 = SFS(reg,
           k_features=8,
           forward=False,  # Backward elimination
           floating=False,
           verbose=2,
           scoring='f1',
           cv=5)

sfs1 = sfs1.fit(np.array(ovx_tr), ovy_tr)

print(f"\nSelected feature indices: {sfs1.k_feature_idx_}")
selected_feat = list(sfs1.k_feature_idx_)
print(f"Selected features: {selected_feat}")

# =============================================================================
# PREPARE SELECTED FEATURES
# =============================================================================

print("\n\n========== PREPARING DATA WITH SELECTED FEATURES ==========")

# Select only the important features
sel_train = ovx_tr[:, selected_feat]
x_test_arr = np.array(x_test)
sel_test = x_test_arr[:, selected_feat]

y_train = ovy_tr

print(f"Selected features shape - Train: {sel_train.shape}, Test: {sel_test.shape}")

# =============================================================================
# FEATURE ENGINEERING - POLYNOMIAL FEATURES
# =============================================================================

print("\n\n========== FEATURE ENGINEERING ==========")
print("Creating polynomial features (degree=1) for interaction terms...")

# Create polynomial features
pr = PolynomialFeatures(degree=1)
X_train = pr.fit_transform(sel_train)
X_test = pr.fit_transform(sel_test)

print(f"Feature shape after polynomial - Train: {X_train.shape}, Test: {X_test.shape}")

# =============================================================================
# FEATURE SCALING
# =============================================================================

print("\n\n========== FEATURE SCALING ==========")
print("Standardizing features...")

# Standardize features
sc_x = StandardScaler()
X_train = sc_x.fit_transform(X_train)
X_test = sc_x.fit_transform(X_test)

print("Features standardized successfully.")

# =============================================================================
# MODEL TRAINING
# =============================================================================

print("\n\n========== MODEL TRAINING ==========")
print("Training Logistic Regression model...")

# Create and train Logistic Regression model
reg = LogisticRegression(C=0.001, penalty='l2', max_iter=4000)
reg.fit(X_train, y_train)

# Make predictions
y_pred = reg.predict(X_test)
y_trpr = reg.predict(X_train)

# =============================================================================
# MODEL EVALUATION
# =============================================================================

print("\n\n========== MODEL EVALUATION ==========")

# Calculate accuracy scores
train_accuracy = accuracy_score(y_train, y_trpr)
test_accuracy = accuracy_score(y_test, y_pred)

print(f"Train Set Accuracy: {train_accuracy:.4f}")
print(f"Test Set Accuracy: {test_accuracy:.4f}")

# Detailed classification report for train set
print("\n_________________TRAIN SET_______________")
cm = confusion_matrix(y_train, y_trpr)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0', 'Predicted:1'],
                          index=['Actual:0', 'Actual:1'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
plt.title('Training Set Confusion Matrix')
plt.show()
print(classification_report(y_train, y_trpr))

# Detailed classification report for test set
print("\n_________________TEST SET__________________")
cm = confusion_matrix(y_test, y_pred)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0', 'Predicted:1'],
                          index=['Actual:0', 'Actual:1'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
plt.title('Test Set Confusion Matrix')
plt.show()
print(classification_report(y_test, y_pred))

print("\n\n==================== END OF ANALYSIS ====================")

